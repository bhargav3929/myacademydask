
"use client";
import { AttendanceTracker } from "@/components/coach/attendance-tracker";
import { AddStudentDialog } from "@/components/students/student-form-dialog";
import { MotionDiv } from "@/components/motion";
import { useEffect, useState } from "react";
import { Stadium } from "@/lib/types";
import { collection, onSnapshot, query } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

export default function CoachDashboardPage() {
    const [stadiums, setStadiums] = useState<Stadium[]>([]);

    useEffect(() => {
        const stadiumsQuery = query(collection(firestore, "stadiums"));
        const unsubscribe = onSnapshot(stadiumsQuery, (snapshot) => {
            const stadiumsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Stadium));
            setStadiums(stadiumsData);
        });
        return () => unsubscribe();
    }, []);

    return (
        <MotionDiv 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Coach Dashboard</h2>
                    <p className="text-muted-foreground">
                        Manage student attendance for your assigned stadium.
                    </p>
                </div>
                <AddStudentDialog stadiums={stadiums} />
            </div>
            <AttendanceTracker />
        </MotionDiv>
    )
}
