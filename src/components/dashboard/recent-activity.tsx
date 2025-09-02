
"use client";

import { useEffect, useState } from "react";
import { collectionGroup, query, orderBy, limit, onSnapshot, doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, CalendarCheck, CalendarX } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Student, Attendance, Stadium } from "@/lib/types";

type ActivityType = 'present' | 'absent' | 'new_student';

type Activity = {
  id: string;
  title: string;
  description: string;
  type: ActivityType;
  timestamp: Date;
};

const activityIcons: Record<ActivityType, React.ReactNode> = {
  present: <CalendarCheck className="size-5 text-green-500" />,
  absent: <CalendarX className="size-5 text-red-500" />,
  new_student: <UserPlus className="size-5 text-primary" />,
};

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataCache, setDataCache] = useState<{students: Map<string, Student>, stadiums: Map<string, Stadium>}>({
      students: new Map(),
      stadiums: new Map()
  });

  useEffect(() => {
    setLoading(true);

    const studentsQuery = query(collectionGroup(firestore, "students"), limit(10));
    const attendanceQuery = query(collectionGroup(firestore, "attendance"), limit(10));
    
    let combinedActivities: Activity[] = [];

    const mergeAndSortActivities = (newActivities: Activity[]) => {
      const activityMap = new Map<string, Activity>();
      [...combinedActivities, ...newActivities].forEach(act => {
        const activityKey = `${act.type}-${act.id}`;
        if (!activityMap.has(activityKey)) {
            activityMap.set(activityKey, act);
        }
      });
      
      const sorted = Array.from(activityMap.values())
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 5); // Limit to top 5 activities

      combinedActivities = sorted;
      setActivities(sorted);
    };

    const unsubStudents = onSnapshot(studentsQuery, async (snapshot) => {
      const studentDocs = snapshot.docs.sort((a,b) => b.data().createdAt.toMillis() - a.data().createdAt.toMillis()).slice(0,5);

      if (studentDocs.length === 0) {
          setLoading(false);
          return;
      };

      const stadiumIds = new Set(studentDocs.map(doc => doc.ref.parent.parent!.id));
      const newStadiums = new Map(dataCache.stadiums);
      let fetchRequired = false;
      for (const id of stadiumIds) {
          if (!newStadiums.has(id)) {
              const stadiumDoc = await getDoc(doc(firestore, "stadiums", id));
              if (stadiumDoc.exists()) {
                  newStadiums.set(id, { id, ...stadiumDoc.data()} as Stadium);
                  fetchRequired = true;
              }
          }
      }
      if(fetchRequired) {
          setDataCache(prev => ({...prev, stadiums: newStadiums}));
      }

      const studentActivities = studentDocs.map(doc => {
        const data = doc.data() as Student;
        const stadiumId = doc.ref.parent.parent!.id;
        const stadiumName = newStadiums.get(stadiumId)?.name || "a stadium";
        return {
          id: doc.id,
          title: data.fullName,
          description: `Joined ${stadiumName}.`,
          type: "new_student" as ActivityType,
          timestamp: data.createdAt.toDate(),
        };
      });
      mergeAndSortActivities(studentActivities);
      setLoading(false);
    }, (error) => {
      console.warn("Could not fetch recent students for activity feed:", error.message);
      setLoading(false);
    });

    const unsubAttendance = onSnapshot(attendanceQuery, async (snapshot) => {
      const attendanceDocs = snapshot.docs.sort((a, b) => b.data().timestamp.toMillis() - a.data().timestamp.toMillis());

      if (attendanceDocs.length === 0) {
          setLoading(false);
          return;
      };

      const newStudents = new Map(dataCache.students);
      let fetchRequired = false;

      const attendanceActivities = await Promise.all(
        attendanceDocs.map(async (attendanceDoc) => {
            const data = attendanceDoc.data() as Attendance;
            let studentName = `A student`;

            if (newStudents.has(data.studentId)) {
                studentName = newStudents.get(data.studentId)!.fullName;
            } else {
                 try {
                    const studentRef = doc(firestore, `stadiums/${data.stadiumId}/students`, data.studentId);
                    const studentDoc = await getDoc(studentRef);
                    if (studentDoc.exists()) {
                        studentName = studentDoc.data().fullName;
                        newStudents.set(data.studentId, {id: data.studentId, ...studentDoc.data()} as Student);
                        fetchRequired = true;
                    }
                 } catch (e) {
                     // Student might have been deleted, proceed gracefully
                 }
            }

            return {
                id: attendanceDoc.id,
                title: `${studentName}`,
                description: `was marked ${data.status}.`,
                type: data.status as ActivityType,
                timestamp: data.timestamp.toDate(),
            };
        })
      );
      if(fetchRequired) {
          setDataCache(prev => ({...prev, students: newStudents}));
      }
      mergeAndSortActivities(attendanceActivities);
      setLoading(false);
    }, (error) => {
         console.error("Error fetching attendance activity:", error.message);
         setLoading(false);
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
            {activities.map((activity, index) => (
             <div key={`${activity.type}-${activity.id}`} className="flex items-center gap-4 py-2">
                <div className="flex size-10 items-center justify-center rounded-full bg-secondary">
                    {activityIcons[activity.type]}
                </div>
                <div className="flex-grow">
                    <p className="font-semibold text-sm leading-tight">
                        {activity.title}
                    </p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground pt-1">{formatDistanceToNow(activity.timestamp, { addSuffix: true })}</p>
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
