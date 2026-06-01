import { describe, expect, it } from "vitest";

import { buildExecutionChartData } from "./execution-chart";

describe("buildExecutionChartData", () => {
  it("builds a seven-day execution series from backend data", () => {
    const chartData = buildExecutionChartData(
      [
        {
          id: "task-1",
          workspace_id: "workspace-1",
          title: "Ship landing page",
          description: null,
          priority: "high",
          status: "done",
          due_date: null,
          completed_at: "2026-06-01T09:00:00.000Z",
          is_overdue: false,
          extra_metadata: {},
          created_at: "2026-06-01T08:00:00.000Z",
          updated_at: "2026-06-01T09:00:00.000Z",
        },
      ],
      [
        {
          id: "checkin-1",
          workspace_id: "workspace-1",
          check_in_date: "2026-06-01",
          completed_today: "Closed the beta support loop",
          blockers: "None",
          next_priorities: "Launch beta feedback",
          productivity_score: 90,
          extra_metadata: {},
          created_at: "2026-06-01T10:00:00.000Z",
          updated_at: "2026-06-01T10:00:00.000Z",
        },
      ],
      [
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
          created_at: "2026-06-01T11:00:00.000Z",
          updated_at: "2026-06-01T11:00:00.000Z",
        },
      ],
      new Date("2026-06-01T12:00:00.000Z"),
    );

    expect(chartData).toHaveLength(7);
    expect(chartData.at(-1)).toMatchObject({
      tasks: 1,
      checkins: 1,
      outreach: 1,
    });
  });
});
