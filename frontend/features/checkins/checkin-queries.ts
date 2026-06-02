import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCheckIns, getWeeklySummary, getStreak, createCheckIn, CheckInCreatePayload } from "@/services/checkin.service";
import { getAuthToken } from "@/lib/auth";

export function useCheckIns(workspaceId?: string | null) {
  const token = getAuthToken();

  return useQuery({
    queryKey: ["checkins", workspaceId ?? "all"],
    queryFn: () => getCheckIns(token ?? "", workspaceId ?? undefined),
    enabled: Boolean(token),
  });
}

export function useWeeklySummary(workspaceId?: string | null) {
  const token = getAuthToken();

  return useQuery({
    queryKey: ["weeklySummary", workspaceId ?? "all"],
    queryFn: () => getWeeklySummary(token ?? "", workspaceId ?? undefined),
    enabled: Boolean(token),
  });
}

export function useStreak(workspaceId?: string | null) {
  const token = getAuthToken();

  return useQuery({
    queryKey: ["streak", workspaceId ?? "all"],
    queryFn: () => getStreak(token ?? "", workspaceId ?? undefined),
    enabled: Boolean(token),
  });
}

export function useCreateCheckIn() {
  const queryClient = useQueryClient();
  const token = getAuthToken();

  return useMutation({
    mutationFn: (payload: CheckInCreatePayload) => createCheckIn(token ?? "", payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["checkins"] });
      queryClient.invalidateQueries({ queryKey: ["weeklySummary"] });
      queryClient.invalidateQueries({ queryKey: ["streak"] });
      queryClient.invalidateQueries({ queryKey: ["checkins", variables.workspace_id] });
      queryClient.invalidateQueries({ queryKey: ["weeklySummary", variables.workspace_id] });
      queryClient.invalidateQueries({ queryKey: ["streak", variables.workspace_id] });
    },
  });
}
