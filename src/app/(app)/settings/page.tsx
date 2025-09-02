
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { auth } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MotionDiv } from "@/components/motion";
import { Skeleton } from "@/components/ui/skeleton";

const profileFormSchema = z.object({
  fullName: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email(),
});

const organizationFormSchema = z.object({
    organizationName: z.string().min(3, {
        message: "Organization name must be at least 3 characters.",
    }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type OrganizationFormValues = z.infer<typeof organizationFormSchema>;

// In a real app, this would come from the authenticated user's session
const MOCK_ORGANIZATION_ID = "mock-org-id-for-testing";


export default function SettingsPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);

    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            fullName: "",
            email: "",
        },
    });

    const organizationForm = useForm<OrganizationFormValues>({
        resolver: zodResolver(organizationFormSchema),
        defaultValues: {
            organizationName: "",
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // In a real app, you'd get this from auth.currentUser
                const userId = auth.currentUser?.uid || "mock-owner-id";

                // Fetch Profile Data
                const userDocRef = doc(firestore, "users", userId);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    profileForm.reset(userDocSnap.data() as ProfileFormValues);
                }

                // Fetch Organization Data
                const orgDocRef = doc(firestore, "organizations", MOCK_ORGANIZATION_ID);
                const orgDocSnap = await getDoc(orgDocRef);
                if (orgDocSnap.exists()) {
                    organizationForm.reset(orgDocSnap.data() as OrganizationFormValues);
                } else {
                    // Pre-populate with mock data if it doesn't exist for demonstration
                    const mockOrgData = { organizationName: "CourtCommand Academy" };
                    organizationForm.reset(mockOrgData);
                    await setDoc(orgDocRef, mockOrgData); // Create the doc for future updates
                }
            } catch (error) {
                console.error("Failed to fetch settings:", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Could not load your settings.",
                });
            } finally {
                setIsLoading(false);
            }
        };

        // Wait for auth to be initialized
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                fetchData();
            } else {
                // Handle case where user is not logged in
                setIsLoading(false);
            }
        });

        return () => unsubscribe();
    }, [profileForm, organizationForm, toast]);


  async function onProfileSubmit(data: ProfileFormValues) {
    try {
        const userId = auth.currentUser?.uid;
        if (!userId) throw new Error("User not authenticated");
        const userDocRef = doc(firestore, "users", userId);
        await updateDoc(userDocRef, { fullName: data.fullName });
        toast({
            title: "Profile Updated",
            description: "Your profile information has been successfully updated.",
        });
    } catch (error) {
         toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not update your profile. Please try again.",
        });
    }
  }

  async function onOrganizationSubmit(data: OrganizationFormValues) {
    try {
        const orgDocRef = doc(firestore, "organizations", MOCK_ORGANIZATION_ID);
        await updateDoc(orgDocRef, data);
        toast({
            title: "Organization Updated",
            description: "Your organization settings have been successfully saved.",
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not update your organization settings. Please try again.",
        });
    }
  }
  
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  };

  if (isLoading) {
      return (
          <div className="space-y-8">
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-72" />
              </div>
               <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full max-w-sm" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-10 w-full max-w-sm" />
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                     <Skeleton className="h-10 w-32" />
                </CardFooter>
            </Card>
             <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-72" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full max-w-sm" />
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                     <Skeleton className="h-10 w-32" />
                </CardFooter>
            </Card>
          </div>
      )
  }

  return (
    <MotionDiv 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
    >
        <MotionDiv variants={itemVariants}>
            <h2 className="text-3xl font-semibold tracking-tight">Settings</h2>
            <p className="text-muted-foreground">
                Manage your account and organization settings. The default owner account has username: <span className="font-bold text-primary">admin</span> and password: <span className="font-bold text-primary">admin123</span>.
            </p>
        </MotionDiv>

        <MotionDiv variants={itemVariants}>
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>
                        This is how others will see you on the site.
                    </CardDescription>
                </CardHeader>
                <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                        <CardContent className="space-y-4">
                            <FormField
                            control={profileForm.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Your Name" {...field} className="max-w-sm" />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={profileForm.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="your@email.com" {...field} className="max-w-sm" readOnly />
                                </FormControl>
                                <FormDescription>
                                    Your email address is used for logging in and cannot be changed.
                                </FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                             <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                                {profileForm.formState.isSubmitting ? "Saving..." : "Update Profile"}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </MotionDiv>
        
        <MotionDiv variants={itemVariants}>
            <Card>
                <CardHeader>
                    <CardTitle>Organization</CardTitle>
                    <CardDescription>
                        Manage your organization's details and settings.
                    </CardDescription>
                </CardHeader>
                 <Form {...organizationForm}>
                    <form onSubmit={organizationForm.handleSubmit(onOrganizationSubmit)} className="space-y-6">
                        <CardContent className="space-y-4">
                             <FormField
                                control={organizationForm.control}
                                name="organizationName"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Organization Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Your Academy Name" {...field} className="max-w-sm" />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                            <Button type="submit" disabled={organizationForm.formState.isSubmitting}>
                                {organizationForm.formState.isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </MotionDiv>
    </MotionDiv>
  );
}
