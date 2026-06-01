import { create } from "zustand";

type CheckInState = {
  isCheckInModalOpen: boolean;
  setCheckInModalOpen: (isOpen: boolean) => void;
  // We can track the state of a checkin summary view as well
  showSummaryAfterSubmit: boolean;
  setShowSummaryAfterSubmit: (show: boolean) => void;
};

export const useCheckInStore = create<CheckInState>((set) => ({
  isCheckInModalOpen: false,
  setCheckInModalOpen: (isOpen) => set({ isCheckInModalOpen: isOpen }),
  showSummaryAfterSubmit: false,
  setShowSummaryAfterSubmit: (show) => set({ showSummaryAfterSubmit: show }),
}));
