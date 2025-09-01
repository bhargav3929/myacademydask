"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, writeBatch, serverTimestamp, collection } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
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
import { FirebaseError } from "firebase/app";

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  organizationName: z.string().min(2, { message: "Organization name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

type UserFormValue = z.infer<typeof formSchema>;

export function SignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      organizationName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: UserFormValue) => {
    setIsLoading(true);
    try {
      // Step 1: Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // Step 2: Create organization and user profile in Firestore using a batch write
      const batch = writeBatch(firestore);

      // Create a new organization document
      const orgRef = doc(collection(firestore, "organizations"));
      batch.set(orgRef, {
        name: data.organizationName,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      });

      // Create a new user document
      const userRef = doc(firestore, "users", user.uid);
      batch.set(userRef, {
        fullName: data.fullName,
        email: user.email,
        organizationId: orgRef.id,
        role: "owner", // Explicitly set the role for the owner
        createdAt: serverTimestamp(),
      });
      
      // Commit the batch
      await batch.commit();

      toast({
        title: "Account Created",
        description: "Your organization is ready. Redirecting to dashboard...",
      });
      
      router.push("/dashboard");

    } catch (error) {
      const firebaseError = error as FirebaseError;
      toast({
        variant: "destructive",
        title: "Sign Up Failed",
        description: firebaseError.message || "An unexpected error occurred.",
      });
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full space-y-4"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                    <Input placeholder="John Doe" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="organizationName"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Organization Name</FormLabel>
                <FormControl>
                    <Input placeholder="Ace Badminton Club" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter your email..."
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password..."
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button disabled={isLoading} className="ml-auto w-full" type="submit">
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
    </Form>
  );
}
