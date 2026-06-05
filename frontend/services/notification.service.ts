import { apiRequest } from "@/services/api-client";

export type NotificationType = "inbox" | "alert" | "reminder";
export type AlertPriority = "Critical" | "High" | "Medium" | "Low";

export interface AppNotification {
  id: string;
  user_id: string;
  workspace_id?: string;
  type: string;
  title: string;
  message: string;
  scheduled_for?: string | null;
  is_read: boolean;
  extra_metadata: {
    archived?: boolean;
    priority?: AlertPriority;
    recommended_action?: string;
    [key: string]: unknown;
  };
  created_at: string;
  updated_at: string;
}

export interface NotificationSummaryResponse {
  total_notifications: number;
  unread_notifications: number;
  unread_reminders: number;
  unread_alerts: number;
}

export type NotificationUpdateRequest = {
  is_read?: boolean;
  extra_metadata?: Record<string, unknown>;
};

export async function getNotifications(token: string, workspaceId?: string) {
  const query = workspaceId ? `?workspace_id=${workspaceId}` : "";
  return apiRequest<AppNotification[]>(`/notifications${query}`, {}, { token });
}

export async function getNotificationSummary(token: string, workspaceId?: string) {
  const query = workspaceId ? `?workspace_id=${workspaceId}` : "";
  return apiRequest<NotificationSummaryResponse>(`/notifications/summary${query}`, {}, { token });
}

export async function markNotificationRead(token: string, notificationId: string) {
  return apiRequest<AppNotification>(`/notifications/${notificationId}/read`, {
    method: "POST",
  }, { token });
}

export async function updateNotification(token: string, notificationId: string, payload: NotificationUpdateRequest) {
  return apiRequest<AppNotification>(`/notifications/${notificationId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }, { token });
}

export async function deleteNotification(token: string, notificationId: string) {
  return apiRequest(`/notifications/${notificationId}`, {
    method: "DELETE",
  }, { token });
}
