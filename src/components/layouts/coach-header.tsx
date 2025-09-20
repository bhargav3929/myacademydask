
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

import {
  Bell,
  ChevronDown,
  Gamepad2,
  LogOut,
  Settings,
  User,
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
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";

export function CoachHeader() {
    const router = useRouter();
    const { authUser, signOut, loading } = useAuth();

    const handleLogout = async () => {
        await signOut();
    };

    const getInitials = (name: string) => {
        if (!name) return "";
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

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
                <AvatarFallback>
                    {loading ? (
                        <Skeleton className="size-8 rounded-full" />
                    ) : authUser ? (
                        getInitials(authUser.name) ? getInitials(authUser.name) : <User className="size-5" />
                    ) : (
                        <User className="size-5" />
                    )}
                </AvatarFallback>
              </Avatar>
              {loading ? (
                <div className="hidden md:flex flex-col items-start space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-28" />
                </div>
              ) : authUser && (
                 <div className="text-left hidden md:block">
                    <p className="text-sm font-medium">{authUser.name || "Coach"}</p>
                    <p className="text-xs text-muted-foreground">Coach</p>
                </div>
              )}
              <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
             {!loading && authUser && (
                <>
                    <DropdownMenuLabel>
                        <p>{authUser.name || "Coach"}</p>
                        <p className="text-xs text-muted-foreground font-normal">{authUser.email || "..."}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 size-4" />
                        <span>Logout</span>
                    </DropdownMenuItem>
                </>
             )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
