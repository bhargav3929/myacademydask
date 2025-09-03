
"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, doc, getDoc, getDocs, collectionGroup, where, Timestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, CalendarCheck } from "lucide-react";
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

const activityIcons: Record<ActivityType, React.ReactNode> = {
  attendance_submission: <CalendarCheck className="size-4 text-green-500" />,
  new_student: <UserPlus className="size-4 text-primary" />,
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
                const coachData = { id: coachId, ...coachDoc.data() } as UserProfile;
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
          .slice(0, 5);

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
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-6 pt-0">
        {loading ? (
           <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                    <Skeleton className="flex size-8 items-center justify-center rounded-full" />
                    <div className="flex-grow space-y-1.5">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/4" />
                    </div>
                </div>
                ))}
           </div>
        ) : activities.length > 0 ? (
          <div className="space-y-1">
            {activities.map((activity) => (
             <div key={`${activity.type}-${activity.id}`} className="flex items-center gap-3 py-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-secondary border">
                    {activityIcons[activity.type]}
                </div>
                <div className="flex-grow">
                    <p className="font-semibold text-sm leading-tight">
                        {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground leading-snug">
                        {activity.description}
                        {isClient && activity.timestamp && (
                            <span className="ml-1.5">
                                {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                            </span>
                        )}
                    </p>
                </div>
             </div>
            ))}
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
