"use client";

import { Handle, Position, NodeProps } from "@xyflow/react";
import { Bot } from "lucide-react";

export function AgentNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`min-w-[160px] rounded-lg border-2 bg-[var(--background)] shadow-sm ${
        selected ? "border-[var(--primary)]" : "border-purple-500"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-purple-500 !w-3 !h-3"
      />
      <div className="flex items-center gap-2 border-b bg-purple-50 px-3 py-2 rounded-t-md">
        <Bot className="h-4 w-4 text-purple-600" />
        <span className="text-xs font-medium text-purple-700">AI Agent</span>
      </div>
      <div className="p-3">
        <p className="font-medium text-sm">{data.label as string}</p>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          {data.agent as string}
        </p>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-purple-500 !w-3 !h-3"
      />
    </div>
  );
}
