
import { StudentsClient } from "@/components/students/students-client";
import { MotionDiv } from "@/components/motion";

export default function StudentsPage() {
  return (
     <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
       <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Student Roster</h2>
          <p className="text-muted-foreground">
            A complete list of all students across all stadiums.
          </p>
        </div>
      </div>
      <StudentsClient />
    </MotionDiv>
  );
}
