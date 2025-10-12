
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

import {
  Bell,
  ChevronDown,
  Building,
  Settings,
  Users,
  Search,
  LayoutDashboard,
  FileText,
  LifeBuoy,
  LogOut,
  User,
  Menu,
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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { NavBar } from "../ui/tubelight-navbar";
import { Skeleton } from "../ui/skeleton";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

export function OwnerHeader() {
  const router = useRouter();
  const { authUser, signOut, loading } = useAuth();
  const [supportDialogOpen, setSupportDialogOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  const getDashboardUrl = () => {
    if (!authUser) return "/dashboard";
    return authUser.role === 'coach' ? '/coach/dashboard' : '/dashboard';
  };

  

  const ownerNavItems = [
    { name: "Dashboard", url: getDashboardUrl(), icon: LayoutDashboard },
    { name: "Stadiums", url: "/stadiums", icon: Building },
    { name: "Students", url: "/students", icon: Users },
    { name: "Reports", url: "/reports", icon: FileText },
    { name: "Settings", url: "/settings", icon: Settings },
  ];

  const coachNavItems = [
    { name: "Dashboard", url: getDashboardUrl(), icon: LayoutDashboard },
    { name: "Settings", url: "/settings", icon: Settings },
  ];

  const navItems = authUser?.role === 'coach' ? coachNavItems : ownerNavItems;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-30 flex h-20 items-center justify-between px-4 md:px-6 md:grid md:grid-cols-3">
        {/* Left section */}
        <div className="flex justify-start">
          <div className="flex items-center bg-background/5 border border-border backdrop-blur-lg p-2 rounded-full shadow-lg">
            <Link href="/" className="flex items-center">
              <img src="/owner-logo.png" alt="Owner Logo" className="h-8 w-auto object-contain mr-2.5" />
              <span className="text-lg font-bold hidden sm:inline-block">Myacademydesk</span>
            </Link>
          </div>
        </div>
        
        {/* Centered navigation */}
        <div className="hidden md:flex justify-center">
           {authUser && <NavBar items={navItems} />}
        </div>

        {/* Right section */}
        <div className="flex justify-end">
          <div className="flex items-center gap-2 bg-background/5 border border-border backdrop-blur-lg p-1 rounded-full shadow-lg">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full sm:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="w-full rounded-t-lg">
                <div className="grid gap-4 py-6">
                    <p className="text-lg font-bold text-center">Menu</p>
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.name}>
                        <Link
                          href={item.url}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                        >
                          <item.icon className="h-4 w-4" />
                          {item.name}
                        </Link>
                    </SheetClose>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            <div className="hidden sm:flex items-center">
                <Button variant="ghost" size="icon" className="rounded-full hidden md:flex">
                  <Search className="h-5 w-5" />
                  <span className="sr-only">Search</span>
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full hidden md:flex">
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Toggle notifications</span>
                </Button>
                <AlertDialog open={supportDialogOpen} onOpenChange={setSupportDialogOpen}>
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 rounded-full p-1.5 h-auto">
                          <Avatar className="size-8">
                            <AvatarFallback>
                              <User className="size-5" />
                            </AvatarFallback>
                          </Avatar>
                          <ChevronDown className="h-4 w-4 text-muted-foreground ml-1 hidden sm:block" />
                          <span className="sr-only">Toggle user menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        {loading ? (
                            <div className="p-2 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-full" />
                            </div>
                        ) : authUser && (
                            <>
                                <DropdownMenuLabel>
                                  <p>{authUser.name || "User"}</p>
                                  <p className="text-xs text-muted-foreground font-normal">{authUser.email || "..."}</p>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => router.push('/settings')}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <AlertDialogTrigger asChild>
                                     <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        <LifeBuoy className="mr-2 h-4 w-4" />
                                        Support
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </DropdownMenuItem>
                            </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Contact Support</AlertDialogTitle>
                            <AlertDialogDescription>
                                Please contact the developer Bhargav for any query.
                                <br />
                                <br />
                                Contact Number: <span className="font-bold text-foreground">955 314 3929</span>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Close</AlertDialogCancel>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
