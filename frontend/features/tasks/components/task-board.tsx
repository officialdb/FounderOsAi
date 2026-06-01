import { TaskCard } from "./task-card";
import { type Task } from "@/services/task.service";

type TaskBoardProps = {
  tasks: Task[];
};

export function TaskBoard({ tasks }: TaskBoardProps) {
  const todo = tasks.filter((t) => t.status === "todo" || !t.status);
  const inProgress = tasks.filter((t) => t.status === "in_progress");
  const done = tasks.filter((t) => t.status === "done");
  const overdue = tasks.filter((t) => t.status === "overdue");

  const columns = [
    { id: "todo", title: "To Do", tasks: todo },
    { id: "in_progress", title: "In Progress", tasks: inProgress },
    { id: "done", title: "Done", tasks: done },
  ];

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h3 className="text-lg font-semibold">No tasks found</h3>
        <p className="text-muted-foreground max-w-sm mt-1">
          Create a new task to start organizing your execution and driving progress.
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-8 h-[calc(100vh-200px)]">
      {columns.map((col) => (
        <div key={col.id} className="flex-shrink-0 w-80 bg-muted/30 rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="font-semibold">{col.title}</h3>
            <span className="bg-muted text-muted-foreground text-xs font-medium px-2 py-0.5 rounded-full">
              {col.tasks.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {col.tasks.map((task) => (
              <TaskCard key={task.id} task={task} view="board" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
