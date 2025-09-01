
"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";
import { subDays, format } from "date-fns";

type ChartData = {
  date: string;
  name: string;
  present: number;
  absent: number;
};

// MOCK DATA: Using static data for UI development
const generateMockData = () => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
        const day = subDays(today, i);
        return {
            date: format(day, "yyyy-MM-dd"),
            name: format(day, "MMM d"),
            present: Math.floor(Math.random() * 25) + 5,
            absent: Math.floor(Math.random() * 5),
        };
    }).reverse();
};


export function AttendanceChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Using mock data since auth is disabled
    setLoading(true);
    setTimeout(() => {
        setData(generateMockData());
        setLoading(false);
    }, 1000);
  }, []);

  return (
    <Card className="h-full flex flex-col transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
      <CardHeader>
        <CardTitle>Attendance Overview</CardTitle>
        <CardDescription>Last 7 days attendance summary (using mock data).</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {loading ? (
          <Skeleton className="w-full h-[250px]" />
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
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
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--card))" }}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend wrapperStyle={{fontSize: "14px"}}/>
              <Bar dataKey="present" name="Present" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="absent" name="Absent" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
