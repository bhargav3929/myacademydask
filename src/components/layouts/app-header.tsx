
"use client";

import Link from "next/link";
import {
  Bell,
  ChevronDown,
  Building,
  Settings,
  Users,
  Search,
  LayoutDashboard,
  Gamepad2,
  FileText,
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
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { NavBar } from "../ui/tubelight-navbar";

export function AppHeader() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { name: "Stadiums", url: "/stadiums", icon: Building },
    { name: "Students", url: "/students", icon: Users },
    { name: "Reports", url: "/reports", icon: FileText },
    { name: "Settings", url: "/settings", icon: Settings },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-30 flex h-20 items-center justify-between px-4 md:px-6 md:grid md:grid-cols-3">
        {/* Left section */}
        <div className="flex justify-start">
          <div className="flex items-center gap-3 bg-background/5 border border-border backdrop-blur-lg p-2 rounded-full shadow-lg">
            <Link href="/" className="flex items-center gap-2.5">
              <Gamepad2 className="size-7 text-primary" />
              <span className="text-lg font-bold hidden sm:inline-block">CourtCommand</span>
            </Link>
          </div>
        </div>
        
        {/* Centered navigation */}
        <div className="flex justify-center">
            <NavBar items={navItems} />
        </div>

        {/* Right section (hidden on mobile) */}
        <div className="hidden md:flex justify-end">
          <div className="flex items-center gap-2 bg-background/5 border border-border backdrop-blur-lg p-1 rounded-full shadow-lg">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 rounded-full p-1.5 h-auto">
                  <Avatar className="size-8">
                    <AvatarImage src="https://i.pravatar.cc/150?u=owner" />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-muted-foreground ml-1 hidden sm:block" />
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p>Academy Director</p>
                  <p className="text-xs text-muted-foreground font-normal">admin@court.com</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </>
  );
}
