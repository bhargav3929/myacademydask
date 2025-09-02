
"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { StadiumOwner } from "@/lib/super-admin-types";
import { format } from 'date-fns';
import { Badge } from "../ui/badge";

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
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Reset Password</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive">Deactivate</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                    No Stadium Owners found. Click "New Stadium Owner" to add one.
                </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
