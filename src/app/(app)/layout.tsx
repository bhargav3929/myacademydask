
"use client";

import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { OwnerSidebar } from '@/components/layouts/owner-sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <OwnerSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
