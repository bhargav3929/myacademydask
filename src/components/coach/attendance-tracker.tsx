"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, doc, getDoc, setDoc, serverTimestamp, getDocs, limit } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { Student } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format, isToday } from "date-fns";
import { MotionDiv } from "../motion";

type AttendanceStatus = {
  [studentId: string]: 'present' | 'absent' | null;
};

export function AttendanceTracker() {
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const [stadiumName, setStadiumName] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceStatus>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData?.assignedStadiums || userData.assignedStadiums.length === 0) {
      setLoading(false);
      return;
    }
    const stadiumId = userData.assignedStadiums[0];

    // Fetch Stadium Name
    getDoc(doc(firestore, "stadiums", stadiumId)).then(stadiumDoc => {
      if (stadiumDoc.exists()) {
        setStadiumName(stadiumDoc.data().name);
      }
    });

    // Fetch Students for the stadium
    const studentsQuery = query(
      collection(firestore, "students"),
      where("stadiumId", "==", stadiumId)
    );
    const unsubscribeStudents = onSnapshot(studentsQuery, (snapshot) => {
      const studentsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Student[];
      setStudents(studentsData);
      setLoading(false);
    });

    // Fetch today's attendance
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const attendanceQuery = query(
        collection(firestore, "attendance"),
        where("stadiumId", "==", stadiumId),
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


    return () => {
        unsubscribeStudents();
        unsubscribeAttendance();
    }
  }, [userData]);

  const handleMarkAttendance = async (studentId: string, status: 'present' | 'absent') => {
    if (!user || !userData?.assignedStadiums || userData.assignedStadiums.length === 0) return;

    const todayStr = format(new Date(), "yyyy-MM-dd");
    const attendanceId = `${studentId}_${todayStr}`;
    const attendanceRef = doc(firestore, "attendance", attendanceId);

    // Optimistic update
    setAttendance(prev => ({ ...prev, [studentId]: status }));

    try {
      await setDoc(attendanceRef, {
        studentId,
        date: todayStr,
        status,
        markedByCoachId: user.uid,
        stadiumId: userData.assignedStadiums[0],
        organizationId: userData.organizationId,
        createdAt: serverTimestamp(),
      });
      toast({
        title: "Success",
        description: `Attendance marked as ${status}.`,
      });
    } catch (error) {
      // Revert optimistic update on error
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
  
  if (!userData?.assignedStadiums || userData.assignedStadiums.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>No Stadium Assigned</CardTitle>
            </CardHeader>
            <CardContent>
                <p>You are not assigned to any stadium. Please contact your organization owner.</p>
            </CardContent>
        </Card>
    )
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
