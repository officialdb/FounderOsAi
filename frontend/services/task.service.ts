import { apiRequest } from "@/services/api-client";

export type TaskPriority = "low" | "medium" | "high" | "critical" | number;
export type TaskStatus = "todo" | "in_progress" | "done" | "overdue";

export function mapPriorityToInt(priority?: TaskPriority): number | undefined {
  if (typeof priority === "number") return priority;
  switch (priority) {
    case "low": return 1;
    case "medium": return 2;
    case "high": return 3;
    case "critical": return 4;
    default: return undefined;
  }
}

export type Task = {
  id: string;
  workspace_id: string;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string | null;
  completed_at?: string | null;
  is_overdue: boolean;
  extra_metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type TaskCreatePayload = {
  workspace_id: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  due_date?: string;
};

export type TaskUpdatePayload = Partial<TaskCreatePayload> & {
  status?: TaskStatus;
};

export async function listTasks(token: string, workspaceId?: string) {
  const url = workspaceId ? `/tasks?workspace_id=${workspaceId}` : `/tasks`;
  return apiRequest<Task[]>(url, {}, { token });
}

export async function createTask(token: string, payload: TaskCreatePayload) {
  const data = { ...payload };
  if (data.priority !== undefined) {
    data.priority = mapPriorityToInt(data.priority);
  }
  if (data.due_date === "") delete data.due_date;
  if (data.description === "") delete data.description;
  return apiRequest<Task>("/tasks", {
    method: "POST",
    body: JSON.stringify(data),
  }, { token });
}

export async function updateTask(token: string, taskId: string, payload: TaskUpdatePayload) {
  const data = { ...payload };
  if (data.priority !== undefined) {
    data.priority = mapPriorityToInt(data.priority);
  }
  if (data.due_date === "") delete data.due_date;
  if (data.description === "") delete data.description;
  return apiRequest<Task>(`/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  }, { token });
}

export async function deleteTask(token: string, taskId: string) {
  return apiRequest<{ success: boolean }>(`/tasks/${taskId}`, {
    method: "DELETE",
  }, { token });
}

