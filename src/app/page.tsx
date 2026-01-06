import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Workflow, GitPullRequest, Bot, Zap } from "lucide-react";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--background)] to-[var(--muted)]">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]">
              <Workflow className="h-5 w-5 text-[var(--primary-foreground)]" />
            </div>
            <span className="text-xl font-bold">Orchest</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-7xl px-4 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight">
            Automate Your
            <span className="text-[var(--primary)]"> SDLC </span>
            with AI
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--muted-foreground)]">
            Orchest is a workflow orchestration platform that generates real,
            deployable TypeScript code from your visual workflow definitions.
            Connect GitHub, Slack, and AI agents to automate your development
            lifecycle.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg">
                <Zap className="mr-2 h-5 w-5" />
                Start Building
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              View Demo
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-32 grid gap-8 md:grid-cols-3">
          <div className="rounded-lg border bg-[var(--background)] p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <GitPullRequest className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">GitHub Integration</h3>
            <p className="mt-2 text-[var(--muted-foreground)]">
              Trigger workflows from PRs, pushes, and issues. Automatically
              review code, create PRs, and manage branches.
            </p>
          </div>

          <div className="rounded-lg border bg-[var(--background)] p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <Bot className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">AI Agents</h3>
            <p className="mt-2 text-[var(--muted-foreground)]">
              Pre-built agents for code review, PR descriptions, and
              documentation. Run in secure Vercel Sandboxes.
            </p>
          </div>

          <div className="rounded-lg border bg-[var(--background)] p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Workflow className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Code Generation</h3>
            <p className="mt-2 text-[var(--muted-foreground)]">
              Visual workflows generate real TypeScript code. Full transparency,
              version control, and customization.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
