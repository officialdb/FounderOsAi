import { create } from "zustand";

type AITab = "content" | "insights" | "weekly" | "history";

type AIState = {
  activeTab: AITab;
  setActiveTab: (tab: AITab) => void;
};

export const useAIStore = create<AIState>((set) => ({
  activeTab: "content",
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
