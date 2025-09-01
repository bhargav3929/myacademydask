
"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Stadium } from "@/lib/types";
import { StadiumsTable } from "./stadiums-table";
import { AddStadiumDialog } from "./stadium-form-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { MotionDiv } from "../motion";

// MOCK DATA: Replace with your actual org ID when auth is back
const MOCK_ORGANIZATION_ID = "mock-org-id-for-testing";

export function StadiumsClient() {
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(firestore, "stadiums"),
      where("organizationId", "==", MOCK_ORGANIZATION_ID),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const stadiumsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Stadium[];
      setStadiums(stadiumsData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching stadiums:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <MotionDiv 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <div className="flex justify-end">
        <AddStadiumDialog />
      </div>
      {loading ? (
        <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <StadiumsTable data={stadiums} />
      )}
    </MotionDiv>
  );
}
