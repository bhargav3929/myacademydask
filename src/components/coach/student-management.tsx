
"use client";

import { useEffect, useState } from "react";
import { collection, query, onSnapshot, doc, getDoc } from "firebase/firestore";
import { firestore, auth } from "@/lib/firebase";
import { Student, Stadium, StudentBatches } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StudentsTable } from "./students-table";

const studentBatches: (StudentBatches | "all")[] = ["all", "First Batch", "Second Batch", "Third Batch", "Fourth Batch"];

export function StudentManagement() {
  const [stadium, setStadium] = useState<Stadium | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [batchFilter, setBatchFilter] = useState<StudentBatches | "all">("all");

  useEffect(() => {
    const fetchCoachData = async (uid: string) => {
        const userDocRef = doc(firestore, "users", uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists() && userDocSnap.data().assignedStadiums?.[0]) {
            const assignedStadiumId = userDocSnap.data().assignedStadiums[0];
            const stadiumDocRef = doc(firestore, "stadiums", assignedStadiumId);
            const stadiumDocSnap = await getDoc(stadiumDocRef);
            if (stadiumDocSnap.exists()) {
                setStadium({ id: stadiumDocSnap.id, ...stadiumDocSnap.data() } as Stadium);
            } else {
                 setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    const unsubscribeAuth = auth.onAuthStateChanged(user => {
        if (user) {
            fetchCoachData(user.uid);
        } else {
            setLoading(false);
        }
    });
    
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!stadium) return;

    const q = query(collection(firestore, `stadiums/${stadium.id}/students`));
    const unsubscribeStudents = onSnapshot(q, (snapshot) => {
        const studentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[];
        setAllStudents(studentsData);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching students: ", error);
        setLoading(false);
    });

    return () => unsubscribeStudents();
  }, [stadium]);
  
  useEffect(() => {
    if (batchFilter === "all") {
        setFilteredStudents(allStudents);
    } else {
        setFilteredStudents(allStudents.filter(s => s.batch === batchFilter));
    }
  }, [batchFilter, allStudents]);

  if (loading) {
    return (
        <Card>
            <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </CardContent>
        </Card>
    );
  }

  if (!stadium) {
      return (
          <Card>
              <CardHeader>
                  <CardTitle>No Stadium Assigned</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-muted-foreground">You have not been assigned to a stadium yet. Please contact your administrator.</p>
              </CardContent>
          </Card>
      )
  }

  return (
    <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Student List</CardTitle>
                    <CardDescription>
                        All students enrolled in {stadium.name}.
                    </CardDescription>
                </div>
                <div className="w-52">
                    <Select onValueChange={(value) => setBatchFilter(value as StudentBatches | "all")} value={batchFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by batch" />
                        </SelectTrigger>
                        <SelectContent>
                            {studentBatches.map(batch => (
                                <SelectItem key={batch} value={batch}>
                                    {batch === 'all' ? 'All Batches' : batch}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <StudentsTable students={filteredStudents} stadiumId={stadium.id} />
        </CardContent>
    </Card>
  );
}
