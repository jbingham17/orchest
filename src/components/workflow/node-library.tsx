"use client";

import {
  GitPullRequest,
  MessageSquare,
  Webhook,
  Play,
  Bot,
  GitBranch,
  FileCode,
  Filter,
  Repeat,
} from "lucide-react";

interface NodeTemplate {
  type: string;
  label: string;
  icon: React.ElementType;
  category: string;
  data: Record<string, unknown>;
}

const nodeTemplates: NodeTemplate[] = [
  // Triggers
  {
    type: "trigger",
    label: "GitHub PR",
    icon: GitPullRequest,
    category: "Triggers",
    data: { provider: "github", event: "pull_request", label: "GitHub PR" },
  },
  {
    type: "trigger",
    label: "GitHub Push",
    icon: GitBranch,
    category: "Triggers",
    data: { provider: "github", event: "push", label: "GitHub Push" },
  },
  {
    type: "trigger",
    label: "Slack Message",
    icon: MessageSquare,
    category: "Triggers",
    data: { provider: "slack", event: "message", label: "Slack Message" },
  },
  {
    type: "trigger",
    label: "Webhook",
    icon: Webhook,
    category: "Triggers",
    data: { provider: "webhook", event: "incoming", label: "Webhook" },
  },
  {
    type: "trigger",
    label: "Manual",
    icon: Play,
    category: "Triggers",
    data: { provider: "manual", event: "trigger", label: "Manual" },
  },

  // Actions
  {
    type: "action",
    label: "Create PR",
    icon: GitPullRequest,
    category: "Actions",
    data: { provider: "github", action: "create_pr", label: "Create PR" },
  },
  {
    type: "action",
    label: "PR Comment",
    icon: FileCode,
    category: "Actions",
    data: { provider: "github", action: "comment_pr", label: "PR Comment" },
  },
  {
    type: "action",
    label: "Post to Slack",
    icon: MessageSquare,
    category: "Actions",
    data: { provider: "slack", action: "post_message", label: "Post to Slack" },
  },

  // Agents
  {
    type: "agent",
    label: "Code Review",
    icon: Bot,
    category: "AI Agents",
    data: { agent: "code_review", label: "Code Review" },
  },
  {
    type: "agent",
    label: "PR Description",
    icon: Bot,
    category: "AI Agents",
    data: { agent: "pr_description", label: "PR Description" },
  },
  {
    type: "agent",
    label: "Documentation",
    icon: Bot,
    category: "AI Agents",
    data: { agent: "documentation", label: "Documentation" },
  },

  // Logic
  {
    type: "logic",
    label: "Condition",
    icon: Filter,
    category: "Logic",
    data: { logic: "condition", label: "Condition" },
  },
  {
    type: "logic",
    label: "Loop",
    icon: Repeat,
    category: "Logic",
    data: { logic: "loop", label: "Loop" },
  },
];

export function NodeLibrary() {
  const categories = [...new Set(nodeTemplates.map((t) => t.category))];

  const onDragStart = (
    event: React.DragEvent,
    nodeType: string,
    nodeData: Record<string, unknown>
  ) => {
    event.dataTransfer.setData("application/reactflow/type", nodeType);
    event.dataTransfer.setData(
      "application/reactflow/data",
      JSON.stringify(nodeData)
    );
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="w-64 border-r bg-[var(--background)] overflow-y-auto">
      <div className="p-4">
        <h3 className="mb-4 text-sm font-semibold">Node Library</h3>
        {categories.map((category) => (
          <div key={category} className="mb-4">
            <h4 className="mb-2 text-xs font-medium text-[var(--muted-foreground)] uppercase">
              {category}
            </h4>
            <div className="space-y-1">
              {nodeTemplates
                .filter((t) => t.category === category)
                .map((template) => (
                  <div
                    key={`${template.type}-${template.label}`}
                    draggable
                    onDragStart={(e) =>
                      onDragStart(e, template.type, template.data)
                    }
                    className="flex cursor-grab items-center gap-2 rounded-md border bg-[var(--background)] p-2 text-sm transition-colors hover:border-[var(--primary)] hover:bg-[var(--muted)] active:cursor-grabbing"
                  >
                    <template.icon className="h-4 w-4 text-[var(--muted-foreground)]" />
                    <span>{template.label}</span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
