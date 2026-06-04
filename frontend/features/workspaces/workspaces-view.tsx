"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Briefcase, ArrowRight } from "lucide-react";
import { useDashboardData } from "@/features/dashboard/dashboard-query";
import { useWorkspaceStore } from "@/store/workspace-store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { WorkspaceModal } from "@/features/dashboard/workspace-modal";

export function WorkspacesView() {
  const router = useRouter();
  const workspaceId = useWorkspaceStore((state) => state.workspaceId);
  const { workspacesQuery } = useDashboardData(workspaceId);
  const workspaces = workspacesQuery.data ?? [];
  const isLoading = workspacesQuery.isLoading;
  const setWorkspaceId = useWorkspaceStore((state) => state.setWorkspaceId);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSwitchWorkspace = (id: string) => {
    setWorkspaceId(id);
    router.push("/dashboard");
  };

  const showLoading = !mounted || isLoading;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your Workspaces</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your startups and switch between different execution contexts.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Workspace
        </Button>
      </div>

      {showLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : workspaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border border-dashed bg-card/50">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Briefcase className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">No workspaces found</h2>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            Create your first workspace to start executing on your startup ideas and tracking your progress.
          </p>
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Workspace
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((workspace) => (
            <div
              key={workspace.id}
              onClick={() => handleSwitchWorkspace(workspace.id)}
              className="group relative flex flex-col rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:border-primary/30 cursor-pointer overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
              
              <div className="flex items-center justify-between mb-4 relative">
                <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {workspace.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {workspace.id === workspaceId && (
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    Active
                  </span>
                )}
              </div>
              
              <div className="relative">
                <h3 className="font-semibold text-foreground line-clamp-1">{workspace.name}</h3>
                <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 -translate-x-4 transition-all group-hover:opacity-100 group-hover:translate-x-0">
                  Switch to workspace <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <WorkspaceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
