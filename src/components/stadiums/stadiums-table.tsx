
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Eye, ToggleLeft, ToggleRight } from "lucide-react";
import { Stadium } from "@/lib/types";
import { format } from 'date-fns';
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { ViewStadiumDetailsDialog } from "./view-stadium-details-dialog";
import { EditStadiumDialog } from "./edit-stadium-dialog";
import { ToggleStadiumStatusDialog } from "./toggle-stadium-status-dialog";
import { Card, CardContent } from "../ui/card";
import { motion, AnimatePresence } from "framer-motion";

type StadiumsTableProps = {
  data: Stadium[];
};

export function StadiumsTable({ data }: StadiumsTableProps) {
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.05,
            type: "spring",
            stiffness: 100,
        },
        }),
    };
    const MotionTableRow = motion(TableRow);
    const MotionCard = motion(Card);

  const StadiumActions = ({ stadium }: { stadium: Stadium }) => (
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
        <ViewStadiumDetailsDialog stadium={stadium}>
             <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Eye className="mr-2 size-4" /> View Details
            </DropdownMenuItem>
        </ViewStadiumDetailsDialog>
        <EditStadiumDialog stadium={stadium}>
             <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Edit className="mr-2 size-4" /> Edit Stadium
            </DropdownMenuItem>
        </EditStadiumDialog>
        <ToggleStadiumStatusDialog stadium={stadium}>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className={cn(stadium.status === 'active' ? "text-destructive focus:text-destructive" : "text-green-600 focus:text-green-600")}>
                {stadium.status === 'active' ? (
                    <><ToggleLeft className="mr-2 size-4" /> Deactivate</>
                ) : (
                    <><ToggleRight className="mr-2 size-4" /> Activate</>
                )}
            </DropdownMenuItem>
        </ToggleStadiumStatusDialog>
        </DropdownMenuContent>
    </DropdownMenu>
    );

  return (
    <>
    {/* Desktop Table View */}
    <div className="rounded-xl border hidden md:block">
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
          <AnimatePresence>
          {data.length > 0 ? data.map((stadium, i) => (
            <MotionTableRow 
                key={stadium.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                custom={i}
            >
              <TableCell className="font-medium">{stadium.name}</TableCell>
              <TableCell>{stadium.location}</TableCell>
              <TableCell>{stadium.coachDetails?.name || 'N/A'}</TableCell>
              <TableCell>
                {stadium.createdAt ? format(stadium.createdAt.toDate(), 'PPP') : 'N/A'}
              </TableCell>
               <TableCell>
                <Badge variant="outline" className={cn(stadium.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200')}>
                  {stadium.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <StadiumActions stadium={stadium} />
              </TableCell>
            </MotionTableRow>
          )) : (
            <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                    No stadiums created yet. Click "New Stadium" to get started.
                </TableCell>
            </TableRow>
          )}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>

    {/* Mobile Card View */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
        <AnimatePresence>
            {data.map((stadium, i) => (
            <MotionCard
                key={stadium.id}
                layout
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                custom={i}
            >
                <CardContent className="p-4 flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="font-bold text-lg">{stadium.name}</p>
                            <p className="text-sm text-muted-foreground">{stadium.location}</p>
                        </div>
                        <StadiumActions stadium={stadium} />
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3">
                        <div className="flex flex-col">
                            <span className="text-xs">Coach</span>
                            <span className="font-semibold text-foreground">{stadium.coachDetails?.name || 'N/A'}</span>
                        </div>
                        <Badge variant="outline" className={cn(stadium.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200')}>
                            {stadium.status}
                        </Badge>
                    </div>
                </CardContent>
            </MotionCard>
            ))}
        </AnimatePresence>
    </div>

    </>
  );
}
