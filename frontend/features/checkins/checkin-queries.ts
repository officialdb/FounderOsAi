import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCheckIns, getWeeklySummary, getStreak, createCheckIn, CheckInCreatePayload } from "@/services/checkin.service";
import { getAuthToken } from "@/lib/auth";

export function useCheckIns(workspaceId: string | null) {
  const token = getAuthToken();

  return useQuery({
    queryKey: ["checkins", workspaceId],
    queryFn: () => getCheckIns(token ?? "", workspaceId!),
    enabled: Boolean(token && workspaceId),
  });
}

export function useWeeklySummary(workspaceId: string | null) {
  const token = getAuthToken();

  return useQuery({
    queryKey: ["weekly-summary", workspaceId],
    queryFn: () => getWeeklySummary(token ?? "", workspaceId!),
    enabled: Boolean(token && workspaceId),
  });
}

export function useStreak(workspaceId: string | null) {
  const token = getAuthToken();

  return useQuery({
    queryKey: ["streak", workspaceId],
    queryFn: () => getStreak(token ?? "", workspaceId!),
    enabled: Boolean(token && workspaceId),
  });
}

export function useCreateCheckIn() {
  const queryClient = useQueryClient();
  const token = getAuthToken();

  return useMutation({
    mutationFn: (payload: CheckInCreatePayload) => createCheckIn(token ?? "", payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["checkins", variables.workspace_id] });
      queryClient.invalidateQueries({ queryKey: ["weekly-summary", variables.workspace_id] });
      queryClient.invalidateQueries({ queryKey: ["streak", variables.workspace_id] });
    },
  });
}
