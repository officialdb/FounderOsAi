"use client";

import * as React from "react";
import { CheckSquare, Activity, Flame, Send } from "lucide-react";

import { MetricCard } from "@/features/dashboard/metric-card";
import { AiPanel } from "@/features/dashboard/ai-panel";
import { ExecutionChart } from "@/features/dashboard/execution-chart";
import { WorkspaceHealthCards } from "@/features/dashboard/workspace-health-cards";
import { ActivityTimeline } from "@/features/dashboard/activity-timeline";
import { useDashboardData } from "@/features/dashboard/dashboard-query";
import { useWorkspaceStore } from "@/store/workspace-store";
import { useCheckInStore } from "@/store/checkin-store";
import { useStreak, useCheckIns } from "@/features/checkins/checkin-queries";
import { useOutreachLogs } from "@/features/outreach/outreach-queries";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";

export function DashboardView() {
  const workspaceId = useWorkspaceStore((state) => state.workspaceId);
  const setWorkspaceId = useWorkspaceStore((state) => state.setWorkspaceId);
  const isWorkspaceHydrated = useWorkspaceStore((state) => state.isHydrated);
  const {
    workspacesQuery,
    selectedWorkspaceQuery,
    tasksQuery,
    weeklySummaryQuery,
    notificationSummaryQuery,
  } = useDashboardData();

  const workspaces = workspacesQuery.data ?? [];
  const workspace = selectedWorkspaceQuery.data ?? workspaces[0] ?? null;
  const tasks = tasksQuery.data ?? [];
  const weeklySummary = weeklySummaryQuery.data ?? null;

  const { data: streakData, isLoading: isStreakLoading } = useStreak(workspaceId);
  const { data: checkIns, isLoading: isCheckInsLoading } = useCheckIns(workspaceId);
  const { setCheckInModalOpen } = useCheckInStore();

  // Load outreach for dashboard metrics
  const { data: outreachLogs, isLoading: isOutreachLoading } = useOutreachLogs(workspaceId);

  const isLoading =
    workspacesQuery.isLoading ||
    selectedWorkspaceQuery.isLoading ||
    tasksQuery.isLoading ||
    weeklySummaryQuery.isLoading ||
    notificationSummaryQuery.isLoading ||
    isStreakLoading ||
    isCheckInsLoading ||
    isOutreachLoading;

  const hasError =
    workspacesQuery.error ||
    selectedWorkspaceQuery.error ||
    tasksQuery.error ||
    weeklySummaryQuery.error ||
    notificationSummaryQuery.error;

  React.useEffect(() => {
    if (isWorkspaceHydrated && !workspaceId && workspaces.length > 0) {
      setWorkspaceId(workspaces[0].id);
    }
  }, [isWorkspaceHydrated, setWorkspaceId, workspaceId, workspaces]);

  if (hasError) {
    return (
      <ErrorState
        message="We couldn’t load the dashboard data. Check your backend connection and try again."
        onRetry={() => {
          workspacesQuery.refetch();
          selectedWorkspaceQuery.refetch();
          tasksQuery.refetch();
          weeklySummaryQuery.refetch();
          notificationSummaryQuery.refetch();
        }}
      />
    );
  }

  if (isLoading || !isWorkspaceHydrated) {
    return (
      <div className="space-y-4">
        <LoadingState label="Loading dashboard..." />
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <EmptyState
        title="No workspace yet"
        message="Create your first startup workspace to start tracking tasks, check-ins, outreach, and AI insights."
      />
    );
  }

  // Calculate metrics
  const activeTasksCount = tasks.filter((task) => task.status !== "done").length;
  const completionRate = weeklySummary ? Math.round((weeklySummary.total_check_ins / 7) * 100) : 0;
  
  const todayStr = new Date().toISOString().split("T")[0];
  const hasCheckedInToday = checkIns?.some(c => c.created_at.startsWith(todayStr)) ?? false;
  
  // Calculate Outreach Activity this week
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const outreachThisWeek = outreachLogs?.filter(log => new Date(log.created_at) >= startOfWeek).length ?? 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back, Founder</h1>
        <p className="text-sm text-muted-foreground">Here is what needs your attention today.</p>
      </div>

      {/* Row 1 — Founder Metrics */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Today's Tasks"
          value={activeTasksCount}
          description="Tasks left to complete today."
          icon={CheckSquare}
          trend={{ value: "Keep pushing", isNeutral: true }}
        />
        <div 
          className="cursor-pointer transition-transform hover:scale-[1.02]"
          onClick={() => {
            if (!hasCheckedInToday) setCheckInModalOpen(true);
          }}
        >
          <MetricCard
            title="Today's Status"
            value={hasCheckedInToday ? "Completed" : "Missing"}
            description={hasCheckedInToday ? "Great job checking in today!" : "Click to complete your check-in."}
            icon={Activity}
            trend={{ value: hasCheckedInToday ? "Streak maintained" : "At risk", isPositive: hasCheckedInToday, isNeutral: !hasCheckedInToday }}
          />
        </div>
        <MetricCard
          title="Accountability Streak"
          value={`${streakData?.current_streak ?? 0} Days`}
          description="Consecutive days with logged activity."
          icon={Flame}
          trend={{ value: "Keep it up", isNeutral: true }}
        />
        <MetricCard
          title="Outreach Activity"
          value={outreachThisWeek}
          description="New relationships this week."
          icon={Send}
          trend={{ value: "Consistency is key", isNeutral: true }}
        />
      </section>

      {/* Row 2 — Execution Analytics & Right Panel */}
      <section className="grid gap-4 lg:grid-cols-3">
        <ExecutionChart />
        <div className="lg:col-span-1">
          <AiPanel />
        </div>
      </section>

      {/* Row 3 — Workspace Health */}
      <section>
        <h2 className="text-lg font-semibold tracking-tight mb-4">Workspace Health</h2>
        <WorkspaceHealthCards workspaces={workspaces} />
      </section>

      {/* Row 4 — Recent Activity */}
      <section>
        <ActivityTimeline />
      </section>
    </div>
  );
}
