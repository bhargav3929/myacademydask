
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { doc, updateDoc, writeBatch } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Stadium } from "@/lib/types";
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
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  name: z.string().min(3, "Stadium name must be at least 3 characters."),
  location: z.string().min(3, "Location must be at least 3 characters."),
  coachName: z.string().min(2, "Coach's name is required."),
  coachPhone: z.string().min(10, "A valid phone number is required."),
});

type FormValues = z.infer<typeof formSchema>;

interface EditStadiumDialogProps {
    stadium: Stadium;
    children: React.ReactNode;
}

export function EditStadiumDialog({ stadium, children }: EditStadiumDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: stadium.name,
      location: stadium.location,
      coachName: stadium.coachDetails.name,
      coachPhone: stadium.coachDetails.phone,
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      const batch = writeBatch(firestore);

      // 1. Update Stadium Document
      const stadiumDocRef = doc(firestore, `stadiums`, stadium.id);
      batch.update(stadiumDocRef, { 
        name: values.name,
        location: values.location,
        'coachDetails.name': values.coachName,
        'coachDetails.phone': values.coachPhone,
        updatedAt: new Date(),
       });

      // 2. Update User document for the coach
      const userDocRef = doc(firestore, 'users', stadium.assignedCoachId);
       batch.update(userDocRef, {
        fullName: values.coachName,
        // We don't update phone here unless it's a specific field on the user doc
      });

      await batch.commit();

      toast({
        title: "Success!",
        description: `Stadium "${values.name}" has been updated.`,
      });
      form.reset(values);
      setOpen(false);

    } catch (error: any) {
      console.error("Error updating stadium:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update stadium details. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { form.reset(); } setOpen(o); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Stadium: {stadium.name}</DialogTitle>
          <DialogDescription>
            Update the stadium and assigned coach's details.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <h4 className="text-sm font-semibold text-muted-foreground">Stadium Details</h4>
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Stadium Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <hr className="my-4"/>
            <h4 className="text-sm font-semibold text-muted-foreground">Coach Details</h4>
            <FormField
                control={form.control}
                name="coachName"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Coach Full Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="coachPhone"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Coach Phone</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />


            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
