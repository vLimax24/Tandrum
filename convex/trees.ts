// convex/trees.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getLevelData, getTreeStageForLevel } from "../src/utils/level";

type Stage = "sprout" | "smallTree" | "mediumTree" | "grownTree";

/**
 * Helper: Return max number of decorations allowed given the stage.
 */
function maxDecorationsForStage(stage: Stage): number {
  switch (stage) {
    case "mediumTree":
      return 2;
    case "grownTree":
      return 4;
    default:
      return 0; // sprout & smallTree cannot place decorations
  }
}

export const getTreeForDuo = query({
  args: { duoId: v.id("duoConnections") },
  handler: async (ctx, { duoId }) => {
    return await ctx.db
      .query("trees")
      .withIndex("by_duoId", (q) => q.eq("duoId", duoId))
      .first();
  },
});

// NEW: Get tree with enriched decoration data
export const getEnrichedTreeForDuo = query({
  args: { duoId: v.id("duoConnections") },
  handler: async (ctx, { duoId }) => {
    const tree = await ctx.db
      .query("trees")
      .withIndex("by_duoId", (q) => q.eq("duoId", duoId))
      .first();

    if (!tree) return null;

    // Enrich decorations with item data
    const enrichedDecorations = await Promise.all(
      (tree.decorations || []).map(async (decoration) => {
        const itemData = await ctx.db
          .query("treeItems")
          .withIndex("by_itemId", (q) => q.eq("itemId", decoration.itemId))
          .first();

        return {
          ...decoration,
          itemData,
        };
      })
    );

    return {
      ...tree,
      enrichedDecorations,
    };
  },
});

export const updateTreeStage = mutation({
  args: {
    duoId: v.id("duoConnections"),
  },
  handler: async (ctx, { duoId }) => {
    const connection = await ctx.db.get(duoId);
    if (!connection) throw new Error("Connection not found");

    const currentTrust = connection.trust_score ?? 0;
    const currentStage = connection.treeState ?? "sprout";
    const { level } = getLevelData(currentTrust);
    const expectedStage = getTreeStageForLevel(level);

    if (expectedStage !== currentStage) {
      const tree = await ctx.db
        .query("trees")
        .withIndex("by_duoId", (q) => q.eq("duoId", duoId))
        .first();
      if (!tree) throw new Error("Tree not found");

      const today = new Date().toISOString().split("T")[0];
      const newLog = {
        [today]: {
          change: `Tree evolved to ${expectedStage} 🌳`,
        },
      };

      // Update duoConnections.treeState
      await ctx.db.patch(duoId, { treeState: expectedStage });
      // Update the tree document
      await ctx.db.patch(tree._id, {
        stage: expectedStage as Stage,
        growth_log: [...tree.growth_log, newLog],
      });

      return { updated: true, newStage: expectedStage };
    }

    return { updated: false };
  },
});

export const updateTreeDecorations = mutation({
  args: {
    duoId: v.id("duoConnections"),
    decoration: v.object({
      itemId: v.string(),
      position: v.object({
        x: v.number(),
        y: v.number(),
      }),
    }),
  },
  handler: async (ctx, { duoId, decoration }) => {
    // Find the tree for this duo
    const tree = await ctx.db
      .query("trees")
      .withIndex("by_duoId", (q) => q.eq("duoId", duoId))
      .first();
    if (!tree) {
      throw new Error("Tree not found for this duo");
    }

    // Verify the item exists and is active
    const itemData = await ctx.db
      .query("treeItems")
      .withIndex("by_itemId", (q) => q.eq("itemId", decoration.itemId))
      .first();
    if (!itemData || !itemData.isActive) {
      throw new Error("Invalid or inactive tree item");
    }

    // Check stage-based max
    const stage = tree.stage as Stage;
    const existingDecorations = tree.decorations || [];
    const maxAllowed = maxDecorationsForStage(stage);
    if (existingDecorations.length >= maxAllowed) {
      throw new Error(
        `You cannot place more than ${maxAllowed} decorations on a ${stage}`
      );
    }

    // Check inventory count
    const inventory = tree.inventory || {};
    const currentCount = inventory[decoration.itemId] || 0;
    if (currentCount <= 0) {
      throw new Error(`Not enough ${itemData.name} available in inventory`);
    }

    // Check for position overlap
    const isOccupied = existingDecorations.some(
      (dec) =>
        Math.abs(dec.position.x - decoration.position.x) < 20 &&
        Math.abs(dec.position.y - decoration.position.y) < 20
    );
    if (isOccupied) {
      throw new Error("This position is already occupied!");
    }

    // Create the new decoration
    const newDecoration = {
      ...decoration,
      equipped_at: Date.now(),
    };

    // Update tree with new decoration and reduced inventory
    const updatedDecorations = [...existingDecorations, newDecoration];
    const updatedInventory = {
      ...inventory,
      [decoration.itemId]: currentCount - 1,
    };

    await ctx.db.patch(tree._id, {
      decorations: updatedDecorations,
      inventory: updatedInventory,
    });

    return { success: true };
  },
});

export const removeTreeDecoration = mutation({
  args: {
    duoId: v.id("duoConnections"),
    decorationIndex: v.number(),
  },
  handler: async (ctx, { duoId, decorationIndex }) => {
    const tree = await ctx.db
      .query("trees")
      .withIndex("by_duoId", (q) => q.eq("duoId", duoId))
      .first();
    if (!tree) {
      throw new Error("Tree not found for this duo");
    }

    const decorations = tree.decorations || [];
    if (decorationIndex < 0 || decorationIndex >= decorations.length) {
      throw new Error("Invalid decoration index");
    }

    const removedDecoration = decorations[decorationIndex];
    const updatedDecorations = decorations.filter(
      (_, idx) => idx !== decorationIndex
    );

    // Return the item to inventory
    const inventory = tree.inventory || {};
    const currentCount = inventory[removedDecoration.itemId] || 0;
    const updatedInventory = {
      ...inventory,
      [removedDecoration.itemId]: currentCount + 1,
    };

    await ctx.db.patch(tree._id, {
      decorations: updatedDecorations,
      inventory: updatedInventory,
    });

    return { success: true };
  },
});

// NEW: Add item to tree inventory
export const addItemToInventory = mutation({
  args: {
    duoId: v.id("duoConnections"),
    itemId: v.string(),
    quantity: v.number(),
  },
  handler: async (ctx, { duoId, itemId, quantity }) => {
    const tree = await ctx.db
      .query("trees")
      .withIndex("by_duoId", (q) => q.eq("duoId", duoId))
      .first();
    if (!tree) {
      throw new Error("Tree not found for this duo");
    }

    // Verify the item exists
    const itemData = await ctx.db
      .query("treeItems")
      .withIndex("by_itemId", (q) => q.eq("itemId", itemId))
      .first();
    if (!itemData || !itemData.isActive) {
      throw new Error("Invalid or inactive tree item");
    }

    const inventory = tree.inventory || {};
    const currentCount = inventory[itemId] || 0;
    const newCount = Math.max(0, currentCount + quantity);

    const updatedInventory = {
      ...inventory,
      [itemId]: newCount,
    };

    await ctx.db.patch(tree._id, {
      inventory: updatedInventory,
    });

    // Log the change
    const today = new Date().toISOString().split("T")[0];
    const change =
      quantity > 0
        ? `Gained ${quantity}x ${itemData.name} 🎁`
        : `Used ${Math.abs(quantity)}x ${itemData.name} 💫`;

    const newLog = {
      [today]: { change },
    };

    await ctx.db.patch(tree._id, {
      growth_log: [...tree.growth_log, newLog],
    });

    return { success: true, newCount };
  },
});

// NEW: Calculate active buffs from equipped decorations
export const getActiveBuffs = query({
  args: { duoId: v.id("duoConnections") },
  handler: async (ctx, { duoId }) => {
    const tree = await ctx.db
      .query("trees")
      .withIndex("by_duoId", (q) => q.eq("duoId", duoId))
      .first();

    if (!tree || !tree.decorations) {
      return {
        xpMultiplier: 1,
        focusBonus: 0,
        dailyXpBonus: 0,
        streakProtection: false,
        activeItems: [],
      };
    }

    let totalXpMultiplier = 1;
    let totalFocusBonus = 0;
    let totalDailyXpBonus = 0;
    let hasStreakProtection = false;
    const activeItems = [];

    for (const decoration of tree.decorations) {
      const itemData = await ctx.db
        .query("treeItems")
        .withIndex("by_itemId", (q) => q.eq("itemId", decoration.itemId))
        .first();

      if (itemData && itemData.isActive) {
        const buffs = itemData.buffs;

        // Multiply XP multipliers (e.g., 2x * 1.5x = 3x)
        if (buffs.xpMultiplier) {
          totalXpMultiplier *= buffs.xpMultiplier;
        }

        // Add focus bonuses
        if (buffs.focusBonus) {
          totalFocusBonus += buffs.focusBonus;
        }

        // Add daily XP bonuses
        if (buffs.dailyXpBonus) {
          totalDailyXpBonus += buffs.dailyXpBonus;
        }

        // Check for streak protection
        if (buffs.streakProtection) {
          hasStreakProtection = true;
        }

        activeItems.push({
          itemId: decoration.itemId,
          name: itemData.name,
          buffs: itemData.buffs,
          equipped_at: decoration.equipped_at,
        });
      }
    }

    return {
      xpMultiplier: Math.round(totalXpMultiplier * 100) / 100, // Round to 2 decimal places
      focusBonus: totalFocusBonus,
      dailyXpBonus: totalDailyXpBonus,
      streakProtection: hasStreakProtection,
      activeItems,
    };
  },
});
