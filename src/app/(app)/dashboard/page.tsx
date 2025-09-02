
"use client";

import { useEffect, useState, useCallback } from "react";
import { collection, query, where, onSnapshot, getDocs, limit, orderBy, doc, getDoc, collectionGroup, Timestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { MotionDiv } from "@/components/motion";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentRegistrations } from "@/components/dashboard/recent-registrations";
import { Student } from "@/lib/types";
import { AnimatedText } from "@/components/ui/animated-underline-text-one";
import { Skeleton } from "@/components/ui/skeleton";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { AttendanceChart } from "@/components/dashboard/attendance-chart";
import { Button } from "@/components/ui/button";
import { startOfToday, startOfYesterday, endOfYesterday, startOfWeek, endOfWeek, subMonths, format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";

const MOCK_ORGANIZATION_ID = "mock-org-id-for-testing"; // Replace with actual org ID from auth
const MOCK_USER_ID = "mock-owner-id"; // For fetching director's name

type TimeFilter = "today" | "yesterday" | "weekly" | "monthly" | "all" | "custom";

export default function DashboardPage() {
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [recentRegistrations, setRecentRegistrations] = useState<Student[]>([]);
  const [directorName, setDirectorName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [activeStadiums, setActiveStadiums] = useState(0);
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>();

  const filterStudentsByDate = useCallback((students: Student[], filter: TimeFilter, dateRange?: DateRange) => {
    const now = new Date();
    let startTime: Date | undefined;
    let endTime: Date | undefined;

    switch (filter) {
        case "today":
            startTime = startOfToday();
            break;
        case "yesterday":
            startTime = startOfYesterday();
            endTime = endOfYesterday();
            break;
        case "weekly":
            startTime = startOfWeek(now);
            break;
        case "monthly":
            startTime = subMonths(now, 1);
            break;
        case "custom":
            if (dateRange?.from) {
                startTime = dateRange.from;
                endTime = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
            }
            break;
        case "all":
            return students;
        default:
            return students;
    }
     if (startTime) {
         return students.filter(student => {
            const joinDate = student.joinDate.toDate();
            if (endTime) {
                return joinDate >= startTime! && joinDate <= endTime;
            }
            return joinDate >= startTime!;
         });
     }
     return students;
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const studentsQuery = query(collectionGroup(firestore, "students"));

    const unsubscribe = onSnapshot(studentsQuery, snapshot => {
      const studentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
      setAllStudents(studentsData);
      
      const filtered = filterStudentsByDate(studentsData, timeFilter, customDateRange);
      setFilteredStudents(filtered);

      setTotalStudents(studentsData.length);
      
      setIsLoading(false);
    }, error => {
      console.error("Error fetching students:", error);
      setIsLoading(false);
    });

    const fetchDirectorName = async () => {
        try {
            const userDocRef = doc(firestore, "users", MOCK_USER_ID);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                setDirectorName(userDocSnap.data().fullName || "Academy Director");
            }
        } catch (error) {
            console.error("Failed to fetch director's name:", error);
            setDirectorName("Academy Director");
        }
    };

    const stadiumsQuery = query(collection(firestore, "stadiums"), where("status", "==", "active"));
    const unsubscribeStadiums = onSnapshot(stadiumsQuery, (snapshot) => {
        setActiveStadiums(snapshot.size);
    });
    
    fetchDirectorName();

    return () => {
        unsubscribe();
        unsubscribeStadiums();
    };
  }, [timeFilter, filterStudentsByDate, customDateRange]);

  useEffect(() => {
    const revenue = filteredStudents.reduce((acc, student) => acc + (student.fees || 0), 0);
    setTotalRevenue(revenue);
    
    setRecentRegistrations(
        [...filteredStudents]
        .sort((a,b) => b.joinDate.toMillis() - a.joinDate.toMillis())
        .slice(0, 5)
    );

  }, [filteredStudents]);


  const getFilterPeriodText = () => {
    switch (timeFilter) {
      case 'today': return "Today";
      case 'yesterday': return "Yesterday";
      case 'weekly': return "This week";
      case 'monthly': return "Last 30 days";
      case 'custom': 
        if (customDateRange?.from) {
            if(customDateRange.to) {
                 return `${format(customDateRange.from, "LLL dd, y")} - ${format(customDateRange.to, "LLL dd, y")}`;
            }
            return format(customDateRange.from, "LLL dd, y");
        }
        return "Custom Range";
      case 'all': return "All time";
    }
  }


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

  const formattedRevenue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(totalRevenue);

  return (
    <MotionDiv
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-8"
    >
      <MotionDiv variants={itemVariants}>
        <div className="flex justify-between items-center">
            <div className="space-y-0.5">
            <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">
                    Welcome Back,
                </h1>
                {isLoading ? (
                    <Skeleton className="h-8 w-48" />
                ) : (
                    <AnimatedText 
                        text={`${directorName}! 👋`} 
                        textClassName="text-2xl font-bold tracking-tight text-primary"
                        underlineClassName="text-primary/50"
                    />
                )}
            </div>
            <p className="text-muted-foreground">
                Here's a snapshot of your academy's performance.
            </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border bg-card p-1">
                {(["today", "weekly", "monthly", "all"] as TimeFilter[]).map(filter => (
                    <Button 
                        key={filter} 
                        variant={timeFilter === filter ? 'secondary' : 'ghost'} 
                        className="rounded-full capitalize text-sm h-8 px-4"
                        onClick={() => setTimeFilter(filter)}
                    >
                        {filter}
                    </Button>
                ))}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={timeFilter === 'custom' ? 'secondary' : 'ghost'} 
                            className="rounded-full capitalize text-sm h-8 px-4 flex items-center gap-1.5"
                            onClick={() => setTimeFilter('custom')}
                        >
                            Custom
                            <CalendarIcon className="size-3.5 text-muted-foreground" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 mt-2" align="end">
                        <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={customDateRange?.from}
                        selected={customDateRange}
                        onSelect={setCustomDateRange}
                        numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
      </MotionDiv>
      
      <MotionDiv
        variants={containerVariants}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <MotionDiv variants={itemVariants}>
          <StatCard
            title="Total Students"
            value={totalStudents.toString()}
            icon="Users"
            trendPeriod="Across all stadiums"
            primary
          />
        </MotionDiv>
        <MotionDiv variants={itemVariants}>
          <StatCard
            title="New Students Joined"
            value={filteredStudents.length.toString()}
            icon="UserPlus"
            trendPeriod={getFilterPeriodText()}
          />
        </MotionDiv>
        <MotionDiv variants={itemVariants}>
          <StatCard
            title="Total Revenue"
            value={formattedRevenue}
            icon="DollarSign"
            trendPeriod={getFilterPeriodText()}
          />
        </MotionDiv>
         <MotionDiv variants={itemVariants}>
          <StatCard
            title="Active Stadiums"
            value={activeStadiums.toString()}
            icon="Building"
            trendPeriod="Online now"
          />
        </MotionDiv>
      </MotionDiv>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <MotionDiv variants={itemVariants} className="lg:col-span-3">
            <AttendanceChart />
        </MotionDiv>
         <MotionDiv variants={itemVariants} className="lg:col-span-2">
            <RecentActivity />
        </MotionDiv>
      </div>

       <MotionDiv variants={itemVariants}>
          <RecentRegistrations data={recentRegistrations} />
        </MotionDiv>
    </MotionDiv>
  );
}
