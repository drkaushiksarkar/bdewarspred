"use client";

import {
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TimeSeriesDataPoint } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

interface PredictionUncertaintyChartProps {
  data: TimeSeriesDataPoint[];
}

export default function PredictionUncertaintyChart({ data }: PredictionUncertaintyChartProps) {
  if (data.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Prediction Uncertainty</CardTitle>
                <CardDescription>Uncertainty interval for predictions.</CardDescription>
            </CardHeader>
            <CardContent className="flex h-[300px] items-center justify-center">
                <p className="text-muted-foreground">No prediction data available.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Prediction Uncertainty</CardTitle>
        <CardDescription>Shaded area representing the uncertainty interval</CardDescription>
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
              fillOpacity={0.4}
              name="Prediction Uncertainty"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
