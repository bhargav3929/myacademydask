import { BarChart2, Users, Building, CalendarCheck } from "lucide-react";
import { MotionDiv } from "@/components/motion";
import { StatCard } from "@/components/dashboard/stat-card";
import { AttendanceChart } from "@/components/dashboard/attendance-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export default function DashboardPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
      <MotionDiv
        variants={itemVariants}
        className="flex items-center justify-between space-y-2"
      >
        <h2 className="text-3xl font-semibold tracking-tight">Dashboard</h2>
      </MotionDiv>
      
      <MotionDiv
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <MotionDiv variants={itemVariants}>
          <StatCard
            title="Total Students"
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
            collectionName="students"
          />
        </MotionDiv>
        <MotionDiv variants={itemVariants}>
          <StatCard
            title="Active Stadiums"
            icon={<Building className="h-4 w-4 text-muted-foreground" />}
            collectionName="stadiums"
          />
        </MotionDiv>
        <MotionDiv variants={itemVariants}>
          <StatCard
            title="Coaches"
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
            collectionName="users"
            role="coach"
          />
        </MotionDiv>
        <MotionDiv variants={itemVariants}>
           <StatCard
            title="Attendance Today"
            icon={<CalendarCheck className="h-4 w-4 text-muted-foreground" />}
            collectionName="attendance"
            today
           />
        </MotionDiv>
      </MotionDiv>

      <MotionDiv
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-7"
      >
        <MotionDiv variants={itemVariants} className="lg:col-span-4">
          <AttendanceChart />
        </MotionDiv>
        <MotionDiv variants={itemVariants} className="lg:col-span-3">
          <RecentActivity />
        </MotionDiv>
      </MotionDiv>
    </div>
  );
}
