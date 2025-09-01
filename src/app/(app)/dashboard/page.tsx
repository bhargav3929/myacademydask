
import { TrendingUp, UserPlus, Users, Building, Activity, CalendarCheck } from "lucide-react";
import { MotionDiv } from "@/components/motion";
import { StatCard } from "@/components/dashboard/stat-card";
import { AttendanceChart } from "@/components/dashboard/attendance-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";

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
    <div className="flex-1 space-y-8 bg-background p-4 md:p-8 pt-6">
      <MotionDiv
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-8"
      >
        <MotionDiv variants={itemVariants}>
            <div className="space-y-1.5">
                <h1 className="text-3xl font-bold tracking-tight">
                    Welcome Back, Owner!
                </h1>
                <p className="text-muted-foreground">
                    Here's a bird's-eye view of your academy's performance.
                </p>
            </div>
        </MotionDiv>
        
        <MotionDiv
            variants={containerVariants}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
            <MotionDiv variants={itemVariants}>
            <StatCard
                title="Total Students"
                value="73"
                icon={<Users className="size-5 text-blue-500" />}
                trendValue="+12.5%"
                trendIcon={<TrendingUp className="size-4 text-emerald-500" />}
                trendColor="text-emerald-500"
                collectionName="students"
            />
            </MotionDiv>
            <MotionDiv variants={itemVariants}>
            <StatCard
                title="Active Stadiums"
                value="4"
                icon={<Building className="size-5 text-orange-500" />}
                trendValue="+2"
                trendIcon={<UserPlus className="size-4 text-emerald-500" />}
                trendColor="text-emerald-500"
                trendPeriod="this month"
                collectionName="stadiums"
            />
            </MotionDiv>
            <MotionDiv variants={itemVariants}>
            <StatCard
                title="Total Coaches"
                value="8"
                icon={<Users className="size-5 text-purple-500" />}
                trendValue="+1"
                trendIcon={<UserPlus className="size-4 text-emerald-500" />}
                trendColor="text-emerald-500"
                trendPeriod="this month"
                collectionName="users"
                role="coach"
            />
            </MotionDiv>
            <MotionDiv variants={itemVariants}>
            <StatCard
                title="Attendance Today"
                value="92%"
                icon={<CalendarCheck className="size-5 text-green-500" />}
                trendValue="-3%"
                trendIcon={<TrendingUp className="size-4 text-red-500 rotate-180" />}
                trendColor="text-red-500"
                trendPeriod="vs yesterday"
                collectionName="attendance"
                today
            />
            </MotionDiv>
        </MotionDiv>

        <MotionDiv
            variants={containerVariants}
            className="grid grid-cols-1 gap-6 lg:grid-cols-5"
        >
            <MotionDiv variants={itemVariants} className="lg:col-span-3">
            <AttendanceChart />
            </MotionDiv>
            <MotionDiv variants={itemVariants} className="lg:col-span-2">
            <RecentActivity />
            </MotionDiv>
        </MotionDiv>
      </MotionDiv>
    </div>
  );
}
