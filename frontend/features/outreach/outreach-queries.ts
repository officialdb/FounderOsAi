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

import type { OutreachLog } from "@/services/outreach.service";

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
    onMutate: async (newOutreach) => {
      await queryClient.cancelQueries({ queryKey: ["outreach-logs", newOutreach.workspace_id] });
      const previousLogs = queryClient.getQueryData<OutreachLog[]>(["outreach-logs", newOutreach.workspace_id]);
      
      const optimisticLog: OutreachLog = {
        id: `temp-${Date.now()}`,
        workspace_id: newOutreach.workspace_id,
        contact_name: newOutreach.contact_name,
        contact_company: newOutreach.contact_company,
        contact_channel: newOutreach.contact_channel,
        status: newOutreach.status || "pending",
        follow_up_date: newOutreach.follow_up_date,
        notes: newOutreach.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData<OutreachLog[]>(["outreach-logs", newOutreach.workspace_id], (old) => {
        return old ? [...old, optimisticLog] : [optimisticLog];
      });

      return { previousLogs };
    },
    onError: (err, newOutreach, context) => {
      if (context?.previousLogs) {
        queryClient.setQueryData(["outreach-logs", newOutreach.workspace_id], context.previousLogs);
      }
    },
    onSettled: (data, error, variables) => {
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
    onMutate: async ({ id, workspaceId, payload }) => {
      await queryClient.cancelQueries({ queryKey: ["outreach-logs", workspaceId] });
      
      const previousLogs = queryClient.getQueryData<OutreachLog[]>(["outreach-logs", workspaceId]);
      
      queryClient.setQueryData<OutreachLog[]>(["outreach-logs", workspaceId], (old) => {
        if (!old) return old;
        return old.map(log => 
          log.id === id ? { ...log, ...payload, updated_at: new Date().toISOString() } as OutreachLog : log
        );
      });

      return { previousLogs };
    },
    onError: (err, variables, context) => {
      if (context?.previousLogs) {
        queryClient.setQueryData(["outreach-logs", variables.workspaceId], context.previousLogs);
      }
    },
    onSettled: (data, error, variables) => {
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
    onMutate: async ({ id, workspaceId }) => {
      await queryClient.cancelQueries({ queryKey: ["outreach-logs", workspaceId] });
      
      const previousLogs = queryClient.getQueryData<OutreachLog[]>(["outreach-logs", workspaceId]);
      
      queryClient.setQueryData<OutreachLog[]>(["outreach-logs", workspaceId], (old) => {
        if (!old) return old;
        return old.filter(log => log.id !== id);
      });

      return { previousLogs };
    },
    onError: (err, variables, context) => {
      if (context?.previousLogs) {
        queryClient.setQueryData(["outreach-logs", variables.workspaceId], context.previousLogs);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["outreach-logs", variables.workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["outreach-reminders", variables.workspaceId] });
    },
  });
}
