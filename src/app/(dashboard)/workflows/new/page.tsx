"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewWorkflowPage() {
  const router = useRouter();
  const workspaces = useQuery(api.workspaces.list);
  const currentWorkspace = workspaces?.[0];
  const createWorkflow = useMutation(api.workflows.create);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace || !name.trim()) return;

    setIsLoading(true);
    try {
      const workflowId = await createWorkflow({
        workspaceId: currentWorkspace._id,
        name: name.trim(),
        description: description.trim() || undefined,
      });
      router.push(`/dashboard/workflows/${workflowId}`);
    } catch (error) {
      console.error("Failed to create workflow:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link
          href="/dashboard/workflows"
          className="mb-4 flex items-center text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Workflows
        </Link>
        <h1 className="text-2xl font-bold">Create New Workflow</h1>
        <p className="text-[var(--muted-foreground)]">
          Set up a new automation workflow.
        </p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Workflow Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium"
              >
                Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., PR Code Review"
                required
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium"
              >
                Description (optional)
              </label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Automatically review PRs and post to Slack"
              />
            </div>
            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading || !name.trim()}>
                {isLoading ? "Creating..." : "Create Workflow"}
              </Button>
              <Link href="/dashboard/workflows">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
