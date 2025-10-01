'use client';

import Link from 'next/link';
import { Gamepad2, Medal, Users, CalendarCheck, BarChart4, ShieldCheck, ClipboardList, Star, Zap, Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Particles } from '@/components/ui/particles';
import { useTheme } from 'next-themes';
import { useState, useEffect, ReactNode } from 'react';
import { renderCanvas } from "@/components/ui/canvas";
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { IconType } from 'react-icons';

const HeroContent = () => (
    <div className="relative z-10 flex flex-col items-center text-center">
        <motion.span 
            className="mb-4 inline-block rounded-full bg-gray-600/50 px-4 py-2 text-sm text-white"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        >
          <Gem className="inline-block mr-2"/>The Ultimate Command Center
        </motion.span>
        <motion.h1 
            className="max-w-4xl bg-gradient-to-br from-white to-gray-400 bg-clip-text text-5xl font-extrabold leading-tight text-transparent sm:text-6xl sm:leading-tight md:text-8xl md:leading-tight"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        >
          Your Academy, Elevated.
        </motion.h1>
        <motion.p 
            className="my-8 max-w-2xl text-center text-lg leading-relaxed md:text-xl md:leading-relaxed text-gray-300"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        >
          From student management to stadium analytics, CourtCommand is the all-in-one platform designed to make your sports academy thrive. Focus on coaching, we'll handle the complexity.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Link href="/dashboard">
                <Button
                    size="lg"
                    className="group relative inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-bold text-white transition-transform transform-gpu hover:scale-105 active:scale-95"
                >
                    <Zap className="w-5 h-5 transition-transform group-hover:rotate-12"/>
                    Get Started Free
                </Button>
            </Link>
        </motion.div>
      </div>
)

const Section = ({ children }: { children: ReactNode }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section ref={ref} className="py-24 container mx-auto max-w-screen-xl">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                {children}
            </motion.div>
        </section>
    );
};

const TestimonialCard = ({ quote, author, role, delay }: { quote: string, author: string, role: string, delay: number }) => (
    <motion.div 
        className="bg-gray-900/50 p-6 rounded-lg border border-gray-800/50 flex flex-col justify-between"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ delay, duration: 0.5 }}
    >
        <div>
            <div className="flex mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />)}
            </div>
            <p className="text-gray-300 italic mb-4">"{quote}"</p>
        </div>
        <div>
            <p className="font-bold text-white">{author}</p>
            <p className="text-sm text-gray-500">{role}</p>
        </div>
    </motion.div>
);

const SocialProofSection = () => (
    <Section>
        <h2 className="text-4xl font-bold text-center text-white mb-12">Loved by Academies Everywhere</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard 
                quote="CourtCommand revolutionized how we manage our facilities. The analytics are a game-changer for our growth strategy."
                author="John Doe"
                role="Owner, Elite Sports Academy"
                delay={0.1}
            />
            <TestimonialCard 
                quote="Finally, an attendance system that coaches actually want to use. It's simple, fast, and saves me hours every week."
                author="Jane Smith"
                role="Head Coach, Future Stars Tennis"
                delay={0.2}
            />
            <TestimonialCard 
                quote="The ability to see all student data in one place has been invaluable. We can track progress and communicate with parents more effectively."
                author="Samuel Lee"
                role="Director, Apex Football Club"
                delay={0.3}
            />
        </div>
    </Section>
);

const HowItWorksSection = () => (
    <Section>
        <h2 className="text-4xl font-bold text-center text-white mb-16">Get Started in 3 Simple Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-800/50 transform -translate-y-1/2 hidden md:block"></div>
            <motion.div className="relative" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true}} transition={{ delay: 0.2 }}>
                <div className="w-16 h-16 bg-primary/10 border-2 border-primary text-primary rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
                <h3 className="text-xl font-bold text-white mb-2">Sign Up Free</h3>
                <p className="text-gray-400">Create your academy account in seconds. No credit card required.</p>
            </motion.div>
            <motion.div className="relative" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true}} transition={{ delay: 0.4 }}>
                <div className="w-16 h-16 bg-primary/10 border-2 border-primary text-primary rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
                <h3 className="text-xl font-bold text-white mb-2">Set Up Your Academy</h3>
                <p className="text-gray-400">Add your stadiums, create coach profiles, and import your student roster effortlessly.</p>
            </motion.div>
            <motion.div className="relative" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true}} transition={{ delay: 0.6 }}>
                <div className="w-16 h-16 bg-primary/10 border-2 border-primary text-primary rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
                <h3 className="text-xl font-bold text-white mb-2">Manage & Grow</h3>
                <p className="text-gray-400">Leverage powerful tools and insights to streamline operations and scale your business.</p>
            </motion.div>
        </div>
    </Section>
);

const FeatureCard = ({ icon: Icon, title, description, delay }: { icon: IconType, title: string, description: string, delay: number }) => (
    <motion.div 
        className="bg-gray-900/50 p-6 rounded-lg border border-gray-800/50 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ delay }}
    >
        <Icon className="h-12 w-12 text-primary mb-4 mx-auto" />
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
    </motion.div>
);

const FeaturesSection = () => (
    <div className="bg-gray-950/50">
        <Section>
            <h2 className="text-4xl font-bold text-center text-white mb-12">Everything You Need to Succeed</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <FeatureCard 
                    icon={Medal} 
                    title="Effortless Stadiums" 
                    description="Manage bookings, track availability, and optimize facility usage with our intuitive stadium management system."
                    delay={0.1}
                />
                <FeatureCard 
                    icon={Users} 
                    title="Unified Rosters" 
                    description="A single source of truth for all student and coach information, accessible anytime, anywhere."
                    delay={0.2}
                />
                <FeatureCard 
                    icon={CalendarCheck} 
                    title="Instant Attendance" 
                    description="Empower coaches with a one-click attendance tracker that syncs instantly across the platform."
                    delay={0.3}
                />
                <FeatureCard 
                    icon={BarChart4} 
                    title="Actionable Insights" 
                    description="Go from data to decisions. Uncover trends in revenue, attendance, and new admissions to drive growth."
                    delay={0.4}
                />
            </div>
        </Section>
    </div>
);

const GetStartedSection = () => (
    <Section>
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-12 text-center">
            <motion.h2 
                className="text-5xl font-extrabold text-white mb-4"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            >
                Ready to Elevate Your Academy?
            </motion.h2>
            <motion.p 
                className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            >
                Stop juggling spreadsheets and disconnected tools. Join the growing community of modern sports academies building their future on CourtCommand.
            </motion.p>
            <motion.div
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            >
                <Link href="/signup">
                    <Button
                        size="lg"
                        className="group relative inline-flex items-center gap-2 rounded-full bg-primary px-10 py-5 text-lg font-bold text-white transition-transform transform-gpu hover:scale-105 active:scale-95"
                    >
                        Start Your Free Trial
                        <Zap className="w-5 h-5 transition-transform group-hover:rotate-12" />
                    </Button>
                </Link>
            </motion.div>
        </div>
    </Section>
);

const Footer = () => {
    const [year, setYear] = useState(new Date().getFullYear());
    useEffect(() => { setYear(new Date().getFullYear()); }, []);

    return (
        <footer className="w-full bg-transparent text-gray-400 border-t border-gray-800/50 z-10 relative">
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

  useEffect(() => { renderCanvas(); }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
      if (primaryColor) {
        setColor("#ffffff");
      }
    }
  }, [theme]);

  return (
    <div className="flex flex-col min-h-screen text-foreground bg-[#020617]">
      <div className="fixed top-0 left-0 w-full h-full">
        <Particles
            className="absolute inset-0"
            quantity={100}
            ease={80}
            color={color}
            refresh
        />
        <canvas
          className="bg-skin-base pointer-events-none absolute inset-0 mx-auto"
          id="canvas"
        ></canvas>
      </div>
       <header className="fixed top-0 z-50 w-full bg-transparent backdrop-blur-sm bg-black/10">
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

      <main className="flex-1 z-10">
        <div className="min-h-screen flex items-center justify-center relative">
            <HeroContent />
        </div>

        <SocialProofSection />
        <HowItWorksSection />
        <FeaturesSection />
        <GetStartedSection />
      </main>

      <Footer />
    </div>
  );
}
