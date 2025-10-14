
import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/auth-context';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
// import { GoogleAnalytics } from './analytics';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'My Academy Desk - Sports Academy Management System',
    template: '%s | My Academy Desk'
  },
  description: 'The ultimate sports academy management platform for multi-sport facilities. Manage coaches, athletes, attendance, revenue, and operations seamlessly.',
  keywords: ['my academy desk', 'myacademydask', 'sports academy management', 'academy management software', 'sports facility management', 'coach management system', 'athlete management', 'academy software'],
  authors: [{ name: 'My Academy Desk' }],
  creator: 'My Academy Desk',
  publisher: 'My Academy Desk',
  applicationName: 'My Academy Desk',
  metadataBase: new URL('https://myacademydask.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'My Academy Desk - Sports Academy Management System',
    description: 'The ultimate sports academy management platform for multi-sport facilities. Manage coaches, athletes, attendance, revenue, and operations seamlessly.',
    url: 'https://myacademydask.com',
    siteName: 'My Academy Desk',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/landing-logo.png',
        width: 1200,
        height: 630,
        alt: 'My Academy Desk Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Academy Desk - Sports Academy Management System',
    description: 'The ultimate sports academy management platform for multi-sport facilities.',
    images: ['/landing-logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add Google Search Console verification code when ready
    // google: 'your-google-verification-code',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {/* Uncomment when you have Google Analytics ID */}
        {/* <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''} /> */}
        
        <AuthProvider>
          <CurrencyProvider>
            {children}
          </CurrencyProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
