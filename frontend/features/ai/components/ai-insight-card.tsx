import { AlertTriangle, ArrowUpCircle, CheckCircle2, Info, type LucideIcon } from "lucide-react";

interface AIInsightCardProps {
  category: string;
  insight: string;
  recommendedAction: string;
  priorityLevel: "Critical" | "High" | "Medium" | "Low";
}

const priorityConfig: Record<string, { color: string; bg: string; icon: LucideIcon; border: string }> = {
  Critical: { color: "text-red-500", bg: "bg-red-500/10", icon: AlertTriangle, border: "border-red-500/30" },
  High: { color: "text-orange-500", bg: "bg-orange-500/10", icon: ArrowUpCircle, border: "border-orange-500/30" },
  Medium: { color: "text-amber-500", bg: "bg-amber-500/10", icon: Info, border: "border-amber-500/30" },
  Low: { color: "text-emerald-500", bg: "bg-emerald-500/10", icon: CheckCircle2, border: "border-emerald-500/30" },
};

export function AIInsightCard({ category, insight, recommendedAction, priorityLevel }: AIInsightCardProps) {
  const config = priorityConfig[priorityLevel] ?? priorityConfig.Medium;
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border ${config.border} bg-card p-4 hover:shadow-md transition-all duration-200 group`}>
      <div className="flex items-start gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.bg} ${config.color} mt-0.5`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{category}</span>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
              {priorityLevel}
            </span>
          </div>
          <p className="text-sm font-medium leading-snug">{insight}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{recommendedAction}</p>
        </div>
      </div>
    </div>
  );
}
