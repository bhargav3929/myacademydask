
"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { StadiumOwner } from "@/lib/super-admin-types";
import { format } from 'date-fns';
import { Badge } from "../ui/badge";
import { ViewOwnerDetailsDialog } from "./view-owner-details-dialog";
import { EditOwnerCredentialsDialog } from "./edit-owner-credentials-dialog";
import { ToggleOwnerStatusDialog } from "./toggle-owner-status-dialog";

type StadiumsTableProps = {
  data: StadiumOwner[];
};

export function StadiumOwnersTable({ data }: StadiumsTableProps) {
  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Owner Name</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Date Created</TableHead>
            <TableHead>Students</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? data.map((owner) => (
            <TableRow key={owner.id}>
              <TableCell className="font-medium">{owner.ownerName}</TableCell>
              <TableCell>{owner.credentials.username}</TableCell>
              <TableCell>
                {owner.createdAt ? format(owner.createdAt.toDate(), 'PPP') : 'N/A'}
              </TableCell>
              <TableCell>{owner.totalStudents ?? 0}</TableCell>
              <TableCell>
                <Badge variant={owner.status === 'active' ? 'default' : 'destructive'}>
                  {owner.status}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <ViewOwnerDetailsDialog owner={owner}>
                      <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                        View Details
                      </DropdownMenuItem>
                    </ViewOwnerDetailsDialog>
                    <EditOwnerCredentialsDialog owner={owner}>
                      <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                        Edit
                      </DropdownMenuItem>
                    </EditOwnerCredentialsDialog>
                    <ToggleOwnerStatusDialog owner={owner}>
                      <DropdownMenuItem
                        onSelect={(event) => event.preventDefault()}
                        className={
                          owner.status === "active"
                            ? "text-destructive focus:text-destructive"
                            : "text-green-600 focus:text-green-600"
                        }
                      >
                        {owner.status === "active" ? "Deactivate" : "Activate"}
                      </DropdownMenuItem>
                    </ToggleOwnerStatusDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                    No Stadium Owners found. Click "New Stadium Owner" to add one.
                </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
