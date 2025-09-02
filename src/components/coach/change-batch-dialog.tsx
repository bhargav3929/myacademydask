
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Student, StudentBatches } from "@/lib/types";
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
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const studentBatches: StudentBatches[] = ["First Batch", "Second Batch", "Third Batch", "Fourth Batch"];

const formSchema = z.object({
  batch: z.string({ required_error: "Please select a new batch." }),
});

type FormValues = z.infer<typeof formSchema>;

interface ChangeBatchDialogProps {
    student: Student;
    stadiumId: string;
    children: React.ReactNode;
}

export function ChangeBatchDialog({ student, stadiumId, children }: ChangeBatchDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      batch: student.batch,
    },
  });

  async function onSubmit(values: FormValues) {
    if (values.batch === student.batch) {
        setOpen(false);
        return;
    }
    setIsLoading(true);
    try {
      const studentDocRef = doc(firestore, `stadiums/${stadiumId}/students`, student.id);
      await updateDoc(studentDocRef, { batch: values.batch });

      toast({
        title: "Success!",
        description: `${student.fullName}'s batch has been changed to ${values.batch}.`,
      });
      form.reset(values);
      setOpen(false);

    } catch (error: any) {
      console.error("Error changing batch:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not change the student's batch. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Batch for {student.fullName}</DialogTitle>
          <DialogDescription>
            Current Batch: <span className="font-semibold text-primary">{student.batch}</span>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
             <FormField
                control={form.control}
                name="batch"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>New Batch</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a batch" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {studentBatches.map(batch => (
                            <SelectItem key={batch} value={batch} disabled={batch === student.batch}>
                                {batch}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Change Batch"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
