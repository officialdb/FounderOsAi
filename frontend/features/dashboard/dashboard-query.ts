"use client";

import { useQuery } from "@tanstack/react-query";

import { getAuthToken } from "@/lib/auth";
import { listWorkspaces, getWorkspace, createWorkspace, type WorkspaceCreatePayload } from "@/services/workspace.service";
import { listTasks } from "@/services/task.service";
import { getWeeklySummary } from "@/services/checkin.service";
import { getNotificationSummary } from "@/services/notification.service";
import { fetchCurrentUser } from "@/services/auth.service";
import { useQueryClient, useMutation } from "@tanstack/react-query";

export function useDashboardData(workspaceId?: string | null) {
  const token = getAuthToken();
  const activeWorkspaceId = workspaceId ?? null;

  const workspacesQuery = useQuery({
    queryKey: ["workspaces"],
    queryFn: () => listWorkspaces(token ?? ""),
    enabled: Boolean(token),
  });

  const selectedWorkspaceQuery = useQuery({
    queryKey: ["workspace", activeWorkspaceId],
    queryFn: () => getWorkspace(token ?? "", activeWorkspaceId ?? ""),
    enabled: Boolean(token && activeWorkspaceId),
  });

  const tasksQuery = useQuery({
    queryKey: ["tasks", activeWorkspaceId ?? "all"],
    queryFn: () => listTasks(token ?? "", activeWorkspaceId ?? undefined),
    enabled: Boolean(token),
  });

  const weeklySummaryQuery = useQuery({
    queryKey: ["weekly-summary", activeWorkspaceId ?? "all"],
    queryFn: () => getWeeklySummary(token ?? "", activeWorkspaceId ?? undefined),
    enabled: Boolean(token),
  });

  const notificationSummaryQuery = useQuery({
    queryKey: ["notification-summary", activeWorkspaceId ?? "all"],
    queryFn: () => getNotificationSummary(token ?? "", activeWorkspaceId ?? undefined),
    enabled: Boolean(token),
  });

  const userQuery = useQuery({
    queryKey: ["current-user"],
    queryFn: () => fetchCurrentUser(token ?? ""),
    enabled: Boolean(token),
  });

  return {
    workspacesQuery,
    selectedWorkspaceQuery,
    tasksQuery,
    weeklySummaryQuery,
    notificationSummaryQuery,
    userQuery,
  };
}

export function useCreateWorkspace() {
  const token = getAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: WorkspaceCreatePayload) => createWorkspace(token ?? "", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}

