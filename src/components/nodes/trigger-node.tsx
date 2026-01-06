"use client";

import { Handle, Position, NodeProps } from "@xyflow/react";
import { GitPullRequest, MessageSquare, Webhook, Play, GitBranch } from "lucide-react";

const providerIcons: Record<string, React.ElementType> = {
  github: GitPullRequest,
  slack: MessageSquare,
  webhook: Webhook,
  manual: Play,
};

const eventIcons: Record<string, React.ElementType> = {
  pull_request: GitPullRequest,
  push: GitBranch,
  message: MessageSquare,
  incoming: Webhook,
  trigger: Play,
};

export function TriggerNode({ data, selected }: NodeProps) {
  const Icon = eventIcons[data.event as string] || providerIcons[data.provider as string] || Webhook;

  return (
    <div
      className={`min-w-[160px] rounded-lg border-2 bg-[var(--background)] shadow-sm ${
        selected ? "border-[var(--primary)]" : "border-green-500"
      }`}
    >
      <div className="flex items-center gap-2 border-b bg-green-50 px-3 py-2 rounded-t-md">
        <Icon className="h-4 w-4 text-green-600" />
        <span className="text-xs font-medium text-green-700">Trigger</span>
      </div>
      <div className="p-3">
        <p className="font-medium text-sm">{data.label as string}</p>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          {data.provider as string} · {data.event as string}
        </p>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-green-500 !w-3 !h-3"
      />
    </div>
  );
}
