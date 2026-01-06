"use client";

import { Handle, Position, NodeProps } from "@xyflow/react";
import { Filter, Repeat } from "lucide-react";

const logicIcons: Record<string, React.ElementType> = {
  condition: Filter,
  loop: Repeat,
};

export function LogicNode({ data, selected }: NodeProps) {
  const Icon = logicIcons[data.logic as string] || Filter;

  return (
    <div
      className={`min-w-[160px] rounded-lg border-2 bg-[var(--background)] shadow-sm ${
        selected ? "border-[var(--primary)]" : "border-orange-500"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-orange-500 !w-3 !h-3"
      />
      <div className="flex items-center gap-2 border-b bg-orange-50 px-3 py-2 rounded-t-md">
        <Icon className="h-4 w-4 text-orange-600" />
        <span className="text-xs font-medium text-orange-700">Logic</span>
      </div>
      <div className="p-3">
        <p className="font-medium text-sm">{data.label as string}</p>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          {data.logic as string}
        </p>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-orange-500 !w-3 !h-3"
      />
    </div>
  );
}
