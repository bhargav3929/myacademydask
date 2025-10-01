"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, functions } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation'; // Added usePathname
import { httpsCallable } from 'firebase/functions';

export interface AuthUser {
  uid: string;
  email: string | null;
  role: 'owner' | 'coach' | 'super-admin';
  name: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  authUser: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  authUser: null,
  loading: true,
  signOut: async () => {},
});

const syncUserRole = httpsCallable(functions, 'syncUserRole');

const getUserRoleFromToken = async (user: User): Promise<{ role: string | null; organizationId: string | null }> => {
    try {
        // Calling syncUserRole ensures claims are up-to-date in Firebase Auth backend.
        // We don't necessarily need its return value here, as the ID token refresh below
        // will pick up the latest claims.
        await syncUserRole(); 

        const idTokenResult = await user.getIdTokenResult(true); // Force refresh to get latest claims
        return {
            role: idTokenResult.claims.role as string || null,
            organizationId: idTokenResult.claims.organizationId as string || null
        };
    } catch (error: any) {
        console.error("Error getting user role from token:", error.message);
        return { role: null, organizationId: null };
    }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname(); // Get current pathname

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        // Fetch claims, including role, to populate authUser
        const { role, organizationId } = await getUserRoleFromToken(user);
        if (role) {
            const fetchedAuthUser: AuthUser = {
                uid: user.uid,
                email: user.email,
                name: user.displayName || "User",
                role: role as 'owner' | 'coach' | 'super-admin',
            };
            if (organizationId) {
                fetchedAuthUser.organizationId = organizationId;
            }
            setUser(user);
            setAuthUser(fetchedAuthUser);
        } else {
            // If no role, consider them not fully authenticated for our app context
            setUser(null);
            setAuthUser(null);
        }
      } else {
        setUser(null);
        setAuthUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Client-side redirection logic is primarily handled by middleware.ts now.
  // This useEffect is a secondary/fallback check for client-side navigation
  // or to ensure consistency, but middleware.ts is the authoritative source.
  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/signup';

    if (!authUser && !isAuthPage && pathname !== '/' && pathname !== '/pricing') {
      // If not authenticated and not on public/auth pages, redirect to login
      router.replace('/login');
      return;
    }

    // If authenticated, and on an auth page, redirect to their dashboard.
    // This handles cases where a user directly navigates to /login after being authenticated.
    if (authUser && isAuthPage) {
        let targetUrl = '/dashboard'; // Default for owner
        if (authUser.role === 'coach') targetUrl = '/coach/dashboard';
        if (authUser.role === 'super-admin') targetUrl = '/super-admin/dashboard'; 
        router.replace(targetUrl);
        return;
    }

    // The middleware is responsible for enforcing role-based paths.
    // Client-side redirects here are secondary/fallback.
    // Example fallback (mostly for direct URL manipulation by user or unexpected state):
    if (authUser) {
        const isSuperAdminPath = pathname.startsWith('/super-admin');
        const isCoachPath = pathname.startsWith('/coach');
        const isOwnerPath = !isSuperAdminPath && !isCoachPath && (
            pathname.startsWith('/dashboard') || 
            pathname.startsWith('/stadiums') || 
            pathname.startsWith('/students') || 
            pathname.startsWith('/reports') || 
            pathname.startsWith('/settings')
        );

        if (authUser.role === 'super-admin' && !isSuperAdminPath && pathname !== '/super-admin/login') {
            router.replace('/super-admin/dashboard');
        } else if (authUser.role === 'coach' && !isCoachPath) { // Corrected Logic
            router.replace('/coach/dashboard');
        } else if (authUser.role === 'owner' && (isCoachPath || isSuperAdminPath)) {
            router.replace('/dashboard');
        }
    }

  }, [loading, authUser, pathname, router]);

  const signOut = async () => {
    await firebaseSignOut(auth);
    // Explicitly clear the session cookie on client-side to ensure middleware also sees logout
    document.cookie = '__session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.assign('/login'); // Use assign to force full reload and middleware re-evaluation
  };

  return (
    <AuthContext.Provider value={{ user, authUser, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
