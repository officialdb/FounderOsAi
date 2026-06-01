"use client";

import * as React from "react";
import { Inbox, AlertTriangle, CalendarClock, LayoutGrid } from "lucide-react";
import { useWorkspaceStore } from "@/store/workspace-store";
import { useNotificationStore } from "@/store/notification-store";
import { NotificationDashboard } from "./components/notification-dashboard";
import { NotificationList } from "./components/notification-list";
import { LoadingState } from "@/components/feedback/loading-state";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { NotificationType } from "@/services/notification.service";

export function NotificationView() {
  const isWorkspaceHydrated = useWorkspaceStore((s) => s.isHydrated);
  const { activeTab, setActiveTab } = useNotificationStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isWorkspaceHydrated) {
    return (
      <div className="flex flex-col h-full bg-background min-h-[calc(100vh-64px)] pt-8">
        <LoadingState label="Loading Notification System..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Notification Center</h1>
        <p className="text-sm text-muted-foreground">Your operational awareness hub. Track alerts, reminders, and updates.</p>
      </div>

      <NotificationDashboard />

      <div className="space-y-4 pt-4">
        <Tabs 
          value={activeTab} 
          onValueChange={(val) => setActiveTab(val as NotificationType | "all")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4 max-w-md">
            <TabsTrigger value="all" className="flex gap-2 text-xs">
              <LayoutGrid className="h-3.5 w-3.5" /> All
            </TabsTrigger>
            <TabsTrigger value="inbox" className="flex gap-2 text-xs">
              <Inbox className="h-3.5 w-3.5" /> Inbox
            </TabsTrigger>
            <TabsTrigger value="alert" className="flex gap-2 text-xs">
              <AlertTriangle className="h-3.5 w-3.5" /> Alerts
            </TabsTrigger>
            <TabsTrigger value="reminder" className="flex gap-2 text-xs">
              <CalendarClock className="h-3.5 w-3.5" /> Reminders
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <NotificationList />
      </div>
    </div>
  );
}
