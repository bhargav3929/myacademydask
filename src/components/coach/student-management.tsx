
"use client";

import { StudentsTable } from "./students-table"; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Student, Stadium } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

interface StudentManagementProps {
  students: Student[];
  stadiumId: string | null | undefined;
  allStadiums: Stadium[];
  coachId: string | null | undefined;
  refreshStudents: () => void;
  loading: boolean;
}

export function StudentManagement({ students, stadiumId, allStadiums, coachId, refreshStudents, loading }: StudentManagementProps) {

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Roster</CardTitle>
           <CardDescription>View, edit, or manage the students enrolled in your stadium.</CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : stadiumId && coachId ? (
                <StudentsTable
                  students={students}
                  stadiumId={stadiumId}
                  allStadiums={allStadiums}
                  coachId={coachId}
                  refreshStudents={refreshStudents}
                />
            ) : (
              <p className="text-muted-foreground text-center py-8">Your student roster will appear here once your details are loaded.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
