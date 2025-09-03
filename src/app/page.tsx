
'use client';

import Link from 'next/link';
import { Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Particles } from '@/components/ui/particles';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

const HeroContent = () => (
    <div className="relative z-10 flex flex-col items-center text-center">
        <span className="mb-1.5 inline-block rounded-full bg-gray-600/50 px-3 py-1.5 text-sm text-white">
          The Ultimate Command Center
        </span>
        <h1 className="max-w-4xl bg-gradient-to-br from-white to-gray-400 bg-clip-text text-4xl font-bold leading-tight text-transparent sm:text-6xl sm:leading-tight md:text-7xl md:leading-tight">
          Manage Your Sports Academy with Precision
        </h1>
        <p className="my-6 max-w-xl text-center text-base leading-relaxed md:text-lg md:leading-relaxed text-gray-200">
          Streamline your operations, manage stadiums, track attendance, and empower your coaches with a single, powerful platform.
        </p>
        <Link href="/dashboard">
             <Button
                size="lg"
                className="group relative w-fit items-center gap-1.5 rounded-full bg-gray-950/10 px-6 py-3 text-gray-50 transition-colors hover:bg-gray-950/50 border"
            >
                Get Started Now
            </Button>
        </Link>
      </div>
)

const Footer = () => {
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        setYear(new Date().getFullYear());
    }, []);

    return (
        <footer className="w-full absolute bottom-0 bg-transparent text-gray-400 border-t border-gray-800/50">
            <div className="container flex flex-col md:flex-row items-center justify-between py-6 text-sm gap-4 mx-auto max-w-screen-2xl">
                <div className="flex items-center gap-2.5">
                    <Gamepad2 className="h-6 w-6" />
                    <span className="font-semibold">&copy; {year} CourtCommand. All rights reserved.</span>
                </div>
                <div className="flex items-center gap-6">
                    <Link href="#" className="transition-colors hover:text-white">Privacy Policy</Link>
                    <Link href="#" className="transition-colors hover:text-white">Terms of Service</Link>
                    <Link href="#" className="transition-colors hover:text-white">Contact</Link>
                </div>
            </div>
        </footer>
    );
};


export default function Home() {
  const { theme } = useTheme()
  const [color, setColor] = useState("#ffffff")

  useEffect(() => {
    // We can get the computed style of the primary color from the CSS variables
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    // The value is in HSL format "H S% L%", we need to convert it to "hsl(H, S, L)"
    if (primaryColor) {
      setColor(`hsl(${primaryColor.replace(/ /g, ', ')})`);
    }
  }, [theme]);


  return (
    <div className="flex min-h-screen flex-col text-foreground bg-[#020617]">
       <header className="fixed top-0 z-50 w-full bg-transparent">
        <div className="container flex h-20 max-w-screen-2xl items-center justify-between mx-auto">
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

      <main className="flex-1 flex items-center justify-center">
        <Particles
            className="absolute inset-0"
            quantity={100}
            ease={80}
            color={color}
            refresh
        />
        <HeroContent />
      </main>

      <Footer />
    </div>
  );
}
