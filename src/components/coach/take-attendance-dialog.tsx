
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { firestore, auth } from "@/lib/firebase";
import { Student, Stadium, StudentBatches, Attendance } from "@/lib/types";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarCheck, CheckCircle2, XCircle, CircleSlash } from "lucide-react";
import { cn } from "@/lib/utils";
import { MiniCalendar } from "../ui/mini-calendar";
import { RainbowButton } from "../ui/rainbow-button";

type AttendanceStatus = "present" | "absent";
type AttendanceRecord = { [studentId: string]: AttendanceStatus };

const studentBatches: StudentBatches[] = ["First Batch", "Second Batch", "Third Batch", "Fourth Batch"];

export function TakeAttendanceDialog({ stadium, allStudents }: { stadium: Stadium; allStudents: Student[] }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedBatch, setSelectedBatch] = useState<StudentBatches | "">("");
  const [studentsInBatch, setStudentsInBatch] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedBatch) {
      setStudentsInBatch(
        allStudents.filter((student) => student.batch === selectedBatch)
      );
    } else {
      setStudentsInBatch([]);
    }
    // Reset attendance when batch changes
    setAttendance({});
  }, [selectedBatch, allStudents]);

  const fetchAttendance = useCallback(async () => {
    if (!selectedDate || !selectedBatch || !stadium) return;
    setIsLoading(true);
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const attendanceQuery = query(
      collection(firestore, `stadiums/${stadium.id}/attendance`),
      where("date", "==", dateStr),
      where("batch", "==", selectedBatch)
    );
    try {
      const querySnapshot = await getDocs(attendanceQuery);
      const existingAttendance: AttendanceRecord = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Attendance;
        existingAttendance[data.studentId] = data.status;
      });
      setAttendance(existingAttendance);
    } catch (error) {
      console.error("Error fetching attendance: ", error);
      toast({ variant: "destructive", title: "Error", description: "Could not load existing attendance." });
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, selectedBatch, stadium, toast]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);
  
  const attendanceCounts = useMemo(() => {
    const counts = { present: 0, absent: 0, unmarked: 0 };
    if (studentsInBatch.length === 0) return counts;

    for (const student of studentsInBatch) {
      const status = attendance[student.id];
      if (status === 'present') {
        counts.present++;
      } else if (status === 'absent') {
        counts.absent++;
      }
    }
    counts.unmarked = studentsInBatch.length - (counts.present + counts.absent);
    return counts;
  }, [attendance, studentsInBatch]);

  const handleMarkAttendance = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedDate || !selectedBatch || !stadium || !auth.currentUser) return;

    setIsSubmitting(true);
    const dateStr = format(selectedDate, "yyyy-MM-dd");

    try {
      const dbBatch = writeBatch(firestore);

      // 1. Save individual student attendance records
      studentsInBatch.forEach((student) => {
        const status = attendance[student.id];
        if (status) {
          const attendanceDocRef = doc(
            firestore,
            `stadiums/${stadium.id}/attendance`,
            `${student.id}_${dateStr}`
          );
          dbBatch.set(
            attendanceDocRef,
            {
              studentId: student.id,
              date: dateStr,
              status,
              batch: selectedBatch,
              markedByCoachId: auth.currentUser!.uid,
              organizationId: stadium.organizationId,
              stadiumId: stadium.id,
              timestamp: serverTimestamp(),
            },
            { merge: true }
          );
        }
      });

      // 2. Add a record for the entire batch submission for the recent activities feed
      const submissionDocRef = doc(collection(firestore, "attendance_submissions"));
      dbBatch.set(submissionDocRef, {
        stadiumId: stadium.id,
        batch: selectedBatch,
        date: dateStr,
        submittedByCoachId: auth.currentUser.uid,
        timestamp: serverTimestamp(),
      });
      
      await dbBatch.commit();

      toast({
        title: "Success",
        description: `Attendance for ${selectedBatch} on ${format(selectedDate, "PPP")} has been saved.`,
      });
      setOpen(false);
    } catch (error) {
      console.error("Error saving attendance: ", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save attendance. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        type: 'spring',
        stiffness: 100,
      },
    }),
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <RainbowButton>
            <CalendarCheck className="mr-2 h-4 w-4" />
            Take Attendance
        </RainbowButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl p-0">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">
            {/* Left Pane */}
            <div className="p-6 border-r flex flex-col gap-6 bg-secondary/50">
                <DialogHeader className="text-left">
                    <DialogTitle>Take Attendance</DialogTitle>
                    <DialogDescription>
                        Select a date and batch to track attendance.
                    </DialogDescription>
                </DialogHeader>
                <MiniCalendar 
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                />
                 <div className="space-y-2">
                    <label className="text-sm font-medium">Batch</label>
                    <Select onValueChange={(value) => setSelectedBatch(value as StudentBatches)} value={selectedBatch}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a batch" />
                        </SelectTrigger>
                        <SelectContent>
                            {studentBatches.map(batch => (
                                <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 {selectedBatch && (
                    <div className="space-y-3 pt-2">
                        <h4 className="text-sm font-semibold text-muted-foreground">Attendance Summary</h4>
                        <div className="flex justify-between items-center rounded-lg border bg-background p-3 text-sm">
                            <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle2 className="size-5" />
                                <div>
                                    <div className="font-bold">{attendanceCounts.present}</div>
                                    <div className="text-xs">Present</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-red-600">
                                <XCircle className="size-5" />
                                <div>
                                    <div className="font-bold">{attendanceCounts.absent}</div>
                                    <div className="text-xs">Absent</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <CircleSlash className="size-5" />
                                <div>
                                    <div className="font-bold">{attendanceCounts.unmarked}</div>
                                    <div className="text-xs">Unmarked</div>
                                </div>
                            </div>
                        </div>
                    </div>
                 )}
            </div>
            
            {/* Right Pane */}
            <div className="p-6 flex flex-col">
                <h3 className="font-semibold mb-4">Student List ({studentsInBatch.length})</h3>
                <div className="flex-grow space-y-3 pr-2 overflow-y-auto max-h-[400px]">
                    <AnimatePresence>
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="size-9 rounded-full" />
                                        <Skeleton className="h-5 w-32" />
                                    </div>
                                    <div className="flex gap-2">
                                        <Skeleton className="h-9 w-20" />
                                        <Skeleton className="h-9 w-20" />
                                    </div>
                                </div>
                            ))
                        ) : studentsInBatch.length > 0 ? (
                            studentsInBatch.map((student, i) => (
                            <motion.div
                                key={student.id}
                                layout
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                custom={i}
                                className="flex items-center justify-between rounded-lg border bg-background p-3"
                            >
                                <div className="flex items-center gap-4">
                                <Avatar className="size-9">
                                    <AvatarFallback>{student.fullName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <p className="font-medium">{student.fullName}</p>
                                </div>
                                <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant={attendance[student.id] === 'present' ? 'default' : 'outline'}
                                    onClick={() => handleMarkAttendance(student.id, 'present')}
                                    className={cn("transition-all", attendance[student.id] === 'present' ? 'bg-green-600 hover:bg-green-700 text-white' : '')}
                                >
                                    Present
                                </Button>
                                <Button
                                    size="sm"
                                    variant={attendance[student.id] === 'absent' ? 'destructive' : 'outline'}
                                    onClick={() => handleMarkAttendance(student.id, 'absent')}
                                    className="transition-all"
                                >
                                    Absent
                                </Button>
                                </div>
                            </motion.div>
                            ))
                        ) : (
                           <div className="text-center py-12 text-muted-foreground h-full flex flex-col justify-center items-center">
                                {selectedBatch ? (
                                    <>
                                        <p>No students in {selectedBatch}.</p>
                                        <p className="text-sm">Use the "Add Student" button on the dashboard to enroll students.</p>
                                    </>
                                ) : (
                                    <p>Please select a date and batch to see students.</p>
                                )}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
                <DialogFooter className="pt-6 mt-auto">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="button" onClick={handleSaveAttendance} disabled={isLoading || isSubmitting || studentsInBatch.length === 0}>
                        {isSubmitting ? "Saving..." : "Save Attendance"}
                    </Button>
                </DialogFooter>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
