import { cn } from "@/lib/utils";
import { type TaskStatus } from "@/services/task.service";
import { CheckCircle2, Clock, AlertCircle, PlayCircle } from "lucide-react";

type StatusBadgeProps = {
  status: TaskStatus;
  className?: string;
  showIcon?: boolean;
};

export function StatusBadge({ status, className, showIcon = true }: StatusBadgeProps) {
  let label = "Pending";
  let colorClass = "bg-muted text-muted-foreground border-border";
  let Icon = Clock;

  switch (status) {
    case "todo":
      label = "To Do";
      colorClass = "bg-muted text-muted-foreground border-border";
      Icon = Clock;
      break;
    case "in_progress":
      label = "In Progress";
      colorClass = "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30";
      Icon = PlayCircle;
      break;
    case "done":
      label = "Done";
      colorClass = "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30";
      Icon = CheckCircle2;
      break;
    case "overdue":
      label = "Overdue";
      colorClass = "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30";
      Icon = AlertCircle;
      break;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        colorClass,
        className
      )}
    >
      {showIcon && <Icon className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
}
