
"use client";

import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { CoachSidebar } from '@/components/layouts/coach-sidebar';

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <CoachSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
