"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { generateFirestoreSecurityRules } from "@/ai/flows/generate-firestore-security-rules";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Wand2 } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { MotionDiv } from "../motion";

const formSchema = z.object({
  dataStructureDescription: z.string().min(20, "Please provide a more detailed data structure description."),
  userRolesDescription: z.string().min(20, "Please provide a more detailed user roles description."),
});

type FormValues = z.infer<typeof formSchema>;

export function SecurityRulesGenerator() {
  const [generatedRules, setGeneratedRules] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dataStructureDescription: `
Collections:
- users: Stores user profiles (uid, name, email, role: 'admin' or 'viewer').
- projects: Stores project details (projectId, name, ownerId).
- tasks: Sub-collection under projects (taskId, title, completed, assignedTo).
      `.trim(),
      userRolesDescription: `
User Roles:
- admin: Can read/write all data in 'projects' and 'tasks'. Can only read user profiles.
- viewer: Can only read data in 'projects' and 'tasks'. Cannot access user profiles except their own.
      `.trim(),
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setGeneratedRules("");
    try {
      const result = await generateFirestoreSecurityRules(values);
      setGeneratedRules(result.securityRules);
      toast({
        title: "Success!",
        description: "Firestore security rules generated successfully.",
      });
    } catch (error) {
      console.error("Error generating security rules:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate security rules. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="dataStructureDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium">Data Structure</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your collections, documents, and fields..."
                        className="h-48 resize-none font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userRolesDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium">User Roles & Permissions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe user roles and what they can access..."
                        className="h-48 resize-none font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Generating..." : <><Wand2 className="mr-2 h-4 w-4" /> Generate Rules</>}
              </Button>
            </form>
          </Form>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Generated Rules</h3>
            <MotionDiv
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative h-[436px] rounded-md border bg-card-foreground/5"
            >
              {isLoading ? (
                <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
              ) : (
                <pre className="h-full w-full overflow-auto rounded-md p-4">
                  <code className="text-sm text-foreground">
                    {generatedRules || "// Your generated rules will appear here..."}
                  </code>
                </pre>
              )}
            </MotionDiv>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
