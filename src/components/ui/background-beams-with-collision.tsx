
"use client";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import React, { useRef, useState, useEffect } from "react";

export const BackgroundBeamsWithCollision = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const beams = [
    {
      initialX: 10,
      translateX: 10,
      duration: 7,
      repeatDelay: 3,
      delay: 2,
    },
    {
      initialX: 600,
      translateX: 600,
      duration: 3,
      repeatDelay: 3,
      delay: 4,
    },
    {
      initialX: 100,
      translateX: 100,
      duration: 7,
      repeatDelay: 7,
      className: "h-6",
    },
    {
      initialX: 400,
      translateX: 400,
      duration: 5,
      repeatDelay: 14,
      delay: 4,
    },
    {
      initialX: 800,
      translateX: 800,
      duration: 11,
      repeatDelay: 2,
      className: "h-20",
    },
    {
      initialX: 1000,
      translateX: 1000,
      duration: 4,
      repeatDelay: 2,
      className: "h-12",
    },
    {
      initialX: 1200,
      translateX: 1200,
      duration: 6,
      repeatDelay: 4,
      delay: 2,
      className: "h-6",
    },
  ];

  return (
    <div
      ref={containerRef}
      className={cn(
        "bg-background relative flex flex-col items-center w-full justify-start overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 z-0">
          {beams.map((beam, idx) => (
            <CollisionMechanism
              key={idx}
              beamOptions={beam}
              containerRef={containerRef}
            />
          ))}
      </div>

      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
};

const CollisionMechanism = ({
  containerRef,
  beamOptions = {},
}: {
  containerRef: React.RefObject<HTMLDivElement>;
  beamOptions?: {
    initialX?: number;
    translateX?: number;
    initialY?: number;
    translateY?: number;
    rotate?: number;
    className?: string;
    duration?: number;
    delay?: number;
    repeatDelay?: number;
  };
}) => {
  const beamRef = useRef<HTMLDivElement>(null);
  const [collision, setCollision] = useState<{
    detected: boolean;
    coordinates: { x: number; y: number } | null;
  }>({
    detected: false,
    coordinates: null,
  });
  const [hasCollided, setHasCollided] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    controls.start("animate");
  }, [controls]);

  const handleUpdate = (latest: any) => {
    if (hasCollided || !beamRef.current || !containerRef.current?.parentElement) {
      return;
    }
    const beamRect = beamRef.current.getBoundingClientRect();
    const parentRect = containerRef.current.parentElement.getBoundingClientRect();
    
    const collisionYPoint = parentRect.bottom - 40; // a bit of padding

    if (beamRect.bottom >= collisionYPoint) {
      const relativeX = beamRect.left - parentRect.left + beamRect.width / 2;
      const relativeY = beamRect.bottom - parentRect.top;
      setCollision({
        detected: true,
        coordinates: { x: relativeX, y: relativeY },
      });
      setHasCollided(true);
      controls.stop();
    }
  };

  useEffect(() => {
    if (collision.detected) {
      const timer = setTimeout(() => {
        setCollision({ detected: false, coordinates: null });
        setHasCollided(false);
        controls.start("animate");
      }, 2000 + (beamOptions.repeatDelay || 0) * 1000);

      return () => clearTimeout(timer);
    }
  }, [collision.detected, controls, beamOptions.repeatDelay]);

  return (
    <>
      <motion.div
        ref={beamRef}
        animate={controls}
        onUpdate={handleUpdate}
        initial={{
          translateY: beamOptions.initialY || "-200px",
          translateX: beamOptions.initialX || "0px",
          rotate: beamOptions.rotate || 0,
        }}
        variants={{
          animate: {
            translateY: "1800px",
            transition: {
              duration: beamOptions.duration || 8,
              repeat: Infinity,
              ease: "linear",
              delay: beamOptions.delay,
              repeatDelay: beamOptions.repeatDelay,
            },
          },
        }}
        className={cn(
          "absolute left-0 top-20 m-auto h-14 w-px rounded-full bg-gradient-to-t from-indigo-500 via-purple-500 to-transparent",
          beamOptions.className
        )}
      />
      <AnimatePresence>
        {collision.detected && collision.coordinates && (
          <Explosion
            key={`${collision.coordinates.x}-${collision.coordinates.y}`}
            style={{
              left: `${collision.coordinates.x}px`,
              top: `${collision.coordinates.y}px`,
              transform: "translate(-50%, -50%)",
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

const Explosion = ({ ...props }: React.HTMLProps<HTMLDivElement>) => {
  const spans = Array.from({ length: 20 }, (_, index) => ({
    id: index,
    initialX: 0,
    initialY: 0,
    directionX: Math.floor(Math.random() * 80 - 40),
    directionY: Math.floor(Math.random() * -50 - 10),
  }));

  return (
    <div {...props} className={cn("absolute z-50 h-2 w-2", props.className)}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute -inset-x-10 top-0 m-auto h-2 w-10 rounded-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-sm"
      ></motion.div>
      {spans.map((span) => (
        <motion.span
          key={span.id}
          initial={{ x: span.initialX, y: span.initialY, opacity: 1 }}
          animate={{
            x: span.directionX,
            y: span.directionY,
            opacity: 0,
          }}
          transition={{ duration: Math.random() * 1.5 + 0.5, ease: "easeOut" }}
          className="absolute h-1 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500"
        />
      ))}
    </div>
  );
};
