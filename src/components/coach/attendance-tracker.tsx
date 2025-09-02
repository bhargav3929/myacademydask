
"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { firestore, auth } from "@/lib/firebase";
import { Student } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { AddStudentDialog } from "../students/student-form-dialog";

type AttendanceStatus = {
  [studentId: string]: 'present' | 'absent' | null;
};

export function AttendanceTracker() {
  const { toast } = useToast();
  const [stadiumId, setStadiumId] = useState<string | null>(null);
  const [stadiumName, setStadiumName] = useState("Your Assigned Stadium");
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceStatus>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoachData = async (uid: string) => {
        const userDocRef = doc(firestore, "users", uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists() && userDocSnap.data().assignedStadiums?.[0]) {
            const assignedStadiumId = userDocSnap.data().assignedStadiums[0];
            setStadiumId(assignedStadiumId);
        } else {
            setLoading(false);
        }
    };

    const unsubscribeAuth = auth.onAuthStateChanged(user => {
        if (user) {
            fetchCoachData(user.uid);
        } else {
            setLoading(false);
        }
    });
    
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!stadiumId) return;

    // Fetch stadium details
    const stadiumDocRef = doc(firestore, "stadiums", stadiumId);
    const unsubscribeStadium = onSnapshot(stadiumDocRef, (stadiumDoc) => {
        if (stadiumDoc.exists()) {
            setStadiumName(stadiumDoc.data().name);
        }
    });

    // Fetch students for the stadium
    const q = query(collection(firestore, `stadiums/${stadiumId}/students`));
    const unsubscribeStudents = onSnapshot(q, (snapshot) => {
        const studentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[];
        setStudents(studentsData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching students: ", error);
        toast({ variant: "destructive", title: "Error", description: "Could not fetch student data." });
        setLoading(false);
    });

    return () => {
        unsubscribeStadium();
        unsubscribeStudents();
    };
  }, [stadiumId, toast]);

  const handleMarkAttendance = async (studentId: string, status: 'present' | 'absent') => {
    if (!stadiumId || !auth.currentUser) return;

    const todayStr = format(new Date(), "yyyy-MM-dd");
    const attendanceDocId = `${studentId}_${todayStr}`;
    const attendanceRef = doc(firestore, `stadiums/${stadiumId}/attendance`, attendanceDocId);

    const originalStatus = attendance[studentId];
    setAttendance(prev => ({ ...prev, [studentId]: status }));

    try {
      await setDoc(attendanceRef, {
        studentId,
        date: todayStr,
        status,
        markedByCoachId: auth.currentUser.uid,
        organizationId: (await getDoc(doc(firestore, "stadiums", stadiumId))).data()?.organizationId,
        timestamp: serverTimestamp(),
      }, { merge: true });
      toast({
        title: "Success",
        description: `Marked ${students.find(s=>s.id===studentId)?.fullName} as ${status}.`,
      });
    } catch (error) {
      setAttendance(prev => ({ ...prev, [studentId]: originalStatus }));
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not mark attendance.",
      });
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        type: 'spring',
        stiffness: 100,
      },
    }),
  };

  if (loading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </CardContent>
        </Card>
    );
  }

  return (
      <Card>
        <CardHeader className="flex flex-row justify-between items-start">
            <div>
              <CardTitle>Mark Today's Attendance</CardTitle>
              <CardDescription>
                For {stadiumName} on {format(new Date(), 'PPP')}.
              </CardDescription>
            </div>
             <AddStudentDialog stadiums={stadiumId ? [{id: stadiumId, name: stadiumName} as any] : []} />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <AnimatePresence>
                {students.length > 0 ? students.map((student, i) => (
                <motion.div 
                    key={student.id} 
                    layout
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    custom={i}
                    className="flex items-center justify-between rounded-lg border bg-background p-3"
                >
                    <div className="flex items-center gap-4">
                        <Avatar className="size-9">
                            <AvatarFallback>{student.fullName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="font-medium">{student.fullName}</p>
                    </div>
                    <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant={attendance[student.id] === 'present' ? 'default' : 'outline'}
                        onClick={() => handleMarkAttendance(student.id, 'present')}
                        className={attendance[student.id] === 'present' ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                        Present
                    </Button>
                    <Button
                        size="sm"
                        variant={attendance[student.id] === 'absent' ? 'destructive' : 'outline'}
                        onClick={() => handleMarkAttendance(student.id, 'absent')}
                    >
                        Absent
                    </Button>
                    </div>
                </motion.div>
                )) : 
                <div className="text-center py-12 text-muted-foreground">
                    <p>No students assigned to you in this stadium.</p>
                    <p className="text-sm">Use the "New Student" button to add students.</p>
                </div>
                }
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
  );
}
