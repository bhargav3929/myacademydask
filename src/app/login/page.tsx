
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, User } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, firestore, app } from "@/lib/firebase";
import { getFunctions, httpsCallable } from "firebase/functions";

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Gamepad2 } from "lucide-react";
import Link from "next/link";
import { MotionDiv } from "@/components/motion";

// force region to match backend
const functions = getFunctions(app, "us-central1");

const loginFormSchema = z.object({
  identifier: z.string().min(1, { message: "Please enter your email or username." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const MOCK_ORGANIZATION_ID = "mock-org-id-for-testing";
const OWNER_EMAIL = process.env.NEXT_PUBLIC_OWNER_EMAIL || "director@courtcommand.com";
const OWNER_USERNAME = "admin";
const OWNER_PASSWORD = "admin123";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const getEmailFromIdentifier = async (identifier: string): Promise<string | null> => {
    if (z.string().email().safeParse(identifier).success) return identifier;
    if (identifier.toLowerCase() === OWNER_USERNAME) return OWNER_EMAIL;
    const usersRef = collection(firestore, "users");
    const q = query(usersRef, where("username", "==", identifier));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    return querySnapshot.docs[0].data().email;
  };

  const handleSuccessfulLogin = async (user: User, isNewOwner: boolean) => {
    console.log(`Handling successful login for user: ${user.email}`);
    setIsLoading(true);

    try {
        if (isNewOwner) {
            console.log("New owner detected, setting custom claim...");
            const setOwnerClaim = httpsCallable(functions, "setOwnerClaim");
            await setOwnerClaim();
            console.log("`setOwnerClaim` function called. Forcing token refresh...");
            await user.getIdToken(true); // This is the critical step!
            console.log("Token refreshed.");
        }

        const finalTokenResult = await user.getIdTokenResult();
        const userRole = finalTokenResult.claims.role as string | undefined;

        console.log(`Final user role for redirection is: ${userRole}`);
        toast({ title: "Login Successful", description: "Redirecting to your dashboard..." });
        
        const targetUrl = userRole === 'coach' ? '/coach/dashboard' : '/dashboard';
        window.location.href = targetUrl; // Use full page reload to ensure all state is fresh

    } catch (error: any) {
        console.error("Error during login finalization:", error);
        toast({
            variant: "destructive",
            title: "Login Finalization Failed",
            description: error.message || "An unexpected error occurred during role verification.",
        });
        setIsLoading(false);
    }
  };


  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    let isNewOwner = false;
    try {
      let emailToLogin = await getEmailFromIdentifier(data.identifier);

      if (!emailToLogin) {
        if (data.identifier.toLowerCase() === OWNER_USERNAME && data.password === OWNER_PASSWORD) {
          console.log("Owner account not found. Creating new owner account.");
          isNewOwner = true;
          const userCredential = await createUserWithEmailAndPassword(auth, OWNER_EMAIL, data.password);
          
          const userDocRef = doc(firestore, "users", userCredential.user.uid);
          await setDoc(userDocRef, {
            uid: userCredential.user.uid,
            email: OWNER_EMAIL,
            username: OWNER_USERNAME,
            fullName: "Academy Director",
            role: "owner",
            organizationId: MOCK_ORGANIZATION_ID,
            createdAt: serverTimestamp(),
          });
          
          await handleSuccessfulLogin(userCredential.user, isNewOwner);
          return; // Exit after handling
        }
        throw new Error("Invalid credentials");
      }

      const userCredential = await signInWithEmailAndPassword(auth, emailToLogin, data.password);
      await handleSuccessfulLogin(userCredential.user, false);

    } catch (error: any) {
      console.error("Login onSubmit error:", error);
      let errorMessage = "Invalid credentials. Please check your username and password.";
      if (error.code !== 'auth/wrong-password' && error.code !== 'auth/user-not-found' && error.message) {
        errorMessage = error.message;
      }
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 p-4">
      <MotionDiv initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <Link href="/" className="flex items-center gap-2.5 justify-center mb-4">
              <Gamepad2 className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">CourtCommand</span>
            </Link>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to sign in to your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="identifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email or Username</FormLabel>
                      <FormControl>
                        <Input placeholder="name@example.com or your_username" {...field} />
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
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </MotionDiv>
    </div>
  );
}
