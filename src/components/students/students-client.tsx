
"use client";

import { useEffect, useState, useCallback } from "react";
import { collection, query, onSnapshot, orderBy, collectionGroup, where, doc, getDoc } from "firebase/firestore";
import { firestore, auth } from "@/lib/firebase";
import { Student, Stadium } from "@/lib/types";
import { StudentsTable } from "./students-table";
import { Skeleton } from "@/components/ui/skeleton";
import { MotionDiv } from "../motion";
import { StudentsToolbar } from "./students-toolbar";

export function StudentsClient() {
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  useEffect(() => {
      const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
          if (user) {
              const userDocRef = doc(firestore, "users", user.uid);
              const userDocSnap = await getDoc(userDocRef);
              if (userDocSnap.exists()) {
                  const orgId = userDocSnap.data().organizationId;
                  setOrganizationId(orgId);
              } else {
                  setLoading(false);
              }
          } else {
              setLoading(false);
          }
      });
      return () => unsubscribeAuth();
  }, []);

  const fetchStudentsAndStadiums = useCallback(() => {
    if (!organizationId) return;

    setLoading(true);
    const studentsQuery = query(
        collectionGroup(firestore, "students"), 
        where("organizationId", "==", organizationId)
    );
    const studentsUnsubscribe = onSnapshot(studentsQuery, (snapshot) => {
      const studentsData = snapshot.docs.map(doc => {
        const path = doc.ref.path.split('/');
        const stadiumId = path[1];
        return {
          id: doc.id,
          stadiumId, 
          ...doc.data(),
        } as Student;
      });
      setAllStudents(studentsData);
      setFilteredStudents(studentsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching students:", error);
      setLoading(false);
    });

    const stadiumsQuery = query(
        collection(firestore, "stadiums"),
        where("organizationId", "==", organizationId)
    );
    const stadiumsUnsubscribe = onSnapshot(stadiumsQuery, (snapshot) => {
        const stadiumsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Stadium[];
        setStadiums(stadiumsData);
    });

    return () => {
        studentsUnsubscribe();
        stadiumsUnsubscribe();
    };
  }, [organizationId]);

  useEffect(() => {
    const unsubscribe = fetchStudentsAndStadiums();
    return () => unsubscribe?.();
  }, [fetchStudentsAndStadiums]);

  const refreshStudents = () => {
    fetchStudentsAndStadiums();
  }

  return (
    <MotionDiv 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <StudentsToolbar 
        students={allStudents}
        stadiums={stadiums}
        setFilteredStudents={setFilteredStudents}
        onAddStudent={refreshStudents} 
      />
      {loading ? (
        <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <StudentsTable 
            students={filteredStudents} 
            allStadiums={stadiums} 
            refreshStudents={refreshStudents}
        />
      )}
    </MotionDiv>
  );
}
