
"use client";

import { useEffect, useState } from "react";
import { collection, query, onSnapshot, where } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Stadium } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building, MapPin } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.08,
      },
    }),
  };

export function ActiveStadiumsList({ organizationId }: { organizationId: string | null }) {
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(firestore, "stadiums"),
      where("organizationId", "==", organizationId),
      where("status", "==", "active")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const stadiumsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Stadium[];
        setStadiums(stadiumsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching active stadiums:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [organizationId]);

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <Building className="size-7 text-primary" />
          Active Stadiums
        </CardTitle>
        <CardDescription>
          A list of all stadiums currently marked as active in your organization.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
             <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
                        <Skeleton className="size-12 rounded-lg" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                ))}
             </div>
          ) : stadiums.length > 0 ? (
            <AnimatePresence>
                <div className="space-y-3">
                {stadiums.map((stadium, i) => (
                    <motion.div
                    key={stadium.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    custom={i}
                    className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    >
                    <div className="flex size-12 items-center justify-center rounded-lg bg-secondary">
                        <Building className="size-6 text-secondary-foreground" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold">{stadium.name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <MapPin className="size-3.5" />
                            {stadium.location}
                        </p>
                    </div>
                    </motion.div>
                ))}
                </div>
            </AnimatePresence>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-center text-muted-foreground">
              <p>No active stadiums found.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
