
import { StadiumOwnerManager } from "@/components/super-admin/stadium-owner-manager";
import { MotionDiv } from "@/components/motion";
import { BasicAnalytics } from "@/components/super-admin/basic-analytics";

export default function SuperAdminDashboardPage() {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome to the SaaS Control Panel for CourtCommand.
          </p>
        </div>
      </div>
      
      {/* <BasicAnalytics /> */}

      <StadiumOwnerManager />

    </MotionDiv>
  );
}
