
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";

import { cn } from "@/lib/utils";
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
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type UserFormValue = z.infer<typeof formSchema>;

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSuccessfulLogin = async (uid: string) => {
    try {
      const userDocRef = doc(firestore, "users", uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === 'owner') {
          router.push("/dashboard");
        } else if (userData.role === 'coach') {
          router.push("/coach/dashboard");
        } else {
          // Fallback or error for unknown role
          router.push("/");
        }
      } else {
        // This case might happen if user document creation fails during signup
        throw new Error("User profile not found.");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "Could not retrieve user role.",
      });
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: UserFormValue) => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      await handleSuccessfulLogin(userCredential.user.uid);
    } catch (error) {
      const firebaseError = error as FirebaseError;
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: firebaseError.message || "An unexpected error occurred.",
      });
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        // Note: You'll need a robust way to handle new Google users vs. existing.
        // For simplicity, we assume they will be redirected correctly after a profile check.
        await handleSuccessfulLogin(result.user.uid);
    } catch (error) {
        const firebaseError = error as FirebaseError;
        toast({
            variant: "destructive",
            title: "Google Sign-In Failed",
            description: firebaseError.message || "Could not sign in with Google.",
        });
        setIsLoading(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-4"
        >
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
            {isLoading ? "Loading..." : "Login"}
          </Button>
        </form>
      </Form>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button variant="outline" className="w-full" disabled={isLoading} onClick={handleGoogleSignIn}>
        {isLoading ? "Loading..." : "Google"}
      </Button>
    </>
  );
}
