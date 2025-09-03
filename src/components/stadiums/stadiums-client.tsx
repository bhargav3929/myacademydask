
"use client";

import { useEffect, useState } from "react";
import { collection, query, onSnapshot, orderBy, where, doc, getDoc } from "firebase/firestore";
import { firestore, auth } from "@/lib/firebase";
import { Stadium } from "@/lib/types";
import { StadiumsTable } from "./stadiums-table";
import { Skeleton } from "@/components/ui/skeleton";
import { MotionDiv } from "../motion";
import dynamic from "next/dynamic";
import { RainbowButton } from "../ui/rainbow-button";
import { PlusCircle } from "lucide-react";

// Dynamically import the dialog component
const AddStadiumDialog = dynamic(
  () => import('./stadium-form-dialog').then(mod => mod.AddStadiumDialog),
  { 
    ssr: false,
    loading: () => (
      <RainbowButton disabled>
        <PlusCircle className="mr-2 h-4 w-4" />
        New Stadium
      </RainbowButton>
    )
  }
);


export function StadiumsClient() {
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
        if (user) {
            // Fetch the owner's organization ID from their user profile
            const userDocRef = doc(firestore, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const organizationId = userDocSnap.data().organizationId;
                if(organizationId) {
                    const q = query(
                        collection(firestore, "stadiums"),
                        where("organizationId", "==", organizationId),
                        orderBy("createdAt", "desc")
                    );

                    const unsubscribeSnap = onSnapshot(q, (snapshot) => {
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
                    
                    // Return the snapshot unsubscribe function to be called on cleanup
                    return () => unsubscribeSnap();
                }
            }
        }
        // If user is not logged in or doesn't have an org ID
        setLoading(false);
    });

    return () => unsubscribeAuth();
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
