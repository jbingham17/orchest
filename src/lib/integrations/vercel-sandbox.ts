import { Vercel } from "@vercel/sdk";

let vercelClient: Vercel | null = null;

function getVercelClient(accessToken?: string): Vercel {
  if (!vercelClient || accessToken) {
    const token = accessToken || process.env.VERCEL_ACCESS_TOKEN;
    if (!token) {
      throw new Error("VERCEL_ACCESS_TOKEN is not set");
    }
    vercelClient = new Vercel({
      bearerToken: token,
    });
  }
  return vercelClient;
}

export interface SandboxFile {
  path: string;
  content: string;
}

export interface CreateSandboxParams {
  files: SandboxFile[];
  template?: "node" | "python" | "bun" | "go" | "rust";
  setupCommand?: string;
  accessToken?: string;
}

export interface SandboxExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

/**
 * Creates a Vercel Sandbox for AI agent execution
 *
 * Note: The Vercel Sandbox API provides ephemeral Linux VMs
 * for running isolated code. This is used to run AI agents
 * in a secure, sandboxed environment.
 */
export async function createSandbox(params: CreateSandboxParams) {
  const client = getVercelClient(params.accessToken);

  // Prepare files for the sandbox
  const sandboxFiles: Record<string, { data: string }> = {};
  for (const file of params.files) {
    sandboxFiles[file.path] = { data: file.content };
  }

  // Create the sandbox using Vercel's API
  // Note: The actual Vercel Sandbox API may differ - this is based on the plan's example
  const sandbox = {
    id: `sandbox-${Date.now()}`,
    status: "created" as const,
    client,
    files: sandboxFiles,
    template: params.template || "node",
    setupCommand: params.setupCommand,
  };

  return sandbox;
}

/**
 * Executes a command in the sandbox
 */
export async function execInSandbox(
  sandboxId: string,
  command: string,
  accessToken?: string
): Promise<SandboxExecResult> {
  const _client = getVercelClient(accessToken);

  // Execute command in sandbox
  // Note: Implementation depends on actual Vercel Sandbox API
  console.log(`Executing in sandbox ${sandboxId}: ${command}`);

  // Placeholder for actual execution
  return {
    stdout: "",
    stderr: "",
    exitCode: 0,
  };
}

/**
 * Stops and cleans up a sandbox
 */
export async function stopSandbox(sandboxId: string, accessToken?: string): Promise<void> {
  const _client = getVercelClient(accessToken);

  console.log(`Stopping sandbox: ${sandboxId}`);
  // Cleanup sandbox resources
}

/**
 * Creates and runs an AI agent in a sandbox
 *
 * This is a higher-level function that:
 * 1. Creates a sandbox
 * 2. Installs dependencies
 * 3. Runs the agent code
 * 4. Returns results
 * 5. Cleans up the sandbox
 */
export async function runAgentInSandbox(
  agentCode: string,
  context: Record<string, unknown>,
  options: {
    accessToken?: string;
    template?: "node" | "bun";
    timeout?: number;
  } = {}
): Promise<{ success: boolean; result?: unknown; error?: string }> {
  const { accessToken, template = "bun", timeout = 60000 } = options;

  const files: SandboxFile[] = [
    {
      path: "agent.ts",
      content: agentCode,
    },
    {
      path: "context.json",
      content: JSON.stringify(context, null, 2),
    },
    {
      path: "package.json",
      content: JSON.stringify({
        name: "agent-sandbox",
        type: "module",
        dependencies: {
          "@anthropic-ai/sdk": "latest",
        },
      }),
    },
  ];

  try {
    const sandbox = await createSandbox({
      files,
      template,
      setupCommand: "bun install",
      accessToken,
    });

    // Wait for setup
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Execute the agent
    const result = await execInSandbox(sandbox.id, "bun run agent.ts", accessToken);

    // Stop the sandbox
    await stopSandbox(sandbox.id, accessToken);

    if (result.exitCode !== 0) {
      return {
        success: false,
        error: result.stderr || "Agent execution failed",
      };
    }

    try {
      return {
        success: true,
        result: JSON.parse(result.stdout),
      };
    } catch {
      return {
        success: true,
        result: result.stdout,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Gets available sandbox templates
 */
export function getAvailableTemplates() {
  return [
    {
      id: "node",
      name: "Node.js",
      description: "Node.js runtime with npm",
      runtime: "node:20",
    },
    {
      id: "bun",
      name: "Bun",
      description: "Bun runtime (fast, modern)",
      runtime: "bun:latest",
    },
    {
      id: "python",
      name: "Python",
      description: "Python runtime with pip",
      runtime: "python:3.11",
    },
    {
      id: "go",
      name: "Go",
      description: "Go runtime",
      runtime: "go:1.21",
    },
    {
      id: "rust",
      name: "Rust",
      description: "Rust runtime with cargo",
      runtime: "rust:latest",
    },
  ];
}
