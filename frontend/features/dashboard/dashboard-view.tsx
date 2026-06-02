"use client";

import * as React from "react";
import { CheckSquare, Activity, Flame, Send, Bell } from "lucide-react";

import { MetricCard } from "@/features/dashboard/metric-card";
import { AiPanel } from "@/features/dashboard/ai-panel";
import { ExecutionChart } from "@/features/dashboard/execution-chart";
import { WorkspaceHealthCards } from "@/features/dashboard/workspace-health-cards";
import { ActivityTimeline } from "@/features/dashboard/activity-timeline";
import { useDashboardData } from "@/features/dashboard/dashboard-query";
import { useCheckInStore } from "@/store/checkin-store";
import { useStreak, useCheckIns } from "@/features/checkins/checkin-queries";
import { useOutreachLogs } from "@/features/outreach/outreach-queries";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";

export function DashboardView() {
  const {
    workspacesQuery,
    tasksQuery,
    weeklySummaryQuery,
    notificationSummaryQuery,
  } = useDashboardData();

  const workspaces = workspacesQuery.data ?? [];
  const tasks = tasksQuery.data ?? [];
  const weeklySummary = weeklySummaryQuery.data ?? null;
  const unreadNotifications = notificationSummaryQuery.data?.unread_notifications ?? 0;
  const unreadReminders = notificationSummaryQuery.data?.unread_reminders ?? 0;

  const { data: streakData, isLoading: isStreakLoading } = useStreak();
  const { data: checkIns, isLoading: isCheckInsLoading } = useCheckIns();
  const { setCheckInModalOpen } = useCheckInStore();

  // Load outreach for dashboard metrics
  const { data: outreachLogs, isLoading: isOutreachLoading } = useOutreachLogs();

  const isLoading =
    workspacesQuery.isLoading ||
    tasksQuery.isLoading ||
    weeklySummaryQuery.isLoading ||
    notificationSummaryQuery.isLoading ||
    isStreakLoading ||
    isCheckInsLoading ||
    isOutreachLoading;

  const hasError =
    workspacesQuery.error ||
    tasksQuery.error ||
    weeklySummaryQuery.error ||
    notificationSummaryQuery.error;

  if (hasError) {
    return (
      <ErrorState
        message="We couldn’t load the dashboard data. Check your backend connection and try again."
        onRetry={() => {
          workspacesQuery.refetch();
          tasksQuery.refetch();
          weeklySummaryQuery.refetch();
          notificationSummaryQuery.refetch();
        }}
      />
    );
  }

  if (isLoading) {
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

  // Portfolio metrics
  const activeTasksCount = tasks.filter((task) => task.status !== "done").length;
  const todoTasks = tasks.filter((task) => task.status === "todo").length;
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress").length;
  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const overdueTasks = tasks.filter((task) => task.status === "overdue" || task.is_overdue).length;
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  
  const todayStr = new Date().toISOString().split("T")[0];
  const hasCheckedInToday = checkIns?.some((c) => c.created_at.startsWith(todayStr)) ?? false;
  
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const outreachThisWeek = outreachLogs?.filter((log) => new Date(log.created_at) >= startOfWeek).length ?? 0;
  const checkInsThisWeek = checkIns?.filter((checkIn) => new Date(checkIn.created_at) >= startOfWeek).length ?? 0;
  const avgWeeklyScore = weeklySummary?.average_score ?? null;
  const currentStreak = streakData?.current_streak ?? weeklySummary?.current_streak ?? null;
  const longestStreak = streakData?.longest_streak ?? weeklySummary?.longest_streak ?? null;
  const taskStatusBreakdown = [
    { label: "To Do", count: todoTasks, tone: "bg-slate-500" },
    { label: "In Progress", count: inProgressTasks, tone: "bg-blue-500" },
    { label: "Done", count: completedTasks, tone: "bg-emerald-500" },
    { label: "Overdue", count: overdueTasks, tone: "bg-destructive" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Portfolio Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your overall execution performance across all workspaces.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Active Workspaces"
          value={workspaces.length}
          description="Startup contexts currently in your portfolio."
          icon={Activity}
          trend={{ value: "All workspaces visible", isNeutral: true }}
        />
        <MetricCard
          title="Open Tasks"
          value={activeTasksCount}
          description="Tasks still requiring execution."
          icon={CheckSquare}
          trend={{ value: `${taskCompletionRate}% complete`, isNeutral: true }}
        />
        <div
          className="cursor-pointer transition-transform hover:scale-[1.02]"
          onClick={() => {
            if (!hasCheckedInToday) setCheckInModalOpen(true);
          }}
        >
          <MetricCard
            title="Weekly Productivity"
            value={avgWeeklyScore}
            description="Average check-in score across the portfolio."
            icon={Activity}
            trend={{ value: `${checkInsThisWeek} check-ins this week`, isNeutral: true }}
          />
        </div>
        <MetricCard
          title="Execution Streak"
          value={currentStreak !== null ? `${currentStreak} Days` : null}
          description="Consecutive days with recent execution."
          icon={Flame}
          trend={{ value: longestStreak !== null ? `Best: ${longestStreak} days` : "No streak yet", isNeutral: true }}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {taskStatusBreakdown.map((item) => (
          <div key={item.label} className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{item.label}</p>
              <span className={`h-2.5 w-2.5 rounded-full ${item.tone}`} />
            </div>
            <div className="mt-3 text-3xl font-semibold tracking-tight">{item.count}</div>
            <p className="mt-2 text-sm text-muted-foreground">
              {tasks.length > 0 ? `${Math.round((item.count / tasks.length) * 100)}% of your total task load` : "No tasks yet"}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <ExecutionChart tasks={tasks} checkIns={checkIns ?? []} outreachLogs={outreachLogs ?? []} />
        <div className="lg:col-span-1">
          <AiPanel />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Outreach Activity"
          value={outreachThisWeek}
          description="New relationships logged this week."
          icon={Send}
          trend={{ value: "Portfolio-wide", isNeutral: true }}
        />
        <MetricCard
          title="Notifications"
          value={unreadNotifications}
          description="Unread updates across the portfolio."
          icon={Bell}
          trend={{ value: unreadNotifications > 0 ? "Action pending" : "Clear inbox", isNeutral: unreadNotifications === 0, isPositive: unreadNotifications === 0 }}
        />
        <MetricCard
          title="Check-Ins This Week"
          value={checkInsThisWeek}
          description="Execution reflections captured in the last 7 days."
          icon={Activity}
          trend={{ value: weeklySummary?.missed_days ? `${weeklySummary.missed_days} missed days` : "On track", isNeutral: true }}
        />
        <MetricCard
          title="Task Completion"
          value={`${taskCompletionRate}%`}
          description="Completed tasks as a share of total tasks."
          icon={CheckSquare}
          trend={{ value: overdueTasks > 0 ? `${overdueTasks} overdue` : "No overdue tasks", isNeutral: overdueTasks === 0 }}
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold tracking-tight mb-4">Workspace Health</h2>
        <WorkspaceHealthCards workspaces={workspaces} tasks={tasks} checkIns={checkIns ?? []} outreachLogs={outreachLogs ?? []} />
      </section>

      <section>
        <ActivityTimeline tasks={tasks} checkIns={checkIns ?? []} outreachLogs={outreachLogs ?? []} />
      </section>
    </div>
  );
}
