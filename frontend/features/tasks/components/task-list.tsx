import { isToday, isPast, isFuture, parseISO } from "date-fns";
import { TaskCard } from "./task-card";
import { type Task } from "@/services/task.service";

type TaskListProps = {
  tasks: Task[];
};

export function TaskList({ tasks }: TaskListProps) {
  // Group tasks
  const pendingTasks = tasks.filter((t) => t.status !== "done");
  const completedTasks = tasks.filter((t) => t.status === "done");

  const overdue = pendingTasks.filter((t) => t.due_date && isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date)));
  const today = pendingTasks.filter((t) => t.due_date && isToday(new Date(t.due_date)));
  const upcoming = pendingTasks.filter((t) => !t.due_date || (t.due_date && isFuture(new Date(t.due_date))));

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold">No tasks found</h3>
        <p className="text-muted-foreground max-w-sm mt-1">
          Create a new task to start organizing your execution and driving progress.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {overdue.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-destructive flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-destructive"></span>
            Overdue ({overdue.length})
          </h3>
          <div className="grid gap-2">
            {overdue.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {today.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            Today ({today.length})
          </h3>
          <div className="grid gap-2">
            {today.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Upcoming ({upcoming.length})
          </h3>
          <div className="grid gap-2">
            {upcoming.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {completedTasks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Completed ({completedTasks.length})
          </h3>
          <div className="grid gap-2 opacity-60 hover:opacity-100 transition-opacity">
            {completedTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
