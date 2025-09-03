
import { MotionDiv } from "@/components/motion";
import { ReportsClient } from "@/components/reports/reports-client";

export default function ReportsPage() {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
       <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Attendance Reports</h2>
          <p className="text-muted-foreground">
            Generate and view attendance reports for your stadiums.
          </p>
        </div>
      </div>
      <ReportsClient />
    </MotionDiv>
  );
}
