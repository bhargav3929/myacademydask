
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListChecks, TrendingUp, DollarSign, CalendarDays, BarChart, Users, Star, AlertTriangle, UserX } from "lucide-react";
import type { ReportSummaryData, RevenueData } from "./report-types";
import { useCurrency, Currency } from "@/contexts/CurrencyContext";

interface ReportSummaryProps {
  summary: ReportSummaryData | null;
  revenue: RevenueData | null;
}

const StatCard = ({ icon: Icon, title, value, color }: { icon: React.ElementType, title: string; value: string | number, color?: string }) => (
    <div className="flex items-center gap-4 rounded-lg border p-4 bg-background">
      <div className="flex items-center justify-center size-12 rounded-lg bg-secondary">
        <Icon className="size-6 text-secondary-foreground" />
      </div>
      <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={`text-2xl font-bold ${color || 'text-foreground'}`}>{value}</p>
      </div>
    </div>
);

export function ReportSummary({ summary, revenue }: ReportSummaryProps) {
    const { currency } = useCurrency();

    if (!summary || !revenue) return null;

    const getLocaleForCurrency = (c: Currency) => {
        const map: { [key in Currency]: string } = {
            USD: 'en-US',
            INR: 'en-IN',
            EUR: 'de-DE',
            GBP: 'en-GB',
            AED: 'ar-AE'
        };
        return map[c];
    }

    const formattedRevenue = new Intl.NumberFormat(getLocaleForCurrency(currency), {
        style: 'currency',
        currency: currency,
    }).format(revenue.totalRevenue);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <ListChecks className="size-5" />
            Report Summary
        </CardTitle>
        <CardDescription>An overview of the attendance and revenue for the selected period.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard icon={Users} title="Total Students" value={summary.totalStudents} />
            <StatCard icon={BarChart} title="Avg. Attendance" value={`${summary.averageAttendance}%`} />
            <StatCard icon={DollarSign} title="Total Revenue" value={formattedRevenue} color="text-green-600" />
            <StatCard icon={TrendingUp} title="Revenue Growth" value={`${revenue.growth}%`} color={revenue.growth > 0 ? "text-green-600" : "text-red-600"} />
        </div>
        <div>
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2"><Star className="size-4 text-yellow-500" />Perfect Attendance ({summary.alwaysPresent.length})</h4>
            {summary.alwaysPresent.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                    {summary.alwaysPresent.map(name => <Badge key={name} variant="secondary" className="bg-green-100 text-green-800">{name}</Badge>)}
                </div>
            ) : (
                <p className="text-xs text-muted-foreground">No students had perfect attendance.</p>
            )}
        </div>
         <div>
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2"><AlertTriangle className="size-4 text-orange-500" />Attendance Below 60% ({summary.below60Attendance.length})</h4>
            {summary.below60Attendance.length > 0 ? (
                 <div className="flex flex-wrap gap-1">
                    {summary.below60Attendance.map(name => <Badge key={name} variant="secondary" className="bg-orange-100 text-orange-800">{name}</Badge>)}
                </div>
            ) : (
                <p className="text-xs text-muted-foreground">No students had attendance below 60%.</p>
            )}
        </div>
         <div>
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2"><UserX className="size-4 text-red-500" />Zero Attendance ({summary.zeroAttendance.length})</h4>
            {summary.zeroAttendance.length > 0 ? (
                 <div className="flex flex-wrap gap-1">
                    {summary.zeroAttendance.map(name => <Badge key={name} variant="destructive" className="bg-red-100 text-red-800">{name}</Badge>)}
                </div>
            ) : (
                <p className="text-xs text-muted-foreground">No students were absent for all marked sessions.</p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
