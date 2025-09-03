
"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
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
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, User, Edit, Calendar, Map as MapIcon, BadgeDollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { format } from "date-fns";
import { Student, Stadium } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { StudentProfileDialog } from "./student-profile-dialog";
import { EditStudentDialog } from "./edit-student-dialog";

type NewAdmissionsProps = {
  data: Student[];
};

const MotionTableRow = motion(TableRow);
const MotionCard = motion(Card);

export function NewAdmissions({ data }: NewAdmissionsProps) {
    const [stadiumsMap, setStadiumsMap] = useState<Map<string, string>>(new Map());
    
    useEffect(() => {
        const q = query(collection(firestore, "stadiums"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newStadiumsMap = new Map<string, string>();
            snapshot.forEach((doc) => {
                const stadium = doc.data() as Stadium;
                newStadiumsMap.set(doc.id, stadium.name);
            });
            setStadiumsMap(newStadiumsMap);
        });

        return () => unsubscribe();
    }, []);

    const getStadiumName = (stadiumId: string) => {
        return stadiumsMap.get(stadiumId) || `...`;
    }

  const badgeVariants: Record<Student['status'], string> = {
    active: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700",
    trial: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700",
    inactive: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700",
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      },
    }),
  };

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
            <EditStudentDialog student={student}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit className="mr-2 size-4" /> Edit Details
                </DropdownMenuItem>
            </EditStudentDialog>
        </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <Card>
        <CardHeader>
            <CardTitle>New Admissions</CardTitle>
            <CardDescription>The newest students who have joined your academy across all stadiums.</CardDescription>
        </CardHeader>
        <CardContent>
            {/* Desktop Table View */}
            <div className="rounded-xl border hidden md:block">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className="w-[40%]">Student</TableHead>
                        <TableHead>Stadium</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">
                        <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    <AnimatePresence>
                    {data.length > 0 ? data.map((student, i) => (
                        <MotionTableRow 
                            key={student.id}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            custom={i}
                            exit={{ opacity: 0 }}
                            layoutId={`student-row-${student.id}`}
                            className="hover:bg-muted/50 transition-colors"
                        >
                        <TableCell>
                            <div className="flex items-center gap-4">
                                <Avatar className="size-9">
                                <AvatarFallback>{student.fullName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="font-medium">{student.fullName}</div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="text-muted-foreground">{getStadiumName(student.stadiumId)}</div>
                        </TableCell>
                         <TableCell>
                            <div className="text-muted-foreground">
                                {student.joinDate?.toDate ? format(student.joinDate.toDate(), "dd MMM, yyyy") : 'N/A'}
                            </div>
                        </TableCell>
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
                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                No new admissions based on the selected filter.
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
                {data.length > 0 ? data.map((student, i) => (
                    <MotionCard
                        key={student.id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        custom={i}
                        exit={{ opacity: 0 }}
                        layoutId={`student-card-${student.id}`}
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
                                        <Badge variant="outline" className={cn(badgeVariants[student.status || 'active'], "capitalize mt-1")}>
                                            {student.status || 'Active'}
                                        </Badge>
                                    </div>
                                </div>
                                <StudentActions student={student} />
                            </div>

                            <div className="flex flex-col gap-2 text-sm text-muted-foreground border-t pt-3">
                                <div className="flex items-center gap-2">
                                    <MapIcon className="size-4" />
                                    <span>{getStadiumName(student.stadiumId)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="size-4" />
                                    <span>{student.joinDate?.toDate ? format(student.joinDate.toDate(), "dd MMM, yyyy") : 'N/A'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </MotionCard>
                )) : (
                     <div className="text-center py-16 text-muted-foreground col-span-full">
                        <p>No new admissions found.</p>
                    </div>
                )}
                </AnimatePresence>
            </div>
        </CardContent>
    </Card>
  );
}
