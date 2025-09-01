
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
    <Card className="h-full flex flex-col transition-all duration-300 ease-out hover:bg-card/95 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
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
                cursor={{ fill: "hsl(var(--accent))", radius: "var(--radius)" }}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  boxShadow: "0 4px 12px hsla(var(--foreground), 0.1)",
                }}
              />
              <Legend wrapperStyle={{fontSize: "14px"}}/>
              <Bar dataKey="present" name="Present" fill="hsla(var(--primary), 0.8)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="absent" name="Absent" fill="hsla(var(--muted-foreground), 0.5)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
