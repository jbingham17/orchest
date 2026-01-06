"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Workflow,
  Link2,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import type { Workspace } from "@/types";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Workflows", href: "/dashboard/workflows", icon: Workflow },
  { name: "Connections", href: "/dashboard/connections", icon: Link2 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const workspaces = useQuery(api.workspaces.list);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  return (
    <div className="flex h-full w-64 flex-col border-r bg-[var(--background)]">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]">
            <Workflow className="h-5 w-5 text-[var(--primary-foreground)]" />
          </div>
          <span className="text-lg font-bold">Orchest</span>
        </Link>
      </div>

      {/* Workspace Selector */}
      <div className="border-b p-4">
        <button
          onClick={() => setWorkspaceOpen(!workspaceOpen)}
          className="flex w-full items-center justify-between rounded-md bg-[var(--muted)] px-3 py-2 text-sm hover:bg-[var(--accent)]"
        >
          <span className="font-medium">
            {workspaces?.[0]?.name ?? "Select Workspace"}
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${workspaceOpen ? "rotate-180" : ""}`}
          />
        </button>
        {workspaceOpen && workspaces && workspaces.length > 0 && (
          <div className="mt-2 rounded-md border bg-[var(--background)] shadow-lg">
            {(workspaces as Workspace[]).map((workspace) => (
              <button
                key={workspace._id}
                className="flex w-full items-center px-3 py-2 text-sm hover:bg-[var(--muted)]"
                onClick={() => setWorkspaceOpen(false)}
              >
                {workspace.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <div className="flex-1 truncate">
            <p className="text-sm font-medium">Account</p>
          </div>
        </div>
      </div>
    </div>
  );
}
