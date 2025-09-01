
"use client"

import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronsLeft, Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import Link from 'next/link';

interface SidebarContextProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);

  React.useEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, isMobile }}>
      <div className="flex">
        <AnimatePresence>
          {isOpen && <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ duration: 0.3, ease: 'easeInOut' }}>{children[0]}</motion.div>}
        </AnimatePresence>
        {children[1]}
      </div>
    </SidebarContext.Provider>
  );
};


export const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const { isMobile, isOpen, setIsOpen } = useSidebar();
  return (
    <aside className={cn("bg-card text-card-foreground border-r border-border h-screen flex flex-col w-64 fixed z-40 transition-transform",
      isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"
    )}>
      {children}
    </aside>
  )
}

export const SidebarHeader = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("p-4 h-16 flex items-center border-b", className)}>
        {children}
    </div>
)

export const SidebarNav = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <nav className={cn("flex-1 p-4 space-y-2", className)}>
        {children}
    </nav>
)

interface SidebarNavLinkProps extends React.ComponentProps<typeof Link> {
    children: React.ReactNode;
    active?: boolean;
}

export const SidebarNavLink = React.forwardRef<HTMLAnchorElement, SidebarNavLinkProps>(({ href, active, children, ...props }, ref) => {
    return (
        <Link 
            href={href} 
            ref={ref}
            className={cn(
                buttonVariants({ variant: active ? 'secondary' : 'ghost' }),
                'w-full justify-start'
            )}
            {...props}
        >
            {children}
        </Link>
    )
});
SidebarNavLink.displayName = "SidebarNavLink";


export const SidebarFooter = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("p-4 border-t mt-auto", className)}>
        {children}
    </div>
)


export const SidebarInset = ({ children }: { children: React.ReactNode }) => {
    const { isOpen, isMobile } = useSidebar();

    return (
        <div className={cn("flex-1 transition-all duration-300 ease-in-out", {
            "ml-64": isOpen && !isMobile,
            "ml-0": !isOpen || isMobile
        })}>
            <div className="p-4">
                <MobileNav />
                {children}
            </div>
        </div>
    )
}

export const MobileNav = () => {
    const { isOpen, setIsOpen, isMobile } = useSidebar();
    if(!isMobile) return null;

    return (
        <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
                <Menu />
            </Button>
        </div>
    )
}
