
"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { StudentsTable } from "./students-table"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Student } from "@/lib/types";

export function StudentManagement() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [stadiumId, setStadiumId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoachData = async () => {
      if (user) {
        const coachDocRef = doc(firestore, "users", user.uid);
        const coachDocSnap = await getDoc(coachDocRef);
        if (coachDocSnap.exists()) {
          const coachData = coachDocSnap.data();
          if (coachData && coachData.assignedStadiums && coachData.assignedStadiums.length > 0) {
            setStadiumId(coachData.assignedStadiums[0]);
          }
        }
      }
    };
    fetchCoachData();
  }, [user]);

  const fetchStudents = useCallback(async () => {
    if (!user || !stadiumId) return;
    
    const studentsCollectionRef = collection(
      firestore,
      `stadiums/${stadiumId}/students`
    );
    
    const querySnapshot = await getDocs(studentsCollectionRef);
    const studentsList = querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Student)
    );
    setStudents(studentsList);
  }, [user, stadiumId]);

  useEffect(() => {
    if (stadiumId) {
        fetchStudents();
    }
  }, [stadiumId, fetchStudents]);


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
        </CardHeader>
        <CardContent>
            {stadiumId && user && (
                <StudentsTable
                students={students}
                stadiumId={stadiumId}
                coachId={user.uid}
                refreshStudents={fetchStudents}
                />
            )}
        </CardContent>
      </Card>
    </div>
  );
}
