"use client";

import * as React from 'react';
import type { AccelerationAlertData } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { TrendingUp, TrendingDown, Minus, MapPin, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

interface DistrictAccelerationCardsProps {
  data: AccelerationAlertData[];
}

export default function DistrictAccelerationCards({ data }: DistrictAccelerationCardsProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline">Top Districts - Last Week Cases</CardTitle>
          <CardDescription>Districts with highest case counts from previous week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-gray-500">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>No data available</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Helper function to get trend icon and status
  const getTrendInfo = (growthRate: number, growthFlag: string) => {
    if (growthFlag.includes('decline') || growthFlag.includes('Stable')) {
      return {
        icon: <TrendingDown className="h-4 w-4" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        label: 'Declining',
      };
    } else if (growthFlag.includes('acceleration') || growthFlag.includes('Alert')) {
      return {
        icon: <TrendingUp className="h-4 w-4" />,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        label: 'Rising',
      };
    } else {
      return {
        icon: <Minus className="h-4 w-4" />,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        label: 'Stable',
      };
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="font-headline">Top Districts - Last Week Cases</CardTitle>
        <CardDescription>Districts with highest case counts from previous week</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((district) => {
            const trendInfo = getTrendInfo(district.growth_rate_wow, district.growth_flag);
            const growthRateAbs = Math.abs(district.growth_rate_wow);

            return (
              <Card
                key={`${district.district}-${district.year}-${district.epi_week}`}
                className={cn(
                  'border-2 transition-all hover:shadow-md',
                  trendInfo.bgColor,
                  'border-gray-200'
                )}
              >
                <CardContent className="p-4">
                  {/* District Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className={cn('p-2 rounded-lg flex-shrink-0', trendInfo.bgColor)}>
                        <MapPin className={cn('h-5 w-5', trendInfo.color)} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm text-gray-900 truncate">
                          {district.district}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">
                          Week {district.epi_week}, {district.year}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Case Count */}
                  <div className="mb-3">
                    <div className="text-3xl font-bold text-gray-900">
                      {Math.round(district.last_week_cases)}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">Cases last week</div>
                  </div>

                  {/* Trend Indicator */}
                  <div className="flex flex-col gap-2 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-1.5">
                      <div className={cn('flex items-center gap-1', trendInfo.color)}>
                        {trendInfo.icon}
                        <span className="text-sm font-medium">
                          {growthRateAbs > 0 ? `${growthRateAbs.toFixed(0)}%` : '0%'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-600">vs previous</span>
                    </div>
                    <Badge
                      variant={
                        trendInfo.label === 'Rising'
                          ? 'destructive'
                          : trendInfo.label === 'Declining'
                          ? 'default'
                          : 'secondary'
                      }
                      className={cn(
                        'text-xs w-fit',
                        trendInfo.label === 'Declining' && 'bg-green-100 text-green-800 hover:bg-green-100'
                      )}
                    >
                      {trendInfo.label}
                    </Badge>
                  </div>

                  {/* This Week Actual (if available) */}
                  {district.this_week_actual !== undefined && district.this_week_actual !== null && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-600">
                        This week:{' '}
                        <span className="font-semibold text-gray-900">
                          {Math.round(district.this_week_actual)}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
