
"use client";

import {
  Area,
  AreaChart,
  Brush,
  CartesianGrid,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TimeSeriesDataPoint } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

interface TimeSeriesChartProps {
  data: TimeSeriesDataPoint[];
}

export default function TimeSeriesChart({ data }: TimeSeriesChartProps) {
  const outbreaks = data.filter((d) => d.is_outbreak);

  // If there's no data, show a message
  if (data.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Disease Case Trends</CardTitle>
                <CardDescription>Predicted Cases Over Time</CardDescription>
            </CardHeader>
            <CardContent className="flex h-[300px] items-center justify-center">
                <p className="text-muted-foreground">No prediction data available for the selected district.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Disease Case Trends</CardTitle>
        <CardDescription>Predicted Cases and Uncertainty Interval</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
              labelStyle={{
                color: 'hsl(var(--foreground))'
              }}
            />
            <Legend />
            
            <Area
              type="monotone"
              dataKey="uncertainty"
              stroke="none"
              fill="hsl(var(--accent))"
              fillOpacity={0.2}
              name="Prediction Uncertainty"
              activeDot={false}
            />

            <Line
              type="monotone"
              dataKey="predicted"
              stroke="hsl(var(--accent))"
              strokeWidth={2}
              dot={false}
              name="Predicted"
              connectNulls={true}
            />
            
            {outbreaks.map((outbreak) => (
              <ReferenceLine
                key={outbreak.date}
                x={outbreak.date}
                stroke="hsl(var(--destructive))"
                strokeDasharray="3 3"
              >
                <Legend>Outbreak</Legend>
              </ReferenceLine>
            ))}

            <Brush dataKey="date" height={30} stroke="hsl(var(--primary))" travellerWidth={20} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
