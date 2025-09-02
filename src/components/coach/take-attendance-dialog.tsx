
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
import { CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { MiniCalendar } from "../ui/mini-calendar";

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

  const handleMarkAttendance = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedDate || !selectedBatch || !stadium || !auth.currentUser) return;

    setIsSubmitting(true);
    const batch = writeBatch(firestore);
    const dateStr = format(selectedDate, "yyyy-MM-dd");

    studentsInBatch.forEach((student) => {
      const status = attendance[student.id];
      if (status) { // Only write if a status is set
        const attendanceDocId = `${student.id}_${dateStr}`;
        const attendanceRef = doc(firestore, `stadiums/${stadium.id}/attendance`, attendanceDocId);
        batch.set(attendanceRef, {
          studentId: student.id,
          date: dateStr,
          status,
          batch: selectedBatch,
          markedByCoachId: auth.currentUser!.uid,
          organizationId: stadium.organizationId,
          stadiumId: stadium.id,
          timestamp: serverTimestamp(),
        }, { merge: true }); // Use merge to avoid overwriting unrelated data if doc exists
      }
    });

    try {
      await batch.commit();
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
        <Button variant="outline">
            <CalendarCheck className="mr-2 h-4 w-4" />
            Take Attendance
        </Button>
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
            </div>
            
            {/* Right Pane */}
            <div className="p-6 flex flex-col">
                <h3 className="font-semibold mb-4">Student List</h3>
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
                                    className={cn("transition-all", attendance[student.id] === 'present' ? 'bg-green-600 hover:bg-green-700' : '')}
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
