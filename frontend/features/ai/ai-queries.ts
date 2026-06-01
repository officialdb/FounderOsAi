import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/auth";
import {
  generateContent,
  generateFeedback,
  generateWeeklySummary,
  getAIHistory,
  getAIInsights,
} from "@/services/ai.service";

export function useAIHistory(workspaceId: string | null) {
  const token = getAuthToken();

  return useQuery({
    queryKey: ["ai-history", workspaceId],
    queryFn: () => getAIHistory(token ?? "", workspaceId!),
    enabled: Boolean(token && workspaceId),
  });
}

export function useAIInsights(workspaceId: string | null) {
  const token = getAuthToken();

  return useQuery({
    queryKey: ["ai-insights", workspaceId],
    queryFn: () => getAIInsights(token ?? "", workspaceId!),
    enabled: Boolean(token && workspaceId),
  });
}

export function useGenerateContent() {
  const queryClient = useQueryClient();
  const token = getAuthToken();

  return useMutation({
    mutationFn: (payload: { workspace_id: string; content_type: string; topic: string; tone?: string }) =>
      generateContent(token ?? "", payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["ai-history", variables.workspace_id] });
    },
  });
}

export function useGenerateFeedback() {
  const queryClient = useQueryClient();
  const token = getAuthToken();

  return useMutation({
    mutationFn: (workspaceId: string) => generateFeedback(token ?? "", workspaceId),
    onSuccess: (data, workspaceId) => {
      queryClient.invalidateQueries({ queryKey: ["ai-history", workspaceId] });
    },
  });
}

export function useGenerateWeeklySummary() {
  const queryClient = useQueryClient();
  const token = getAuthToken();

  return useMutation({
    mutationFn: (workspaceId: string) => generateWeeklySummary(token ?? "", workspaceId),
    onSuccess: (data, workspaceId) => {
      queryClient.invalidateQueries({ queryKey: ["ai-history", workspaceId] });
    },
  });
}
