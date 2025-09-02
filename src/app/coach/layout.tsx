
"use client";

import React from 'react';
import { CoachHeader } from '@/components/layouts/coach-header';
import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams-with-collision';
import { CoachSidebar, SidebarProvider, SidebarInset } from '@/components/layouts/coach-sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
        <CoachSidebar />
        <SidebarInset>
            <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <CoachHeader />
            <main className="flex flex-1 flex-col gap-4 p-4 pt-8 sm:p-6 md:gap-8 md:p-8">
                <BackgroundBeamsWithCollision className="bg-transparent h-full min-h-[calc(100vh-10rem)] rounded-xl border border-border/20 shadow-sm">
                    <div className="p-4 md:p-8 w-full">
                        {children}
                    </div>
                </BackgroundBeamsWithCollision>
            </main>
            </div>
        </SidebarInset>
    </SidebarProvider>
  );
}
