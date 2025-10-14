"use client";

import { useState } from "react";
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

interface ToggleOwnerStatusDialogProps {
  owner: StadiumOwner;
  children: React.ReactNode;
}

export function ToggleOwnerStatusDialog({ owner, children }: ToggleOwnerStatusDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const isActive = owner.status === "active";
  const nextStatus = isActive ? "inactive" : "active";

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/super-admin/toggle-owner-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUid: owner.authUid,
          ownerDocId: owner.id,
          status: nextStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update status');
      }

      toast({
        title: isActive ? "Owner deactivated" : "Owner reactivated",
        description: isActive
          ? `${owner.ownerName} and their coaches have been signed out and can no longer access the platform.`
          : `${owner.ownerName} and their coaches can now access the platform again.`,
      });
      setOpen(false);
    } catch (error: any) {
      console.error("Failed to toggle owner status:", error);
      const errorMessage = error?.message || "Unable to update the owner status. Please try again.";
      toast({
        variant: "destructive",
        title: "Update failed",
        description: errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isActive ? "Deactivate Owner Account" : "Reactivate Owner Account"}</DialogTitle>
          <DialogDescription>
            {isActive
              ? `This will immediately sign out ${owner.ownerName}, disable their login, and revoke access for all associated coaches.`
              : `This will re-enable access for ${owner.ownerName} and all associated coaches.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={isActive ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? "Updating..." : isActive ? "Deactivate" : "Activate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
