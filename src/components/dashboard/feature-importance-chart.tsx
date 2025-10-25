"use client";

import type { FeatureImportance } from '@/lib/types';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  LabelList
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface FeatureImportanceChartProps {
  data: FeatureImportance[];
}

export default function FeatureImportanceChart({ data }: FeatureImportanceChartProps) {
  const sortedData = [...data].sort((a, b) => b.importance - a.importance);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline">Feature Importance</CardTitle>
        <CardDescription>Key drivers of model predictions</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex items-center">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sortedData} layout="vertical">
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="feature"
              width={120}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--secondary))' }}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
            />
            <Bar dataKey="importance" barSize={20}>
               <LabelList dataKey="importance" position="right" formatter={(value: number) => value.toFixed(2)} style={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.importance > 0 ? 'hsl(var(--primary))' : 'hsl(var(--accent))'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
