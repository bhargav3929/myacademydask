"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";
import { subDays, format } from "date-fns";

type ChartData = {
  date: string;
  name: string;
  present: number;
  absent: number;
};

export function AttendanceChart() {
  const { userData } = useAuth();
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData?.organizationId) return;

    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(today, i));
    const startDate = format(last7Days[6], "yyyy-MM-dd");

    const attendanceQuery = query(
      collection(firestore, "attendance"),
      where("organizationId", "==", userData.organizationId),
      where("date", ">=", startDate)
    );

    const unsubscribe = onSnapshot(attendanceQuery, (snapshot) => {
      const dailyData: { [key: string]: { present: number; absent: number } } = {};

      last7Days.forEach(day => {
        const dateStr = format(day, "yyyy-MM-dd");
        dailyData[dateStr] = { present: 0, absent: 0 };
      });
      
      snapshot.docs.forEach((doc) => {
        const record = doc.data();
        if (dailyData[record.date]) {
          if (record.status === 'present') {
            dailyData[record.date].present++;
          } else if (record.status === 'absent') {
            dailyData[record.date].absent++;
          }
        }
      });

      const chartData = Object.entries(dailyData).map(([date, counts]) => ({
        date: date,
        name: format(new Date(date), "MMM d"),
        ...counts,
      })).reverse();

      setData(chartData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching attendance data: ", error);
        setLoading(false);
    });
    
    return () => unsubscribe();
  }, [userData?.organizationId]);

  return (
    <Card className="h-full flex flex-col transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
      <CardHeader>
        <CardTitle>Attendance Overview</CardTitle>
        <CardDescription>Last 7 days attendance summary.</CardDescription>
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
