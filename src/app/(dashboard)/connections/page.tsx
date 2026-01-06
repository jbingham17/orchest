"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, MessageSquare, Cloud, Check, X } from "lucide-react";

const integrations = [
  {
    id: "github",
    name: "GitHub",
    description: "Connect to GitHub for repository access, webhooks, and PR automation.",
    icon: Github,
    color: "bg-gray-900",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Connect to Slack for notifications and interactive workflows.",
    icon: MessageSquare,
    color: "bg-purple-600",
  },
  {
    id: "vercel",
    name: "Vercel",
    description: "Connect to Vercel for deployments and sandbox execution.",
    icon: Cloud,
    color: "bg-black",
  },
];

export default function ConnectionsPage() {
  const workspaces = useQuery(api.workspaces.list);
  const currentWorkspace = workspaces?.[0];

  const connections = useQuery(
    api.connections.list,
    currentWorkspace ? { workspaceId: currentWorkspace._id } : "skip"
  );

  const removeConnection = useMutation(api.connections.remove);

  const getConnection = (provider: string) => {
    return connections?.find((c: { provider: string }) => c.provider === provider);
  };

  const handleConnect = (provider: string) => {
    // In a real implementation, this would redirect to OAuth flow
    const oauthUrls: Record<string, string> = {
      github: `/api/oauth/github?workspace=${currentWorkspace?._id}`,
      slack: `/api/oauth/slack?workspace=${currentWorkspace?._id}`,
      vercel: `/api/oauth/vercel?workspace=${currentWorkspace?._id}`,
    };

    window.location.href = oauthUrls[provider];
  };

  const handleDisconnect = async (provider: "github" | "slack" | "vercel") => {
    if (!currentWorkspace) return;
    if (confirm(`Are you sure you want to disconnect ${provider}?`)) {
      await removeConnection({
        workspaceId: currentWorkspace._id,
        provider,
      });
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Connections</h1>
        <p className="text-[var(--muted-foreground)]">
          Manage your integrations with external services.
        </p>
      </div>

      {!currentWorkspace ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-[var(--muted-foreground)]">
              Please create a workspace first to manage connections.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration) => {
            const connection = getConnection(integration.id);
            const isConnected = connection?.isConnected;

            return (
              <Card key={integration.id}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-lg ${integration.color}`}
                    >
                      <integration.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">
                        {integration.name}
                      </CardTitle>
                      <div className="flex items-center gap-1 mt-1">
                        {isConnected ? (
                          <>
                            <Check className="h-3 w-3 text-green-500" />
                            <span className="text-xs text-green-600">
                              Connected
                            </span>
                          </>
                        ) : (
                          <>
                            <X className="h-3 w-3 text-[var(--muted-foreground)]" />
                            <span className="text-xs text-[var(--muted-foreground)]">
                              Not connected
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {integration.description}
                  </CardDescription>
                  {isConnected ? (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Configure
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDisconnect(
                            integration.id as "github" | "slack" | "vercel"
                          )
                        }
                      >
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleConnect(integration.id)}
                    >
                      Connect {integration.name}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
