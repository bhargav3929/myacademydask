
"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, getCountFromServer } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { MotionDiv } from "@/components/motion";
import { StatCard } from "@/components/dashboard/stat-card";
import { AttendanceChart } from "@/components/dashboard/attendance-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { CoachAssignments } from "@/components/dashboard/coach-assignments";
import { RecentRegistrations } from "@/components/dashboard/recent-registrations";
import { subDays } from "date-fns";

const MOCK_ORGANIZATION_ID = "mock-org-id-for-testing"; // Replace with actual org ID from auth

export default function DashboardPage() {
  const [totalStudents, setTotalStudents] = useState(0);
  const [newStudents, setNewStudents] = useState(0);
  const [activeStadiums, setActiveStadiums] = useState(0);
  
  useEffect(() => {
    // Listener for total students
    const studentsQuery = query(collection(firestore, "students"));
    const studentsUnsubscribe = onSnapshot(studentsQuery, snapshot => setTotalStudents(snapshot.size));

    // Listener for new students (joined in the last 30 days)
    const thirtyDaysAgo = subDays(new Date(), 30);
    const newStudentsQuery = query(
      collection(firestore, "students"),
      where("joinDate", ">=", thirtyDaysAgo)
    );
    const newStudentsUnsubscribe = onSnapshot(newStudentsQuery, snapshot => setNewStudents(snapshot.size));

    // Listener for active stadiums
    const stadiumsQuery = query(collection(firestore, "stadiums"));
    const stadiumsUnsubscribe = onSnapshot(stadiumsQuery, snapshot => setActiveStadiums(snapshot.size));
    
    // Cleanup listeners on unmount
    return () => {
      studentsUnsubscribe();
      newStudentsUnsubscribe();
      stadiumsUnsubscribe();
    };

  }, []);

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
            Welcome, Academy Director! 👋
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
            value={totalStudents.toString()}
            icon="Users"
            trendValue=""
            trendPeriod=""
            primary
          />
        </MotionDiv>
        <MotionDiv variants={itemVariants}>
          <StatCard
            title="New Students Joined"
            value={newStudents.toString()}
            icon="UserPlus"
            trendValue=""
            trendPeriod="Last 30 days"
          />
        </MotionDiv>
        <MotionDiv variants={itemVariants}>
          <StatCard
            title="Active Stadiums"
            value={activeStadiums.toString()}
            icon="Building"
            trendValue=""
            trendPeriod=""
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
