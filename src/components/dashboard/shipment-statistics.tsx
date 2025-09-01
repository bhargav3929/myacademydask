
"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Dot, ReferenceLine } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { MoreHorizontal } from "lucide-react";

type ChartData = {
  name: string;
  Shipment: number;
  Delivery: number;
};

// MOCK DATA
const generateMockData = (): ChartData[] => {
    return [
        { name: 'Dec', Shipment: 20, Delivery: 28 },
        { name: 'Jan', Shipment: 18, Delivery: 25 },
        { name: 'Feb', Shipment: 22, Delivery: 30 },
        { name: 'Mar', Shipment: 20, Delivery: 28 },
        { name: 'Apr', Shipment: 25, Delivery: 32 },
        { name: 'May', Shipment: 23, Delivery: 30 },
        { name: 'Jun', Shipment: 28, Delivery: 35 },
        { name: 'Jul', Shipment: 26, Delivery: 34 },
        { name: 'Aug', Shipment: 30, Delivery: 38 },
        { name: 'Sep', Shipment: 28, Delivery: 36 },
        { name: 'Oct', Shipment: 32, Delivery: 40 },
        { name: 'Nov', Shipment: 30, Delivery: 38 },
    ];
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="font-bold mb-2">{label}</p>
        <div className="flex flex-col space-y-1 mt-1">
            {payload.map((p: any, i: number) => (
                <div key={i} className="flex items-center gap-2">
                    <div className="size-2.5 rounded-full" style={{backgroundColor: p.stroke}}/>
                    <span className="text-sm text-muted-foreground">{`${p.name}:`}</span>
                    <span className="text-sm font-bold">{p.value}%</span>
                </div>
            ))}
        </div>
      </div>
    );
  }

  return null;
};

const CustomActiveDot = ({ cx, cy, stroke, payload, value }: any) => {
    return <Dot cx={cx} cy={cy} r={5} fill={stroke} stroke="white" strokeWidth={2} />;
};

export function ShipmentStatistics() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
        setData(generateMockData());
        setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const julDataPoint = data.find(d => d.name === 'Jul');

  return (
    <Card className="h-full flex flex-col shadow-sm border-none">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle className="text-lg font-semibold">Shipment Statistics</CardTitle>
        </div>
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm">
                <div className="size-2 rounded-full bg-primary" />
                <span className="text-muted-foreground">Shipment</span>
            </div>
             <div className="flex items-center gap-2 text-sm">
                <div className="size-2 rounded-full" style={{backgroundColor: "#82ca9d"}} />
                <span className="text-muted-foreground">Delivery</span>
            </div>
            <Button variant="outline" size="sm">Monthly</Button>
            <Button variant="ghost" size="icon" className="size-6">
                <MoreHorizontal className="size-4" />
            </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow pb-4 -ml-4">
        {loading ? (
          <Skeleton className="w-full h-[250px] rounded-md" />
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart 
                data={data}
                margin={{ top: 5, right: 20, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorShipment" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDelivery" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
                domain={[0, 40]}
                width={40}
              />
              <Tooltip
                cursor={false}
                content={<CustomTooltip />}
                position={{ y: 0 }}
              />
               {julDataPoint && (
                <ReferenceLine x="Jul" stroke="hsl(var(--border))" strokeDasharray="3 3" />
               )}
              <Area 
                type="monotone" 
                dataKey="Shipment" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorShipment)" 
                strokeWidth={2} 
                activeDot={(props) => props.payload.name === 'Jul' ? <CustomActiveDot {...props} /> : null}
                dot={false}
              />
              <Area 
                type="monotone" 
                dataKey="Delivery" 
                stroke="#82ca9d" 
                fillOpacity={1} 
                fill="url(#colorDelivery)" 
                strokeWidth={2}
                activeDot={(props) => props.payload.name === 'Jul' ? <CustomActiveDot {...props} /> : null}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
