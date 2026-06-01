import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, AlertTriangle, Target, TrendingUp } from "lucide-react";

interface AISummaryCardProps {
  summary: string;
  highlights: string[];
  risks: string[];
  nextWeekFocus: string[];
}

export function AISummaryCard({ summary, highlights, risks, nextWeekFocus }: AISummaryCardProps) {
  return (
    <div className="space-y-4">
      {/* Summary Overview */}
      <Card className="border-border/50 shadow-subtle bg-gradient-to-br from-card to-muted/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <BarChart3 className="h-4 w-4" />
            </div>
            <CardTitle className="text-base font-semibold">AI Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Highlights */}
        <Card className="border-emerald-500/20 shadow-subtle">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <CardTitle className="text-sm font-semibold text-emerald-600">Highlights</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ul className="space-y-2">
              {highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                  {h}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Risks */}
        <Card className="border-orange-500/20 shadow-subtle">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <CardTitle className="text-sm font-semibold text-orange-600">Risks</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ul className="space-y-2">
              {risks.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Next Week Focus */}
        <Card className="border-blue-500/20 shadow-subtle">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              <CardTitle className="text-sm font-semibold text-blue-600">Next Week Focus</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ul className="space-y-2">
              {nextWeekFocus.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
