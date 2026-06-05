import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";

import { TaskModal } from "./task-modal";

const createTask = vi.fn();
const setTaskModalOpen = vi.fn();
const taskWorkspaces = [
  {
    id: "workspace-1",
    name: "Techpronnet",
  },
];

vi.mock("../task-queries", () => ({
  useCreateTask: () => ({
    mutateAsync: createTask,
    isPending: false,
  }),
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ open, children }: { open: boolean; children: ReactNode }) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
  DialogFooter: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({
    children,
    value,
    onValueChange,
  }: {
    children: ReactNode;
    value?: string;
    onValueChange?: (value: string) => void;
  }) => (
    <div data-value={value} data-onvaluechange={Boolean(onValueChange)}>
      {children}
    </div>
  ),
  SelectContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children, value }: { children: ReactNode; value: string }) => (
    <div data-value={value}>{children}</div>
  ),
  SelectTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
}));

vi.mock("@/store/task-store", () => ({
  useTaskStore: (
    selector?: (state: { isTaskModalOpen: boolean; setTaskModalOpen: typeof setTaskModalOpen }) => unknown,
  ) => {
    const state = {
      isTaskModalOpen: true,
      setTaskModalOpen,
    };

    return selector ? selector(state) : state;
  },
}));

vi.mock("@/store/workspace-store", () => ({
  useWorkspaceStore: (selector: (state: { workspaceId: string | null }) => unknown) =>
    selector({ workspaceId: "workspace-1" }),
}));

vi.mock("@/features/workspaces/workspace-queries", () => ({
  useWorkspaces: () => ({
    data: taskWorkspaces,
  }),
}));

describe("TaskModal", () => {
  beforeEach(() => {
    createTask.mockReset();
    setTaskModalOpen.mockReset();
  });

  it("creates a task from the modal", async () => {
    const user = userEvent.setup();

    render(<TaskModal />);

    await user.type(screen.getByPlaceholderText("Task title"), "Ship onboarding");
    await user.type(screen.getByPlaceholderText("Description (optional)"), "Complete the first beta flow");
    await user.click(screen.getByRole("button", { name: "Create Task" }));

    expect(createTask).toHaveBeenCalledWith({
      title: "Ship onboarding",
      description: "Complete the first beta flow",
      workspace_id: "workspace-1",
      priority: "medium",
      due_date: "",
    });
    expect(setTaskModalOpen).toHaveBeenCalledWith(false);
  });
});
