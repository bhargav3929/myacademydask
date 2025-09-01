
"use client";

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../ui/button";

const data = [
    { month: "Jan", present: 86, absent: 14 },
    { month: "Feb", present: 88, absent: 12 },
    { month: "Mar", present: 90, absent: 10 },
    { month: "Apr", present: 85, absent: 15 },
    { month: "May", present: 92, absent: 8 },
    { month: "Jun", present: 91, absent: 9 },
    { month: "Jul", present: 93, absent: 7 },
    { month: "Aug", present: 94, absent: 6 },
    { month: "Sep", present: 90, absent: 10 },
    { month: "Oct", present: 88, absent: 12 },
    { month: "Nov", present: 89, absent: 11 },
    { month: "Dec", present: 95, absent: 5 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="font-bold mb-2">{label}</p>
        <div className="flex flex-col space-y-1 mt-1">
            {payload.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                    <div className="size-2.5 rounded-full" style={{backgroundColor: p.stroke}}/>
                    <span className="text-sm text-muted-foreground">{`${p.name}:`}</span>
                    <span className="text-sm font-bold">{p.value}%</span>
                </div>
            ))}
        </div>
      </div>
    );
  }
  return null;
};


export function AttendanceChart() {
  return (
    <Card className="h-full flex flex-col shadow-sm border-none">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle className="text-lg font-semibold">Attendance Overview</CardTitle>
        </div>
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm">
                <div className="size-2 rounded-full bg-primary" />
                <span>Present</span>
            </div>
             <div className="flex items-center gap-2 text-sm">
                <div className="size-2 rounded-full bg-destructive/70" />
                <span>Absent</span>
            </div>
            <Button variant="outline" size="sm">Yearly</Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow pb-4 -ml-4">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart 
                data={data}
                margin={{ top: 5, right: 20, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
              <XAxis
                dataKey="month"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
                domain={[70, 100]}
                width={40}
              />
              <Tooltip
                cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: "3 3" }}
                content={<CustomTooltip />}
              />
              <Area 
                type="monotone" 
                dataKey="present" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorPresent)" 
                strokeWidth={2} 
                dot={false}
              />
              <Area 
                type="monotone" 
                dataKey="absent" 
                stroke="hsl(var(--destructive) / 0.7)" 
                fillOpacity={1} 
                fill="url(#colorAbsent)" 
                strokeWidth={2}
                dot={false}
            />
            </AreaChart>
          </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
