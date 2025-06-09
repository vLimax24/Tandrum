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
    // Add onboarding tracking
    onboardingCompleted: v.optional(v.boolean()),
    onboardingCompletedAt: v.optional(v.number()),
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

  // NEW: Tree Items table for managing all decorations
  treeItems: defineTable({
    itemId: v.string(), // unique identifier like "leaf", "silverLeaf", etc.
    name: v.string(),
    description: v.string(),
    category: v.union(v.literal("leaf"), v.literal("fruit")),
    rarity: v.union(
      v.literal("common"),
      v.literal("uncommon"),
      v.literal("rare"),
      v.literal("epic"),
      v.literal("legendary")
    ),
    // Visual properties
    icon: v.string(),
    color: v.string(),
    bgColor: v.string(),
    borderColor: v.string(),
    imageAsset: v.string(), // reference to image file
    // Buff properties
    buffs: v.object({
      xpMultiplier: v.optional(v.number()),
      focusBonus: v.optional(v.number()),
      streakProtection: v.optional(v.boolean()),
      dailyXpBonus: v.optional(v.number()),
      // Add more buff types as needed
    }),
    // Ability description
    ability: v.string(),
    abilityDescription: v.string(),
    // Availability
    isActive: v.boolean(),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_itemId", ["itemId"])
    .index("by_category", ["category"])
    .index("by_rarity", ["rarity"])
    .index("by_isActive", ["isActive"]),

  trees: defineTable({
    duoId: v.id("duoConnections"),
    stage: v.union(
      v.literal("tree-1"),
      v.literal("tree-1.5"),
      v.literal("tree-2"),
      v.literal("tree-3"),
      v.literal("tree-4")
    ),
    leaves: v.number(),
    fruits: v.number(),
    decay: v.number(),
    // Dynamic inventory - stores counts for each itemId
    inventory: v.record(v.string(), v.number()),
    // Updated decorations to reference itemId instead of hardcoded types
    decorations: v.optional(
      v.array(
        v.object({
          itemId: v.string(), // references treeItems.itemId
          position: v.object({
            x: v.number(),
            y: v.number(),
          }),
          // Buffs are now calculated from the item definition
          equipped_at: v.number(),
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
