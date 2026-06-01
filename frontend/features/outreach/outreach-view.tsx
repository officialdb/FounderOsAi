"use client";

import * as React from "react";
import { Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWorkspaceStore } from "@/store/workspace-store";
import { useOutreachStore } from "@/store/outreach-store";
import { OutreachDashboard } from "./components/outreach-dashboard";
import { FollowUpCenter } from "./components/follow-up-center";
import { OutreachTable } from "./components/outreach-table";
import { OutreachModal } from "./components/outreach-modal";
import { OutreachDrawer } from "./components/outreach-drawer";
import { LoadingState } from "@/components/feedback/loading-state";

export function OutreachView() {
  const isWorkspaceHydrated = useWorkspaceStore((s) => s.isHydrated);
  const { setCreateModalOpen, statusFilter, setStatusFilter, typeFilter, setTypeFilter } = useOutreachStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isWorkspaceHydrated) {
    return (
      <div className="flex flex-col h-full bg-background min-h-[calc(100vh-64px)] pt-8">
        <LoadingState label="Loading Outreach System..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Outreach</h1>
          <p className="text-sm text-muted-foreground">Manage relationships and track follow-ups.</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} className="rounded-xl w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          New Outreach
        </Button>
      </div>

      <OutreachDashboard />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold tracking-tight">Outreach Pipeline</h2>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-[130px] text-xs">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="follow_up">Follow-Up</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-8 w-[130px] text-xs">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="investor">Investor</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <OutreachTable />
        </div>
        
        <div className="space-y-4">
          <FollowUpCenter />
        </div>
      </div>

      <OutreachModal />
      <OutreachDrawer />
    </div>
  );
}
