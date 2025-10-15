'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import LandingPageClient from './landing-page.client';

const LAST_PROTECTED_PATH_KEY = 'mad:lastProtectedPath';
const CACHED_USER_ROLE_KEY = 'mad:cachedUserRole';

const DEFAULT_ROUTE: Record<string, string> = {
  owner: '/dashboard',
  coach: '/coach/dashboard',
  'super-admin': '/super-admin/dashboard',
};

export default function HomePage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    // SUPER OPTIMIZATION: Try instant redirect with cached role first
    const currentUser = auth.currentUser;
    const cachedRole = localStorage.getItem(CACHED_USER_ROLE_KEY);
    const storedPath = localStorage.getItem(LAST_PROTECTED_PATH_KEY);
    
    if (currentUser && cachedRole) {
      // INSTANT redirect using cached data - no API calls needed!
      const targetRoute = storedPath || DEFAULT_ROUTE[cachedRole];
      router.replace(targetRoute);
      // Still verify in background, but user already sees their dashboard
      handleAuthenticatedUser(currentUser);
      setIsCheckingAuth(false);
      return;
    }
    
    if (currentUser) {
      // User is cached but role isn't - fetch role and redirect
      handleAuthenticatedUser(currentUser);
      setIsCheckingAuth(false);
      return;
    }

    // If no cached user, wait for auth state to initialize
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await handleAuthenticatedUser(user);
      } else {
        // User is not logged in - clear cached data and show landing page
        localStorage.removeItem(CACHED_USER_ROLE_KEY);
        localStorage.removeItem(LAST_PROTECTED_PATH_KEY);
        setShowLanding(true);
      }
      setIsCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleAuthenticatedUser = async (user: any) => {
    try {
      // Quickly check their role from token claims (cached)
      const idTokenResult = await user.getIdTokenResult(false);
      let role = idTokenResult.claims.role as string | null;

      // If no role in claims, check Firestore
      if (!role) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          role = userDoc.data()?.role as string;
        }
      }

      // Cache the role for instant redirects on next app open
      if (role) {
        localStorage.setItem(CACHED_USER_ROLE_KEY, role);
      }

      // Get the last visited protected path or default dashboard
      const storedPath = localStorage.getItem(LAST_PROTECTED_PATH_KEY);
      const targetRoute = storedPath || (role ? DEFAULT_ROUTE[role] : '/dashboard');

      // Redirect immediately - no landing page flash
      router.replace(targetRoute);
    } catch (error) {
      console.error('Error checking user role:', error);
      // Fallback to dashboard if there's an error
      router.replace('/dashboard');
    }
  };

  // Show minimal loading screen while checking auth
  // This prevents any flash of landing page content
  if (isCheckingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#FAFFFE]">
        <div className="flex flex-col items-center gap-6">
          {/* App Logo */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#14B8A6]/20 bg-white shadow-[0_8px_22px_rgba(20,184,166,0.16)]">
            <img 
              src="/landing-logo.png" 
              alt="My Academy Desk" 
              className="h-10 w-10 object-contain" 
            />
          </div>
          
          {/* Loading Spinner */}
          <div className="relative">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#14B8A6] border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  // Only show landing page if user is definitely not authenticated
  if (showLanding) {
    return <LandingPageClient />;
  }

  // Fallback - should never reach here
  return null;
}
