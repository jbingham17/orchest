"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { WorkflowCanvas } from "@/components/workflow/canvas";
import { NodeLibrary } from "@/components/workflow/node-library";
import { ArrowLeft, Save, Play, Code } from "lucide-react";
import Link from "next/link";
import { useState, useCallback } from "react";
import { Node, Edge } from "@xyflow/react";
import type { WorkflowNode, WorkflowEdge } from "@/types";

export default function WorkflowEditorPage() {
  const params = useParams();
  const router = useRouter();
  const workflowId = params.id as Id<"workflows">;

  const workflow = useQuery(api.workflows.get, { id: workflowId });
  const updateWorkflow = useMutation(api.workflows.update);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize nodes and edges from workflow
  useState(() => {
    if (workflow) {
      setNodes(
        (workflow.nodes as WorkflowNode[]).map((n: WorkflowNode) => ({
          id: n.id,
          type: n.type,
          position: n.position,
          data: n.data,
        }))
      );
      setEdges(
        (workflow.edges as WorkflowEdge[]).map((e: WorkflowEdge) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle,
          targetHandle: e.targetHandle,
        }))
      );
    }
  });

  const handleNodesChange = useCallback((newNodes: Node[]) => {
    setNodes(newNodes);
    setHasChanges(true);
  }, []);

  const handleEdgesChange = useCallback((newEdges: Edge[]) => {
    setEdges(newEdges);
    setHasChanges(true);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateWorkflow({
        id: workflowId,
        nodes: nodes.map((n) => ({
          id: n.id,
          type: n.type || "default",
          position: n.position,
          data: n.data,
        })),
        edges: edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle ?? undefined,
          targetHandle: e.targetHandle ?? undefined,
        })),
      });
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to save workflow:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!workflow) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[var(--muted-foreground)]">Loading workflow...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-[var(--background)] px-4 py-3">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/workflows"
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-semibold">{workflow.name}</h1>
            <p className="text-xs text-[var(--muted-foreground)]">
              {workflow.status} · v{workflow.version}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/workflows/${workflowId}/code`}>
            <Button variant="outline" size="sm">
              <Code className="mr-2 h-4 w-4" />
              View Code
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button size="sm">
            <Play className="mr-2 h-4 w-4" />
            Deploy
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Node Library */}
        <NodeLibrary />

        {/* Canvas */}
        <div className="flex-1">
          <WorkflowCanvas
            initialNodes={nodes.length > 0 ? nodes : workflow.nodes}
            initialEdges={edges.length > 0 ? edges : workflow.edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
          />
        </div>
      </div>
    </div>
  );
}
