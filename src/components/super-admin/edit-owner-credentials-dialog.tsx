"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { StadiumOwner } from "@/lib/super-admin-types";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  username: z
    .string()
    .min(3, "Username must contain at least 3 characters.")
    .regex(/^[a-z0-9_]+$/, "Use lowercase letters, numbers, or underscores."),
  password: z.union([
    z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(64, "Password cannot exceed 64 characters."),
    z.literal("").transform(() => undefined),
  ]),
});

type FormValues = z.infer<typeof formSchema>;

interface EditOwnerCredentialsDialogProps {
  owner: StadiumOwner;
  children: React.ReactNode;
}

export function EditOwnerCredentialsDialog({ owner, children }: EditOwnerCredentialsDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: owner.credentials.username,
      password: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (open) {
      form.reset({
        username: owner.credentials.username,
        password: "",
      });
    }
  }, [open, owner.credentials.username, form]);

  const handleSubmit = async (values: FormValues) => {
    const trimmedPassword = typeof values.password === "string" ? values.password.trim() : values.password;
    const trimmedUsername = values.username.trim().toLowerCase();

    if (
      trimmedUsername === owner.credentials.username &&
      (!trimmedPassword || trimmedPassword.length === 0)
    ) {
      toast({
        title: "No changes detected",
        description: "Update the username or password before saving.",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Call server-side API
      const response = await fetch('/api/super-admin/update-owner-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUid: owner.authUid,
          ownerDocId: owner.id,
          newUsername: trimmedUsername,
          newPassword: trimmedPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update credentials');
      }

      toast({
        title: "Credentials updated",
        description: "The owner can now sign in with the updated credentials.",
      });
      setOpen(false);
    } catch (error: any) {
      console.error("Failed to update owner credentials:", error);
      const errorMessage = error?.message || "Unable to update credentials. Try again later.";
      toast({
        variant: "destructive",
        title: "Update failed",
        description: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Owner Credentials</DialogTitle>
          <DialogDescription>
            Update the username and password used by {owner.ownerName} to access the owner dashboard.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., johns_gym" {...field} />
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
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Leave blank to keep current password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!form.formState.isValid || isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
