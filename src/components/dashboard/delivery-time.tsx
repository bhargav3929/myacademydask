
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../ui/button";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function DeliveryTime() {
    
    const deliveryOptions = [
        { region: 'Europe', time: '3 Days Delivery', color: 'blue', progress: '70%' },
        { region: 'West Asia', time: '4 Days Delivery', color: 'green', progress: '50%' },
        { region: 'East Asia', time: '5 Days Delivery', color: 'yellow', progress: '80%' },
    ]

    const colorClasses = {
        blue: {
            bg: 'bg-blue-500',
            text: 'text-white',
            progressBg: 'bg-blue-100',
        },
        green: {
            bg: 'bg-green-500',
            text: 'text-white',
            progressBg: 'bg-green-100',
        },
        yellow: {
            bg: 'bg-yellow-500',
            text: 'text-white',
            progressBg: 'bg-yellow-100',
        }
    }

  return (
    <Card className="shadow-sm border-none">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Delivery time</CardTitle>
        <Clock className="size-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        {deliveryOptions.map(option => {
            const colors = colorClasses[option.color as keyof typeof colorClasses];
            return (
                <div key={option.region}>
                    <p className="text-sm font-medium mb-2">{option.region}</p>
                    <div className="relative w-full h-10 rounded-full overflow-hidden bg-muted">
                        <div 
                            className={cn("absolute left-0 top-0 h-full rounded-full", colors.bg)}
                            style={{width: option.progress}}
                        />
                        <div className="absolute inset-0 flex items-center justify-between px-3">
                            <div className="flex items-center gap-2">
                                 <Clock className={cn("size-4", colors.text)} />
                                <span className={cn("font-semibold text-sm", colors.text)}>{option.time}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )
        })}
      </CardContent>
    </Card>
  );
}
