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
