"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Workflow, Link2, Play, Plus } from "lucide-react";

export default function DashboardPage() {
  const workspaces = useQuery(api.workspaces.list);
  const currentWorkspace = workspaces?.[0];

  const workflows = useQuery(
    api.workflows.list,
    currentWorkspace ? { workspaceId: currentWorkspace._id } : "skip"
  );

  const connections = useQuery(
    api.connections.list,
    currentWorkspace ? { workspaceId: currentWorkspace._id } : "skip"
  );

  const activeWorkflows = workflows?.filter((w: { status: string }) => w.status === "active") ?? [];
  const recentExecutions = 0; // TODO: Add executions query

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-[var(--muted-foreground)]">
          Welcome to Orchest. Manage your SDLC automation workflows.
        </p>
      </div>

      {!currentWorkspace ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="mb-2 text-lg font-semibold">No workspace yet</h3>
            <p className="mb-4 text-[var(--muted-foreground)]">
              Create your first workspace to get started.
            </p>
            <Link href="/dashboard/settings">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Workspace
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats */}
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Workflows
                </CardTitle>
                <Workflow className="h-4 w-4 text-[var(--muted-foreground)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{workflows?.length ?? 0}</div>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {activeWorkflows.length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Connections
                </CardTitle>
                <Link2 className="h-4 w-4 text-[var(--muted-foreground)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {connections?.length ?? 0}
                </div>
                <p className="text-xs text-[var(--muted-foreground)]">
                  integrations configured
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Executions (24h)
                </CardTitle>
                <Play className="h-4 w-4 text-[var(--muted-foreground)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recentExecutions}</div>
                <p className="text-xs text-[var(--muted-foreground)]">
                  workflow runs
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
            <div className="flex gap-4">
              <Link href="/dashboard/workflows/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Workflow
                </Button>
              </Link>
              <Link href="/dashboard/connections">
                <Button variant="outline">
                  <Link2 className="mr-2 h-4 w-4" />
                  Manage Connections
                </Button>
              </Link>
            </div>
          </div>

          {/* Recent Workflows */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">Recent Workflows</h2>
            {workflows && workflows.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {workflows.slice(0, 6).map((workflow: { _id: string; name: string; status: string; description?: string; nodes: unknown[]; version: number }) => (
                  <Link
                    key={workflow._id}
                    href={`/dashboard/workflows/${workflow._id}`}
                  >
                    <Card className="cursor-pointer transition-shadow hover:shadow-md">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            {workflow.name}
                          </CardTitle>
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
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {workflow.description || "No description"}
                        </p>
                        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                          {workflow.nodes.length} nodes · v{workflow.version}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Workflow className="mb-4 h-12 w-12 text-[var(--muted-foreground)]" />
                  <h3 className="mb-2 text-lg font-semibold">
                    No workflows yet
                  </h3>
                  <p className="mb-4 text-[var(--muted-foreground)]">
                    Create your first workflow to automate your SDLC.
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
        </>
      )}
    </div>
  );
}
