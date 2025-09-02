
"use client";

import { useEffect, useState } from "react";
import { collection, query, getDocs, doc, getDoc, where } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";

interface AssignedCoach {
    id: string;
    name: string;
    stadium: string;
}

export function CoachAssignments() {
    const [coaches, setCoaches] = useState<AssignedCoach[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCoaches = async () => {
            setLoading(true);
            try {
                const usersQuery = query(collection(firestore, "users"), where("role", "==", "coach"));
                const usersSnapshot = await getDocs(usersQuery);
                
                const coachesData = await Promise.all(
                    usersSnapshot.docs.map(async (userDoc) => {
                        const userData = userDoc.data();
                        const stadiumId = userData.assignedStadiums?.[0];
                        let stadiumName = "Unassigned";

                        if (stadiumId) {
                            const stadiumDoc = await getDoc(doc(firestore, "stadiums", stadiumId));
                            if (stadiumDoc.exists()) {
                                stadiumName = stadiumDoc.data().name;
                            }
                        }
                        return {
                            id: userDoc.id,
                            name: userData.fullName || "Unnamed Coach",
                            stadium: stadiumName,
                        };
                    })
                );
                setCoaches(coachesData);
            } catch (error) {
                console.error("Error fetching coach assignments:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCoaches();
    }, []);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-base font-semibold">Coach Assignments</CardTitle>
                <Users className="size-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-3">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-2">
                           <Skeleton className="size-9 rounded-full" />
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                        </div>
                    ))
                ) : coaches.length > 0 ? (
                    coaches.map(coach => (
                        <div key={coach.id} className="flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-muted/50">
                            <div className="flex items-center gap-3">
                                <Avatar className="size-9">
                                    <AvatarFallback>{coach.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-semibold">{coach.name}</p>
                                    <p className="text-xs text-muted-foreground">{coach.stadium}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex h-24 items-center justify-center text-center text-muted-foreground">
                        <p className="text-sm">No coaches assigned yet.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
