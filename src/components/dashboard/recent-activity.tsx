
"use client";

import { type ReactNode, useEffect, useState } from "react";
import { collection, query, orderBy, limit, doc, getDoc, getDocs, collectionGroup, where, Timestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, UserPlus } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Student, Stadium, AttendanceSubmission, UserProfile } from "@/lib/types";

type ActivityType = 'attendance_submission' | 'new_student';

type Activity = {
  id: string;
  title: string;
  description: string;
  type: ActivityType;
  timestamp: Date;
};

const gradientBackgrounds = [
  "from-[#4D6CFF] via-[#5A77FF] to-[#6D8BFF]",
  "from-[#10B981] via-[#16C2A6] to-[#38BDF8]",
  "from-[#F97316] via-[#FB923C] to-[#F59E0B]",
  "from-[#8B5CF6] via-[#A855F7] to-[#EC4899]",
  "from-[#6366F1] via-[#818CF8] to-[#22D3EE]",
];

const activityIcons: Record<ActivityType, ReactNode> = {
  attendance_submission: <CalendarCheck className="size-4" />,
  new_student: <UserPlus className="size-4" />,
};

export function RecentActivity({ organizationId }: { organizationId: string | null }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!organizationId) {
        setLoading(false);
        return;
    };

    const fetchActivities = async () => {
      setLoading(true);
      try {
        const stadiumsCache = new Map<string, Stadium>();
        const getStadium = async (stadiumId: string): Promise<Stadium | null> => {
          if (stadiumsCache.has(stadiumId)) {
            return stadiumsCache.get(stadiumId)!;
          }
          const stadiumDocRef = doc(firestore, "stadiums", stadiumId);
          const stadiumDoc = await getDoc(stadiumDocRef);
          if (stadiumDoc.exists()) {
            const stadiumData = { id: stadiumId, ...stadiumDoc.data() } as Stadium;
            stadiumsCache.set(stadiumId, stadiumData);
            return stadiumData;
          }
          return null;
        };

        const coachesCache = new Map<string, UserProfile>();
        const getCoach = async (coachId: string): Promise<UserProfile | null> => {
            if (coachesCache.has(coachId)) {
                return coachesCache.get(coachId)!;
            }
            const coachDocRef = doc(firestore, "users", coachId);
            const coachDoc = await getDoc(coachDocRef);
             if (coachDoc.exists()) {
                const data = coachDoc.data();
                const coachData = { 
                  id: coachId, 
                  uid: coachId, 
                  ...data 
                } as UserProfile;
                coachesCache.set(coachId, coachData);
                return coachData;
            }
            return null;
        }


        // Fetch recent students
        const studentsQuery = query(
          collectionGroup(firestore, "students"), 
          where("organizationId", "==", organizationId),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const studentsSnapshot = await getDocs(studentsQuery);
        const studentActivities = await Promise.all(
          studentsSnapshot.docs.map(async (docSnap) => {
            const data = docSnap.data() as Student;
            const stadiumId = docSnap.ref.parent.parent?.id;
            if (!stadiumId || !data.createdAt) return null;

            const stadium = await getStadium(stadiumId);
            return {
              id: docSnap.id,
              title: data.fullName,
              description: `Joined ${stadium?.name || "a stadium"}.`,
              type: "new_student" as ActivityType,
              timestamp: (data.createdAt as Timestamp).toDate(),
            };
          })
        ).then(res => res.filter(Boolean) as Activity[]);
        

        // Fetch recent attendance submissions
        const attendanceQuery = query(
            collection(firestore, "attendance_submissions"), 
            where("organizationId", "==", organizationId),
            orderBy("timestamp", "desc"), 
            limit(5)
        );
        const attendanceSnapshot = await getDocs(attendanceQuery);
        const attendanceActivities = await Promise.all(
          attendanceSnapshot.docs.map(async (docSnap) => {
            const data = docSnap.data() as AttendanceSubmission;
            if (!data.timestamp) return null;
            const stadium = await getStadium(data.stadiumId);
            const coach = await getCoach(data.submittedByCoachId);

            return {
              id: docSnap.id,
              title: `${coach?.fullName || 'A coach'} took attendance`,
              description: `For ${data.batch} at ${stadium?.name || 'a stadium'}.`,
              type: 'attendance_submission' as ActivityType,
              timestamp: (data.timestamp as Timestamp).toDate(),
            };
          })
        ).then(res => res.filter(Boolean) as Activity[]);

        
        const combinedActivities = [...studentActivities, ...attendanceActivities]
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 4);

        setActivities(combinedActivities);

      } catch (error) {
        console.error("Error fetching recent activities:", error);
         if (error instanceof Error && (error.message.includes("requires an index") || error.message.includes("requires a COLLECTION_GROUP_DESC index"))) {
            console.warn("A Firestore index required for the Recent Activity feed is missing or still building. Please check the Firebase console.", error);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, [organizationId]);

  return (
    <Card className="flex flex-col border-0 bg-gradient-to-b from-white via-[#f8fbff] to-[#eef2ff] shadow-[0_24px_60px_-30px_rgba(15,23,42,0.35)]">
      <CardHeader className="pb-0">
        <CardTitle className="text-base font-semibold text-slate-900">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-6 pb-4 pt-4">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-2xl bg-white/60 px-4 py-3 shadow-inner ring-1 ring-slate-100/70"
              >
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-2">
            {activities.map((activity, index) => {
              const gradient = gradientBackgrounds[index % gradientBackgrounds.length];
              const relativeTime =
                isClient && activity.timestamp
                  ? formatDistanceToNow(activity.timestamp, { addSuffix: true })
                  : null;

              return (
                <div
                  key={`${activity.type}-${activity.id}`}
                  className={`flex items-center gap-3 rounded-2xl bg-gradient-to-r ${gradient} px-4 py-3 text-white shadow-[0_18px_45px_-32px_rgba(14,20,51,0.55)]`}
                >
                  <div className="flex size-10 items-center justify-center rounded-full bg-white/20 text-white">
                    {activityIcons[activity.type]}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="truncate text-sm font-semibold leading-tight">{activity.title}</p>
                    <p className="text-xs text-white/80">{activity.description}</p>
                  </div>
                  {relativeTime && (
                    <span className="shrink-0 text-xs font-medium text-white/90">{relativeTime}</span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-center text-muted-foreground">
            <p className="text-sm">No recent activity to display.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
