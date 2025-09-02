
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { collectionGroup, query, onSnapshot, Timestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, parseISO } from 'date-fns';
import { Attendance } from "@/lib/types";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { DateRange } from "react-day-picker";

interface ChartData {
  name: string;
  Attendance: number;
}
type TimeFilter = "weekly" | "monthly" | "custom";

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
  const [allAttendance, setAllAttendance] = useState<Attendance[]>([]);
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("weekly");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfWeek(new Date()),
    to: endOfWeek(new Date()),
  });

  useEffect(() => {
    setLoading(true);
    const attendanceQuery = query(collectionGroup(firestore, "attendance"));

    const unsubscribe = onSnapshot(attendanceQuery, (snapshot) => {
      const attendanceRecords = snapshot.docs.map(doc => doc.data() as Attendance);
      setAllAttendance(attendanceRecords);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching attendance data:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const processChartData = useCallback((records: Attendance[], range: DateRange) => {
    if (!range.from) return;

    const presentRecords = records.filter(record => {
      const recordDate = parseISO(record.date);
      return isWithinInterval(recordDate, { start: range.from!, end: range.to || range.from! }) && record.status === 'present';
    });
    
    const attendanceCountsByDay: { [key: string]: number } = {};
    presentRecords.forEach(record => {
      const dateStr = record.date;
      if (!attendanceCountsByDay[dateStr]) {
        attendanceCountsByDay[dateStr] = 0;
      }
      attendanceCountsByDay[dateStr]++;
    });

    const intervalDays = eachDayOfInterval({
      start: range.from,
      end: range.to || range.from
    });

    const chartData = intervalDays.map(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      return {
        name: format(day, "MMM d"),
        Attendance: attendanceCountsByDay[dateKey] || 0,
      };
    });

    setData(chartData);
  }, []);


  useEffect(() => {
    const now = new Date();
    if (timeFilter === 'weekly') {
      setDateRange({ from: startOfWeek(now), to: endOfWeek(now) });
    } else if (timeFilter === 'monthly') {
      setDateRange({ from: startOfMonth(now), to: endOfMonth(now) });
    }
  }, [timeFilter]);

  useEffect(() => {
    if (dateRange?.from) {
      processChartData(allAttendance, dateRange);
    }
  }, [dateRange, allAttendance, processChartData]);
  
  const getFilterPeriodText = () => {
    switch (timeFilter) {
      case 'weekly': return "for this week.";
      case 'monthly': return "for this month.";
      case 'custom': 
        if (dateRange?.from) {
          if (dateRange.to && format(dateRange.from, 'PPP') !== format(dateRange.to, 'PPP')) {
            return `from ${format(dateRange.from, "MMM d")} to ${format(dateRange.to, "MMM d")}.`;
          }
          return `for ${format(dateRange.from, "MMM d, yyyy")}.`;
        }
        return "for custom range.";
      default: return "for this week."
    }
  }


  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Attendance Graph</CardTitle>
                <CardDescription>Total student attendance across all stadiums {getFilterPeriodText()}</CardDescription>
            </div>
            <div className="flex items-center gap-1 rounded-full border bg-card p-1">
                {(["weekly", "monthly"] as TimeFilter[]).map(filter => (
                    <Button 
                        key={filter} 
                        variant={timeFilter === filter ? 'secondary' : 'ghost'} 
                        className="rounded-full capitalize text-sm h-8 px-3"
                        onClick={() => setTimeFilter(filter)}
                    >
                        {filter === 'weekly' ? 'This Week' : 'This Month'}
                    </Button>
                ))}
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={timeFilter === 'custom' ? 'secondary' : 'ghost'} 
                            className="rounded-full capitalize text-sm h-8 px-3 flex items-center gap-1.5"
                            onClick={() => setTimeFilter('custom')}
                        >
                            Custom
                            <CalendarIcon className="size-3.5 text-muted-foreground" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 mt-2" align="end">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
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
            <p className="text-sm">No attendance data to display for the selected period.</p>
             <p className="text-xs">Once a coach marks attendance, it will appear here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
