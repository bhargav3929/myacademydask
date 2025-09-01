
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
import { MoreHorizontal, ArrowDownToLine, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import Image from "next/image";
import { Input } from "../ui/input";

const shippingData = [
  {
    trackingId: "#RQ7487",
    deliverer: {
      name: "Wade Warren",
      avatar: "https://i.pravatar.cc/150?u=wade",
    },
    shippedDate: "22 June 2024",
    country: {
      name: "United States",
      flag: "https://flagcdn.com/w20/us.png",
    },
    weight: "2.8kg",
    price: "$24.05",
    status: "On the Way",
    statusVariant: "warning" as const,
  },
  {
    trackingId: "#RQ7488",
    deliverer: {
      name: "Kristin Watson",
      avatar: "https://i.pravatar.cc/150?u=kristin",
    },
    shippedDate: "21 June 2024",
    country: {
      name: "India",
      flag: "https://flagcdn.com/w20/in.png",
    },
    weight: "3.4kg",
    price: "$32.02",
    status: "In Transit",
    statusVariant: "info" as const,
  },
  {
    trackingId: "#RQ7489",
    deliverer: {
      name: "Robert Fox",
      avatar: "https://i.pravatar.cc/150?u=robert",
    },
    shippedDate: "20 June 2024",
    country: {
      name: "Germany",
      flag: "https://flagcdn.com/w20/de.png",
    },
    weight: "1.2kg",
    price: "$18.50",
    status: "Delivered",
    statusVariant: "success" as const,
  },
];

const badgeVariants = {
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
    info: "bg-blue-100 text-blue-800 border-blue-200",
    success: "bg-green-100 text-green-800 border-green-200",
}


export function ShippingList() {
  return (
    <Card className="shadow-sm border-none">
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Shipping list</CardTitle>
            <div className="flex gap-2">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search" className="pl-8 w-full md:w-[200px] lg:w-[320px]" />
                </div>
                <Button>
                    Download Data
                    <ArrowDownToLine className="ml-2 size-4" />
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Tracking ID</TableHead>
                    <TableHead>Deliver</TableHead>
                    <TableHead>Shipped Date</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                    <span className="sr-only">Actions</span>
                    </TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {shippingData.map((item) => (
                    <TableRow key={item.trackingId} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{item.trackingId}</TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            <Image src={item.deliverer.avatar} alt={item.deliverer.name} width={24} height={24} className="rounded-full" />
                            <span>{item.deliverer.name}</span>
                        </div>
                    </TableCell>
                    <TableCell>{item.shippedDate}</TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            <Image src={item.country.flag} alt={item.country.name} width={20} height={15} />
                            <span>{item.country.name}</span>
                        </div>
                    </TableCell>
                    <TableCell>{item.weight}</TableCell>
                    <TableCell>{item.price}</TableCell>
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
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
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
