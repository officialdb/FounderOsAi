import * as React from "react";
import { Users, AlertCircle, TrendingUp, MessageCircle } from "lucide-react";
import { MetricCard } from "@/features/dashboard/metric-card";
import { useWorkspaceStore } from "@/store/workspace-store";
import { useOutreachLogs, useFollowUpReminders } from "@/features/outreach/outreach-queries";
import { Skeleton } from "@/components/ui/skeleton";

export function OutreachDashboard() {
  const workspaceId = useWorkspaceStore((s) => s.workspaceId);
  const { data: logs, isLoading: logsLoading } = useOutreachLogs(workspaceId);
  const { data: reminders, isLoading: remindersLoading } = useFollowUpReminders(workspaceId);

  if (logsLoading || remindersLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const followUpsDue = reminders?.due_follow_ups ?? 0;
  
  // Calculate Open Conversations (not closed and not pending)
  const openConversations = logs?.filter(log => log.status === "contacted" || log.status === "follow_up" || log.status === "responded").length ?? 0;
  
  // Activity this week
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const thisWeekLogs = logs?.filter(log => new Date(log.created_at) >= startOfWeek).length ?? 0;

  // Response rate
  const contactedTotal = logs?.filter(log => log.status !== "pending").length ?? 0;
  const respondedTotal = logs?.filter(log => log.status === "responded" || log.status === "closed").length ?? 0;
  const responseRate = contactedTotal > 0 ? Math.round((respondedTotal / contactedTotal) * 100) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Follow-Ups Due"
        value={followUpsDue}
        description="Requires your attention today"
        icon={AlertCircle}
        trend={{ value: reminders?.overdue_follow_ups ? `${reminders.overdue_follow_ups} overdue` : "All caught up", isNeutral: !reminders?.overdue_follow_ups, isPositive: false }}
      />
      <MetricCard
        title="Open Conversations"
        value={openConversations}
        description="Active dialogue in progress"
        icon={MessageCircle}
        trend={{ value: "Keep the momentum going", isNeutral: true }}
      />
      <MetricCard
        title="Outreach This Week"
        value={thisWeekLogs}
        description="New relationships initiated"
        icon={Users}
        trend={{ value: "Consistency is key", isNeutral: true }}
      />
      <MetricCard
        title="Response Rate"
        value={`${responseRate}%`}
        description="Conversion from initial contact"
        icon={TrendingUp}
        trend={{ value: "Based on active outreach", isNeutral: true }}
      />
    </div>
  );
}
