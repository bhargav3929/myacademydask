
"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Student } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { MotionDiv } from "../motion";

type AttendanceStatus = {
  [studentId: string]: 'present' | 'absent' | null;
};

// MOCK DATA
const MOCK_STADIUM_ID = "mock-stadium-id";
const MOCK_COACH_ID = "mock-coach-id";
const MOCK_ORGANIZATION_ID = "mock-org-id-for-testing";

const MOCK_STUDENTS: Student[] = [
    { id: 'student-1', fullName: 'Alice', joinDate: new Date(), stadiumId: MOCK_STADIUM_ID, organizationId: MOCK_ORGANIZATION_ID, createdAt: new Date() },
    { id: 'student-2', fullName: 'Bob', joinDate: new Date(), stadiumId: MOCK_STADIUM_ID, organizationId: MOCK_ORGANIZATION_ID, createdAt: new Date() },
    { id: 'student-3', fullName: 'Charlie', joinDate: new Date(), stadiumId: MOCK_STADIUM_ID, organizationId: MOCK_ORGANIZATION_ID, createdAt: new Date() },
];


export function AttendanceTracker() {
  const { toast } = useToast();
  const [stadiumName, setStadiumName] = useState("Mock Stadium");
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceStatus>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Using Mock data
    setLoading(true);
    setTimeout(() => {
        setStudents(MOCK_STUDENTS);
        
        const todayStr = format(new Date(), "yyyy-MM-dd");
        const attendanceQuery = query(
            collection(firestore, "attendance"),
            where("stadiumId", "==", MOCK_STADIUM_ID),
            where("date", "==", todayStr)
        );

        const unsubscribeAttendance = onSnapshot(attendanceQuery, (snapshot) => {
            const todayAttendance: AttendanceStatus = {};
            snapshot.forEach(d => {
                const data = d.data();
                todayAttendance[data.studentId] = data.status;
            });
            setAttendance(todayAttendance);
        });
        
        setLoading(false);
        return () => unsubscribeAttendance();
    }, 1000);

  }, []);

  const handleMarkAttendance = async (studentId: string, status: 'present' | 'absent') => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const attendanceId = `${studentId}_${todayStr}`;
    const attendanceRef = doc(firestore, "attendance", attendanceId);

    setAttendance(prev => ({ ...prev, [studentId]: status }));

    try {
      await setDoc(attendanceRef, {
        studentId,
        date: todayStr,
        status,
        markedByCoachId: MOCK_COACH_ID,
        stadiumId: MOCK_STADIUM_ID,
        organizationId: MOCK_ORGANIZATION_ID,
        createdAt: serverTimestamp(),
      });
      toast({
        title: "Success",
        description: `Attendance marked as ${status}.`,
      });
    } catch (error) {
      setAttendance(prev => ({ ...prev, [studentId]: null }));
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not mark attendance.",
      });
    }
  };

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
          <CardDescription>
            Mark attendance for today, {format(new Date(), 'PPP')}, at {stadiumName}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {students.length > 0 ? students.map(student => (
              <div key={student.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                    <Avatar>
                        <AvatarFallback>{student.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className="font-medium">{student.fullName}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={attendance[student.id] === 'present' ? 'default' : 'outline'}
                    onClick={() => handleMarkAttendance(student.id, 'present')}
                    disabled={attendance[student.id] === 'present'}
                  >
                    Present
                  </Button>
                  <Button
                    size="sm"
                    variant={attendance[student.id] === 'absent' ? 'destructive' : 'outline'}
                    onClick={() => handleMarkAttendance(student.id, 'absent')}
                    disabled={attendance[student.id] === 'absent'}
                  >
                    Absent
                  </Button>
                </div>
              </div>
            )) : <p className="text-muted-foreground text-center">No students found in this stadium.</p>}
          </div>
        </CardContent>
      </Card>
    </MotionDiv>
  );
}
