"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const mockData = [
  { name: "Mon", tasks: 4, checkins: 1, outreach: 12 },
  { name: "Tue", tasks: 6, checkins: 1, outreach: 15 },
  { name: "Wed", tasks: 5, checkins: 1, outreach: 8 },
  { name: "Thu", tasks: 8, checkins: 1, outreach: 20 },
  { name: "Fri", tasks: 3, checkins: 0, outreach: 5 },
  { name: "Sat", tasks: 2, checkins: 1, outreach: 2 },
  { name: "Sun", tasks: 1, checkins: 1, outreach: 0 },
];

export function ExecutionChart() {
  return (
    <Card className="col-span-1 border-border/50 shadow-subtle lg:col-span-2 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg">Weekly Execution Trend</CardTitle>
        <CardDescription>Visualizing consistency in tasks, check-ins, and outreach.</CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:p-6 pb-2">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="name" 
                stroke="#888888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#888888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(value) => `${value}`} 
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))" }}
                contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
              />
              <Bar dataKey="tasks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} stackId="a" />
              <Bar dataKey="outreach" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} stackId="a" />
              <Bar dataKey="checkins" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
