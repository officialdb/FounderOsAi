import * as React from "react";
import { Inbox, AlertTriangle, CalendarClock } from "lucide-react";
import { MetricCard } from "@/features/dashboard/metric-card";
import { useWorkspaceStore } from "@/store/workspace-store";
import { useNotificationSummary } from "@/features/notifications/notification-queries";
import { Skeleton } from "@/components/ui/skeleton";

export function NotificationDashboard() {
  const workspaceId = useWorkspaceStore((s) => s.workspaceId);
  const { data: summary, isLoading } = useNotificationSummary(workspaceId ?? undefined);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const unreadCount = summary?.unread_notifications ?? 0;
  const alertCount = summary?.unread_alerts ?? 0;
  const reminderCount = summary?.unread_reminders ?? 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <MetricCard
        title="Inbox"
        value={unreadCount}
        description="Unread notifications"
        icon={Inbox}
        trend={{ value: unreadCount > 0 ? "Requires review" : "All caught up", isNeutral: unreadCount === 0, isPositive: unreadCount === 0 }}
      />
      <MetricCard
        title="Active Alerts"
        value={alertCount}
        description="Require immediate attention"
        icon={AlertTriangle}
        trend={{ value: alertCount > 0 ? `${alertCount} risks detected` : "System healthy", isPositive: alertCount === 0, isNeutral: alertCount > 0 }}
      />
      <MetricCard
        title="Reminders"
        value={reminderCount}
        description="Upcoming scheduled actions"
        icon={CalendarClock}
        trend={{ value: "Keep momentum going", isNeutral: true }}
      />
    </div>
  );
}
