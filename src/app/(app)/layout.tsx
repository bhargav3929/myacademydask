
"use client";

import React from 'react';
import { AppHeader } from '@/components/layouts/app-header';
import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams-with-collision';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-secondary/40">
      <AppHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 pt-28 md:gap-8 md:p-8 md:pt-32">
            <BackgroundBeamsWithCollision className="bg-transparent h-full min-h-[calc(100vh-10rem)] rounded-xl border border-border/20 shadow-sm">
                <div className="p-4 md:p-8 w-full">
                    {children}
                </div>
            </BackgroundBeamsWithCollision>
        </main>
    </div>
  );
}
