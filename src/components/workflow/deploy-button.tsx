"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Play, Loader2, Check, X, Rocket } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

interface DeployButtonProps {
  workflowId: Id<"workflows">;
  workspaceId: Id<"workspaces">;
  workflowName: string;
  disabled?: boolean;
}

export function DeployButton({
  workflowId,
  workspaceId,
  workflowName,
  disabled,
}: DeployButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<{
    success: boolean;
    message: string;
    deployUrl?: string;
  } | null>(null);
  const [githubRepo, setGithubRepo] = useState("");
  const [githubBranch, setGithubBranch] = useState("main");

  const githubConnection = useQuery(api.connections.get, {
    workspaceId,
    provider: "github",
  });

  const handleDeploy = async () => {
    if (!githubRepo) return;

    setIsDeploying(true);
    setDeployResult(null);

    try {
      const response = await fetch("/api/deploy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workflowId,
          workspaceId,
          githubRepo,
          githubBranch,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setDeployResult({
          success: true,
          message: `Successfully deployed to ${githubRepo}`,
          deployUrl: data.deployUrl,
        });
      } else {
        setDeployResult({
          success: false,
          message: data.error || "Deployment failed",
        });
      }
    } catch (error) {
      setDeployResult({
        success: false,
        message: error instanceof Error ? error.message : "Deployment failed",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  if (!isOpen) {
    return (
      <Button size="sm" onClick={() => setIsOpen(true)} disabled={disabled}>
        <Play className="mr-2 h-4 w-4" />
        Deploy
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Deploy Workflow
          </CardTitle>
          <CardDescription>
            Deploy "{workflowName}" to a GitHub repository
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!githubConnection?.isConnected ? (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Please connect your GitHub account first in the Connections page.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">GitHub Repository</label>
                <Input
                  placeholder="owner/repo (e.g., myorg/my-workflows)"
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                  disabled={isDeploying}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Branch</label>
                <Input
                  placeholder="main"
                  value={githubBranch}
                  onChange={(e) => setGithubBranch(e.target.value)}
                  disabled={isDeploying}
                />
              </div>

              {deployResult && (
                <div
                  className={`flex items-start gap-2 rounded-lg p-3 ${
                    deployResult.success
                      ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                      : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200"
                  }`}
                >
                  {deployResult.success ? (
                    <Check className="mt-0.5 h-4 w-4" />
                  ) : (
                    <X className="mt-0.5 h-4 w-4" />
                  )}
                  <div className="space-y-1">
                    <p className="text-sm">{deployResult.message}</p>
                    {deployResult.deployUrl && (
                      <a
                        href={deployResult.deployUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs underline"
                      >
                        View on GitHub
                      </a>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setDeployResult(null);
              }}
              disabled={isDeploying}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeploy}
              disabled={
                !githubConnection?.isConnected || !githubRepo || isDeploying
              }
            >
              {isDeploying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  Deploy
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
