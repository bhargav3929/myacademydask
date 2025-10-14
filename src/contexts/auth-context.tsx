"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, functions, db } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation'; // Added usePathname
import { httpsCallable, getFunctions } from 'firebase/functions';
import { doc, getDoc } from 'firebase/firestore';

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

// Use regional functions to ensure consistency
const regionalFunctions = getFunctions(undefined, "us-central1");
const syncUserRole = httpsCallable(regionalFunctions, 'syncUserRole');

const LAST_PROTECTED_PATH_KEY = 'mad:lastProtectedPath';

const DEFAULT_ROUTE: Record<AuthUser['role'], string> = {
  owner: '/dashboard',
  coach: '/coach/dashboard',
  'super-admin': '/super-admin/dashboard',
};

const PROTECTED_PREFIXES: Record<AuthUser['role'], string[]> = {
  owner: ['/dashboard', '/stadiums', '/students', '/reports', '/settings'],
  coach: ['/coach'],
  'super-admin': ['/super-admin'],
};

const getUserRoleFromToken = async (user: User): Promise<{ role: string | null; organizationId: string | null }> => {
    try {
        console.log("Getting user role for:", user.uid);
        
        // First, check current claims
        let idTokenResult = await user.getIdTokenResult(false);
        let role = (idTokenResult.claims.role as string) || null;
        let organizationId = (idTokenResult.claims.organizationId as string) || null;
        
        console.log("Current token claims - Role:", role, "OrganizationId:", organizationId);

        // If claims are missing or incomplete, try to sync from Firestore
        if (!role || !organizationId) {
            console.log("Claims missing, fetching from Firestore and syncing...");
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    const firestoreRole = (data?.role as string) || null;
                    const firestoreOrgId = (data?.organizationId as string) || null;
                    
                    console.log("Firestore data - Role:", firestoreRole, "OrganizationId:", firestoreOrgId);

                    if (firestoreRole && firestoreOrgId) {
                        // Sync the role to update claims
                        await syncUserRole();
                        
                        // Force refresh to get updated claims
                        idTokenResult = await user.getIdTokenResult(true);
                        role = (idTokenResult.claims.role as string) || firestoreRole;
                        organizationId = (idTokenResult.claims.organizationId as string) || firestoreOrgId;
                        
                        console.log("After sync - Role:", role, "OrganizationId:", organizationId);
                    } else {
                        console.warn("Incomplete user data in Firestore:", { firestoreRole, firestoreOrgId });
                        role = firestoreRole;
                        organizationId = firestoreOrgId;
                    }
                } else {
                    console.error("User document not found in Firestore");
                }
            } catch (firestoreError) {
                console.error('Failed to fetch user document for claims fallback:', firestoreError);
            }
        }

        return { role, organizationId };
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
        // Fetch profile document to hydrate display name consistently across app
        let resolvedName: string | null = user.displayName || null;
        try {
          const userDocSnap = await getDoc(doc(db, 'users', user.uid));
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            // Prefer fullName field when available
            resolvedName = (data?.fullName as string) || resolvedName;
          }
        } catch (firestoreError) {
          console.error('Failed to fetch user profile for display name:', firestoreError);
        }
        if (role) {
            const fetchedAuthUser: AuthUser = {
                uid: user.uid,
                email: user.email,
                name: resolvedName || "User",
                role: role as 'owner' | 'coach' | 'super-admin',
            };
            if (organizationId) {
                fetchedAuthUser.organizationId = organizationId;
            }
            setUser(user);
            setAuthUser(fetchedAuthUser);
        } else {
            // Preserve base user state so we can avoid premature redirects while claims sync
            setUser(user);
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
    if (typeof window === 'undefined') {
      return;
    }

    if (!authUser) {
      localStorage.removeItem(LAST_PROTECTED_PATH_KEY);
      return;
    }

    const prefixes = PROTECTED_PREFIXES[authUser.role];
    const onProtectedPath = prefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );

    if (onProtectedPath) {
      localStorage.setItem(LAST_PROTECTED_PATH_KEY, pathname);
    }
  }, [authUser, pathname]);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/signup';
    const isPublicEntry = pathname === '/' || pathname === '/pricing';
    const defaultTarget = authUser ? DEFAULT_ROUTE[authUser.role] : '/dashboard';

    if (!authUser && !user && !isAuthPage && pathname !== '/' && pathname !== '/pricing') {
      // If not authenticated and not on public/auth pages, redirect to login
      router.replace('/login');
      return;
    }

    // If authenticated, and on an auth page, redirect to their dashboard.
    // This handles cases where a user directly navigates to /login after being authenticated.
    if (authUser && isAuthPage) {
        const targetUrl = DEFAULT_ROUTE[authUser.role];
        if (targetUrl !== pathname) {
          router.replace(targetUrl);
        }
        return;
    }

    if (authUser && isPublicEntry) {
        const storedPath =
          typeof window !== 'undefined' ? localStorage.getItem(LAST_PROTECTED_PATH_KEY) : null;
        const targetUrl = storedPath || DEFAULT_ROUTE[authUser.role];
        if (targetUrl && targetUrl !== pathname) {
          router.replace(targetUrl);
        }
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

  }, [loading, authUser, user, pathname, router]);

  const signOut = async () => {
    await firebaseSignOut(auth);
    // Explicitly clear the session cookie on client-side to ensure middleware also sees logout
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LAST_PROTECTED_PATH_KEY);
    }
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
