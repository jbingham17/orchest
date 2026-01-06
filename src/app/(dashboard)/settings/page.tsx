"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Users } from "lucide-react";
import type { Workspace } from "@/types";

export default function SettingsPage() {
  const workspaces = useQuery(api.workspaces.list);
  const createWorkspace = useMutation(api.workspaces.create);
  const updateWorkspace = useMutation(api.workspaces.update);
  const deleteWorkspace = useMutation(api.workspaces.remove);

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      await createWorkspace({
        name: newName.trim(),
        description: newDescription.trim() || undefined,
      });
      setNewName("");
      setNewDescription("");
      setIsCreating(false);
    } catch (error) {
      console.error("Failed to create workspace:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this workspace? This action cannot be undone.")) {
      await deleteWorkspace({ id: id as any });
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-[var(--muted-foreground)]">
          Manage your workspaces and account settings.
        </p>
      </div>

      {/* Workspaces Section */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Workspaces</h2>
          <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
            <Plus className="mr-2 h-4 w-4" />
            New Workspace
          </Button>
        </div>

        {isCreating && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Create Workspace</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Name</label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="My Workspace"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Description (optional)
                  </label>
                  <Input
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="A workspace for my team"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Create</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      setNewName("");
                      setNewDescription("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {workspaces && workspaces.length > 0 ? (
          <div className="grid gap-4">
            {(workspaces as Workspace[]).map((workspace) => (
              <Card key={workspace._id}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]">
                      <Users className="h-5 w-5 text-[var(--primary-foreground)]" />
                    </div>
                    <div>
                      <h3 className="font-medium">{workspace.name}</h3>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {workspace.description || "No description"}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">
                        Role: {workspace.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Manage Members
                    </Button>
                    {workspace.role === "owner" && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(workspace._id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          !isCreating && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="mb-4 h-12 w-12 text-[var(--muted-foreground)]" />
                <h3 className="mb-2 text-lg font-semibold">No workspaces yet</h3>
                <p className="mb-4 text-[var(--muted-foreground)]">
                  Create your first workspace to get started.
                </p>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Workspace
                </Button>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
}
