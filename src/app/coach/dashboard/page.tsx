
"use client";
import { AttendanceTracker } from "@/components/coach/attendance-tracker";
import { DailyAttendanceSummary } from "@/components/coach/daily-attendance-summary";
import { MotionDiv } from "@/components/motion";

export default function CoachDashboardPage() {
    return (
        <MotionDiv 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Coach Dashboard</h2>
                    <p className="text-muted-foreground">
                        Manage student attendance and enrollment for your assigned stadium.
                    </p>
                </div>
            </div>
            <AttendanceTracker />
            <DailyAttendanceSummary />
        </MotionDiv>
    )
}
