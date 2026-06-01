import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Task } from "@/services/task.service";
import { EmptyState } from "@/components/feedback/empty-state";

type TasksPreviewProps = {
  tasks: Task[];
};

export function TasksPreview({ tasks }: TasksPreviewProps) {
  const visibleTasks = tasks.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today’s tasks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {visibleTasks.length === 0 ? (
          <EmptyState
            title="No tasks yet"
            message="Create your first task in this workspace to start building momentum."
          />
        ) : (
          visibleTasks.map((task) => (
            <div key={task.id} className="flex items-start justify-between gap-4 rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">{task.title}</p>
                <p className="text-xs text-muted-foreground">
                  Priority {task.priority} · {task.status}
                </p>
              </div>
              {task.is_overdue ? <span className="text-xs text-red-400">Overdue</span> : null}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
