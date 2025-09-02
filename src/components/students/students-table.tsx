
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
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { Student, Stadium } from "@/lib/types";
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from "../ui/avatar";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type StudentsTableProps = {
  data: Student[];
  stadiums: Stadium[];
};

export function StudentsTable({ data, stadiums }: StudentsTableProps) {

  const getStadiumName = (stadiumId: string) => {
    return stadiums.find(s => s.id === stadiumId)?.name || "Unassigned";
  }

  const badgeVariants: Record<Student['status'], string> = {
    active: "bg-green-100 text-green-800 border-green-200",
    trial: "bg-yellow-100 text-yellow-800 border-yellow-200",
    inactive: "bg-red-100 text-red-800 border-red-200",
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.05,
        type: "spring",
        stiffness: 100,
      },
    }),
  };
  
  const MotionTableRow = motion(TableRow);

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Join Date</TableHead>
            <TableHead>Assigned Stadium</TableHead>
            <TableHead>Membership</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? data.map((student, i) => (
            <MotionTableRow
                key={student.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                custom={i}
                className="hover:bg-muted/50 transition-colors"
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                        <AvatarFallback>{student.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{student.fullName}</span>
                </div>
              </TableCell>
              <TableCell>
                {student.joinDate ? format(student.joinDate.toDate(), 'PPP') : 'N/A'}
              </TableCell>
              <TableCell>{getStadiumName(student.stadiumId)}</TableCell>
              <TableCell>Pro Tier</TableCell>
              <TableCell>
                 <Badge variant="outline" className={cn(badgeVariants[student.status || 'active'], "capitalize")}>
                    {student.status || 'Active'}
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
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>View Profile</DropdownMenuItem>
                    <DropdownMenuItem>Edit Student</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                        Delete Student
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </MotionTableRow>
          )) : (
            <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                    No students found. Add a new student to get started.
                </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
