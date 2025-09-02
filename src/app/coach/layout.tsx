
"use client";

import React from 'react';
import { CoachHeader } from '@/components/layouts/coach-header';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <CoachHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  );
}
