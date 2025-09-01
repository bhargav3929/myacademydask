import { AttendanceTracker } from "@/components/coach/attendance-tracker";

export default function CoachDashboardPage() {
    return (
        <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                <h2 className="text-3xl font-semibold tracking-tight">Coach Dashboard</h2>
                <p className="text-muted-foreground">
                    Manage student attendance for your assigned stadium.
                </p>
                </div>
            </div>
            <AttendanceTracker />
        </div>
    )
}
