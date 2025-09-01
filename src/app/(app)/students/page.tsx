
import { StudentsClient } from "@/components/students/students-client";

export default function StudentsPage() {
  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
       <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Student Management</h2>
          <p className="text-muted-foreground">
            View, add, and manage all students in your organization.
          </p>
        </div>
      </div>
      <StudentsClient />
    </div>
  );
}
