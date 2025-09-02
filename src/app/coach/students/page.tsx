
import { StudentManagement } from "@/components/coach/student-management";
import { MotionDiv } from "@/components/motion";

export default function CoachStudentsPage() {
    return (
        <MotionDiv 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Student Management</h2>
                    <p className="text-muted-foreground">
                        View, edit, and manage all students in your stadium.
                    </p>
                </div>
            </div>
            <StudentManagement />
        </MotionDiv>
    )
}
