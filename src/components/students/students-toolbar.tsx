
"use client"

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, PlusCircle, Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Student, Stadium } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import { StudentFormDialog } from "./student-form-dialog";
import { RainbowButton } from "../ui/rainbow-button";

type StudentsToolbarProps = {
  students: Student[];
  stadiums: Stadium[];
  setFilteredStudents: (students: Student[]) => void;
  onAddStudent: () => void;
};

export function StudentsToolbar({ students, stadiums, setFilteredStudents, onAddStudent }: StudentsToolbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [stadiumFilter, setStadiumFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<DateRange | undefined>();

  useEffect(() => {
    let filtered = students;

    if (searchQuery) {
      filtered = filtered.filter(student =>
        (student.fullName || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (stadiumFilter !== "all") {
      filtered = filtered.filter(student => student.stadiumId === stadiumFilter);
    }

    if (dateFilter?.from) {
        filtered = filtered.filter(student => {
            if (!student.joinDate) return false;
            const joinDate = student.joinDate.toDate();
            if (dateFilter.to) {
                return joinDate >= (dateFilter.from as Date) && joinDate <= (dateFilter.to as Date);
            }
            return joinDate >= (dateFilter.from as Date);
        });
    }

    setFilteredStudents(filtered);
  }, [searchQuery, stadiumFilter, dateFilter, students, setFilteredStudents]);

  const renderDateLabel = () => {
    if (!dateFilter?.from) return "Filter by join date";
    if (dateFilter.to) {
      return `${format(dateFilter.from, "LLL dd, y")} - ${format(
        dateFilter.to,
        "LLL dd, y"
      )}`;
    }
    return format(dateFilter.from, "LLL dd, y");
  };

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-2 md:flex-1">
        {/* Mobile layout */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date-mobile"
                variant="outline"
                className="flex h-11 w-11 items-center justify-center rounded-xl p-0"
              >
                <CalendarIcon className="h-4 w-4" />
                <span className="sr-only">Filter by join date</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateFilter?.from}
                selected={dateFilter}
                onSelect={setDateFilter}
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex h-11 w-11 items-center justify-center rounded-xl p-0"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="sr-only">Filter by stadium</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="end">
              <DropdownMenuLabel>Stadium</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={stadiumFilter} onValueChange={setStadiumFilter}>
                <DropdownMenuRadioItem value="all">All Stadiums</DropdownMenuRadioItem>
                {stadiums.map((stadium) => (
                  <DropdownMenuRadioItem key={stadium.id} value={stadium.id}>
                    {stadium.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop layout */}
        <div className="hidden items-center gap-2 md:flex">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students by name..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date-desktop"
                variant="outline"
                className={cn(
                  "w-[260px] justify-start text-left font-normal",
                  !dateFilter && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {renderDateLabel()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateFilter?.from}
                selected={dateFilter}
                onSelect={setDateFilter}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1.5">
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filter by Stadium</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Stadium</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={stadiumFilter} onValueChange={setStadiumFilter}>
                <DropdownMenuRadioItem value="all">All Stadiums</DropdownMenuRadioItem>
                {stadiums.map((stadium) => (
                  <DropdownMenuRadioItem key={stadium.id} value={stadium.id}>
                    {stadium.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <StudentFormDialog stadiums={stadiums} onFormSubmit={onAddStudent}>
        <RainbowButton
          disabled={stadiums.length === 0}
          className="h-11 w-full justify-center px-6 md:w-auto"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Student
        </RainbowButton>
      </StudentFormDialog>
    </div>
  );
}
