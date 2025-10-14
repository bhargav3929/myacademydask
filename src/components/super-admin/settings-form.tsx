"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

const settingsFormSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }).optional(),
  currency: z.enum(["INR", "USD", "EUR", "GBP", "AED"]),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export function SettingsForm() {
  const { currency, setCurrency } = useCurrency();
  const { authUser } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      username: authUser?.name || "",
      password: "",
      currency: currency,
    },
    mode: "onChange",
  });

  const updateOwnerPasswordFn = httpsCallable(functions, 'updateOwnerPassword');

  async function onSubmit(data: SettingsFormValues) {
    setIsSaving(true);
    try {
      setCurrency(data.currency);
      
      // Update password if a new password is provided and authenticated user is super admin
      if (data.password && authUser?.role === 'super-admin') {
            const updatePasswordResult : any = await updateOwnerPasswordFn({
                targetUid: authUser.uid, // Assuming you want super admins to be able to edit their own password
                newPassword: data.password,
            });
             if (!updatePasswordResult.data.success) {
                  throw new Error(updatePasswordResult.data.message || 'Failed to update password.');
              }
              toast({
                  title: "Password Updated",
                  description: "Your password has been updated successfully.",
              });
      }
      
      toast({
        title: "Settings updated",
        description: "Your settings have been updated successfully.",
      });
    } catch (error: any) {
        console.error("Error updating settings:", error);
        toast({
            variant: "destructive",
            title: "Settings Update Failed",
            description: error.message || "Could not update settings. Please try again.",
        });
    } finally {
        setIsSaving(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter your username" {...field} disabled={true} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
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
                <Input type="password" placeholder="Enter your new password" {...field} />
              </FormControl>
              <FormDescription>
                Leave blank to keep your current password.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                   <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="AED">AED (د.إ)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>

                </SelectContent>
              </Select>
              <FormDescription>
                Choose your preferred currency.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Updating..." : "Update settings"}
        </Button>
      </form>
    </Form>
  );
}
