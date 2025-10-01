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

export function ViewStadiumDetailsDialog({ stadium, children }: ViewStadiumDetailsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl w-full mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle>Stadium Details</DialogTitle>
          <DialogDescription>
            Viewing details for {stadium.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center">
              <Building className="mr-2 h-5 w-5 text-primary" />
              Stadium Information
            </h3>
            <div className="space-y-2">
              <p className="flex items-start">
                <MapPin className="mr-2 mt-1 h-4 w-4 flex-shrink-0" />
                <span>{stadium.address}</span>
              </p>
              <p className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                <span>
                  Date Added: {stadium.dateAdded ? format(stadium.dateAdded.toDate(), "PPP") : "N/A"}
                </span>
              </p>
              <p className="flex items-center">
                <Badge
                  className={cn(
                    "capitalize",
                    stadium.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  )}
                >
                  <Shield className="mr-1 h-3 w-3" />
                  {stadium.status}
                </Badge>
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center">
              <User className="mr-2 h-5 w-5 text-primary" />
              Coach Information
            </h3>
            <div className="space-y-2">
              <p className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>{stadium.coachName}</span>
              </p>
              <p className="flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                <a href={`mailto:${stadium.coachEmail}`} className="hover:underline">
                  {stadium.coachEmail}
                </a>
              </p>
              <p className="flex items-center">
                <Phone className="mr-2 h-4 w-4" />
                <span>{stadium.coachPhone}</span>
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
