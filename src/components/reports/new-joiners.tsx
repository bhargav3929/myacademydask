
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import type { NewJoiner } from "./report-types";
import { format } from "date-fns";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

interface NewJoinersProps {
  joiners: NewJoiner[];
}

export function NewJoiners({ joiners }: NewJoinersProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <UserPlus className="size-5" />
                    New Joiners
                </CardTitle>
                <CardDescription>Students who registered within the selected period.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72">
            {joiners.length > 0 ? (
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Coach</TableHead>
                            <TableHead>Join Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {joiners.map((joiner, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{joiner.name}</TableCell>
                                <TableCell>{joiner.coachName}</TableCell>
                                <TableCell>{format(joiner.joinDate, "dd MMM, yyyy")}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
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
