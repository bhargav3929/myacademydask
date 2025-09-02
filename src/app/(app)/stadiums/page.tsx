
import { StadiumsClient } from "@/components/stadiums/stadiums-client";
import { MotionDiv } from "@/components/motion";

export default function StadiumsPage() {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
       <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Stadium Management</h2>
          <p className="text-muted-foreground">
            View, add, and manage all stadiums and their assigned coaches.
          </p>
        </div>
      </div>
      <StadiumsClient />
    </MotionDiv>
  );
}
