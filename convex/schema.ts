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
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_username", ["name"]),

  duoConnections: defineTable({
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
    streak: v.number(),
    streakDate: v.optional(v.number()),
    lastUpdated: v.optional(v.number()),
  })
    .index("by_userPair", ["user1", "user2"])
    .index("by_user1", ["user1"])
    .index("by_user2", ["user2"]),

  duoHabits: defineTable({
    duoId: v.id("duoConnections"),
    title: v.string(),
    keySkill: v.union(
      v.literal("discipline"),
      v.literal("empathy"),
      v.literal("clarity"),
      v.literal("creativity"),
      v.literal("courage")
    ),
    difficulty: v.union(v.literal(1), v.literal(2), v.literal(3)),
    frequency: v.union(v.literal("daily"), v.literal("weekly")),
    checkin_history: v.record(
      v.string(),
      v.object({
        userA: v.boolean(),
        userB: v.boolean(),
        streakDate: v.optional(v.number()),
      })
    ),
    last_checkin_at: v.number(),
    last_checkin_at_userA: v.optional(v.number()),
    last_checkin_at_userB: v.optional(v.number()),
    created_at: v.number(),
  }).index("by_duoId", ["duoId"]),

  duoInvites: defineTable({
    from: v.id("users"),
    to: v.id("users"),
    created_at: v.number(),
  }).index("by_to", ["to"]),

  trees: defineTable({
    duoId: v.id("duoConnections"),
    stage: v.union(
      v.literal("sprout"),
      v.literal("smallTree"),
      v.literal("mediumTree"),
      v.literal("grownTree")
    ),
    leaves: v.number(),
    fruits: v.number(),
    decay: v.number(),
    // Now each decoration can carry an optional "buff" object.
    decorations: v.optional(
      v.array(
        v.object({
          type: v.union(v.literal("leaf"), v.literal("fruit")),
          position: v.object({
            x: v.number(),
            y: v.number(),
          }),
          buff: v.optional(
            v.object({
              xpMultiplier: v.number(),
              // You can add more buff fields here if needed later
            })
          ),
        })
      )
    ),
    growth_log: v.array(
      v.record(
        v.string(),
        v.object({
          change: v.string(),
        })
      )
    ),
  }).index("by_duoId", ["duoId"]),

  emails: defineTable({
    email: v.string(),
  }).index("by_email", ["email"]),
});
