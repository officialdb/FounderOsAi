"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, MessageSquare, ClipboardList, Sparkles } from "lucide-react";

import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
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
    type ActivityItem = {
      id: string;
      title: string;
      description: string;
      date: Date;
      icon: React.ElementType;
      iconBg: string;
      iconColor: string;
    };
    
    const list: ActivityItem[] = [];
    // Add completed tasks
    tasks.filter(t => t.status === "done" && t.completed_at).forEach(t => {
      list.push({
        id: `task-${t.id}`,
        title: "Task completed",
        description: t.title,
        date: new Date(t.completed_at!),
        icon: CheckCircle2,
        iconBg: "bg-emerald-500/10",
        iconColor: "text-emerald-500",
      });
    });

    // Add checkins
    checkIns.forEach(c => {
      list.push({
        id: `checkin-${c.id}`,
        title: "Check-in submitted",
        description: "Daily summary logged",
        date: new Date(c.created_at),
        icon: ClipboardList,
        iconBg: "bg-amber-500/10",
        iconColor: "text-amber-500",
      });
    });

    // Add outreach
    outreachLogs.forEach(o => {
      list.push({
        id: `outreach-${o.id}`,
        title: "Outreach logged",
        description: `Contacted ${o.contact_name}`,
        date: new Date(o.created_at),
        icon: MessageSquare,
        iconBg: "bg-blue-500/10",
        iconColor: "text-blue-500",
      });
    });

    // Sort by date descending and take top 5
    return list
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5)
      .map(item => ({
        ...item,
        time: formatDistanceToNow(item.date, { addSuffix: true })
      }));
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
