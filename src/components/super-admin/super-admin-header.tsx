
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { LogOut, ShieldCheck, ChevronDown, User, LayoutDashboard, Settings } from "lucide-react";
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";

export function SuperAdminHeader() {
    const router = useRouter();
    const pathname = usePathname();
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (currentUser && currentUser.email === 'superadmin@courtcommand.com') {
                setUserEmail(currentUser.email);
            } else {
                setUserEmail(null);
                if (pathname.startsWith('/super-admin') && pathname !== '/super-admin/login') {
                     router.push('/super-admin/login');
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router, pathname]);

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/super-admin/login');
    };
    
    const navItems = [
        { name: "Dashboard", href: "/super-admin/dashboard", icon: LayoutDashboard },
        // { name: "Owners", href: "/super-admin/owners", icon: User },
        // { name: "Settings", href: "/super-admin/settings", icon: Settings },
    ];

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <Link href="/super-admin/dashboard" className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span className="text-lg">Super Admin</span>
        </Link>
         <nav className="hidden md:flex items-center gap-2">
            {navItems.map(item => (
                <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        pathname === item.href ? "bg-muted text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                </Link>
            ))}
         </nav>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 rounded-full p-1 h-auto">
               <Avatar className="size-8">
                <AvatarFallback>
                    {loading ? <Skeleton className="size-8 rounded-full" /> : 'SA'}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium">Super Admin</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
             {userEmail && (
                <>
                    <DropdownMenuLabel>
                        <p>Super Admin</p>
                        <p className="text-xs text-muted-foreground font-normal">{userEmail}</p>
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
