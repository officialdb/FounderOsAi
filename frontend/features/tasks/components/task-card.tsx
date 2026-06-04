import { format, isPast } from "date-fns";
import { Check, Edit2, MoreVertical, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PriorityBadge } from "./priority-badge";
import { StatusBadge } from "./status-badge";
import { type Task } from "@/services/task.service";
import { useTaskStore } from "@/store/task-store";
import { useUpdateTask, useDeleteTask } from "../task-queries";
import { useDashboardData } from "@/features/dashboard/dashboard-query";

type TaskCardProps = {
  task: Task;
  view?: "list" | "board";
};

export function TaskCard({ task, view = "list" }: TaskCardProps) {
  const setSelectedTaskId = useTaskStore((state) => state.setSelectedTaskId);
  const { mutate: updateTask } = useUpdateTask();
  const { mutate: deleteTask } = useDeleteTask();
  const { workspacesQuery } = useDashboardData();
  
  const workspaces = workspacesQuery.data ?? [];
  const workspace = workspaces.find((w) => w.id === task.workspace_id);

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateTask({
      taskId: task.id,
      payload: { status: task.status === "done" ? "todo" : "done" },
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask(task.id);
    }
  };

  const isOverdue = task.status !== "done" && task.due_date && isPast(new Date(task.due_date));
  const displayStatus = isOverdue ? "overdue" : task.status;

  if (view === "board") {
    return (
      <Card 
        className="cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => setSelectedTaskId(task.id)}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm leading-tight line-clamp-2">{task.title}</h4>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleComplete}>
                  <Check className="mr-2 h-4 w-4" />
                  {task.status === "done" ? "Mark To Do" : "Mark Done"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedTaskId(task.id); }}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={displayStatus} showIcon={false} />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <span className="truncate max-w-[120px]">{workspace?.name ?? "—"}</span>
            {task.due_date && (
              <span className={isOverdue ? "text-destructive font-medium" : ""}>
                {format(new Date(task.due_date), "MMM d")}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="group cursor-pointer hover:border-primary/50 transition-colors"
      onClick={() => setSelectedTaskId(task.id)}
    >
      <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 shrink-0 rounded-full border-2 ${
            task.status === "done" 
              ? "bg-green-500 border-green-500 text-white hover:bg-green-600 hover:border-green-600" 
              : "border-muted-foreground/30 hover:border-primary text-transparent hover:text-primary"
          }`}
          onClick={handleComplete}
        >
          <Check className="h-4 w-4" />
        </Button>

        <div className="flex-1 min-w-0">
          <h4 className={`font-medium text-sm sm:text-base truncate ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
            {task.title}
          </h4>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground hidden sm:flex">
            <span className="truncate max-w-[150px] font-medium">{workspace?.name ?? "—"}</span>
            <span>•</span>
            {task.due_date && (
              <span className={isOverdue ? "text-destructive font-medium" : ""}>
                Due {format(new Date(task.due_date), "MMM d")}
              </span>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={displayStatus} />
        </div>

        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedTaskId(task.id); }}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
