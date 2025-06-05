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
      type: v.union(v.literal("leaf"), v.literal("fruit")),
      position: v.object({
        x: v.number(),
        y: v.number(),
      }),
      buff: v.optional(
        v.object({
          xpMultiplier: v.number(),
        })
      ),
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

    // Check stage-based max
    const stage = tree.stage as Stage;
    const existingDecorations = tree.decorations || [];
    const maxAllowed = maxDecorationsForStage(stage);
    if (existingDecorations.length >= maxAllowed) {
      throw new Error(
        `You cannot place more than ${maxAllowed} decorations on a ${stage}`
      );
    }

    // Check if user has enough inventory of that type
    if (decoration.type === "leaf" && tree.leaves <= 0) {
      throw new Error("Not enough leaves available");
    }
    if (decoration.type === "fruit" && tree.fruits <= 0) {
      throw new Error("Not enough fruits available");
    }

    // Make sure no slot overlap (same logic as before)
    const isOccupied = existingDecorations.some(
      (dec) =>
        Math.abs(dec.position.x - decoration.position.x) < 20 &&
        Math.abs(dec.position.y - decoration.position.y) < 20
    );
    if (isOccupied) {
      throw new Error("Dieser Platz ist bereits belegt!");
    }

    // Insert new decoration
    const updatedDecorations = [...existingDecorations, decoration];

    // Adjust inventory counts
    const newLeaves =
      decoration.type === "leaf" ? tree.leaves - 1 : tree.leaves;
    const newFruits =
      decoration.type === "fruit" ? tree.fruits - 1 : tree.fruits;

    await ctx.db.patch(tree._id, {
      decorations: updatedDecorations,
      leaves: newLeaves,
      fruits: newFruits,
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
    const newLeaves =
      removedDecoration.type === "leaf" ? tree.leaves + 1 : tree.leaves;
    const newFruits =
      removedDecoration.type === "fruit" ? tree.fruits + 1 : tree.fruits;

    await ctx.db.patch(tree._id, {
      decorations: updatedDecorations,
      leaves: newLeaves,
      fruits: newFruits,
    });

    return { success: true };
  },
});
