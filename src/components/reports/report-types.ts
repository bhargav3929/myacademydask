
import type { Attendance, Student } from "@/lib/types";

export type ReportData = Attendance & { studentName: string };

export interface StudentReportData {
    id: string;
    name: string;
    attendance: Record<string, 'present' | 'absent' | null>;
    presents: number;
    absents: number;
    percentage: number;
}

export interface ReportSummaryData {
    totalStudents: number;
    averageAttendance: number;
    totalRevenue: number;
    alwaysPresent: string[];
    alwaysAbsent: string[];
}

export interface ProcessedReport {
    dates: Date[];
    studentData: StudentReportData[];
    summary: ReportSummaryData;
}

export interface NewJoiner {
    name: string;
    joinDate: Date;
    fees: number;
}
