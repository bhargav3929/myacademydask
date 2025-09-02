
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { format } from "date-fns";
import { Student } from "@/lib/types";
import { cn } from "@/lib/utils";


export function RecentRegistrations({ data }: { data: Student[] }) {

  const badgeVariants: Record<Student['status'], string> = {
    active: "bg-green-100 text-green-800 border-green-200",
    trial: "bg-yellow-100 text-yellow-800 border-yellow-200",
    inactive: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
            <CardDescription>A list of the newest students who have joined your academy.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                    <span className="sr-only">Actions</span>
                    </TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {data.length > 0 ? data.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/50">
                    <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                               <AvatarFallback>{item.fullName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{item.fullName}</span>
                        </div>
                    </TableCell>
                    <TableCell>{item.joinDate?.toDate ? format(item.joinDate.toDate(), "dd MMM yyyy") : 'N/A'}</TableCell>
                    <TableCell>
                        <Badge variant="outline" className={cn(badgeVariants[item.status || 'active'], "capitalize")}>
                          {item.status || 'Active'}
                        </Badge>
                    </TableCell>
                    <TableCell>
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>Edit Details</DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                    </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                            No recent registrations to display.
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
  );
}
