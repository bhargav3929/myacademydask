
"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, getCountFromServer, limit, orderBy, doc, getDoc, collectionGroup } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { MotionDiv } from "@/components/motion";
import { StatCard } from "@/components/dashboard/stat-card";
import { AttendanceChart } from "@/components/dashboard/attendance-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { CoachAssignments } from "@/components/dashboard/coach-assignments";
import { RecentRegistrations } from "@/components/dashboard/recent-registrations";
import { subDays } from "date-fns";
import { Student } from "@/lib/types";
import { AnimatedText } from "@/components/ui/animated-underline-text-one";
import { Skeleton } from "@/components/ui/skeleton";

const MOCK_ORGANIZATION_ID = "mock-org-id-for-testing"; // Replace with actual org ID from auth
const MOCK_USER_ID = "mock-owner-id"; // For fetching director's name

export default function DashboardPage() {
  const [totalStudents, setTotalStudents] = useState(0);
  const [newStudents, setNewStudents] = useState(0);
  const [activeStadiums, setActiveStadiums] = useState(0);
  const [recentRegistrations, setRecentRegistrations] = useState<Student[]>([]);
  const [directorName, setDirectorName] = useState("");
  const [isLoadingName, setIsLoadingName] = useState(true);
  
  useEffect(() => {
    // Listener for total students across all stadiums
    const studentsQuery = query(collectionGroup(firestore, "students"));
    const studentsUnsubscribe = onSnapshot(studentsQuery, snapshot => setTotalStudents(snapshot.size));

    // Listener for new students (joined in the last 30 days)
    const thirtyDaysAgo = subDays(new Date(), 30);
    const newStudentsQuery = query(
      collectionGroup(firestore, "students"),
      where("joinDate", ">=", thirtyDaysAgo)
    );
    const newStudentsUnsubscribe = onSnapshot(newStudentsQuery, snapshot => setNewStudents(snapshot.size));

    // Listener for active stadiums
    const stadiumsQuery = query(collection(firestore, "stadiums"));
    const stadiumsUnsubscribe = onSnapshot(stadiumsQuery, snapshot => setActiveStadiums(snapshot.size));
    
     // Listener for recent registrations (last 5)
    const recentRegQuery = query(
        collectionGroup(firestore, "students"),
        limit(5)
    );
    const recentRegUnsubscribe = onSnapshot(recentRegQuery, snapshot => {
        const registrations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
        setRecentRegistrations(registrations);
    });

    // Fetch director's name
    const fetchDirectorName = async () => {
        setIsLoadingName(true);
        try {
            const userDocRef = doc(firestore, "users", MOCK_USER_ID);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                setDirectorName(userDocSnap.data().fullName || "Academy Director");
            } else {
                setDirectorName("Academy Director");
            }
        } catch (error) {
            console.error("Failed to fetch director's name:", error);
            setDirectorName("Academy Director");
        } finally {
            setIsLoadingName(false);
        }
    };
    
    fetchDirectorName();
    
    // Cleanup listeners on unmount
    return () => {
      studentsUnsubscribe();
      newStudentsUnsubscribe();
      stadiumsUnsubscribe();
      recentRegUnsubscribe();
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
      className="flex flex-col gap-8"
    >
      <MotionDiv variants={itemVariants}>
        <div className="space-y-0.5">
          <div className="flex items-center gap-3">
             <h1 className="text-2xl font-bold tracking-tight">
                Welcome Back,
             </h1>
             {isLoadingName ? (
                <Skeleton className="h-8 w-48" />
             ) : (
                <AnimatedText 
                    text={`${directorName}! 👋`} 
                    textClassName="text-2xl font-bold tracking-tight text-primary"
                    underlineClassName="text-primary/50"
                />
             )}
          </div>
          <p className="text-muted-foreground">
            Here's a snapshot of your academy's performance and recent activities.
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
            trendPeriod="Across all stadiums"
            primary
          />
        </MotionDiv>
        <MotionDiv variants={itemVariants}>
          <StatCard
            title="New Students Joined"
            value={newStudents.toString()}
            icon="UserPlus"
            trendPeriod="Last 30 days"
          />
        </MotionDiv>
        <MotionDiv variants={itemVariants}>
          <StatCard
            title="Active Stadiums"
            value={activeStadiums.toString()}
            icon="Building"
            trendPeriod="Ready for action"
          />
        </MotionDiv>
      </MotionDiv>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <MotionDiv variants={itemVariants} className="lg:col-span-3">
            <AttendanceChart />
        </MotionDiv>
        <div className="lg:col-span-2 space-y-8">
            <MotionDiv variants={itemVariants}>
                <RecentActivity />
            </MotionDiv>
            <MotionDiv variants={itemVariants}>
                <CoachAssignments />
            </MotionDiv>
        </div>
      </div>

       <MotionDiv variants={itemVariants}>
          <RecentRegistrations data={recentRegistrations} />
        </MotionDiv>
    </MotionDiv>
  );
}
