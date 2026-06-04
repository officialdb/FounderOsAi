"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity } from "lucide-react";

type ProductivityScoreCardProps = {
  score: number | null;
  trend?: number; // e.g. +5% or -15%
};

export function ProductivityScoreCard({ score, trend }: ProductivityScoreCardProps) {
  // Simple animation for the progress bar
  const [progress, setProgress] = React.useState<number | null>(score);
  
  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <Card className="h-full border-border/50 bg-card/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Weekly Productivity
        </CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">{score === null ? "—" : `${score}%`}</div>
        
        {trend !== undefined && score !== null && (
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            <span className={trend >= 0 ? "text-emerald-500 font-medium" : "text-destructive font-medium"}>
              {trend >= 0 ? "+" : ""}{trend}%
            </span>{" "}
            from last week
          </p>
        )}
        
        <div className="mt-4 space-y-2">
          <Progress value={score === null ? 0 : progress ?? 0} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>Consistency Trend</span>
            <span>100%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
