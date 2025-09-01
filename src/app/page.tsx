
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart, CalendarCheck, ShieldCheck, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      description: 'Visualize your organization\'s growth and performance with beautiful, real-time charts.',
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-primary" />,
      title: 'Secure by Design',
      description: 'Robust Firestore security rules protect your data and ensure privacy.',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Icons.logo className="h-6 w-6 text-primary" />
            <span className="font-bold">CourtCommand</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button asChild>
              <Link href="/dashboard">
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <motion.section
          className="container flex flex-col items-center justify-center py-20 text-center md:py-32"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="mb-4 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground">
            The Ultimate Court Management System
          </motion.div>
          <motion.h1
            variants={itemVariants}
            className="font-headline text-4xl font-bold tracking-tighter md:text-6xl"
          >
            Command Your Court
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="font-body mx-auto mt-6 max-w-xl text-lg text-muted-foreground"
          >
            CourtCommand is a premium SaaS solution designed for badminton academies to streamline operations, track performance, and foster growth.
          </motion.p>
          <motion.div variants={itemVariants} className="mt-8 flex gap-4">
            <Button size="lg" asChild>
              <Link href="/dashboard">
                Access Dashboard
              </Link>
            </Button>
          </motion.div>
        </motion.section>

        <section id="features" className="container py-12 md:py-24">
          <motion.div
            className="mx-auto flex max-w-4xl flex-col items-center text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
          >
            <motion.h2 variants={itemVariants} className="font-headline text-3xl font-bold tracking-tight md:text-4xl">
              Powerful Features, Elegant Design
            </motion.h2>
            <motion.p variants={itemVariants} className="font-body mt-4 text-lg text-muted-foreground">
              Everything you need to run your academy, built with precision and care.
            </motion.p>
          </motion.div>

          <motion.div
            className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
          >
            {features.map((feature, i) => (
              <motion.div variants={itemVariants} key={i}>
                <Card className="h-full transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
                  <CardHeader className="flex flex-row items-center gap-4">
                    {feature.icon}
                    <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-border/40">
        <div className="container flex h-16 items-center justify-between text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} CourtCommand. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="transition-colors hover:text-foreground">Privacy Policy</Link>
            <Link href="#" className="transition-colors hover:text-foreground">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
