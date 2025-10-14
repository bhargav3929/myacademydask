
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
import { MoreHorizontal, Edit, Trash2, Shuffle, User, Layers, Eye } from "lucide-react";
import { Stadium, Student } from "@/lib/types";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { StudentFormDialog } from "../students/student-form-dialog";
import { ChangeBatchDialog } from "./change-batch-dialog";
import { DeleteStudentDialog } from "./delete-student-dialog";
import { StudentProfileDialog } from "../dashboard/student-profile-dialog";

type StudentsTableProps = {
  students: Student[];
  stadiumId: string;
  // We now need the list of all possible stadiums for the edit form dropdown
  allStadiums: Stadium[]; 
  coachId: string;
  refreshStudents: () => void;
};

export function StudentsTable({ students, stadiumId, allStadiums, coachId, refreshStudents }: StudentsTableProps) {
  const badgeVariants: Record<'active' | 'trial' | 'inactive', string> = {
    active: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700",
    trial: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700",
    inactive: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700",
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut",
      },
    }),
    exit: { y: 10, opacity: 0, transition: { duration: 0.2 } },
  };

  const MotionTableRow = motion(TableRow);
  const MotionCard = motion.div;

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
        <StudentProfileDialog student={student}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Eye className="mr-2 size-4" /> View Profile
          </DropdownMenuItem>
        </StudentProfileDialog>
        {/* This is the new, unified form dialog for editing */}
        <StudentFormDialog 
          stadiums={allStadiums} 
          studentToEdit={student} 
          onFormSubmit={refreshStudents}
        >
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Edit className="mr-2 size-4" /> Edit Details
          </DropdownMenuItem>
        </StudentFormDialog>
        <ChangeBatchDialog student={student} stadiumId={stadiumId} onBatchChanged={refreshStudents}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Shuffle className="mr-2 size-4" /> Change Batch
          </DropdownMenuItem>
        </ChangeBatchDialog>
        <DropdownMenuSeparator />
        <DeleteStudentDialog
          studentId={student.id}
          studentName={student.fullName || "Unnamed Student"}
          stadiumId={stadiumId}
          onStudentDeleted={refreshStudents}
        >
          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
            <Trash2 className="mr-2 size-4" /> Delete Student
          </DropdownMenuItem>
        </DeleteStudentDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-xl border-2 border-dashed">
        <User className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">No Students Enrolled</h3>
        <p className="text-sm text-muted-foreground mt-1">
          It looks like you haven&apos;t added any students yet. Get started by adding a new student.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="rounded-xl border hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Student</TableHead>
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
                  exit="exit"
                  custom={i}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback>{(student.fullName || "U").charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{student.fullName || "Unnamed Student"}</span>
                    </div>
                  </TableCell>
                  <TableCell>{student.age}</TableCell>
                  <TableCell>{student.batch}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(badgeVariants[student.status || "active"], "capitalize")}>
                      {student.status || "Active"}
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
              exit="exit"
              custom={i}
              className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden"
            >
              <div className="p-4 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10">
                      <AvatarFallback>{(student.fullName || "U").charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-base">{student.fullName || "Unnamed Student"}</p>
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
                  <Badge variant="outline" className={cn(badgeVariants[student.status || "active"], "capitalize")}>
                    {student.status || "Active"}
                  </Badge>
                </div>
              </div>
            </MotionCard>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
