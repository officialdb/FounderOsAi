import { create } from "zustand";
import type { NotificationType } from "@/services/notification.service";

type NotificationState = {
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  activeTab: NotificationType | "all";
  setActiveTab: (tab: NotificationType | "all") => void;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  isDrawerOpen: false,
  setDrawerOpen: (open) => set({ isDrawerOpen: open }),
  activeTab: "all",
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
