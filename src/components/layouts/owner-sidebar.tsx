
"use client";

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart2, Building, Shield } from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Icons } from '@/components/icons';

export function OwnerSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: '/dashboard', icon: <BarChart2 />, label: 'Dashboard' },
    { href: '/stadiums', icon: <Building />, label: 'Stadiums' },
    { href: '/security-rules', icon: <Shield />, label: 'Security Rules' },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Icons.logo className="size-7 text-primary" />
          <span className="text-lg font-semibold">CourtCommand</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                onClick={() => router.push(item.href)}
                isActive={pathname === item.href}
                tooltip={{ children: item.label }}
              >
                {item.icon}
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
