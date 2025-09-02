
"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, doc, getDoc, orderBy } from "firebase/firestore";
import { firestore, auth } from "@/lib/firebase";
import { Attendance, Student, StudentBatches } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";

type DailySummary = {
  date: string;
  totalPresent: number;
  batchBreakdown: Partial<Record<StudentBatches, number>>;
};

export function DailyAttendanceSummary() {
  const [summary, setSummary] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [stadiumId, setStadiumId] = useState<string | null>(null);
  const [activeBatches, setActiveBatches] = useState<StudentBatches[]>([]);

  useEffect(() => {
    const fetchCoachStadium = async (uid: string) => {
      const userDocRef = doc(firestore, "users", uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists() && userDocSnap.data().assignedStadiums?.[0]) {
        setStadiumId(userDocSnap.data().assignedStadiums[0]);
      } else {
        setLoading(false);
      }
    };

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchCoachStadium(user.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!stadiumId) return;

    setLoading(true);

    // Get active batches with students
    const studentsQuery = query(collection(firestore, `stadiums/${stadiumId}/students`));
    const unsubStudents = onSnapshot(studentsQuery, (snapshot) => {
        const studentData = snapshot.docs.map(doc => doc.data() as Student);
        const batches = [...new Set(studentData.map(s => s.batch))];
        setActiveBatches(batches as StudentBatches[]);
    });

    // Get attendance data
    const attendanceQuery = query(
      collection(firestore, `stadiums/${stadiumId}/attendance`),
      where("status", "==", "present"),
      orderBy("timestamp", "desc")
    );

    const unsubscribeAttendance = onSnapshot(attendanceQuery, (snapshot) => {
      const attendanceData = snapshot.docs.map((doc) => doc.data() as Attendance);

      const dailyData = attendanceData.reduce((acc, curr) => {
        if (!acc[curr.date]) {
          acc[curr.date] = {
            date: curr.date,
            totalPresent: 0,
            batchBreakdown: {},
          };
        }
        acc[curr.date].totalPresent += 1;
        if (!acc[curr.date].batchBreakdown[curr.batch]) {
          acc[curr.date].batchBreakdown[curr.batch] = 0;
        }
        acc[curr.date].batchBreakdown[curr.batch]! += 1;
        return acc;
      }, {} as Record<string, DailySummary>);
      
      const sortedSummary = Object.values(dailyData).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setSummary(sortedSummary);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching attendance summary: ", error);
        setLoading(false);
    });

    return () => {
        unsubStudents();
        unsubscribeAttendance();
    }
  }, [stadiumId]);

  const allBatches: StudentBatches[] = ["First Batch", "Second Batch", "Third Batch", "Fourth Batch"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Attendance Summary</CardTitle>
        <CardDescription>A breakdown of student attendance for each day.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead className="text-center">Total Present</TableHead>
              {allBatches.map(batch => activeBatches.includes(batch) && (
                <TableHead key={batch} className="text-center">{batch}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {summary.length > 0 ? (
                summary.map((day) => (
                    <TableRow key={day.date}>
                        <TableCell className="font-medium">{format(parseISO(day.date), 'PPP')}</TableCell>
                        <TableCell className="font-bold text-center">{day.totalPresent}</TableCell>
                        {allBatches.map(batch => activeBatches.includes(batch) && (
                            <TableCell key={batch} className="text-center">
                                {day.batchBreakdown[batch] || 0}
                            </TableCell>
                        ))}
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={2 + activeBatches.length} className="h-24 text-center">
                        No attendance has been recorded yet.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
        )}
      </CardContent>
    </Card>
  );
}
