
"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MotionDiv } from "@/components/motion";

type StatCardProps = {
  title: string;
  icon: React.ReactNode;
  value: string;
  trendValue: string;
  trendIcon: React.ReactNode;
  trendColor: string;
  trendPeriod?: string;
  collectionName: string; // Keep for potential future hook-up
  role?: "coach" | "owner";
  today?: boolean;
};

export function StatCard({ 
  title, 
  icon, 
  value,
  trendValue,
  trendIcon,
  trendColor,
  trendPeriod = "vs last month"
}: StatCardProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="group relative overflow-hidden border-border/50 shadow-sm transition-all duration-300 ease-in-out hover:border-primary/30 hover:shadow-lg hover:-translate-y-1">
      <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-br from-background via-background to-accent/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2 z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="p-2 bg-accent/50 rounded-lg">
            {icon}
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        {loading ? (
          <Skeleton className="h-8 w-24 mt-1" />
        ) : (
          <MotionDiv 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-3xl font-bold"
          >
            {value}
          </MotionDiv>
        )}
        {loading ? (
          <Skeleton className="h-4 w-40 mt-2" />
        ) : (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
             <span className={`flex items-center gap-1 font-medium ${trendColor}`}>
                {trendIcon}
                {trendValue}
            </span>
            <span>{trendPeriod}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
