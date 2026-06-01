"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, MessageSquare, ClipboardList, Sparkles } from "lucide-react";

const activities = [
  {
    id: 1,
    title: "Task completed",
    description: "Reviewed the updated pitch deck for Techpronnet",
    time: "2 hours ago",
    icon: CheckCircle2,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
  },
  {
    id: 2,
    title: "Outreach logged",
    description: "Sent follow-up email to 5 potential investors",
    time: "4 hours ago",
    icon: MessageSquare,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    id: 3,
    title: "Check-in submitted",
    description: "Completed end-of-day summary for Zidi Clinic",
    time: "Yesterday",
    icon: ClipboardList,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
  {
    id: 4,
    title: "AI content generated",
    description: "Drafted a Twitter thread about startup operations",
    time: "Yesterday",
    icon: Sparkles,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500",
  },
];

export function ActivityTimeline() {
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
