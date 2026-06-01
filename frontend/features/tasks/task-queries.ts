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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-summary"] });
    },
  });
}

export function useUpdateTask() {
  const token = getAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: TaskUpdatePayload }) => 
      updateTask(token ?? "", taskId, payload),
    onSuccess: () => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["weekly-summary"] });
    },
  });
}
