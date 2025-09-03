
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListChecks } from "lucide-react";
import type { ReportSummaryData } from "./report-types";

interface ReportSummaryProps {
  summary: ReportSummaryData;
}

const StatCard = ({ title, value }: { title: string; value: string | number }) => (
    <div className="flex flex-col space-y-1 rounded-lg border p-3">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
);

export function ReportSummary({ summary }: ReportSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <ListChecks className="size-5" />
            Report Summary
        </CardTitle>
        <CardDescription>An overview of the attendance report.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <StatCard title="Total Students" value={summary.totalStudents} />
            <StatCard title="Average Attendance" value={`${summary.averageAttendance}%`} />
        </div>
        <div>
            <h4 className="font-medium text-sm mb-2">Perfect Attendance (100%)</h4>
            {summary.alwaysPresent.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                    {summary.alwaysPresent.map(name => <Badge key={name} variant="secondary" className="bg-green-100 text-green-800">{name}</Badge>)}
                </div>
            ) : (
                <p className="text-xs text-muted-foreground">No students had perfect attendance.</p>
            )}
        </div>
         <div>
            <h4 className="font-medium text-sm mb-2">Complete Absentees</h4>
            {summary.alwaysAbsent.length > 0 ? (
                 <div className="flex flex-wrap gap-1">
                    {summary.alwaysAbsent.map(name => <Badge key={name} variant="secondary" className="bg-red-100 text-red-800">{name}</Badge>)}
                </div>
            ) : (
                <p className="text-xs text-muted-foreground">No students were absent for all marked days.</p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}

    