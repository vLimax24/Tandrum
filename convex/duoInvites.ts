import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

export const sendInvite = mutation({
  args: {
    from: v.id("users"),
    to: v.id("users"),
  },
  handler: async (ctx, { from, to }) => {
    const existing = await ctx.db
      .query("duoInvites")
      .withIndex("by_to", (q) => q.eq("to", to))
      .first();

    if (existing) return; // Prevent spamming

    await ctx.db.insert("duoInvites", {
      from,
      to,
      created_at: Date.now(),
    });
  },
});

export const getIncomingInvite = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("duoInvites")
      .withIndex("by_to", (q) => q.eq("to", userId))
      .first();
  },
});

export const respondToInvite = mutation({
  args: {
    inviteId: v.id("duoInvites"),
    accept: v.boolean(),
  },
  handler: async (ctx, { inviteId, accept }) => {
    const invite = await ctx.db.get(inviteId);
    if (!invite) return;

    if (accept) {
      // Step 1: Create duo connection
      const duoId = await ctx.db.insert("duoConnections", {
        user1: invite.from,
        user2: invite.to,
        created_at: Date.now(),
        trust_score: 0,
        shared_skills: [],
        treeState: "sprout",
        streak: 0,
      });

      // Step 2: Create a tree for the duo
      await ctx.db.insert("trees", {
        duoId,
        stage: "sprout",
        leaves: 0,
        fruits: 0,
        decay: 0,
        inventory: {},
        growth_log: [],
      });

      // Step 3: Seed default habits for the duo
      const defaultHabits = [
        {
          title: "Daily Check-In",
          keySkill: "clarity",
          difficulty: 1,
          frequency: "daily",
        },
        {
          title: "Encourage Your Partner",
          keySkill: "empathy",
          difficulty: 1,
          frequency: "daily",
        },
      ];

      for (const habit of defaultHabits) {
        await ctx.db.insert("duoHabits", {
          duoId,
          title: habit.title,
          keySkill: habit.keySkill as
            | "discipline"
            | "empathy"
            | "clarity"
            | "creativity"
            | "courage",
          difficulty: habit.difficulty as 1 | 2 | 3,
          frequency: habit.frequency as "daily" | "weekly",
          checkin_history: {},
          last_checkin_at: 0,
          created_at: Date.now(),
        });
      }
    }

    // Step 4: Delete the invite after response
    await ctx.db.delete(inviteId);
  },
});
