"use client";

import {
  ComposedChart,
  Line,
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
import InfoButton from './InfoButton';

interface CombinedPredictionChartProps {
  data: TimeSeriesDataPoint[];
}

export default function CombinedPredictionChart({ data }: CombinedPredictionChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="space-y-1.5">
            <CardTitle className="font-headline">Predicted Cases & Uncertainty</CardTitle>
            <CardDescription>Predicted case counts with uncertainty interval</CardDescription>
          </div>
          <InfoButton
            title="Predicted Cases & Uncertainty"
            content={
              <>
                <p className="mb-3">
                  Shows AI-predicted disease cases over time with confidence intervals.
                </p>
                <p>
                  The shaded area represents prediction uncertainty—wider bands indicate less certainty.
                </p>
              </>
            }
          />
        </CardHeader>
        <CardContent className="flex h-[400px] items-center justify-center">
          <p className="text-muted-foreground">No prediction data available for the selected district.</p>
        </CardContent>
      </Card>
    );
  }

  // Transform data to include uncertainty bounds for area chart
  const chartData = data.map(point => {
    const uncertaintyLow = point.uncertainty ? point.uncertainty[0] : null;
    const uncertaintyHigh = point.uncertainty ? point.uncertainty[1] : null;

    return {
      date: point.date,
      predicted: point.predicted,
      uncertaintyLow,
      uncertaintyHigh,
    };
  });

  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="space-y-1.5">
          <CardTitle className="font-headline">Predicted Cases & Uncertainty</CardTitle>
          <CardDescription>Predicted case trend with uncertainty interval overlay</CardDescription>
        </div>
        <InfoButton
          title="Predicted Cases & Uncertainty"
          content={
            <>
              <p className="mb-3">
                Shows AI-predicted disease cases over time with confidence intervals.
              </p>
              <p>
                The shaded area represents prediction uncertainty—wider bands indicate less certainty.
              </p>
            </>
          }
        />
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
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

            {/* Uncertainty area - shows as shaded region */}
            <Area
              type="monotone"
              dataKey="uncertaintyHigh"
              stroke="none"
              fill="hsl(var(--accent))"
              fillOpacity={0.3}
              name="Prediction Uncertainty"
            />
            <Area
              type="monotone"
              dataKey="uncertaintyLow"
              stroke="none"
              fill="hsl(var(--background))"
              fillOpacity={1}
              legendType="none"
            />

            {/* Predicted cases line */}
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              name="Predicted Cases"
              connectNulls={true}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
