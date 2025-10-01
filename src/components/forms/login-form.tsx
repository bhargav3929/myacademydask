
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const formSchema = z.object({
  emailOrUsername: z
    .string()
    .min(1, { message: "This field is required." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailOrUsername: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    let email = values.emailOrUsername;

    if (!email.includes("@")) {
      try {
        const usersRef = collection(firestore, "users");
        const q = query(usersRef, where("username", "==", email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Invalid username or password. Please try again.",
          });
          setIsLoading(false);
          return;
        }

        email = querySnapshot.docs[0].data().email;
      } catch (error) {
        console.error("Username Lookup Error:", error);
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "An unexpected error occurred while verifying your username.",
        });
        setIsLoading(false);
        return;
      }
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, values.password);
      const user = userCredential.user;

      if (!user) {
        throw new Error("Authentication failed, user object is null.");
      }
      
      const idToken = await user.getIdToken();

      const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
          const errorData = await response.json();
          console.error("Server-side session error:", errorData);
          throw new Error('Failed to create session cookie.');
      }
      
      toast({
        title: "Login Successful",
        description: "You have been successfully logged in. Redirecting...",
      });

    } catch (error: any) {
      console.error("Login Process Error:", error);
      
      let description = "An unexpected error occurred. Please try again.";
      if (error.code === "auth/invalid-credential") {
        description = "Invalid credentials. Please try again.";
      } else if (error.message === 'Failed to create session cookie.') {
        description = "There was an issue creating your session on the server. Please try again.";
      }

      toast({
        variant: "destructive",
        title: "Login Failed",
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="emailOrUsername"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email or Username</FormLabel>
              <FormControl>
                <Input
                  placeholder="name@example.com or your_username"
                  {...field}
                  disabled={isLoading}
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
                  placeholder="••••••••"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>
      </form>
    </Form>
  );
}
