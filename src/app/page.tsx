'use client';

import Link from 'next/link';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type JSX,
} from 'react';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight,
  Check,
  Menu,
  Play,
  Sparkles,
  Star,
  Users,
  X,
} from 'lucide-react';

const themeVariables: Record<string, string> = {
  '--violet-50': '#F0FDFA',
  '--violet-100': '#CCFBEF',
  '--violet-200': '#99F6E4',
  '--violet-400': '#2DD4BF',
  '--violet-500': '#14B8A6',
  '--violet-600': '#0D9488',
  '--violet-700': '#0F766E',
  '--pink-400': '#4ADE80',
  '--fuchsia-400': '#A3E635',
  '--bg-primary': '#FAFFFE',
  '--bg-secondary': '#F0FDFA',
  '--bg-tertiary': '#CCFBEF',
  '--text-primary': '#0A2E25',
  '--text-secondary': '#134E48',
  '--text-tertiary': '#2C7A73',
  '--border-light': 'rgba(20, 184, 166, 0.18)',
  '--border-medium': 'rgba(20, 184, 166, 0.28)',
};

const navLinks = [
  { label: 'Challenges', href: '#pain' },
  { label: 'Platform', href: '#platform' },
  { label: 'Process', href: '#process' },
  { label: 'Stories', href: '#testimonials' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Live Demo', href: '#demo' },
];

type HeroDecorShape = {
  position: { top?: string; left?: string; right?: string; bottom?: string };
  size: number;
  duration: number;
  delay: number;
  rotation: number;
  opacity: number;
  element: JSX.Element;
};

const heroDecorShapes: HeroDecorShape[] = [
  {
    position: { top: '12%', left: '6%' },
    size: 140,
    duration: 28,
    delay: 0,
    rotation: 8,
    opacity: 0.08,
    element: (
      <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M20 24c0-8.8 11-16 20-16s20 7.2 20 16-11 32-20 32-20-23.2-20-32Z" />
        <path d="M20 24c7 4.5 33 4.5 40 0" opacity="0.35" />
        <path d="M36 10l5 10" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    position: { top: '22%', right: '8%' },
    size: 130,
    duration: 24,
    delay: 1.2,
    rotation: -6,
    opacity: 0.075,
    element: (
      <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="40" cy="40" r="22" />
        <path d="M18 40c0-12 10-22 22-22s22 10 22 22-10 22-22 22-22-10-22-22Z" opacity="0.35" />
        <path d="M40 18v44" opacity="0.35" />
      </svg>
    ),
  },
  {
    position: { bottom: '18%', left: '28%' },
    size: 140,
    duration: 32,
    delay: 0.6,
    rotation: 5,
    opacity: 0.07,
    element: (
      <svg viewBox="0 0 90 90" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M18 56c7 10 47 10 54 0" />
        <path d="M18 34c7-10 47-10 54 0" opacity="0.35" />
        <path d="M30 18h20l5 12H25l5-12Z" />
      </svg>
    ),
  },
];

const HeroDecor = () => (
  <div className="pointer-events-none absolute inset-0 -z-10">
    {heroDecorShapes.map((shape, index) => (
      <motion.div
        key={index}
        className="absolute text-[var(--violet-400)]"
        style={{
          ...shape.position,
          width: shape.size,
          height: shape.size,
          opacity: shape.opacity,
          filter: 'blur(0.4px)',
        }}
        animate={{ y: [0, -24, 0], x: [0, 10, 0], rotate: [0, shape.rotation, 0] }}
        transition={{ duration: shape.duration, ease: 'easeInOut', repeat: Infinity, delay: shape.delay }}
      >
        {shape.element}
      </motion.div>
    ))}
  </div>
);

const heroStats = [
  { label: 'Athletes orchestrated', value: '18,500+' },
  { label: 'Academies onboarded', value: '420+' },
  { label: 'Coach hours saved monthly', value: '3,600 hrs' },
  { label: 'Average renewal rate', value: '97%' },
];

const tickerItems = [
  { value: '18,500+', label: 'Athletes orchestrated daily' },
  { value: '420+', label: 'Sports academies trust us' },
  { value: '23', label: 'Sports managed in one hub' },
  { value: '₹4.6Cr', label: 'Revenue tracked each week' },
  { value: '96%', label: 'Renewal rate achieved by clients' },
];

const comparisonBullets = [
  'Manual spreadsheets for attendance and payments',
  'Coaches juggling disconnected messaging apps',
  'Parents waiting days for performance updates',
];

const unifiedBullets = [
  'Unified command center for every sport and coach',
  'Automated communication across families and staff',
  'Live dashboards for revenue, retention, and utilisation',
];

const featureTabs = [
  {
    id: 'coaches',
    title: 'Coach autonomy with owner control',
    description:
      'Assign sports, surfaces, and rosters while coaches manage their sessions independently. You still see every attendance pulse and coaching impact instantly.',
    bullets: [
      'Permission sets per sport and location',
      'Session templates that adapt to each discipline',
      'Instant alerts when sessions fall under target capacity',
    ],
    highlights: [
      { title: 'Swim Academy', detail: '8 coaches • 320 athletes' },
      { title: 'Cricket Elite', detail: 'Conflict-free scheduling for 12 nets' },
    ],
  },
  {
    id: 'revenue',
    title: 'Revenue clarity in real time',
    description:
      'Track membership dues, refunds, and upsells across sports with reconciliation rules that keep finance teams smiling.',
    bullets: [
      'Automated dues recovery across payment gateways',
      'Revenue heatmaps by sport, program, or cohort',
      'Instant cash flow projections with scenario planning',
    ],
    highlights: [
      { title: '₹92L collected', detail: 'Recovered from failed charges last quarter' },
      { title: '4.2x ROI', detail: 'Average uplift for multi-sport facilities' },
    ],
  },
  {
    id: 'reporting',
    title: 'Board-ready reporting in seconds',
    description:
      'Generate beautifully branded decks and stakeholder updates without leaving the dashboard. Numbers stay live, exports update instantly.',
    bullets: [
      'Pre-built templates for investors and venue partners',
      'Auto narratives that highlight growth inflection points',
      'Shareable links with role-based access and watermarking',
    ],
    highlights: [
      { title: '38 seconds', detail: 'Average time to prep investor packs' },
      { title: 'Live Sharing', detail: 'Stakeholders see metrics as they move' },
    ],
  },
];

const timelineSteps = [
  {
    title: 'Blueprint your facility',
    description:
      'Map sports, surfaces, pricing models, and access rules. Our concierge migrates historical data while you keep operating.',
  },
  {
    title: 'Invite coaches & staff',
    description:
      'Assign roles, automations, and communication channels. Everyone logs in with the exact toolkit they need.',
  },
  {
    title: 'Onboard athletes & families',
    description:
      'Attendance, milestones, and payments sync automatically. Parents receive personalised updates under your brand.',
  },
  {
    title: 'Command your growth',
    description:
      'Dashboards reveal utilisation, revenue, and retention so you can act decisively and report without friction.',
  },
];

const testimonials = [
  {
    quote:
      'myacademydask turned our multi-sport complex from reactive to proactive. We spot utilisation dips hours before they impact revenue and coaches finally feel supported.',
    name: 'Aanya Patel',
    role: 'Director, Horizon Sports Collective',
    metrics: '5 sports • 28 coaches • 740 athletes',
  },
  {
    quote:
      'Our finance reviews went from a four-hour scramble to a fifteen-minute ritual. Stakeholders trust the numbers because they watch them update in real time.',
    name: 'Lucas Meyer',
    role: 'COO, Northern Courts Federation',
    metrics: '11 venues • ₹12Cr ARR • 3 countries',
  },
  {
    quote:
      'Parents call us the most organised academy in the region. Every touchpoint—attendance, milestones, renewals—feels intentional because it is.',
    name: 'Sofia Ramirez',
    role: 'Founder, Elevate Athletics Network',
    metrics: '9 programs • 1.9K families • 97% retention',
  },
];

const pricingPlans = [
  {
    id: 'foundation',
    name: 'Foundation',
    price: 'Free',
    cadence: '30-day full trial',
    summary: 'Own your day-to-day operations with a unified control center for a single location. No payment details required for the first month.',
    features: [
      'Coach & athlete workspaces per sport',
      'Automated attendance and family messaging',
      'Launch concierge + quarterly strategy check-in',
    ],
  },
  {
    id: 'elevation',
    name: 'Elevation',
    price: '₹1,499/mo',
    cadence: 'after your free month',
    featured: true,
    summary: 'Scale across sports and locations with forecasting, automations, and executive dashboards once your free month wraps.',
    features: [
      'Predictive retention + revenue modelling',
      'Workflow builder with cross-sport automation',
      'Bi-weekly optimisation with success architect',
    ],
  },
  {
    id: 'signature',
    name: 'Signature',
    price: 'Custom',
    cadence: 'tailored engagement',
    summary: 'For elite organisations demanding bespoke integrations, visual identity, and innovation cycles.',
    features: [
      'Dedicated product pod & private data lake',
      'White-label portals per sport & location',
      'Priority roadmap influence + executive labs',
    ],
  },
];

const academyLogos = ['Motion United', 'Apex Courts', 'Pulse Arena', 'Luminous Swim', 'Prime Athletics'];

const sportDividerIcons = ['🏊', '🏀', '⚽', '🎾', '🏐', '🥊'];

const useTypedHeadline = (phrases: string[], speed = 80) => {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    const currentPhrase = phrases[index % phrases.length];

    if (!deleting && subIndex === currentPhrase.length) {
      const hold = setTimeout(() => setDeleting(true), 1200);
      return () => clearTimeout(hold);
    }

    if (deleting && subIndex === 0) {
      const pause = setTimeout(() => {
        setDeleting(false);
        setIndex((prev) => (prev + 1) % phrases.length);
        setText('');
      }, 300);
      return () => clearTimeout(pause);
    }

    const interval = setTimeout(() => {
      if (deleting) {
        const nextIndex = Math.max(subIndex - 1, 0);
        setText(currentPhrase.substring(0, nextIndex));
        setSubIndex(nextIndex);
      } else {
        const nextIndex = Math.min(subIndex + 1, currentPhrase.length);
        setText(currentPhrase.substring(0, nextIndex));
        setSubIndex(nextIndex);
      }
    }, deleting ? speed * 0.7 : speed);

    return () => clearTimeout(interval);
  }, [deleting, index, phrases, speed, subIndex]);

  return text;
};

const useScrollMeta = () => {
  const [progress, setProgress] = useState(0);
  const [showBar, setShowBar] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = docHeight > 0 ? scrollTop / docHeight : 0;
      setProgress(Math.min(1, Math.max(0, ratio)));
      setShowBar(scrollTop > window.innerHeight * 0.5);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return { progress, showBar };
};

const SectionDivider = () => (
  <div className="flex items-center justify-center py-12">
    <div className="flex items-center gap-4 rounded-full border border-[var(--border-light)] bg-white/70 px-6 py-3 text-xl font-semibold text-[var(--violet-500)] shadow-[0_8px_20px_rgba(20,184,166,0.14)]">
      {sportDividerIcons.map((icon) => (
        <span key={icon} aria-hidden>
          {icon}
        </span>
      ))}
    </div>
  </div>
);

export default function Home() {
  const typedHeadline = useTypedHeadline([
    'every court in one command center.',
    'parents and coaches perfectly aligned.',
    'revenue clarity that never sleeps.',
  ], 130);
  const { progress, showBar } = useScrollMeta();
  const [menuOpen, setMenuOpen] = useState(false);
  const [comparisonValue, setComparisonValue] = useState(52);
  const [activeFeature, setActiveFeature] = useState(featureTabs[0].id);
  const activeFeatureData = useMemo(
    () => featureTabs.find((tab) => tab.id === activeFeature) ?? featureTabs[0],
    [activeFeature]
  );
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activePlan, setActivePlan] = useState('elevation');
  const [scrolled, setScrolled] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const openContactModal = () => setShowContactModal(true);
  const closeContactModal = () => setShowContactModal(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!showContactModal) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeContactModal();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [showContactModal]);

  return (
    <div
      style={themeVariables as CSSProperties}
      className="relative min-h-screen w-full bg-[var(--bg-primary)] text-[var(--text-primary)]"
    >
      <div
        className="fixed inset-x-0 top-0 z-40 h-1 bg-gradient-to-r from-[var(--violet-500)] via-[var(--pink-400)] to-[var(--violet-500)]"
        style={{ transform: `scaleX(${progress})`, transformOrigin: 'left center' }}
        aria-hidden
      />

      {showBar && (
        <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
          <div className="flex w-full max-w-3xl items-center justify-between gap-4 rounded-full border border-[var(--border-light)] bg-white/90 px-6 py-3 text-sm text-[var(--text-secondary)] shadow-[0_12px_28px_rgba(20,184,166,0.14)] backdrop-blur-lg">
            <span className="font-medium">Ready to orchestrate every sport from one canvas?</span>
            <button
              type="button"
              onClick={openContactModal}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--violet-500)] px-5 py-2 font-semibold text-white shadow-[0_10px_26px_rgba(20,184,166,0.18)] transition hover:scale-[1.03] hover:bg-[var(--violet-600)]"
            >
              Book demo
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <header
        className={`fixed inset-x-0 top-0 z-30 transition-all duration-300 ${
          scrolled
            ? 'border-b border-[var(--border-light)] bg-[var(--bg-primary)]/90 py-3 shadow-[0_12px_30px_rgba(20,184,166,0.14)] backdrop-blur-xl'
            : 'py-5'
        }`}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-light)] bg-white shadow-[0_8px_22px_rgba(20,184,166,0.16)]">
              <Sparkles className="h-5 w-5 text-[var(--violet-500)]" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--text-secondary)] transition group-hover:text-[var(--violet-600)]">
              myacademydask
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-8 text-sm font-medium text-[var(--text-tertiary)] lg:flex">
            {navLinks.map(({ label, href }) => (
              <Link key={label} className="relative transition hover:text-[var(--violet-600)]" href={href}>
                <span>{label}</span>
                <span className="absolute -bottom-2 left-0 h-1 w-0 rounded-full bg-[var(--pink-400)] transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--violet-500)] to-[var(--pink-400)] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(20,184,166,0.16)] transition hover:scale-[1.03]"
            >
              Login
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>

          <button
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border-light)] bg-white text-[var(--text-secondary)] shadow-[0_8px_22px_rgba(20,184,166,0.16)] transition hover:text-[var(--violet-600)] lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="mt-4 border-t border-[var(--border-light)] bg-white/95 pb-6 pt-4 shadow-[0_18px_40px_rgba(20,184,166,0.16)] backdrop-blur-2xl lg:hidden">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 text-sm font-medium text-[var(--text-secondary)]">
              {navLinks.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-2xl border border-[var(--border-light)] bg-white px-4 py-3 shadow-[0_8px_20px_rgba(20,184,166,0.14)]"
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--violet-500)] to-[var(--pink-400)] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(20,184,166,0.16)]"
              >
                Login
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </header>

      <main id="main-content" className="relative z-10 pt-28 md:pt-40">
        <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 py-24 text-center sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-[18%] top-[12%] h-56 w-56 rounded-full bg-[var(--violet-100)]/60 blur-[140px]" />
            <div className="absolute right-[12%] top-[28%] h-64 w-64 rounded-full bg-[var(--pink-400)]/18 blur-[160px]" />
            <div className="absolute bottom-[18%] left-[32%] h-56 w-56 rounded-full bg-[var(--violet-200)]/55 blur-[150px]" />
          </div>
          <HeroDecor />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex flex-col items-center gap-10"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-medium)] bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-[var(--text-tertiary)] shadow-[0_8px_20px_rgba(20,184,166,0.14)]">
              <Sparkles className="h-4 w-4 text-[var(--violet-500)]" />
              Multi-sport operating system
            </span>
            <div className="max-w-4xl">
              <h1 className="text-[clamp(2.8rem,6vw,4.8rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-[var(--text-primary)]">
                Run{' '}
                <span className="bg-gradient-to-r from-[var(--violet-500)] to-[var(--pink-400)] bg-clip-text text-transparent">
                  {typedHeadline || 'every sport with total clarity'}
                </span>
                <span className="type-caret">|</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-[1.75] text-[var(--text-secondary)]">
                Orchestrate every coach, athlete, and revenue stream with a single canvas tailored for sports academies. No more juggling apps—just clarity, confidence, and momentum.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/login" className="login-float-button" aria-label="Login to myacademydask">
                <div className="login-float-points" aria-hidden>
                  {Array.from({ length: 10 }).map((_, idx) => (
                    <i key={idx} className="login-float-point" />
                  ))}
                </div>
                <span className="login-float-inner">
                  Login
                  <ArrowRight className="h-5 w-5" />
                </span>
              </Link>
              <button
                type="button"
                className="inline-flex items-center gap-3 rounded-full border border-[var(--border-medium)] bg-white/80 px-6 py-4 text-base font-semibold text-[var(--text-secondary)] shadow-[0_12px_28px_rgba(20,184,166,0.16)] transition hover:border-[var(--violet-400)] hover:text-[var(--violet-600)]"
              >
                <Play className="h-5 w-5" />
                Watch 90-second tour
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--text-tertiary)]">
              <span className="inline-flex items-center gap-2">
                <Users className="h-4 w-4 text-[var(--violet-500)]" />
                Loved by elite academies in 3 continents
              </span>
              <span className="inline-flex items-center gap-2">
                <Star className="h-4 w-4 text-[var(--pink-400)]" />
                4.9 satisfaction across owners & coaches
              </span>
            </div>
          </motion.div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[24px] border border-[var(--border-light)] bg-white/80 p-6 text-center shadow-[0_12px_28px_rgba(20,184,166,0.12)] backdrop-blur"
              >
                <span className="block text-4xl font-bold text-[var(--violet-600)]">{stat.value}</span>
                <p className="mt-3 text-sm font-medium uppercase tracking-[0.35em] text-[var(--text-tertiary)]">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex items-center gap-6 text-xs text-[var(--text-tertiary)]">
            {academyLogos.map((logo) => (
              <span key={logo} className="uppercase tracking-[0.3em] text-[var(--text-tertiary)]">
                {logo}
              </span>
            ))}
          </div>

          <div className="mt-12 flex w-full max-w-5xl flex-col items-center gap-8 rounded-[36px] border border-[var(--border-light)] bg-white/70 p-10 shadow-[0_12px_30px_rgba(20,184,166,0.14)] backdrop-blur-xl">
            <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-left text-2xl font-semibold text-[var(--text-secondary)] sm:w-1/2">
                Live academy mission control
              </h2>
              <p className="text-left text-sm leading-relaxed text-[var(--text-tertiary)] sm:w-1/2">
                Watch every sport pulse in real time—attendance, revenue, waitlists, and satisfaction. Everything updates in sync as coaches do their best work.
              </p>
            </div>
            <div className="relative grid w-full gap-6 rounded-[28px] border border-[var(--border-medium)] bg-[var(--bg-secondary)]/80 p-8 shadow-[0_12px_28px_rgba(20,184,166,0.14)]">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-[20px] border border-[var(--border-light)] bg-white/90 p-5 text-left shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--text-tertiary)]">Programs at capacity</p>
                  <p className="mt-4 text-3xl font-bold text-[var(--violet-600)]">86%</p>
                  <p className="mt-2 text-xs text-[var(--text-tertiary)]">+12% vs last month</p>
                </div>
                <div className="rounded-[20px] border border-[var(--border-light)] bg-white/90 p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--text-tertiary)]">Families on waitlist</p>
                  <p className="mt-4 text-3xl font-bold text-[var(--violet-600)]">148</p>
                  <p className="mt-2 text-xs text-[var(--text-tertiary)]">Auto-notified within 2 minutes</p>
                </div>
                <div className="rounded-[20px] border border-[var(--border-light)] bg-white/90 p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--text-tertiary)]">Revenue forecast</p>
                  <p className="mt-4 text-3xl font-bold text-[var(--violet-600)]">₹4.2Cr</p>
                  <p className="mt-2 text-xs text-[var(--text-tertiary)]">Projected next quarter</p>
                </div>
              </div>
              <div className="rounded-[24px] border border-[var(--border-medium)] bg-white/90 p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[var(--text-secondary)]">Attendance pulse • Live</p>
                  <span className="inline-flex items-center gap-2 rounded-full bg-[var(--violet-100)] px-3 py-1 text-xs font-semibold text-[var(--violet-600)]">
                    <span className="h-2 w-2 animate-ping rounded-full bg-[var(--violet-500)]" aria-hidden />
                    Synced
                  </span>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {[68, 92, 88].map((value, idx) => (
                    <div key={idx} className="rounded-2xl border border-[var(--border-light)] bg-[var(--bg-primary)] p-4 text-left">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-tertiary)]">{['Swim', 'Cricket', 'Basketball'][idx]}</p>
                      <p className="mt-2 text-2xl font-semibold text-[var(--violet-600)]">{value}%</p>
                      <p className="text-xs text-[var(--text-tertiary)]">Sessions filled</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <SectionDivider />

        <section className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
          <div className="absolute left-0 top-1/2 h-48 w-48 -translate-y-1/2 bg-[var(--violet-100)] blur-3xl" />
          <div className="absolute right-0 top-0 h-60 w-60 bg-[var(--pink-400)]/30 blur-3xl" />
          <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10">
            <div className="flex flex-col gap-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--text-tertiary)]">Trusted movement</p>
              <h2 className="text-[clamp(2.2rem,4vw,3.4rem)] font-bold text-[var(--text-primary)]">
                Proven momentum across the globe
              </h2>
            </div>
            <div className="relative overflow-hidden rounded-full border border-[var(--border-light)] bg-white/82 px-4 py-5 shadow-[0_12px_24px_rgba(20,184,166,0.12)] backdrop-blur">
              <motion.div
                className="flex min-w-max gap-3 text-[var(--text-secondary)]"
                animate={{ x: ['0%', '-50%'] }}
                transition={{ duration: 20, ease: 'linear', repeat: Infinity }}
                aria-label="Momentum metrics slider"
              >
                {[...tickerItems, ...tickerItems].map(({ value, label }, idx) => (
                  <div
                    key={`${label}-${idx}`}
                    className="shrink-0 flex flex-col items-center gap-1 rounded-full bg-[var(--bg-secondary)]/65 px-4 py-2 text-center"
                  >
                    <span className="text-lg font-semibold text-[var(--violet-600)]">{value}</span>
                    <span className="text-xs uppercase tracking-[0.32em] text-[var(--text-tertiary)]">{label}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        <section id="pain" className="relative px-4 py-24 sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent to-[var(--bg-secondary)]" />
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
            <div className="grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--text-tertiary)]">From chaos to clarity</p>
                <h2 className="mt-4 text-[clamp(2.2rem,3.5vw,3rem)] font-bold text-[var(--text-primary)]">
                  Remember the before state. Celebrate the after.
                </h2>
                <p className="mt-5 text-base leading-[1.75] text-[var(--text-secondary)]">
                  Slide to witness the shift from disconnected tools to a single orchestration platform designed for sports academies.
                </p>
              </div>
              <div className="relative overflow-hidden rounded-[28px] border border-[var(--border-medium)] bg-[var(--bg-tertiary)]/70 p-1 shadow-[0_16px_40px_rgba(20,184,166,0.16)]">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[26px]">
                  <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-[#DCFCE7] via-[var(--pink-400)]/15 to-[var(--violet-100)]" aria-hidden />
                  <div className="absolute inset-0 flex h-full w-full items-center justify-center">
                    <div className="relative h-3/4 w-11/12 overflow-hidden rounded-[20px] border border-[var(--border-light)] bg-white shadow-[0_12px_36px_rgba(20,184,166,0.16)]">
                      <div className="absolute inset-0 bg-[var(--violet-200)]" style={{ clipPath: `inset(0 ${(100 - comparisonValue).toFixed(0)}% 0 0)` }}>
                        <div className="flex h-full w-full flex-col gap-4 p-6 text-[var(--text-primary)]">
                          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--text-tertiary)]">Before</p>
                          <div className="grid gap-3 text-xs text-[var(--text-secondary)]">
                            {comparisonBullets.map((item) => (
                              <div key={item} className="flex items-start gap-3 rounded-xl border border-[var(--border-medium)] bg-white/70 px-3 py-2">
                                <span className="mt-[2px] text-[var(--pink-400)]">•</span>
                                <p>{item}</p>
                              </div>
                            ))}
                          </div>
                          <div className="mt-auto text-xs font-semibold text-[var(--text-tertiary)]">Five tools. Infinite headaches.</div>
                        </div>
                      </div>
                      <div className="absolute inset-0 flex h-full w-full flex-col gap-4 p-6 text-[var(--text-primary)]" style={{ clipPath: `inset(0 0 0 ${comparisonValue.toFixed(0)}%)` }}>
                        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--text-tertiary)]">After</p>
                        <div className="grid gap-3 text-xs text-[var(--text-secondary)]">
                          {unifiedBullets.map((item) => (
                            <div key={item} className="flex items-start gap-3 rounded-xl border border-[var(--border-light)] bg-white/80 px-3 py-2">
                              <Check className="mt-[2px] h-4 w-4 text-[var(--violet-500)]" />
                              <p>{item}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-auto text-xs font-semibold text-[var(--violet-600)]">One platform. Collective momentum.</div>
                      </div>
                    </div>
                  </div>
                  <input
                    type="range"
                    aria-label="Comparison slider"
                    min={0}
                    max={100}
                    value={comparisonValue}
                    onChange={(event) => setComparisonValue(Number(event.target.value))}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 w-2/3 accent-[var(--violet-500)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <SectionDivider />

        <section id="platform" className="relative px-4 py-28 sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[var(--bg-secondary)] to-transparent" />
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 text-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--text-tertiary)]">Platform deep dive</p>
              <h2 className="mt-4 text-[clamp(2.2rem,3.5vw,3.2rem)] font-bold text-[var(--text-primary)]">
                Every tab unlocks a new dimension of clarity.
              </h2>
            </div>
            <div className="grid gap-8 lg:grid-cols-[0.35fr_0.65fr] lg:items-start">
              <div className="flex flex-col gap-4">
                {featureTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveFeature(tab.id)}
                    className={`group flex items-center justify-between rounded-[20px] border px-4 py-3 text-left transition ${
                      activeFeature === tab.id
                        ? 'border-[var(--violet-500)] bg-white text-[var(--violet-600)] shadow-[0_12px_28px_rgba(20,184,166,0.16)]'
                        : 'border-transparent bg-white/60 text-[var(--text-secondary)] hover:border-[var(--border-light)]'
                    }`}
                  >
                    <span className="text-sm font-semibold">{tab.title}</span>
                    <span className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--text-tertiary)]">→</span>
                  </button>
                ))}
              </div>

              <motion.div
                key={activeFeatureData.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="relative flex flex-col gap-8 rounded-[32px] border border-[var(--border-medium)] bg-white/80 p-10 text-left shadow-[0_12px_30px_rgba(20,184,166,0.14)]"
              >
                <div className="grid gap-6 lg:grid-cols-[0.6fr_0.4fr] lg:items-start">
                  <div>
                    <h3 className="text-2xl font-semibold text-[var(--text-primary)]">{activeFeatureData.title}</h3>
                    <p className="mt-4 text-base leading-[1.75] text-[var(--text-secondary)]">
                      {activeFeatureData.description}
                    </p>
                    <ul className="mt-6 space-y-3 text-sm text-[var(--text-secondary)]">
                      {activeFeatureData.bullets.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <Check className="mt-[6px] h-4 w-4 text-[var(--violet-500)]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="relative hidden h-full w-full flex-col gap-4 rounded-[24px] border border-[var(--border-light)] bg-[var(--bg-tertiary)]/60 p-6 text-sm text-[var(--text-secondary)] shadow-inner lg:flex">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-tertiary)]">Live impact stories</p>
                    {activeFeatureData.highlights.map((highlight) => (
                      <div key={highlight.title} className="rounded-2xl border border-[var(--border-light)] bg-white/80 p-4 shadow-[0_12px_30px_rgba(20,184,166,0.12)]">
                        <p className="text-sm font-semibold text-[var(--text-secondary)]">{highlight.title}</p>
                        <p className="text-xs text-[var(--text-tertiary)]">{highlight.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 rounded-[24px] border border-[var(--border-light)] bg-[var(--bg-primary)] p-6 text-sm text-[var(--text-secondary)] shadow-[0_12px_32px_rgba(20,184,166,0.14)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--text-tertiary)]">Try it live</p>
                  <div className="grid gap-3 md:grid-cols-3">
                    {['Trigger automation', 'Share investor deck', 'Balance capacity'].map((action, idx) => (
                      <button
                        key={action}
                        type="button"
                        className="group flex h-28 flex-col justify-between rounded-2xl border border-[var(--border-light)] bg-white p-4 text-left transition hover:-translate-y-1 hover:border-[var(--violet-400)] hover:shadow-[0_12px_28px_rgba(20,184,166,0.14)]"
                      >
                        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-tertiary)]">Action {idx + 1}</span>
                        <span className="text-sm font-semibold text-[var(--text-secondary)]">{action}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <SectionDivider />

        <section id="process" className="relative overflow-hidden px-4 py-28 sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent to-[var(--bg-secondary)]" />
          <div className="mx-auto grid w-full max-w-6xl gap-16 lg:grid-cols-[0.35fr_0.65fr]">
            <div className="flex flex-col gap-5">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--text-tertiary)]">How it works</p>
              <h2 className="text-[clamp(2.2rem,3.5vw,3.2rem)] font-bold leading-tight text-[var(--text-primary)]">
                Scroll down the momentum timeline.
              </h2>
              <p className="text-base leading-[1.75] text-[var(--text-secondary)]">
                As you progress, the path fills with colour. Each milestone transitions from onboarding to optimisation, guided by our success architects.
              </p>
            </div>
            <div className="relative border-l border-dashed border-[var(--border-medium)] pl-8">
              <div className="absolute left-[-1px] top-0 h-full w-[2px] bg-gradient-to-b from-[var(--violet-400)] via-[var(--pink-400)] to-transparent" aria-hidden />
              <div className="flex flex-col gap-12">
                {timelineSteps.map((step, index) => (
                  <TimelineStep key={step.title} index={index + 1} title={step.title} description={step.description} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <SectionDivider />

        <section id="testimonials" className="relative px-4 py-28 sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[var(--bg-tertiary)]/40 to-transparent" />
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-12 text-center">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--text-tertiary)]">Voices of momentum</p>
              <h2 className="mt-4 text-[clamp(2.3rem,3.5vw,3.2rem)] font-bold text-[var(--text-primary)]">
                Facilities that used to fight fires now set the pace.
              </h2>
            </div>
            <div className="relative flex h-[420px] w-full max-w-4xl items-center justify-center">
              {testimonials.map((testimonial, idx) => {
                const offset = (idx - activeTestimonial + testimonials.length) % testimonials.length;
                const isActive = offset === 0;
                const translation = offset === 0 ? 0 : offset === 1 ? 60 : -60;
                const scale = offset === 0 ? 1 : offset === 1 ? 0.94 : 0.9;
                const opacity = offset === 0 ? 1 : 0.6;

                return (
                  <motion.article
                    key={testimonial.name}
                    className="absolute w-full max-w-3xl rounded-[36px] border border-[var(--border-light)] bg-white p-10 text-left shadow-[0_18px_40px_rgba(20,184,166,0.18)]"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity, y: translation, scale }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    style={{ zIndex: isActive ? 30 : 15 - offset }}
                  >
                    <p className="text-lg leading-[1.8] text-[var(--text-secondary)]">“{testimonial.quote}”</p>
                    <div className="mt-8 border-t border-[var(--border-light)] pt-6 text-sm text-[var(--text-secondary)]">
                      <p className="font-semibold text-[var(--text-primary)]">{testimonial.name}</p>
                      <p>{testimonial.role}</p>
                      <p className="mt-1 text-xs text-[var(--text-tertiary)]">{testimonial.metrics}</p>
                    </div>
                  </motion.article>
                );
              })}
              <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-3">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveTestimonial(idx)}
                    aria-label={`Show testimonial ${idx + 1}`}
                    className={`h-2 w-8 rounded-full transition ${
                      activeTestimonial === idx ? 'bg-[var(--violet-500)]' : 'bg-[var(--border-medium)]'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <SectionDivider />

        <section id="demo" className="relative px-4 py-28 sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent to-[var(--bg-secondary)]" />
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 text-center">
            <div className="max-w-3xl self-center">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--text-tertiary)]">Interactive playground</p>
              <h2 className="mt-4 text-[clamp(2.2rem,3.5vw,3.2rem)] font-bold text-[var(--text-primary)]">
                Experience your academy’s new control room.
              </h2>
              <p className="mt-5 text-base leading-[1.75] text-[var(--text-secondary)]">
                Test-drive mini workflows below. Add an athlete, reassign a coach, and watch dashboards respond instantly.
              </p>
            </div>
            <InteractiveDemo openContactModal={openContactModal} />
          </div>
        </section>

        <SectionDivider />

        <section id="pricing" className="relative px-4 py-28 sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[var(--bg-tertiary)]/40 to-transparent" />
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 text-center">
            <div className="max-w-3xl self-center">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--text-tertiary)]">Choose your launch lane</p>
              <h2 className="mt-4 text-[clamp(2.2rem,3.5vw,3.2rem)] font-bold text-[var(--text-primary)]">
                Plans that scale with your ambition.
              </h2>
              <p className="mt-5 text-base leading-[1.75] text-[var(--text-secondary)]">
                Each plan pairs powerful software with human expertise. Hover to explore the details—featured plan expands automatically.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {pricingPlans.map((plan) => {
                const isActive = activePlan === plan.id || plan.featured;
                return (
                  <motion.article
                    key={plan.id}
                    onMouseEnter={() => setActivePlan(plan.id)}
                    onFocus={() => setActivePlan(plan.id)}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`relative flex h-full flex-col gap-6 rounded-[32px] border-2 p-8 text-left shadow-[0_12px_30px_rgba(20,184,166,0.14)] transition ${
                      plan.featured
                        ? 'border-transparent bg-gradient-to-br from-[var(--violet-500)] to-[var(--pink-400)] text-white'
                        : 'border-[var(--border-medium)] bg-white/85 text-[var(--text-secondary)]'
                    } ${isActive ? 'scale-[1.02]' : 'scale-95 opacity-80'}`}
                  >
                    {plan.featured && (
                      <span className="absolute -top-4 left-1/2 w-max -translate-x-1/2 rounded-full bg-white px-5 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--violet-500)] shadow-[0_12px_30px_rgba(255,255,255,0.4)]">
                        Most loved
                      </span>
                    )}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.35em] opacity-70">{plan.name}</p>
                      <div className="mt-3 flex items-baseline gap-2">
                        <p className="text-5xl font-bold leading-none">{plan.price}</p>
                        <span className="text-xs font-medium opacity-80">{plan.cadence}</span>
                      </div>
                    </div>
                    <p className={`text-sm leading-relaxed ${plan.featured ? 'text-white/80' : 'text-[var(--text-secondary)]'}`}>
                      {plan.summary}
                    </p>
                    <ul className="flex flex-col gap-3 text-sm">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <span
                            className={`mt-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                              plan.featured ? 'bg-white/20 text-white' : 'bg-[var(--violet-100)] text-[var(--violet-500)]'
                            }`}
                          >
                            <Check className="h-4 w-4" />
                          </span>
                          <span className={plan.featured ? 'text-white/90' : 'text-[var(--text-secondary)]'}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={openContactModal}
                      className={`mt-auto inline-flex items-center justify-center gap-3 rounded-full px-6 py-4 text-sm font-semibold transition ${
                        plan.featured
                          ? 'bg-white text-[var(--violet-600)] shadow-[0_14px_32px_rgba(255,255,255,0.3)]'
                          : 'border border-[var(--border-light)] bg-white text-[var(--text-secondary)] hover:border-[var(--violet-500)] hover:text-[var(--violet-600)]'
                      }`}
                    >
                      {plan.featured ? 'Begin with Elevation' : 'Talk to our team'}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <SectionDivider />

        <section className="relative overflow-hidden px-4 py-28 sm:px-6 lg:px-8">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent to-[var(--bg-tertiary)]" />
          <div className="mx-auto w-full max-w-6xl rounded-[40px] border border-[var(--border-medium)] bg-white/80 p-12 text-center shadow-[0_20px_48px_rgba(20,184,166,0.16)] backdrop-blur-xl">
            <div className="absolute inset-0 -z-10">
              <div className="blob absolute left-[10%] top-[10%] h-48 w-48 bg-[var(--violet-100)]" />
              <div className="blob absolute right-[12%] top-[20%] h-56 w-56 bg-[var(--pink-400)]/30" />
              <div className="blob absolute bottom-[10%] left-1/2 h-48 w-48 -translate-x-1/2 bg-[var(--violet-200)]" />
            </div>
            <div className="mx-auto flex max-w-3xl flex-col gap-6">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--text-tertiary)]">Last call</p>
              <h2 className="text-[clamp(2.3rem,4vw,3.4rem)] font-bold text-[var(--text-primary)]">
                Ready to craft the benchmark multi-sport academy?
              </h2>
              <p className="text-base leading-[1.75] text-[var(--text-secondary)]">
                Join the leaders who transformed their operations into a competitive advantage. We’ll map your success blueprint before a single switch flips.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={openContactModal}
                  className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[var(--violet-500)] to-[var(--pink-400)] px-9 py-4 text-base font-semibold text-white shadow-[0_14px_32px_rgba(20,184,166,0.16)] transition hover:scale-[1.05]"
                >
                  Reserve your private demo
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  type="button"
                  onClick={openContactModal}
                  className="inline-flex items-center gap-3 rounded-full border border-[var(--border-medium)] bg-white/80 px-7 py-4 text-base font-semibold text-[var(--text-secondary)] shadow-[0_10px_24px_rgba(20,184,166,0.16)] transition hover:border-[var(--violet-400)] hover:text-[var(--violet-600)]"
                >
                  Talk with strategy
                </button>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-[var(--text-tertiary)]">
                <span className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-[var(--violet-500)]" />
                  Setup in 5 minutes per sport
                </span>
                <span className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-[var(--violet-500)]" />
                  White-glove onboarding
                </span>
                <span className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-[var(--violet-500)]" />
                  No credit card required
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative mt-16 border-t border-[var(--border-light)] bg-[var(--bg-secondary)]/70 py-12">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 text-sm text-[var(--text-secondary)] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--text-tertiary)]">myacademydask</span>
            <p className="max-w-md text-[var(--text-secondary)]">
              The bright operating system for multi-sport academies—crafted for owners who demand clarity, connection, and championship-level execution.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:text-right">
            <div className="flex flex-wrap gap-4 text-[var(--text-tertiary)] sm:justify-end">
              {[
                { label: 'Platform', href: '#platform' },
                { label: 'Solutions', href: '#platform' },
                { label: 'Process', href: '#process' },
                { label: 'Pricing', href: '#pricing' },
                { label: 'Stories', href: '#testimonials' },
              ].map(({ label, href }) => (
                <Link key={label} href={href} className="transition hover:text-[var(--violet-500)]">
                  {label}
                </Link>
              ))}
              <Link href="mailto:hello@myacademydask.com" className="transition hover:text-[var(--violet-500)]">
                Contact
              </Link>
            </div>
            <p className="text-xs text-[var(--text-tertiary)]">
              © {new Date().getFullYear()} myacademydask. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {showContactModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={closeContactModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-[min(92vw,420px)] rounded-[28px] border border-[var(--border-medium)] bg-white/95 p-8 text-left shadow-[0_10px_24px_rgba(20,184,166,0.16)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeContactModal}
              aria-label="Close contact modal"
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-light)] bg-white text-[var(--text-tertiary)] shadow-sm transition hover:text-[var(--violet-600)]"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex flex-col gap-5 text-[var(--text-secondary)]">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--violet-100)] text-[var(--violet-600)]">
                  <Sparkles className="h-6 w-6" />
                </span>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Contact the administrator</h3>
              </div>
              <p className="text-sm leading-relaxed">
                We’d love to walk you through myacademydask. Reach out to Bhargav directly and we’ll schedule a high-touch strategy session tailored to your academy.
              </p>
              <div className="rounded-2xl border border-[var(--border-light)] bg-[var(--bg-secondary)]/80 p-4 text-sm">
                <p className="font-semibold text-[var(--text-primary)]">Bhargav • Customer Success</p>
                <p className="mt-2 text-[var(--text-secondary)]">Phone: <a href="tel:+919553143929" className="font-semibold text-[var(--violet-600)]">+91 95531 43929</a></p>
                <p className="mt-1 text-[var(--text-tertiary)]">WhatsApp: <a href="https://wa.me/919553143929" className="font-semibold text-[var(--violet-500)]">+91 95531 43929</a></p>
              </div>
              <a
                href="tel:+919553143929"
                onClick={closeContactModal}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[var(--violet-500)] to-[var(--pink-400)] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(20,184,166,0.16)] transition hover:scale-[1.03]"
              >
                Call Bhargav now
              </a>
            </div>
          </motion.div>
        </div>
      )}

      <style jsx global>{`
        .blob {
          border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          opacity: 0.35;
          filter: blur(45px);
          animation: morph 10s ease-in-out infinite;
        }
        @keyframes morph {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
        }
        .type-caret {
          display: inline-block;
          margin-left: 0.25rem;
          width: 8px;
          background: linear-gradient(180deg, var(--violet-500), var(--pink-400));
          animation: caret-blink 0.8s steps(2, start) infinite;
        }
        @keyframes caret-blink {
          to { opacity: 0; }
        }
        .login-float-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          overflow: hidden;
          border-radius: 999px;
          padding: 0.9rem 1.9rem;
          font-size: 1rem;
          font-weight: 600;
          color: #ffffff;
          text-decoration: none;
          background:
            radial-gradient(70% 70% at 50% 100%, rgba(20, 184, 166, 0.38) 0%, rgba(20, 184, 166, 0) 100%),
            linear-gradient(135deg, var(--violet-500) 0%, var(--pink-400) 100%);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          box-shadow: 0 16px 34px rgba(20, 184, 166, 0.18);
        }
        .login-float-button::before {
          content: '';
          position: absolute;
          inset: 1px;
          border-radius: 999px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0) 85%);
          z-index: 0;
        }
        .login-float-button:active {
          transform: scale(0.97);
        }
        .login-float-button:hover {
          transform: translateY(-1px) scale(1.01);
          box-shadow: 0 18px 38px rgba(20, 184, 166, 0.22);
        }
        .login-float-points {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 1;
        }
        .login-float-point {
          position: absolute;
          bottom: -12px;
          width: 3px;
          height: 3px;
          background-color: rgba(255, 255, 255, 0.9);
          border-radius: 999px;
          animation: login-floating-points linear infinite;
        }
        @keyframes login-floating-points {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          70% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-56px) scale(0.6);
            opacity: 0;
          }
        }
        .login-float-point:nth-child(1) { left: 10%; animation-duration: 2.6s; animation-delay: 0.15s; }
        .login-float-point:nth-child(2) { left: 22%; animation-duration: 2.3s; animation-delay: 0.45s; }
        .login-float-point:nth-child(3) { left: 30%; animation-duration: 2.7s; animation-delay: 0.1s; }
        .login-float-point:nth-child(4) { left: 42%; animation-duration: 2.1s; animation-delay: 0.35s; }
        .login-float-point:nth-child(5) { left: 50%; animation-duration: 2s; animation-delay: 0.6s; }
        .login-float-point:nth-child(6) { left: 60%; animation-duration: 2.4s; animation-delay: 0.25s; }
        .login-float-point:nth-child(7) { left: 70%; animation-duration: 2.15s; animation-delay: 0.55s; }
        .login-float-point:nth-child(8) { left: 78%; animation-duration: 2.5s; animation-delay: 0.8s; }
        .login-float-point:nth-child(9) { left: 88%; animation-duration: 2.35s; animation-delay: 0.4s; }
        .login-float-point:nth-child(10) { left: 95%; animation-duration: 2.7s; animation-delay: 0.12s; }
        .login-float-inner {
          position: relative;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
        }
        .login-float-inner svg {
          transition: transform 0.3s ease;
        }
        .login-float-button:hover .login-float-inner svg {
          transform: translateX(3px);
        }
      `}</style>
    </div>
  );
}

function TimelineStep({
  index,
  title,
  description,
}: {
  index: number;
  title: string;
  description: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative rounded-[24px] border border-[var(--border-light)] bg-white/80 p-6 shadow-[0_12px_32px_rgba(20,184,166,0.14)] backdrop-blur"
    >
      <span className="absolute -left-10 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--violet-500)] text-sm font-semibold text-white shadow-[0_8px_20px_rgba(20,184,166,0.14)]">
        {index}
      </span>
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{description}</p>
    </motion.div>
  );
}

function InteractiveDemo({
  openContactModal,
}: {
  openContactModal: () => void;
}) {
  const [selectedSport, setSelectedSport] = useState('Swimming');
  const [goal, setGoal] = useState<'capacity' | 'revenue'>('capacity');
  const [autoAlerts, setAutoAlerts] = useState(true);

  const analytics = useMemo(() => {
    const base = selectedSport === 'Swimming' ? 82 : selectedSport === 'Basketball' ? 91 : 75;
    const adjustment = goal === 'capacity' ? 6 : 3;
    const result = autoAlerts ? base + adjustment : base - 4;
    return Math.min(100, Math.max(0, result));
  }, [selectedSport, goal, autoAlerts]);

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 rounded-[36px] border border-[var(--border-medium)] bg-white/85 p-8 shadow-[0_18px_48px_rgba(20,184,166,0.16)] md:grid-cols-[0.45fr_0.55fr]">
      <div className="flex flex-col gap-5">
        <p className="text-left text-sm font-semibold uppercase tracking-[0.35em] text-[var(--text-tertiary)]">Try it now</p>
        <div className="flex flex-col gap-4 text-left">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-tertiary)]">Select sport</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {['Swimming', 'Basketball', 'Tennis'].map((sport) => (
                <button
                  key={sport}
                  type="button"
                  onClick={() => setSelectedSport(sport)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    selectedSport === sport
                      ? 'bg-gradient-to-r from-[var(--violet-500)] to-[var(--pink-400)] text-white'
                      : 'border border-[var(--border-light)] bg-white/80 text-[var(--text-secondary)] hover:border-[var(--violet-500)]'
                  }`}
                >
                  {sport}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-tertiary)]">Focus area</p>
            <div className="mt-2 flex rounded-full border border-[var(--border-light)] bg-white/70 p-1">
              {[
                { id: 'capacity', label: 'Capacity' },
                { id: 'revenue', label: 'Revenue' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setGoal(item.id as 'capacity' | 'revenue')}
                  className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    goal === item.id ? 'bg-[var(--violet-500)] text-white shadow-[0_12px_30px_rgba(20,184,166,0.24)]' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center justify-between rounded-2xl border border-[var(--border-light)] bg-[var(--bg-primary)] px-4 py-3 text-sm">
            <span className="text-[var(--text-secondary)]">Automated alerts</span>
            <input
              type="checkbox"
              checked={autoAlerts}
              onChange={(event) => setAutoAlerts(event.target.checked)}
              className="h-5 w-5 accent-[var(--violet-500)]"
            />
          </label>
        </div>
      </div>
      <div className="flex flex-col gap-6 rounded-[24px] border border-[var(--border-medium)] bg-[var(--bg-secondary)]/80 p-6 text-left shadow-inner">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--text-tertiary)]">Command preview</p>
        <div className="flex flex-col gap-4 rounded-[20px] border border-[var(--border-light)] bg-white/90 p-5 shadow-[0_18px_40px_rgba(20,184,166,0.12)]">
          <p className="text-sm font-semibold text-[var(--text-secondary)]">
            {selectedSport} {goal === 'capacity' ? 'capacity health' : 'revenue projection'}
          </p>
          <div className="relative h-3 rounded-full bg-[var(--violet-100)]">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[var(--violet-500)] via-[var(--pink-400)] to-[var(--violet-500)]"
              style={{ width: `${analytics}%` }}
            />
          </div>
          <p className="text-xs text-[var(--text-tertiary)]">
            Automated insights adjust every ten minutes based on attendance, payments, and coach feedback loops.
          </p>
        </div>
        <div className="grid gap-3 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center justify-between rounded-2xl border border-[var(--border-light)] bg-[var(--bg-primary)] px-4 py-3">
            <span>Projected waitlist conversions</span>
            <span className="font-semibold text-[var(--violet-600)]">{autoAlerts ? '82 families' : '44 families'}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-[var(--border-light)] bg-[var(--bg-primary)] px-4 py-3">
            <span>Assistant coach recommendations</span>
            <span className="font-semibold text-[var(--violet-600)]">{goal === 'capacity' ? '3 shifts' : '2 shifts'}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={openContactModal}
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[var(--violet-500)] to-[var(--pink-400)] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(20,184,166,0.16)]"
        >
          Launch full demo
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
