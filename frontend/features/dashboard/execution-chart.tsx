"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

import { useMemo } from "react";
import { format, subDays, startOfDay } from "date-fns";
import type { Task } from "@/services/task.service";
import type { CheckIn } from "@/services/checkin.service";
import type { OutreachLog } from "@/services/outreach.service";

type ExecutionChartProps = {
  tasks: Task[];
  checkIns: CheckIn[];
  outreachLogs: OutreachLog[];
};

export function buildExecutionChartData(
  tasks: Task[],
  checkIns: CheckIn[],
  outreachLogs: OutreachLog[],
  referenceDate = new Date(),
) {
  const data = [];
  const today = startOfDay(referenceDate);

  for (let i = 6; i >= 0; i--) {
    const targetDate = subDays(today, i);
    const dateStr = format(targetDate, "yyyy-MM-dd");

    const dayTasks = tasks.filter((task) => task.status === "done" && task.completed_at?.startsWith(dateStr)).length;
    const dayCheckins = checkIns.filter((checkIn) => checkIn.created_at.startsWith(dateStr)).length;
    const dayOutreach = outreachLogs.filter((outreach) => outreach.created_at.startsWith(dateStr)).length;

    data.push({
      name: format(targetDate, "EEE"),
      tasks: dayTasks,
      checkins: dayCheckins,
      outreach: dayOutreach,
    });
  }

  return data;
}

export function ExecutionChart({ tasks, checkIns, outreachLogs }: ExecutionChartProps) {
  const chartData = useMemo(
    () => buildExecutionChartData(tasks, checkIns, outreachLogs),
    [tasks, checkIns, outreachLogs],
  );

  const hasActivity = chartData.some((entry) => entry.tasks > 0 || entry.checkins > 0 || entry.outreach > 0);

  return (
    <Card className="col-span-1 min-w-0 border-border/50 shadow-subtle lg:col-span-2 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg">Weekly Execution Trend</CardTitle>
        <CardDescription>Visualizing consistency in tasks, check-ins, and outreach.</CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:p-6 pb-2">
        {hasActivity ? (
          <div className="h-[280px] min-w-0 w-full">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                barCategoryGap="18%"
                barGap={6}
              >
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    backgroundColor: "hsl(var(--card))",
                  }}
                />
                <Bar dataKey="tasks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} minPointSize={4} />
                <Bar dataKey="outreach" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} minPointSize={4} />
                <Bar dataKey="checkins" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} minPointSize={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20 px-6 text-center">
            <div className="space-y-1">
              <p className="text-sm font-medium">No activity recorded this week</p>
              <p className="text-xs text-muted-foreground">Once you complete tasks, check-ins, or outreach, the chart will fill in here.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
