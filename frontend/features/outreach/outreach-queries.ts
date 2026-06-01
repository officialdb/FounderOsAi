import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/auth";
import {
  getOutreachLogs,
  createOutreachLog,
  updateOutreachLog,
  deleteOutreachLog,
  getFollowUpReminders,
  type OutreachCreatePayload,
  type OutreachUpdatePayload,
} from "@/services/outreach.service";

export function useOutreachLogs(workspaceId: string | null) {
  const token = getAuthToken();

  return useQuery({
    queryKey: ["outreach-logs", workspaceId],
    queryFn: () => getOutreachLogs(token ?? "", workspaceId!),
    enabled: Boolean(token && workspaceId),
  });
}

export function useFollowUpReminders(workspaceId: string | null) {
  const token = getAuthToken();

  return useQuery({
    queryKey: ["outreach-reminders", workspaceId],
    queryFn: () => getFollowUpReminders(token ?? "", workspaceId!),
    enabled: Boolean(token && workspaceId),
  });
}

export function useCreateOutreach() {
  const queryClient = useQueryClient();
  const token = getAuthToken();

  return useMutation({
    mutationFn: (payload: OutreachCreatePayload) => createOutreachLog(token ?? "", payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["outreach-logs", variables.workspace_id] });
      queryClient.invalidateQueries({ queryKey: ["outreach-reminders", variables.workspace_id] });
    },
  });
}

export function useUpdateOutreach() {
  const queryClient = useQueryClient();
  const token = getAuthToken();

  return useMutation({
    mutationFn: ({ id, workspaceId, payload }: { id: string; workspaceId: string; payload: OutreachUpdatePayload }) =>
      updateOutreachLog(token ?? "", id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["outreach-logs", variables.workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["outreach-reminders", variables.workspaceId] });
    },
  });
}

export function useDeleteOutreach() {
  const queryClient = useQueryClient();
  const token = getAuthToken();

  return useMutation({
    mutationFn: ({ id }: { id: string; workspaceId: string }) => deleteOutreachLog(token ?? "", id),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["outreach-logs", variables.workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["outreach-reminders", variables.workspaceId] });
    },
  });
}
