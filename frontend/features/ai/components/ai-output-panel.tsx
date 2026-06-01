import * as React from "react";
import { Check, Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIOutputPanelProps {
  content: string;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export function AIOutputPanel({ content, onRegenerate, isRegenerating }: AIOutputPanelProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback(() => {
    if (typeof window === "undefined" || !content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [content]);

  if (!content) return null;

  return (
    <div className="rounded-xl border bg-muted/30 mt-4 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-2">
        <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
          Generated Content
        </span>
        <div className="flex items-center gap-2">
          {onRegenerate && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-xs" 
              onClick={onRegenerate}
              disabled={isRegenerating}
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isRegenerating ? "animate-spin" : ""}`} />
              Regenerate
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={handleCopy}>
            {copied ? <Check className="h-3.5 w-3.5 mr-1 text-green-500" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>
      <div className="p-4 text-sm leading-relaxed whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
}
