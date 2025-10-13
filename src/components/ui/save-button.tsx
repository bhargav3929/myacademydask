"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Check, Sparkles } from "lucide-react"
import confetti from "canvas-confetti"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"


interface SaveButtonProps {
  text?: {
    idle?: string
    saving?: string
    saved?: string
  }
  className?: string
  onSave?: () => Promise<void> | void
  formRef?: React.RefObject<HTMLFormElement>
  onSuccess?: () => void
}

export function SaveButton({ 
  text = {
    idle: "Save",
    saving: "Saving...",
    saved: "Saved!"
  },
  className,
  onSave,
  formRef,
  onSuccess
}: SaveButtonProps) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [bounce, setBounce] = useState(false)
  const { theme } = useTheme()
  const isDark = theme === "dark"


  const handleSave = async () => {
    if (status === "idle") {
      // Check form validation first
      if (formRef?.current) {
        const isValid = formRef.current.checkValidity()
        if (!isValid) {
          // Form validation failed, don't proceed with animation
          formRef.current.reportValidity()
          return
        }
      }
      
      setStatus("saving")
      try {
        if (onSave && typeof onSave === 'function') {
          const result = await onSave()
        } else {
          // Simulation if onSave not provided
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
        setStatus("saved")
        setBounce(true)
        
        // Close modal first, then show confetti
        setTimeout(() => {
          setStatus("idle")
          setBounce(false)
          // Call onSuccess callback to close modal
          if (onSuccess) {
            onSuccess();
          }
          
          // Fire confetti after dialog closes
          setTimeout(() => {
            try {
              confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 },
                colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#00ffff", "#ff00ff"],
                shapes: ["star", "circle"],
              })
            } catch (error) {
              console.error("Confetti error:", error)
            }
          }, 300); // Small delay to ensure dialog is closed
        }, 1000) // Reduced time to show success state before closing
      } catch (error) {
        setStatus("idle")
        console.error("Save failed:", error)
        // Show user-friendly error message
        alert("Failed to save. Please try again.")
      }
    }
  }

  const buttonVariants = {
    idle: {
      background: "linear-gradient(to right, rgb(37, 99, 235), rgb(79, 70, 229))", // blue-600 to indigo-600
      color: "white",
      scale: 1,
    },
    saving: {
      background: "linear-gradient(to right, rgb(29, 78, 216), rgb(67, 56, 202))", // blue-700 to indigo-700
      color: "white",
      scale: 1,
    },
    saved: {
      background: "linear-gradient(to right, rgb(34, 197, 94), rgb(16, 185, 129))", // green-500 to emerald-500
      color: "white",
      scale: [1, 1.1, 1],
      transition: {
        duration: 0.2,
        times: [0, 0.5, 1],
      },
    },
  }

  const sparkleVariants = {
    initial: { opacity: 0, scale: 0 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0 },
  }

  return (
    <div className="relative">
      <motion.button
        type="button"
        onClick={handleSave}
        animate={status}
        variants={buttonVariants}
        className={cn(
          "group relative grid overflow-hidden rounded-xl px-8 py-3 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl w-full md:w-auto",
          className
        )}
        style={{ minWidth: "150px" }}
        whileHover={status === "idle" ? { scale: 1.05 } : {}}
        whileTap={status === "idle" ? { scale: 0.95 } : {}}
      >
        {status === "idle" && (
          <span>
            <span
              className={cn(
                "spark mask-gradient absolute inset-0 h-[100%] w-[100%] animate-flip overflow-hidden rounded-full",
                "[mask:linear-gradient(black,_transparent_50%)] before:absolute before:aspect-square before:w-[200%] before:bg-[conic-gradient(from_0deg,transparent_0_340deg,black_360deg)]",
                "before:rotate-[-90deg] before:animate-rotate dark:before:bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)]",
                "before:content-[''] before:[inset:0_auto_auto_50%] before:[translate:-50%_-15%] dark:[mask:linear-gradient(white,_transparent_50%)]",
              )}
            />
          </span>
        )}
        <span
          className={cn(
            "backdrop absolute inset-px rounded-[11px] transition-colors duration-200",
            status === "idle"
              ? "bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:from-blue-600 group-hover:to-indigo-600"
              : "",
          )}
        />
        <span className="z-10 flex items-center justify-center gap-2 text-sm font-medium">
          <AnimatePresence mode="wait">
            {status === "saving" && (
              <motion.span
                key="saving"
                initial={{ opacity: 0, rotate: 0 }}
                animate={{ opacity: 1, rotate: 360 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.3,
                  rotate: { repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" },
                }}
              >
                <Loader2 className="w-4 h-4" />
              </motion.span>
            )}
            {status === "saved" && (
              <motion.span
                key="saved"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <Check className="w-4 h-4" />
              </motion.span>
            )}
          </AnimatePresence>
          <motion.span
            key={status}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {status === "idle" ? text.idle : status === "saving" ? text.saving : text.saved}
          </motion.span>
        </span>
      </motion.button>
      <AnimatePresence>
        {bounce && (
          <motion.div
            className="absolute top-0 right-0 -mr-1 -mt-1"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={sparkleVariants}
          >
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

