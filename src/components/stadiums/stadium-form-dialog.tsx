
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
    mode: "onBlur",
  });

  const checkEmailExistsOnClient = async (email: string) => {
    if (!email) return false;
    const q = query(collection(firestore, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
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
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to create a stadium." });
        setIsLoading(false);
        return;
    }

    try {
        const token = await currentUser.getIdToken(true); // Force refresh token to get latest claims
        
        const ownerUserDocRef = doc(firestore, "users", currentUser.uid);
        const ownerUserDocSnap = await getDoc(ownerUserDocRef);
        if (!ownerUserDocSnap.exists()) {
            throw new Error("Owner user profile not found.");
        }
        const organizationId = ownerUserDocSnap.data().organizationId;
        if (!organizationId) {
            throw new Error("Organization ID is missing from owner profile.");
        }

        if (await checkStadiumNameExists(values.stadiumName, organizationId)) {
            form.setError("stadiumName", { type: "manual", message: "A stadium with this name already exists in your organization."});
            setIsLoading(false);
            return;
        }

        const createCoachUserUrl = 'https://us-central1-courtcommand.cloudfunctions.net/createCoachUser';
        const response = await fetch(createCoachUserUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                email: values.coachEmail,
                password: values.coachPassword,
                displayName: values.coachFullName,
                coachUsername: values.coachUsername,
            }),
        });

        const resultData = await response.json();

        if (!response.ok) {
            throw new Error(resultData.message || 'Failed to create coach user from backend.');
        }
        
        const coachUid = resultData.uid;
        
        const batch = writeBatch(firestore);
        const timestamp = serverTimestamp();

        const stadiumDocRef = doc(collection(firestore, "stadiums"));
        batch.set(stadiumDocRef, {
            name: values.stadiumName,
            location: values.location,
            organizationId: organizationId,
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

        const userDocRef = doc(firestore, "users", coachUid);
        batch.update(userDocRef, { // Use update instead of set to avoid overwriting existing doc
            organizationId: organizationId,
            assignedStadiums: [stadiumDocRef.id],
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
        let errorMessage = error.message || "An unexpected error occurred. Please try again.";
        
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
                        <Input 
                        placeholder="e.g., Champions Arena" 
                        {...field} 
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
                        readOnly
                        onFocus={(e) => e.target.removeAttribute('readonly')}
                        onBlur={async (e) => {
                            field.onBlur();
                            if(e.target.value && await checkEmailExistsOnClient(e.target.value)) {
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
                            readOnly
                            onFocus={(e) => e.target.removeAttribute('readonly')}
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
