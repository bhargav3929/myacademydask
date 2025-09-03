
import type { Attendance, Student, Stadium } from "@/lib/types";

export type ReportData = Attendance & { studentName: string };

export interface StudentReportData {
    id: string;
    name: string;
    attendance: Record<string, 'present' | 'absent' | null>;
    presents: number;
    absents: number;
    percentage: number;
}

export interface RevenueData {
    totalRevenue: number;
    monthName: string;
    highestRevenueDay: { date: string, amount: number };
    growth: number;
}

export interface ReportSummaryData {
    totalStudents: number;
    averageAttendance: number;
    alwaysPresent: string[];
    below60Attendance: string[];
}

export interface ProcessedReport {
    dates: Date[];
    studentData: StudentReportData[];
    summary: ReportSummaryData;
}

export interface NewJoiner {
    name: string;
    joinDate: Date;
    coachName: string;
    stadiumName: string;
}
