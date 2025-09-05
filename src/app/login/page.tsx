
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, firestore, functions } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";

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

const loginFormSchema = z.object({
  identifier: z.string().min(1, { message: "Please enter your email or username." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

// In a real app, this would come from the authenticated user's session
const MOCK_ORGANIZATION_ID = "mock-org-id-for-testing";
const OWNER_EMAIL = "director@courtcommand.com";
const OWNER_USERNAME = "admin";
const OWNER_PASSWORD = "admin123";


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const getEmailFromIdentifier = async (identifier: string): Promise<string | null> => {
    if (z.string().email().safeParse(identifier).success) {
        return identifier;
    }
    // Handle owner username specifically
    if (identifier.toLowerCase() === OWNER_USERNAME) {
        return OWNER_EMAIL;
    }
    // Handle other usernames
    const usersRef = collection(firestore, "users");
    const q = query(usersRef, where("username", "==", identifier));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null; 
    }
    return querySnapshot.docs[0].data().email;
  }
  
  const setInitialOwnerClaim = async () => {
    try {
        const setOwnerClaimFunction = httpsCallable(functions, 'setOwnerClaim');
        await setOwnerClaimFunction();
        console.log("Successfully set owner claim for initial setup.");
    } catch (error) {
        console.error("Failed to set owner claim:", error);
        // This might not be critical for the user to see, but good for debugging.
    }
  }

  const handleSuccessfulLogin = async (user: any, isInitialSetup: boolean = false) => {
    let userDocSnap = await getDoc(doc(firestore, "users", user.uid));

    if (isInitialSetup || !userDocSnap.exists()) {
        if (user.email === OWNER_EMAIL) {
            // This is the first time the owner is logging in.
            // Create their profile.
            await setDoc(doc(firestore, "users", user.uid), {
                uid: user.uid,
                email: OWNER_EMAIL,
                username: OWNER_USERNAME,
                fullName: "Academy Director",
                role: "owner", // Set role in Firestore document
                organizationId: MOCK_ORGANIZATION_ID,
                createdAt: serverTimestamp(),
            });
            
            // Set the custom claim in Auth for the new owner
            await setInitialOwnerClaim();
        } else if (!userDocSnap.exists()) {
             console.error("User profile not found in Firestore for:", user.uid);
             toast({
                variant: "destructive",
                title: "Login Failed",
                description: "User profile is missing. Please contact support.",
            });
            return;
        }
    }
    
    // **THE FIX**: Force refresh the ID token to get the latest custom claims.
    await user.getIdToken(true);
    const idTokenResult = await user.getIdTokenResult();
    const userRole = idTokenResult.claims.role;

    toast({
      title: "Login Successful",
      description: "Redirecting to your dashboard...",
    });

    if (userRole === 'coach') {
      router.push('/coach/dashboard');
    } else {
      router.push('/dashboard');
    }
  }


  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const emailToLogin = await getEmailFromIdentifier(data.identifier);
      
      if (!emailToLogin) {
          if(data.identifier.toLowerCase() === OWNER_USERNAME && data.password === OWNER_PASSWORD) {
              const userCredential = await createUserWithEmailAndPassword(auth, OWNER_EMAIL, data.password);
              await handleSuccessfulLogin(userCredential.user, true);
              return;
          }
          throw new Error("Invalid credentials");
      }

      try {
        const userCredential = await signInWithEmailAndPassword(auth, emailToLogin, data.password);
        await handleSuccessfulLogin(userCredential.user);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found' && data.identifier.toLowerCase() === OWNER_USERNAME && data.password === OWNER_PASSWORD) {
           const userCredential = await createUserWithEmailAndPassword(auth, OWNER_EMAIL, data.password);
           await handleSuccessfulLogin(userCredential.user, true);
        } else if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            throw new Error("Invalid credentials");
        } else {
             throw error;
        }
      }

    } catch (error: any) {
        console.error("Login failed:", error.message);
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Invalid credentials. Please check your username and password.",
        });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 p-4">
       <MotionDiv 
         initial={{ opacity: 0, y: -20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5 }}
       >
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
