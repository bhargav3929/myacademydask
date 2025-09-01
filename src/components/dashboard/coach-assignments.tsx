
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function CoachAssignments() {
    
    const coaches = [
        { name: 'Danilo Souza', avatar: `https://i.pravatar.cc/150?u=danilo`, stadium: 'North City Arena' },
        { name: 'John Doe', avatar: `https://i.pravatar.cc/150?u=john`, stadium: 'Downtown Center' },
        { name: 'Jane Smith', avatar: `https://i.pravatar.cc/150?u=jane`, stadium: 'Southside Complex' },
    ]

  return (
    <Card className="shadow-sm border-none">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Coach Assignments</CardTitle>
        <Users className="size-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        {coaches.map(coach => (
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
        ))}
      </CardContent>
    </Card>
  );
}
