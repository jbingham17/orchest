// Shared types for the application
// These will be replaced by Convex generated types when convex dev runs

export interface User {
  _id: string;
  _creationTime: number;
  email: string;
  name: string;
  clerkId: string;
  imageUrl?: string;
}

export interface Workspace {
  _id: string;
  _creationTime: number;
  name: string;
  slug: string;
  ownerId: string;
  description?: string;
  createdAt: number;
  role?: "owner" | "admin" | "member";
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface Workflow {
  _id: string;
  _creationTime: number;
  workspaceId: string;
  name: string;
  description?: string;
  status: "draft" | "active" | "paused";
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  version: number;
  createdAt: number;
  updatedAt: number;
}

export interface Connection {
  _id: string;
  _creationTime: number;
  workspaceId: string;
  provider: "github" | "slack" | "vercel";
  metadata?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
  isConnected: boolean;
  expiresAt?: number;
}

export interface Execution {
  _id: string;
  _creationTime: number;
  workflowId: string;
  deploymentId?: string;
  status: "pending" | "running" | "completed" | "failed";
  triggeredBy: string;
  triggerData?: Record<string, unknown>;
  startedAt: number;
  completedAt?: number;
  error?: string;
}

export interface NodeResult {
  _id: string;
  _creationTime: number;
  executionId: string;
  nodeId: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  input?: unknown;
  output?: unknown;
  error?: string;
  logs?: string[];
  startedAt?: number;
  completedAt?: number;
}

export interface Deployment {
  _id: string;
  _creationTime: number;
  workflowId: string;
  workspaceId: string;
  version: number;
  status: "pending" | "deploying" | "deployed" | "failed";
  generatedCode?: string;
  githubRepo?: string;
  githubBranch?: string;
  commitSha?: string;
  deployUrl?: string;
  error?: string;
  deployedAt?: number;
  createdAt: number;
}
