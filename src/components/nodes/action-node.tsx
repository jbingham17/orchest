"use client";

import { Handle, Position, NodeProps } from "@xyflow/react";
import { GitPullRequest, MessageSquare, FileCode } from "lucide-react";

const actionIcons: Record<string, React.ElementType> = {
  create_pr: GitPullRequest,
  comment_pr: FileCode,
  post_message: MessageSquare,
};

export function ActionNode({ data, selected }: NodeProps) {
  const Icon = actionIcons[data.action as string] || FileCode;

  return (
    <div
      className={`min-w-[160px] rounded-lg border-2 bg-[var(--background)] shadow-sm ${
        selected ? "border-[var(--primary)]" : "border-blue-500"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-blue-500 !w-3 !h-3"
      />
      <div className="flex items-center gap-2 border-b bg-blue-50 px-3 py-2 rounded-t-md">
        <Icon className="h-4 w-4 text-blue-600" />
        <span className="text-xs font-medium text-blue-700">Action</span>
      </div>
      <div className="p-3">
        <p className="font-medium text-sm">{data.label as string}</p>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          {data.provider as string} · {data.action as string}
        </p>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-blue-500 !w-3 !h-3"
      />
    </div>
  );
}
