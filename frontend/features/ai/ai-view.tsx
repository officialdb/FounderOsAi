"use client";

import * as React from "react";
import { Sparkles, Brain, BarChart3, Clock, Lightbulb, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/store/workspace-store";
import { useAIStore } from "@/store/ai-store";
import { useAIHistory, useAIInsights, useGenerateFeedback, useGenerateWeeklySummary } from "@/features/ai/ai-queries";
import { AIContentForm } from "./components/ai-content-form";
import { AIInsightCard } from "./components/ai-insight-card";
import { AISummaryCard } from "./components/ai-summary-card";
import { AIFeedbackCard } from "./components/ai-feedback-card";
import { AIHistoryCard } from "./components/ai-history-card";
import { LoadingState } from "@/components/feedback/loading-state";
import { EmptyState } from "@/components/feedback/empty-state";

const TABS = [
  { id: "content" as const, label: "Content Studio", icon: Sparkles },
  { id: "insights" as const, label: "AI Insights", icon: Lightbulb },
  { id: "weekly" as const, label: "Weekly Summary", icon: BarChart3 },
  { id: "history" as const, label: "History", icon: Clock },
];

function InsightsTab() {
  const workspaceId = useWorkspaceStore((s) => s.workspaceId);
  const { data: insights, isLoading } = useAIInsights(workspaceId);

  if (isLoading) return <LoadingState label="Analyzing workspace..." />;
  if (!insights || insights.length === 0) {
    return (
      <EmptyState
        title="No insights yet"
        message="Start working on tasks and completing check-ins. AI will surface insights as your data grows."
        icon={Lightbulb}
      />
    );
  }

  const highPriority = insights.filter((i) => i.priority_level === "Critical" || i.priority_level === "High");
  const mediumPriority = insights.filter((i) => i.priority_level === "Medium");
  const lowPriority = insights.filter((i) => i.priority_level === "Low");

  return (
    <div className="space-y-6">
      {highPriority.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">High Priority</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {highPriority.map((insight, i) => (
              <AIInsightCard
                key={i}
                category={insight.category}
                insight={insight.insight}
                recommendedAction={insight.recommended_action}
                priorityLevel={insight.priority_level}
              />
            ))}
          </div>
        </div>
      )}
      {mediumPriority.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Medium Priority</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {mediumPriority.map((insight, i) => (
              <AIInsightCard
                key={i}
                category={insight.category}
                insight={insight.insight}
                recommendedAction={insight.recommended_action}
                priorityLevel={insight.priority_level}
              />
            ))}
          </div>
        </div>
      )}
      {lowPriority.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recommendations</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {lowPriority.map((insight, i) => (
              <AIInsightCard
                key={i}
                category={insight.category}
                insight={insight.insight}
                recommendedAction={insight.recommended_action}
                priorityLevel={insight.priority_level}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function WeeklySummaryTab() {
  const workspaceId = useWorkspaceStore((s) => s.workspaceId);
  const summaryMutation = useGenerateWeeklySummary();
  const feedbackMutation = useGenerateFeedback();

  const [summaryData, setSummaryData] = React.useState<{
    summary: string;
    highlights: string[];
    risks: string[];
    next_week_focus: string[];
  } | null>(null);

  const [feedbackData, setFeedbackData] = React.useState<{
    summary: string;
    strengths: string[];
    improvements: string[];
    next_actions: string[];
  } | null>(null);

  const handleGenerateSummary = () => {
    if (!workspaceId) return;
    summaryMutation.mutate(workspaceId, {
      onSuccess: (data) => setSummaryData(data),
    });
  };

  const handleGenerateFeedback = () => {
    if (!workspaceId) return;
    feedbackMutation.mutate(workspaceId, {
      onSuccess: (data) => setFeedbackData(data),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleGenerateSummary}
          disabled={summaryMutation.isPending}
          variant="outline"
          className="rounded-xl"
        >
          {summaryMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <BarChart3 className="h-4 w-4 mr-2" />
          )}
          Generate Weekly Summary
        </Button>
        <Button
          onClick={handleGenerateFeedback}
          disabled={feedbackMutation.isPending}
          variant="outline"
          className="rounded-xl"
        >
          {feedbackMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Brain className="h-4 w-4 mr-2" />
          )}
          Generate Accountability Feedback
        </Button>
      </div>

      {summaryData && (
        <AISummaryCard
          summary={summaryData.summary}
          highlights={summaryData.highlights}
          risks={summaryData.risks}
          nextWeekFocus={summaryData.next_week_focus}
        />
      )}

      {feedbackData && (
        <AIFeedbackCard
          summary={feedbackData.summary}
          strengths={feedbackData.strengths}
          improvements={feedbackData.improvements}
          nextActions={feedbackData.next_actions}
        />
      )}

      {!summaryData && !feedbackData && (
        <EmptyState
          title="Generate your weekly review"
          message="Click one of the buttons above to generate an AI-powered summary of your execution this week."
          icon={BarChart3}
        />
      )}
    </div>
  );
}

function HistoryTab() {
  const workspaceId = useWorkspaceStore((s) => s.workspaceId);
  const { data: history, isLoading } = useAIHistory(workspaceId);

  if (isLoading) return <LoadingState label="Loading AI history..." />;
  if (!history || history.length === 0) {
    return (
      <EmptyState
        title="No AI activity yet"
        message="Generate your first AI content or summary to see it here."
        icon={Clock}
      />
    );
  }

  return (
    <div className="space-y-3">
      {history.map((gen) => (
        <AIHistoryCard key={gen.id} generation={gen} />
      ))}
    </div>
  );
}

export function AiView() {
  const { activeTab, setActiveTab } = useAIStore();
  const isWorkspaceHydrated = useWorkspaceStore((s) => s.isHydrated);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isWorkspaceHydrated) {
    return (
      <div className="flex flex-col h-full bg-background min-h-screen pt-8">
        <LoadingState label="Loading AI Assistant..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 text-violet-500">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Assistant</h1>
            <p className="text-xs text-muted-foreground">Your operational copilot for execution</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 overflow-x-auto pb-1 -mb-4 scrollbar-none">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-primary text-primary bg-muted/40"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 max-w-5xl w-full mx-auto py-6">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300" key={activeTab}>
          {activeTab === "content" && <AIContentForm />}
          {activeTab === "insights" && <InsightsTab />}
          {activeTab === "weekly" && <WeeklySummaryTab />}
          {activeTab === "history" && <HistoryTab />}
        </div>
      </div>
    </div>
  );
}
