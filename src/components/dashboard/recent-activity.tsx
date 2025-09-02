
"use client";

import { useEffect, useState } from "react";
import { collectionGroup, query, orderBy, limit, onSnapshot, doc, getDoc, getDocs, collection } from "firebase/firestore";
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
    // This is a simplified fetch for demonstration. A real-world app might use a dedicated 'activities' collection
    // or more optimized queries. For now, we combine two separate queries.
    const fetchActivities = async () => {
      setLoading(true);

      // 1. Fetch recent student registrations
      const studentsQuery = query(collectionGroup(firestore, "students"), orderBy("createdAt", "desc"), limit(5));
      
      // 2. Fetch recent attendance records
      const attendanceQuery = query(collectionGroup(firestore, "attendance"), orderBy("timestamp", "desc"), limit(5));
      
      const [studentsSnapshot, attendanceSnapshot] = await Promise.all([
          getDocs(studentsQuery),
          getDocs(attendanceQuery),
      ]);
      
      // Map student registrations to activity format
      const studentActivities = studentsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          person: data.fullName,
          action: "joined the academy.",
          type: "new_student" as ActivityType,
          timestamp: data.createdAt.toDate(),
        };
      });

      // Map attendance records to activity format
      const studentDocsCache = new Map<string, Student>();
      const attendanceActivitiesPromises = attendanceSnapshot.docs.map(async (attendanceDoc) => {
        const data = attendanceDoc.data();
        let studentName = "A student";

        // To get the student's name, we need their document.
        // The attendance record lives at `stadiums/{stadiumId}/attendance/{attendanceId}`
        // The student record lives at `stadiums/{stadiumId}/students/{studentId}`
        const studentRef = doc(attendanceDoc.ref.parent.parent!, "students", data.studentId);
        
        if (studentDocsCache.has(data.studentId)) {
          studentName = studentDocsCache.get(data.studentId)!.fullName;
        } else {
          const studentDoc = await getDoc(studentRef);
          if (studentDoc.exists()) {
            const studentData = { id: studentDoc.id, ...studentDoc.data() } as Student;
            studentName = studentData.fullName;
            studentDocsCache.set(data.studentId, studentData);
          }
        }
        
        return {
          id: attendanceDoc.id,
          person: studentName,
          action: `was marked ${data.status}.`,
          type: data.status as ActivityType,
          timestamp: data.timestamp.toDate(),
        };
      });

      const attendanceActivities = (await Promise.all(attendanceActivitiesPromises)).filter(Boolean) as Activity[];
      
      // Combine, sort, and slice to get the 5 most recent activities of any type
      const combinedActivities = [...studentActivities, ...attendanceActivities]
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 5);

      setActivities(combinedActivities);
      setLoading(false);
    };

    fetchActivities();
    
    // Note: For real-time updates, you'd set up `onSnapshot` listeners for both queries
    // and manage merging the results, which can be complex. Fetching on load is simpler.

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
