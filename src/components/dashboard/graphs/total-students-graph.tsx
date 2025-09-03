
"use client";

import { useEffect, useState, useCallback } from "react";
import { collectionGroup, query, onSnapshot, where, orderBy } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "../../ui/skeleton";
import { format, startOfToday, eachDayOfInterval, subDays, isWithinInterval, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { Student } from "@/lib/types";
import { Button } from "../../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { CalendarIcon, Users } from "lucide-react";
import { Calendar } from "../../ui/calendar";
import { DateRange } from "react-day-picker";

interface ChartData {
  name: string;
  "Total Students": number;
}
type TimeFilter = "weekly" | "monthly" | "last_30_days" | "all_time" | "custom";

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

export function TotalStudentsGraph({ organizationId }: { organizationId: string | null }) {
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all_time");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  useEffect(() => {
    if (!organizationId) {
        setLoading(false);
        return;
    };
    setLoading(true);
    const studentsQuery = query(
        collectionGroup(firestore, "students"),
        where("organizationId", "==", organizationId),
        orderBy("joinDate", "asc")
    );

    const unsubscribe = onSnapshot(studentsQuery, (snapshot) => {
      const studentRecords = snapshot.docs.map(doc => doc.data() as Student);
      setAllStudents(studentRecords);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching student data:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [organizationId]);

  const processChartData = useCallback((records: Student[], range: DateRange) => {
    if (!range.from) return;

    let cumulativeCount = 0;
    const initialStudentsBeforeRange = records.filter(student => student.joinDate.toDate() < range.from!).length;
    cumulativeCount = initialStudentsBeforeRange;
    
    const intervalDays = eachDayOfInterval({
      start: range.from,
      end: range.to || range.from
    });

    const chartData = intervalDays.map(day => {
      const studentsJoinedOnDay = records.filter(student => format(student.joinDate.toDate(), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')).length;
      cumulativeCount += studentsJoinedOnDay;
      return {
        name: format(day, "MMM d"),
        "Total Students": cumulativeCount,
      };
    });

    setData(chartData);
  }, []);

  const processAllTimeData = useCallback((records: Student[]) => {
    if (records.length === 0) {
      setData([]);
      return;
    }
    const firstJoinDate = records[0].joinDate.toDate();
    const today = new Date();
    
    setDateRange({ from: firstJoinDate, to: today });
    processChartData(records, { from: firstJoinDate, to: today });
  }, [processChartData]);


  useEffect(() => {
    const now = new Date();
    if (timeFilter === 'weekly') {
      setDateRange({ from: startOfWeek(now), to: endOfWeek(now) });
    } else if (timeFilter === 'monthly') {
      setDateRange({ from: startOfMonth(now), to: endOfMonth(now) });
    } else if (timeFilter === 'last_30_days') {
        setDateRange({ from: subDays(now, 29), to: now });
    } else if (timeFilter === 'all_time') {
        if (allStudents.length > 0) {
            processAllTimeData(allStudents);
        } else if (!loading) {
            setData([]);
        }
    }
  }, [timeFilter, allStudents, processAllTimeData, loading]);

  useEffect(() => {
    if (dateRange?.from && timeFilter !== 'all_time') {
      processChartData(allStudents, dateRange);
    }
  }, [dateRange, allStudents, processChartData, timeFilter]);
  
  const getFilterPeriodText = () => {
    switch (timeFilter) {
      case 'weekly': return "for this week.";
      case 'monthly': return "for this month.";
      case 'last_30_days': return "for the last 30 days.";
      case 'all_time': return "since the beginning.";
      case 'custom': 
        if (dateRange?.from) {
          if (dateRange.to && format(dateRange.from, 'PPP') !== format(dateRange.to, 'PPP')) {
            return `from ${format(dateRange.from, "MMM d")} to ${format(dateRange.to, "MMM d")}.`;
          }
          return `for ${format(dateRange.from, "MMM d, yyyy")}.`;
        }
        return "for custom range.";
    }
  }


  return (
    <Card className="h-full flex flex-col border-0 shadow-none">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
            <div className="flex-1">
                <CardTitle className="flex items-center gap-3 text-2xl">
                    <Users className="size-7 text-primary" />
                    Total Student Growth
                </CardTitle>
                <CardDescription>Cumulative student enrollment over time {getFilterPeriodText()}</CardDescription>
            </div>
            <div className="flex items-center gap-1 rounded-full border bg-card p-1 flex-wrap">
                {(["weekly", "monthly", "last_30_days", "all_time"] as TimeFilter[]).map(filter => (
                    <Button 
                        key={filter} 
                        variant={timeFilter === filter ? 'secondary' : 'ghost'} 
                        className="rounded-full capitalize text-sm h-8 px-3"
                        onClick={() => setTimeFilter(filter)}
                    >
                        {filter.replace('_', ' ')}
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
                <linearGradient id="colorTotalStudents" x1="0" y1="0" x2="0" y2="1">
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
                type="step" 
                dataKey="Total Students" 
                stroke="hsl(var(--chart-1))"
                fill="url(#colorTotalStudents)" 
                strokeWidth={2.5}
                 dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground flex-col gap-2">
            <p className="text-sm">No student data to display for the selected period.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
