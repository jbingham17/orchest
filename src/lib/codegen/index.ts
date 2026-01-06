interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

interface Workflow {
  _id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  version: number;
}

interface GeneratedFile {
  path: string;
  content: string;
}

interface GeneratedCode {
  files: GeneratedFile[];
}

export function generateWorkflowCode(workflow: Workflow): GeneratedCode {
  const files: GeneratedFile[] = [];

  // Find trigger nodes
  const triggerNodes = workflow.nodes.filter((n) => n.type === "trigger");
  const actionNodes = workflow.nodes.filter((n) => n.type === "action");
  const agentNodes = workflow.nodes.filter((n) => n.type === "agent");

  // Generate webhook handler
  if (triggerNodes.length > 0) {
    files.push(generateWebhookHandler(workflow, triggerNodes));
  }

  // Generate workflow orchestrator
  files.push(generateWorkflowOrchestrator(workflow));

  // Generate agent code if there are agent nodes
  for (const agent of agentNodes) {
    files.push(generateAgentCode(agent));
  }

  // Generate helper utilities
  files.push(generateUtils());

  return { files };
}

function generateWebhookHandler(
  workflow: Workflow,
  triggerNodes: WorkflowNode[]
): GeneratedFile {
  const webhookCode = `import { NextRequest, NextResponse } from 'next/server';
import { verifyGitHubWebhook, verifySlackRequest } from '@/lib/utils';
import { run${toPascalCase(workflow.name)}Workflow } from '@/lib/workflows/${toKebabCase(workflow.name)}';

export async function POST(req: NextRequest) {
  const payload = await req.json();

  // GitHub webhook
  const githubSignature = req.headers.get('x-hub-signature-256');
  if (githubSignature) {
    if (!verifyGitHubWebhook(payload, githubSignature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    ${generateGitHubHandlers(triggerNodes)}
  }

  // Slack webhook
  const slackSignature = req.headers.get('x-slack-signature');
  if (slackSignature) {
    const timestamp = req.headers.get('x-slack-request-timestamp');
    if (!verifySlackRequest(payload, slackSignature, timestamp)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    ${generateSlackHandlers(triggerNodes)}
  }

  return NextResponse.json({ ok: true });
}
`;

  return {
    path: `api/webhooks/${toKebabCase(workflow.name)}/route.ts`,
    content: webhookCode,
  };
}

function generateWorkflowOrchestrator(workflow: Workflow): GeneratedFile {
  const workflowCode = `import { Sandbox } from '@vercel/sdk';
import { postSlackMessage } from '@/lib/integrations/slack';
import { createGitHubComment, createPullRequest } from '@/lib/integrations/github';

interface WorkflowContext {
  trigger: {
    type: string;
    data: Record<string, unknown>;
  };
  results: Record<string, unknown>;
}

export async function run${toPascalCase(workflow.name)}Workflow(triggerData: Record<string, unknown>) {
  const context: WorkflowContext = {
    trigger: {
      type: 'webhook',
      data: triggerData,
    },
    results: {},
  };

  try {
    ${generateNodeExecutions(workflow)}

    return { success: true, results: context.results };
  } catch (error) {
    console.error('Workflow execution failed:', error);
    return { success: false, error: String(error) };
  }
}

${generateNodeFunctions(workflow)}
`;

  return {
    path: `lib/workflows/${toKebabCase(workflow.name)}.ts`,
    content: workflowCode,
  };
}

function generateAgentCode(agentNode: WorkflowNode): GeneratedFile {
  const agentType = agentNode.data.agent as string;

  const agentTemplates: Record<string, string> = {
    code_review: `import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';

const context = JSON.parse(readFileSync('context.json', 'utf-8'));
const anthropic = new Anthropic();

async function main() {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: \`Review this code and provide:
1. A brief summary (2-3 sentences)
2. Key issues found (if any)
3. Suggestions for improvement

Context:
\${JSON.stringify(context, null, 2)}\`
    }]
  });

  const review = response.content[0].type === 'text' ? response.content[0].text : '';
  console.log(JSON.stringify({
    summary: extractSection(review, 'summary'),
    issues: extractSection(review, 'issues'),
    suggestions: extractSection(review, 'suggestions'),
    raw: review
  }));
}

function extractSection(text: string, section: string): string {
  // Simple extraction - in production, use more robust parsing
  return text;
}

main();`,
    pr_description: `import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';

const context = JSON.parse(readFileSync('context.json', 'utf-8'));
const anthropic = new Anthropic();

async function main() {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: \`Generate a pull request description for:

Title: \${context.title}
Changes: \${context.changes}

Include:
1. Summary of changes
2. Why these changes were made
3. Any breaking changes
4. Testing instructions\`
    }]
  });

  const description = response.content[0].type === 'text' ? response.content[0].text : '';
  console.log(JSON.stringify({ description }));
}

main();`,
    documentation: `import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';

const context = JSON.parse(readFileSync('context.json', 'utf-8'));
const anthropic = new Anthropic();

async function main() {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: \`Generate documentation for:

\${JSON.stringify(context, null, 2)}

Include:
1. Overview
2. Usage examples
3. API reference (if applicable)\`
    }]
  });

  const docs = response.content[0].type === 'text' ? response.content[0].text : '';
  console.log(JSON.stringify({ documentation: docs }));
}

main();`,
  };

  return {
    path: `lib/agents/${toKebabCase(agentType)}.ts`,
    content: agentTemplates[agentType] || agentTemplates.code_review,
  };
}

function generateUtils(): GeneratedFile {
  return {
    path: "lib/utils.ts",
    content: `import crypto from 'crypto';

export function verifyGitHubWebhook(payload: unknown, signature: string): boolean {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) return false;

  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(JSON.stringify(payload)).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export function verifySlackRequest(
  payload: unknown,
  signature: string,
  timestamp: string | null
): boolean {
  const secret = process.env.SLACK_SIGNING_SECRET;
  if (!secret || !timestamp) return false;

  const sigBaseString = \`v0:\${timestamp}:\${JSON.stringify(payload)}\`;
  const mySignature = 'v0=' + crypto
    .createHmac('sha256', secret)
    .update(sigBaseString)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(mySignature), Buffer.from(signature));
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
`,
  };
}

function generateGitHubHandlers(triggerNodes: WorkflowNode[]): string {
  const githubTriggers = triggerNodes.filter(
    (n) => n.data.provider === "github"
  );

  if (githubTriggers.length === 0) return "// No GitHub triggers";

  return githubTriggers
    .map((trigger) => {
      const event = trigger.data.event as string;
      switch (event) {
        case "pull_request":
          return `if (payload.action === 'opened' && payload.pull_request) {
      await run${toPascalCase(trigger.data.label as string)}Workflow(payload);
    }`;
        case "push":
          return `if (payload.ref && payload.commits) {
      await run${toPascalCase(trigger.data.label as string)}Workflow(payload);
    }`;
        default:
          return `// Handle ${event} event`;
      }
    })
    .join("\n    ");
}

function generateSlackHandlers(triggerNodes: WorkflowNode[]): string {
  const slackTriggers = triggerNodes.filter(
    (n) => n.data.provider === "slack"
  );

  if (slackTriggers.length === 0) return "// No Slack triggers";

  return slackTriggers
    .map((trigger) => {
      return `if (payload.event?.type === 'message') {
      await run${toPascalCase(trigger.data.label as string)}Workflow(payload);
    }`;
    })
    .join("\n    ");
}

function generateNodeExecutions(workflow: Workflow): string {
  // Build execution order from edges
  const nodeMap = new Map(workflow.nodes.map((n) => [n.id, n]));
  const execOrder = topologicalSort(workflow.nodes, workflow.edges);

  return execOrder
    .filter((nodeId) => {
      const node = nodeMap.get(nodeId);
      return node && node.type !== "trigger";
    })
    .map((nodeId) => {
      const node = nodeMap.get(nodeId)!;
      return `context.results['${node.id}'] = await execute${toPascalCase(node.data.label as string || node.type)}(context);`;
    })
    .join("\n    ");
}

function generateNodeFunctions(workflow: Workflow): string {
  return workflow.nodes
    .filter((n) => n.type !== "trigger")
    .map((node) => {
      const funcName = `execute${toPascalCase(node.data.label as string || node.type)}`;

      switch (node.type) {
        case "action":
          return generateActionFunction(node, funcName);
        case "agent":
          return generateAgentFunction(node, funcName);
        case "logic":
          return generateLogicFunction(node, funcName);
        default:
          return `async function ${funcName}(context: WorkflowContext) {
  // TODO: Implement ${node.type} node
  return {};
}`;
      }
    })
    .join("\n\n");
}

function generateActionFunction(node: WorkflowNode, funcName: string): string {
  const action = node.data.action as string;

  switch (action) {
    case "create_pr":
      return `async function ${funcName}(context: WorkflowContext) {
  const result = await createPullRequest({
    owner: context.trigger.data.repository?.owner?.login,
    repo: context.trigger.data.repository?.name,
    title: 'Automated PR',
    body: 'Created by Orchest workflow',
    head: 'feature-branch',
    base: 'main',
  });
  return result;
}`;
    case "comment_pr":
      return `async function ${funcName}(context: WorkflowContext) {
  const result = await createGitHubComment({
    owner: context.trigger.data.repository?.owner?.login,
    repo: context.trigger.data.repository?.name,
    issue_number: context.trigger.data.pull_request?.number,
    body: 'Automated comment from Orchest',
  });
  return result;
}`;
    case "post_message":
      return `async function ${funcName}(context: WorkflowContext) {
  const result = await postSlackMessage({
    channel: process.env.SLACK_CHANNEL_ID!,
    text: 'Workflow notification from Orchest',
  });
  return result;
}`;
    default:
      return `async function ${funcName}(context: WorkflowContext) {
  // TODO: Implement ${action} action
  return {};
}`;
  }
}

function generateAgentFunction(node: WorkflowNode, funcName: string): string {
  const agentType = node.data.agent as string;

  return `async function ${funcName}(context: WorkflowContext) {
  const sandbox = await Sandbox.create({
    template: 'node',
    files: {
      'agent.ts': { data: await import('@/lib/agents/${toKebabCase(agentType)}').then(m => m.default) },
      'context.json': { data: JSON.stringify(context.trigger.data) },
      'package.json': { data: JSON.stringify({
        dependencies: { '@anthropic-ai/sdk': 'latest' }
      })}
    },
    setupCommand: 'bun install'
  });

  try {
    const result = await sandbox.exec('bun run agent.ts');
    return JSON.parse(result.stdout);
  } finally {
    await sandbox.stop();
  }
}`;
}

function generateLogicFunction(node: WorkflowNode, funcName: string): string {
  const logicType = node.data.logic as string;

  switch (logicType) {
    case "condition":
      return `async function ${funcName}(context: WorkflowContext) {
  // TODO: Implement condition logic
  // Return { passed: true/false, data: ... }
  return { passed: true };
}`;
    case "loop":
      return `async function ${funcName}(context: WorkflowContext) {
  // TODO: Implement loop logic
  // Return array of results
  return [];
}`;
    default:
      return `async function ${funcName}(context: WorkflowContext) {
  return {};
}`;
  }
}

function topologicalSort(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): string[] {
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  nodes.forEach((n) => {
    inDegree.set(n.id, 0);
    adjacency.set(n.id, []);
  });

  edges.forEach((e) => {
    adjacency.get(e.source)?.push(e.target);
    inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
  });

  const queue = nodes.filter((n) => inDegree.get(n.id) === 0).map((n) => n.id);
  const result: string[] = [];

  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node);

    for (const neighbor of adjacency.get(node) || []) {
      inDegree.set(neighbor, (inDegree.get(neighbor) || 0) - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    }
  }

  return result;
}

function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

function toKebabCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/^-+|-+$/g, "");
}
