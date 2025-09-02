
"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { firestore, auth } from "@/lib/firebase";
import { Student, Stadium } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { AddStudentDialog } from "../students/student-form-dialog";
import { TakeAttendanceDialog } from "./take-attendance-dialog";
import { AnimatePresence } from "framer-motion";
import { MotionDiv } from "../motion";
import { Users, CalendarCheck } from "lucide-react";


export function AttendanceTracker() {
  const [stadium, setStadium] = useState<Stadium | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoachData = async (uid: string) => {
        const userDocRef = doc(firestore, "users", uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists() && userDocSnap.data().assignedStadiums?.[0]) {
            const assignedStadiumId = userDocSnap.data().assignedStadiums[0];
            const stadiumDocRef = doc(firestore, "stadiums", assignedStadiumId);
            const stadiumDocSnap = await getDoc(stadiumDocRef);
            if (stadiumDocSnap.exists()) {
                setStadium({ id: stadiumDocSnap.id, ...stadiumDocSnap.data() } as Stadium);
            } else {
                 setLoading(false);
            }
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
    if (!stadium) return;

    const q = query(collection(firestore, `stadiums/${stadium.id}/students`));
    const unsubscribeStudents = onSnapshot(q, (snapshot) => {
        const studentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[];
        setStudents(studentsData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching students: ", error);
        setLoading(false);
    });

    return () => {
        unsubscribeStudents();
    };
  }, [stadium]);
  

  if (loading) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
    );
  }

  if (!stadium) {
      return (
          <Card>
              <CardHeader>
                  <CardTitle>No Stadium Assigned</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-muted-foreground">You have not been assigned to a stadium yet. Please contact your administrator.</p>
              </CardContent>
          </Card>
      )
  }

  return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MotionDiv initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <Card className="h-full flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-primary/5 via-background to-background border-primary/20 hover:border-primary/40 transition-all duration-300">
                <div className="p-4 bg-primary/10 rounded-full mb-4 border border-primary/20">
                    <Users className="size-8 text-primary" />
                </div>
                <CardTitle className="text-xl mb-2">Enroll a New Student</CardTitle>
                <CardDescription className="mb-6 max-w-xs">Add a new participant to your stadium roster and assign them to a batch.</CardDescription>
                <AddStudentDialog stadiums={stadium ? [stadium] : []} />
            </Card>
        </MotionDiv>
        <MotionDiv initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
             <Card className="h-full flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-secondary/20 via-background to-background border-border hover:border-foreground/20 transition-all duration-300">
                <div className="p-4 bg-secondary rounded-full mb-4 border">
                    <CalendarCheck className="size-8 text-secondary-foreground" />
                </div>
                <CardTitle className="text-xl mb-2">Track Daily Attendance</CardTitle>
                <CardDescription className="mb-6 max-w-xs">Select a date and batch to mark attendance for your students.</CardDescription>
                <TakeAttendanceDialog stadium={stadium} allStudents={students} />
            </Card>
        </MotionDiv>
      </div>
  );
}
