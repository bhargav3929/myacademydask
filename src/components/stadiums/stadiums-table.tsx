
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { Stadium } from "@/lib/types";
import { format } from 'date-fns';
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

type StadiumsTableProps = {
  data: Stadium[];
};

export function StadiumsTable({ data }: StadiumsTableProps) {
  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Assigned Coach</TableHead>
            <TableHead>Date Added</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? data.map((stadium) => (
            <TableRow key={stadium.id}>
              <TableCell className="font-medium">{stadium.name}</TableCell>
              <TableCell>{stadium.location}</TableCell>
              <TableCell>{stadium.coachDetails?.name || 'N/A'}</TableCell>
              <TableCell>
                {stadium.createdAt ? format(stadium.createdAt.toDate(), 'PPP') : 'N/A'}
              </TableCell>
               <TableCell>
                <Badge variant={stadium.status === 'active' ? 'default' : 'destructive'} className={cn(stadium.status === 'active' ? 'bg-green-500/80' : 'bg-red-500/80')}>
                  {stadium.status}
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
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive">Deactivate</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                    No stadiums created yet. Click "New Stadium" to get started.
                </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
