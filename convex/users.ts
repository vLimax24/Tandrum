import { internalMutation, query } from "../convex/_generated/server";
import { v, ConvexError } from "convex/values";

export const getAllUser = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});

export const createUser = internalMutation({
  args: {
    email: v.any(),
    clerkId: v.string(),
    name: v.string(),
    profileImage: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (user) return;

    await ctx.db.insert("users", {
      email: args.email,
      clerkId: args.clerkId,
      avatar: args.profileImage,
      name: args.name,
      joined_at: Date.now(),
      timezone: "Europe/Berlin",
      language: "en",
    });
  },
});

export const deleteUser = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) return;

    await ctx.db.delete(user._id);
  },
});

export const updateUser = internalMutation({
  args: { clerkId: v.string(), name: v.string(), profileImage: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      throw new ConvexError("user not found");
    }

    await ctx.db.patch(user._id, {
      name: args.name,
      avatar: args.profileImage,
    });
  },
});

export const getUserByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("name", username))
      .first();

    return user ? { id: user._id, name: user.name } : null;
  },
});
