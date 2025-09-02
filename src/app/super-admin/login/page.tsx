
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Gamepad2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { MotionDiv } from "@/components/motion";

const SUPER_ADMIN_EMAIL = "superadmin@courtcommand.com";
const SUPER_ADMIN_PASSWORD = "superadmin123";

const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSuccessfulLogin = async (user: any) => {
    const userDocRef = doc(firestore, "super_admin_users", user.uid);
    let userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
        if (user.email === SUPER_ADMIN_EMAIL) {
            await setDoc(userDocRef, {
                uid: user.uid,
                email: SUPER_ADMIN_EMAIL,
                fullName: "Super Admin",
                role: "super_admin",
                permissions: ["create_organizations", "view_analytics", "manage_billing"],
                createdAt: serverTimestamp(),
            });
        }
    }
    
    toast({
      title: "Login Successful",
      description: "Redirecting to the Super Admin Dashboard...",
    });

    router.push('/super-admin/dashboard');
  }


  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    if (data.email !== SUPER_ADMIN_EMAIL) {
        toast({
            variant: "destructive",
            title: "Access Denied",
            description: "This email is not authorized for super admin access.",
        });
        setIsLoading(false);
        return;
    }
    
    try {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
        await handleSuccessfulLogin(userCredential.user);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found' && data.password === SUPER_ADMIN_PASSWORD) {
           const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
           await handleSuccessfulLogin(userCredential.user);
        } else {
            throw new Error("Invalid credentials");
        }
      }

    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Invalid credentials. Please check your email and password.",
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
        <Card className="w-full max-w-md shadow-2xl border-2 border-primary/20">
            <CardHeader className="text-center">
              <div className="flex items-center gap-2.5 justify-center mb-4">
                  <ShieldCheck className="h-8 w-8 text-primary" />
                  <span className="text-2xl font-bold">Super Admin</span>
              </div>
              <CardTitle className="text-2xl">SaaS Control Panel</CardTitle>
              <CardDescription>Sign in to manage CourtCommand.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="superadmin@courtcommand.com" {...field} />
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
                         <FormDescription>Default password: superadmin123</FormDescription>
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
