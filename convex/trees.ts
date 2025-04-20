import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getLevelData, getTreeStageForLevel } from "../src/utils/level";

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

      await ctx.db.patch(duoId, { treeState: expectedStage });
      await ctx.db.patch(tree._id, {
        stage: expectedStage as
          | "sprout"
          | "smallTree"
          | "mediumTree"
          | "grownTree",
        growth_log: [...tree.growth_log, newLog],
      });

      return { updated: true, newStage: expectedStage };
    }

    return { updated: false };
  },
});
