
"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { format } from "date-fns";

type StatCardProps = {
  title: string;
  icon: React.ReactNode;
  collectionName: string;
  role?: "coach" | "owner";
  today?: boolean;
};

// MOCK DATA: Replace with your actual org ID when auth is back
const MOCK_ORGANIZATION_ID = "mock-org-id-for-testing";

export function StatCard({ title, icon, collectionName, role, today }: StatCardProps) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    // This component will currently not fetch real data without an authenticated user.
    // We are setting a mock count to allow UI development.
    // When authentication is re-enabled, this logic will need to be updated.
    
    // Simulate loading
    setCount(null);
    // Simulate fetching data
    setTimeout(() => {
        setCount(Math.floor(Math.random() * 100)); // Use random data for visuals
    }, 1000);

  }, [collectionName, role, today]);

  return (
    <Card className="transition-all duration-300 ease-out hover:bg-card/95 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {count === null ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold">{count}</div>
        )}
        <p className="text-xs text-muted-foreground">
          Using randomized mock data
        </p>
      </CardContent>
    </Card>
  );
}
