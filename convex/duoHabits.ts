// convex/duoHabits.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { getDropChances } from "../src/utils/dropChances";

export const getHabitsForDuo = query({
  args: { duoId: v.id("duoConnections") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("duoHabits")
      .withIndex("by_duoId", (q) => q.eq("duoId", args.duoId))
      .order("desc")
      .collect();
  },
});

export const createHabit = mutation({
  args: {
    title: v.string(),
    frequency: v.union(v.literal("daily"), v.literal("weekly")),
    duoId: v.id("duoConnections"),
  },
  handler: async (ctx, args) => {
    const trimmedTitle = args.title.trim();

    // Enhanced validation
    if (!trimmedTitle) {
      throw new Error("Habit title is required");
    }
    if (trimmedTitle.length < 3) {
      throw new Error("Habit title must be at least 3 characters long");
    }
    if (trimmedTitle.length > 50) {
      throw new Error("Habit title must be less than 50 characters");
    }

    // Check for duplicate habits in the same duo
    const existingHabits = await ctx.db
      .query("duoHabits")
      .withIndex("by_duoId", (q) => q.eq("duoId", args.duoId))
      .collect();

    const duplicateExists = existingHabits.some(
      (habit) => habit.title.toLowerCase() === trimmedTitle.toLowerCase()
    );

    if (duplicateExists) {
      throw new Error("A habit with this title already exists");
    }

    return await ctx.db.insert("duoHabits", {
      duoId: args.duoId,
      title: trimmedTitle,
      frequency: args.frequency,
      keySkill: "discipline", // Default skill
      difficulty: 1, // Default difficulty
      checkin_history: {},
      last_checkin_at: 0,
      created_at: Date.now(),
    });
  },
});

export const deleteHabit = mutation({
  args: {
    habitId: v.id("duoHabits"),
  },
  handler: async (ctx, args) => {
    // Verify the habit exists
    const habit = await ctx.db.get(args.habitId);
    if (!habit) {
      throw new Error("Habit not found");
    }

    // Delete the habit
    await ctx.db.delete(args.habitId);

    return { success: true };
  },
});

export const checkInHabit = mutation({
  args: {
    habitId: v.id("duoHabits"),
    userIsA: v.boolean(),
  },
  handler: async (ctx, args) => {
    const habit = await ctx.db.get(args.habitId);
    if (!habit) {
      throw new Error("Habit not found");
    }

    const duo = await ctx.db.get(habit.duoId);
    if (!duo) {
      throw new Error("Duo not found");
    }

    const now = Date.now();
    const isDaily = habit.frequency === "daily";

    // Get the last check-in time for the user
    const lastCheckinTime = args.userIsA
      ? (habit.last_checkin_at_userA ?? 0)
      : (habit.last_checkin_at_userB ?? 0);

    // Helper function to check if two timestamps are in the same day
    const isSameDay = (timestamp1: number, timestamp2: number) => {
      const date1 = new Date(timestamp1);
      const date2 = new Date(timestamp2);
      return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
      );
    };

    // Helper function to check if two timestamps are in the same week
    const isSameWeek = (timestamp1: number, timestamp2: number) => {
      const date1 = new Date(timestamp1);
      const date2 = new Date(timestamp2);

      // Get the start of the week (Sunday) for both dates
      const startOfWeek1 = new Date(date1);
      startOfWeek1.setDate(date1.getDate() - date1.getDay());
      startOfWeek1.setHours(0, 0, 0, 0);

      const startOfWeek2 = new Date(date2);
      startOfWeek2.setDate(date2.getDate() - date2.getDay());
      startOfWeek2.setHours(0, 0, 0, 0);

      return startOfWeek1.getTime() === startOfWeek2.getTime();
    };

    // Check if user already checked in for the current period
    const alreadyCheckedIn =
      lastCheckinTime > 0 &&
      (isDaily
        ? isSameDay(lastCheckinTime, now)
        : isSameWeek(lastCheckinTime, now));

    if (alreadyCheckedIn) {
      // User already checked in, undo the check-in
      const updateData: any = {
        last_checkin_at: Math.max(
          habit.last_checkin_at_userA ?? 0,
          habit.last_checkin_at_userB ?? 0
        ),
      };

      if (args.userIsA) {
        updateData.last_checkin_at_userA = 0;
      } else {
        updateData.last_checkin_at_userB = 0;
      }

      await ctx.db.patch(args.habitId, updateData);
      return { checkedIn: false, rewards: null };
    }

    // User is checking in
    const updateData: any = {
      last_checkin_at: now,
    };

    if (args.userIsA) {
      updateData.last_checkin_at_userA = now;
    } else {
      updateData.last_checkin_at_userB = now;
    }

    await ctx.db.patch(args.habitId, updateData);

    // Check if both users have now completed this habit for the current period
    const otherUserLastCheckin = args.userIsA
      ? (habit.last_checkin_at_userB ?? 0)
      : (habit.last_checkin_at_userA ?? 0);

    const otherUserCompletedThisPeriod =
      otherUserLastCheckin > 0 &&
      (isDaily
        ? isSameDay(otherUserLastCheckin, now)
        : isSameWeek(otherUserLastCheckin, now));

    let rewards = null;

    // Only award rewards if BOTH users have completed the habit for this period
    if (otherUserCompletedThisPeriod) {
      // Calculate rewards for completing the habit together
      rewards = await calculateHabitRewards(ctx, habit, args.userIsA);

      // Add XP to duo's trust_score
      if (rewards && rewards.xp > 0) {
        const currentTrustScore = duo.trust_score || 0;
        await ctx.db.patch(habit.duoId, {
          trust_score: currentTrustScore + rewards.xp,
          lastUpdated: now,
        });
      }
    }

    // Enhanced streak calculation
    await updateDuoStreak(ctx, habit.duoId, now);

    return {
      checkedIn: true,
      rewards,
      bothCompleted: otherUserCompletedThisPeriod,
    };
  },
});

// Updated helper function to calculate rewards when both users complete a habit
async function calculateHabitRewards(ctx: any, habit: any, userIsA: boolean) {
  const isDaily = habit.frequency === "daily";
  const difficulty = habit.difficulty || 1;

  // Base XP calculation based on frequency and difficulty
  const baseXP = isDaily ? 50 : 200;
  const difficultyMultiplier = difficulty;
  let finalXP = baseXP * difficultyMultiplier;

  // Apply XP multipliers from equipped tree items
  const tree = await ctx.db
    .query("trees")
    .withIndex("by_duoId", (q: any) => q.eq("duoId", habit.duoId))
    .first();

  if (tree && tree.decorations && tree.decorations.length > 0) {
    let totalXPMultiplier = 1;

    // Calculate total XP multiplier from all equipped items
    for (const decoration of tree.decorations) {
      const treeItem = await ctx.db
        .query("treeItems")
        .withIndex("by_itemId", (q: any) => q.eq("itemId", decoration.itemId))
        .first();

      if (treeItem && treeItem.buffs && treeItem.buffs.xpMultiplier) {
        totalXPMultiplier *= treeItem.buffs.xpMultiplier;
      }
    }

    // Apply the multiplier
    finalXP = Math.round(finalXP * totalXPMultiplier);
  }

  // Item drop chances (percentage) - increased since both users need to complete
  const dropChances = getDropChances(isDaily);
  // Determine if users get an item drop
  const random = Math.random() * 100;
  let droppedItem = null;

  // Check from rarest to most common
  if (random < dropChances.legendary) {
    droppedItem = await getRandomItemByRarity(ctx, "legendary");
  } else if (random < dropChances.legendary + dropChances.epic) {
    droppedItem = await getRandomItemByRarity(ctx, "epic");
  } else if (
    random <
    dropChances.legendary + dropChances.epic + dropChances.rare
  ) {
    droppedItem = await getRandomItemByRarity(ctx, "rare");
  } else if (
    random <
    dropChances.legendary +
      dropChances.epic +
      dropChances.rare +
      dropChances.uncommon
  ) {
    droppedItem = await getRandomItemByRarity(ctx, "uncommon");
  } else if (
    random <
    dropChances.legendary +
      dropChances.epic +
      dropChances.rare +
      dropChances.uncommon +
      dropChances.common
  ) {
    droppedItem = await getRandomItemByRarity(ctx, "common");
  }

  // If item dropped, add it to the duo's tree inventory
  if (droppedItem) {
    await addItemToInventory(ctx, habit.duoId, droppedItem.itemId, 1);
  }

  return {
    xp: finalXP,
    item: droppedItem
      ? {
          itemId: droppedItem.itemId,
          name: droppedItem.name,
          rarity: droppedItem.rarity,
          category: droppedItem.category,
          icon: droppedItem.icon,
          color: droppedItem.color,
        }
      : null,
  };
}

// Helper function to get a random item by rarity
async function getRandomItemByRarity(ctx: any, rarity: string) {
  const items = await ctx.db
    .query("treeItems")
    .withIndex("by_rarity", (q: any) => q.eq("rarity", rarity))
    .filter((q: any) => q.eq(q.field("isActive"), true))
    .collect();

  if (items.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * items.length);
  return items[randomIndex];
}

// Helper function to add items to tree inventory
async function addItemToInventory(
  ctx: any,
  duoId: string,
  itemId: string,
  quantity: number
) {
  const tree = await ctx.db
    .query("trees")
    .withIndex("by_duoId", (q: any) => q.eq("duoId", duoId))
    .first();

  if (!tree) {
    // Create tree if it doesn't exist
    await ctx.db.insert("trees", {
      duoId,
      stage: "sprout",
      leaves: 0,
      fruits: 0,
      decay: 0,
      inventory: { [itemId]: quantity },
      decorations: [],
      growth_log: [],
    });
  } else {
    // Update existing inventory
    const currentInventory = tree.inventory || {};
    const currentQuantity = currentInventory[itemId] || 0;

    await ctx.db.patch(tree._id, {
      inventory: {
        ...currentInventory,
        [itemId]: currentQuantity + quantity,
      },
    });
  }
}

// Helper function for enhanced streak calculation
async function updateDuoStreak(
  ctx: any,
  duoId: Id<"duoConnections">,
  currentTime: number
) {
  const duo = await ctx.db.get(duoId);
  if (!duo) return;

  const habits = await ctx.db
    .query("duoHabits")
    .withIndex("by_duoId", (q: any) => q.eq("duoId", duoId))
    .collect();

  const now = currentTime;
  const oneDayMs = 86400e3;

  // Get today's date string for comparison
  const today = new Date(now);
  const todayDateString = today.toISOString().split("T")[0];

  // Get yesterday's date string
  const yesterday = new Date(now - oneDayMs);
  const yesterdayDateString = yesterday.toISOString().split("T")[0];

  // Check if both users completed at least one habit today
  let bothCompletedAtLeastOneToday = false;
  let bothCompletedAtLeastOneYesterday = false;

  // Check if both users have completed at least one habit today
  const userACompletedHabitsToday = new Set<string>();
  const userBCompletedHabitsToday = new Set<string>();
  const userACompletedHabitsYesterday = new Set<string>();
  const userBCompletedHabitsYesterday = new Set<string>();

  for (const habit of habits) {
    const lastA = habit.last_checkin_at_userA ?? 0;
    const lastB = habit.last_checkin_at_userB ?? 0;

    // Check today's completions
    const aCompletedToday =
      lastA > 0 &&
      new Date(lastA).toISOString().split("T")[0] === todayDateString;
    const bCompletedToday =
      lastB > 0 &&
      new Date(lastB).toISOString().split("T")[0] === todayDateString;

    if (aCompletedToday) userACompletedHabitsToday.add(habit._id);
    if (bCompletedToday) userBCompletedHabitsToday.add(habit._id);

    // Check yesterday's completions
    const aCompletedYesterday =
      lastA > 0 &&
      new Date(lastA).toISOString().split("T")[0] === yesterdayDateString;
    const bCompletedYesterday =
      lastB > 0 &&
      new Date(lastB).toISOString().split("T")[0] === yesterdayDateString;

    if (aCompletedYesterday) userACompletedHabitsYesterday.add(habit._id);
    if (bCompletedYesterday) userBCompletedHabitsYesterday.add(habit._id);
  }

  // Check if both users completed at least one habit today and yesterday
  bothCompletedAtLeastOneToday =
    userACompletedHabitsToday.size > 0 && userBCompletedHabitsToday.size > 0;
  bothCompletedAtLeastOneYesterday =
    userACompletedHabitsYesterday.size > 0 &&
    userBCompletedHabitsYesterday.size > 0;

  // Calculate new streak value
  let newStreak = duo.streak || 0;
  let newStreakDate = duo.streakDate || now;

  // Get the current streak date to check if we've already incremented today
  const currentStreakDate = new Date(duo.streakDate || 0);
  const currentStreakDateString = currentStreakDate.toISOString().split("T")[0];
  const alreadyIncrementedToday = currentStreakDateString === todayDateString;

  if (bothCompletedAtLeastOneToday && !alreadyIncrementedToday) {
    if (newStreak === 0) {
      // Starting a new streak
      newStreak = 1;
      newStreakDate = now;
    } else if (bothCompletedAtLeastOneYesterday) {
      // Continue existing streak - only increment once per day
      newStreak += 1;
      newStreakDate = now;
    } else {
      // Gap in streak, start over
      newStreak = 1;
      newStreakDate = now;
    }
  } else if (!bothCompletedAtLeastOneToday) {
    // Check if streak should be broken
    const daysSinceLastStreak = Math.floor(
      (now - (duo.streakDate || 0)) / oneDayMs
    );

    // Break streak if more than 1 day has passed without both users completing
    if (daysSinceLastStreak > 1) {
      newStreak = 0;
      newStreakDate = now;
    }
  }

  // Only update if there's actually a change
  if (newStreak !== duo.streak || newStreakDate !== duo.streakDate) {
    await ctx.db.patch(duoId, {
      streak: newStreak,
      streakDate: newStreakDate,
      lastUpdated: now,
    });
  }
}

// Additional helper mutation to manually reset streaks (useful for testing or admin)
export const resetDuoStreak = mutation({
  args: { duoId: v.id("duoConnections") },
  handler: async (ctx, args) => {
    const duo = await ctx.db.get(args.duoId);
    if (!duo) {
      throw new Error("Duo not found");
    }

    await ctx.db.patch(args.duoId, {
      streak: 0,
      streakDate: Date.now(),
      lastUpdated: Date.now(),
    });

    return { success: true, message: "Streak reset successfully" };
  },
});

// Utility query to get streak information
export const getDuoStreakInfo = query({
  args: { duoId: v.id("duoConnections") },
  handler: async (ctx, args) => {
    const duo = await ctx.db.get(args.duoId);
    if (!duo) {
      throw new Error("Duo not found");
    }

    const habits = await ctx.db
      .query("duoHabits")
      .withIndex("by_duoId", (q) => q.eq("duoId", args.duoId))
      .collect();

    const now = Date.now();
    const today = new Date(now);
    const todayDateString = today.toISOString().split("T")[0];

    // Check today's completion status
    let bothCompletedToday = false;
    let userACompletedToday = false;
    let userBCompletedToday = false;

    for (const habit of habits) {
      const lastA = habit.last_checkin_at_userA ?? 0;
      const lastB = habit.last_checkin_at_userB ?? 0;

      const aCompletedToday =
        lastA > 0 &&
        new Date(lastA).toISOString().split("T")[0] === todayDateString;
      const bCompletedToday =
        lastB > 0 &&
        new Date(lastB).toISOString().split("T")[0] === todayDateString;

      if (aCompletedToday) userACompletedToday = true;
      if (bCompletedToday) userBCompletedToday = true;

      if (aCompletedToday && bCompletedToday) {
        bothCompletedToday = true;
        break;
      }
    }

    return {
      currentStreak: duo.streak || 0,
      streakDate: duo.streakDate || now,
      bothCompletedToday,
      userACompletedToday,
      userBCompletedToday,
      totalHabits: habits.length,
    };
  },
});

// Mutation to update habit details (title, frequency, etc.)
export const updateHabit = mutation({
  args: {
    habitId: v.id("duoHabits"),
    title: v.optional(v.string()),
    frequency: v.optional(v.union(v.literal("daily"), v.literal("weekly"))),
    keySkill: v.optional(v.string()),
    difficulty: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const habit = await ctx.db.get(args.habitId);
    if (!habit) {
      throw new Error("Habit not found");
    }

    const updateData: any = {};

    if (args.title !== undefined) {
      const trimmedTitle = args.title.trim();
      if (!trimmedTitle) {
        throw new Error("Habit title is required");
      }
      if (trimmedTitle.length < 3) {
        throw new Error("Habit title must be at least 3 characters long");
      }
      if (trimmedTitle.length > 50) {
        throw new Error("Habit title must be less than 50 characters");
      }

      // Check for duplicate habits in the same duo (excluding current habit)
      const existingHabits = await ctx.db
        .query("duoHabits")
        .withIndex("by_duoId", (q) => q.eq("duoId", habit.duoId))
        .collect();

      const duplicateExists = existingHabits.some(
        (h) =>
          h._id !== args.habitId &&
          h.title.toLowerCase() === trimmedTitle.toLowerCase()
      );

      if (duplicateExists) {
        throw new Error("A habit with this title already exists");
      }

      updateData.title = trimmedTitle;
    }

    if (args.frequency !== undefined) {
      updateData.frequency = args.frequency;
      // Reset check-in times when frequency changes
      updateData.last_checkin_at_userA = 0;
      updateData.last_checkin_at_userB = 0;
      updateData.last_checkin_at = 0;
    }

    if (args.keySkill !== undefined) {
      updateData.keySkill = args.keySkill;
    }

    if (args.difficulty !== undefined) {
      if (args.difficulty < 1 || args.difficulty > 5) {
        throw new Error("Difficulty must be between 1 and 5");
      }
      updateData.difficulty = args.difficulty;
    }

    await ctx.db.patch(args.habitId, updateData);

    return { success: true };
  },
});
