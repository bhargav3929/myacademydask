"use client";

import { ReactNode, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AddCoachForm } from "./add-coach-form"; // Corrected import

interface AddCoachDialogProps {
    onCoachAdded?: () => void; // Optional callback
    children: ReactNode;
}

export function AddCoachDialog({ onCoachAdded, children }: AddCoachDialogProps) {
    const [open, setOpen] = useState(false);

    const handleCoachAdded = () => {
        onCoachAdded?.();
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Coach</DialogTitle>
                </DialogHeader>
                <AddCoachForm 
                    onSuccess={handleCoachAdded} 
                />
            </DialogContent>
        </Dialog>
    )
}
