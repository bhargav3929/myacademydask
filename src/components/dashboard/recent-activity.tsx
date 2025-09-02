
"use client";

import { useEffect, useState } from "react";
import { collectionGroup, query, orderBy, limit, onSnapshot, doc, getDoc, getDocs, where } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, CalendarCheck, CalendarX } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Student } from "@/lib/types";

type ActivityType = 'present' | 'absent' | 'new_student';

type Activity = {
  id: string;
  person: string;
  action: string;
  type: ActivityType;
  timestamp: Date;
};

const activityIcons: Record<ActivityType, React.ReactNode> = {
  present: <CalendarCheck className="size-4 text-green-500" />,
  absent: <CalendarX className="size-4 text-red-500" />,
  new_student: <UserPlus className="size-4 text-blue-500" />,
};

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const studentsQuery = query(collectionGroup(firestore, "students"), limit(5));
    // Querying without orderBy to avoid needing a composite index. Sorting will be done client-side.
    const attendanceQuery = query(collectionGroup(firestore, "attendance"), limit(10));

    const studentDocsCache = new Map<string, Student>();
    let combinedActivities: Activity[] = [];
    let initialLoadComplete = { students: false, attendance: false };

    const checkLoadingComplete = () => {
        if (initialLoadComplete.students && initialLoadComplete.attendance) {
            setLoading(false);
        }
    }

    const mergeAndSortActivities = (newActivities: Activity[]) => {
      // Combine new activities with existing ones
      const activityMap = new Map<string, Activity>();
      [...combinedActivities, ...newActivities].forEach(act => {
          activityMap.set(act.id, act);
      });
      
      // Sort and slice
      const sorted = Array.from(activityMap.values())
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 5);

      combinedActivities = sorted;
      setActivities(combinedActivities);
    };

    const unsubStudents = onSnapshot(studentsQuery, (snapshot) => {
      const studentActivities = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          person: data.fullName,
          action: "joined the academy.",
          type: "new_student" as ActivityType,
          timestamp: data.createdAt.toDate(),
        };
      });
      mergeAndSortActivities(studentActivities);
      initialLoadComplete.students = true;
      checkLoadingComplete();
    }, (error) => {
      console.warn("Could not fetch recent students for activity feed, probably missing index:", error.message);
      initialLoadComplete.students = true;
      checkLoadingComplete();
    });

    const unsubAttendance = onSnapshot(attendanceQuery, async (snapshot) => {
        const attendancePromises = snapshot.docs.map(async (attendanceDoc) => {
            const data = attendanceDoc.data();
            let studentName = "A student";
            
            try {
                 if (studentDocsCache.has(data.studentId)) {
                    studentName = studentDocsCache.get(data.studentId)!.fullName;
                } else {
                    const studentSubcollectionRef = collection(firestore, `stadiums/${data.stadiumId}/students`);
                    const studentRef = doc(studentSubcollectionRef, data.studentId);
                    const studentDoc = await getDoc(studentRef);

                    if (studentDoc.exists()) {
                        const studentData = { id: studentDoc.id, ...studentDoc.data() } as Student;
                        studentName = studentData.fullName;
                        studentDocsCache.set(data.studentId, studentData);
                    }
                }
            } catch (e) {
                console.warn(`Could not find student with ID ${data.studentId} in stadium ${data.stadiumId}`);
            }
           
            return {
                id: attendanceDoc.id,
                person: studentName,
                action: `was marked ${data.status}.`,
                type: data.status as ActivityType,
                timestamp: data.timestamp.toDate(),
            };
        });

        const attendanceActivities = await Promise.all(attendancePromises);
        mergeAndSortActivities(attendanceActivities);
        initialLoadComplete.attendance = true;
        checkLoadingComplete();
    }, (error) => {
         console.error("Error fetching attendance activity:", error.message);
         initialLoadComplete.attendance = true;
         checkLoadingComplete();
    });

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
      <CardContent className="flex-grow p-6 pt-0 space-y-4">
        {loading ? (
           Array.from({ length: 4 }).map((_, i) => (
             <div key={i} className="flex items-start gap-4">
                <Skeleton className="size-9 rounded-full" />
                <div className="flex-grow space-y-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                </div>
             </div>
            ))
        ) : activities.length > 0 ? (
          activities.map((activity) => (
             <div key={activity.id} className="flex items-start gap-4">
                <div className="mt-1 size-9 rounded-full bg-muted flex items-center justify-center border">
                    {activityIcons[activity.type]}
                </div>
                <div className="flex-grow">
                    <p className="text-sm leading-tight">
                        <span className="font-semibold">{activity.person}</span>
                        <span className="text-muted-foreground"> {activity.action}</span>
                    </p>
                    <p className="text-xs text-muted-foreground pt-1">{formatDistanceToNow(activity.timestamp, { addSuffix: true })}</p>
                </div>
             </div>
          ))
        ) : (
          <div className="flex h-24 items-center justify-center text-center text-muted-foreground">
            <p className="text-sm">No recent activity to display.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
