
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase"; // Assuming you have a functions export

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
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";
import { Stadium } from "@/lib/types";

const formSchema = z.object({
  stadiumName: z.string().min(3, "Stadium name must be at least 3 characters."),
  location: z.string().min(3, "Location must be at least 3 characters."),
  coachEmail: z.string().email("Please enter a valid email for the coach."),
  coachPassword: z.string().min(6, "Password must be at least 6 characters."),
  coachFullName: z.string().min(2, "Please enter the coach's full name."),
});

type FormValues = z.infer<typeof formSchema>;

const MOCK_ORGANIZATION_ID = "mock-org-id-for-testing";

// Note: Ensure your firebase.ts exports 'functions' from 'firebase/functions'
// const createStadiumAndCoach = httpsCallable(functions, 'createStadiumAndCoach');
// Using fetch as a fallback if the above isn't set up
const CLOUD_FUNCTION_URL = "https://us-central1-courtcommand.cloudfunctions.net/createStadiumAndCoach";

export function AddStadiumDialog({ stadium }: { stadium?: Stadium }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stadiumName: stadium?.name || "",
      location: stadium?.location || "",
      coachEmail: "",
      coachPassword: "",
      coachFullName: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);

    try {
      const response = await fetch(CLOUD_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: MOCK_ORGANIZATION_ID,
          stadiumName: values.stadiumName,
          location: values.location,
          coachEmail: values.coachEmail,
          coachPassword: values.coachPassword,
          coachFullName: values.coachFullName,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: "Success!",
          description: `Stadium "${values.stadiumName}" and coach account created.`,
        });
        form.reset();
        setOpen(false);
      } else {
        throw new Error(result.error || "An unknown error occurred.");
      }

    } catch (error: any) {
      console.error("Error creating stadium and coach:", error);
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: error.message || "Could not create stadium. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Stadium
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add New Stadium & Coach</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new stadium and a dedicated coach account.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="stadiumName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stadium Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., North City Arena" {...field} />
                  </FormControl>
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
                  <FormControl>
                    <Input placeholder="e.g., Downtown Metro Area" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="coachFullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coach's Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="coachEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coach's Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="coach@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="coachPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Set Initial Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
           
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Create Stadium & Coach"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
