
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";

import {
  Bell,
  ChevronDown,
  Gamepad2,
  User,
  LogOut,
  Settings,
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
import { EditCoachProfileDialog } from "../coach/edit-coach-profile-dialog";
import { UserProfile } from "@/lib/types";

export function CoachHeader() {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (currentUser) {
                const userDocRef = doc(firestore, "users", currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setUser({ id: userDocSnap.id, ...userDocSnap.data() } as UserProfile);
                }
            } else {
                setUser(null);
                router.push('/login');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/login');
    };

    const getInitials = (name: string) => {
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
                    {loading ? <Skeleton className="size-8 rounded-full" /> : <User className="size-5" />}
                </AvatarFallback>
              </Avatar>
              {loading ? (
                <div className="hidden md:flex flex-col items-start space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-28" />
                </div>
              ) : user ? (
                 <div className="text-left hidden md:block">
                    <p className="text-sm font-medium">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              ) : null}
              <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
             {user && (
                <>
                    <DropdownMenuLabel>
                        <p>{user.fullName}</p>
                        <p className="text-xs text-muted-foreground font-normal">{user.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <EditCoachProfileDialog user={user} setUser={setUser}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Settings className="mr-2 size-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                    </EditCoachProfileDialog>
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
