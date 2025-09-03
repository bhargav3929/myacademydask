
'use client';

import Link from 'next/link';
import { Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams-with-collision';
import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';


const Footer = () => {
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        setYear(new Date().getFullYear());
    }, []);

    return (
        <footer className="bg-gray-950 text-gray-400">
            <div className="container flex flex-col md:flex-row items-center justify-between py-8 text-sm gap-4">
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
        <BackgroundBeamsWithCollision>
             <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] px-4 py-24">
                 <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="text-center"
                 >
                    <h1 className="max-w-4xl bg-gradient-to-br from-white to-gray-400 bg-clip-text text-center text-4xl font-bold leading-tight text-transparent sm:text-6xl sm:leading-tight md:text-7xl md:leading-tight">
                        The Ultimate Command Center for Your Sports Academy
                    </h1>
                    <p className="my-6 max-w-xl mx-auto text-center text-base leading-relaxed text-gray-300 md:text-lg md:leading-relaxed">
                        Streamline your operations, manage stadiums, track attendance, and empower your coaches with a single, powerful platform.
                    </p>
                    <Link href="/dashboard">
                        <Button size="lg">
                            Get Started Now
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </BackgroundBeamsWithCollision>
      </main>

      <Footer />
    </div>
  );
}
