"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";

type StreakCardProps = {
  currentStreak: number;
  longestStreak: number;
};

export function StreakCard({ currentStreak, longestStreak }: StreakCardProps) {
  return (
    <Card className="h-full border-border/50 bg-card/50 overflow-hidden relative">
      <div className="absolute -right-6 -top-6 text-orange-500/10 pointer-events-none">
        <Flame className="w-32 h-32" />
      </div>
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Execution Streak
        </CardTitle>
        <Flame className="h-4 w-4 text-orange-500" />
      </CardHeader>
      <CardContent className="relative">
        <div className="flex items-end gap-2">
          <div className="text-4xl font-bold text-foreground">🔥 {currentStreak}</div>
          <div className="text-xl text-muted-foreground font-medium mb-1">Days</div>
        </div>
        
        <div className="mt-6 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Current Best</span>
          <span className="font-semibold px-2 py-0.5 bg-muted rounded-md">{longestStreak} Days</span>
        </div>
        
        {/* Simple visual week indicator */}
        <div className="mt-4 flex gap-1.5 w-full justify-between">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <div 
              key={day} 
              className={`h-2 flex-1 rounded-full ${
                day <= (currentStreak % 7 === 0 && currentStreak > 0 ? 7 : currentStreak % 7) 
                  ? 'bg-orange-500' 
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
