
'use client';

import Link from 'next/link';
import { Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';

const AuroraHero = dynamic(
  () => import('@/components/ui/futurastic-hero-section').then(mod => mod.AuroraHero),
  { ssr: false }
);


export default function Home() {

  return (
    <div className="flex min-h-screen flex-col bg-gray-950 text-foreground">
       <header className="fixed top-0 z-50 w-full bg-transparent">
        <div className="container flex h-20 max-w-screen-2xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Gamepad2 className="h-7 w-7 text-white" />
            <span className="text-lg font-bold text-white">CourtCommand</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
              <Link href="/login">Owner Login</Link>
            </Button>
            <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
              <Link href="/login">Coach Login</Link>
            </Button>
             <Button asChild variant="outline" className="text-white border-white/20 hover:bg-white/10 hover:text-white bg-transparent">
              <Link href="/super-admin/login">
                Super Admin
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <AuroraHero />
      </main>

      <footer className="bg-gray-950 text-gray-400">
        <div className="container flex flex-col md:flex-row items-center justify-between py-8 text-sm gap-4">
          <div className="flex items-center gap-2.5">
            <Gamepad2 className="h-6 w-6" />
            <span className="font-semibold">&copy; {new Date().getFullYear()} CourtCommand. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="#" className="transition-colors hover:text-white">Privacy Policy</Link>
            <Link href="#" className="transition-colors hover:text-white">Terms of Service</Link>
             <Link href="#" className="transition-colors hover:text-white">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

