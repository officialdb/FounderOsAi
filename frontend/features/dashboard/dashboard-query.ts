"use client";

import { useQuery } from "@tanstack/react-query";

import { getAuthToken } from "@/lib/auth";
import { useWorkspaceStore } from "@/store/workspace-store";
import { listWorkspaces, getWorkspace, createWorkspace, type WorkspaceCreatePayload } from "@/services/workspace.service";
import { listTasks } from "@/services/task.service";
import { getWeeklySummary } from "@/services/checkin.service";
import { getNotificationSummary } from "@/services/notification.service";
import { fetchCurrentUser } from "@/services/auth.service";
import { useQueryClient, useMutation } from "@tanstack/react-query";

export function useDashboardData() {
  const token = getAuthToken();
  const workspaceId = useWorkspaceStore((state) => state.workspaceId);

  const workspacesQuery = useQuery({
    queryKey: ["workspaces"],
    queryFn: () => listWorkspaces(token ?? ""),
    enabled: Boolean(token),
  });

  const selectedWorkspaceQuery = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => getWorkspace(token ?? "", workspaceId ?? ""),
    enabled: Boolean(token && workspaceId),
  });

  const tasksQuery = useQuery({
    queryKey: ["tasks", workspaceId],
    queryFn: () => listTasks(token ?? "", workspaceId ?? ""),
    enabled: Boolean(token && workspaceId),
  });

  const weeklySummaryQuery = useQuery({
    queryKey: ["weekly-summary", workspaceId],
    queryFn: () => getWeeklySummary(token ?? "", workspaceId ?? ""),
    enabled: Boolean(token && workspaceId),
  });

  const notificationSummaryQuery = useQuery({
    queryKey: ["notification-summary"],
    queryFn: () => getNotificationSummary(token ?? ""),
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

