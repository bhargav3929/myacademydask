
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart, CalendarCheck, ShieldCheck, Users, Gamepad2 } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams-with-collision';

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
      icon: <ShieldCheck className="h-8 w-8 text-primary" />,
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
          <nav className="flex items-center gap-4">
             <Link href="/#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Features
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Pricing
            </Link>
            <Button asChild variant="ghost">
              <Link href="/login">
                Owner Login
              </Link>
            </Button>
            <Button asChild>
              <Link href="/login">
                Coach Login <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <BackgroundBeamsWithCollision>
            <motion.section
            className="container flex flex-col items-center justify-center py-24 text-center md:py-32 lg:py-40"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            >
            <motion.div variants={itemVariants} className="mb-4 rounded-full border bg-card px-4 py-1.5 text-sm font-medium text-primary shadow-sm">
                The #1 Platform for Sports Academies
            </motion.div>
            <motion.h1
                variants={itemVariants}
                className="text-4xl font-extrabold tracking-tighter md:text-6xl lg:text-7xl"
            >
                Command Your Court
            </motion.h1>
            <motion.p
                variants={itemVariants}
                className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
            >
                CourtCommand is the ultimate all-in-one solution for managing your sports academy. Streamline operations, track performance, and unlock your academy's potential.
            </motion.p>
            <motion.div variants={itemVariants} className="mt-8 flex flex-wrap justify-center gap-4">
                <Button size="lg" asChild>
                <Link href="/login">
                    Claim Your Academy <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                <Link href="#">
                    Book a Demo
                </Link>
                </Button>
            </motion.div>
            </motion.section>
            
            <motion.section
            className="container relative -mt-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            >
                <div className="relative rounded-xl border bg-card p-2 shadow-2xl shadow-primary/10">
                    <Image 
                        src="https://picsum.photos/1200/600"
                        alt="Dashboard preview"
                        width={1200}
                        height={600}
                        className="rounded-lg"
                        data-ai-hint="dashboard user interface"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-background/80 via-background/0 to-background/0" />
                </div>
            </motion.section>
        </BackgroundBeamsWithCollision>


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
