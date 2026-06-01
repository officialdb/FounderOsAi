"use client";

import * as React from "react";
import { format } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useTaskStore } from "@/store/task-store";
import { useTasks, useUpdateTask, useDeleteTask } from "../task-queries";
import { useDashboardData } from "@/features/dashboard/dashboard-query";
import { PriorityBadge } from "./priority-badge";
import { StatusBadge } from "./status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Clock, Trash2, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";

export function TaskDrawer() {
  const { selectedTaskId, setSelectedTaskId, workspaceFilter } = useTaskStore();
  const { data: tasks } = useTasks(workspaceFilter);
  const { workspacesQuery } = useDashboardData();
  const { mutate: updateTask } = useUpdateTask();
  const { mutate: deleteTask } = useDeleteTask();

  const workspaces = workspacesQuery.data ?? [];
  const task = tasks?.find((t) => t.id === selectedTaskId);
  const workspace = workspaces.find((w) => w.id === task?.workspace_id);

  if (!task) return null;

  const handleStatusChange = (status: string) => {
    updateTask({ taskId: task.id, payload: { status } });
  };

  const handlePriorityChange = (priority: string) => {
    updateTask({ taskId: task.id, payload: { priority: priority as any } });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask(task.id);
      setSelectedTaskId(null);
    }
  };

  return (
    <Sheet open={!!selectedTaskId} onOpenChange={(open) => !open && setSelectedTaskId(null)}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="text-left mb-6">
          <div className="flex items-start justify-between gap-4">
            <SheetTitle className="text-xl leading-tight">{task.title}</SheetTitle>
          </div>
          <SheetDescription className="flex items-center gap-2 mt-2">
            <span className="font-medium text-foreground">{workspace?.name ?? "Unknown Workspace"}</span>
            <span>•</span>
            <span>Created {format(new Date(task.created_at), "MMM d, yyyy")}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-4 border-b pb-4">
            <div className="space-y-1 flex-1">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <Select value={task.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="h-8 border-none bg-muted/50 font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 flex-1">
              <label className="text-xs font-medium text-muted-foreground">Priority</label>
              <Select value={task.priority.toString()} onValueChange={handlePriorityChange}>
                <SelectTrigger className="h-8 border-none bg-muted/50 font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" /> Due Date
              </h4>
              <Input 
                type="date" 
                defaultValue={task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : ""}
                onChange={(e) => updateTask({ taskId: task.id, payload: { due_date: e.target.value } })}
                className="h-9 w-auto"
              />
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Description</h4>
              <div className="bg-muted/30 p-3 rounded-md text-sm min-h-[100px] border">
                {task.description ? (
                  <p className="whitespace-pre-wrap">{task.description}</p>
                ) : (
                  <p className="text-muted-foreground italic">No description provided.</p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => handleStatusChange(task.status === "completed" ? "pending" : "completed")}>
              {task.status === "completed" ? (
                <><Clock className="mr-2 h-4 w-4" /> Mark Pending</>
              ) : (
                <><CheckCircle2 className="mr-2 h-4 w-4" /> Mark Complete</>
              )}
            </Button>

            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
