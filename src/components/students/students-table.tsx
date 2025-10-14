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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, User, Edit, Trash2, Layers, Calendar } from "lucide-react";
import { Student, Stadium } from "@/lib/types";
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from "../ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "../ui/card";
import { StudentProfileDialog } from "../dashboard/student-profile-dialog";
import { StudentFormDialog } from "../students/student-form-dialog";
import { DeleteStudentDialog } from "./delete-student-dialog";

type StudentsTableProps = {
  students: Student[];
  allStadiums: Stadium[];
  refreshStudents: () => void;
};

export function StudentsTable({ students, allStadiums, refreshStudents }: StudentsTableProps) {
  const getStadiumName = (stadiumId: string) => {
    if (!allStadiums) return "Unassigned";
    return allStadiums.find(s => s.id === stadiumId)?.name || "Unassigned";
  }

  const badgeVariants: Record<'active' | 'trial' | 'inactive', string> = {
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
    exit: { opacity: 0, y: -10 },
  };
  
  const MotionTableRow = motion(TableRow);
  const MotionCard = motion(Card);

  const StudentActions = ({ student }: { student: Student }) => (
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
        <StudentProfileDialog student={student}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <User className="mr-2 size-4" /> View Profile
          </DropdownMenuItem>
        </StudentProfileDialog>
        <StudentFormDialog stadiums={allStadiums} studentToEdit={student} onFormSubmit={refreshStudents}>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Edit className="mr-2 size-4" /> Edit Student
            </DropdownMenuItem>
        </StudentFormDialog>
        <DeleteStudentDialog student={student}>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 size-4" /> Delete Student
            </DropdownMenuItem>
        </DeleteStudentDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (!students) {
      return null; // Or a loading indicator
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="rounded-xl border hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Student</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead>Assigned Stadium</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {students.length > 0 ? students.map((student, i) => (
                <MotionTableRow
                    key={student.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    custom={i}
                    layoutId={`student-row-${student.id}`}
                    className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                            <AvatarFallback>{(student.fullName || "U").charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{student.fullName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {student.joinDate ? format(student.joinDate.toDate(), 'PPP') : 'N/A'}
                  </TableCell>
                  <TableCell>{getStadiumName(student.stadiumId)}</TableCell>
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
              )) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        No students found for the selected filters.
                    </TableCell>
                </TableRow>
              )}
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
                    className="overflow-hidden"
                >
                    <CardContent className="p-4 flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="size-10">
                                    <AvatarFallback>{(student.fullName || "U").charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-base">{student.fullName}</p>
                                    <p className="text-sm text-muted-foreground">{getStadiumName(student.stadiumId)}</p>
                                </div>
                            </div>
                           <StudentActions student={student} />
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3">
                            <div className="flex items-center gap-2">
                                <Layers className="size-4" />
                                <span>{student.batch}</span>
                            </div>
                             <div className="flex items-center gap-2">
                                <Calendar className="size-4" />
                                <span>{student.joinDate?.toDate ? format(student.joinDate.toDate(), "dd MMM, yyyy") : 'N/A'}</span>
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
        {students.length === 0 && (
             <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-xl border md:hidden">
                <h3 className="text-lg font-semibold">No Students Found</h3>
                <p className="text-sm text-muted-foreground mt-1">There are no students matching the selected filters.</p>
            </div>
        )}
    </>
  );
}
