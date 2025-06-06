// convex/duoHabits.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

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
    const timeLimit = isDaily ? 86400e3 : 7 * 86400e3; // 24 hours or 7 days

    // Check if user already checked in within the time limit
    const lastCheckinTime = args.userIsA
      ? (habit.last_checkin_at_userA ?? 0)
      : (habit.last_checkin_at_userB ?? 0);

    if (now - lastCheckinTime < timeLimit) {
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
      return { checkedIn: false };
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

    // Enhanced streak calculation
    await updateDuoStreak(ctx, habit.duoId, now);

    return { checkedIn: true };
  },
});

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
  let bothCompletedToday = false;
  let bothCompletedYesterday = false;

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

    if (aCompletedToday && bCompletedToday) {
      bothCompletedToday = true;
      break;
    }
  }

  // Check yesterday's completions for streak continuation
  for (const habit of habits) {
    const lastA = habit.last_checkin_at_userA ?? 0;
    const lastB = habit.last_checkin_at_userB ?? 0;

    const aCompletedYesterday =
      lastA > 0 &&
      new Date(lastA).toISOString().split("T")[0] === yesterdayDateString;
    const bCompletedYesterday =
      lastB > 0 &&
      new Date(lastB).toISOString().split("T")[0] === yesterdayDateString;

    if (aCompletedYesterday && bCompletedYesterday) {
      bothCompletedYesterday = true;
      break;
    }
  }

  // Calculate new streak value
  let newStreak = duo.streak || 0;
  let newStreakDate = duo.streakDate || now;

  if (bothCompletedToday) {
    if (newStreak === 0 || !bothCompletedYesterday) {
      // Starting a new streak
      newStreak = 1;
      newStreakDate = now;
    } else if (bothCompletedYesterday) {
      // Continue existing streak
      newStreak += 1;
    }
  } else {
    // No completion today, check if streak should be reset
    const lastStreakDate = new Date(duo.streakDate || 0);
    const daysSinceLastStreak = Math.floor(
      (now - lastStreakDate.getTime()) / oneDayMs
    );

    // Reset streak if more than 1 day has passed without both users completing
    if (daysSinceLastStreak > 1) {
      newStreak = 0;
      newStreakDate = now;
    }
  }

  // Update duo with new streak information
  await ctx.db.patch(duoId, {
    streak: newStreak,
    streakDate: newStreakDate,
    lastUpdated: now,
  });
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

    updateData.updated_at = Date.now();

    await ctx.db.patch(args.habitId, updateData);

    return { success: true };
  },
});
