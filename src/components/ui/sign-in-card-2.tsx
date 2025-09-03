'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Mail, Lock,Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export function SignInCard2({ onSubmit, isLoading, onGoogleSignIn }: { onSubmit: (data: any) => void, isLoading: boolean, onGoogleSignIn: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-sm relative z-10"
        style={{ perspective: 1500 }}
      >
        <motion.div
          className="relative"
          style={{ rotateX, rotateY }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          whileHover={{ z: 10 }}
        >
          <div className="relative group">
              <div className="absolute -inset-[0.5px] rounded-2xl bg-gradient-to-r from-primary/30 via-primary/10 to-primary/30 opacity-0 group-hover:opacity-70 transition-opacity duration-500" />
              
              <div className="relative bg-background/80 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.05] shadow-2xl overflow-hidden">
                 <div className="absolute inset-0 opacity-[0.03]" 
                  style={{
                    backgroundImage: `linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)`,
                    backgroundSize: '30px 30px'
                  }}
                />

                <div className="text-center space-y-1 mb-5">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", duration: 0.8 }}
                    className="mx-auto w-12 h-12 rounded-full border border-primary/20 bg-primary/10 flex items-center justify-center relative overflow-hidden"
                  >
                    <ShieldCheck className="w-6 h-6 text-primary" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/80"
                  >
                    Super Admin
                  </motion.h1>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-muted-foreground text-xs"
                  >
                    Sign in to manage CourtCommand
                  </motion.p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <motion.div className="space-y-3">
                    <motion.div 
                      className={`relative ${focusedInput === "email" ? 'z-10' : ''}`}
                      whileFocus={{ scale: 1.02 }}
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <div className="relative flex items-center overflow-hidden rounded-lg">
                        <Mail className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                          focusedInput === "email" ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                        
                        <Input
                          type="email"
                          placeholder="superadmin@courtcommand.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onFocus={() => setFocusedInput("email")}
                          onBlur={() => setFocusedInput(null)}
                          className="w-full bg-secondary border-border/50 focus:border-primary text-foreground placeholder:text-muted-foreground h-10 transition-all duration-300 pl-10 pr-3 focus:bg-secondary/80"
                          autoComplete="email"
                        />
                      </div>
                    </motion.div>

                    <motion.div 
                      className={`relative ${focusedInput === "password" ? 'z-10' : ''}`}
                      whileFocus={{ scale: 1.02 }}
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <div className="relative flex items-center overflow-hidden rounded-lg">
                        <Lock className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                          focusedInput === "password" ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                        
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onFocus={() => setFocusedInput("password")}
                          onBlur={() => setFocusedInput(null)}
                          className="w-full bg-secondary border-border/50 focus:border-primary text-foreground placeholder:text-muted-foreground h-10 transition-all duration-300 pl-10 pr-10 focus:bg-secondary/80"
                          autoComplete="current-password"
                        />
                        
                        <div 
                          onClick={() => setShowPassword(!showPassword)} 
                          className="absolute right-3 cursor-pointer"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors duration-300" />
                          ) : (
                            <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors duration-300" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>

                  <div className="pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full relative group/button"
                    >
                      <div className="absolute inset-0 bg-primary/20 rounded-lg blur-lg opacity-0 group-hover/button:opacity-70 transition-opacity duration-300" />
                      
                      <div className="relative overflow-hidden bg-primary text-primary-foreground font-medium h-10 rounded-lg transition-all duration-300 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                          {isLoading ? (
                            <motion.div
                              key="loading"
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.5 }}
                              className="flex items-center justify-center"
                            >
                              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                            </motion.div>
                          ) : (
                            <motion.span
                              key="button-text"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center justify-center gap-1 text-sm font-medium"
                            >
                              Sign In
                              <ArrowRight className="w-3 h-3 group-hover/button:translate-x-1 transition-transform duration-300" />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.button>
                  </div>
                </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
  );
}
