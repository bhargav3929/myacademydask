"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { doc, updateDoc, collection, getDocs, query, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Student, Stadium } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface ChangeBatchDialogProps {
  student: Student;
  stadiumId: string;
  onBatchChanged: () => void;
  children: React.ReactNode;
}

interface Batch {
  id: string;
  name: string;
}

export function ChangeBatchDialog({ student, stadiumId, onBatchChanged, children }: ChangeBatchDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newBatchName, setNewBatchName] = useState("");
  const [availableBatches, setAvailableBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingBatches, setIsFetchingBatches] = useState(false);

  useEffect(() => {
    const fetchBatches = async () => {
      if (!isOpen || !stadiumId) return;
      setIsFetchingBatches(true);
      try {
        // Fetch the stadium document to get the batches array
        const stadiumRef = doc(firestore, "stadiums", stadiumId);
        const stadiumSnap = await getDoc(stadiumRef);

        if (stadiumSnap.exists()) {
          const stadiumData = stadiumSnap.data() as Stadium;
          // The batches are stored in an array field called `batches`
          const batches = stadiumData.batches || []; 
          // batches is already an array of Batch objects with {id, name}
          setAvailableBatches(batches);
        } else {
          toast.error("Stadium details not found.");
        }
      } catch (error) {
        console.error("Error fetching batches: ", error);
        toast.error("Failed to fetch available batches.");
      } finally {
        setIsFetchingBatches(false);
      }
    };
    fetchBatches();
  }, [isOpen, stadiumId]);

  const handleChangeBatch = async () => {
    if (!newBatchName || newBatchName === student.batch) {
      toast.error("Please select a new, different batch.");
      return;
    }
    setIsLoading(true);
    try {
      const studentRef = doc(firestore, `stadiums/${stadiumId}/students`, student.id);
      await updateDoc(studentRef, { batch: newBatchName });

      toast.success("Student batch changed successfully!");
      onBatchChanged(); // This refreshes the student list
      setIsOpen(false);
    } catch (error) {
      console.error("Error changing batch: ", error);
      toast.error("Failed to change batch. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Batch for {student.fullName || "Unnamed Student"}</DialogTitle>
          <DialogDescription>Select a new batch for this student. This will update their assigned batch immediately.</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Current Batch</p>
            <p className="font-semibold text-lg">{student.batch || "N/A"}</p>
          </div>

          <div className="space-y-2">
             <label htmlFor="batch-select" className="text-sm font-medium">
                New Batch
              </label>
            {isFetchingBatches ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select onValueChange={setNewBatchName} value={newBatchName}>
                 <SelectTrigger id="batch-select">
                    <SelectValue placeholder="Select a new batch" />
                </SelectTrigger>
                <SelectContent>
                  {availableBatches.length > 0 ? (
                    availableBatches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.name} disabled={batch.name === student.batch}>
                        {batch.name}
                      </SelectItem>
                    ))
                  ) : (
                    <p className="p-4 text-sm text-muted-foreground">No batches found.</p>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        <div className="flex justify-end pt-4 gap-2 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleChangeBatch} disabled={isLoading || isFetchingBatches || !newBatchName}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
