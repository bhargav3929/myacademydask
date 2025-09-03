
"use client";

import { useState } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
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
import { Student } from "@/lib/types";

interface DeleteStudentDialogProps {
    student: Student;
    children: React.ReactNode;
}

export function DeleteStudentDialog({ student, children }: DeleteStudentDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const studentDocRef = doc(firestore, `stadiums/${student.stadiumId}/students`, student.id);
      await deleteDoc(studentDocRef);

      toast({
        title: "Student Deleted",
        description: `The record for ${student.fullName} has been permanently removed.`,
      });

    } catch (error: any) {
      console.error("Error deleting student:", error);
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: "Could not delete the student. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the student record for <span className="font-semibold text-primary">{student.fullName}</span> and all of their associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading} className="bg-destructive hover:bg-destructive/90">
            {isLoading ? "Deleting..." : "Yes, delete student"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
