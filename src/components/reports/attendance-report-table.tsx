
"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import type { ProcessedReport } from "./report-types";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface AttendanceReportTableProps {
  reportData: ProcessedReport;
}

export function AttendanceReportTable({ reportData }: AttendanceReportTableProps) {
  const { dates, studentData } = reportData;

  const getStatusIcon = (status: 'present' | 'absent' | null) => {
    if (status === 'present') return <Check className="size-5 text-green-500 mx-auto" />;
    if (status === 'absent') return <X className="size-5 text-red-500 mx-auto" />;
    return <span className="text-muted-foreground">-</span>;
  };
  
  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Register</CardTitle>
        <CardDescription>
          A detailed day-by-day attendance log for the selected period.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap rounded-lg border">
            <Table className="min-w-full">
            <TableHeader>
                <TableRow className="bg-muted hover:bg-muted">
                <TableHead className="sticky left-0 bg-muted font-semibold w-[200px] z-10">Student Name</TableHead>
                {dates.map((date) => (
                    <TableHead key={date.toString()} className="text-center font-normal text-muted-foreground">{format(date, "d")}</TableHead>
                ))}
                <TableHead className="text-center font-semibold">Presents</TableHead>
                <TableHead className="text-center font-semibold">Absents</TableHead>
                <TableHead className="text-center font-semibold">Attendance %</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {studentData.length > 0 ? (
                studentData.map((student) => (
                    <TableRow key={student.id}>
                    <TableCell className="sticky left-0 bg-background font-medium z-10">{student.name}</TableCell>
                    {dates.map((date) => (
                        <TableCell key={date.toString()} className="text-center">
                        {getStatusIcon(student.attendance[format(date, "yyyy-MM-dd")])}
                        </TableCell>
                    ))}
                    <TableCell className="text-center font-medium">{student.presents}</TableCell>
                    <TableCell className="text-center font-medium">{student.absents}</TableCell>
                    <TableCell className={cn("text-center font-bold", getPercentageColor(student.percentage))}>{student.percentage}%</TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={dates.length + 4} className="h-24 text-center">
                    No records found for the selected criteria.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
