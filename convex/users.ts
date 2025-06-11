import { internalMutation, mutation, query } from "../convex/_generated/server";
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
    name: v.optional(v.string()),
    profileImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (user) return user._id;

    const userId = await ctx.db.insert("users", {
      email: args.email,
      clerkId: args.clerkId,
      avatar: args.profileImage || "",
      name: args.name || "",
      joined_at: Date.now(),
      timezone: "Europe/Berlin",
      language: "de",
      onboardingCompleted: false,
    });

    return userId;
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

export const updateUserInfo = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    profileImage: v.string(),
    bio: v.optional(v.string()), // Add bio parameter
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      // Update existing user WITHOUT marking onboarding as complete
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        avatar: args.profileImage,
        bio: args.bio, // Update bio field
      });
      return existingUser._id;
    } else {
      // Create new user WITHOUT marking onboarding as complete
      const userId = await ctx.db.insert("users", {
        email: "", // Will be populated by webhook later if needed
        clerkId: args.clerkId,
        avatar: args.profileImage,
        name: args.name,
        bio: args.bio, // Include bio in new user creation
        joined_at: Date.now(),
        timezone: "Europe/Berlin",
        language: "de",
        onboardingCompleted: false, // Keep as false
      });
      return userId;
    }
  },
});

// Updated to mark onboarding as complete
export const completeOnboarding = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    profileImage: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      // Update existing user with onboarding info and mark as complete
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        avatar: args.profileImage,
        onboardingCompleted: true,
        onboardingCompletedAt: Date.now(),
      });
      return existingUser._id;
    } else {
      // Create new user with onboarding info and mark as complete
      const userId = await ctx.db.insert("users", {
        email: "", // Will be populated by webhook later if needed
        clerkId: args.clerkId,
        avatar: args.profileImage,
        name: args.name,
        joined_at: Date.now(),
        timezone: "Europe/Berlin",
        language: "de",
        onboardingCompleted: true,
        onboardingCompletedAt: Date.now(),
      });
      return userId;
    }
  },
});

// Helper function to check if username is available (excluding current user)
export const checkUsernameAvailability = query({
  args: {
    username: v.string(),
    excludeClerkId: v.optional(v.string()),
  },
  handler: async (ctx, { username, excludeClerkId }) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("name", username))
      .first();

    // If no user found with this username, it's available
    if (!existingUser) return { available: true };

    // If user found but it's the current user, it's available for them
    if (excludeClerkId && existingUser.clerkId === excludeClerkId) {
      return { available: true };
    }

    // Username is taken by someone else
    return { available: false };
  },
});

export const getOnboardingStatus = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user) {
      return {
        exists: false,
        onboardingCompleted: false,
        hasUsername: false,
        hasAvatar: false,
      };
    }

    // Check if user has completed onboarding
    const hasUsername = !!(user.name && user.name.trim().length > 0);
    const hasAvatar = !!(user.avatar && user.avatar.trim().length > 0);

    // If onboardingCompleted field exists, use it
    // If it doesn't exist but user has name and avatar, consider it completed (returning user)
    let onboardingCompleted: boolean;
    if (user.onboardingCompleted !== undefined) {
      onboardingCompleted = user.onboardingCompleted;
    } else {
      // For existing users without the onboardingCompleted field,
      // consider them as having completed onboarding if they have basic data
      onboardingCompleted = hasUsername && hasAvatar;
    }

    return {
      exists: true,
      onboardingCompleted,
      hasUsername,
      hasAvatar,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        clerkId: user.clerkId,
      },
    };
  },
});

export const deleteAccount = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Delete all related data first

    // 1. Delete duo connections where user is involved
    const duoConnections = await ctx.db
      .query("duoConnections")
      .filter((q) =>
        q.or(q.eq(q.field("user1"), user._id), q.eq(q.field("user2"), user._id))
      )
      .collect();

    for (const connection of duoConnections) {
      // Delete associated habits
      const habits = await ctx.db
        .query("duoHabits")
        .withIndex("by_duoId", (q) => q.eq("duoId", connection._id))
        .collect();

      for (const habit of habits) {
        await ctx.db.delete(habit._id);
      }

      // Delete associated trees
      const trees = await ctx.db
        .query("trees")
        .withIndex("by_duoId", (q) => q.eq("duoId", connection._id))
        .collect();

      for (const tree of trees) {
        await ctx.db.delete(tree._id);
      }

      // Delete the duo connection
      await ctx.db.delete(connection._id);
    }

    // 2. Delete duo invites (sent and received)
    const sentInvites = await ctx.db
      .query("duoInvites")
      .filter((q) => q.eq(q.field("from"), user._id))
      .collect();

    const receivedInvites = await ctx.db
      .query("duoInvites")
      .withIndex("by_to", (q) => q.eq("to", user._id))
      .collect();

    for (const invite of [...sentInvites, ...receivedInvites]) {
      await ctx.db.delete(invite._id);
    }

    // 3. Finally delete the user
    await ctx.db.delete(user._id);

    return { success: true };
  },
});
