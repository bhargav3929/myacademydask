
"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Stadium } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface ToggleStadiumStatusDialogProps {
    stadium: Stadium;
    children: React.ReactNode;
}

export function ToggleStadiumStatusDialog({ stadium, children }: ToggleStadiumStatusDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const isActivating = stadium.status === 'inactive';
  const newStatus = isActivating ? 'active' : 'inactive';

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const stadiumDocRef = doc(firestore, `stadiums`, stadium.id);
      await updateDoc(stadiumDocRef, { status: newStatus });

      toast({
        title: `Stadium ${isActivating ? 'Activated' : 'Deactivated'}`,
        description: `The status for ${stadium.name} has been updated to ${newStatus}.`,
      });

    } catch (error: any) {
      console.error("Error toggling stadium status:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update the stadium's status. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will change the status of <span className="font-semibold text-primary">{stadium.name}</span> to <span className={cn("font-semibold", isActivating ? "text-green-600" : "text-destructive")}>{newStatus}</span>. 
            An inactive stadium cannot be selected when adding new students.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleToggle} 
            disabled={isLoading}
            className={cn(isActivating && "bg-green-600 hover:bg-green-700")}
          >
            {isLoading ? "Updating..." : `Yes, ${isActivating ? 'Activate' : 'Deactivate'}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
