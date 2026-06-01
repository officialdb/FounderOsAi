import * as React from "react";
import { useRouter } from "next/navigation";
import { Bell, ChevronRight, Inbox, ShieldAlert, CalendarClock } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotificationStore } from "@/store/notification-store";
import { useNotifications, useNotificationSummary } from "@/features/notifications/notification-queries";
import { useWorkspaceStore } from "@/store/workspace-store";
import { formatDistanceToNow } from "date-fns";
import type { AppNotification } from "@/services/notification.service";

export function NotificationBell() {
  const router = useRouter();
  const { isDrawerOpen, setDrawerOpen } = useNotificationStore();
  const workspaceId = useWorkspaceStore((s) => s.workspaceId);
  const { data: summary } = useNotificationSummary(workspaceId ?? undefined);
  const { data: notifications } = useNotifications(workspaceId ?? undefined);

  const unreadCount = summary?.unread_notifications ?? 0;
  
  // Show max 5 recent unread notifications in drawer
  const recentUnread = notifications
    ?.filter((n) => !n.is_read && !n.extra_metadata?.archived)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5) ?? [];

  const handleOpenCenter = () => {
    setDrawerOpen(false);
    router.push("/notifications");
  };

  const getIcon = (type: string) => {
    if (type === "alert") return <ShieldAlert className="h-4 w-4 text-rose-500" />;
    if (type === "reminder") return <CalendarClock className="h-4 w-4 text-emerald-500" />;
    return <Inbox className="h-4 w-4 text-primary" />;
  };

  return (
    <Sheet open={isDrawerOpen} onOpenChange={setDrawerOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-sm flex flex-col p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center justify-between text-base">
            Notifications
            {unreadCount > 0 && <Badge variant="secondary">{unreadCount} unread</Badge>}
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto">
          {recentUnread.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center opacity-70">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Bell className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">You're all caught up!</p>
              <p className="text-xs text-muted-foreground mt-1">No new notifications right now.</p>
            </div>
          ) : (
            <div className="divide-y">
              {recentUnread.map((notification: AppNotification) => (
                <div key={notification.id} className="p-4 hover:bg-muted/50 transition-colors flex gap-3">
                  <div className="mt-0.5 shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="text-sm font-medium leading-none text-foreground truncate">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/80 pt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t bg-muted/20">
          <Button variant="default" className="w-full" onClick={handleOpenCenter}>
            Open Notification Center
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
