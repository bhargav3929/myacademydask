"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
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

export function StatCard({ title, icon, collectionName, role, today }: StatCardProps) {
  const { user, userData } = useAuth();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user || !userData?.organizationId) return;

    let q = query(
      collection(firestore, collectionName),
      where("organizationId", "==", userData.organizationId)
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
  }, [user, userData, collectionName, role, today]);

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
          Based on your organization&apos;s data
        </p>
      </CardContent>
    </Card>
  );
}
