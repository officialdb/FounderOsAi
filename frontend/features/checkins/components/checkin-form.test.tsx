import { describe, expect, it, beforeEach, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

import { CheckInForm } from "./checkin-form";

const createCheckIn = vi.fn();
const setCheckInModalOpen = vi.fn();
const setShowSummaryAfterSubmit = vi.fn();

vi.mock("../checkin-queries", () => ({
  useCreateCheckIn: () => ({
    mutateAsync: createCheckIn,
    isPending: false,
  }),
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ open, children }: { open: boolean; children: ReactNode }) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
}));

vi.mock("@/store/checkin-store", () => ({
  useCheckInStore: (
    selector?: (state: {
      isCheckInModalOpen: boolean;
      setCheckInModalOpen: typeof setCheckInModalOpen;
      setShowSummaryAfterSubmit: typeof setShowSummaryAfterSubmit;
    }) => unknown,
  ) => {
    const state = {
      isCheckInModalOpen: true,
      setCheckInModalOpen,
      setShowSummaryAfterSubmit,
    };

    return selector ? selector(state) : state;
  },
}));

vi.mock("@/store/workspace-store", () => ({
  useWorkspaceStore: (selector: (state: { workspaceId: string | null }) => unknown) =>
    selector({ workspaceId: "workspace-1" }),
}));

describe("CheckInForm", () => {
  beforeEach(() => {
    createCheckIn.mockReset();
    setCheckInModalOpen.mockReset();
    setShowSummaryAfterSubmit.mockReset();
  });

  it("submits a daily check-in", async () => {
    render(<CheckInForm />);

    fireEvent.change(
      screen.getByPlaceholderText(/Completed landing page redesign/i),
      { target: { value: "Closed the beta support loop and finished onboarding copy." } },
    );
    fireEvent.click(screen.getAllByRole("button", { name: /Next/i })[0]);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Waiting for client feedback/i)).toBeInTheDocument();
    });

    fireEvent.change(
      screen.getByPlaceholderText(/Waiting for client feedback/i),
      { target: { value: "None" } },
    );
    fireEvent.click(screen.getAllByRole("button", { name: /Next/i })[1]);
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Finish outreach campaign/i)).toBeInTheDocument();
    });

    fireEvent.change(
      screen.getByPlaceholderText(/Finish outreach campaign/i),
      { target: { value: "Launch the task cleanup pass and review analytics." } },
    );
    fireEvent.click(screen.getByRole("button", { name: /Submit Check-In/i }));
    await waitFor(() => {
      expect(createCheckIn).toHaveBeenCalled();
    });

    expect(createCheckIn).toHaveBeenCalledWith({
      workspace_id: "workspace-1",
      completed_today: "Closed the beta support loop and finished onboarding copy.",
      blockers: "None",
      next_priorities: "Launch the task cleanup pass and review analytics.",
    });
    expect(setCheckInModalOpen).toHaveBeenCalledWith(false);
    expect(setShowSummaryAfterSubmit).toHaveBeenCalledWith(true);
  });
});
