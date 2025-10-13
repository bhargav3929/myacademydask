
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

import {
  Bell,
  ChevronDown,
  Settings,
  Search,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  User,
  Menu,
  X,
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
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

export function CoachHeader() {
  const router = useRouter();
  const { authUser, signOut, loading } = useAuth();
  const [supportDialogOpen, setSupportDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [administratorName, setAdministratorName] = useState<string | null>(null);
  const supportPhoneNumber = "+919553143929";
  const displayPhoneNumber = "+91 955 314 3929";
  const whatsappSupportUrl = "https://wa.link/c3p2m2";

  const handleLogout = async () => {
    await signOut();
  };

  const getDashboardUrl = () => {
    if (!authUser) return "/dashboard";
    return authUser.role === 'coach' ? '/coach/dashboard' : '/dashboard';
  };

  useEffect(() => {
    let isMounted = true;

    const fetchAdministratorName = async () => {
      if (!authUser || authUser.role !== "coach" || !authUser.organizationId) {
        if (isMounted) {
          setAdministratorName(null);
        }
        return;
      }

      try {
        const ownerDocRef = doc(firestore, "stadium_owners", authUser.organizationId);
        const ownerDocSnap = await getDoc(ownerDocRef);

        if (!isMounted) return;

        if (ownerDocSnap.exists()) {
          const data = ownerDocSnap.data() as { ownerName?: string; fullName?: string };
          const resolvedName = data?.ownerName || data?.fullName || null;
          setAdministratorName(resolvedName);
        } else {
          setAdministratorName(null);
        }
      } catch (error) {
        console.error("Failed to fetch administrator name:", error);
        if (isMounted) {
          setAdministratorName(null);
        }
      }
    };

    fetchAdministratorName();

    return () => {
      isMounted = false;
    };
  }, [authUser]);

  const handleSettingsSelect = () => {
    if (authUser?.role === "coach") {
      setSettingsDialogOpen(true);
      return;
    }
    router.push("/settings");
  };

  const handleSupportSelect = () => {
    setSupportDialogOpen(true);
  };

  const navItems = [
    { name: "Dashboard", url: getDashboardUrl(), icon: LayoutDashboard },
    { name: "Settings", url: "/settings", icon: Settings },
  ];

  const administratorDisplayName = administratorName?.trim() ? administratorName : "your administrator";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-30 flex h-20 items-center justify-between px-4 md:px-6">
        {/* Left section */}
        <div className="flex justify-start">
          <div className="flex items-center justify-center sm:justify-start bg-background/5 border border-border backdrop-blur-lg p-2 rounded-full shadow-lg h-12 w-12 sm:h-auto sm:w-auto">
            <Link href="/" className="flex items-center">
              <img src="/owner-logo.png" alt="Myacademydesk Logo" className="h-10 w-10 object-contain mr-0 sm:h-8 sm:w-auto sm:mr-2.5" />
              <span className="text-lg font-bold hidden sm:inline-block">Myacademydesk</span>
            </Link>
          </div>
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
                  {navItems.map((item) => {
                    if (item.name === "Settings") {
                      return (
                        <SheetClose asChild key={item.name}>
                          <button
                            type="button"
                            onClick={handleSettingsSelect}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                          >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                          </button>
                        </SheetClose>
                      );
                    }
                    return (
                      <SheetClose asChild key={item.name}>
                        <Link
                          href={item.url}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                        >
                          <item.icon className="h-4 w-4" />
                          {item.name}
                        </Link>
                      </SheetClose>
                    );
                  })}
                  <SheetClose asChild>
                    <button
                      type="button"
                      onClick={handleSupportSelect}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                    >
                      <LifeBuoy className="h-4 w-4" />
                      Support
                    </button>
                  </SheetClose>
                  <SheetClose asChild>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </SheetClose>
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
                      <DropdownMenuItem
                        onSelect={(event) => {
                          event.preventDefault();
                          handleSettingsSelect();
                        }}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={(event) => {
                          event.preventDefault();
                          handleSupportSelect();
                        }}
                      >
                        <LifeBuoy className="mr-2 h-4 w-4" />
                        Support
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={(event) => {
                          event.preventDefault();
                          handleLogout();
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <AlertDialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <AlertDialogContent className="sm:max-w-md overflow-hidden rounded-[28px] border border-border/50 bg-background/95 p-0 shadow-[0_28px_80px_-40px_rgba(15,23,42,0.65)] backdrop-blur-2xl">
          <div className="flex items-start justify-between gap-4 border-b border-border/60 bg-gradient-to-r from-primary/15 via-background/95 to-background px-6 py-5">
            <div className="space-y-1">
              <AlertDialogTitle className="text-lg font-semibold text-foreground">Administrator Access Required</AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
                Only administrators can edit settings for coach accounts. Contact{" "}
                <span className="font-medium text-foreground">{administratorDisplayName}</span> when you need changes to your profile or academy.
              </AlertDialogDescription>
            </div>
            <AlertDialogCancel asChild>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-muted-foreground transition hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close dialog</span>
              </button>
            </AlertDialogCancel>
          </div>
          <div className="space-y-6 px-6 py-6">
            <div className="rounded-2xl border border-border/60 bg-muted/40 px-4 py-4 text-sm leading-relaxed text-muted-foreground">
              Need help right away? Use the quick actions below to reach Bhargav directly.
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button asChild className="h-11 rounded-xl text-base font-medium shadow-sm">
                <a href={`tel:${supportPhoneNumber}`} rel="noopener noreferrer">
                  Call Bhargav
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-xl border-primary/30 text-base font-medium text-primary shadow-sm hover:bg-primary/10"
              >
                <a href={whatsappSupportUrl} target="_blank" rel="noopener noreferrer">
                  WhatsApp Message
                </a>
              </Button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={supportDialogOpen} onOpenChange={setSupportDialogOpen}>
        <AlertDialogContent className="sm:max-w-md overflow-hidden rounded-[28px] border border-border/50 bg-background/95 p-0 shadow-[0_28px_80px_-40px_rgba(15,23,42,0.65)] backdrop-blur-2xl">
          <div className="flex items-start justify-between gap-4 border-b border-border/60 bg-gradient-to-r from-primary/15 via-background/95 to-background px-6 py-5">
            <div className="space-y-1">
              <AlertDialogTitle className="text-lg font-semibold text-foreground">Need a Hand?</AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
                Reach out to Bhargav for queries, troubleshooting, or urgent issues. He is ready to assist you anytime.
              </AlertDialogDescription>
            </div>
            <AlertDialogCancel asChild>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-muted-foreground transition hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close dialog</span>
              </button>
            </AlertDialogCancel>
          </div>
          <div className="space-y-6 px-6 py-6">
            <div className="rounded-2xl border border-primary/25 bg-primary/5 px-4 py-4 text-sm leading-relaxed">
              <p className="text-muted-foreground">Primary Contact</p>
              <p className="text-lg font-semibold tracking-wide text-foreground">{displayPhoneNumber}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button asChild className="h-11 rounded-xl text-base font-medium shadow-sm">
                <a href={`tel:${supportPhoneNumber}`} rel="noopener noreferrer">
                  Call Bhargav
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-xl border-primary/30 text-base font-medium text-primary shadow-sm hover:bg-primary/10"
              >
                <a href={whatsappSupportUrl} target="_blank" rel="noopener noreferrer">
                  WhatsApp Message
                </a>
              </Button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
