
"use client";

import { useEffect, useState } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MotionDiv } from "@/components/motion";
import { AddStadiumOwnerDialog } from "./add-stadium-owner-dialog";
import { StadiumOwnersTable } from "./stadium-owners-table";
import { StadiumOwner } from "@/lib/super-admin-types";


export function StadiumOwnerManager() {
  const [owners, setOwners] = useState<StadiumOwner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(firestore, "stadium_owners"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ownersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as StadiumOwner[];
      setOwners(ownersData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching stadium owners:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Stadium Owner Management</CardTitle>
                <CardDescription>
                    Create, view, and manage all customer (Stadium Owner) accounts.
                </CardDescription>
            </div>
             <AddStadiumOwnerDialog />
        </div>
      </CardHeader>
      <CardContent>
         {loading ? (
            <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        ) : (
            <StadiumOwnersTable data={owners} />
        )}
      </CardContent>
    </Card>
  );
}
