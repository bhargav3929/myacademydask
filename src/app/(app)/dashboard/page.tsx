
import { MotionDiv } from "@/components/motion";
import { StatCard } from "@/components/dashboard/stat-card";
import { ShipmentStatistics } from "@/components/dashboard/shipment-statistics";
import { LiveTracking } from "@/components/dashboard/recent-activity";
import { DeliveryTime } from "@/components/dashboard/delivery-time";
import { ShippingList } from "@/components/dashboard/shipping-list";

export default function DashboardPage() {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <MotionDiv
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6"
    >
      <MotionDiv variants={itemVariants}>
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight">
            Good Morning, Owner! 👋
          </h1>
          <p className="text-muted-foreground">
            You can follow all new data here.
          </p>
        </div>
      </MotionDiv>
      
      <MotionDiv
        variants={containerVariants}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <MotionDiv variants={itemVariants}>
          <StatCard
            title="Total Students"
            value="248"
            icon="Users"
            trendValue="+16.2%"
            trendPeriod="+124 today"
            primary
          />
        </MotionDiv>
        <MotionDiv variants={itemVariants}>
          <StatCard
            title="Pending Applications"
            value="64"
            icon="Package"
            trendValue="-12.4%"
            trendPeriod="-12 today"
            trendColor="text-red-500"
          />
        </MotionDiv>
        <MotionDiv variants={itemVariants}>
          <StatCard
            title="Active Stadiums"
            value="32"
            icon="Building"
            trendValue="+18.6%"
            trendPeriod="+16 today"
          />
        </MotionDiv>
      </MotionDiv>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <MotionDiv variants={itemVariants} className="lg:col-span-3">
            <ShipmentStatistics />
        </MotionDiv>
        <div className="lg:col-span-2 space-y-6">
            <MotionDiv variants={itemVariants}>
                <LiveTracking />
            </MotionDiv>
            <MotionDiv variants={itemVariants}>
                <DeliveryTime />
            </MotionDiv>
        </div>
      </div>

       <MotionDiv variants={itemVariants}>
          <ShippingList />
        </MotionDiv>
    </MotionDiv>
  );
}
