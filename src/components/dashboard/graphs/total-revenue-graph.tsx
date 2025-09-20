
"use client";

import { useEffect, useState, useCallback } from "react";
import { collectionGroup, query, onSnapshot, where } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "../../ui/skeleton";
import { format, startOfToday, eachDayOfInterval, subDays, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { Student } from "@/lib/types";
import { Button } from "../../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { CalendarIcon, TrendingUp, SlidersHorizontal } from "lucide-react";
import { Calendar } from "../../ui/calendar";
import { DateRange } from "react-day-picker";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCurrency, Currency } from "@/contexts/CurrencyContext";

interface ChartData {
  name: string;
  "Revenue": number;
}
type TimeFilter = "weekly" | "monthly" | "last_30_days" | "custom";

const currencySymbols: { [key in Currency]: string } = {
    USD: '$',
    INR: '₹',
    EUR: '€',
    GBP: '£',
    AED: 'د.إ',
};

const CustomTooltip = ({ active, payload, label, currency }: any) => {
  if (active && payload && payload.length) {
    const locale = currency === 'INR' ? 'en-IN' : 'en-US';
    return (
      <div className="rounded-lg border bg-background/95 p-2 shadow-lg backdrop-blur-sm">
        <p className="font-bold text-base mb-1">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "hsl(var(--chart-3))" }} />
            <span className="text-sm text-muted-foreground">Revenue:</span>
            <span className="text-sm font-bold">
                {new Intl.NumberFormat(locale, { style: 'currency', currency }).format(payload[0].value)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function TotalRevenueGraph({ organizationId }: { organizationId: string | null }) {
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("last_30_days");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [customPopoverOpen, setCustomPopoverOpen] = useState(false);
  const { currency } = useCurrency();


  useEffect(() => {
    if (!organizationId) {
        setLoading(false);
        return;
    };
    setLoading(true);
    const studentsQuery = query(
        collectionGroup(firestore, "students"),
        where("organizationId", "==", organizationId)
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

    const newStudentsInRange = records.filter(student => {
      const joinDate = student.joinDate.toDate();
      return isWithinInterval(joinDate, { start: range.from!, end: range.to || range.from! });
    });
    
    const revenueByDay: { [key: string]: number } = {};
    newStudentsInRange.forEach(student => {
      const dateStr = format(student.joinDate.toDate(), 'yyyy-MM-dd');
      if (!revenueByDay[dateStr]) {
        revenueByDay[dateStr] = 0;
      }
      revenueByDay[dateStr] += student.fees || 0;
    });

    const intervalDays = eachDayOfInterval({
      start: range.from,
      end: range.to || range.from
    });

    const chartData = intervalDays.map(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      return {
        name: format(day, "MMM d"),
        "Revenue": revenueByDay[dateKey] || 0,
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
    } else if (timeFilter === 'last_30_days') {
        setDateRange({ from: subDays(now, 29), to: now });
    }
  }, [timeFilter]);

  useEffect(() => {
    if (dateRange?.from) {
      processChartData(allStudents, dateRange);
    }
  }, [dateRange, allStudents, processChartData]);
  
  const getFilterPeriodText = () => {
    switch (timeFilter) {
      case 'weekly': return "for this week.";
      case 'monthly': return "for this month.";
      case 'last_30_days': return "for the last 30 days.";
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

  const handleFilterClick = (filter: TimeFilter) => {
    setTimeFilter(filter);
    if (filter === 'custom') {
      setCustomPopoverOpen(true);
    }
  };


  return (
    <Card className="h-full flex flex-col border-0 shadow-none">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
            <div className="flex-1">
                <CardTitle className="flex items-center gap-3 text-2xl">
                    <TrendingUp className="size-7 text-primary" />
                    Total Revenue
                </CardTitle>
                <CardDescription className="hidden md:block">Total revenue from new student admissions {getFilterPeriodText()}</CardDescription>
            </div>
             {/* Desktop Filters */}
            <div className="hidden md:flex items-center gap-1 rounded-full border bg-card p-1 flex-wrap">
                {(["weekly", "monthly", "last_30_days"] as TimeFilter[]).map(filter => (
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
            {/* Mobile Filters */}
             <div className="md:hidden self-end">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="flex items-center gap-2">
                             <SlidersHorizontal className="size-4" />
                             <span className="sr-only">Filter</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                         {(["weekly", "monthly", "last_30_days"] as TimeFilter[]).map(filter => (
                            <DropdownMenuItem key={filter} onSelect={() => handleFilterClick(filter)} className="capitalize">
                                {filter.replace('_', ' ')}
                            </DropdownMenuItem>
                        ))}
                         <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => handleFilterClick('custom')}>
                             <CalendarIcon className="mr-2 size-4" /> Custom Range
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Popover open={customPopoverOpen} onOpenChange={setCustomPopoverOpen}>
                    <PopoverTrigger asChild><span /></PopoverTrigger>
                    <PopoverContent className="w-auto p-0 mt-2" align="end">
                        <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={(range) => {
                            setDateRange(range);
                            if(range?.from) setCustomPopoverOpen(false);
                        }}
                        numberOfMonths={1}
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
              margin={{ top: 5, right: 20, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
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
                tickFormatter={(value) => `${currencySymbols[currency]}${Number(value) / 1000}k`}
                width={45}
              />
              <Tooltip
                cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1.5, strokeDasharray: "4 4" }}
                content={<CustomTooltip currency={currency} />}
                wrapperStyle={{ outline: 'none' }}
              />
              <Area 
                type="monotone" 
                dataKey="Revenue" 
                stroke="hsl(var(--chart-3))"
                fill="url(#colorRevenue)" 
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
          <div className="flex h-[300px] items-center justify-center text-muted-foreground flex-col gap-2">
            <p className="text-sm">No revenue data to display for the selected period.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
