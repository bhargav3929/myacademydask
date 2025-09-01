
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

const registrationData = [
  {
    id: "#REG7487",
    student: {
      name: "Wade Warren",
      avatar: "https://i.pravatar.cc/150?u=wade",
    },
    joinDate: new Date(2024, 5, 22),
    stadium: "North City Arena",
    plan: "Pro Tier",
    monthlyFee: "$49.99",
    status: "Active",
    statusVariant: "success" as const,
  },
  {
    id: "#REG7488",
    student: {
      name: "Kristin Watson",
      avatar: "https://i.pravatar.cc/150?u=kristin",
    },
    joinDate: new Date(2024, 5, 21),
    stadium: "Downtown Center",
    plan: "Beginner",
    monthlyFee: "$29.99",
    status: "Trial",
    statusVariant: "warning" as const,
  },
  {
    id: "#REG7489",
    student: {
      name: "Robert Fox",
      avatar: "https://i.pravatar.cc/150?u=robert",
    },
    joinDate: new Date(2024, 5, 20),
    stadium: "Southside Complex",
    plan: "Pro Tier",
    monthlyFee: "$49.99",
    status: "Active",
    statusVariant: "success" as const,
  },
];

const badgeVariants = {
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
    info: "bg-blue-100 text-blue-800 border-blue-200",
    success: "bg-green-100 text-green-800 border-green-200",
}


export function RecentRegistrations() {
  return (
    <Card className="shadow-sm border-none">
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Registrations</CardTitle>
            <div className="flex gap-2">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search students..." className="pl-8 w-full md:w-[200px] lg:w-[320px]" />
                </div>
                <Button>
                    Export List
                    <FileDown className="ml-2 size-4" />
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
                {registrationData.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            <Image src={item.student.avatar} alt={item.student.name} width={24} height={24} className="rounded-full" />
                            <span>{item.student.name}</span>
                        </div>
                    </TableCell>
                    <TableCell>{format(item.joinDate, "dd MMM yyyy")}</TableCell>
                    <TableCell>{item.stadium}</TableCell>
                    <TableCell>{item.plan}</TableCell>
                    <TableCell>{item.monthlyFee}</TableCell>
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
                ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
  );
}
