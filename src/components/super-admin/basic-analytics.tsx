
"use client";

import { useEffect, useState } from "react";
import { collection, getCountFromServer, collectionGroup } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Building, School } from "lucide-react";
import { StatCard } from "../dashboard/stat-card";
import { MotionDiv } from "../motion";

export function BasicAnalytics() {
  const [stats, setStats] = useState({
    totalOwners: 0,
    totalStadiums: 0,
    totalStudents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const ownersCol = collection(firestore, "stadium_owners");
        const stadiumsCol = collection(firestore, "stadiums");
        const studentsColGroup = collectionGroup(firestore, "students");

        const [ownersSnapshot, stadiumsSnapshot, studentsSnapshot] = await Promise.all([
          getCountFromServer(ownersCol),
          getCountFromServer(stadiumsCol),
          getCountFromServer(studentsColGroup).catch(error => {
             if (error instanceof Error && error.message.includes("requires a COLLECTION_GROUP_DESC index")) {
                console.warn("Firestore index for 'students' collection group is missing. Student count will default to 0. Please create the index in Firebase Console for an accurate count.");
                return { data: () => ({ count: 0 }) };
            }
            throw error;
          }),
        ]);

        setStats({
          totalOwners: ownersSnapshot.data().count,
          totalStadiums: stadiumsSnapshot.data().count,
          totalStudents: studentsSnapshot.data().count,
        });

      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const analyticsCards = [
    {
        title: "Total Stadium Owners",
        value: stats.totalOwners.toString(),
        icon: "Users" as const,
        trendPeriod: "Total customer accounts managed.",
        loading: loading
    },
    {
        title: "Total Stadiums",
        value: stats.totalStadiums.toString(),
        icon: "Building" as const,
        trendPeriod: "Across all owner accounts.",
        loading: loading
    },
    {
        title: "Total Students",
        value: stats.totalStudents.toString(),
        icon: "UserPlus" as const,
        trendPeriod: "Across all stadiums globally.",
        loading: loading
    },
  ]

  return (
     <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
        className="grid gap-6 md:grid-cols-3"
      >
        {analyticsCards.map((card, index) => (
            <MotionDiv key={index} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                 <StatCard 
                    title={card.title}
                    value={card.loading ? "..." : card.value}
                    icon={card.icon}
                    trendPeriod={card.trendPeriod}
                />
            </MotionDiv>
        ))}
     </MotionDiv>
  );
}
