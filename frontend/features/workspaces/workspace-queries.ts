import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/auth";
import { listWorkspaces, getWorkspace, createWorkspace, type WorkspaceCreatePayload } from "@/services/workspace.service";

export function useWorkspaces() {
  const token = getAuthToken();

  return useQuery({
    queryKey: ["workspaces"],
    queryFn: () => listWorkspaces(token ?? ""),
    enabled: Boolean(token),
  });
}

export function useWorkspace(workspaceId: string | null) {
  const token = getAuthToken();

  return useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => getWorkspace(token ?? "", workspaceId!),
    enabled: Boolean(token && workspaceId),
  });
}

export function useCreateWorkspace() {
  const token = getAuthToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: WorkspaceCreatePayload) => createWorkspace(token ?? "", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}
