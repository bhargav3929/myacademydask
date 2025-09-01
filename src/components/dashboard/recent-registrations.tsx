
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FileDown, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import Image from "next/image";
import { Input } from "../ui/input";
import { format } from "date-fns";

const registrationData: any[] = [
  // Data will be fetched from Firestore
];

const badgeVariants = {
    warning: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
    info: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    success: "bg-green-500/10 text-green-700 border-green-500/20",
}


export function RecentRegistrations() {
  return (
    <Card className="shadow-sm border-border/60">
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Registrations</CardTitle>
            <div className="flex gap-2">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search students..." className="pl-8 w-full md:w-[200px] lg:w-[320px]" />
                </div>
                <Button variant="outline">
                    <FileDown className="mr-2 size-4" />
                    Export List
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Assigned Stadium</TableHead>
                    <TableHead>Membership Plan</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                    <span className="sr-only">Actions</span>
                    </TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {registrationData.length > 0 ? registrationData.map((item) => (
                    <TableRow key={item.id} className="hover:bg-secondary/50">
                    <TableCell className="font-mono text-xs">{item.id}</TableCell>
                    <TableCell>
                        <div className="flex items-center gap-3">
                            <Image src={item.student.avatar} alt={item.student.name} width={28} height={28} className="rounded-full" />
                            <span className="font-medium">{item.student.name}</span>
                        </div>
                    </TableCell>
                    <TableCell>{format(item.joinDate, "dd MMM yyyy")}</TableCell>
                    <TableCell className="text-muted-foreground">{item.stadium}</TableCell>
                    <TableCell>{item.plan}</TableCell>
                    <TableCell className="font-medium">{item.monthlyFee}</TableCell>
                    <TableCell>
                        <Badge variant="outline" className={badgeVariants[item.statusVariant]}>{item.status}</Badge>
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
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>Edit Plan</DropdownMenuItem>
                            <DropdownMenuItem>Cancel Membership</DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                    </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                            No recent registrations to display.
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
  );
}
