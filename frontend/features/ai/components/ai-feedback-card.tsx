import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThumbsUp, AlertCircle, ArrowRight, Brain } from "lucide-react";

interface AIFeedbackCardProps {
  summary: string;
  strengths: string[];
  improvements: string[];
  nextActions: string[];
}

export function AIFeedbackCard({ summary, strengths, improvements, nextActions }: AIFeedbackCardProps) {
  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card className="border-border/50 shadow-subtle bg-gradient-to-br from-card to-violet-500/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
              <Brain className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Today&apos;s Feedback</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">AI-generated accountability analysis</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Strengths */}
        <Card className="border-emerald-500/20">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-emerald-500" />
              <CardTitle className="text-sm font-semibold text-emerald-600">Strengths</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ul className="space-y-2">
              {strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Improvements */}
        <Card className="border-amber-500/20">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <CardTitle className="text-sm font-semibold text-amber-600">Improvements</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ul className="space-y-2">
              {improvements.map((imp, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                  {imp}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Next Actions */}
        <Card className="border-blue-500/20">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-blue-500" />
              <CardTitle className="text-sm font-semibold text-blue-600">Tomorrow&apos;s Focus</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ul className="space-y-2">
              {nextActions.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                  {a}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
