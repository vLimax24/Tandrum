import { query } from "./_generated/server";
import { v } from "convex/values";

export const getTreeForDuo = query({
  args: { duoId: v.id("duoConnections") },
  handler: async (ctx, { duoId }) => {
    return await ctx.db
      .query("trees")
      .withIndex("by_duoId", (q) => q.eq("duoId", duoId))
      .first();
  },
});
