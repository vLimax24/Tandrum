import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { Id } from "./_generated/dataModel";

export const getHabitsForDuo = query({
  args: { duoId: v.id("duoConnections") },
  handler: async (ctx, { duoId }) => {
    return await ctx.db
      .query("duoHabits")
      .withIndex("by_duoId", (q) => q.eq("duoId", duoId))
      .collect();
  },
});

export const checkInHabit = mutation({
  args: { habitId: v.id("duoHabits"), userIsA: v.boolean() },
  handler: async (ctx, { habitId, userIsA }) => {
    const habit = await ctx.db.get(habitId);
    if (!habit) throw new ConvexError("Habit not found");

    const now = Date.now();
    const key = userIsA ? "last_checkin_at_userA" : "last_checkin_at_userB";
    const partnerKey = userIsA
      ? "last_checkin_at_userB"
      : "last_checkin_at_userA";

    // Update check-in time for the current user
    await ctx.db.patch(habitId, { [key]: now });

    const partnerCheckin = habit[partnerKey];
    const otherUserCheckedIn =
      typeof partnerCheckin === "number" && now - partnerCheckin < 86400e3;

    if (otherUserCheckedIn) {
      const duoConnection = await ctx.db
        .query("duoConnections")
        .filter((q) => q.eq(q.field("_id"), habit.duoId))
        .first();

      if (!duoConnection) throw new ConvexError("Duo connection not found");

      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).getTime();

      // Check if the streak has already been increased for the day
      const streakIncreasedToday = duoConnection.streakDate === startOfDay;

      if (!streakIncreasedToday) {
        const newStreak = duoConnection.streak + 1;

        // Update streak for the duo connection
        await ctx.db.patch(duoConnection._id, {
          streak: newStreak,
          streakDate: startOfDay, // Track the last date streak was increased
        });

        // Update checkin history for both users with today's streak date
        const newCheckinHistory = {
          ...habit.checkin_history,
          [userIsA ? "userA" : "userB"]: {
            streakDate: startOfDay,
            userA: userIsA,
            userB: !userIsA, // Always track the other user as well
          },
        };

        await ctx.db.patch(habitId, { checkin_history: newCheckinHistory });
      }

      // Increase trust score (always increase trust score if both users checked in)
      const newTrustPoints = duoConnection.trust_score + 1;
      await ctx.db.patch(duoConnection._id, { trust_score: newTrustPoints });
    }
  },
});

// ✨ New: create a habit
export const createHabit = mutation({
  args: {
    duoId: v.id("duoConnections"),
    title: v.string(),
    frequency: v.union(v.literal("daily"), v.literal("weekly")),
  },
  handler: async (ctx, { duoId, title, frequency }) => {
    await ctx.db.insert("duoHabits", {
      duoId,
      title,
      keySkill: "discipline", // pick a default or extend args
      difficulty: 1, // default
      frequency,
      last_checkin_at: Date.now(),
      checkin_history: {},
      created_at: Date.now(),
    });
  },
});
