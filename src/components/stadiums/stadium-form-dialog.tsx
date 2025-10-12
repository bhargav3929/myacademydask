
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "@/lib/firebase";

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
import { ScrollArea } from "../ui/scroll-area";
import { RainbowButton } from "../ui/rainbow-button";

const formSchema = z.object({
  stadiumName: z.string().min(3, "Stadium name must be at least 3 characters."),
  location: z.string().min(3, "Location must be at least 3 characters."),
  coachFullName: z.string().min(2, "Coach's full name is required."),
  coachEmail: z.string().email("Please enter a valid email address."),
  coachPhone: z.string().min(10, "Please enter a valid phone number."),
  coachUsername: z.string().min(3, "Username must be at least 3 characters.").regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores."),
  coachPassword: z.string().min(8, "Password must be at least 8 characters."),
});

type FormValues = z.infer<typeof formSchema>;

export function AddStadiumDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stadiumName: "",
      location: "",
      coachFullName: "",
      coachEmail: "",
      coachPhone: "",
      coachUsername: "",
      coachPassword: ""
    },
    mode: "onChange",
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    
    try {
      // Ensure correct region and fresh auth claims before calling the function
      const user = auth.currentUser;
      if (!user) {
        throw new Error("You must be signed in to perform this action.");
      }

      // Force-refresh token and verify required claims (role + organizationId)
      let tokenResult = await user.getIdTokenResult(true);
      let role = (tokenResult.claims.role as string) || null;
      let organizationId = (tokenResult.claims.organizationId as string) || null;

      if (!role || !organizationId) {
        try {
          const regionalFunctions = getFunctions(undefined, "us-central1");
          const syncUserRole = httpsCallable(regionalFunctions, "syncUserRole");
          await syncUserRole();
          tokenResult = await user.getIdTokenResult(true);
          role = (tokenResult.claims.role as string) || null;
          organizationId = (tokenResult.claims.organizationId as string) || null;
        } catch (_) {
          // If sync fails, fall through and show a helpful error below
        }
      }

      if (role !== "owner" || !organizationId) {
        throw new Error("Only authenticated owners can perform this action.");
      }

      const functions = getFunctions(undefined, "us-central1");
      const createStadiumAndCoach = httpsCallable(functions, 'createStadiumAndCoach');
      
      const response = await createStadiumAndCoach(values);
      const result = response.data as { success?: boolean; error?: string; message?: string; field?: string; };

      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        });
        form.reset();
        setOpen(false);
      } else {
        // Handle specific field errors returned from the backend
        if (result.field && (result.field === 'stadiumName' || result.field === 'coachEmail' || result.field === 'coachUsername')) {
          form.setError(result.field as keyof FormValues, { 
            type: "manual", 
            message: result.message 
          });
        } else {
          // Handle generic errors
          throw new Error(result.message || "An unknown error occurred.");
        }
      }
    } catch (error: any) {
      console.error("Stadium creation failed:", error);
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: error.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { form.reset(); } setOpen(o); }}>
      <DialogTrigger asChild>
        <RainbowButton>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Stadium
        </RainbowButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Stadium</DialogTitle>
          <DialogDescription>
            This will create a new stadium and a dedicated coach account.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-1">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pr-6">
                <FormField
                control={form.control}
                name="stadiumName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Stadium Name</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Champions Arena" {...field} />
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
                    <FormControl><Input placeholder="e.g., North Downtown" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <hr/>
                <h3 className="font-semibold text-sm">Coach Details</h3>
                <FormField
                control={form.control}
                name="coachFullName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Coach's Full Name</FormLabel>
                    <FormControl><Input placeholder="e.g., John Smith" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="coachPhone"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Coach's Phone</FormLabel>
                    <FormControl><Input placeholder="+1234567890" {...field} /></FormControl>
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
                    name="coachUsername"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Coach's Username</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., john_smith_1" {...field} />
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
                        <FormLabel>Set Coach Password</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder="Must be at least 8 characters" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                
                <DialogFooter className="pt-4 !justify-between">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Creating..." : "Create Stadium"}
                    </Button>
                </DialogFooter>
            </form>
            </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
