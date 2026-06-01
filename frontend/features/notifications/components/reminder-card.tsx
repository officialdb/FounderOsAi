import * as React from "react";
import { format, isBefore, startOfDay } from "date-fns";
import { CalendarClock, Check, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppNotification } from "@/services/notification.service";
import { useUpdateNotification } from "@/features/notifications/notification-queries";

export function ReminderCard({ reminder }: { reminder: AppNotification }) {
  const update = useUpdateNotification();

  const handleComplete = () => {
    update.mutate({ id: reminder.id, payload: { extra_metadata: { ...reminder.extra_metadata, archived: true }, is_read: true } });
  };

  const handleReschedule = () => {
    // Increment the scheduled_for date by 1 day
    if (!reminder.scheduled_for) return;
    const nextDate = new Date(reminder.scheduled_for);
    nextDate.setDate(nextDate.getDate() + 1);
    update.mutate({ id: reminder.id, payload: { scheduled_for: nextDate.toISOString() } });
  };

  if (reminder.extra_metadata?.archived) return null;

  const dueDate = reminder.scheduled_for ? new Date(reminder.scheduled_for) : new Date(reminder.created_at);
  const isOverdue = isBefore(dueDate, startOfDay(new Date()));

  return (
    <div className={`rounded-xl border p-4 transition-all ${isOverdue ? "bg-red-500/5 border-red-500/20" : "bg-card"}`}>
      <div className="flex gap-4">
        <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isOverdue ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"}`}>
          <CalendarClock className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold truncate">
              {reminder.title}
              {isOverdue && <span className="ml-2 text-[10px] uppercase tracking-wider text-red-500 font-bold">Overdue</span>}
            </h4>
            <div className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-full">
              <CalendarDays className="h-3 w-3" />
              {format(dueDate, "MMM d")}
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{reminder.message}</p>
          
          <div className="flex items-center gap-2 pt-2">
            <Button size="sm" variant="default" className="h-8 px-3 text-xs" onClick={handleComplete}>
              <Check className="h-3.5 w-3.5 mr-1" /> Complete
            </Button>
            <Button size="sm" variant="outline" className="h-8 px-3 text-xs" onClick={handleReschedule}>
              Reschedule +1D
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
