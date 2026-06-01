import * as React from "react";
import { AlertCircle, CalendarClock, ChevronRight, MessageSquare } from "lucide-react";
import { useWorkspaceStore } from "@/store/workspace-store";
import { useOutreachLogs, useUpdateOutreach } from "@/features/outreach/outreach-queries";
import { useOutreachStore } from "@/store/outreach-store";
import { Button } from "@/components/ui/button";

export function FollowUpCenter() {
  const workspaceId = useWorkspaceStore((s) => s.workspaceId);
  const { data: logs } = useOutreachLogs(workspaceId);
  const { setActiveRecordId } = useOutreachStore();
  const updateOutreach = useUpdateOutreach();

  if (!logs) return null;

  const todayStr = new Date().toISOString().split("T")[0];

  const overdue = logs.filter(
    (log) => log.follow_up_date && log.follow_up_date < todayStr && log.status !== "closed" && log.status !== "responded"
  ).sort((a, b) => (a.follow_up_date! > b.follow_up_date! ? 1 : -1));

  const dueToday = logs.filter(
    (log) => log.follow_up_date === todayStr && log.status !== "closed" && log.status !== "responded"
  );

  const displayList = [...overdue, ...dueToday].slice(0, 5);

  if (displayList.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 flex flex-col items-center justify-center text-center">
        <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
          <CalendarClock className="h-6 w-6" />
        </div>
        <h3 className="font-medium">All caught up</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-[250px]">
          You have no pending follow-ups for today.
        </p>
      </div>
    );
  }

  const handleMarkContacted = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!workspaceId) return;
    updateOutreach.mutate({
      id,
      workspaceId,
      payload: { status: "contacted", follow_up_date: null },
    });
  };

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="border-b bg-muted/40 px-4 py-3 flex items-center justify-between">
        <h3 className="font-semibold text-sm">Today&apos;s Follow-Ups</h3>
        <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
          {displayList.length} Action{displayList.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="divide-y">
        {displayList.map((log) => {
          const isOverdue = log.follow_up_date! < todayStr;
          return (
            <div
              key={log.id}
              onClick={() => setActiveRecordId(log.id)}
              className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isOverdue ? "bg-red-500/10 text-red-500" : "bg-orange-500/10 text-orange-500"}`}>
                  {isOverdue ? <AlertCircle className="h-5 w-5" /> : <MessageSquare className="h-4 w-4" />}
                </div>
                <div>
                  <p className="font-medium text-sm leading-tight flex items-center gap-2">
                    {log.contact_name}
                    {isOverdue && <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Overdue</span>}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {log.contact_company ?? "Independent"} • {log.contact_channel}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 text-xs"
                  onClick={(e) => handleMarkContacted(e, log.id)}
                >
                  Mark Contacted
                </Button>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
