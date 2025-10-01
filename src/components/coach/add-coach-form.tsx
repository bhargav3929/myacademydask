'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';

const formSchema = z.object({
  email: z.string().email('Invalid email address.'),
  name: z.string().min(2, 'Name must be at least 2 characters.'),
});

type FormValues = z.infer<typeof formSchema>;

interface AddCoachFormProps {
  stadiumId: string;
  onCoachAdded: () => void;
  closeDialog: () => void;
}

export function AddCoachForm({ stadiumId, onCoachAdded, closeDialog }: AddCoachFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      name: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
        const stadiumRef = doc(firestore, 'stadiums', stadiumId);
        const stadiumSnap = await getDoc(stadiumRef);
        if(!stadiumSnap.exists()){
            throw new Error('Stadium not found');
        }
        const organizationId = stadiumSnap.data().organizationId;

      await addDoc(collection(firestore, 'users'), {
        email: values.email,
        name: values.name,
        role: 'coach',
        organizationId,
        assignedStadiums: [stadiumId],
        createdAt: serverTimestamp(),
      });

      toast({ title: 'Success', description: `Coach ${values.name} has been invited.` });
      onCoachAdded();
      closeDialog();
    } catch (error) {
      console.error('Error adding coach:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to add coach. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Jane Smith" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="e.g. coach@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Coach
          </Button>
        </div>
      </form>
    </Form>
  );
}
