
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "@/lib/firebase";

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
  stadiumName: z.string().min(2, "Stadium name must be at least 2 characters."),
  location: z.string().min(2, "Location must be at least 2 characters."),
  coachEmail: z.string().email("Please enter a valid email for the coach."),
  coachPassword: z.string().min(6, "Password must be at least 6 characters."),
});

type FormValues = z.infer<typeof formSchema>;

const MOCK_ORGANIZATION_ID = "mock-org-id-for-testing";

export function AddStadiumDialog({ stadium }: { stadium?: Stadium }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stadiumName: "",
      location: "",
      coachEmail: "",
      coachPassword: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);

    try {
      const functions = getFunctions(app, 'us-central1'); // Make sure to use the correct region
      const createStadiumAndCoach = httpsCallable(functions, 'createStadiumAndCoach');
      
      const result = await createStadiumAndCoach({
        organizationId: MOCK_ORGANIZATION_ID,
        stadiumName: values.stadiumName,
        location: values.location,
        coachEmail: values.coachEmail,
        coachPassword: values.coachPassword,
        coachFullName: "Coach " + values.stadiumName, // Generating a placeholder name
      });

      if (result.data.success) {
        toast({
          title: "Success!",
          description: `Stadium "${values.stadiumName}" and a new coach account have been created.`,
        });
        form.reset();
        setOpen(false);
      } else {
        throw new Error(result.data.error || "An unknown error occurred.");
      }

    } catch (error: any) {
      console.error("Error creating stadium and coach:", error);
      toast({
        variant: "destructive",
        title: "Error",
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
      <DialogContent className="sm:max-w-[425px]">
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
                  <FormLabel>Coach's Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Stadium"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
