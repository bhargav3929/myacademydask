
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Gamepad2, LayoutDashboard, CalendarCheck } from "lucide-react";
import { Sidebar, SidebarHeader, SidebarNav, SidebarNavLink } from "@/components/ui/sidebar";

export function CoachSidebar() {
    const pathname = usePathname();

    const navItems = [
        { href: "/coach/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/coach/attendance", icon: CalendarCheck, label: "Attendance History" },
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
                        active={pathname === item.href}
                    >
                        <item.icon className="size-4" />
                        {item.label}
                    </SidebarNavLink>
                ))}
            </SidebarNav>
        </Sidebar>
    )
}
