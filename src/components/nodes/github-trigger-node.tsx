"use client";

import { Handle, Position, NodeProps, useReactFlow } from "@xyflow/react";
import {
  GitPullRequest,
  GitBranch,
  GitMerge,
  Tag,
  AlertCircle,
  MessageSquare,
  Star,
  GitFork,
  Users,
  Shield,
  ChevronDown,
  ChevronUp,
  Settings,
  Check,
} from "lucide-react";
import { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";

// GitHub event types with their sub-actions
const GITHUB_EVENTS = {
  pull_request: {
    label: "Pull Request",
    icon: GitPullRequest,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    actions: [
      { value: "opened", label: "Opened" },
      { value: "closed", label: "Closed" },
      { value: "merged", label: "Merged" },
      { value: "synchronize", label: "Synchronized (new commits)" },
      { value: "reopened", label: "Reopened" },
      { value: "edited", label: "Edited" },
      { value: "review_requested", label: "Review Requested" },
      { value: "ready_for_review", label: "Ready for Review" },
    ],
  },
  push: {
    label: "Push",
    icon: GitBranch,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    actions: [
      { value: "any", label: "Any branch" },
      { value: "main", label: "Main branch only" },
      { value: "feature", label: "Feature branches" },
      { value: "release", label: "Release branches" },
    ],
  },
  pull_request_review: {
    label: "PR Review",
    icon: MessageSquare,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    actions: [
      { value: "submitted", label: "Submitted" },
      { value: "approved", label: "Approved" },
      { value: "changes_requested", label: "Changes Requested" },
      { value: "dismissed", label: "Dismissed" },
    ],
  },
  issues: {
    label: "Issues",
    icon: AlertCircle,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    actions: [
      { value: "opened", label: "Opened" },
      { value: "closed", label: "Closed" },
      { value: "edited", label: "Edited" },
      { value: "labeled", label: "Labeled" },
      { value: "assigned", label: "Assigned" },
    ],
  },
  release: {
    label: "Release",
    icon: Tag,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
    actions: [
      { value: "published", label: "Published" },
      { value: "created", label: "Created" },
      { value: "prereleased", label: "Pre-released" },
      { value: "released", label: "Released" },
    ],
  },
  fork: {
    label: "Fork",
    icon: GitFork,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    actions: [{ value: "created", label: "Created" }],
  },
  star: {
    label: "Star",
    icon: Star,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    actions: [
      { value: "created", label: "Starred" },
      { value: "deleted", label: "Unstarred" },
    ],
  },
  branch_protection_rule: {
    label: "Branch Protection",
    icon: Shield,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    actions: [
      { value: "created", label: "Created" },
      { value: "edited", label: "Edited" },
      { value: "deleted", label: "Deleted" },
    ],
  },
  workflow_run: {
    label: "Workflow Run",
    icon: GitMerge,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
    actions: [
      { value: "completed", label: "Completed" },
      { value: "requested", label: "Requested" },
      { value: "in_progress", label: "In Progress" },
    ],
  },
  member: {
    label: "Collaborator",
    icon: Users,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    actions: [
      { value: "added", label: "Added" },
      { value: "removed", label: "Removed" },
      { value: "edited", label: "Edited" },
    ],
  },
};

type GitHubEventType = keyof typeof GITHUB_EVENTS;

interface GitHubTriggerData {
  label: string;
  provider: string;
  event: GitHubEventType;
  selectedActions: string[];
  branchFilter?: string;
}

export function GitHubTriggerNode({ data, selected, id }: NodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { setNodes } = useReactFlow();

  const triggerData = data as unknown as GitHubTriggerData;
  const event = triggerData.event || "pull_request";
  const selectedActions = triggerData.selectedActions || ["opened"];
  const eventConfig = GITHUB_EVENTS[event];
  const Icon = eventConfig?.icon || GitPullRequest;

  const updateNodeData = useCallback(
    (updates: Partial<GitHubTriggerData>) => {
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: { ...node.data, ...updates },
            };
          }
          return node;
        })
      );
    },
    [id, setNodes]
  );

  const handleEventChange = (newEvent: GitHubEventType) => {
    const defaultAction = GITHUB_EVENTS[newEvent].actions[0]?.value || "";
    updateNodeData({
      event: newEvent,
      selectedActions: [defaultAction],
      label: `GitHub ${GITHUB_EVENTS[newEvent].label}`,
    });
  };

  const handleActionToggle = (action: string) => {
    const newActions = selectedActions.includes(action)
      ? selectedActions.filter((a) => a !== action)
      : [...selectedActions, action];

    if (newActions.length > 0) {
      updateNodeData({ selectedActions: newActions });
    }
  };

  return (
    <div
      className={`min-w-[280px] rounded-xl border-2 bg-white shadow-lg transition-all ${
        selected
          ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/20"
          : eventConfig?.borderColor || "border-gray-200"
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between rounded-t-lg px-4 py-3 ${eventConfig?.bgColor || "bg-gray-50"}`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm`}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Trigger
            </span>
            <h3 className={`font-semibold ${eventConfig?.color || "text-gray-700"}`}>
              GitHub
            </h3>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-white/50 transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <Settings className="h-4 w-4 text-gray-500" />
          )}
        </button>
      </div>

      {/* Event Type Selector - Always visible */}
      <div className="border-b px-4 py-3">
        <label className="text-xs font-medium text-gray-500 mb-2 block">
          Event Type
        </label>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(GITHUB_EVENTS) as GitHubEventType[]).slice(0, 5).map(
            (eventKey) => {
              const config = GITHUB_EVENTS[eventKey];
              const isSelected = event === eventKey;
              return (
                <button
                  key={eventKey}
                  onClick={() => handleEventChange(eventKey)}
                  className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all ${
                    isSelected
                      ? `${config.bgColor} ${config.color} ring-1 ring-current`
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <config.icon className="h-3 w-3" />
                  {config.label}
                </button>
              );
            }
          )}
        </div>
        {isExpanded && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {(Object.keys(GITHUB_EVENTS) as GitHubEventType[]).slice(5).map(
              (eventKey) => {
                const config = GITHUB_EVENTS[eventKey];
                const isSelected = event === eventKey;
                return (
                  <button
                    key={eventKey}
                    onClick={() => handleEventChange(eventKey)}
                    className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all ${
                      isSelected
                        ? `${config.bgColor} ${config.color} ring-1 ring-current`
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <config.icon className="h-3 w-3" />
                    {config.label}
                  </button>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* Action Selector */}
      <div className="px-4 py-3">
        <label className="text-xs font-medium text-gray-500 mb-2 block">
          Trigger When
        </label>
        <div className="space-y-1.5">
          {eventConfig?.actions.map((action) => {
            const isSelected = selectedActions.includes(action.value);
            return (
              <button
                key={action.value}
                onClick={() => handleActionToggle(action.value)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-all ${
                  isSelected
                    ? `${eventConfig.bgColor} ${eventConfig.color} font-medium`
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span>{action.label}</span>
                {isSelected && <Check className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Summary */}
      <div className="border-t px-4 py-2 bg-gray-50 rounded-b-lg">
        <div className="flex flex-wrap gap-1">
          {selectedActions.map((action) => (
            <Badge
              key={action}
              variant="secondary"
              className="text-[10px] bg-white"
            >
              {eventConfig?.actions.find((a) => a.value === action)?.label ||
                action}
            </Badge>
          ))}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className={`!w-3 !h-3 !border-2 !border-white !shadow-md ${
          eventConfig?.bgColor?.replace("bg-", "!bg-") || "!bg-green-500"
        }`}
        style={{
          backgroundColor:
            event === "pull_request"
              ? "#9333ea"
              : event === "push"
                ? "#2563eb"
                : event === "pull_request_review"
                  ? "#16a34a"
                  : event === "issues"
                    ? "#ea580c"
                    : event === "release"
                      ? "#0d9488"
                      : "#6b7280",
        }}
      />
    </div>
  );
}
