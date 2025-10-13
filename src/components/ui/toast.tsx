
import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex max-h-screen w-auto flex-col gap-3 p-0 sm:inset-x-auto sm:bottom-8 sm:right-8 sm:w-[360px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-2xl border border-slate-900/10 bg-white/95 p-4 pr-10 text-sm text-slate-900 shadow-[0_25px_60px_-35px_rgba(15,23,42,0.45)] backdrop-blur-2xl transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full before:pointer-events-none before:absolute before:inset-[1px] before:rounded-[22px] before:bg-white/65 before:opacity-90 before:shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] before:backdrop-blur-sm before:content-[''] after:pointer-events-none after:absolute after:left-5 after:right-5 after:top-[16px] after:h-1 after:rounded-full after:bg-slate-200/60 after:opacity-70 after:blur-[3px] after:content-['']",
  {
    variants: {
      variant: {
	        default: "",
        destructive:
          "destructive group border-red-200 text-red-700 before:bg-red-50/80 before:shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] after:bg-red-200/60",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & 
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "relative z-10 inline-flex h-8 shrink-0 items-center justify-center rounded-xl border border-slate-900/10 bg-white/70 px-3 text-xs font-semibold uppercase tracking-wide text-slate-900 transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:ring-offset-2 focus:ring-offset-transparent disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-red-200 group-[.destructive]:bg-red-50/80 group-[.destructive]:text-red-700 group-[.destructive]:hover:bg-red-100",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 z-20 rounded-full p-1.5 text-slate-400 opacity-0 transition-opacity hover:text-slate-600 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:ring-offset-2 focus:ring-offset-transparent group-hover:opacity-100 group-[.destructive]:text-red-400 group-[.destructive]:hover:text-red-600 group-[.destructive]:focus:ring-red-200",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("relative z-10 text-sm font-semibold tracking-tight text-slate-900 group-[.destructive]:text-red-700", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("relative z-10 text-xs text-slate-500 group-[.destructive]:text-red-500", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
