"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskList } from "./components/task-list";
import { TaskBoard } from "./components/task-board";
import { TaskFilters } from "./components/task-filters";
import { TaskModal } from "./components/task-modal";
import { TaskDrawer } from "./components/task-drawer";
import { useTaskStore } from "@/store/task-store";
import { useTasks } from "./task-queries";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboardData } from "@/features/dashboard/dashboard-query";
import { useWorkspaceStore } from "@/store/workspace-store";
import { Skeleton } from "@/components/ui/skeleton";

export function TasksView() {
  const { 
    viewMode,
    setTaskModalOpen,
    searchQuery,
    statusFilter,
    priorityFilter
  } = useTaskStore();
  
  const workspaceId = useWorkspaceStore((state) => state.workspaceId);
  const setWorkspaceId = useWorkspaceStore((state) => state.setWorkspaceId);

  const { workspacesQuery } = useDashboardData();
  const workspaces = workspacesQuery.data ?? [];
  const { data: rawTasks, isLoading } = useTasks(workspaceId ?? "all");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!workspaceId && workspaces.length > 0) {
      setWorkspaceId(workspaces[0].id);
    }
  }, [setWorkspaceId, workspaceId, workspaces]);

  // Apply frontend filters
  const tasks = React.useMemo(() => {
    if (!rawTasks) return [];
    
    return rawTasks.filter((task) => {
      // Search
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Status
      if (statusFilter.length > 0 && !statusFilter.includes(task.status)) {
        return false;
      }
      
      // Priority
      if (priorityFilter.length > 0) {
        // Map priority numbers back to strings for filtering if needed
        let pStr = typeof task.priority === "number" 
          ? ["low", "medium", "high", "critical"][task.priority - 1] 
          : task.priority;
        
        if (!priorityFilter.includes(pStr)) return false;
      }

      return true;
    });
  }, [rawTasks, searchQuery, statusFilter, priorityFilter]);

  return (
    <div className="flex flex-col h-full bg-background min-h-screen">
      {/* Top Action Bar */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
        </div>

        <Button
          onClick={() => setTaskModalOpen(true)}
          className="w-full rounded-full font-medium sm:w-auto"
          disabled={!workspaceId}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      <div className="flex-1 px-4 sm:px-6 lg:px-8 max-w-6xl w-full mx-auto">
        <TaskFilters />

        <div className="mt-6">
          {!mounted || isLoading || !workspaceId ? (
            <div className="space-y-4">
              {!workspaceId ? (
                <div className="rounded-xl border border-dashed p-6 space-y-3">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-72" />
                </div>
              ) : (
                <>
                  <div className="grid gap-3 md:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-24 rounded-xl" />
                    ))}
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-20 rounded-xl" />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : viewMode === "list" ? (
            <TaskList tasks={tasks} />
          ) : (
            <TaskBoard tasks={tasks} />
          )}
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <Button 
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg sm:hidden" 
        size="icon"
        onClick={() => setTaskModalOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <TaskModal />
      <TaskDrawer />
    </div>
  );
}
