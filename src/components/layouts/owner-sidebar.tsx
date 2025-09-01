"use client";

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart2, Building, Shield, LogOut, Settings } from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function OwnerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userData } = useAuth();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

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
      <SidebarFooter>
        <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
                <AvatarImage src={user?.photoURL || undefined} alt={userData?.fullName || ''} />
                <AvatarFallback>{userData?.fullName?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium truncate">{userData?.fullName}</span>
                <span className="text-xs text-muted-foreground truncate">{userData?.email}</span>
            </div>
        </div>
         <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleSignOut}>
            <LogOut className="size-4" />
            <span>Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
