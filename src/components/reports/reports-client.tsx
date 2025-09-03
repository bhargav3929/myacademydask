
"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, getDoc, orderBy, onSnapshot, Timestamp, collectionGroup } from "firebase/firestore";
import { firestore, auth } from "@/lib/firebase";
import { Stadium, Attendance, Student } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon, FileText, Download } from "lucide-react";
import { format, startOfMonth, eachDayOfInterval, subMonths } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { ReportData, ProcessedReport, NewJoiner, RevenueData } from "./report-types";
import { AttendanceReportTable } from "./attendance-report-table";
import { ReportSummary } from "./report-summary";
import { NewJoiners } from "./new-joiners";
import { generatePdf } from "@/lib/pdf-generator";

export function ReportsClient() {
  const { toast } = useToast();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [coaches, setCoaches] = useState<Record<string, string>>({});
  const [selectedStadium, setSelectedStadium] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });
  const [processedReport, setProcessedReport] = useState<ProcessedReport | null>(null);
  const [newJoiners, setNewJoiners] = useState<NewJoiner[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDocRef = doc(firestore, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setOrganizationId(userDocSnap.data().organizationId);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!organizationId) return;

    setLoading(true);
    const stadiumsQuery = query(
      collection(firestore, "stadiums"),
      where("organizationId", "==", organizationId)
    );
    const unsubscribeStadiums = onSnapshot(stadiumsQuery, (snapshot) => {
      const stadiumsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Stadium[];
      setStadiums(stadiumsData);
      setLoading(false);
    });
    
    const coachesQuery = query(
        collection(firestore, "users"),
        where("organizationId", "==", organizationId),
        where("role", "==", "coach")
    );
    const unsubscribeCoaches = onSnapshot(coachesQuery, (snapshot) => {
        const coachesMap: Record<string, string> = {};
        snapshot.forEach(doc => {
            coachesMap[doc.id] = doc.data().fullName;
        });
        setCoaches(coachesMap);
    });


    return () => {
        unsubscribeStadiums();
        unsubscribeCoaches();
    };
  }, [organizationId]);
  
  const processDataForReport = async (students: Student[], attendanceRecords: ReportData[], range: DateRange): Promise<{ report: ProcessedReport, joiners: NewJoiner[], revenue: RevenueData }> => {
    const dates = eachDayOfInterval({ start: range.from!, end: range.to! });
    const studentData: Record<string, { name: string; attendance: Record<string, 'present' | 'absent' | null> }> = {};
    
    students.forEach(s => {
      studentData[s.id] = { name: s.fullName, attendance: {} };
      dates.forEach(d => {
        studentData[s.id].attendance[format(d, 'yyyy-MM-dd')] = null;
      });
    });

    attendanceRecords.forEach(rec => {
      if (studentData[rec.studentId]) {
        studentData[rec.studentId].attendance[rec.date] = rec.status;
      }
    });

    const studentRows = Object.entries(studentData).map(([id, data]) => {
      const presents = Object.values(data.attendance).filter(s => s === 'present').length;
      const absents = Object.values(data.attendance).filter(s => s === 'absent').length;
      const totalDays = Object.values(data.attendance).filter(s => s !== null).length;
      const percentage = totalDays > 0 ? Math.round((presents / totalDays) * 100) : 0;
      return { id, name: data.name, attendance: data.attendance, presents, absents, percentage };
    });

    const totalAttendance = studentRows.reduce((acc, row) => acc + row.percentage, 0);
    const avgAttendance = studentRows.length > 0 ? Math.round(totalAttendance / studentRows.length) : 0;
    
    const joiners = students
        .filter(s => s.joinDate.toDate() >= range.from! && s.joinDate.toDate() <= range.to!)
        .map(s => ({ 
            name: s.fullName, 
            joinDate: s.joinDate.toDate(), 
            stadiumName: stadiums.find(stadium => stadium.id === s.stadiumId)?.name || 'N/A',
            coachName: coaches[s.coachId] || 'N/A'
        }));

    // Revenue calculation
    const currentMonthRevenue = students
        .filter(s => s.joinDate.toDate() >= range.from! && s.joinDate.toDate() <= range.to!)
        .reduce((acc, s) => acc + (s.fees || 0), 0);
    
    const revenueByDay: Record<string, number> = {};
     students
        .filter(s => s.joinDate.toDate() >= range.from! && s.joinDate.toDate() <= range.to!)
        .forEach(s => {
            const dateStr = format(s.joinDate.toDate(), 'yyyy-MM-dd');
            revenueByDay[dateStr] = (revenueByDay[dateStr] || 0) + (s.fees || 0);
        });

    const highestRevenueDay = Object.entries(revenueByDay).reduce((max, entry) => entry[1] > max.amount ? { date: entry[0], amount: entry[1] } : max, { date: '', amount: 0 });

    // Previous month revenue for growth calculation
    const prevMonthStart = subMonths(range.from!, 1);
    const prevMonthEnd = subMonths(range.to!, 1);

    const prevMonthStudentsQuery = query(
        collectionGroup(firestore, "students"), 
        where("organizationId", "==", organizationId),
        where("stadiumId", "==", selectedStadium),
        where("joinDate", ">=", Timestamp.fromDate(prevMonthStart)),
        where("joinDate", "<=", Timestamp.fromDate(prevMonthEnd))
    );
    const prevMonthSnapshot = await getDocs(prevMonthStudentsQuery);
    const prevMonthRevenue = prevMonthSnapshot.docs.reduce((acc, doc) => acc + (doc.data().fees || 0), 0);
    
    const growth = prevMonthRevenue > 0 
        ? Math.round(((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100)
        : currentMonthRevenue > 0 ? 100 : 0;

    const revenue: RevenueData = {
        totalRevenue: currentMonthRevenue,
        monthName: format(range.from!, 'MMMM yyyy'),
        highestRevenueDay,
        growth
    }

    const report: ProcessedReport = {
        dates,
        studentData: studentRows,
        summary: {
            totalStudents: students.length,
            averageAttendance: avgAttendance,
            alwaysPresent: studentRows.filter(s => s.percentage === 100).map(s => s.name),
            below60Attendance: studentRows.filter(s => s.percentage < 60 && s.presents > 0).map(s => s.name),
            zeroAttendance: studentRows.filter(s => s.percentage === 0 && s.absents > 0).map(s => s.name),
        }
    };

    return { report, joiners, revenue };
  }


  const handleGenerateReport = async () => {
    if (!selectedStadium || !dateRange?.from || !dateRange?.to) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a stadium and a complete date range.",
      });
      return;
    }
    
    setIsGenerating(true);
    setProcessedReport(null);
    setNewJoiners([]);
    setRevenueData(null);

    try {
      const studentsRef = collection(firestore, `stadiums/${selectedStadium}/students`);
      const studentsSnapshot = await getDocs(studentsRef);
      const studentsData = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));

      const attendanceQuery = query(
        collection(firestore, `stadiums/${selectedStadium}/attendance`),
        where("date", ">=", format(dateRange.from, "yyyy-MM-dd")),
        where("date", "<=", format(dateRange.to, "yyyy-MM-dd")),
      );
      const attendanceSnapshot = await getDocs(attendanceQuery);
      const attendanceData = attendanceSnapshot.docs.map(doc => doc.data() as ReportData);
      
      if (studentsData.length === 0) {
        toast({ title: "No Students Found", description: "There are no students enrolled in this stadium to generate a report for." });
        setProcessedReport({ dates: [], studentData: [], summary: { totalStudents: 0, averageAttendance: 0, alwaysPresent: [], below60Attendance: [], zeroAttendance: [] } });
        setNewJoiners([]);
        setRevenueData({ totalRevenue: 0, monthName: format(dateRange.from, "MMMM yyyy"), highestRevenueDay: { date: '', amount: 0 }, growth: 0 });
        setIsGenerating(false);
        return;
      }

      const { report, joiners, revenue } = await processDataForReport(studentsData, attendanceData, dateRange);
      
      setProcessedReport(report);
      setNewJoiners(joiners);
      setRevenueData(revenue);

      toast({
          title: "Report Generated Successfully",
          description: `Displaying report for ${studentsData.length} students.`,
      });

    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate the report. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!processedReport || !stadiums.length || !dateRange?.from || !revenueData) return;
    setIsDownloading(true);
    try {
      const stadiumName = stadiums.find(s => s.id === selectedStadium)?.name || "Unknown Stadium";
      await generatePdf({ reportData: processedReport, newJoiners, revenueData, stadiumName, dateRange });
      toast({ title: "PDF Download Started", description: "Your report is being downloaded." });
    } catch (error) {
        console.error("Error generating PDF:", error);
        toast({ variant: "destructive", title: "PDF Generation Failed", description: "There was an error creating the PDF." });
    } finally {
        setIsDownloading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Report Generator</CardTitle>
          <CardDescription>Select a stadium and date range to generate an attendance report.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Stadium</label>
            <Select value={selectedStadium} onValueChange={setSelectedStadium} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select a stadium" />
              </SelectTrigger>
              <SelectContent>
                {stadiums.map((stadium) => (
                  <SelectItem key={stadium.id} value={stadium.id}>
                    {stadium.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
             <label className="text-sm font-medium">Date Range</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="range" selected={dateRange} onSelect={setDateRange} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-end">
            <Button onClick={handleGenerateReport} disabled={isGenerating || loading} className="w-full">
              {isGenerating ? "Generating..." : "Generate Report"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isGenerating && (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-2/3 mt-2" />
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </CardContent>
        </Card>
      )}

      {processedReport && (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                    <Download className="mr-2 h-4 w-4" />
                    {isDownloading ? 'Downloading...' : 'Download PDF'}
                </Button>
            </div>
            <AttendanceReportTable reportData={processedReport} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ReportSummary summary={processedReport.summary} revenue={revenueData} />
              <NewJoiners joiners={newJoiners} />
            </div>
        </div>
      )}

    </div>
  );
}
