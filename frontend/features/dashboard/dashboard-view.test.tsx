import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { DashboardView } from "./dashboard-view";

const setWorkspaceId = vi.fn();
const setCheckInModalOpen = vi.fn();

vi.mock("@/features/dashboard/ai-panel", () => ({
  AiPanel: () => <div data-testid="ai-panel">AI panel</div>,
}));

vi.mock("@/features/dashboard/execution-chart", () => ({
  ExecutionChart: () => <div data-testid="execution-chart">Weekly Execution Trend</div>,
}));

vi.mock("@/features/dashboard/workspace-health-cards", () => ({
  WorkspaceHealthCards: () => <div data-testid="workspace-health">Workspace health</div>,
}));

vi.mock("@/features/dashboard/activity-timeline", () => ({
  ActivityTimeline: () => <div data-testid="activity-timeline">Recent activity</div>,
}));

vi.mock("@/features/workspaces/workspace-queries", () => ({
  useWorkspaces: () => ({
    data: [
      {
        id: "workspace-1",
        name: "Techpronnet",
      },
    ],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
  useWorkspace: () => ({
    data: {
      id: "workspace-1",
      name: "Techpronnet",
    },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/store/workspace-store", () => ({
  useWorkspaceStore: (selector: (state: {
    workspaceId: string | null;
    setWorkspaceId: typeof setWorkspaceId;
    isHydrated: boolean;
  }) => unknown) =>
    selector({
      workspaceId: "workspace-1",
      setWorkspaceId,
      isHydrated: true,
    }),
}));

vi.mock("@/store/checkin-store", () => ({
  useCheckInStore: () => ({
    setCheckInModalOpen,
  }),
}));

vi.mock("@/features/tasks/task-queries", () => ({
  useTasks: () => ({
    data: [
      {
        id: "task-1",
        workspace_id: "workspace-1",
        title: "Ship landing page",
        description: null,
        priority: "high",
        status: "done",
        due_date: null,
        completed_at: "2026-06-01T08:00:00.000Z",
        is_overdue: false,
        extra_metadata: {},
        created_at: "2026-06-01T07:00:00.000Z",
        updated_at: "2026-06-01T08:00:00.000Z",
      },
    ],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/features/checkins/checkin-queries", () => ({
  useWeeklySummary: () => ({
    data: {
      total_check_ins: 5,
      current_streak: 4,
      average_score: 88,
    },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
  useStreak: () => ({
    data: {
      current_streak: 4,
      longest_streak: 7,
    },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
  useCheckIns: () => ({
    data: [
      {
        id: "checkin-1",
        workspace_id: "workspace-1",
        check_in_date: "2026-06-01",
        completed_today: "Completed onboarding flow",
        blockers: "None",
        next_priorities: "Launch beta feedback",
        productivity_score: 90,
        extra_metadata: {},
        created_at: "2026-06-01T09:00:00.000Z",
        updated_at: "2026-06-01T09:00:00.000Z",
      },
    ],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/features/notifications/notification-queries", () => ({
  useNotificationSummary: () => ({
    data: {
      total_notifications: 3,
      unread_notifications: 1,
      unread_reminders: 1,
      unread_alerts: 0,
    },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/features/outreach/outreach-queries", () => ({
  useOutreachLogs: () => ({
    data: [
      {
        id: "outreach-1",
        workspace_id: "workspace-1",
        contact_name: "Ada",
        contact_company: "FounderOS",
        contact_channel: "email",
        status: "contacted",
        follow_up_date: null,
        notes: null,
        extra_metadata: {},
        created_at: "2026-06-01T10:00:00.000Z",
        updated_at: "2026-06-01T10:00:00.000Z",
      },
    ],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

describe("DashboardView", () => {
  beforeEach(() => {
    setWorkspaceId.mockReset();
    setCheckInModalOpen.mockReset();
  });

  it("loads the dashboard with the core operational widgets", () => {
    render(<DashboardView />);

    expect(screen.getByText("Welcome back, Founder")).toBeInTheDocument();
    expect(screen.getByText("Today's Tasks")).toBeInTheDocument();
    expect(screen.getByText("4 Days")).toBeInTheDocument();
    expect(screen.getByTestId("execution-chart")).toBeInTheDocument();
    expect(screen.getByTestId("workspace-health")).toBeInTheDocument();
    expect(screen.getByTestId("activity-timeline")).toBeInTheDocument();
    expect(screen.getByTestId("ai-panel")).toBeInTheDocument();
  });
});
