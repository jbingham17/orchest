# Orchest - SDLC Automation Platform

## Overview

Orchest is a workflow orchestration platform for automating Software Development Lifecycle (SDLC) tasks using AI agents. It provides a visual workflow builder that **generates real, deployable TypeScript code** from your workflow definitions.

### Key Concept: Code Generation

Unlike traditional workflow tools that interpret workflows at runtime, Orchest generates actual TypeScript code that:

1. **Accepts webhooks** - Generated API routes handle incoming events from GitHub, Slack, and Vercel
2. **Spins up Vercel Sandboxes** - Uses `@vercel/sdk` to create ephemeral Linux VMs for AI agent execution
3. **Pushes to GitHub** - Commits generated code and workflow outputs back to repositories

This approach provides full transparency, version control, and the ability to customize generated code.

---

## Core Integrations

### 1. GitHub
- Repository webhooks (push, PR, issues, reviews)
- PR creation and management
- Code review automation
- Branch management
- GitHub Actions triggering

### 2. Slack
- Message notifications
- Interactive commands
- Thread-based conversations
- Channel management
- Approval workflows

### 3. Vercel Sandbox (`@vercel/sdk`)
- **Ephemeral Linux VMs** for AI agent execution
- Isolated, secure code execution environment
- Supports Node.js, Python, Bun, Go, Rust
- File system access and package installation
- Real-time logs and execution monitoring

```typescript
// Example: Spinning up a sandbox for AI agent
import { Sandbox } from '@vercel/sdk';

const sandbox = await Sandbox.create({
  template: 'node',
  files: {
    'agent.ts': { data: agentCode },
    'package.json': { data: JSON.stringify({ dependencies: { /* ... */ } }) }
  },
  setupCommand: 'bun install'
});

// Execute and get results
const result = await sandbox.exec('bun run agent.ts');
await sandbox.stop();
```

---

## Architecture

### Code Generation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    WORKFLOW BUILDER (UI)                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  User designs workflow in React Flow canvas               │  │
│  │  - Drag/drop nodes (triggers, actions, agents)            │  │
│  │  - Configure node parameters                              │  │
│  │  - Connect nodes with edges                               │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ "Deploy Workflow"
┌─────────────────────────────────────────────────────────────────┐
│                    CODE GENERATOR                                │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Transforms workflow DAG → TypeScript code                │  │
│  │  - Webhook handlers (API routes)                          │  │
│  │  - Sandbox orchestration logic                            │  │
│  │  - GitHub API integration                                 │  │
│  │  - Slack notification code                                │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ Push to GitHub
┌─────────────────────────────────────────────────────────────────┐
│                    GENERATED PROJECT                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  /api/webhooks/github.ts    ← Receives GitHub events      │  │
│  │  /api/webhooks/slack.ts     ← Receives Slack events       │  │
│  │  /lib/workflows/[name].ts   ← Workflow execution logic    │  │
│  │  /lib/agents/[name].ts      ← AI agent code               │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ Auto-deploys via Vercel
┌─────────────────────────────────────────────────────────────────┐
│                    RUNTIME EXECUTION                             │
│                                                                  │
│   GitHub Event ──► Webhook Handler ──► Spin up Sandbox ──►      │
│                                              │                   │
│                         ┌────────────────────┘                   │
│                         ▼                                        │
│              ┌─────────────────────┐                             │
│              │   Vercel Sandbox    │                             │
│              │  (Ephemeral VM)     │                             │
│              │  - Run AI Agent     │                             │
│              │  - Process code     │                             │
│              │  - Return results   │                             │
│              └─────────────────────┘                             │
│                         │                                        │
│                         ▼                                        │
│   ◄── Push to GitHub ◄── Post to Slack ◄── Update Convex        │
└─────────────────────────────────────────────────────────────────┘
```

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                     Vercel (Frontend)                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Next.js App                             │  │
│  │  - Workflow Builder UI (React Flow)                        │  │
│  │  - Code Generator Engine                                   │  │
│  │  - Dashboard & Settings                                    │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Convex (Backend)                             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Database          │  Real-time subscriptions              │  │
│  │  - Workflows       │  - Live execution status              │  │
│  │  - Executions      │  - Workflow updates                   │  │
│  │  - Connections     │                                       │  │
│  │  - Generated Code  │                                       │  │
│  ├────────────────────┼───────────────────────────────────────┤  │
│  │  Actions                                                   │  │
│  │  - Push to GitHub (generated code)                         │  │
│  │  - Manage Vercel Sandboxes                                 │  │
│  │  - Send Slack notifications                                │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   External Services                              │
│        ┌────────┐     ┌────────┐     ┌────────┐                 │
│        │ GitHub │     │ Slack  │     │ Vercel │                 │
│        │  API   │     │  API   │     │Sandbox │                 │
│        └────────┘     └────────┘     └────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
- **Runtime**: Bun (JavaScript runtime & package manager)
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18+
- **Styling**: Tailwind CSS
- **Workflow Canvas**: React Flow
- **State Management**: Convex React hooks (real-time)
- **Hosting**: Vercel

### Backend
- **Platform**: Convex
  - Database (document-based, real-time)
  - API layer (queries, mutations, actions)
  - Scheduled functions (cron, delayed execution)
  - File storage (logs, artifacts)
- **Auth**: Convex Auth / Clerk

### Why Convex?
- **Unified backend**: Database + API + real-time in one
- **Real-time by default**: Perfect for live workflow execution status
- **Scheduled functions**: Built-in support for delayed steps
- **TypeScript-native**: End-to-end type safety
- **Serverless**: No infrastructure to manage
- **Actions**: Can call external APIs (GitHub, Slack, etc.)

---

## Core Features

### 1. Workflow Builder UI
- Drag-and-drop node canvas (React Flow)
- Node types:
  - **Triggers**: GitHub Webhook, Slack Event, Vercel Deploy, Manual
  - **Actions**: GitHub (create PR, comment, label), Slack (post message)
  - **Logic**: Conditional, Filter, Transform
  - **AI Agents**: Code Review, PR Description, Documentation
- Connection lines with data mapping
- Live preview of generated code
- "Deploy" button to generate and push code

### 2. Code Generation Engine
- Transforms workflow DAG into TypeScript code
- Generates:
  - **Webhook handlers** - Next.js API routes for GitHub/Slack events
  - **Workflow orchestrators** - Functions that execute the workflow steps
  - **Sandbox runners** - Code that spins up Vercel Sandboxes for AI agents
  - **Integration clients** - GitHub API calls, Slack messaging
- Pushes generated code to user's GitHub repository
- Auto-deploys via Vercel (connected repo)

### 3. AI Agent System
- Pre-built agent templates:
  - Code Review Agent
  - PR Description Generator
  - Documentation Generator
- Custom agent creation (write your own)
- Agents run in **Vercel Sandbox** (ephemeral Linux VMs)
- Agent code is part of generated output

### 4. Integration Management
- OAuth connection flows for GitHub, Slack, Vercel
- Credential storage in Convex (encrypted)
- Connection health monitoring
- Automatic webhook registration on deploy

### 5. Monitoring & Observability
- Workflow execution dashboard (real-time via Convex)
- Generated code version history
- Sandbox execution logs
- Error tracking and alerting

---

## Convex Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    clerkId: v.string(),
  }).index("by_clerk_id", ["clerkId"]),

  workspaces: defineTable({
    name: v.string(),
    ownerId: v.id("users"),
  }),

  workspaceMembers: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
  }).index("by_workspace", ["workspaceId"]),

  connections: defineTable({
    workspaceId: v.id("workspaces"),
    provider: v.union(
      v.literal("github"),
      v.literal("slack"),
      v.literal("vercel")
    ),
    accessToken: v.string(), // encrypted
    refreshToken: v.optional(v.string()),
    metadata: v.optional(v.any()),
    expiresAt: v.optional(v.number()),
  }).index("by_workspace_provider", ["workspaceId", "provider"]),

  workflows: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("paused")),
    nodes: v.array(v.object({
      id: v.string(),
      type: v.string(),
      position: v.object({ x: v.number(), y: v.number() }),
      data: v.any(),
    })),
    edges: v.array(v.object({
      id: v.string(),
      source: v.string(),
      target: v.string(),
      sourceHandle: v.optional(v.string()),
      targetHandle: v.optional(v.string()),
    })),
    version: v.number(),
  }).index("by_workspace", ["workspaceId"]),

  executions: defineTable({
    workflowId: v.id("workflows"),
    status: v.union(
      v.literal("pending"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed")
    ),
    triggeredBy: v.string(),
    triggerData: v.optional(v.any()),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    error: v.optional(v.string()),
  }).index("by_workflow", ["workflowId"]),

  nodeResults: defineTable({
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
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  }).index("by_execution", ["executionId"]),
});
```

---

## Example: Generated Code

When a user creates this workflow in the UI:

```
GitHub PR Opened → Code Review Agent → Post Slack Summary
```

The code generator produces:

### Generated Webhook Handler (`/api/webhooks/github.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyGitHubWebhook } from '@/lib/github';
import { runPRReviewWorkflow } from '@/lib/workflows/pr-review';

export async function POST(req: NextRequest) {
  const payload = await req.json();
  const signature = req.headers.get('x-hub-signature-256');

  if (!verifyGitHubWebhook(payload, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  if (payload.action === 'opened' && payload.pull_request) {
    await runPRReviewWorkflow(payload.pull_request);
  }

  return NextResponse.json({ ok: true });
}
```

### Generated Workflow (`/lib/workflows/pr-review.ts`)

```typescript
import { Sandbox } from '@vercel/sdk';
import { postSlackMessage } from '@/lib/slack';
import { codeReviewAgent } from '@/lib/agents/code-review';

export async function runPRReviewWorkflow(pr: GitHubPullRequest) {
  // 1. Spin up Vercel Sandbox for AI agent
  const sandbox = await Sandbox.create({
    template: 'node',
    files: {
      'agent.ts': { data: codeReviewAgent },
      'context.json': { data: JSON.stringify({ pr }) }
    },
    setupCommand: 'bun install @anthropic-ai/sdk'
  });

  try {
    // 2. Run the code review agent
    const result = await sandbox.exec('bun run agent.ts');
    const review = JSON.parse(result.stdout);

    // 3. Post summary to Slack
    await postSlackMessage({
      channel: process.env.SLACK_CHANNEL_ID,
      text: `🔍 Code Review for PR #${pr.number}: ${pr.title}`,
      blocks: [
        { type: 'section', text: { type: 'mrkdwn', text: review.summary } },
        { type: 'section', text: { type: 'mrkdwn', text: `*Suggestions:*\n${review.suggestions.join('\n')}` } }
      ]
    });

    return { success: true, review };
  } finally {
    await sandbox.stop();
  }
}
```

### Generated Agent (`/lib/agents/code-review.ts`)

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';

const context = JSON.parse(readFileSync('context.json', 'utf-8'));
const anthropic = new Anthropic();

async function main() {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Review this pull request and provide:
1. A brief summary (2-3 sentences)
2. Key suggestions for improvement

PR Title: ${context.pr.title}
PR Description: ${context.pr.body}
Changed Files: ${context.pr.changed_files}
Additions: ${context.pr.additions}
Deletions: ${context.pr.deletions}`
    }]
  });

  console.log(JSON.stringify({
    summary: response.content[0].text,
    suggestions: extractSuggestions(response.content[0].text)
  }));
}

main();
```

---

## Implementation Phases

### Phase 1: Foundation
- [ ] Project setup (Next.js + Convex + Bun)
- [ ] Convex schema definition
- [ ] Authentication (Clerk + Convex)
- [ ] Basic UI layout and navigation
- [ ] Workspace management

### Phase 2: Integration Layer
- [ ] GitHub OAuth and API client
- [ ] Slack OAuth and API client
- [ ] Vercel SDK integration (`@vercel/sdk`)
- [ ] Connection management UI

### Phase 3: Workflow Builder UI
- [ ] React Flow canvas setup
- [ ] Node library (triggers, actions, agents)
- [ ] Edge/connection management with data mapping
- [ ] Workflow save/load (Convex mutations)
- [ ] Node configuration panels
- [ ] Live code preview panel

### Phase 4: Code Generation Engine
- [ ] DAG parser and validator
- [ ] Template system for generated code
- [ ] Webhook handler generator
- [ ] Workflow orchestrator generator
- [ ] Sandbox runner generator (Vercel Sandbox)
- [ ] GitHub push integration (commit generated code)

### Phase 5: AI Agent Templates
- [ ] Code Review Agent template
- [ ] PR Description Generator template
- [ ] Documentation Generator template
- [ ] Custom agent editor
- [ ] Agent testing sandbox

### Phase 6: Deploy & Monitor
- [ ] One-click deploy flow (generate → push → deploy)
- [ ] Automatic GitHub webhook registration
- [ ] Execution dashboard (real-time via Convex)
- [ ] Sandbox logs viewer
- [ ] Error alerting

---

## File Structure

```
orchest/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Dashboard home
│   │   ├── workflows/
│   │   │   ├── page.tsx          # Workflow list
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx      # Workflow editor
│   │   │   │   ├── code/         # Generated code preview
│   │   │   │   └── executions/
│   │   │   └── new/
│   │   ├── connections/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── api/
│   │   ├── deploy/               # Deploy workflow endpoint
│   │   └── oauth/                # OAuth callbacks
│   ├── layout.tsx
│   └── providers.tsx
├── components/
│   ├── ui/                       # Base UI components
│   ├── workflow/
│   │   ├── Canvas.tsx            # React Flow canvas
│   │   ├── NodeLibrary.tsx       # Draggable node palette
│   │   ├── CodePreview.tsx       # Live generated code preview
│   │   └── DeployButton.tsx      # Deploy workflow action
│   └── nodes/                    # Node type components
│       ├── TriggerNode.tsx       # GitHub, Slack, Manual triggers
│       ├── ActionNode.tsx        # GitHub, Slack actions
│       ├── LogicNode.tsx         # Conditional, Filter, Transform
│       └── AgentNode.tsx         # AI agent nodes
├── convex/
│   ├── schema.ts                 # Database schema
│   ├── users.ts
│   ├── workspaces.ts
│   ├── workflows.ts
│   ├── connections.ts
│   ├── deployments.ts            # Track generated code deployments
│   ├── _generated/
│   └── actions/
│       ├── github.ts             # GitHub API (push code, webhooks)
│       ├── slack.ts              # Slack API
│       └── vercel.ts             # Vercel Sandbox management
├── lib/
│   ├── codegen/                  # CODE GENERATION ENGINE
│   │   ├── index.ts              # Main generator entry point
│   │   ├── dag-parser.ts         # Parse workflow to DAG
│   │   ├── generators/
│   │   │   ├── webhook.ts        # Generate webhook handlers
│   │   │   ├── workflow.ts       # Generate workflow orchestrators
│   │   │   ├── sandbox.ts        # Generate sandbox runners
│   │   │   └── integrations.ts   # Generate integration clients
│   │   └── templates/
│   │       ├── base-project/     # Base Next.js project template
│   │       ├── webhook-handler.ts.hbs
│   │       ├── workflow.ts.hbs
│   │       └── sandbox-runner.ts.hbs
│   ├── agents/                   # AI AGENT TEMPLATES
│   │   ├── code-review.ts        # Code review agent template
│   │   ├── pr-description.ts     # PR description generator
│   │   └── documentation.ts      # Documentation generator
│   └── integrations/
│       ├── github.ts             # GitHub API client
│       ├── slack.ts              # Slack API client
│       └── vercel-sandbox.ts     # Vercel Sandbox wrapper
├── public/
├── next.config.js
├── tailwind.config.js
├── package.json
└── tsconfig.json
```

---

## Security Considerations

1. **Credential Storage**: OAuth tokens encrypted before storing in Convex
2. **Agent Sandboxing**: Vercel Sandbox provides isolated Linux VMs with resource limits
3. **Webhook Validation**: Generated code includes signature verification (GitHub, Slack)
4. **Generated Code Review**: Users can inspect all generated code before deploy
5. **Audit Logging**: All deployments and executions logged with attribution
6. **RBAC**: Role-based access control for workspaces

---

## Next Steps

1. Initialize Next.js project with Convex and Bun
2. Set up Clerk authentication
3. Implement Convex schema
4. Build basic dashboard layout
5. Create workflow canvas with React Flow
6. Build code generation engine (start with webhook generator)
7. Implement GitHub integration (OAuth + push generated code)

---

## Key Dependencies

```json
{
  "dependencies": {
    "@vercel/sdk": "latest",
    "@anthropic-ai/sdk": "latest",
    "convex": "latest",
    "@clerk/nextjs": "latest",
    "reactflow": "latest",
    "octokit": "latest",
    "@slack/web-api": "latest"
  }
}
```
