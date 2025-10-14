
"use client";

import { useEffect, useState } from "react";
import { collection, collectionGroup, onSnapshot, orderBy, query } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MotionDiv } from "@/components/motion";
import { AddStadiumOwnerDialog } from "./add-stadium-owner-dialog";
import { StadiumOwnersTable } from "./stadium-owners-table";
import { StadiumOwner } from "@/lib/super-admin-types";

type OwnerStatsMap = Record<string, { totalStudents: number; totalRevenue: number }>;
type OwnerStadiumMap = Record<string, number>;


export function StadiumOwnerManager() {
  const [owners, setOwners] = useState<StadiumOwner[]>([]);
  const [ownerStats, setOwnerStats] = useState<OwnerStatsMap>({});
  const [stadiumCounts, setStadiumCounts] = useState<OwnerStadiumMap>({});
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

  useEffect(() => {
    const stadiumsQuery = query(collection(firestore, "stadiums"));
    const unsubscribe = onSnapshot(
      stadiumsQuery,
      (snapshot) => {
        const counts: OwnerStadiumMap = {};
        snapshot.forEach((document) => {
          const data = document.data() as { organizationId?: string | null };
          const organizationId = data.organizationId;
          if (!organizationId) {
            return;
          }
          counts[organizationId] = (counts[organizationId] ?? 0) + 1;
        });
        setStadiumCounts(counts);
      },
      (error) => {
        console.error("Error fetching stadium data:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const studentsQuery = query(collectionGroup(firestore, "students"));
    const unsubscribe = onSnapshot(
      studentsQuery,
      (snapshot) => {
        const stats: OwnerStatsMap = {};
        snapshot.forEach((document) => {
          const data = document.data() as {
            organizationId?: string | null;
            fees?: number;
          };
          const organizationId = data.organizationId;
          if (!organizationId) {
            return;
          }
          if (!stats[organizationId]) {
            stats[organizationId] = { totalStudents: 0, totalRevenue: 0 };
          }
          stats[organizationId].totalStudents += 1;
          const feesValue = (() => {
            if (typeof data.fees === "number" && !Number.isNaN(data.fees)) {
              return data.fees;
            }
            if (typeof data.fees === "string") {
              const parsed = Number(data.fees);
              return Number.isFinite(parsed) ? parsed : 0;
            }
            return 0;
          })();
          stats[organizationId].totalRevenue += feesValue;
        });
        setOwnerStats(stats);
      },
      (error) => {
        console.error("Error fetching students data:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  const ownersWithStats = owners.map((owner) => ({
    ...owner,
    totalStadiums: stadiumCounts[owner.id] ?? 0,
    totalStudents: ownerStats[owner.id]?.totalStudents ?? 0,
    totalRevenue: ownerStats[owner.id]?.totalRevenue ?? 0,
  }));

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
            <StadiumOwnersTable data={ownersWithStats} />
        )}
      </CardContent>
    </Card>
  );
}
