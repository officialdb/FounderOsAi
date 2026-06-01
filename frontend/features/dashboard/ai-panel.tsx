"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, AlertTriangle, ArrowUpCircle, CheckCircle2, Info, Loader2 } from "lucide-react";
import { useWorkspaceStore } from "@/store/workspace-store";
import { useAIInsights } from "@/features/ai/ai-queries";
import Link from "next/link";

const priorityIcons: Record<string, React.ElementType> = {
  Critical: AlertTriangle,
  High: ArrowUpCircle,
  Medium: Info,
  Low: CheckCircle2,
};

const priorityColors: Record<string, string> = {
  Critical: "text-red-500",
  High: "text-orange-500",
  Medium: "text-amber-500",
  Low: "text-emerald-500",
};

export function AiPanel() {
  const workspaceId = useWorkspaceStore((s) => s.workspaceId);
  const { data: insights, isLoading } = useAIInsights(workspaceId);

  return (
    <Card className="flex flex-col h-full border-border/50 shadow-subtle bg-gradient-to-b from-card to-card/50">
      <CardHeader className="pb-4 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/10 text-accent">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <CardTitle className="text-sm font-semibold">AI Insights</CardTitle>
          </div>
          <Link href="/ai" className="text-xs text-primary hover:underline">
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !insights || insights.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-xs text-muted-foreground">No insights available yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {insights.slice(0, 3).map((insight, i) => {
              const Icon = priorityIcons[insight.priority_level] ?? Info;
              const color = priorityColors[insight.priority_level] ?? "text-muted-foreground";
              return (
                <div key={i} className="p-4 flex gap-3 items-start hover:bg-muted/30 transition-colors">
                  <Icon className={`h-4 w-4 ${color} mt-0.5`} />
                  <div>
                    <p className="text-sm font-medium">{insight.insight}</p>
                    <p className="text-xs text-muted-foreground mt-1">{insight.recommended_action}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
