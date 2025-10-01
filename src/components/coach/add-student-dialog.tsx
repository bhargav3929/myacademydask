'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AddStudentForm } from './add-student-form';
import { UserPlus } from 'lucide-react';

interface AddStudentDialogProps {
  stadiumId: string;
  onStudentAdded: () => void;
}

export function AddStudentDialog({ stadiumId, onStudentAdded }: AddStudentDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" /> Add Student
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Fill in the details below to enroll a new student.
          </DialogDescription>
        </DialogHeader>
        <AddStudentForm 
          stadiumId={stadiumId} 
          onStudentAdded={onStudentAdded}
          closeDialog={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
