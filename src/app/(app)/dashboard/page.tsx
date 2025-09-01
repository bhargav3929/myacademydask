
import { MotionDiv } from "@/components/motion";
import { StatCard } from "@/components/dashboard/stat-card";
import { AttendanceChart } from "@/components/dashboard/attendance-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { CoachAssignments } from "@/components/dashboard/coach-assignments";
import { RecentRegistrations } from "@/components/dashboard/recent-registrations";

export default function DashboardPage() {
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
      className="flex flex-col gap-6"
    >
      <MotionDiv variants={itemVariants}>
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight">
            Good Morning, Academy Director! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's a snapshot of your academy's performance.
          </p>
        </div>
      </MotionDiv>
      
      <MotionDiv
        variants={containerVariants}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <MotionDiv variants={itemVariants}>
          <StatCard
            title="Total Students"
            value="248"
            icon="Users"
            trendValue="+16.2%"
            trendPeriod="from last month"
            primary
          />
        </MotionDiv>
        <MotionDiv variants={itemVariants}>
          <StatCard
            title="Pending Applications"
            value="64"
            icon="ClipboardList"
            trendValue="-12.4%"
            trendPeriod="from last week"
            trendColor="text-destructive"
          />
        </MotionDiv>
        <MotionDiv variants={itemVariants}>
          <StatCard
            title="Active Stadiums"
            value="32"
            icon="Building"
            trendValue="+2"
            trendPeriod="this quarter"
          />
        </MotionDiv>
      </MotionDiv>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <MotionDiv variants={itemVariants} className="lg:col-span-3">
            <AttendanceChart />
        </MotionDiv>
        <div className="lg:col-span-2 space-y-6">
            <MotionDiv variants={itemVariants}>
                <RecentActivity />
            </MotionDiv>
            <MotionDiv variants={itemVariants}>
                <CoachAssignments />
            </MotionDiv>
        </div>
      </div>

       <MotionDiv variants={itemVariants}>
          <RecentRegistrations />
        </MotionDiv>
    </MotionDiv>
  );
}
