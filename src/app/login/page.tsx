"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { SignInCard } from "@/components/ui/sign-in-card";
import { useRouter } from "next/navigation";
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

// Note: Metadata cannot be exported from client components
// For SEO, consider using next/head or creating a server component wrapper
// export const metadata: Metadata = {
//   title: 'Login - Sports Academy Management System',
//   description: 'Login to My Academy Desk to manage your sports academy. Access coach dashboards, athlete management, attendance tracking, and revenue analytics.',
//   keywords: ['my academy desk login', 'sports academy login', 'coach dashboard login', 'academy management login'],
//   openGraph: {
//     title: 'Login | My Academy Desk',
//     description: 'Login to manage your sports academy with My Academy Desk.',
//     url: 'https://myacademydask.com/login',
//     type: 'website',
//     images: [
//       {
//         url: '/landing-logo.png',
//         width: 1200,
//         height: 630,
//         alt: 'My Academy Desk Login',
//       },
//     ],
//   },
//   twitter: {
//     card: 'summary_large_image',
//     title: 'Login | My Academy Desk',
//     description: 'Login to manage your sports academy.',
//     images: ['/landing-logo.png'],
//   },
//   robots: {
//     index: false, // Don't index login pages
//     follow: true,
//   },
// }

export default function LoginPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const getEmailFromUsername = async (username: string): Promise<string | null> => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.error("Login Error: No user found with the provided username.");
        return null;
      }
      
      const userData = querySnapshot.docs[0].data();
      return userData.email as string;

    } catch (error) {
      console.error("Error fetching user by username:", error);
      return null;
    }
  };

  const onSubmit = async (data: { emailOrUsername: string, password: string }) => {
    setIsLoading(true);
    let email = data.emailOrUsername;

    try {
        if (!data.emailOrUsername.includes('@')) {
          const emailFromDb = await getEmailFromUsername(data.emailOrUsername);
          if (!emailFromDb) {
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: "Invalid username or password.",
            });
            setIsLoading(false);
            return;
          }
          email = emailFromDb;
        }
        
        const userCredential = await signInWithEmailAndPassword(auth, email, data.password);
        const user = userCredential.user;

        // 1. Call syncUserRole Cloud Function to ensure custom claims are set/updated
        const syncUserRoleFn = httpsCallable(functions, 'syncUserRole');
        const syncResult: any = await syncUserRoleFn(); // No data needed for syncUserRole function

        if (syncResult?.data?.error) {
          toast({
              variant: "destructive",
              title: "Login Failed",
              description: syncResult.data.message || "Failed to sync user role.",
          });
          setIsLoading(false);
          return;
        }

        // 2. Refresh the ID token *after* syncing to capture latest custom claims
        const tokenResult = await user.getIdTokenResult(true);
        const idToken = tokenResult.token;
        const roleFromClaims = tokenResult.claims.role as string | undefined;

        let role = (syncResult?.data?.role as string | undefined) ?? roleFromClaims;

        if (!role) {
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                const userData = userDoc.data();
                role = (userData?.role as string | undefined) ?? undefined;
            } catch (firestoreError) {
                console.error('Failed to read user role from Firestore fallback:', firestoreError);
            }
        }

        // 3. Call API route to create session cookie
        const sessionResponse = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken: idToken }),
        });

        if (!sessionResponse.ok) {
            const errorData = await sessionResponse.json();
            throw new Error(errorData.error || 'Failed to establish session.');
        }

        // 4. Redirect based on the role obtained from syncResult
        let targetUrl = '/dashboard'; // Default for owner
        if (role === 'coach') targetUrl = '/coach/dashboard';
        if (role === 'super-admin') targetUrl = '/super-admin/dashboard';

        toast({
            title: "Login Successful",
            description: "Redirecting...",
        });
        
        // Important: Use window.location.assign to force a full page reload
        // This ensures the middleware runs with the newly set session cookie.
        window.location.assign(targetUrl);

    } catch (error: any) {
      console.error("Login Failed:", error);
      toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message || "Invalid username or password.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/10 to-background" />
        <div 
            className="absolute inset-0 opacity-5"
            style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
        />
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-primary/5 blur-[80px]" />
      </div>
      <div className="z-10">
       <SignInCard onSubmit={onSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}
