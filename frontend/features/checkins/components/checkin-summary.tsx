"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCheckInStore } from "@/store/checkin-store";
import { useWorkspaceStore } from "@/store/workspace-store";
import { useWeeklySummary, useStreak, useCheckIns } from "../checkin-queries";
import { CheckCircle2, Flame, BrainCircuit } from "lucide-react";

export function CheckInSummary() {
  const { showSummaryAfterSubmit, setShowSummaryAfterSubmit } = useCheckInStore();
  const workspaceId = useWorkspaceStore((state) => state.workspaceId);

  // We refetch these automatically via the invalidation in checkin-queries when the form submits
  const { data: weeklySummary } = useWeeklySummary(workspaceId);
  const { data: streakData } = useStreak(workspaceId);
  const { data: checkIns } = useCheckIns(workspaceId);

  // Grab the latest check-in to show the score
  const latestCheckIn = React.useMemo(() => {
    if (!checkIns || checkIns.length === 0) return null;
    return [...checkIns].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  }, [checkIns]);

  const score = latestCheckIn?.productivity_score ?? latestCheckIn?.score ?? 0;
  const currentStreak = streakData?.current_streak ?? weeklySummary?.current_streak ?? 1;
  const aiFeedback = latestCheckIn?.extra_metadata?.ai_feedback as string | undefined;

  return (
    <Dialog open={showSummaryAfterSubmit} onOpenChange={setShowSummaryAfterSubmit}>
      <DialogContent className="sm:max-w-[425px] border-border/50 bg-background overflow-hidden p-0">
        <div className="bg-gradient-to-br from-primary/10 to-background p-6 flex flex-col items-center justify-center text-center border-b border-border/50">
          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 text-primary">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <DialogTitle className="text-2xl font-bold mb-1">Check-In Completed</DialogTitle>
          <p className="text-sm text-muted-foreground">Great job maintaining your momentum.</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 bg-card rounded-xl border border-border/50 p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Productivity</p>
              <p className="text-3xl font-bold text-primary">{score}%</p>
            </div>
            
            <div className="flex-1 bg-card rounded-xl border border-border/50 p-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Current Streak</p>
              <p className="text-3xl font-bold flex items-center justify-center gap-1">
                <Flame className="h-6 w-6 text-orange-500" />
                {currentStreak} <span className="text-lg text-muted-foreground font-medium">Days</span>
              </p>
            </div>
          </div>

          <div className="bg-muted/30 rounded-xl p-5 border border-border/30">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <BrainCircuit className="h-4 w-4 text-primary" />
              AI Feedback
            </h3>
            <p className="text-sm text-foreground leading-relaxed">
              {aiFeedback || "You completed key execution tasks today. Keep up the consistent effort. Focus heavily on your defined priorities for tomorrow to maintain your momentum."}
            </p>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border/50 bg-muted/10">
          <Button className="w-full rounded-full" onClick={() => setShowSummaryAfterSubmit(false)}>
            Back to Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
