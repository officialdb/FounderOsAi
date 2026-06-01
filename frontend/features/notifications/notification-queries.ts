import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/auth";
import {
  getNotifications,
  getNotificationSummary,
  markNotificationRead,
  updateNotification,
  deleteNotification,
  type NotificationUpdateRequest
} from "@/services/notification.service";

export function useNotifications(workspaceId?: string) {
  const token = getAuthToken();

  return useQuery({
    queryKey: ["notifications", workspaceId],
    queryFn: () => getNotifications(token ?? "", workspaceId),
    enabled: Boolean(token),
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useNotificationSummary(workspaceId?: string) {
  const token = getAuthToken();

  return useQuery({
    queryKey: ["notification-summary", workspaceId],
    queryFn: () => getNotificationSummary(token ?? "", workspaceId),
    enabled: Boolean(token),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const token = getAuthToken();

  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(token ?? "", notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification-summary"] });
    },
  });
}

export function useUpdateNotification() {
  const queryClient = useQueryClient();
  const token = getAuthToken();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: NotificationUpdateRequest }) =>
      updateNotification(token ?? "", id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification-summary"] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  const token = getAuthToken();

  return useMutation({
    mutationFn: (notificationId: string) => deleteNotification(token ?? "", notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification-summary"] });
    },
  });
}
