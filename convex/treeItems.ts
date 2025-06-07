// convex/treeItems.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all active tree items
export const getAllTreeItems = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("treeItems")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .collect();
  },
});

// Get tree items by category
export const getTreeItemsByCategory = query({
  args: { category: v.union(v.literal("leaf"), v.literal("fruit")) },
  handler: async (ctx, { category }) => {
    return await ctx.db
      .query("treeItems")
      .withIndex("by_category", (q) => q.eq("category", category))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Get a specific tree item by itemId
export const getTreeItemById = query({
  args: { itemId: v.string() },
  handler: async (ctx, { itemId }) => {
    return await ctx.db
      .query("treeItems")
      .withIndex("by_itemId", (q) => q.eq("itemId", itemId))
      .first();
  },
});

// Create a new tree item (admin function)
export const createTreeItem = mutation({
  args: {
    itemId: v.string(),
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
    icon: v.string(),
    color: v.string(),
    bgColor: v.string(),
    borderColor: v.string(),
    imageAsset: v.string(),
    buffs: v.object({
      xpMultiplier: v.optional(v.number()),
      focusBonus: v.optional(v.number()),
      streakProtection: v.optional(v.boolean()),
      dailyXpBonus: v.optional(v.number()),
    }),
    ability: v.string(),
    abilityDescription: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if itemId already exists
    const existing = await ctx.db
      .query("treeItems")
      .withIndex("by_itemId", (q) => q.eq("itemId", args.itemId))
      .first();

    if (existing) {
      throw new Error(`Tree item with itemId '${args.itemId}' already exists`);
    }

    const now = Date.now();
    return await ctx.db.insert("treeItems", {
      ...args,
      isActive: true,
      created_at: now,
      updated_at: now,
    });
  },
});

// Update an existing tree item
export const updateTreeItem = mutation({
  args: {
    itemId: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    buffs: v.optional(
      v.object({
        xpMultiplier: v.optional(v.number()),
        focusBonus: v.optional(v.number()),
        streakProtection: v.optional(v.boolean()),
        dailyXpBonus: v.optional(v.number()),
      })
    ),
    ability: v.optional(v.string()),
    abilityDescription: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, { itemId, ...updates }) => {
    const item = await ctx.db
      .query("treeItems")
      .withIndex("by_itemId", (q) => q.eq("itemId", itemId))
      .first();

    if (!item) {
      throw new Error(`Tree item with itemId '${itemId}' not found`);
    }

    return await ctx.db.patch(item._id, {
      ...updates,
      updated_at: Date.now(),
    });
  },
});

// Initialize default tree items (run once to populate database)
export const initializeDefaultTreeItems = mutation({
  handler: async (ctx) => {
    // Check if items already exist
    const existingItems = await ctx.db.query("treeItems").collect();
    if (existingItems.length > 0) {
      throw new Error("Tree items already initialized");
    }

    const defaultItems = [
      // Leaves
      {
        itemId: "leaf",
        name: "Mystical Leaf",
        description: "A shimmering leaf that enhances learning potential",
        category: "leaf" as const,
        rarity: "common" as const,
        icon: "🍃",
        color: "#16a34a",
        bgColor: "#f0fdf4",
        borderColor: "#bbf7d0",
        imageAsset: "hemp-leaf.png",
        buffs: { xpMultiplier: 2 },
        ability: "Double XP Boost",
        abilityDescription: "Multiplies all XP gained by 2x while active",
      },
      {
        itemId: "silverLeaf",
        name: "Silver Leaf",
        description: "A pristine silver leaf that boosts focus and clarity",
        category: "leaf" as const,
        rarity: "uncommon" as const,
        icon: "🥈",
        color: "#6b7280",
        bgColor: "#f8fafc",
        borderColor: "#d1d5db",
        imageAsset: "hemp-leaf.png",
        buffs: { xpMultiplier: 1.5, focusBonus: 25 },
        ability: "Focus Enhancement",
        abilityDescription: "1.5x XP and increases concentration by 25%",
      },
      {
        itemId: "goldenLeaf",
        name: "Golden Leaf",
        description: "A radiant golden leaf infused with ancient wisdom",
        category: "leaf" as const,
        rarity: "legendary" as const,
        icon: "🏆",
        color: "#f59e0b",
        bgColor: "#fffbeb",
        borderColor: "#fde68a",
        imageAsset: "hemp-leaf.png",
        buffs: { xpMultiplier: 3, streakProtection: true },
        ability: "Wisdom Amplifier",
        abilityDescription:
          "Triple XP and protects your streak from breaking once per week",
      },
      // Fruits
      {
        itemId: "fruit",
        name: "Golden Orange",
        description: "A radiant fruit that provides sustained energy",
        category: "fruit" as const,
        rarity: "rare" as const,
        icon: "🍊",
        color: "#ea580c",
        bgColor: "#fff7ed",
        borderColor: "#fed7aa",
        imageAsset: "orange.png",
        buffs: { xpMultiplier: 2.5, dailyXpBonus: 50 },
        ability: "Energy Sustain",
        abilityDescription: "2.5x XP multiplier and +50 daily XP bonus",
      },
      {
        itemId: "apple",
        name: "Crimson Apple",
        description: "A vibrant red apple that sharpens mental acuity",
        category: "fruit" as const,
        rarity: "uncommon" as const,
        icon: "🍎",
        color: "#dc2626",
        bgColor: "#fef2f2",
        borderColor: "#fecaca",
        imageAsset: "orange.png",
        buffs: { xpMultiplier: 1.8, focusBonus: 40 },
        ability: "Mental Sharpness",
        abilityDescription:
          "1.8x XP and increases problem-solving speed by 40%",
      },
      {
        itemId: "cherry",
        name: "Ethereal Cherry",
        description: "A mystical cherry that brings luck and serendipity",
        category: "fruit" as const,
        rarity: "epic" as const,
        icon: "🍒",
        color: "#be185d",
        bgColor: "#fdf2f8",
        borderColor: "#f9a8d4",
        imageAsset: "orange.png",
        buffs: { xpMultiplier: 2.2, dailyXpBonus: 75 },
        ability: "Fortune's Favor",
        abilityDescription:
          "2.2x XP, +75 daily XP, and increased rare item drops",
      },
    ];

    const now = Date.now();
    for (const item of defaultItems) {
      await ctx.db.insert("treeItems", {
        ...item,
        isActive: true,
        created_at: now,
        updated_at: now,
      });
    }

    return {
      message: "Default tree items initialized successfully",
      count: defaultItems.length,
    };
  },
});
