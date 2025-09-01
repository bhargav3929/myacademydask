
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function CoachAssignments() {
    
    const coaches: any[] = [
        // Data will be fetched from Firestore
    ]

  return (
    <Card className="shadow-sm border-none">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Coach Assignments</CardTitle>
        <Users className="size-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        {coaches.length > 0 ? coaches.map(coach => (
            <div key={coach.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                        <AvatarImage src={coach.avatar} />
                        <AvatarFallback>{coach.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-semibold">{coach.name}</p>
                        <p className="text-xs text-muted-foreground">{coach.stadium}</p>
                    </div>
                </div>
            </div>
        )) : (
            <div className="flex h-24 items-center justify-center">
                <p className="text-sm text-muted-foreground">No coaches assigned yet.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
