
"use client";

import Link from "next/link";
import {
  Bell,
  ChevronDown,
  Gamepad2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function CoachHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-lg md:px-6">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2.5">
          <Gamepad2 className="size-7 text-primary" />
          <span className="text-lg font-bold">CourtCommand</span>
        </Link>
      </div>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial">
        </div>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 rounded-full p-1 h-auto">
               <Avatar className="size-8">
                <AvatarImage src="https://i.pravatar.cc/150?u=coach" />
                <AvatarFallback>C</AvatarFallback>
              </Avatar>
              <div className="text-left hidden md:block">
                <p className="text-xs font-medium">John Doe</p>
                <p className="text-xs text-muted-foreground">coach@court.com</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
