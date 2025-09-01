
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
import { Users, TrendingUp, TrendingDown, Package, Building } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
    Users: <Users className="size-6 text-primary-foreground" />,
    Package: <Package className="size-5 text-muted-foreground" />,
    Building: <Building className="size-5 text-muted-foreground" />,
};

type StatCardProps = {
  title: string;
  value: string;
  icon: keyof typeof iconMap;
  trendValue: string;
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
  trendColor = "text-green-500",
  primary = false
}: StatCardProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const TrendIcon = trendValue.startsWith('+') ? TrendingUp : TrendingDown;

  return (
    <Card className={cn(
      "shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 border-none",
      primary ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground"
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={cn(
            "text-sm font-medium",
            primary ? "text-primary-foreground/90" : "text-muted-foreground"
        )}>{title}</CardTitle>
        <div className={cn(
            "p-2 rounded-lg",
            primary ? "bg-primary-foreground/20" : "bg-muted"
        )}>
            {React.cloneElement(iconMap[icon], {
                className: cn(primary ? "text-primary-foreground" : "text-muted-foreground", "size-5")
            })}
        </div>
      </CardHeader>
      <CardContent>
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
          <div className="flex items-center gap-2 text-xs mt-1">
             <span className={cn("flex items-center gap-1 font-medium", primary ? "text-primary-foreground/90" : trendColor)}>
                <TrendIcon className="size-4" />
                {trendValue}
            </span>
            <span className={cn(primary ? "text-primary-foreground/80" : "text-muted-foreground")}>{trendPeriod}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
