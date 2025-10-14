"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { StadiumOwner } from "@/lib/super-admin-types";
import { format } from "date-fns";

interface ViewOwnerDetailsDialogProps {
  owner: StadiumOwner;
  children: React.ReactNode;
}

export function ViewOwnerDetailsDialog({ owner, children }: ViewOwnerDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const createdAt = owner.createdAt?.toDate ? format(owner.createdAt.toDate(), "PPP") : "Not Available";
  const lastLoginAt = owner.lastLoginAt?.toDate ? format(owner.lastLoginAt.toDate(), "PPP p") : "Not Available";
  const ownerEmail = `${owner.credentials.username}@owner.courtcommand.com`;

  const formatNumber = (value?: number) =>
    typeof value === "number" ? value.toLocaleString() : "0";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{owner.ownerName}</span>
            <Badge variant={owner.status === "active" ? "default" : "destructive"}>
              {owner.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Comprehensive account metrics and profile information for this stadium owner.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">Username</p>
              <p className="font-medium">{owner.credentials.username}</p>
            </div>
            <div className="rounded-lg border bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium truncate" title={ownerEmail}>{ownerEmail}</p>
            </div>
            <div className="rounded-lg border bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">Date Created</p>
              <p className="font-medium">{createdAt}</p>
            </div>
            <div className="rounded-lg border bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">Last Login</p>
              <p className="font-medium">{lastLoginAt}</p>
            </div>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border bg-background p-4">
              <p className="text-xs uppercase text-muted-foreground tracking-wide">Stadiums</p>
              <p className="text-2xl font-semibold">{formatNumber(owner.totalStadiums)}</p>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <p className="text-xs uppercase text-muted-foreground tracking-wide">Students</p>
              <p className="text-2xl font-semibold">{formatNumber(owner.totalStudents)}</p>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <p className="text-xs uppercase text-muted-foreground tracking-wide">Revenue</p>
              <p className="text-2xl font-semibold">
                {typeof owner.totalRevenue === "number"
                  ? owner.totalRevenue.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })
                  : "0"}
              </p>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
