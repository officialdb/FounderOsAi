import { create } from "zustand";

export type ViewMode = "list" | "board";

type TaskState = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  statusFilter: string[];
  setStatusFilter: (statuses: string[]) => void;
  toggleStatusFilter: (status: string) => void;

  priorityFilter: string[];
  setPriorityFilter: (priorities: string[]) => void;
  togglePriorityFilter: (priority: string) => void;

  workspaceFilter: string | "all";
  setWorkspaceFilter: (workspaceId: string | "all") => void;

  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  
  isTaskModalOpen: boolean;
  setTaskModalOpen: (isOpen: boolean) => void;
};

export const useTaskStore = create<TaskState>((set) => ({
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),

  statusFilter: [],
  setStatusFilter: (statuses) => set({ statusFilter: statuses }),
  toggleStatusFilter: (status) =>
    set((state) => ({
      statusFilter: state.statusFilter.includes(status)
        ? state.statusFilter.filter((s) => s !== status)
        : [...state.statusFilter, status],
    })),

  priorityFilter: [],
  setPriorityFilter: (priorities) => set({ priorityFilter: priorities }),
  togglePriorityFilter: (priority) =>
    set((state) => ({
      priorityFilter: state.priorityFilter.includes(priority)
        ? state.priorityFilter.filter((p) => p !== priority)
        : [...state.priorityFilter, priority],
    })),

  workspaceFilter: "all",
  setWorkspaceFilter: (workspaceId) => set({ workspaceFilter: workspaceId }),

  viewMode: "list",
  setViewMode: (mode) => set({ viewMode: mode }),

  selectedTaskId: null,
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),

  isTaskModalOpen: false,
  setTaskModalOpen: (isOpen) => set({ isTaskModalOpen: isOpen }),
}));
