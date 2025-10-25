"use client";

import {
  Line,
  LineChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TimeSeriesDataPoint } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

interface PredictedCasesTrendChartProps {
  data: TimeSeriesDataPoint[];
}

export default function PredictedCasesTrendChart({ data }: PredictedCasesTrendChartProps) {
  if (data.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Predicted Cases Trend</CardTitle>
                <CardDescription>Predicted case counts over time.</CardDescription>
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
        <CardTitle className="font-headline">Predicted Cases Trend</CardTitle>
        <CardDescription>Line chart of predicted case counts</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
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
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              name="Predicted Cases"
              connectNulls={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
