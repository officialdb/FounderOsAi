import { apiRequest } from "@/services/api-client";

export type OutreachType = "client" | "partnership" | "investor" | "vendor" | "other";
export type OutreachStatus = "pending" | "contacted" | "follow_up" | "responded" | "closed";

export interface OutreachLog {
  id: string;
  workspace_id: string;
  contact_name: string;
  contact_company?: string | null;
  contact_channel?: string | null; // We map OutreachType to contact_channel
  status: OutreachStatus;
  follow_up_date?: string | null;
  notes?: string | null;
  extra_metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface FollowUpReminderResponse {
  workspace_id: string;
  reminder_date: string;
  due_follow_ups: number;
  overdue_follow_ups: number;
}

export type OutreachCreatePayload = {
  workspace_id: string;
  contact_name: string;
  contact_company?: string;
  contact_channel?: string;
  status: OutreachStatus;
  follow_up_date?: string | null;
  notes?: string;
};

export type OutreachUpdatePayload = Partial<Omit<OutreachCreatePayload, "workspace_id">>;

export async function getOutreachLogs(token: string, workspaceId?: string) {
  const url = workspaceId ? `/outreach?workspace_id=${workspaceId}` : "/outreach";
  return apiRequest<OutreachLog[]>(url, {}, { token });
}

export async function createOutreachLog(token: string, payload: OutreachCreatePayload) {
  return apiRequest<OutreachLog>("/outreach", {
    method: "POST",
    body: JSON.stringify(payload),
  }, { token });
}

export async function updateOutreachLog(token: string, outreachId: string, payload: OutreachUpdatePayload) {
  return apiRequest<OutreachLog>(`/outreach/${outreachId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }, { token });
}

export async function deleteOutreachLog(token: string, outreachId: string) {
  return apiRequest(`/outreach/${outreachId}`, {
    method: "DELETE",
  }, { token });
}

export async function getFollowUpReminders(token: string, workspaceId?: string) {
  const url = workspaceId ? `/outreach/follow-up-reminders?workspace_id=${workspaceId}` : "/outreach/follow-up-reminders";
  return apiRequest<FollowUpReminderResponse>(url, {}, { token });
}
