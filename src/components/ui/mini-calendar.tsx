"use client";

import * as React from "react";
import {
  format,
  addWeeks,
  subWeeks,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const DAYS_OF_WEEK = [
  { key: "sun", label: "Sun" },
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
];

interface MiniCalendarProps {
    selected?: Date;
    onSelect: (date: Date) => void;
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({ selected, onSelect }) => {
  const [currentWeek, setCurrentWeek] = React.useState<Date>(selected || new Date());
  
  React.useEffect(() => {
    if(selected) {
        setCurrentWeek(selected);
    }
  }, [selected])

  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentWeek, { weekStartsOn: 0 }),
    end: endOfWeek(currentWeek, { weekStartsOn: 0 }),
  });

  return (
    <div className="w-full overflow-hidden rounded-lg">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-sm font-medium">
          {format(currentWeek, "MMMM yyyy")}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 text-center mb-2 px-2">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day.key}
            className="text-xs font-medium text-muted-foreground"
          >
            {day.label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 px-2">
        {weekDays.map((day) => {
          const isSelected =
            format(day, "yyyy-MM-dd") === format(selected || new Date(), "yyyy-MM-dd");

          return (
            <Button
              key={day.toString()}
              variant={isSelected ? "default" : "ghost"}
              className={cn(
                "h-9 w-9 p-0 font-normal",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
              )}
              onClick={() => onSelect(day)}
            >
              <time dateTime={format(day, "yyyy-MM-dd")}>
                {format(day, "d")}
              </time>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
