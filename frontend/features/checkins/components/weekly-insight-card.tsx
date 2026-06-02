"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type WeeklyInsightCardProps = {
  aiFeedback: string | null;
  checkInCount: number;
};

export function WeeklyInsightCard({ aiFeedback, checkInCount }: WeeklyInsightCardProps) {
  return (
    <Card className="h-full border-border/50 bg-card/50 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/30 bg-muted/20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-md">
            <BrainCircuit className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-sm font-semibold">Weekly Insights</CardTitle>
        </div>
        <Badge variant="outline" className="font-normal bg-background">
          AI Generated
        </Badge>
      </CardHeader>
      <CardContent className="pt-6 flex-1 flex flex-col justify-between gap-6">
        <p className="text-sm text-foreground leading-relaxed">
          {aiFeedback ?? "No AI feedback yet. Submit a check-in to generate accountability insights."}
        </p>
        
        <div className="grid grid-cols-2 gap-4 mt-auto">
          <div className="bg-muted/30 rounded-lg p-3 border border-border/30 flex items-center gap-3">
            <div className="bg-background rounded-full p-1.5 border border-border/50 shadow-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Check-Ins</p>
              <p className="text-sm font-bold">{checkInCount} / 7 <span className="text-xs font-medium text-muted-foreground ml-1">Days</span></p>
            </div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-3 border border-border/30 flex items-center gap-3">
            <div className="bg-background rounded-full p-1.5 border border-border/50 shadow-sm">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Momentum</p>
              <p className="text-sm font-bold text-emerald-500">Strong</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
