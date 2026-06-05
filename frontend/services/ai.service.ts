import { apiRequest } from "@/services/api-client";

export type AIInsight = {
  category: string;
  insight: string;
  recommended_action: string;
  priority_level: "Critical" | "High" | "Medium" | "Low";
};

export type AIGeneration = {
  id: string;
  workspace_id: string;
  generation_type: string;
  prompt: string;
  response_text: string;
  model_name: string;
  extra_metadata: Record<string, unknown>;
  created_at: string;
};

export type AIWeeklySummary = {
  workspace_id: string;
  summary: string;
  highlights: string[];
  risks: string[];
  next_week_focus: string[];
};

export type AIFeedback = {
  summary: string;
  strengths: string[];
  improvements: string[];
  next_actions: string[];
};

export async function generateContent(token: string, payload: Record<string, unknown>) {
  return apiRequest<AIGeneration>("/ai/content", {
    method: "POST",
    body: JSON.stringify(payload),
  }, { token });
}

export async function generateFeedback(token: string, workspaceId: string) {
  return apiRequest<AIFeedback>("/ai/feedback", {
    method: "POST",
    body: JSON.stringify({ workspace_id: workspaceId }),
  }, { token });
}

export async function generateWeeklySummary(token: string, workspaceId: string) {
  return apiRequest<AIWeeklySummary>("/ai/weekly-summary", {
    method: "POST",
    body: JSON.stringify({ workspace_id: workspaceId }),
  }, { token });
}

export async function getAIHistory(token: string, workspaceId: string) {
  return apiRequest<AIGeneration[]>(`/ai/history?workspace_id=${workspaceId}`, {}, { token });
}

export async function getAIInsights(token: string, workspaceId: string) {
  return apiRequest<AIInsight[]>(`/ai/insights?workspace_id=${workspaceId}`, {}, { token });
}

