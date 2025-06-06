import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const createConnection = mutation({
  args: {
    user1: v.id("users"),
    user2: v.id("users"),
  },
  handler: async (ctx, args) => {
    const connection = await ctx.db
      .query("duoConnections")
      .withIndex("by_userPair", (q) =>
        q.eq("user1", args.user1).eq("user2", args.user2)
      )
      .first();

    if (connection) return;

    await ctx.db.insert("duoConnections", {
      user1: args.user1,
      user2: args.user2,
      created_at: Date.now(),
      trust_score: 0,
      shared_skills: [],
      treeState: "sprout",
      streak: 0,
    });
  },
});

export const isUserInConnection = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const asUser1 = await ctx.db
      .query("duoConnections")
      .withIndex("by_user1", (q) => q.eq("user1", args.userId))
      .first();

    if (asUser1) return true;

    const asUser2 = await ctx.db
      .query("duoConnections")
      .withIndex("by_user2", (q) => q.eq("user2", args.userId))
      .first();

    return !!asUser2;
  },
});

export const getConnectionsForUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Get all connections where the user is either user1 or user2
    const connections1 = await ctx.db
      .query("duoConnections")
      .withIndex("by_user1", (q) => q.eq("user1", args.userId))
      .collect();

    const connections2 = await ctx.db
      .query("duoConnections")
      .withIndex("by_user2", (q) => q.eq("user2", args.userId))
      .collect();

    const allConnections = [...connections1, ...connections2];

    // Enrich connections with partner information
    const enrichedConnections = await Promise.all(
      allConnections.map(async (connection) => {
        // Determine who is the partner
        const partnerId =
          connection.user1 === args.userId
            ? connection.user2
            : connection.user1;

        // Get partner's information
        const partner = await ctx.db.get(partnerId);

        return {
          ...connection,
          partnerName: partner?.name || "Unknown Partner",
          partnerId: partnerId,
        };
      })
    );

    // Sort by creation date (newest first)
    return enrichedConnections.sort((a, b) => b.created_at - a.created_at);
  },
});

export const getDuoById = query({
  args: { duoId: v.id("duoConnections") },
  handler: async (ctx, args) => {
    const duo = await ctx.db.get(args.duoId);
    if (!duo) return null;

    // Get both users' information
    const user1 = await ctx.db.get(duo.user1);
    const user2 = await ctx.db.get(duo.user2);

    return {
      ...duo,
      user1Name: user1?.name || "Unknown User",
      user2Name: user2?.name || "Unknown User",
    };
  },
});

export const getStreakHistory = query({
  args: { duoId: v.id("duoConnections"), days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const duo = await ctx.db.get(args.duoId);
    if (!duo) return [];

    const daysToShow = args.days || 30;
    const now = Date.now();
    const oneDayMs = 86400e3;

    const history = [];

    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(now - i * oneDayMs);
      const dateString = date.toISOString().split("T")[0];

      // Get habits completed on this date
      const habits = await ctx.db
        .query("duoHabits")
        .withIndex("by_duoId", (q) => q.eq("duoId", args.duoId))
        .collect();

      let bothCompleted = false;

      for (const habit of habits) {
        const lastA = habit.last_checkin_at_userA ?? 0;
        const lastB = habit.last_checkin_at_userB ?? 0;

        const aCompletedOnDate =
          lastA > 0 &&
          new Date(lastA).toISOString().split("T")[0] === dateString;
        const bCompletedOnDate =
          lastB > 0 &&
          new Date(lastB).toISOString().split("T")[0] === dateString;

        if (aCompletedOnDate && bCompletedOnDate) {
          bothCompleted = true;
          break;
        }
      }

      history.unshift({
        date: dateString,
        bothCompleted,
        dayOfWeek: date.getDay(),
      });
    }

    return history;
  },
});
