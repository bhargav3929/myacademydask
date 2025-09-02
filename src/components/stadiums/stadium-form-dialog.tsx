
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDocs, collection, query, where, writeBatch } from "firebase/firestore";
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
import { PlusCircle, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import { Checkbox } from "../ui/checkbox";
import { ScrollArea } from "../ui/scroll-area";

const formSchema = z.object({
  stadiumName: z.string().min(3, "Stadium name must be at least 3 characters."),
  location: z.string().min(3, "Location must be at least 3 characters."),
  coachFullName: z.string().min(2, "Coach's full name is required."),
  coachEmail: z.string().email("Please enter a valid email address."),
  coachPhone: z.string().min(10, "Please enter a valid phone number."),
  credentialsConfirmed: z.boolean().default(false).refine(val => val === true, {
    message: "You must confirm you have saved the credentials."
  }),
});

type FormValues = z.infer<typeof formSchema>;

// In a real app, this would come from the authenticated user's session
const MOCK_ORGANIZATION_ID = "mock-org-id-for-testing";

// Helper function to generate a random password
const generatePassword = () => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export function AddStadiumDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{ username: string; password: string} | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stadiumName: "",
      location: "",
      coachFullName: "",
      coachEmail: "",
      coachPhone: "",
      credentialsConfirmed: false,
    },
    mode: "onBlur",
  });

  const checkEmailExists = async (email: string) => {
    if (!email) return false;
    try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        return methods.length > 0;
    } catch (error) {
        // This can happen for invalid email formats etc. during typing.
        return false;
    }
  };

  const checkStadiumNameExists = async (name: string) => {
    if (!name) return false;
    const q = query(
        collection(firestore, "stadiums"), 
        where("name", "==", name), 
        where("organizationId", "==", MOCK_ORGANIZATION_ID)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }

  const handleGenerateCredentials = () => {
    const coachFullName = form.getValues("coachFullName");

    if(!coachFullName) {
        toast({ variant: "destructive", title: "Missing Info", description: "Please enter the Coach's Full Name first."});
        return;
    }

    // A more robust username generation
    const username = `${coachFullName.split(" ").join("_").toLowerCase()}_${Math.random().toString(36).substring(2, 6)}`;
    const password = generatePassword();
    setGeneratedCredentials({ username, password });
  }

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);

    if (!generatedCredentials) {
        toast({ variant: "destructive", title: "Credentials Not Generated", description: "Please generate credentials for the coach before submitting." });
        setIsLoading(false);
        return;
    }

    try {
        // 1. Create Coach Auth User
        const userCredential = await createUserWithEmailAndPassword(auth, values.coachEmail, generatedCredentials.password);
        const coachUid = userCredential.user.uid;

        // In a real app with backend functions, you would set custom claims here.
        // For this client-side approach, the 'role' is stored in the user document.
        
        const batch = writeBatch(firestore);
        const timestamp = serverTimestamp();

        // 2. Create Stadium Document
        const stadiumDocRef = doc(collection(firestore, "stadiums"));
        batch.set(stadiumDocRef, {
            name: values.stadiumName,
            location: values.location,
            organizationId: MOCK_ORGANIZATION_ID,
            assignedCoachId: coachUid,
            coachDetails: {
                name: values.coachFullName,
                email: values.coachEmail,
                username: generatedCredentials.username,
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
            fullName: values.coachFullName,
            role: "coach",
            organizationId: MOCK_ORGANIZATION_ID,
            assignedStadiums: [stadiumDocRef.id],
            createdAt: timestamp,
        });

        // Commit the batch
        await batch.commit();

        toast({
            title: "Success!",
            description: `Stadium "${values.stadiumName}" created and assigned to ${values.coachFullName}.`,
        });

        form.reset();
        setGeneratedCredentials(null);
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
    <Dialog open={open} onOpenChange={(o) => { if (!o) { form.reset(); setGeneratedCredentials(null); } setOpen(o); }}>
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
                            if(await checkStadiumNameExists(e.target.value)) {
                                form.setError("stadiumName", { type: "manual", message: "A stadium with this name already exists."});
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
                name="coachPhone"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Coach's Phone</FormLabel>
                    <FormControl><Input placeholder="+1234567890" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                
                {!generatedCredentials && (
                    <Button type="button" variant="outline" className="w-full" onClick={handleGenerateCredentials}>Generate Coach Credentials</Button>
                )}

                {generatedCredentials && (
                    <Alert variant="default" className="bg-primary/5 border-primary/20">
                        <AlertTriangle className="h-4 w-4 text-primary" />
                        <AlertDescription className="space-y-3">
                            <p className="font-semibold">Save these credentials securely!</p>
                            <div className="text-sm">
                                <span className="font-medium text-muted-foreground">Username:</span>
                                <span className="ml-2 font-mono p-1 rounded bg-muted">{generatedCredentials.username}</span>
                            </div>
                            <div className="text-sm flex items-center">
                                <span className="font-medium text-muted-foreground">Password:</span>
                                <div className="flex items-center ml-2 font-mono p-1 rounded bg-muted">
                                    <span>{showPassword ? generatedCredentials.password : '••••••••••'}</span>
                                    <Button type="button" variant="ghost" size="icon" className="h-5 w-5 ml-2" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                    </Button>
                                </div>
                            </div>
                            <FormField
                                control={form.control}
                                name="credentialsConfirmed"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md pt-4">
                                    <FormControl>
                                        <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            I have noted down the coach credentials.
                                        </FormLabel>
                                        <FormMessage />
                                    </div>
                                    </FormItem>
                                )}
                            />
                        </AlertDescription>
                    </Alert>
                )}
                <DialogFooter className="pt-4 !justify-between">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={isLoading || !generatedCredentials || !form.formState.isValid}>
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
