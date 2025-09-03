
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart, CalendarCheck, Shield, Users, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HeroSection } from '@/components/ui/hero-section';
import { Icons } from '@/components/icons';


export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  const features = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: 'Seamless Management',
      description: 'Effortlessly manage stadiums, students, and coaches from a centralized dashboard.',
    },
    {
      icon: <CalendarCheck className="h-8 w-8 text-primary" />,
      title: 'Attendance Tracking',
      description: 'Real-time attendance marking for coaches, with instant data sync for owners.',
    },
    {
      icon: <BarChart className="h-8 w-8 text-primary" />,
      title: 'Insightful Analytics',
      description: "Visualize your organization's growth and performance with beautiful, real-time charts.",
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: 'Secure by Design',
      description: 'Robust Firestore security rules protect your data and ensure privacy.',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
       <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Gamepad2 className="h-7 w-7 text-primary" />
            <span className="text-lg font-bold">CourtCommand</span>
          </Link>
          <nav className="flex items-center gap-2">
             <Link href="/#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Features
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Pricing
            </Link>
            <Button asChild variant="ghost">
              <Link href="/login">Owner Login</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Coach Login</Link>
            </Button>
             <Button asChild variant="outline" size="sm">
              <Link href="/super-admin/login">
                <Shield className="mr-2 h-4 w-4" />
                Super Admin
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <HeroSection
          badge={{
            text: "The #1 Platform for Sports Academies",
            action: {
              text: "Explore features",
              href: "#features",
            },
          }}
          title="Command Your Court"
          description="The ultimate all-in-one solution for managing your sports academy. Streamline operations, track performance, and unlock your academy's potential."
          actions={[
            {
              text: "Get Started Free",
              href: "/login",
              variant: "default",
              icon: <ArrowRight className="h-4 w-4" />,
            },
          ]}
          image={{
            light: "https://i.imgur.com/nJAgB9j.png",
            dark: "https://i.imgur.com/nJAgB9j.png",
            alt: "CourtCommand Dashboard Preview",
          }}
        />

        <section id="features" className="container py-24 md:py-32">
          <motion.div
            className="mx-auto flex max-w-4xl flex-col items-center text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
          >
            <motion.h2 variants={itemVariants} className="text-3xl font-bold tracking-tight md:text-5xl">
              Powerful Features, Elegant Design
            </motion.h2>
            <motion.p variants={itemVariants} className="mt-4 text-lg text-muted-foreground">
              Everything you need to run your academy, built with precision and care.
            </motion.p>
          </motion.div>

          <motion.div
            className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
          >
            {features.map((feature, i) => (
              <motion.div variants={itemVariants} key={i}>
                <Card className="h-full bg-card/80 backdrop-blur-sm transition-all duration-300 ease-out hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
                  <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                    <div className="rounded-lg bg-primary/10 p-3 border border-primary/20">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                       <p className="text-muted-foreground pt-2">{feature.description}</p>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-border/40 bg-secondary/50">
        <div className="container flex flex-col md:flex-row items-center justify-between py-8 text-sm text-muted-foreground gap-4">
          <div className="flex items-center gap-2.5">
            <Gamepad2 className="h-6 w-6 text-muted-foreground" />
            <span className="font-semibold">&copy; {new Date().getFullYear()} CourtCommand. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="#" className="transition-colors hover:text-foreground">Privacy Policy</Link>
            <Link href="#" className="transition-colors hover:text-foreground">Terms of Service</Link>
             <Link href="#" className="transition-colors hover:text-foreground">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
