"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";

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
  name: z.string().min(2, "Stadium name must be at least 2 characters."),
  location: z.string().min(2, "Location must be at least 2 characters."),
});

type FormValues = z.infer<typeof formSchema>;

export function AddStadiumDialog({ stadium }: { stadium?: Stadium }) {
  const { userData } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: stadium?.name || "",
      location: stadium?.location || "",
    },
  });

  async function onSubmit(values: FormValues) {
    if (!userData?.organizationId) {
      toast({ variant: "destructive", title: "Error", description: "Organization not found." });
      return;
    }

    setIsLoading(true);

    try {
      // For now, only handles adding new stadiums. Editing would require doc(firestore, 'stadiums', stadium.id) and updateDoc.
      await addDoc(collection(firestore, "stadiums"), {
        ...values,
        organizationId: userData.organizationId,
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Success!",
        description: `Stadium "${values.name}" has been created.`,
      });

      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error adding stadium:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not create stadium. Please try again.",
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
          <DialogTitle>{stadium ? "Edit Stadium" : "Add New Stadium"}</DialogTitle>
          <DialogDescription>
            {stadium ? "Update the details of the stadium." : "Fill in the details for the new stadium."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
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
