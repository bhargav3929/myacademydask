
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { SignInCard2 } from "@/components/ui/sign-in-card-2";

const SUPER_ADMIN_EMAIL = "superadmin@courtcommand.com";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccessfulLogin = async (user: any) => {
    const userDocRef = doc(firestore, "super_admin_users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
            uid: user.uid,
            email: SUPER_ADMIN_EMAIL,
            fullName: "Super Admin",
            role: "super_admin",
            permissions: ["create_organizations", "view_analytics", "manage_billing"],
            createdAt: serverTimestamp(),
        });
    }
    
    toast({
      title: "Login Successful",
      description: "Redirecting to the Super Admin Dashboard...",
    });

    router.push('/super-admin/dashboard');
  }


  const onSubmit = async (data: {email: string, password: string}) => {
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
        const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
        await handleSuccessfulLogin(userCredential.user);
    } catch (error: any) {
        console.error("Super Admin Login Failed:", error);
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Invalid credentials. Please check your email and password.",
        });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    toast({
      title: "Feature Not Implemented",
      description: "Google Sign-In is not available for Super Admin.",
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/50 to-background" />
        <div 
            className="absolute inset-0 opacity-5"
            style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px'
            }}
        />
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-primary/10 blur-[80px]" />
        
       <SignInCard2 onSubmit={onSubmit} isLoading={isLoading} onGoogleSignIn={handleGoogleSignIn} />
    </div>
  );
}

