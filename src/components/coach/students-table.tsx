
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Trash2, Shuffle } from "lucide-react";
import { Student } from "@/lib/types";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EditStudentDialog } from "./edit-student-dialog";
import { ChangeBatchDialog } from "./change-batch-dialog";
import { DeleteStudentDialog } from "./delete-student-dialog";

type StudentsTableProps = {
  students: Student[];
  stadiumId: string;
};

export function StudentsTable({ students, stadiumId }: StudentsTableProps) {
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
            <TableHead>Age</TableHead>
            <TableHead>Batch</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length > 0 ? students.map((student, i) => (
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
              <TableCell>{student.age}</TableCell>
              <TableCell>{student.batch}</TableCell>
              <TableCell>
                 <Badge variant="outline" className={cn(badgeVariants[student.status || 'active'], "capitalize")}>
                    {student.status || 'Active'}
                 </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <EditStudentDialog student={student} stadiumId={stadiumId}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Edit className="mr-2 size-4" /> Edit Profile
                        </DropdownMenuItem>
                    </EditStudentDialog>
                    <ChangeBatchDialog student={student} stadiumId={stadiumId}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Shuffle className="mr-2 size-4" /> Change Batch
                        </DropdownMenuItem>
                    </ChangeBatchDialog>
                     <DeleteStudentDialog studentId={student.id} studentName={student.fullName} stadiumId={stadiumId}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 size-4" /> Delete Student
                        </DropdownMenuItem>
                    </DeleteStudentDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </MotionTableRow>
          )) : (
            <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                    No students found for the selected batch.
                </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
