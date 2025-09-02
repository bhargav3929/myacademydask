
"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams-with-collision';

export default function PricingPage() {
  const tiers = [
    {
      name: 'Starter',
      price: '$49',
      description: 'For new academies getting started.',
      features: [
        'Up to 50 Students',
        '2 Stadiums',
        'Basic Analytics',
        'Email Support',
      ],
      cta: 'Choose Starter',
    },
    {
      name: 'Pro',
      price: '$99',
      description: 'For growing academies that need more power.',
      features: [
        'Up to 200 Students',
        '10 Stadiums',
        'Advanced Analytics',
        'Priority Email Support',
        'AI-Powered Insights',
      ],
      cta: 'Get Started with Pro',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations with custom needs.',
      features: [
        'Unlimited Students',
        'Unlimited Stadiums',
        'Custom Analytics & Reporting',
        'Dedicated Account Manager',
        'On-demand Support',
      ],
      cta: 'Contact Sales',
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
            <Link href="/pricing" className="text-sm font-medium text-primary">
              Pricing
            </Link>
            <Button asChild variant="ghost">
              <Link href="/login">
                Login
              </Link>
            </Button>
            <Button asChild>
              <Link href="/login">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <BackgroundBeamsWithCollision className="bg-transparent">
          <section className="container py-24 text-center md:py-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-extrabold tracking-tighter md:text-6xl">
                Pricing Plans for Every Academy
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                Choose the perfect plan to manage and grow your sports academy. No hidden fees, cancel anytime.
              </p>
            </motion.div>
          </section>
        </BackgroundBeamsWithCollision>

        <section className="container -mt-16 pb-24 md:pb-32">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {tiers.map((tier) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className={`flex h-full flex-col ${tier.popular ? 'border-primary shadow-2xl shadow-primary/10' : ''}`}>
                  {tier.popular && (
                    <div className="absolute -top-3.5 right-6">
                      <div className="rounded-full border border-primary/50 bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
                        Most Popular
                      </div>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    <CardDescription>{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-6">
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold">{tier.price}</span>
                        {tier.price.startsWith('$') && <span className="text-muted-foreground">/ month</span>}
                    </div>
                    <ul className="space-y-3">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3">
                          <Check className="size-5 text-green-500" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" size="lg" variant={tier.popular ? 'default' : 'outline'}>
                      {tier.cta}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
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
