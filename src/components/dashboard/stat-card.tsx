
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
        setCount(0);
    }, 1000);

    // The original Firestore logic is commented out below for when auth is re-added.
    /*
    if (!MOCK_ORGANIZATION_ID) return;

    let q = query(
      collection(firestore, collectionName),
      where("organizationId", "==", MOCK_ORGANIZATION_ID)
    );

    if (role) {
      q = query(q, where("role", "==", role));
    }

    if (today) {
      const todayStr = format(new Date(), "yyyy-MM-dd");
      q = query(q, where("date", "==", todayStr), where("status", "==", "present"));
    }

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        setCount(querySnapshot.size);
      },
      (error) => {
        console.error(`Error fetching ${collectionName}: `, error);
        setCount(0);
      }
    );

    return () => unsubscribe();
    */
  }, [collectionName, role, today]);

  return (
    <Card className="transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
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
          Live data is currently disabled
        </p>
      </CardContent>
    </Card>
  );
}
