import { create } from "zustand";

type OutreachState = {
  isCreateModalOpen: boolean;
  setCreateModalOpen: (open: boolean) => void;
  activeRecordId: string | null;
  setActiveRecordId: (id: string | null) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
};

export const useOutreachStore = create<OutreachState>((set) => ({
  isCreateModalOpen: false,
  setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
  activeRecordId: null,
  setActiveRecordId: (id) => set({ activeRecordId: id }),
  statusFilter: "all",
  setStatusFilter: (status) => set({ statusFilter: status }),
  typeFilter: "all",
  setTypeFilter: (type) => set({ typeFilter: type }),
}));
