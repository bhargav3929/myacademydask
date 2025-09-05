
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";

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
  LifeBuoy,
  LogOut,
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
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { NavBar } from "../ui/tubelight-navbar";

interface UserProfile {
    fullName: string;
    email: string;
}

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [supportDialogOpen, setSupportDialogOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
        if (currentUser) {
            // --- Step 1: Log Claims ---
            const idTokenResult = await currentUser.getIdTokenResult();
            console.log("--- User Token Claims ---", idTokenResult.claims);
            // -------------------------

            const userDocRef = doc(firestore, "users", currentUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                if (userData.role === 'owner') {
                    setUser(userData as UserProfile);
                }
            } else {
                 setUser({ fullName: "Academy Director", email: currentUser.email || ""});
            }
        }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

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
                    <DropdownMenuLabel>
                      <p>{user?.fullName || "Academy Director"}</p>
                      <p className="text-xs text-muted-foreground font-normal">{user?.email || "..."}</p>
                    </DropdownMenuLabel>
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
      </header>
    </>
  );
}

    