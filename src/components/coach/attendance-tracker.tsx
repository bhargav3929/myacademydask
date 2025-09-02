
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
import { motion, AnimatePresence } from "framer-motion";

type AttendanceStatus = {
  [studentId: string]: 'present' | 'absent' | null;
};

// These should be replaced with the actual authenticated coach's details
const MOCK_STADIUM_ID = "mock-stadium-id"; // This needs to be dynamically determined
const MOCK_COACH_ID = "mock-coach-id";
const MOCK_ORGANIZATION_ID = "mock-org-id-for-testing";

export function AttendanceTracker() {
  const { toast } = useToast();
  const [stadiumName, setStadiumName] = useState("Your Assigned Stadium");
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceStatus>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would get the logged-in coach's assigned stadium ID
    if (!MOCK_STADIUM_ID) return;

    const q = query(collection(firestore, `stadiums/${MOCK_STADIUM_ID}/students`));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const studentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[];
        setStudents(studentsData);

        if (MOCK_STADIUM_ID) {
            getDoc(doc(firestore, "stadiums", MOCK_STADIUM_ID)).then(stadiumDoc => {
                if(stadiumDoc.exists()) {
                    setStadiumName(stadiumDoc.data().name);
                }
            });
        }
        setLoading(false);
    }, (error) => {
        console.error("Error fetching students: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not fetch student data.",
        });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const handleMarkAttendance = async (studentId: string, status: 'present' | 'absent') => {
    if (!MOCK_STADIUM_ID) return;

    const todayStr = format(new Date(), "yyyy-MM-dd");
    const attendanceDocId = `${studentId}_${todayStr}`;
    const attendanceRef = doc(firestore, `stadiums/${MOCK_STADIUM_ID}/attendance`, attendanceDocId);

    const originalStatus = attendance[studentId];
    setAttendance(prev => ({ ...prev, [studentId]: status }));

    try {
      await setDoc(attendanceRef, {
        studentId,
        date: todayStr,
        status,
        markedByCoachId: MOCK_COACH_ID,
        organizationId: MOCK_ORGANIZATION_ID,
        timestamp: serverTimestamp(),
      }, { merge: true }); // Use merge to update if entry for today already exists
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
        <CardHeader>
          <CardTitle>Mark Today's Attendance</CardTitle>
          <CardDescription>
            For {stadiumName} on {format(new Date(), 'PPP')}.
          </CardDescription>
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
