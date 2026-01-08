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
  Github,
} from "lucide-react";

interface NodeTemplate {
  type: string;
  label: string;
  icon: React.ElementType;
  category: string;
  data: Record<string, unknown>;
  description?: string;
}

const nodeTemplates: NodeTemplate[] = [
  // Triggers
  {
    type: "github-trigger",
    label: "GitHub",
    icon: Github,
    category: "Triggers",
    description: "PR, Push, Issues, Releases & more",
    data: {
      provider: "github",
      event: "pull_request",
      selectedActions: ["opened"],
      label: "GitHub Pull Request",
    },
  },
  {
    type: "trigger",
    label: "Slack Message",
    icon: MessageSquare,
    category: "Triggers",
    description: "Trigger on Slack messages",
    data: { provider: "slack", event: "message", label: "Slack Message" },
  },
  {
    type: "trigger",
    label: "Webhook",
    icon: Webhook,
    category: "Triggers",
    description: "Custom HTTP webhook",
    data: { provider: "webhook", event: "incoming", label: "Webhook" },
  },
  {
    type: "trigger",
    label: "Manual",
    icon: Play,
    category: "Triggers",
    description: "Manually trigger workflow",
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
                    className="flex cursor-grab items-center gap-3 rounded-lg border bg-[var(--background)] p-2.5 text-sm transition-all hover:border-[var(--primary)] hover:bg-[var(--muted)] hover:shadow-sm active:cursor-grabbing"
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-md ${
                      template.type === "github-trigger"
                        ? "bg-gray-900 text-white"
                        : "bg-[var(--muted)]"
                    }`}>
                      <template.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium block">{template.label}</span>
                      {template.description && (
                        <span className="text-[10px] text-[var(--muted-foreground)] block truncate">
                          {template.description}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
