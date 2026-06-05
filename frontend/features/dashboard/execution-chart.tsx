"use client";

import { useMemo } from "react";
import { format, startOfDay, subDays } from "date-fns";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Task } from "@/services/task.service";
import type { CheckIn } from "@/services/checkin.service";
import type { OutreachLog } from "@/services/outreach.service";

type ExecutionChartProps = {
  tasks: Task[];
  checkIns: CheckIn[];
  outreachLogs: OutreachLog[];
};

export function ExecutionChart({ tasks, checkIns, outreachLogs }: ExecutionChartProps) {
  const chartData = useMemo(() => {
    const today = startOfDay(new Date());

    return Array.from({ length: 7 }, (_, index) => {
      const targetDate = subDays(today, 6 - index);
      const dateStr = format(targetDate, "yyyy-MM-dd");

      return {
        name: format(targetDate, "EEE"),
        tasks: tasks.filter((task) => task.status === "done" && task.completed_at?.startsWith(dateStr)).length,
        checkins: checkIns.filter((checkIn) => checkIn.created_at.startsWith(dateStr)).length,
        outreach: outreachLogs.filter((outreach) => outreach.created_at.startsWith(dateStr)).length,
      };
    });
  }, [tasks, checkIns, outreachLogs]);

  return (
    <Card className="col-span-1 min-w-0 border-border/50 shadow-subtle lg:col-span-2 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg">Weekly Execution Trend</CardTitle>
        <CardDescription>Visualizing consistency in tasks, check-ins, and outreach.</CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:p-6 pb-2">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))" }}
                contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
              />
              <Bar dataKey="tasks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="outreach" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="checkins" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
