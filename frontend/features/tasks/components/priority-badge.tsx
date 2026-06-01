import { cn } from "@/lib/utils";
import { type TaskPriority } from "@/services/task.service";

type PriorityBadgeProps = {
  priority: TaskPriority;
  className?: string;
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  let label = "Low";
  let colorClass = "bg-muted text-muted-foreground border-border";

  switch (priority) {
    case 1:
    case "low":
      label = "Low";
      colorClass = "bg-muted text-muted-foreground border-border";
      break;
    case 2:
    case "medium":
      label = "Medium";
      colorClass = "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30";
      break;
    case 3:
    case "high":
      label = "High";
      colorClass = "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30";
      break;
    case 4:
    case "critical":
      label = "Critical";
      colorClass = "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30";
      break;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        colorClass,
        className
      )}
    >
      {label}
    </span>
  );
}
