
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase'; 
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/super-admin/dashboard', label: 'Dashboard' },
  { href: '/super-admin/settings', label: 'Settings' },
];

export function SuperAdminHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/super-admin/login'); // Redirect to super admin login after logout
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const NavLinks = ({ isMobile = false }) => (
    <nav
      className={cn(
        'hidden md:flex items-center gap-6 text-sm font-medium',
        { 'flex flex-col items-start gap-4 p-4': isMobile }
      )}
    >
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'transition-colors hover:text-foreground',
            pathname === item.href ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] md:w-[98%] max-w-7xl mx-auto h-20 px-4 md:px-6 flex items-center justify-between z-50 rounded-2xl border border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-6">
        <Link href="/super-admin/dashboard" className="flex items-center gap-2 font-semibold">
          <span className='text-lg'>Super Admin</span>
        </Link>
        <NavLinks />
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleLogout} className='hidden md:flex'>
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Logout</span>
        </Button>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <div className="flex flex-col h-full">
              <NavLinks isMobile />
              <div className="mt-auto p-4">
                <Button variant="ghost" size="icon" onClick={handleLogout} className='w-full flex items-center gap-2 justify-start'>
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
