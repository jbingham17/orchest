"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, MoreVertical, Play, Pause, Trash2, Copy } from "lucide-react";
import { useState } from "react";
import { Id } from "../../../../convex/_generated/dataModel";
import type { Workflow } from "@/types";

export default function WorkflowsPage() {
  const workspaces = useQuery(api.workspaces.list);
  const currentWorkspace = workspaces?.[0];

  const workflows = useQuery(
    api.workflows.list,
    currentWorkspace ? { workspaceId: currentWorkspace._id } : "skip"
  );

  const updateWorkflow = useMutation(api.workflows.update);
  const deleteWorkflow = useMutation(api.workflows.remove);
  const duplicateWorkflow = useMutation(api.workflows.duplicate);

  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const handleStatusToggle = async (
    id: Id<"workflows">,
    currentStatus: string
  ) => {
    await updateWorkflow({
      id,
      status: currentStatus === "active" ? "paused" : "active",
    });
  };

  const handleDelete = async (id: Id<"workflows">) => {
    if (confirm("Are you sure you want to delete this workflow?")) {
      await deleteWorkflow({ id });
    }
    setMenuOpen(null);
  };

  const handleDuplicate = async (id: Id<"workflows">) => {
    await duplicateWorkflow({ id });
    setMenuOpen(null);
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workflows</h1>
          <p className="text-[var(--muted-foreground)]">
            Create and manage your automation workflows.
          </p>
        </div>
        <Link href="/dashboard/workflows/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Workflow
          </Button>
        </Link>
      </div>

      {!currentWorkspace ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-[var(--muted-foreground)]">
              Please create a workspace first.
            </p>
          </CardContent>
        </Card>
      ) : workflows && workflows.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(workflows as Workflow[]).map((workflow) => (
            <Card key={workflow._id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Link href={`/dashboard/workflows/${workflow._id}`}>
                    <CardTitle className="cursor-pointer text-base hover:text-[var(--primary)]">
                      {workflow.name}
                    </CardTitle>
                  </Link>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        workflow.status === "active"
                          ? "bg-green-100 text-green-700"
                          : workflow.status === "paused"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {workflow.status}
                    </span>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setMenuOpen(
                            menuOpen === workflow._id ? null : workflow._id
                          )
                        }
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                      {menuOpen === workflow._id && (
                        <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-md border bg-[var(--background)] py-1 shadow-lg">
                          <button
                            onClick={() =>
                              handleStatusToggle(workflow._id as Id<"workflows">, workflow.status)
                            }
                            className="flex w-full items-center px-4 py-2 text-sm hover:bg-[var(--muted)]"
                          >
                            {workflow.status === "active" ? (
                              <>
                                <Pause className="mr-2 h-4 w-4" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="mr-2 h-4 w-4" />
                                Activate
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDuplicate(workflow._id as Id<"workflows">)}
                            className="flex w-full items-center px-4 py-2 text-sm hover:bg-[var(--muted)]"
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </button>
                          <button
                            onClick={() => handleDelete(workflow._id as Id<"workflows">)}
                            className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-[var(--muted)]"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link href={`/dashboard/workflows/${workflow._id}`}>
                  <p className="cursor-pointer text-sm text-[var(--muted-foreground)]">
                    {workflow.description || "No description"}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                    <span>{workflow.nodes.length} nodes</span>
                    <span>Version {workflow.version}</span>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="mb-2 text-lg font-semibold">No workflows yet</h3>
            <p className="mb-4 text-[var(--muted-foreground)]">
              Create your first workflow to start automating.
            </p>
            <Link href="/dashboard/workflows/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Workflow
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
