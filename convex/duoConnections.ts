import {
  internalMutation,
  internalQuery,
  query,
  mutation,
} from "./_generated/server";
import { v, ConvexError } from "convex/values";

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
