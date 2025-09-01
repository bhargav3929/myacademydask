
"use client";

import { useEffect, useState } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Student, Stadium } from "@/lib/types";
import { StudentsTable } from "./students-table";
import { Skeleton } from "@/components/ui/skeleton";
import { MotionDiv } from "../motion";
import { StudentsToolbar } from "./students-toolbar";

export function StudentsClient() {
  const [students, setStudents] = useState<Student[]>([]);
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  useEffect(() => {
    setLoading(true);
    // Listener for students
    const studentsQuery = query(collection(firestore, "students"), orderBy("joinDate", "desc"));
    const studentsUnsubscribe = onSnapshot(studentsQuery, (snapshot) => {
      const studentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Student[];
      setStudents(studentsData);
      setFilteredStudents(studentsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching students:", error);
      setLoading(false);
    });

    // Listener for stadiums
    const stadiumsQuery = query(collection(firestore, "stadiums"));
    const stadiumsUnsubscribe = onSnapshot(stadiumsQuery, (snapshot) => {
        const stadiumsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Stadium[];
        setStadiums(stadiumsData);
    });

    return () => {
        studentsUnsubscribe();
        stadiumsUnsubscribe();
    };
  }, []);

  return (
    <MotionDiv 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <StudentsToolbar 
        students={students}
        stadiums={stadiums}
        setFilteredStudents={setFilteredStudents}
      />
      {loading ? (
        <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <StudentsTable data={filteredStudents} stadiums={stadiums} />
      )}
    </MotionDiv>
  );
}
