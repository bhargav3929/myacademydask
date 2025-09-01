
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
import { Users, TrendingUp, TrendingDown, ClipboardList, Building, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
    Users: Users,
    ClipboardList: ClipboardList,
    Building: Building,
    UserPlus: UserPlus,
};

type StatCardProps = {
  title: string;
  value: string;
  icon: keyof typeof iconMap;
  trendValue?: string;
  trendPeriod: string;
  trendColor?: string;
  primary?: boolean;
};

export function StatCard({ 
  title, 
  value,
  icon,
  trendValue,
  trendPeriod,
  trendColor = "text-emerald-500",
  primary = false
}: StatCardProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const TrendIcon = trendValue && trendValue.startsWith('+') ? TrendingUp : TrendingDown;
  const IconComponent = iconMap[icon];

  return (
    <Card className={cn(
      "shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 border-border/60",
      primary ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground"
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={cn(
            "text-sm font-medium",
            primary ? "text-primary-foreground/90" : "text-muted-foreground"
        )}>{title}</CardTitle>
        <IconComponent className={cn("size-5", primary ? "text-primary-foreground/80" : "text-muted-foreground")} />

      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24 mt-1 bg-muted-foreground/10" />
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
          <Skeleton className="h-4 w-40 mt-2 bg-muted-foreground/10" />
        ) : (
          <p className={cn("text-xs mt-1", primary ? "text-primary-foreground/80" : "text-muted-foreground")}>
            {trendValue && (
              <span className={cn("flex items-center gap-1 font-medium", primary ? "text-primary-foreground/90" : trendColor)}>
                <TrendIcon className="size-4" />
                {trendValue}
              </span>
            )}
            {trendPeriod}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
