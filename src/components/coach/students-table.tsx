
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
import { MoreHorizontal, Edit, Trash2, Shuffle, User, Calendar, Layers, Shield } from "lucide-react";
import { Student } from "@/lib/types";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { EditStudentDialog } from "./edit-student-dialog";
import { ChangeBatchDialog } from "./change-batch-dialog";
import { DeleteStudentDialog } from "./delete-student-dialog";
import { Card, CardContent } from "../ui/card";

type StudentsTableProps = {
  students: Student[];
  stadiumId: string;
};

export function StudentsTable({ students, stadiumId }: StudentsTableProps) {
  const badgeVariants: Record<Student['status'], string> = {
    active: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700",
    trial: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700",
    inactive: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700",
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
  const MotionCard = motion(Card);

  const StudentActions = ({ student }: { student: Student }) => (
     <DropdownMenu>
        <DropdownMenuTrigger asChild>
        <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8">
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
  )

  if (students.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-xl border">
            <h3 className="text-lg font-semibold">No Students Found</h3>
            <p className="text-sm text-muted-foreground mt-1">There are no students matching the selected batch.</p>
        </div>
      )
  }

  return (
    <>
    {/* Desktop Table View */}
    <div className="rounded-xl border hidden md:block">
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
          <AnimatePresence>
            {students.map((student, i) => (
                <MotionTableRow
                    key={student.id}
                    layoutId={`student-row-${student.id}`}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
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
                   <StudentActions student={student} />
                </TableCell>
                </MotionTableRow>
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>

    {/* Mobile Card View */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
        <AnimatePresence>
            {students.map((student, i) => (
            <MotionCard
                key={student.id}
                layoutId={`student-card-${student.id}`}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                custom={i}
                className="overflow-hidden"
            >
                <CardContent className="p-4 flex flex-col gap-4">
                     <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar className="size-10">
                                <AvatarFallback>{student.fullName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-base">{student.fullName}</p>
                                <p className="text-sm text-muted-foreground">{student.age} years old</p>
                            </div>
                        </div>
                        <StudentActions student={student} />
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3">
                         <div className="flex items-center gap-2">
                            <Layers className="size-4" />
                            <span>{student.batch}</span>
                         </div>
                         <Badge variant="outline" className={cn(badgeVariants[student.status || 'active'], "capitalize")}>
                            {student.status || 'Active'}
                         </Badge>
                    </div>
                </CardContent>
            </MotionCard>
            ))}
        </AnimatePresence>
    </div>
    </>
  );
}

    