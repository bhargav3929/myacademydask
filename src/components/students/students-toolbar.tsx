
"use client"

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AddStudentDialog } from "./student-form-dialog";
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
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

type StudentsToolbarProps = {
  students: Student[];
  stadiums: Stadium[];
  setFilteredStudents: (students: Student[]) => void;
};

export function StudentsToolbar({ students, stadiums, setFilteredStudents }: StudentsToolbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [stadiumFilter, setStadiumFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<DateRange | undefined>();

  useEffect(() => {
    let filtered = students;

    if (searchQuery) {
      filtered = filtered.filter(student =>
        student.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (stadiumFilter !== "all") {
      filtered = filtered.filter(student => student.stadiumId === stadiumFilter);
    }

    if (dateFilter?.from) {
        filtered = filtered.filter(student => {
            const joinDate = student.joinDate.toDate();
            if (dateFilter.to) {
                return joinDate >= dateFilter.from && joinDate <= dateFilter.to;
            }
            return joinDate >= dateFilter.from;
        });
    }

    setFilteredStudents(filtered);
  }, [searchQuery, stadiumFilter, dateFilter, students, setFilteredStudents]);

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-1 items-center gap-2">
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
                id="date"
                variant={"outline"}
                className={cn(
                "w-[260px] justify-start text-left font-normal",
                !dateFilter && "text-muted-foreground"
                )}
            >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFilter?.from ? (
                dateFilter.to ? (
                    <>
                    {format(dateFilter.from, "LLL dd, y")} -{" "}
                    {format(dateFilter.to, "LLL dd, y")}
                    </>
                ) : (
                    format(dateFilter.from, "LLL dd, y")
                )
                ) : (
                <span>Filter by join date</span>
                )}
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
              {stadiums.map(stadium => (
                <DropdownMenuRadioItem key={stadium.id} value={stadium.id}>{stadium.name}</DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
      <AddStudentDialog stadiums={stadiums} />
    </div>
  );
}

