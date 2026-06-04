import { apiRequest } from "@/services/api-client";

export type WeeklySummary = {
  workspace_id: string;
  period_start: string;
  period_end: string;
  total_check_ins: number;
  average_score: number;
  current_streak: number;
  longest_streak: number;
  best_score: number;
  missed_days: number;
};

export type CheckIn = {
  id: string;
  workspace_id: string;
  check_in_date: string;
  completed_today?: string;
  blockers?: string | null;
  next_priorities?: string;
  productivity_score?: number;
  // legacy backend fields
  mood?: string | null;
  wins?: string | null;
  score?: number;
  extra_metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type CheckInCreatePayload = {
  workspace_id: string;
  completed_today: string;
  blockers: string;
  next_priorities: string;
};

export async function createCheckIn(token: string, payload: CheckInCreatePayload) {
  return apiRequest<CheckIn>("/checkins", {
    method: "POST",
    body: JSON.stringify(payload),
  }, { token });
}

export async function getCheckIns(token: string, workspaceId?: string) {
  const url = workspaceId ? `/checkins?workspace_id=${workspaceId}` : "/checkins";
  return apiRequest<CheckIn[]>(url, {}, { token });
}

export async function getWeeklySummary(token: string, workspaceId?: string) {
  const url = workspaceId ? `/checkins/weekly-summary?workspace_id=${workspaceId}` : "/checkins/weekly-summary";
  return apiRequest<WeeklySummary>(url, {}, { token });
}

export async function getStreak(token: string, workspaceId?: string) {
  const url = workspaceId ? `/checkins/streak?workspace_id=${workspaceId}` : "/checkins/streak";
  return apiRequest<{ current_streak: number; longest_streak: number }>(url, {}, { token });
}
