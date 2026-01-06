import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const connections = await ctx.db
      .query("connections")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    // Return connections without exposing tokens
    return connections.map((conn) => ({
      _id: conn._id,
      _creationTime: conn._creationTime,
      workspaceId: conn.workspaceId,
      provider: conn.provider,
      metadata: conn.metadata,
      createdAt: conn.createdAt,
      updatedAt: conn.updatedAt,
      isConnected: Boolean(conn.accessToken),
      expiresAt: conn.expiresAt,
    }));
  },
});

export const get = query({
  args: {
    workspaceId: v.id("workspaces"),
    provider: v.union(
      v.literal("github"),
      v.literal("slack"),
      v.literal("vercel")
    ),
  },
  handler: async (ctx, args) => {
    const connection = await ctx.db
      .query("connections")
      .withIndex("by_workspace_provider", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("provider", args.provider)
      )
      .unique();

    if (!connection) {
      return null;
    }

    return {
      _id: connection._id,
      _creationTime: connection._creationTime,
      workspaceId: connection.workspaceId,
      provider: connection.provider,
      metadata: connection.metadata,
      createdAt: connection.createdAt,
      updatedAt: connection.updatedAt,
      isConnected: Boolean(connection.accessToken),
      expiresAt: connection.expiresAt,
    };
  },
});

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    provider: v.union(
      v.literal("github"),
      v.literal("slack"),
      v.literal("vercel")
    ),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    metadata: v.optional(v.any()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Check if connection already exists
    const existing = await ctx.db
      .query("connections")
      .withIndex("by_workspace_provider", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("provider", args.provider)
      )
      .unique();

    if (existing) {
      // Update existing connection
      await ctx.db.patch(existing._id, {
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
        metadata: args.metadata,
        expiresAt: args.expiresAt,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("connections", {
      workspaceId: args.workspaceId,
      provider: args.provider,
      accessToken: args.accessToken,
      refreshToken: args.refreshToken,
      metadata: args.metadata,
      expiresAt: args.expiresAt,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    provider: v.union(
      v.literal("github"),
      v.literal("slack"),
      v.literal("vercel")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const connection = await ctx.db
      .query("connections")
      .withIndex("by_workspace_provider", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("provider", args.provider)
      )
      .unique();

    if (connection) {
      await ctx.db.delete(connection._id);
    }

    return args.provider;
  },
});

// Internal query to get access token (for server-side actions)
export const getAccessToken = query({
  args: {
    workspaceId: v.id("workspaces"),
    provider: v.union(
      v.literal("github"),
      v.literal("slack"),
      v.literal("vercel")
    ),
  },
  handler: async (ctx, args) => {
    const connection = await ctx.db
      .query("connections")
      .withIndex("by_workspace_provider", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("provider", args.provider)
      )
      .unique();

    if (!connection) {
      return null;
    }

    return {
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
      expiresAt: connection.expiresAt,
    };
  },
});
