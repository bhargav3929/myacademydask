
"use client";

import { useEffect, useState } from "react";
import { collectionGroup, query, where, onSnapshot, Timestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';
import { Attendance } from "@/lib/types";

interface ChartData {
  name: string;
  Attendance: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background/95 p-2 shadow-lg backdrop-blur-sm">
        <p className="font-bold text-base mb-1">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "hsl(var(--chart-1))" }} />
            <span className="text-sm text-muted-foreground">Students Present:</span>
            <span className="text-sm font-bold">{payload[0].value}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function AttendanceGraph() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const today = new Date();
    const tenDaysAgo = startOfDay(subDays(today, 9));

    const attendanceQuery = query(
      collectionGroup(firestore, "attendance"),
      where("timestamp", ">=", Timestamp.fromDate(tenDaysAgo)),
      where("status", "==", "present")
    );

    const unsubscribe = onSnapshot(attendanceQuery, (snapshot) => {
      const attendanceRecords = snapshot.docs.map(doc => doc.data() as Attendance);

      const attendanceCountsByDay: { [key: string]: number } = {};

      attendanceRecords.forEach(record => {
        const dateStr = record.date; // Uses the YYYY-MM-DD string
        if (!attendanceCountsByDay[dateStr]) {
          attendanceCountsByDay[dateStr] = 0;
        }
        attendanceCountsByDay[dateStr]++;
      });

      const last10Days = eachDayOfInterval({
        start: tenDaysAgo,
        end: today
      });

      const chartData = last10Days.map(day => {
        const dateKey = format(day, 'yyyy-MM-dd');
        return {
          name: format(day, "MMM d"),
          Attendance: attendanceCountsByDay[dateKey] || 0,
        };
      });

      setData(chartData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching attendance data for chart:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Attendance Graph</CardTitle>
        <CardDescription>Total student attendance across all stadiums for the last 10 days.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pb-4 -ml-4">
        {loading ? (
          <Skeleton className="w-full h-[300px]" />
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart 
              data={data}
              margin={{ top: 5, right: 20, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
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
                allowDecimals={false}
                width={35}
              />
              <Tooltip
                cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1.5, strokeDasharray: "4 4" }}
                content={<CustomTooltip />}
                wrapperStyle={{ outline: 'none' }}
              />
              <Area 
                type="monotone" 
                dataKey="Attendance" 
                stroke="hsl(var(--chart-1))"
                fill="url(#colorAttendance)" 
                strokeWidth={2.5}
                dot={{
                  r: 4,
                  strokeWidth: 2,
                  fill: "hsl(var(--background))"
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground flex-col gap-2">
            <p className="text-sm">No attendance data to display yet.</p>
             <p className="text-xs">Once a coach marks attendance, it will appear here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
