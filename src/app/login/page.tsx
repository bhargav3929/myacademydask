
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
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

  const handleSuccessfulLogin = async (user: any) => {
    const userDocRef = doc(firestore, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
        // This can happen if auth user exists but firestore doc doesn't.
        // We can create it here if needed, or treat as an error.
        // For owner, we definitely want to create it.
        if (user.email === OWNER_EMAIL) {
            await setDoc(userDocRef, {
                uid: user.uid,
                email: OWNER_EMAIL,
                username: OWNER_USERNAME,
                fullName: "Academy Director",
                role: "owner",
                organizationId: MOCK_ORGANIZATION_ID,
                createdAt: serverTimestamp(),
            });
        } else {
             throw new Error("User profile not found in database.");
        }
    }
    
    const userRole = userDocSnap.exists() ? userDocSnap.data().role : "owner";

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
          throw new Error("Invalid credentials");
      }

      await signInWithEmailAndPassword(auth, emailToLogin, data.password)
        .then(async (userCredential) => {
            await handleSuccessfulLogin(userCredential.user);
        })
        .catch(async (error) => {
            // This is the special case for the very first login of the owner account.
            if (error.code === 'auth/user-not-found' && data.identifier === OWNER_USERNAME && data.password === OWNER_PASSWORD) {
                const userCredential = await createUserWithEmailAndPassword(auth, OWNER_EMAIL, OWNER_PASSWORD);
                // The handleSuccessfulLogin will create the firestore doc.
                await handleSuccessfulLogin(userCredential.user);
            } else {
                // For all other errors, show a generic message.
                throw new Error("Invalid credentials");
            }
        });

    } catch (error: any) {
        console.error("Login failed:", error);
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
