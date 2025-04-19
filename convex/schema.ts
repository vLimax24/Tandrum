// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    clerkId: v.string(),
    email: v.string(),
    avatar: v.string(),
    joined_at: v.number(),
    timezone: v.string(),
    language: v.string(),
    bio: v.optional(v.string()),
    partner: v.optional(v.array(v.id("users"))),
  }).index("by_clerkId", ["clerkId"]),

  duo_connections: defineTable({
    user1: v.id("users"),
    user2: v.id("users"),
    created_at: v.number(),
    trust_score: v.number(),
    shared_skills: v.array(
      v.object({
        name: v.string(),
        score: v.number(),
      })
    ),
    treeState: v.string(),
  }),

  duo_habits: defineTable({
    duoId: v.id("duo_connections"),
    title: v.string(),
    keySkill: v.union(
      v.literal("discipline"),
      v.literal("empathy"),
      v.literal("clarity"),
      v.literal("creativity"),
      v.literal("courage")
    ),
    difficulty: v.union(v.literal(1), v.literal(2), v.literal(3)),
    frequency: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("custom")
    ),
    streak: v.number(),
    checkin_history: v.record(
      v.string(),
      v.object({
        userA: v.boolean(),
        userB: v.boolean(),
      })
    ),
    last_checkin_at: v.number(),
    created_at: v.number(),
  }),

  trees: defineTable({
    duoId: v.id("duo_connections"),
    stage: v.union(
      v.literal("sprout"),
      v.literal("smallTree"),
      v.literal("mediumTree"),
      v.literal("grownTree")
    ),
    leaves: v.number(),
    fruits: v.number(),
    decay: v.number(),
    growth_log: v.array(
      v.record(
        v.string(),
        v.object({
          change: v.string(),
        })
      )
    ),
  }),
});
