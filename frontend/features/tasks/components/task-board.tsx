"use client";

import * as React from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { TaskCard } from "./task-card";
import { type Task } from "@/services/task.service";
import { useUpdateTask } from "../task-queries";

type TaskBoardProps = {
  tasks: Task[];
};

export function TaskBoard({ tasks }: TaskBoardProps) {
  const { mutate: updateTask } = useUpdateTask();

  // Optimistic local state for drag-and-drop
  const [localTasks, setLocalTasks] = React.useState<Task[]>(tasks);

  React.useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const pending = localTasks.filter((t) => t.status === "todo" || !t.status);
  const inProgress = localTasks.filter((t) => t.status === "in_progress");
  const completed = localTasks.filter((t) => t.status === "done");

  const columns = [
    { id: "todo", title: "To Do", tasks: pending },
    { id: "in_progress", title: "In Progress", tasks: inProgress },
    { id: "done", title: "Done", tasks: completed },
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

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return; // Dropped in same place
    }

    const newStatus = destination.droppableId as "todo" | "in_progress" | "done";
    
    // Optimistically update
    const updatedTasks = localTasks.map((t) => 
      t.id === draggableId ? { ...t, status: newStatus } : t
    );
    setLocalTasks(updatedTasks);

    // Persist
    updateTask({
      taskId: draggableId,
      payload: { status: newStatus },
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 h-[calc(100vh-200px)] min-h-[500px]">
        {columns.map((col) => (
          <div key={col.id} className="bg-muted/30 rounded-xl p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4 px-1 shrink-0">
              <h3 className="font-semibold">{col.title}</h3>
              <span className="bg-muted text-muted-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                {col.tasks.length}
              </span>
            </div>
            
            <Droppable droppableId={col.id}>
              {(provided) => (
                <div 
                  className="flex-1 overflow-y-auto pr-2 custom-scrollbar"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <div className="space-y-3 min-h-[100px]">
                    {col.tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{ 
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.8 : 1,
                            }}
                          >
                            <TaskCard task={task} view="board" />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
