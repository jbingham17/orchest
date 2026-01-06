import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    workflowId: v.optional(v.id("workflows")),
    workspaceId: v.optional(v.id("workspaces")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { workflowId, workspaceId, limit } = args;

    if (workflowId) {
      return await ctx.db
        .query("deployments")
        .withIndex("by_workflow", (q) => q.eq("workflowId", workflowId))
        .order("desc")
        .take(limit ?? 50);
    }

    if (workspaceId) {
      return await ctx.db
        .query("deployments")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
        .order("desc")
        .take(limit ?? 50);
    }

    return await ctx.db
      .query("deployments")
      .order("desc")
      .take(limit ?? 50);
  },
});

export const get = query({
  args: { id: v.id("deployments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getLatest = query({
  args: { workflowId: v.id("workflows") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("deployments")
      .withIndex("by_workflow", (q) => q.eq("workflowId", args.workflowId))
      .order("desc")
      .first();
  },
});

export const create = mutation({
  args: {
    workflowId: v.id("workflows"),
    workspaceId: v.id("workspaces"),
    version: v.number(),
    generatedCode: v.optional(v.string()),
    githubRepo: v.optional(v.string()),
    githubBranch: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    return await ctx.db.insert("deployments", {
      workflowId: args.workflowId,
      workspaceId: args.workspaceId,
      version: args.version,
      status: "pending",
      generatedCode: args.generatedCode,
      githubRepo: args.githubRepo,
      githubBranch: args.githubBranch,
      createdAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("deployments"),
    status: v.union(
      v.literal("pending"),
      v.literal("deploying"),
      v.literal("deployed"),
      v.literal("failed")
    ),
    commitSha: v.optional(v.string()),
    deployUrl: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = {
      status: args.status,
    };

    if (args.commitSha !== undefined) updates.commitSha = args.commitSha;
    if (args.deployUrl !== undefined) updates.deployUrl = args.deployUrl;
    if (args.error !== undefined) updates.error = args.error;

    if (args.status === "deployed") {
      updates.deployedAt = Date.now();
    }

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

export const updateGeneratedCode = mutation({
  args: {
    id: v.id("deployments"),
    generatedCode: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      generatedCode: args.generatedCode,
    });
    return args.id;
  },
});
