"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';

interface DistrictAlertDialProps {
  districtsOnAlert: number;
  totalDistricts: number;
}

export default function DistrictAlertDial({ districtsOnAlert, totalDistricts }: DistrictAlertDialProps) {
  const percentage = totalDistricts > 0 ? (districtsOnAlert / totalDistricts) * 100 : 0;
  const remaining = 100 - percentage;

  const data = [
    { name: 'Alert', value: percentage },
    { name: 'Normal', value: remaining },
  ];

  const getColor = (percent: number) => {
    if (percent > 50) return '#ef4444'; // red-500
    if (percent > 25) return '#eab308'; // yellow-500
    return '#22c55e'; // green-500
  };

  const COLORS = [getColor(percentage), '#e5e7eb']; // alert color and gray-200

  return (
    <Card>
      <CardHeader>
        <CardTitle>Districts on Alert</CardTitle>
        <CardDescription>Percentage of districts exceeding baseline threshold</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <div className="w-full max-w-md">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                startAngle={180}
                endAngle={0}
                innerRadius={80}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
                <Label
                  value={`${percentage.toFixed(1)}%`}
                  position="center"
                  style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    fill: getColor(percentage),
                  }}
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              {districtsOnAlert} out of {totalDistricts} districts on alert
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
