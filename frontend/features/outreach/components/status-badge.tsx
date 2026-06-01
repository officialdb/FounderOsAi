import * as React from "react";
import type { OutreachStatus } from "@/services/outreach.service";

interface StatusBadgeProps {
  status: OutreachStatus | string;
}

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  pending: { label: "Pending", bg: "bg-gray-500/10", text: "text-gray-600 dark:text-gray-400", dot: "bg-gray-500" },
  contacted: { label: "Contacted", bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", dot: "bg-blue-500" },
  follow_up: { label: "Follow-Up", bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", dot: "bg-orange-500" },
  responded: { label: "Responded", bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  closed: { label: "Closed", bg: "bg-slate-500/10", text: "text-slate-600 dark:text-slate-400", dot: "bg-slate-500" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toLowerCase();
  const config = statusConfig[normalized] ?? statusConfig.pending;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${config.bg}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      <span className={`text-[10px] font-semibold uppercase tracking-wider ${config.text}`}>
        {config.label}
      </span>
    </div>
  );
}
