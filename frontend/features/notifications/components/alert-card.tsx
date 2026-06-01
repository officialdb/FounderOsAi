import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, AlertCircle, AlertOctagon, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppNotification } from "@/services/notification.service";
import { useUpdateNotification } from "@/features/notifications/notification-queries";
import { Badge } from "@/components/ui/badge";

export function AlertCard({ alert }: { alert: AppNotification }) {
  const update = useUpdateNotification();

  const handleDismiss = () => {
    update.mutate({ id: alert.id, payload: { extra_metadata: { ...alert.extra_metadata, archived: true }, is_read: true } });
  };

  if (alert.extra_metadata?.archived) return null;

  const priority = alert.extra_metadata?.priority || "Medium";
  
  let Icon = AlertTriangle;
  let colorClass = "bg-orange-500/10 text-orange-500 border-orange-500/20";
  let badgeVariant: "default" | "destructive" | "secondary" | "outline" = "outline";

  if (priority === "Critical") {
    Icon = AlertOctagon;
    colorClass = "bg-red-500/10 text-red-500 border-red-500/20";
    badgeVariant = "destructive";
  } else if (priority === "High") {
    Icon = AlertCircle;
    colorClass = "bg-rose-500/10 text-rose-500 border-rose-500/20";
    badgeVariant = "destructive";
  } else if (priority === "Low") {
    Icon = CheckCircle2;
    colorClass = "bg-blue-500/10 text-blue-500 border-blue-500/20";
    badgeVariant = "secondary";
  }

  const recommendedAction = alert.extra_metadata?.recommended_action;

  return (
    <div className={`rounded-xl border p-5 transition-all ${colorClass} ${alert.is_read ? "opacity-75" : "shadow-sm"}`}>
      <div className="flex gap-4">
        <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background/50`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant={badgeVariant} className="text-[10px] uppercase tracking-wider px-1.5 py-0">
                  {priority}
                </Badge>
                <h4 className="text-sm font-semibold text-foreground truncate">{alert.title}</h4>
              </div>
              <span className="text-xs opacity-80 block">
                {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
          
          <p className="text-sm text-foreground/90 leading-relaxed">{alert.message}</p>
          
          {recommendedAction && (
            <div className="mt-3 bg-background/50 rounded-lg p-3 text-sm text-foreground border border-black/5 dark:border-white/5">
              <span className="font-semibold mr-2">Recommendation:</span>
              {recommendedAction}
            </div>
          )}
          
          <div className="flex items-center gap-2 pt-2">
            <Button size="sm" variant="outline" className="h-8 text-xs bg-background hover:bg-background/80" onClick={handleDismiss}>
              Dismiss Alert
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
