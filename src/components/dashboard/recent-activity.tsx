
"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, doc, getDoc, getDocs, collectionGroup } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, CalendarCheck } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Student, Stadium, AttendanceSubmission } from "@/lib/types";

type ActivityType = 'attendance_submission' | 'new_student';

type Activity = {
  id: string;
  title: string;
  description: string;
  type: ActivityType;
  timestamp: Date;
};

const activityIcons: Record<ActivityType, React.ReactNode> = {
  attendance_submission: <CalendarCheck className="size-5 text-green-500" />,
  new_student: <UserPlus className="size-5 text-primary" />,
};

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
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

        // 1. Fetch recent student admissions
        const studentsQuery = query(
          collectionGroup(firestore, "students"), 
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const studentsSnapshot = await getDocs(studentsQuery);
        const studentActivities: Activity[] = await Promise.all(
          studentsSnapshot.docs.map(async (docSnap) => {
            const data = docSnap.data() as Student;
            const stadiumId = data.stadiumId;
            if (!stadiumId || !data.createdAt) return null;

            const stadium = await getStadium(stadiumId);
            return {
              id: docSnap.id,
              title: data.fullName,
              description: `Joined ${stadium?.name || "a stadium"}.`,
              type: "new_student" as ActivityType,
              timestamp: data.createdAt.toDate(),
            };
          })
        ).then(res => res.filter(Boolean) as Activity[]);

        // 2. Fetch recent attendance submissions
        const attendanceQuery = query(collection(firestore, "attendance_submissions"), orderBy("timestamp", "desc"), limit(5));
        const attendanceSnapshot = await getDocs(attendanceQuery);
        const attendanceActivities: Activity[] = await Promise.all(
          attendanceSnapshot.docs.map(async (docSnap) => {
            const data = docSnap.data() as AttendanceSubmission;
            const stadium = await getStadium(data.stadiumId);
            return {
              id: docSnap.id,
              title: `${stadium?.name || "A stadium"}`,
              description: `${data.batch} attendance taken.`,
              type: 'attendance_submission' as ActivityType,
              timestamp: data.timestamp.toDate(),
            };
          })
        );
        
        // 3. Combine, sort, and slice
        const combinedActivities = [...studentActivities, ...attendanceActivities]
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 5);

        setActivities(combinedActivities);

      } catch (error) {
        if (error instanceof Error && error.message.includes("requires a COLLECTION_GROUP_DESC index")) {
            console.error("Firestore index missing. Please create it in the Firebase console.", error);
            // Gracefully degrade: only show attendance activities if students query fails
            try {
                const attendanceQuery = query(collection(firestore, "attendance_submissions"), orderBy("timestamp", "desc"), limit(5));
                const attendanceSnapshot = await getDocs(attendanceQuery);
                const attendanceActivities: Activity[] = await Promise.all(
                  attendanceSnapshot.docs.map(async (docSnap) => {
                    const data = docSnap.data() as AttendanceSubmission;
                    const stadium = await getStadium(data.stadiumId); // getStadium is defined outside, so accessible
                    return {
                      id: docSnap.id,
                      title: `${stadium?.name || "A stadium"}`,
                      description: `${data.batch} attendance taken.`,
                      type: 'attendance_submission' as ActivityType,
                      timestamp: data.timestamp.toDate(),
                    };
                  })
                );
                setActivities(attendanceActivities);
            } catch (e) {
                console.error("Failed to fetch even attendance activities", e);
            }
        } else {
            console.error("Error fetching recent activities:", error);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, []);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-6 pt-0">
        {loading ? (
           <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-2">
                    <Skeleton className="flex size-10 items-center justify-center rounded-full" />
                    <div className="flex-grow space-y-1.5">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/4" />
                    </div>
                </div>
                ))}
           </div>
        ) : activities.length > 0 ? (
          <div>
            {activities.map((activity) => (
             <div key={`${activity.type}-${activity.id}`} className="flex items-start gap-4 py-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-secondary border">
                    {activityIcons[activity.type]}
                </div>
                <div className="flex-grow">
                    <p className="font-semibold text-sm leading-tight">
                        {activity.title}
                    </p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    {isClient && activity.timestamp && (
                      <p className="text-xs text-muted-foreground pt-1">{formatDistanceToNow(activity.timestamp, { addSuffix: true })}</p>
                    )}
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
