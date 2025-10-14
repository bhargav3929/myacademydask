
"use client";

import { useEffect, useState, useCallback } from "react";
import { doc, getDoc, collection, query, onSnapshot, Unsubscribe } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";
import { AttendanceTracker } from "@/components/coach/attendance-tracker";
import { StudentManagement } from "@/components/coach/student-management";
import { MotionDiv } from "@/components/motion";
import { AnimatedText } from "@/components/ui/animated-underline-text-one";
import { Skeleton } from "@/components/ui/skeleton";
import { UserProfile, Stadium, Student } from "@/lib/types";

export function CoachDashboard() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [stadium, setStadium] = useState<Stadium | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStudents = useCallback((stadiumId: string): Unsubscribe => {
        const studentsCollectionRef = collection(
          firestore,
          `stadiums/${stadiumId}/students`
        );
        return onSnapshot(studentsCollectionRef, (querySnapshot) => {
            const studentsList = querySnapshot.docs.map(
              (doc) => ({ id: doc.id, ...doc.data() } as Student)
            );
            setStudents(studentsList);
        }, (error) => {
            console.error("Error fetching students in real-time:", error);
        });
    }, []);


    useEffect(() => {
        let studentsUnsubscribe: Unsubscribe | null = null;

        const unsubscribeAuth = auth.onAuthStateChanged(async (currentUser) => {
            setLoading(true);
            if (currentUser) {
                const userDocRef = doc(firestore, "users", currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const data = userDocSnap.data();
                    const userData = { 
                      id: userDocSnap.id, 
                      uid: userDocSnap.id, 
                      ...data 
                    } as UserProfile;
                    setUser(userData);

                    const stadiumId = userData.assignedStadiums?.[0];
                    if (stadiumId) {
                        const stadiumDocRef = doc(firestore, "stadiums", stadiumId);
                        const stadiumDocSnap = await getDoc(stadiumDocRef);

                        if (stadiumDocSnap.exists()) {
                            const stadiumData = { id: stadiumDocSnap.id, ...stadiumDocSnap.data() } as Stadium;
                            setStadium(stadiumData);
                            
                            if (studentsUnsubscribe) {
                                studentsUnsubscribe();
                            }
                            studentsUnsubscribe = fetchStudents(stadiumId);

                        }
                    }
                } else {
                     setUser(null);
                }
            } else {
                setUser(null);
                setStadium(null);
                setStudents([]);
            }
            setLoading(false);
        });

        return () => {
            unsubscribeAuth();
            if (studentsUnsubscribe) {
                studentsUnsubscribe();
            }
        };
    }, [fetchStudents]);

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
            },
        },
    };

    const handleRefreshStudents = useCallback(() => {
        if (stadium) {
           const unsubscribe = fetchStudents(stadium.id);
           // Immediately unsubscribe to just fetch once.
           unsubscribe();
        }
    }, [stadium, fetchStudents]);
    
    const allStadiums = stadium ? [stadium] : [];

    return (
        <MotionDiv
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 pt-16 md:pt-20"
        >
            <MotionDiv variants={itemVariants}>
                 <div className="flex items-center gap-2">
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight flex-shrink-0">
                        Welcome Back,
                    </h1>
                    {loading || !user ? (
                        <Skeleton className="h-8 w-48" />
                    ) : (
                        <AnimatedText
                            text={`${user.fullName}! 👋`}
                            textClassName="text-xl md:text-2xl font-bold tracking-tight text-primary"
                            underlineClassName="text-primary/50"
                        />
                    )}
                </div>
                <p className="text-muted-foreground mt-1">
                    {stadium
                        ? `You are responsible for managing the ${stadium.name} stadium.`
                        : loading ? "Loading your stadium details..." : "Manage student attendance and enrollment for your assigned stadium."
                    }
                </p>
            </MotionDiv>

            <MotionDiv variants={itemVariants}>
                <AttendanceTracker />
            </MotionDiv>

            <MotionDiv variants={itemVariants}>
                <StudentManagement
                    students={students}
                    stadiumId={stadium?.id}
                    allStadiums={allStadiums}
                    coachId={user?.id}
                    refreshStudents={handleRefreshStudents}
                    loading={loading}
                />
            </MotionDiv>

        </MotionDiv>
    )
}

