
"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getFunctions, httpsCallable } from "firebase/functions";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

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
import { SaveButton } from "../ui/save-button";

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
  const formRef = useRef<HTMLFormElement>(null);

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

      console.log("Starting stadium creation for user:", user.uid);

      // Let's check if we already have valid claims before syncing
      let tokenResult = await user.getIdTokenResult(false);
      let role = (tokenResult.claims.role as string) || null;
      let organizationId = (tokenResult.claims.organizationId as string) || null;
      
      console.log("Initial claims - Role:", role, "OrganizationId:", organizationId);

      // Skip the broken syncUserRole function for now and go directly to Firestore
      console.log("⚠️ Skipping syncUserRole due to deployment issues - using direct Firestore approach");

      console.log("Current claims after processing - Role:", role, "OrganizationId:", organizationId);

      // Final fallback: hydrate role/org from Firestore user document and re-sync claims
      if (role !== "owner" || !organizationId) {
        console.log("Claims missing, checking Firestore user document...");
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as { role?: string; organizationId?: string };
            console.log("Firestore user data - Role:", data?.role, "OrganizationId:", data?.organizationId);
            
            if (data?.role === "owner" && data?.organizationId) {
              // We have valid data in Firestore, use it directly since syncUserRole is problematic
              console.log("✅ Using Firestore data directly - user is authenticated owner");
              role = "owner";
              organizationId = data.organizationId;
              
              // We have the correct data, let's proceed
              console.log("✅ Proceeding with validated owner data from Firestore");
            } else {
              throw new Error(`User document indicates role: ${data?.role}, organizationId: ${data?.organizationId}. Expected owner role with valid organizationId.`);
            }
          } else {
            throw new Error("User document not found in Firestore. Please contact support.");
          }
        } catch (firestoreError) {
          console.error("Firestore fallback error:", firestoreError);
          throw new Error(`Authentication verification failed: ${(firestoreError as Error).message}`);
        }
      }

      if (role !== "owner") {
        throw new Error(`Access denied. Current role: ${role}. Owner role required.`);
      }

      if (!organizationId) {
        throw new Error("Owner account not properly configured. Missing organization association. Please contact support.");
      }

      // Call our server-side API which uses Admin SDK (bypasses callable function)
      const apiResponse = await fetch('/api/stadiums/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const result = await apiResponse.json() as { success?: boolean; error?: string; message?: string; field?: string; };

      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        });
        form.reset();
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
      throw error;
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
            <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pr-6">
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
                
                <DialogFooter className="pt-4 flex-col md:flex-row gap-2 md:!justify-between">
                    <SaveButton
                        text={{
                            idle: "Create Stadium",
                            saving: "Creating...",
                            saved: "Created!"
                        }}
                        onSave={async () => await form.handleSubmit(onSubmit)()}
                        formRef={formRef}
                        onSuccess={() => setOpen(false)}
                    />
                    <Button type="button" variant="outline" onClick={() => setOpen(false)} className="w-full md:w-auto">Cancel</Button>
                </DialogFooter>
            </form>
            </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

