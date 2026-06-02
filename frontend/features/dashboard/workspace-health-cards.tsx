"use client";

import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Briefcase, Activity, CheckCircle2, MessageSquare } from "lucide-react";
import type { Workspace } from "@/types/workspace";
import type { Task } from "@/services/task.service";
import type { CheckIn } from "@/services/checkin.service";
import type { OutreachLog } from "@/services/outreach.service";

type WorkspaceHealthCardsProps = {
  workspaces: Workspace[];
  tasks: Task[];
  checkIns: CheckIn[];
  outreachLogs: OutreachLog[];
};

export function WorkspaceHealthCards({ workspaces, tasks, checkIns, outreachLogs }: WorkspaceHealthCardsProps) {
  // If no workspaces, don't render or handle empty state appropriately in parent
  if (workspaces.length === 0) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {workspaces.slice(0, 2).map((workspace, index) => {
        const workspaceTasks = tasks.filter((task) => task.workspace_id === workspace.id);
        const activeTasks = workspaceTasks.filter((task) => task.status !== "done").length;
        const outreachCount = outreachLogs.filter((log) => log.workspace_id === workspace.id).length;
        const workspaceCheckIns = checkIns.filter((checkIn) => checkIn.workspace_id === workspace.id);
        const latestActivityDate = [
          ...workspaceTasks.map((task) => new Date(task.updated_at)),
          ...workspaceCheckIns.map((checkIn) => new Date(checkIn.created_at)),
          ...outreachLogs.filter((log) => log.workspace_id === workspace.id).map((log) => new Date(log.created_at)),
        ].sort((a, b) => b.getTime() - a.getTime())[0];

        const completedRatio = workspaceTasks.length > 0 ? workspaceTasks.filter((task) => task.status === "done").length / workspaceTasks.length : 0;
        const checkInScore = Math.min(workspaceCheckIns.length * 8, 30);
        const outreachScore = Math.min(outreachCount * 2, 20);
        const completionScore = Math.round(completedRatio * 50);
        const healthScore = Math.min(100, completionScore + checkInScore + outreachScore);
        const lastActivity = latestActivityDate
          ? formatDistanceToNow(latestActivityDate, { addSuffix: true })
          : "No activity yet";

        return (
          <Card key={workspace.id} className="border-border/50 shadow-subtle hover:border-primary/20 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-base">{workspace.name}</h3>
                    <p className="text-xs text-muted-foreground">Active Workspace</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-semibold">{healthScore}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Health</div>
                </div>
              </div>

              <Progress value={healthScore} className="h-2 mb-6" />

              <div className="grid grid-cols-3 gap-2 divide-x divide-border/50">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1 text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">Tasks</span>
                  </div>
                  <span className="text-sm font-semibold">{activeTasks}</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1 text-muted-foreground">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">Outreach</span>
                  </div>
                  <span className="text-sm font-semibold">{outreachCount}</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 mb-1 text-muted-foreground">
                    <Activity className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">Active</span>
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">{lastActivity}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
