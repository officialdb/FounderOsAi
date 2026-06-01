import { apiRequest } from "@/services/api-client";
import type { Workspace } from "@/types/workspace";

export type WorkspaceCreatePayload = {
  name: string;
  description?: string | null;
  color?: string | null;
};

export async function listWorkspaces(token: string) {
  return apiRequest<Workspace[]>("/workspaces", {}, { token });
}

export async function createWorkspace(token: string, payload: WorkspaceCreatePayload) {
  return apiRequest<Workspace>("/workspaces", {
    method: "POST",
    body: JSON.stringify(payload),
  }, { token });
}

export async function getWorkspace(token: string, workspaceId: string) {
  return apiRequest<Workspace>(`/workspaces/${workspaceId}`, {}, { token });
}
