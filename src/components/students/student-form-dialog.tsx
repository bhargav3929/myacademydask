
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { collection, addDoc, serverTimestamp, doc, getDoc, Timestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";
import { Stadium, StudentBatches } from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { RainbowButton } from "../ui/rainbow-button";

const studentBatches: StudentBatches[] = ["First Batch", "Second Batch", "Third Batch", "Fourth Batch"];

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  stadiumId: z.string({ required_error: "Please select a stadium." }),
  batch: z.string({ required_error: "Please select a batch." }),
  joinDate: z.date({ required_error: "A join date is required." }),
  status: z.enum(['active', 'trial', 'inactive']),
  age: z.coerce.number().min(3, "Age must be at least 3.").max(100),
  contact: z.string().optional(),
  fees: z.coerce.number().positive("Fees must be a positive number."),
});

type FormValues = z.infer<typeof formSchema>;

export function AddStudentDialog({ stadiums }: { stadiums: Stadium[] }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: "",
      status: 'active',
      age: 0,
      contact: "",
      fees: 0,
      stadiumId: stadiums.length === 1 ? stadiums[0].id : undefined,
      batch: undefined,
      joinDate: new Date(),
    },
  });
  
  useEffect(() => {
    if (stadiums.length === 1) {
        form.setValue("stadiumId", stadiums[0].id);
    }
  }, [stadiums, form]);


  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    try {
      const stadiumDocRef = doc(firestore, "stadiums", values.stadiumId);
      const stadiumDocSnap = await getDoc(stadiumDocRef);

      if (!stadiumDocSnap.exists()) {
        throw new Error("Selected stadium not found in database.");
      }
      const selectedStadium = stadiumDocSnap.data() as Stadium;
      
      const studentCollectionRef = collection(firestore, `stadiums/${values.stadiumId}/students`);
      await addDoc(studentCollectionRef, {
        fullName: values.fullName,
        age: values.age,
        batch: values.batch,
        contact: values.contact || "",
        organizationId: selectedStadium.organizationId, // Inherit organizationId from the stadium
        joinDate: Timestamp.fromDate(values.joinDate),
        status: values.status,
        fees: values.fees,
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Success!",
        description: `Student "${values.fullName}" has been added.`,
      });
      form.reset();
      setOpen(false);

    } catch (error: any) {
      console.error("Error adding student:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not add student. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <RainbowButton>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Student
        </RainbowButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Fill in the details to enroll a new student in your academy.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
             <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="contact"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Contact Number (Optional)</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g., +15551234" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                  control={form.control}
                  name="fees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enrollment Fee</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 3000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <hr />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="stadiumId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Assign to Stadium</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger disabled={stadiums.length === 1}>
                                <SelectValue placeholder="Select a stadium" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {stadiums.map(stadium => (
                                <SelectItem key={stadium.id} value={stadium.id}>{stadium.name}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="batch"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Assign to Batch</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a batch" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {studentBatches.map(batch => (
                                <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>


            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="joinDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col mt-2">
                    <FormLabel>Join Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="trial">Trial</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!form.formState.isValid || isLoading}>
                {isLoading ? "Saving..." : "Add Student"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
