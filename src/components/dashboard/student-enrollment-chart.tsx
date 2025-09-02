
"use client";

import { useEffect, useState } from "react";
import { collectionGroup, query, getDocs, Timestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { Student } from "@/lib/types";

interface ChartData {
  name: string;
  Students: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background/95 p-2 shadow-lg backdrop-blur-sm">
        <p className="font-bold text-base mb-1">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "hsl(var(--chart-1))" }} />
            <span className="text-sm text-muted-foreground">Total Students:</span>
            <span className="text-sm font-bold">{payload[0].value}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function StudentEnrollmentChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const studentsQuery = query(collectionGroup(firestore, "students"));
        const snapshot = await getDocs(studentsQuery);
        const students = snapshot.docs.map(doc => doc.data() as Student);

        const monthlyEnrollments = Array(12).fill(0);

        students.forEach(student => {
          if (student.joinDate) {
            const joinDate = student.joinDate.toDate();
            if (joinDate.getFullYear() === 2025) {
              const month = joinDate.getMonth();
              monthlyEnrollments[month]++;
            }
          }
        });

        let cumulativeStudents = 0;
        const chartData = monthlyEnrollments.map((enrollments, i) => {
          cumulativeStudents += enrollments;
          return {
            name: format(new Date(2025, i, 1), "MMM"),
            Students: cumulativeStudents,
          };
        });

        setData(chartData);

      } catch (error) {
        console.error("Error fetching student data for chart:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Student Enrollment Growth</CardTitle>
        <CardDescription>Cumulative student registrations for 2025.</CardDescription>
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
                <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
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
                domain={[0, 'dataMax + 10']}
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
                dataKey="Students" 
                stroke="hsl(var(--chart-1))"
                fill="url(#colorStudents)" 
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
            <p className="text-sm">No enrollment data to display yet for 2025.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
