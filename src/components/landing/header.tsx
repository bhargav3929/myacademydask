"use client";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Gamepad2 } from "lucide-react";
import { MotionDiv } from "@/components/motion";

export const FuturisticHeader = () => {
  const { authUser, loading } = useAuth();

  const getDashboardUrl = () => {
    if (!authUser) return "/login";
    return authUser.role === 'coach' ? '/coach/dashboard' : '/dashboard';
  };

  return (
    <MotionDiv
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <header className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Gamepad2 className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">CourtCommand</span>
        </Link>
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
          ) : authUser ? (
            <Link href={getDashboardUrl()}>
              <Button>Dashboard</Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          )}
        </div>
      </header>
    </MotionDiv>
  );
};
