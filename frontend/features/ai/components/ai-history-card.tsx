import { Copy, Check, FileText, Sparkles, BarChart3 } from "lucide-react";
import * as React from "react";
import type { AIGeneration } from "@/services/ai.service";

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  content: { label: "Content", icon: FileText, color: "text-violet-500", bg: "bg-violet-500/10" },
  weekly_summary: { label: "Weekly Summary", icon: BarChart3, color: "text-blue-500", bg: "bg-blue-500/10" },
  feedback: { label: "Feedback", icon: Sparkles, color: "text-amber-500", bg: "bg-amber-500/10" },
};

interface AIHistoryCardProps {
  generation: AIGeneration;
}

export function AIHistoryCard({ generation }: AIHistoryCardProps) {
  const [copied, setCopied] = React.useState(false);
  const config = typeConfig[generation.generation_type] ?? typeConfig.content;
  const Icon = config.icon;

  const handleCopy = () => {
    if (!generation.response_text) return;
    navigator.clipboard.writeText(generation.response_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const dateStr = new Date(generation.created_at).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 hover:border-primary/20 hover:shadow-sm transition-all duration-200 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.bg} ${config.color}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                {config.label}
              </span>
              <span className="text-[10px] text-muted-foreground">{dateStr}</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1 mb-1.5">{generation.prompt}</p>
            <p className="text-sm leading-relaxed line-clamp-3">{generation.response_text}</p>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="shrink-0 p-1.5 rounded-md hover:bg-muted/60 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Copy content"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>
      </div>
    </div>
  );
}
