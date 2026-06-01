"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/auth";
import { 
  listTasks, 
  createTask, 
  updateTask, 
  deleteTask, 
  type TaskCreatePayload, 
  type TaskUpdatePayload 
} from "@/services/task.service";

import type { Task } from "@/services/task.service";

export function useTasks(workspaceId: string | "all") {
  const token = getAuthToken();
  const activeWorkspaceId = workspaceId === "all" ? null : workspaceId;

  return useQuery({
    queryKey: ["tasks", activeWorkspaceId],
    queryFn: () => listTasks(token ?? "", activeWorkspaceId ?? undefined),
    enabled: Boolean(token && activeWorkspaceId),
  });
}

export function useCreateTask() {
  const token = getAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TaskCreatePayload) => createTask(token ?? "", payload),
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", newTask.workspace_id] });
      const previousTasks = queryClient.getQueryData<Task[]>(["tasks", newTask.workspace_id]);
      
      const optimisticTask: Task = {
        id: `temp-${Date.now()}`,
        workspace_id: newTask.workspace_id,
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority ?? "medium",
        status: "todo",
        due_date: newTask.due_date,
        is_overdue: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData<Task[]>(["tasks", newTask.workspace_id], (old) => {
        return old ? [...old, optimisticTask] : [optimisticTask];
      });

      return { previousTasks };
    },
    onError: (err, newTask, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks", newTask.workspace_id], context.previousTasks);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", variables.workspace_id] });
      queryClient.invalidateQueries({ queryKey: ["weekly-summary", variables.workspace_id] });
    },
  });
}

export function useUpdateTask() {
  const token = getAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: TaskUpdatePayload }) => 
      updateTask(token ?? "", taskId, payload),
    onMutate: async ({ taskId, payload }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      
      const previousTasksQueries = queryClient.getQueriesData<Task[]>({ queryKey: ["tasks"] });
      
      queryClient.setQueriesData<Task[]>({ queryKey: ["tasks"] }, (old) => {
        if (!old) return old;
        return old.map(task => 
          task.id === taskId ? { ...task, ...payload, updated_at: new Date().toISOString() } : task
        );
      });

      return { previousTasksQueries };
    },
    onError: (err, variables, context) => {
      if (context?.previousTasksQueries) {
        context.previousTasksQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-summary"] });
    },
  });
}

export function useDeleteTask() {
  const token = getAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => deleteTask(token ?? "", taskId),
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      
      const previousTasksQueries = queryClient.getQueriesData<Task[]>({ queryKey: ["tasks"] });
      
      queryClient.setQueriesData<Task[]>({ queryKey: ["tasks"] }, (old) => {
        if (!old) return old;
        return old.filter(task => task.id !== taskId);
      });

      return { previousTasksQueries };
    },
    onError: (err, taskId, context) => {
      if (context?.previousTasksQueries) {
        context.previousTasksQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-summary"] });
    },
  });
}

