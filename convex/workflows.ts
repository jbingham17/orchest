import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workflows")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("workflows") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    return await ctx.db.insert("workflows", {
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      status: "draft",
      nodes: [],
      edges: [],
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("workflows"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal("draft"), v.literal("active"), v.literal("paused"))
    ),
    nodes: v.optional(
      v.array(
        v.object({
          id: v.string(),
          type: v.string(),
          position: v.object({ x: v.number(), y: v.number() }),
          data: v.any(),
        })
      )
    ),
    edges: v.optional(
      v.array(
        v.object({
          id: v.string(),
          source: v.string(),
          target: v.string(),
          sourceHandle: v.optional(v.string()),
          targetHandle: v.optional(v.string()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const workflow = await ctx.db.get(args.id);
    if (!workflow) {
      throw new Error("Workflow not found");
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.status !== undefined) updates.status = args.status;
    if (args.nodes !== undefined) updates.nodes = args.nodes;
    if (args.edges !== undefined) updates.edges = args.edges;

    // Increment version if nodes or edges changed
    if (args.nodes !== undefined || args.edges !== undefined) {
      updates.version = workflow.version + 1;
    }

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

export const remove = mutation({
  args: { id: v.id("workflows") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Delete related executions
    const executions = await ctx.db
      .query("executions")
      .withIndex("by_workflow", (q) => q.eq("workflowId", args.id))
      .collect();

    for (const execution of executions) {
      const nodeResults = await ctx.db
        .query("nodeResults")
        .withIndex("by_execution", (q) => q.eq("executionId", execution._id))
        .collect();

      for (const result of nodeResults) {
        await ctx.db.delete(result._id);
      }

      await ctx.db.delete(execution._id);
    }

    // Delete related deployments
    const deployments = await ctx.db
      .query("deployments")
      .withIndex("by_workflow", (q) => q.eq("workflowId", args.id))
      .collect();

    for (const deployment of deployments) {
      await ctx.db.delete(deployment._id);
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const duplicate = mutation({
  args: { id: v.id("workflows") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const workflow = await ctx.db.get(args.id);
    if (!workflow) {
      throw new Error("Workflow not found");
    }

    return await ctx.db.insert("workflows", {
      workspaceId: workflow.workspaceId,
      name: `${workflow.name} (Copy)`,
      description: workflow.description,
      status: "draft",
      nodes: workflow.nodes,
      edges: workflow.edges,
      version: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
