import type { NotificationSummaryResponse } from "@/services/notification.service";
import type { WeeklySummary } from "@/services/checkin.service";
import type { Task } from "@/services/task.service";
import type { Workspace } from "@/types/workspace";

export type DashboardSnapshot = {
  workspaces: Workspace[];
  selectedWorkspace: Workspace | null;
  tasks: Task[];
  weeklySummary: WeeklySummary | null;
  notificationSummary: NotificationSummaryResponse | null;
};

