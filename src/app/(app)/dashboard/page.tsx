"use client";

import { useEffect, useState, useCallback } from "react";
import { collection, query, where, onSnapshot, getDocs, limit, orderBy, doc, getDoc, collectionGroup, Timestamp } from "firebase/firestore";
import { firestore, auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { MotionDiv } from "@/components/motion";
import { StatCard } from "@/components/dashboard/stat-card";
import { NewAdmissions } from "@/components/dashboard/new-admissions";
import { Student } from "@/lib/types";
import { AnimatedText } from "@/components/ui/animated-underline-text-one";
import { Skeleton } from "@/components/ui/skeleton";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { AttendanceGraph } from "@/components/dashboard/attendance-graph";
import { Button } from "@/components/ui/button";
import { startOfToday, startOfYesterday, endOfYesterday, startOfWeek, endOfWeek, subMonths, format, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, SlidersHorizontal, PlusIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TotalStudentsGraph } from "@/components/dashboard/graphs/total-students-graph";
import { NewStudentsGraph } from "@/components/dashboard/graphs/new-students-graph";
import { TotalRevenueGraph } from "@/components/dashboard/graphs/total-revenue-graph";
import { ActiveStadiumsList } from "@/components/dashboard/graphs/active-stadiums-list";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useCurrency, Currency } from "@/contexts/CurrencyContext";
import { AddStadiumDialog } from "@/components/stadiums/stadium-form-dialog";
import { RainbowButton } from "@/components/ui/rainbow-button";

type TimeFilter = "today" | "yesterday" | "weekly" | "monthly" | "all" | "custom";

export default function DashboardPage() {
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [totalStudentsFiltered, setTotalStudentsFiltered] = useState(0); 
  const [totalRevenueFiltered, setTotalRevenueFiltered] = useState(0); 
  const [recentAdmissions, setRecentAdmissions] = useState<Student[]>([]);
  const [directorName, setDirectorName] = useState("");
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true); 
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [activeStadiums, setActiveStadiums] = useState(0);
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>();
  
  const [mobileCustomPopoverOpen, setMobileCustomPopoverOpen] = useState(false);

  const [isCreateStadiumOpen, setCreateStadiumOpen] = useState(false);
  const { currency } = useCurrency();

  const filterStudentsByDate = useCallback((students: Student[], filter: TimeFilter, dateRange?: DateRange) => {
    const now = new Date();
    let startTime: Date | undefined;
    let endTime: Date | undefined;

    switch (filter) {
        case "today":
            startTime = startOfToday();
            endTime = endOfDay(now);
            break;
        case "yesterday":
            startTime = startOfYesterday();
            endTime = endOfYesterday();
            break;
        case "weekly":
            startTime = startOfWeek(now);
            endTime = endOfDay(now);
            break;
        case "monthly":
            startTime = subMonths(now, 1);
            endTime = endOfDay(now);
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
            return joinDate >= startTime! && (endTime ? joinDate <= endTime : true);
         });
     }
     return students; 
  }, []);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user && !directorName) { 
        const userDocRef = doc(firestore, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          if (userData.role === 'owner') {
            const orgId = userData.organizationId;
            setOrganizationId(orgId);
            setDirectorName(userData.fullName || "Academy Director");
          }
        }
      }
    });
    return () => unsubscribeAuth();
  }, [directorName]);

  useEffect(() => {
    if (!organizationId) return;

    setIsLoadingInitialData(true);
    const studentsQuery = query(
        collectionGroup(firestore, "students"),
        where("organizationId", "==", organizationId)
    );

    const unsubscribeStudents = onSnapshot(studentsQuery, snapshot => {
      const studentsData = snapshot.docs.map(doc => {
          const path = doc.ref.path.split('/');
          const stadiumId = path[1];
          return { id: doc.id, stadiumId, ...doc.data() } as Student;
      });
      setAllStudents(studentsData);
      setIsLoadingInitialData(false);
    }, error => {
      console.error("Error fetching all students:", error);
      setIsLoadingInitialData(false);
    });

    const stadiumsQuery = query(
        collection(firestore, "stadiums"), 
        where("organizationId", "==", organizationId),
        where("status", "==", "active")
    );
    const unsubscribeStadiums = onSnapshot(stadiumsQuery, (snapshot) => {
        setActiveStadiums(snapshot.size);
    });
    
    return () => {
        unsubscribeStudents();
        unsubscribeStadiums();
    };
  }, [organizationId]); 

  useEffect(() => {
    if (isLoadingInitialData && allStudents.length === 0 && organizationId) {
      return; 
    }

    const filtered = filterStudentsByDate(allStudents, timeFilter, customDateRange);
    setFilteredStudents(filtered);
    setTotalStudentsFiltered(filtered.length);

    const revenue = filtered.reduce((acc, student) => acc + (student.fees || 0), 0);
    setTotalRevenueFiltered(revenue);
    
    setRecentAdmissions(
        [...filtered]
        .sort((a,b) => b.joinDate.toMillis() - a.joinDate.toMillis())
        .slice(0, 5)
    );

  }, [allStudents, timeFilter, customDateRange, filterStudentsByDate, organizationId, isLoadingInitialData]); 

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

  const handleFilterClick = (filter: TimeFilter) => {
    setTimeFilter(filter);
    if (filter !== 'custom') {
      setCustomDateRange(undefined);
    }
  };

  const getLocaleForCurrency = (c: Currency) => {
    const map: { [key in Currency]: string } = {
        USD: 'en-US',
        INR: 'en-IN',
        EUR: 'de-DE',
        GBP: 'en-GB',
        AED: 'ar-AE'
    };
    return map[c];
  }

  const formattedRevenue = new Intl.NumberFormat(getLocaleForCurrency(currency), {
    style: 'currency',
    currency: currency,
  }).format(totalRevenueFiltered);

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
        {/* Header Section */}
        <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="space-y-1.5 self-start">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight flex-shrink-0">
                            Welcome Back,
                        </h1>
                        {isLoadingInitialData || !directorName ? (
                            <Skeleton className="h-8 w-48" />
                        ) : (
                            <AnimatedText 
                                text={`${directorName}! 👋`} 
                                textClassName="text-xl md:text-2xl font-bold tracking-tight text-primary"
                                underlineClassName="text-primary/50"
                            />
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground hidden md:block">
                        Here&apos;s a summary of your academy&apos;s performance.
                    </p>
                </div>

                {/* Desktop: Create Stadium Button (visible on md screens and up) */}
                <div className="hidden md:flex items-center gap-2">
                    <Dialog open={isCreateStadiumOpen} onOpenChange={setCreateStadiumOpen}>
                        <DialogTrigger asChild>
                            <RainbowButton>
                                <PlusIcon className="mr-2 h-4 w-4" />
                                Create Stadium
                            </RainbowButton>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl w-full mx-4 sm:mx-auto">
                            <DialogHeader>
                            <DialogTitle>Create a New Stadium & Assign a Coach</DialogTitle>
                            <DialogDescription>
                                Fill in the details below to add a new stadium and create a new coach account.
                            </DialogDescription>
                            </DialogHeader>
                            <AddStadiumDialog />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>

        {/* Mobile: Create Stadium & Filters Row */}
        <div className="flex md:hidden items-center justify-between">
            <Dialog open={isCreateStadiumOpen} onOpenChange={setCreateStadiumOpen}>
                <DialogTrigger asChild>
                    <RainbowButton className="h-9 px-4 text-sm">
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Create Stadium
                    </RainbowButton>
                </DialogTrigger>
                <DialogContent className="max-w-2xl w-full mx-4 sm:mx-auto">
                    <DialogHeader>
                        <DialogTitle>Create a New Stadium & Assign a Coach</DialogTitle>
                        <DialogDescription>
                        Fill in the details below to add a new stadium and create a new coach account.
                        </DialogDescription>
                    </DialogHeader>
                    <AddStadiumDialog />
                </DialogContent>
            </Dialog>

            {/* Mobile Filters Dropdown */}
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                                <SlidersHorizontal className="size-4" />
                            <span>{getFilterPeriodText()}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                            {([ "today", "weekly", "monthly", "all"] as TimeFilter[]).map(filter => (
                            <DropdownMenuItem key={filter} onSelect={() => handleFilterClick(filter)} className="capitalize">
                                {filter}
                            </DropdownMenuItem>
                        ))}
                            <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            onSelect={() => {
                                setTimeFilter('custom');
                                setMobileCustomPopoverOpen(true);
                            }}
                        >
                                <CalendarIcon className="mr-2 size-4" /> Custom Range
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                    <Popover open={mobileCustomPopoverOpen} onOpenChange={setMobileCustomPopoverOpen}>
                    <PopoverTrigger asChild><span /></PopoverTrigger>
                    <PopoverContent className="w-auto p-0 mt-2" align="end">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={customDateRange?.from}
                            selected={customDateRange}
                            onSelect={(range) => {
                                setCustomDateRange(range);
                                if (range?.from) setMobileCustomPopoverOpen(false);
                            }}
                            numberOfMonths={1}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>

        {/* Desktop Filters */}
        <div className="hidden md:flex items-center justify-end gap-1.5 flex-wrap rounded-full border bg-card p-1">
            {([ "today", "weekly", "monthly", "all"] as TimeFilter[]).map(filter => (
                <Button 
                    key={filter} 
                    variant={timeFilter === filter ? 'secondary' : 'ghost'} 
                    className="rounded-full capitalize text-sm h-8 px-3"
                    onClick={() => handleFilterClick(filter)} 
                >
                    {filter}
                </Button>
            ))}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={timeFilter === 'custom' ? 'secondary' : 'ghost'} 
                        className="rounded-full capitalize text-sm h-8 px-3 flex items-center gap-1.5"
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

        {/* Stat Cards */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <div>
                <Dialog>
                    <DialogTrigger asChild>
                        <div className="cursor-pointer">
                            <StatCard
                                title="Total Students"
                                value={totalStudentsFiltered.toString()}
                                icon="Users"
                                trendPeriod="Across all stadiums"
                                primary
                            />
                        </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl w-full mx-4 sm:mx-auto">
                        <DialogHeader>
                            <DialogTitle className="sr-only">Total Students Graph</DialogTitle>
                            <DialogDescription className="sr-only">A graph showing the growth of total students over time.</DialogDescription>
                        </DialogHeader>
                        <TotalStudentsGraph organizationId={organizationId} />
                    </DialogContent>
                </Dialog>
            </div>
            <div>
                <Dialog>
                    <DialogTrigger asChild>
                        <div className="cursor-pointer">
                            <StatCard
                                title="New Students Joined"
                                value={filteredStudents.length.toString()}
                                icon="UserPlus"
                                trendPeriod={getFilterPeriodText()}
                            />
                        </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl w-full mx-4 sm:mx-auto">
                        <DialogHeader>
                            <DialogTitle className="sr-only">New Students Graph</DialogTitle>
                            <DialogDescription className="sr-only">A graph showing new student admissions over time.</DialogDescription>
                        </DialogHeader>
                        <NewStudentsGraph organizationId={organizationId} />
                    </DialogContent>
                </Dialog>
            </div>
            <div>
                <Dialog>
                    <DialogTrigger asChild>
                        <div className="cursor-pointer">
                        <StatCard
                            title="Total Revenue"
                            value={formattedRevenue}
                            icon="DollarSign"
                            trendPeriod={getFilterPeriodText()}
                        />
                        </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl w-full mx-4 sm:mx-auto">
                        <DialogHeader>
                            <DialogTitle className="sr-only">Total Revenue Graph</DialogTitle>
                            <DialogDescription className="sr-only">A graph showing total revenue from new admissions over time.</DialogDescription>
                        </DialogHeader>
                        <TotalRevenueGraph organizationId={organizationId} />
                    </DialogContent>
                </Dialog>
            </div>
            <div>
                <Dialog>
                    <DialogTrigger asChild>
                        <div className="cursor-pointer">
                            <StatCard
                                title="Active Stadiums"
                                value={activeStadiums.toString()}
                                icon="Building"
                                trendPeriod="Online now"
                            />
                        </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl w-full mx-4 sm:mx-auto">
                        <DialogHeader>
                            <DialogTitle className="sr-only">Active Stadiums List</DialogTitle>
                            <DialogDescription className="sr-only">A list of all active stadiums.</DialogDescription>
                        </DialogHeader>
                        <ActiveStadiumsList organizationId={organizationId} />
                    </DialogContent>
                </Dialog>
            </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            <div className="lg:col-span-3">
                <AttendanceGraph organizationId={organizationId} />
            </div>
            <div className="lg:col-span-1">
                <RecentActivity organizationId={organizationId} />
            </div>
        </div>

        <div>
            <NewAdmissions data={recentAdmissions} />
        </div>
    </MotionDiv>
  );
}
