'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams-with-collision';

// Note: Metadata cannot be exported from client components
// For SEO, consider using next/head or creating a server component wrapper
// export const metadata: Metadata = {
//   title: 'Pricing Plans - Sports Academy Management Software',
//   description: 'Choose the perfect pricing plan for your sports academy. Free trial available. Plans start at ₹1,499/month. Manage multiple sports, coaches, and athletes seamlessly.',
//   keywords: ['sports academy pricing', 'academy management software pricing', 'coach management pricing', 'my academy desk pricing', 'sports facility management cost'],
//   openGraph: {
//     title: 'Pricing Plans | My Academy Desk',
//     description: 'Choose the perfect pricing plan for your sports academy. Free trial available. Plans start at ₹1,499/month.',
//     url: 'https://myacademydask.com/pricing',
//     type: 'website',
//     images: [
//       {
//         url: '/landing-logo.png',
//         width: 1200,
//         height: 630,
//         alt: 'My Academy Desk Pricing Plans',
//       },
//     ],
//   },
//   twitter: {
//     card: 'summary_large_image',
//     title: 'Pricing Plans | My Academy Desk',
//     description: 'Choose the perfect pricing plan for your sports academy. Free trial available.',
//     images: ['/landing-logo.png'],
//   },
// }


export default function PricingPage() {
  const tiers = [
    {
      name: 'Foundation',
      price: 'Free',
      description: 'Own your day-to-day operations with a unified control center for a single location.',
      features: [
        'Coach & athlete workspaces per sport',
        'Automated attendance and family messaging',
        'Launch concierge + quarterly strategy check-in',
        '30-day full trial',
      ],
      cta: 'Start Free Trial',
    },
    {
      name: 'Elevation',
      price: '₹1,499',
      description: 'Scale across sports and locations with forecasting, automations, and executive dashboards.',
      features: [
        'Predictive retention + revenue modelling',
        'Workflow builder with cross-sport automation',
        'Bi-weekly optimisation with success architect',
        'Advanced analytics & reporting',
      ],
      cta: 'Begin with Elevation',
      popular: true,
    },
    {
      name: 'Signature',
      price: 'Custom',
      description: 'For elite organisations demanding bespoke integrations, visual identity, and innovation cycles.',
      features: [
        'Dedicated product pod & private data lake',
        'White-label portals per sport & location',
        'Priority roadmap influence + executive labs',
        'Custom integrations & API access',
      ],
      cta: 'Contact Sales',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
         <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white shadow-sm overflow-hidden">
              <img src="/landing-logo.png" alt="My Academy Desk" className="h-6 w-6 object-contain" />
            </span>
            <span className="text-lg font-bold">My Academy Desk</span>
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
                        {tier.price.startsWith('₹') && <span className="text-muted-foreground">/ month</span>}
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
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-white shadow-sm overflow-hidden">
                  <img src="/landing-logo.png" alt="My Academy Desk" className="h-4 w-4 object-contain" />
                </span>
                <span className="font-semibold">&copy; {new Date().getFullYear()} My Academy Desk. All rights reserved.</span>
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
