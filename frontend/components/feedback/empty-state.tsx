import * as React from "react";
import { LucideIcon } from "lucide-react";

export function EmptyState({ 
  title, 
  message, 
  icon: Icon, 
  action 
}: { 
  title: string; 
  message: string; 
  icon?: LucideIcon; 
  action?: React.ReactNode 
}) {
  return (
    <div className="rounded-xl border border-dashed bg-card p-8 text-center flex flex-col items-center justify-center">
      {Icon && <Icon className="h-8 w-8 text-muted-foreground mb-3" />}
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

