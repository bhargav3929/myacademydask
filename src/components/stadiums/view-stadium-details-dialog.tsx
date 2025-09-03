
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Stadium } from "@/lib/types";
import { format } from "date-fns";
import { Building, MapPin, User, Mail, Phone, Calendar, Badge, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewStadiumDetailsDialogProps {
  stadium: Stadium;
  children: React.ReactNode;
}

const InfoField = ({ icon: Icon, label, value, children }: { icon: React.ElementType, label: string, value?: string | React.ReactNode, children?: React.ReactNode }) => (
    <div className="flex items-start gap-4">
        <div className="mt-1 text-muted-foreground">
            <Icon className="size-5" />
        </div>
        <div className="flex-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            {value && <p className="font-medium text-base text-foreground">{value}</p>}
            {children}
        </div>
    </div>
);

export function ViewStadiumDetailsDialog({ stadium, children }: ViewStadiumDetailsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md p-0">
        <DialogHeader className="p-6 pb-4">
            <div className="flex items-center gap-4">
                 <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                    <Building className="size-6 text-primary" />
                </div>
                <div>
                    <DialogTitle className="text-2xl">{stadium.name}</DialogTitle>
                    <DialogDescription>{stadium.location}</DialogDescription>
                </div>
            </div>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-y-5 px-6 pb-6 border-b">
            <InfoField 
                icon={Calendar} 
                label="Date Added" 
                value={stadium.createdAt ? format(stadium.createdAt.toDate(), "dd MMMM, yyyy") : "N/A"} 
            />
            <InfoField icon={Shield} label="Status">
                <Badge variant="outline" className={cn(stadium.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200', "capitalize text-sm")}>
                  {stadium.status}
                </Badge>
            </InfoField>
        </div>
        <div className="p-6">
            <h4 className="text-lg font-semibold mb-4 text-foreground">Assigned Coach Details</h4>
             <div className="grid grid-cols-1 gap-y-5">
                <InfoField icon={User} label="Name" value={stadium.coachDetails?.name} />
                <InfoField icon={Mail} label="Email" value={stadium.coachDetails?.email} />
                <InfoField icon={Phone} label="Phone" value={stadium.coachDetails?.phone} />
             </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
