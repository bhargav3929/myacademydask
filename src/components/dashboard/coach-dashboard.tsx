
"use client";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";
import { AttendanceTracker } from "@/components/coach/attendance-tracker";
import { StudentManagement } from "@/components/coach/student-management";
import { MotionDiv } from "@/components/motion";
import { AnimatedText } from "@/components/ui/animated-underline-text-one";
import { Skeleton } from "@/components/ui/skeleton";
import { UserProfile } from "@/lib/types";

export function CoachDashboard() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [stadiumName, setStadiumName] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (currentUser) {
                const userDocRef = doc(firestore, "users", currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = { id: userDocSnap.id, ...userDocSnap.data() } as UserProfile;
                    setUser(userData);

                    if (userData.assignedStadiums && userData.assignedStadiums.length > 0) {
                        const stadiumId = userData.assignedStadiums[0];
                        const stadiumDocRef = doc(firestore, "stadiums", stadiumId);
                        const stadiumDocSnap = await getDoc(stadiumDocRef);
                        if (stadiumDocSnap.exists()) {
                            setStadiumName(stadiumDocSnap.data().name);
                        }
                    }
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

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
                    {stadiumName 
                        ? `You are responsible for managing the ${stadiumName} stadium.`
                        : "Manage student attendance and enrollment for your assigned stadium."
                    }
                </p>
            </MotionDiv>

            <MotionDiv variants={itemVariants}>
                <AttendanceTracker />
            </MotionDiv>

            <MotionDiv variants={itemVariants}>
                <StudentManagement />
            </MotionDiv>

        </MotionDiv>
    )
}
