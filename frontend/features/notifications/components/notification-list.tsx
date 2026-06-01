import * as React from "react";
import { Inbox, ShieldAlert, CheckCircle2 } from "lucide-react";
import { NotificationCard } from "./notification-card";
import { AlertCard } from "./alert-card";
import { ReminderCard } from "./reminder-card";
import { useWorkspaceStore } from "@/store/workspace-store";
import { useNotifications } from "@/features/notifications/notification-queries";
import { useNotificationStore } from "@/store/notification-store";
import { Skeleton } from "@/components/ui/skeleton";
import type { AppNotification } from "@/services/notification.service";

export function NotificationList() {
  const workspaceId = useWorkspaceStore((s) => s.workspaceId);
  const { data: notifications, isLoading } = useNotifications(workspaceId ?? undefined);
  const activeTab = useNotificationStore((s) => s.activeTab);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  let filteredList = notifications?.filter(n => !n.extra_metadata?.archived) ?? [];
  
  if (activeTab !== "all") {
    filteredList = filteredList.filter((n) => n.type === activeTab);
  }

  // Sort by unread first, then by date descending (except reminders which sort by scheduled date)
  filteredList.sort((a, b) => {
    if (a.is_read !== b.is_read) return a.is_read ? 1 : -1;
    
    if (a.type === "reminder" && b.type === "reminder") {
      const aDate = a.scheduled_for ? new Date(a.scheduled_for) : new Date(a.created_at);
      const bDate = b.scheduled_for ? new Date(b.scheduled_for) : new Date(b.created_at);
      return aDate.getTime() - bDate.getTime();
    }
    
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (filteredList.length === 0) {
    let message = "You're all caught up!";
    let Icon = CheckCircle2;
    
    if (activeTab === "alert") {
      message = "No active alerts. System healthy.";
      Icon = ShieldAlert;
    } else if (activeTab === "inbox") {
      message = "No new inbox messages.";
      Icon = Inbox;
    }

    return (
      <div className="rounded-xl border border-dashed p-12 text-center flex flex-col items-center justify-center">
        <div className="h-12 w-12 rounded-full bg-muted/50 text-muted-foreground flex items-center justify-center mb-4">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-semibold">{message}</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">
          There are no pending notifications for this category right now.
        </p>
      </div>
    );
  }

  const renderCard = (notification: AppNotification) => {
    switch (notification.type) {
      case "alert":
        return <AlertCard key={notification.id} alert={notification} />;
      case "reminder":
        return <ReminderCard key={notification.id} reminder={notification} />;
      default:
        return <NotificationCard key={notification.id} notification={notification} />;
    }
  };

  return (
    <div className="space-y-4">
      {filteredList.map(renderCard)}
    </div>
  );
}
