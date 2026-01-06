/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { FilterApi, FunctionReference } from "convex/server";

export declare const api: {
  users: {
    getByClerkId: FunctionReference<"query", "public", { clerkId: string }, any>;
    getCurrent: FunctionReference<"query", "public", Record<string, never>, any>;
    createOrUpdate: FunctionReference<
      "mutation",
      "public",
      { clerkId: string; email: string; name: string; imageUrl?: string },
      any
    >;
  };
  workspaces: {
    list: FunctionReference<"query", "public", Record<string, never>, any>;
    get: FunctionReference<"query", "public", { id: any }, any>;
    getBySlug: FunctionReference<"query", "public", { slug: string }, any>;
    create: FunctionReference<
      "mutation",
      "public",
      { name: string; description?: string },
      any
    >;
    update: FunctionReference<
      "mutation",
      "public",
      { id: any; name?: string; description?: string },
      any
    >;
    remove: FunctionReference<"mutation", "public", { id: any }, any>;
    getMembers: FunctionReference<"query", "public", { workspaceId: any }, any>;
  };
  workflows: {
    list: FunctionReference<"query", "public", { workspaceId: any }, any>;
    get: FunctionReference<"query", "public", { id: any }, any>;
    create: FunctionReference<
      "mutation",
      "public",
      { workspaceId: any; name: string; description?: string },
      any
    >;
    update: FunctionReference<
      "mutation",
      "public",
      {
        id: any;
        name?: string;
        description?: string;
        status?: "draft" | "active" | "paused";
        nodes?: any[];
        edges?: any[];
      },
      any
    >;
    remove: FunctionReference<"mutation", "public", { id: any }, any>;
    duplicate: FunctionReference<"mutation", "public", { id: any }, any>;
  };
  connections: {
    list: FunctionReference<"query", "public", { workspaceId: any }, any>;
    get: FunctionReference<
      "query",
      "public",
      { workspaceId: any; provider: "github" | "slack" | "vercel" },
      any
    >;
    create: FunctionReference<
      "mutation",
      "public",
      {
        workspaceId: any;
        provider: "github" | "slack" | "vercel";
        accessToken: string;
        refreshToken?: string;
        metadata?: any;
        expiresAt?: number;
      },
      any
    >;
    remove: FunctionReference<
      "mutation",
      "public",
      { workspaceId: any; provider: "github" | "slack" | "vercel" },
      any
    >;
    getAccessToken: FunctionReference<
      "query",
      "public",
      { workspaceId: any; provider: "github" | "slack" | "vercel" },
      any
    >;
  };
  executions: {
    list: FunctionReference<
      "query",
      "public",
      { workflowId?: any; limit?: number },
      any
    >;
    get: FunctionReference<"query", "public", { id: any }, any>;
    getWithResults: FunctionReference<"query", "public", { id: any }, any>;
    create: FunctionReference<
      "mutation",
      "public",
      {
        workflowId: any;
        deploymentId?: any;
        triggeredBy: string;
        triggerData?: any;
      },
      any
    >;
    updateStatus: FunctionReference<
      "mutation",
      "public",
      {
        id: any;
        status: "pending" | "running" | "completed" | "failed";
        error?: string;
      },
      any
    >;
    createNodeResult: FunctionReference<
      "mutation",
      "public",
      {
        executionId: any;
        nodeId: string;
        status: "pending" | "running" | "completed" | "failed" | "skipped";
        input?: any;
        output?: any;
        error?: string;
        logs?: string[];
      },
      any
    >;
    updateNodeResult: FunctionReference<
      "mutation",
      "public",
      {
        id: any;
        status?: "pending" | "running" | "completed" | "failed" | "skipped";
        output?: any;
        error?: string;
        logs?: string[];
      },
      any
    >;
    getNodeResults: FunctionReference<
      "query",
      "public",
      { executionId: any },
      any
    >;
  };
  deployments: {
    list: FunctionReference<
      "query",
      "public",
      { workflowId?: any; workspaceId?: any; limit?: number },
      any
    >;
    get: FunctionReference<"query", "public", { id: any }, any>;
    getLatest: FunctionReference<"query", "public", { workflowId: any }, any>;
    create: FunctionReference<
      "mutation",
      "public",
      {
        workflowId: any;
        workspaceId: any;
        version: number;
        generatedCode?: string;
        githubRepo?: string;
        githubBranch?: string;
      },
      any
    >;
    updateStatus: FunctionReference<
      "mutation",
      "public",
      {
        id: any;
        status: "pending" | "deploying" | "deployed" | "failed";
        commitSha?: string;
        deployUrl?: string;
        error?: string;
      },
      any
    >;
    updateGeneratedCode: FunctionReference<
      "mutation",
      "public",
      { id: any; generatedCode: string },
      any
    >;
  };
};
