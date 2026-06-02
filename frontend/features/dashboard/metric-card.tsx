import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

type MetricCardProps = {
  title: string;
  value: string | number | null | undefined;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
};

export function MetricCard({ title, value, description, icon: Icon, trend }: MetricCardProps) {
  const displayValue = value ?? "—";

  return (
    <Card className="shadow-subtle border-border/50 bg-card overflow-hidden transition-all duration-200 hover:shadow-sm">
      <CardHeader className="pb-2 pt-5 px-5 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </CardHeader>
      <CardContent className="px-5 pb-5">
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-semibold tracking-tight">{displayValue}</p>
          {trend && (
            <div
              className={cn(
                "flex items-center text-xs font-medium px-1.5 py-0.5 rounded-full",
                trend.isNeutral
                  ? "text-muted-foreground bg-muted/50"
                  : trend.isPositive
                    ? "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10"
                    : "text-destructive bg-destructive/10"
              )}
            >
              {trend.isNeutral ? (
                <Minus className="mr-1 h-3 w-3" />
              ) : trend.isPositive ? (
                <TrendingUp className="mr-1 h-3 w-3" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3" />
              )}
              {trend.value}
            </div>
          )}
        </div>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
