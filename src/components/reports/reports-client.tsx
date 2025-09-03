
"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, getDoc, orderBy, onSnapshot } from "firebase/firestore";
import { firestore, auth } from "@/lib/firebase";
import { Stadium, Attendance, Student } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon, FileText } from "lucide-react";
import { format, startOfMonth } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type ReportData = (Attendance & { studentName: string });

export function ReportsClient() {
  const { toast } = useToast();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [selectedStadium, setSelectedStadium] = useState<string>("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

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
    const unsubscribe = onSnapshot(stadiumsQuery, (snapshot) => {
      const stadiumsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Stadium[];
      setStadiums(stadiumsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [organizationId]);

  const handleGenerateReport = async () => {
    if (!selectedStadium || !dateRange?.from) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a stadium and a date range.",
      });
      return;
    }
    
    setIsGenerating(true);
    setReportData([]);

    try {
      // 1. Fetch student data for the selected stadium
      const studentsRef = collection(firestore, `stadiums/${selectedStadium}/students`);
      const studentsSnapshot = await getDocs(studentsRef);
      const studentsMap = new Map<string, string>();
      studentsSnapshot.forEach(doc => {
          studentsMap.set(doc.id, doc.data().fullName);
      });

      // 2. Fetch attendance data
      const attendanceQuery = query(
        collection(firestore, `stadiums/${selectedStadium}/attendance`),
        where("date", ">=", format(dateRange.from, "yyyy-MM-dd")),
        where("date", "<=", format(dateRange.to || dateRange.from, "yyyy-MM-dd")),
        orderBy("date", "desc")
      );

      const attendanceSnapshot = await getDocs(attendanceQuery);
      const data: ReportData[] = attendanceSnapshot.docs.map((doc) => {
          const attendance = doc.data() as Attendance;
          return {
              ...attendance,
              studentName: studentsMap.get(attendance.studentId) || "Unknown Student",
          };
      });

      setReportData(data);

      toast({
          title: "Report Generated",
          description: `Found ${data.length} attendance records.`,
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

    {(isGenerating || reportData.length > 0) && (
        <Card>
            <CardHeader>
                <CardTitle>Report Preview</CardTitle>
                <CardDescription>
                    A preview of the attendance records for the selected criteria.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student Name</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Batch</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isGenerating ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                    </TableRow>
                                ))
                            ) : reportData.length > 0 ? (
                                reportData.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell className="font-medium">{record.studentName}</TableCell>
                                    <TableCell>{format(new Date(record.date), "PPP")}</TableCell>
                                    <TableCell>
                                        <span className={cn("px-2 py-1 rounded-full text-xs font-semibold", record.status === 'present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                                            {record.status === 'present' ? 'Present' : 'Absent'}
                                        </span>
                                    </TableCell>
                                    <TableCell>{record.batch}</TableCell>
                                </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No records found for the selected criteria.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )}

    </div>
  );
}
