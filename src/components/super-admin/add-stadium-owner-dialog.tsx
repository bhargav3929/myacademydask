
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp, collection, writeBatch } from "firebase/firestore";
import { auth, firestore, functions } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";

const formSchema = z.object({
  ownerName: z.string().min(2, "Owner name must be at least 2 characters."),
  username: z.string().min(3, "Username must be at least 3 characters.").regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type FormValues = z.infer<typeof formSchema>;

const grantOwnerRole = httpsCallable(functions, 'grantOwnerRole');

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
    mode: "onChange",
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    const superAdmin = auth.currentUser;
    if (!superAdmin) {
        toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in as a super admin." });
        setIsLoading(false);
        return;
    }

    const ownerEmail = `${values.username}@owner.courtcommand.com`;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, ownerEmail, values.password);
        const ownerUid = userCredential.user.uid;
        
        const batch = writeBatch(firestore);
        const timestamp = serverTimestamp();

        const ownerDocRef = doc(collection(firestore, "stadium_owners"));
        batch.set(ownerDocRef, {
            ownerName: values.ownerName,
            credentials: { username: values.username },
            authUid: ownerUid,
            status: "active",
            createdBy: superAdmin.uid,
            createdAt: timestamp,
        });

        const userDocRef = doc(firestore, "users", ownerUid);
        const organizationId = ownerDocRef.id;
        batch.set(userDocRef, {
            uid: ownerUid,
            email: ownerEmail,
            username: values.username,
            fullName: values.ownerName,
            role: "owner",
            organizationId: organizationId,
            createdAt: timestamp,
        });

        await batch.commit();

        await grantOwnerRole({ 
            targetUid: ownerUid, 
            organizationId: organizationId 
        });


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
        } else if (error.message) {
            errorMessage = error.message;
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
                <Button type="submit" disabled={!form.formState.isValid || isLoading}>
                    {isLoading ? "Creating Account..." : "Create Owner Account"}
                </Button>
            </DialogFooter>
        </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
