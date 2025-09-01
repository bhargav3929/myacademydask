"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy, limit, doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

type Activity = {
  id: string;
  studentName: string;
  coachName: string;
  status: 'present' | 'absent';
  timestamp: string;
};

const UserCache = new Map<string, string>();

async function getUserName(userId: string) {
    if (UserCache.has(userId)) {
        return UserCache.get(userId);
    }
    try {
        const userDoc = await getDoc(doc(firestore, "users", userId));
        if (userDoc.exists()) {
            const name = userDoc.data().fullName;
            UserCache.set(userId, name);
            return name;
        }
        // for students, we have a separate collection
        const studentDoc = await getDoc(doc(firestore, "students", userId));
        if (studentDoc.exists()) {
            const name = studentDoc.data().fullName;
            UserCache.set(userId, name);
            return name;
        }
        return "Unknown User";
    } catch {
        return "Unknown User";
    }
}


export function RecentActivity() {
  const { userData } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData?.organizationId) return;

    const q = query(
      collection(firestore, "attendance"),
      where("organizationId", "==", userData.organizationId),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const newActivities = await Promise.all(snapshot.docs.map(async (d) => {
        const data = d.data();
        const studentName = await getUserName(data.studentId);
        const coachName = await getUserName(data.markedByCoachId);
        return {
          id: d.id,
          studentName,
          coachName,
          status: data.status,
          timestamp: data.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'N/A'
        };
      }));
      setActivities(newActivities);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching recent activity: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [userData?.organizationId]);

  return (
    <Card className="h-full flex flex-col transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest attendance markings in your organization.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ScrollArea className="h-[250px]">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>
                      {activity.status === 'present' ? <CheckCircle2 className="text-green-500" /> : <XCircle className="text-red-500" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.studentName} marked as {activity.status}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      by {activity.coachName} at {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No recent activity.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
