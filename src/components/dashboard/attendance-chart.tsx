
"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";
import { subDays, format } from "date-fns";

type ChartData = {
  date: string;
  name: string;
  Present: number;
  Absent: number;
};

// MOCK DATA: Using static data for UI development
const generateMockData = () => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
        const day = subDays(today, i);
        return {
            date: format(day, "yyyy-MM-dd"),
            name: format(day, "eee"),
            Present: Math.floor(Math.random() * 25) + 5, // Keep present numbers higher
            Absent: Math.floor(Math.random() * 5) + 1,
        };
    }).reverse();
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[10px] uppercase text-muted-foreground">
              {label}
            </span>
            <span className="font-bold text-foreground">
              {format(new Date(payload[0].payload.date), "MMM d")}
            </span>
          </div>
          <div className="flex flex-col space-y-1">
            {payload.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                    <div className="size-2.5 rounded-full" style={{backgroundColor: p.color}}/>
                    <span className="text-xs text-muted-foreground">{`${p.name}:`}</span>
                    <span className="text-xs font-bold">{p.value}</span>
                </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export function AttendanceChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
        setData(generateMockData());
        setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="h-full flex flex-col shadow-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Weekly Attendance</CardTitle>
        <CardDescription>A summary of student attendance over the last 7 days.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pb-4">
        {loading ? (
          <Skeleton className="w-full h-[250px] rounded-md" />
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart 
                data={data}
                margin={{ top: 5, right: 20, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
              <XAxis
                dataKey="name"
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
                tickFormatter={(value) => `${value}`}
                width={30}
              />
              <Tooltip
                cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: "3 3" }}
                content={<CustomTooltip />}
              />
              <Legend 
                wrapperStyle={{fontSize: "14px", paddingTop: "10px"}}
                iconSize={10}
                iconType="circle"
              />
              <Area type="monotone" dataKey="Present" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorPresent)" strokeWidth={2} />
              <Area type="monotone" dataKey="Absent" stroke="hsl(var(--muted-foreground))" fillOpacity={1} fill="url(#colorAbsent)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
