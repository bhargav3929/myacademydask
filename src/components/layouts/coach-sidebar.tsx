
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Gamepad2, LayoutDashboard, CalendarCheck, Users, Menu } from "lucide-react";
import { Sidebar, SidebarHeader, SidebarNav, SidebarNavLink, SidebarProvider as RootSidebarProvider, useSidebar, MobileNav as RootMobileNav, SidebarInset as RootSidebarInset } from "@/components/ui/sidebar";


export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <RootSidebarProvider>
            {children}
        </RootSidebarProvider>
    )
}

export const SidebarInset = ({ children }: { children: React.ReactNode }) => {
    return (
        <RootSidebarInset>
             {children}
        </RootSidebarInset>
    )
}

export function CoachSidebar() {
    const pathname = usePathname();

    const navItems = [
        { href: "/coach/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    ];

    return (
        <Sidebar>
            <SidebarHeader>
                 <Link href="/" className="flex items-center gap-2.5">
                    <Gamepad2 className="size-7 text-primary" />
                    <span className="text-lg font-bold">CourtCommand</span>
                </Link>
            </SidebarHeader>
            <SidebarNav>
                {navItems.map((item) => (
                    <SidebarNavLink 
                        key={item.href} 
                        href={item.href} 
                        active={pathname.startsWith(item.href)}
                    >
                        <item.icon className="size-4 mr-2" />
                        {item.label}
                    </SidebarNavLink>
                ))}
            </SidebarNav>
        </Sidebar>
    )
}

export const MobileNav = () => {
    const { isOpen, setIsOpen, isMobile } = useSidebar();
    if(!isMobile) return null;

    return (
        <div className="flex items-center justify-between mb-4">
            <button
                onClick={() => setIsOpen(!isOpen)} 
                className="p-2 -m-2 rounded-md hover:bg-muted"
            >
                <Menu />
            </button>
        </div>
    )
}
