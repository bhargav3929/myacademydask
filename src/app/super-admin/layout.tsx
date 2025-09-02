
"use client";

import React from 'react';
import { SuperAdminHeader } from '@/components/super-admin/super-admin-header';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SuperAdminHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-6 md:gap-8 lg:px-8">
          {children}
        </main>
    </div>
  );
}
