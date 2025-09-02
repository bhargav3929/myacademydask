
"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot, doc, getDoc, collectionGroup } from "firebase/firestore";
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
  const [dataCache, setDataCache] = useState<{
      stadiums: Map<string, Stadium>
    }>({
      stadiums: new Map()
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setLoading(true);

    const studentsQuery = query(collectionGroup(firestore, "students"), orderBy("createdAt", "desc"), limit(5));
    const attendanceSubmissionQuery = query(collection(firestore, "attendance_submissions"), orderBy("timestamp", "desc"), limit(5));
    
    let combinedActivities: Activity[] = [];

    const mergeAndSortActivities = () => {
      const sorted = combinedActivities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 5); 

      setActivities(sorted);
      setLoading(false);
    };

    const unsubStudents = onSnapshot(studentsQuery, async (snapshot) => {
      const studentDocs = snapshot.docs;
      const newStadiums = new Map(dataCache.stadiums);

      for (const docSnap of studentDocs) {
        const stadiumId = docSnap.ref.parent.parent!.id;
        if (!newStadiums.has(stadiumId)) {
          try {
            const stadiumDoc = await getDoc(doc(firestore, "stadiums", stadiumId));
            if (stadiumDoc.exists()) {
              newStadiums.set(stadiumId, { id: stadiumId, ...stadiumDoc.data()} as Stadium);
            }
          } catch(e) { console.error(e) }
        }
      }
      setDataCache(prev => ({...prev, stadiums: newStadiums}));

      const studentActivities = studentDocs.map(docSnap => {
        const data = docSnap.data() as Student;
        const stadiumId = docSnap.ref.parent.parent!.id;
        const stadiumName = newStadiums.get(stadiumId)?.name || "a stadium";
        return {
          id: docSnap.id,
          title: data.fullName,
          description: `Joined ${stadiumName}.`,
          type: "new_student" as ActivityType,
          timestamp: data.createdAt.toDate(),
        };
      });
      
      combinedActivities = [...combinedActivities.filter(a => a.type !== 'new_student'), ...studentActivities];
      mergeAndSortActivities();
    }, (error) => {
      console.warn("Could not fetch recent students for activity feed:", error.message);
    });

    const unsubAttendance = onSnapshot(attendanceSubmissionQuery, async (snapshot) => {
      const attendanceDocs = snapshot.docs;
      const newStadiums = new Map(dataCache.stadiums);
      
      for (const docSnap of attendanceDocs) {
        const stadiumId = docSnap.data().stadiumId;
        if (!newStadiums.has(stadiumId)) {
          try {
            const stadiumDoc = await getDoc(doc(firestore, "stadiums", stadiumId));
            if (stadiumDoc.exists()) {
              newStadiums.set(stadiumId, { id: stadiumId, ...stadiumDoc.data()} as Stadium);
            }
          } catch (e) {console.error(e)}
        }
      }
      setDataCache(prev => ({...prev, stadiums: newStadiums}));

      const attendanceActivities = attendanceDocs.map((docSnap) => {
          const data = docSnap.data() as AttendanceSubmission;
          const stadiumName = newStadiums.get(data.stadiumId)?.name || "A stadium";
            return {
                id: docSnap.id,
                title: `${stadiumName}`,
                description: `${data.batch} attendance taken.`,
                type: 'attendance_submission' as ActivityType,
                timestamp: data.timestamp.toDate(),
            };
        });
      
      combinedActivities = [...combinedActivities.filter(a => a.type !== 'attendance_submission'), ...attendanceActivities];
      mergeAndSortActivities();
    }, (error) => {
         console.error("Error fetching attendance activity:", error.message);
    });

    setLoading(false);
    return () => {
      unsubStudents();
      unsubAttendance();
    };
  }, []);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-6 pt-0 space-y-2">
        {loading ? (
           Array.from({ length: 5 }).map((_, i) => (
             <div key={i} className="flex items-center gap-4 py-2">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-grow space-y-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                </div>
             </div>
            ))
        ) : activities.length > 0 ? (
          <div>
            {activities.map((activity) => (
             <div key={`${activity.type}-${activity.id}`} className="flex items-center gap-4 py-2">
                <div className="flex size-10 items-center justify-center rounded-full bg-secondary">
                    {activityIcons[activity.type]}
                </div>
                <div className="flex-grow">
                    <p className="font-semibold text-sm leading-tight">
                        {activity.title}
                    </p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    {isClient && (
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
