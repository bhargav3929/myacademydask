
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Student } from "@/lib/types";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { User, Calendar, Layers3, MapPin, Hash, CircleDollarSign, Phone } from "lucide-react";

interface StudentProfileDialogProps {
  student: Student;
  children: React.ReactNode;
}

const badgeVariants: Record<Student['status'], string> = {
    active: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700",
    trial: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700",
    inactive: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700",
};

const InfoField = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number | undefined }) => (
    <div className="flex items-start gap-4">
        <div className="mt-1 text-muted-foreground">
            <Icon className="size-5" />
        </div>
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="font-medium text-base text-foreground">{value || "Not provided"}</p>
        </div>
    </div>
);

export function StudentProfileDialog({ student, children }: StudentProfileDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-card via-background to-secondary/30">
        <DialogHeader className="items-center text-center pt-4">
            <Avatar className="size-20 border-4 border-background shadow-md">
                <AvatarFallback className="text-3xl">{student.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <DialogTitle className="text-2xl pt-2">{student.fullName}</DialogTitle>
            <div className="flex items-center gap-2 pt-1">
                 <Badge variant="outline" className={cn(badgeVariants[student.status || 'active'], "capitalize text-sm py-1 px-3")}>
                    {student.status || 'Active'}
                 </Badge>
                 <Badge variant="secondary" className="text-sm py-1 px-3">
                    Joined {student.joinDate?.toDate ? format(student.joinDate.toDate(), "dd MMM, yyyy") : 'N/A'}
                 </Badge>
            </div>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-x-6 gap-y-6 py-6 px-2">
            <InfoField icon={Hash} label="Age" value={student.age} />
            <InfoField icon={Layers3} label="Batch" value={student.batch} />
            <InfoField icon={MapPin} label="Stadium ID" value={student.stadiumId.substring(0, 8) + '...'} />
            <InfoField icon={CircleDollarSign} label="Fees" value={`$${student.fees || 0}`} />
            <InfoField icon={Phone} label="Contact" value={student.contact} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
