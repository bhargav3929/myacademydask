"use client";

import { useState } from "react";
import { toast } from "sonner";
import { doc, deleteDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DeleteStudentDialogProps {
  studentId: string;
  studentName: string;
  stadiumId: string;
  onStudentDeleted: () => void;
  children: React.ReactNode;
}

export function DeleteStudentDialog({
  studentId,
  studentName,
  stadiumId,
  onStudentDeleted,
  children,
}: DeleteStudentDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      // Corrected the Firestore path
      const studentRef = doc(firestore, `stadiums/${stadiumId}/students`, studentId);
      await deleteDoc(studentRef);
      toast.success(`${studentName || "The student"} has been deleted.`);
      onStudentDeleted();
      setIsOpen(false); // Close the dialog on success
    } catch (error) {
      console.error("Error deleting student: ", error);
      toast.error("Failed to delete student. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete {studentName || "this student"}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            student&apos;s account and remove their data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
