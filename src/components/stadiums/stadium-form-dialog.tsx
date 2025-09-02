
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDocs, collection, query, where, writeBatch, getDoc } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";

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
    mode: "onBlur",
  });

  const checkEmailExists = async (email: string) => {
    if (!email) return false;
    try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        return methods.length > 0;
    } catch (error) {
        return false;
    }
  };

  const checkStadiumNameExists = async (name: string, organizationId: string) => {
    if (!name || !organizationId) return false;
    const q = query(
        collection(firestore, "stadiums"), 
        where("name", "==", name), 
        where("organizationId", "==", organizationId)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }
   const checkUsernameExists = async (username: string) => {
    if (!username) return false;
    const q = query(collection(firestore, "users"), where("username", "==", username));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }


  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    
    const owner = auth.currentUser;
    if (!owner) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to create a stadium." });
        setIsLoading(false);
        return;
    }

    try {
        // Fetch the owner's organization ID from their user profile
        const ownerUserDocRef = doc(firestore, "users", owner.uid);
        const ownerUserDocSnap = await getDoc(ownerUserDocRef);
        if (!ownerUserDocSnap.exists()) {
            throw new Error("Owner user profile not found.");
        }
        const organizationId = ownerUserDocSnap.data().organizationId;
        if (!organizationId) {
            throw new Error("Organization ID is missing from owner profile.");
        }

        // 1. Create Coach Auth User
        const userCredential = await createUserWithEmailAndPassword(auth, values.coachEmail, values.coachPassword);
        const coachUid = userCredential.user.uid;
        
        const batch = writeBatch(firestore);
        const timestamp = serverTimestamp();

        // 2. Create Stadium Document
        const stadiumDocRef = doc(collection(firestore, "stadiums"));
        batch.set(stadiumDocRef, {
            name: values.stadiumName,
            location: values.location,
            organizationId: organizationId, // Use the fetched organizationId
            assignedCoachId: coachUid,
            coachDetails: {
                name: values.coachFullName,
                email: values.coachEmail,
                username: values.coachUsername,
                phone: values.coachPhone,
            },
            status: "active",
            createdAt: timestamp,
            updatedAt: timestamp,
        });

        // 3. Create User Profile in 'users' collection
        const userDocRef = doc(firestore, "users", coachUid);
        batch.set(userDocRef, {
            uid: coachUid,
            email: values.coachEmail,
            username: values.coachUsername,
            fullName: values.coachFullName,
            role: "coach",
            organizationId: organizationId, // Use the same organizationId
            assignedStadiums: [stadiumDocRef.id],
            createdAt: timestamp,
        });

        await batch.commit();

        toast({
            title: "Success!",
            description: `Stadium "${values.stadiumName}" created and assigned to ${values.coachFullName}.`,
        });

        form.reset();
        setOpen(false);

    } catch (error: any) {
        console.error("Stadium creation failed:", error);
        let errorMessage = "An unexpected error occurred. Please check the console.";
        if (error.code === "auth/email-already-in-use") {
            errorMessage = "This email is already registered to another coach.";
        }
        toast({
            variant: "destructive",
            title: "Creation Failed",
            description: errorMessage,
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { form.reset(); } setOpen(o); }}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Stadium
        </Button>
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
                        <Input 
                        placeholder="e.g., Champions Arena" 
                        {...field} 
                        onBlur={async (e) => {
                            field.onBlur();
                            const owner = auth.currentUser;
                            if (owner) {
                               const ownerUserDocRef = doc(firestore, "users", owner.uid);
                               const ownerUserDocSnap = await getDoc(ownerUserDocRef);
                               if (ownerUserDocSnap.exists()) {
                                   const orgId = ownerUserDocSnap.data().organizationId;
                                   if(await checkStadiumNameExists(e.target.value, orgId)) {
                                       form.setError("stadiumName", { type: "manual", message: "A stadium with this name already exists in your organization."});
                                   }
                               }
                            }
                        }}
                        />
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
                        <Input 
                        type="email" 
                        placeholder="coach@example.com" 
                        {...field}
                        onBlur={async (e) => {
                            field.onBlur();
                            if(e.target.value && await checkEmailExists(e.target.value)) {
                                form.setError("coachEmail", { type: "manual", message: "This email is already in use."});
                            }
                        }}
                        />
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
                            <Input 
                            placeholder="e.g., john_smith_1" 
                            {...field}
                            onBlur={async (e) => {
                                field.onBlur();
                                if(e.target.value && await checkUsernameExists(e.target.value)) {
                                    form.setError("coachUsername", { type: "manual", message: "This username is already taken."});
                                }
                            }}
                             />
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
                    <Button type="submit" disabled={isLoading || !form.formState.isValid}>
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
