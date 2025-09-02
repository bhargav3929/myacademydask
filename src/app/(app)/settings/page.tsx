
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { MotionDiv } from "@/components/motion";

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


export default function SettingsPage() {
    const { toast } = useToast();

    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            fullName: "Academy Director",
            email: "director@courtcommand.com",
        },
    });

    const organizationForm = useForm<OrganizationFormValues>({
        resolver: zodResolver(organizationFormSchema),
        defaultValues: {
            organizationName: "CourtCommand Academy",
        },
    });


  function onProfileSubmit(data: ProfileFormValues) {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been successfully updated.",
    })
  }

  function onOrganizationSubmit(data: OrganizationFormValues) {
    toast({
      title: "Organization Updated",
      description: "Your organization settings have been successfully saved.",
    })
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
                Manage your account and organization settings.
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
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
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
                                    <Input type="email" placeholder="your@email.com" {...field} className="max-w-sm" />
                                </FormControl>
                                <FormDescription>
                                    You can manage verified email addresses in your email settings.
                                </FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                             <Button type="submit">Update Profile</Button>
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
                    <form onSubmit={organizationForm.handleSubmit(onOrganizationSubmit)}>
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
                            <Button type="submit">Save Changes</Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </MotionDiv>
    </MotionDiv>
  );
}
