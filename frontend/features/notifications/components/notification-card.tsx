import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check, Archive, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppNotification } from "@/services/notification.service";
import { useMarkNotificationRead, useUpdateNotification } from "@/features/notifications/notification-queries";

export function NotificationCard({ notification }: { notification: AppNotification }) {
  const markRead = useMarkNotificationRead();
  const update = useUpdateNotification();

  const handleMarkRead = () => {
    if (!notification.is_read) markRead.mutate(notification.id);
  };

  const handleArchive = () => {
    update.mutate({ id: notification.id, payload: { extra_metadata: { ...notification.extra_metadata, archived: true } } });
  };

  if (notification.extra_metadata?.archived) return null;

  return (
    <div className={`rounded-xl border p-4 transition-all ${notification.is_read ? "bg-card opacity-70" : "bg-card/50 border-primary/30 shadow-sm"}`}>
      <div className="flex gap-4">
        <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${notification.is_read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>
          <Bell className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className={`text-sm font-semibold truncate ${!notification.is_read && "text-primary"}`}>
              {notification.title}
            </h4>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{notification.message}</p>
          
          <div className="flex items-center gap-2 pt-2">
            {!notification.is_read && (
              <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" onClick={handleMarkRead}>
                <Check className="h-3.5 w-3.5 mr-1" /> Mark Read
              </Button>
            )}
            <Button size="sm" variant="ghost" className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground" onClick={handleArchive}>
              <Archive className="h-3.5 w-3.5 mr-1" /> Archive
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
