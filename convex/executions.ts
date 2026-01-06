import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    workflowId: v.optional(v.id("workflows")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { workflowId, limit } = args;

    if (workflowId) {
      return await ctx.db
        .query("executions")
        .withIndex("by_workflow", (q) => q.eq("workflowId", workflowId))
        .order("desc")
        .take(limit ?? 50);
    }

    return await ctx.db
      .query("executions")
      .order("desc")
      .take(limit ?? 50);
  },
});

export const get = query({
  args: { id: v.id("executions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getWithResults = query({
  args: { id: v.id("executions") },
  handler: async (ctx, args) => {
    const execution = await ctx.db.get(args.id);
    if (!execution) {
      return null;
    }

    const nodeResults = await ctx.db
      .query("nodeResults")
      .withIndex("by_execution", (q) => q.eq("executionId", args.id))
      .collect();

    return {
      ...execution,
      nodeResults,
    };
  },
});

export const create = mutation({
  args: {
    workflowId: v.id("workflows"),
    deploymentId: v.optional(v.id("deployments")),
    triggeredBy: v.string(),
    triggerData: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("executions", {
      workflowId: args.workflowId,
      deploymentId: args.deploymentId,
      status: "pending",
      triggeredBy: args.triggeredBy,
      triggerData: args.triggerData,
      startedAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("executions"),
    status: v.union(
      v.literal("pending"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed")
    ),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = {
      status: args.status,
    };

    if (args.error !== undefined) {
      updates.error = args.error;
    }

    if (args.status === "completed" || args.status === "failed") {
      updates.completedAt = Date.now();
    }

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

export const createNodeResult = mutation({
  args: {
    executionId: v.id("executions"),
    nodeId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("skipped")
    ),
    input: v.optional(v.any()),
    output: v.optional(v.any()),
    error: v.optional(v.string()),
    logs: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("nodeResults", {
      executionId: args.executionId,
      nodeId: args.nodeId,
      status: args.status,
      input: args.input,
      output: args.output,
      error: args.error,
      logs: args.logs,
      startedAt: args.status === "running" ? Date.now() : undefined,
      completedAt:
        args.status === "completed" || args.status === "failed"
          ? Date.now()
          : undefined,
    });
  },
});

export const updateNodeResult = mutation({
  args: {
    id: v.id("nodeResults"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("running"),
        v.literal("completed"),
        v.literal("failed"),
        v.literal("skipped")
      )
    ),
    output: v.optional(v.any()),
    error: v.optional(v.string()),
    logs: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = {};

    if (args.status !== undefined) {
      updates.status = args.status;
      if (args.status === "running") {
        updates.startedAt = Date.now();
      }
      if (args.status === "completed" || args.status === "failed") {
        updates.completedAt = Date.now();
      }
    }

    if (args.output !== undefined) updates.output = args.output;
    if (args.error !== undefined) updates.error = args.error;
    if (args.logs !== undefined) updates.logs = args.logs;

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

export const getNodeResults = query({
  args: { executionId: v.id("executions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("nodeResults")
      .withIndex("by_execution", (q) => q.eq("executionId", args.executionId))
      .collect();
  },
});
