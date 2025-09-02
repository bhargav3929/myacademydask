
"use client";

import { useEffect, useState } from "react";
import { collectionGroup, query, where, getDocs, Timestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface ChartData {
  name: string;
  Present: number;
  Absent: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background/95 p-2 shadow-lg backdrop-blur-sm">
        <p className="font-bold text-base mb-1">{label}</p>
        <div className="space-y-1">
          {payload.map((p: any, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.stroke }} />
              <span className="text-sm text-muted-foreground">{`${p.name}:`}</span>
              <span className="text-sm font-bold">{p.value.toFixed(1)}%</span>
            </div>
          ))}
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
    const fetchData = async () => {
      setLoading(true);
      try {
        const today = new Date();
        const promises = [];

        for (let i = 6; i >= 0; i--) {
          const day = subDays(today, i);
          const dateStr = format(day, "yyyy-MM-dd");

          const attendanceQuery = query(
            collectionGroup(firestore, "attendance"),
            where("date", "==", dateStr)
          );
          promises.push(getDocs(attendanceQuery));
        }
        
        const snapshots = await Promise.all(promises);
        
        const chartData = snapshots.map((snapshot, i) => {
            const day = subDays(today, 6-i);
            let presentCount = 0;
            let absentCount = 0;
            snapshot.forEach(doc => {
                if (doc.data().status === 'present') {
                    presentCount++;
                } else {
                    absentCount++;
                }
            });

            const total = presentCount + absentCount;
            return {
                name: format(day, "eee"),
                Present: total > 0 ? (presentCount / total) * 100 : 0,
                Absent: total > 0 ? (absentCount / total) * 100 : 0,
            };
        });
        
        setData(chartData);

      } catch (error) {
        console.error("Error fetching attendance data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Weekly Attendance</CardTitle>
        <CardDescription>Attendance percentage for the last 7 days.</CardDescription>
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
                <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-present)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-present)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-absent)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--color-absent)" stopOpacity={0} />
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
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
                width={35}
              />
              <Tooltip
                cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1.5, strokeDasharray: "4 4" }}
                content={<CustomTooltip />}
                wrapperStyle={{ outline: 'none' }}
              />
              <Area 
                type="monotone" 
                dataKey="Present" 
                stroke="hsl(var(--chart-1))"
                fill="url(#colorPresent)" 
                strokeWidth={2.5}
                dot={false}
                style={{'--color-present': 'hsl(var(--chart-1))'} as React.CSSProperties}
              />
              <Area 
                type="monotone" 
                dataKey="Absent" 
                stroke="hsl(var(--destructive))"
                fill="url(#colorAbsent)"
                strokeWidth={2}
                dot={false}
                style={{'--color-absent': 'hsl(var(--destructive))'} as React.CSSProperties}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground flex-col gap-2">
            <p className="text-sm">No attendance data to display yet.</p>
            <p className="text-xs">Data will appear here once coaches start marking attendance.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

