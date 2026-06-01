import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type WorkspaceState = {
  workspaceId: string | null;
  isHydrated: boolean;
  setWorkspaceId: (workspaceId: string | null) => void;
  setHydrated: (value: boolean) => void;
};

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      workspaceId: null,
      isHydrated: false,
      setWorkspaceId: (workspaceId) => set({ workspaceId }),
      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: "founderos-workspace",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      partialize: (state) => ({ workspaceId: state.workspaceId }),
    },
  ),
);
