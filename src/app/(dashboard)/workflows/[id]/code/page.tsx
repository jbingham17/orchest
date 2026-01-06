"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Download } from "lucide-react";
import Link from "next/link";
import { generateWorkflowCode } from "@/lib/codegen";

export default function CodePreviewPage() {
  const params = useParams();
  const workflowId = params.id as Id<"workflows">;
  const workflow = useQuery(api.workflows.get, { id: workflowId });

  if (!workflow) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-[var(--muted-foreground)]">Loading...</p>
      </div>
    );
  }

  const generatedCode = generateWorkflowCode(workflow);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="h-full overflow-auto p-8">
      <div className="mb-8">
        <Link
          href={`/dashboard/workflows/${workflowId}`}
          className="mb-4 flex items-center text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Editor
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Generated Code</h1>
            <p className="text-[var(--muted-foreground)]">
              {workflow.name} - Version {workflow.version}
            </p>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download All
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {generatedCode.files.map((file) => (
          <Card key={file.path}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-mono">{file.path}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(file.content)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-lg bg-[var(--muted)] p-4 text-sm">
                <code>{file.content}</code>
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
