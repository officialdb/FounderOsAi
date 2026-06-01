"use client";

import * as React from "react";
import { useWorkspaceStore } from "@/store/workspace-store";
import { useCheckInStore } from "@/store/checkin-store";
import { useCheckIns, useWeeklySummary, useStreak } from "./checkin-queries";
import { CheckInForm } from "./components/checkin-form";
import { CheckInSummary } from "./components/checkin-summary";
import { StreakCard } from "./components/streak-card";
import { ProductivityScoreCard } from "./components/productivity-score-card";
import { WeeklyInsightCard } from "./components/weekly-insight-card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Target } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";

export function CheckinsView() {
  const workspaceId = useWorkspaceStore((state) => state.workspaceId);
  const isWorkspaceHydrated = useWorkspaceStore((state) => state.isHydrated);
  const { setCheckInModalOpen } = useCheckInStore();

  const { data: checkIns, isLoading: isLoadingCheckIns } = useCheckIns(workspaceId);
  const { data: weeklySummary, isLoading: isLoadingWeekly } = useWeeklySummary(workspaceId);
  const { data: streakData, isLoading: isLoadingStreak } = useStreak(workspaceId);

  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isLoading = isLoadingCheckIns || isLoadingWeekly || isLoadingStreak;

  if (!mounted || !isWorkspaceHydrated || isLoading) {
    return (
      <div className="flex flex-col h-full bg-background min-h-screen pt-8">
        <LoadingState label="Loading your accountability profile..." />
      </div>
    );
  }

  const hasCheckIns = checkIns && checkIns.length > 0;

  return (
    <div className="flex flex-col h-full bg-background min-h-screen">
      {/* Top Action Bar */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Accountability</h1>
        </div>

        <Button onClick={() => setCheckInModalOpen(true)} className="w-full sm:w-auto rounded-full font-medium">
          <PlusCircle className="mr-2 h-4 w-4" />
          Complete Check-In
        </Button>
      </div>

      <div className="flex-1 px-4 sm:px-6 lg:px-8 max-w-6xl w-full mx-auto py-8">
        {!hasCheckIns ? (
          <EmptyState
            title="Start your accountability journey"
            message="You haven't completed any check-ins for this workspace yet. Execute on your tasks, then reflect daily to build momentum."
            icon={Target}
            action={
              <Button onClick={() => setCheckInModalOpen(true)} className="mt-4 rounded-full">
                Start First Check-In
              </Button>
            }
          />
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Weekly Overview Metrics */}
            <div>
              <h2 className="text-lg font-semibold tracking-tight mb-4">Weekly Overview</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-1">
                  <StreakCard 
                    currentStreak={streakData?.current_streak ?? weeklySummary?.current_streak ?? 0} 
                    longestStreak={streakData?.longest_streak ?? weeklySummary?.best_score ?? 0} 
                  />
                </div>
                <div className="lg:col-span-1">
                  <ProductivityScoreCard 
                    score={weeklySummary?.average_score ?? 0} 
                  />
                </div>
                <div className="md:col-span-2 lg:col-span-1">
                  <WeeklyInsightCard 
                    aiFeedback={checkIns[0]?.extra_metadata?.ai_feedback as string || "This week you maintained strong consistency. Focus on your priorities to keep the momentum going."}
                    checkInCount={weeklySummary?.total_check_ins ?? checkIns.length}
                  />
                </div>
              </div>
            </div>

            {/* Check-In History / Timeline */}
            <div>
              <h2 className="text-lg font-semibold tracking-tight mb-4">Recent Reflections</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {checkIns.slice(0, 6).map((checkIn) => (
                  <div key={checkIn.id} className="bg-card rounded-xl border border-border/50 p-5 hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-muted-foreground">
                        {new Date(checkIn.created_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <div className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
                        Score: {checkIn.productivity_score ?? checkIn.score}%
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Completed</p>
                        <p className="text-sm line-clamp-2">{checkIn.completed_today ?? checkIn.wins ?? "No data"}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Blockers</p>
                        <p className="text-sm line-clamp-2">{checkIn.blockers ?? "None"}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-muted-foreground font-semibold mb-1">Next Priorities</p>
                        <p className="text-sm line-clamp-2">{(checkIn.extra_metadata?.next_priorities as string) ?? "Not set"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <CheckInForm />
      <CheckInSummary />
    </div>
  );
}
