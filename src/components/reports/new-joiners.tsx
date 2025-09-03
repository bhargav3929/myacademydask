
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import type { NewJoiner } from "./report-types";
import { format } from "date-fns";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback } from "../ui/avatar";

interface NewJoinersProps {
  joiners: NewJoiner[];
}

export function NewJoiners({ joiners }: NewJoinersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <UserPlus className="size-5" />
            New Joiners
        </CardTitle>
        <CardDescription>Students who registered within the selected period.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48">
            {joiners.length > 0 ? (
                <div className="space-y-4">
                    {joiners.map((joiner, index) => (
                        <div key={index} className="flex items-center">
                            <Avatar className="h-9 w-9">
                                <AvatarFallback>{joiner.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">{joiner.name}</p>
                                <p className="text-sm text-muted-foreground">Joined on {format(joiner.joinDate, "PPP")}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-muted-foreground">No new students joined in this period.</p>
                </div>
            )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

    