import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TaskCard } from "./task-card";
import type { Task } from "@/services/task.service";

const updateTask = vi.fn();
const deleteTask = vi.fn();
const setSelectedTaskId = vi.fn();

vi.mock("../task-queries", () => ({
  useUpdateTask: () => ({ mutate: updateTask }),
  useDeleteTask: () => ({ mutate: deleteTask }),
}));

vi.mock("@/store/task-store", () => ({
  useTaskStore: (selector: (state: { setSelectedTaskId: typeof setSelectedTaskId }) => unknown) =>
    selector({ setSelectedTaskId }),
}));

vi.mock("@/features/workspaces/workspace-queries", () => ({
  useWorkspaces: () => ({
    data: [
      {
        id: "workspace-1",
        name: "Techpronnet",
      },
    ],
  }),
}));

describe("TaskCard", () => {
  beforeEach(() => {
    updateTask.mockReset();
    deleteTask.mockReset();
    setSelectedTaskId.mockReset();
  });

  it("marks a task done from the list view", async () => {
    const user = userEvent.setup();
    const task: Task = {
      id: "task-1",
      workspace_id: "workspace-1",
      title: "Ship landing page",
      description: null,
      priority: "high",
      status: "todo",
      due_date: null,
      completed_at: null,
      is_overdue: false,
      extra_metadata: {},
      created_at: "2026-06-01T00:00:00.000Z",
      updated_at: "2026-06-01T00:00:00.000Z",
    };

    render(<TaskCard task={task} />);

    const buttons = screen.getAllByRole("button");
    await user.click(buttons[0]);

    expect(updateTask).toHaveBeenCalledWith({
      taskId: "task-1",
      payload: { status: "done" },
    });
  });
});
