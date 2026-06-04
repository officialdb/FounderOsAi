"use client";

import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, MessageSquare, ClipboardList, Sparkles } from "lucide-react";
import type { Task } from "@/services/task.service";
import type { CheckIn } from "@/services/checkin.service";
import type { OutreachLog } from "@/services/outreach.service";

type ActivityTimelineProps = {
  tasks: Task[];
  checkIns: CheckIn[];
  outreachLogs: OutreachLog[];
};

export function ActivityTimeline({ tasks, checkIns, outreachLogs }: ActivityTimelineProps) {
  const activities = useMemo(() => {
    const entries = [
      ...tasks
        .filter((task) => task.status === "done" && task.completed_at)
        .map((task) => ({
          id: `task-${task.id}`,
          title: "Task completed",
          description: task.title,
          time: formatDistanceToNow(new Date(task.completed_at ?? task.updated_at), { addSuffix: true }),
          date: new Date(task.completed_at ?? task.updated_at),
          icon: CheckCircle2,
          iconBg: "bg-emerald-500/10",
          iconColor: "text-emerald-500",
        })),
      ...checkIns.map((checkIn) => ({
        id: `checkin-${checkIn.id}`,
        title: "Check-in submitted",
        description: checkIn.completed_today ?? checkIn.wins ?? "No details captured",
        time: formatDistanceToNow(new Date(checkIn.created_at), { addSuffix: true }),
        date: new Date(checkIn.created_at),
        icon: ClipboardList,
        iconBg: "bg-amber-500/10",
        iconColor: "text-amber-500",
      })),
      ...outreachLogs.map((log) => ({
        id: `outreach-${log.id}`,
        title: "Outreach logged",
        description: `Contacted ${log.contact_name}`,
        time: formatDistanceToNow(new Date(log.created_at), { addSuffix: true }),
        date: new Date(log.created_at),
        icon: MessageSquare,
        iconBg: "bg-blue-500/10",
        iconColor: "text-blue-500",
      })),
    ];

    return entries.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);
  }, [tasks, checkIns, outreachLogs]);

  return (
    <Card className="border-border/50 shadow-subtle">
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="pt-2 pb-6">
        <div className="relative border-l border-border/60 ml-3 space-y-6">
          {activities.map((activity, index) => (
            <div key={activity.id} className="relative pl-6">
              {/* Timeline Dot/Icon */}
              <div className={`absolute -left-3.5 flex h-7 w-7 items-center justify-center rounded-full border-4 border-card ${activity.iconBg}`}>
                <activity.icon className={`h-3 w-3 ${activity.iconColor}`} />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                  <h4 className="text-sm font-medium">{activity.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                </div>
                <time className="text-xs text-muted-foreground whitespace-nowrap mt-1 sm:mt-0">
                  {activity.time}
                </time>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
