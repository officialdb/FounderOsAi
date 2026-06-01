"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Briefcase, Activity, CheckCircle2, MessageSquare } from "lucide-react";
import type { Workspace } from "@/types/workspace";

type WorkspaceHealthCardsProps = {
  workspaces: Workspace[];
};

export function WorkspaceHealthCards({ workspaces }: WorkspaceHealthCardsProps) {
  // If no workspaces, don't render or handle empty state appropriately in parent
  if (workspaces.length === 0) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {workspaces.slice(0, 2).map((workspace, index) => {
        // Mock data for health score based on index
        const healthScore = index === 0 ? 85 : 62;
        const activeTasks = index === 0 ? 12 : 5;
        const outreachCount = index === 0 ? 24 : 8;
        const lastActivity = index === 0 ? "2 hours ago" : "3 days ago";

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
