
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp, collection, writeBatch } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, ShieldQuestion } from "lucide-react";

const formSchema = z.object({
  ownerName: z.string().min(2, "Owner name must be at least 2 characters."),
  // The email will be derived from the username to simplify the form
  username: z.string().min(3, "Username must be at least 3 characters.").regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type FormValues = z.infer<typeof formSchema>;

export function AddStadiumOwnerDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ownerName: "",
      username: "",
      password: ""
    },
    mode: "onBlur",
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    const superAdmin = auth.currentUser;
    if (!superAdmin) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in as a super admin." });
        setIsLoading(false);
        return;
    }

    // Derive a unique email for Firebase Auth from the username
    const ownerEmail = `${values.username}@owner.courtcommand.com`;

    try {
        // 1. Create the new owner's authentication account
        const userCredential = await createUserWithEmailAndPassword(auth, ownerEmail, values.password);
        const ownerUid = userCredential.user.uid;
        
        const batch = writeBatch(firestore);
        const timestamp = serverTimestamp();

        // 2. Create the Owner's profile in the 'stadium_owners' collection
        const ownerDocRef = doc(collection(firestore, "stadium_owners"));
        batch.set(ownerDocRef, {
            ownerName: values.ownerName,
            credentials: {
                username: values.username,
                // Do NOT store the password in Firestore
            },
            authUid: ownerUid, // Link to the auth user
            status: "active",
            createdBy: superAdmin.uid,
            createdAt: timestamp,
        });

        // 3. Create a corresponding user profile in the main 'users' collection
        // This allows them to log in via the main login page
        const userDocRef = doc(firestore, "users", ownerUid);
        batch.set(userDocRef, {
            uid: ownerUid,
            email: ownerEmail,
            username: values.username,
            fullName: values.ownerName,
            role: "owner",
            organizationId: ownerDocRef.id, // The organization ID is the new stadium_owner doc ID
            createdAt: timestamp,
        });

        await batch.commit();

        toast({
            title: "Success!",
            description: `Stadium Owner "${values.ownerName}" has been created.`,
        });

        form.reset();
        setOpen(false);

    } catch (error: any) {
        console.error("Owner creation failed:", error);
        let errorMessage = "An unexpected error occurred.";
        if (error.code === "auth/email-already-in-use") {
            errorMessage = "This username is already taken. Please choose a different one.";
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
          New Stadium Owner
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Stadium Owner</DialogTitle>
          <DialogDescription>
            This will create a new customer account with login credentials for the Owner Dashboard.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
            control={form.control}
            name="ownerName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Owner's Full Name</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., John Smith" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Login Username</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., johns_gym" {...field} />
                    </FormControl>
                    <FormDescription>
                        This is what the owner will use to log in.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Login Password</FormLabel>
                    <FormControl>
                        <Input type="password" placeholder="Must be at least 8 characters" {...field} />
                    </FormControl>
                     <FormDescription>
                        Share this password securely with the owner.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
            />
            
            <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isLoading || !form.formState.isValid}>
                    {isLoading ? "Creating Account..." : "Create Owner Account"}
                </Button>
            </DialogFooter>
        </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
