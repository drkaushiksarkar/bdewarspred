"use client";

import * as React from 'react';
import type { AccelerationAlertData } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { TrendingUp, TrendingDown, Minus, MapPin, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import InfoButton from './InfoButton';

interface DistrictAccelerationCardsProps {
  data: AccelerationAlertData[];
}

export default function DistrictAccelerationCards({ data }: DistrictAccelerationCardsProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="space-y-1.5">
            <CardTitle className="font-headline">Top Districts - Last Week Cases</CardTitle>
            <CardDescription>Districts with highest case counts from previous week</CardDescription>
          </div>
          <InfoButton
            title="Top Districts"
            content={
              <>
                <p className="mb-3">
                  Highlights districts with the most cases last week.
                </p>
                <p>
                  Color indicators show rising, declining, or stable trends compared to the week before.
                </p>
              </>
            }
          />
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
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="space-y-1.5">
          <CardTitle className="font-headline">Top Districts - Last Week Cases</CardTitle>
          <CardDescription>Districts with highest case counts from previous week</CardDescription>
        </div>
        <InfoButton
          title="Top Districts"
          content={
            <>
              <p className="mb-3">
                Highlights districts with the most cases last week.
              </p>
              <p>
                Color indicators show rising, declining, or stable trends compared to the week before.
              </p>
            </>
          }
        />
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
                  {/* Location Name */}
                  <h3
                    className="font-semibold text-base text-gray-900 truncate mb-1"
                    title={district.district}
                  >
                    {district.district}
                  </h3>

                  {/* Week Number */}
                  <p className="text-xs text-gray-500 mb-3">
                    Week {district.epi_week}, {district.year}
                  </p>

                  {/* This Week and Last Week Side by Side */}
                  <div className="flex items-start justify-between mb-3">
                    {/* Left: This Week */}
                    {district.this_week_actual !== undefined && district.this_week_actual !== null && (
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">
                          This Week
                        </div>
                        <div className="text-3xl font-bold text-gray-900">
                          {Math.round(district.this_week_actual)}
                        </div>
                      </div>
                    )}

                    {/* Right: Badge and Last Week */}
                    <div className="flex flex-col items-end gap-1">
                      <Badge
                        variant={
                          trendInfo.label === 'Rising'
                            ? 'destructive'
                            : trendInfo.label === 'Declining'
                            ? 'default'
                            : 'secondary'
                        }
                        className={cn(
                          'text-xs',
                          trendInfo.label === 'Declining' && 'bg-green-100 text-green-800 hover:bg-green-100'
                        )}
                      >
                        {trendInfo.label}
                      </Badge>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Last Week</div>
                        <div className="text-lg font-semibold text-gray-700">
                          {Math.round(district.last_week_cases)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* WoW Change Indicator */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                    <span className="text-xs text-gray-500">WoW Change:</span>
                    <div className={cn('flex items-center gap-1', trendInfo.color)}>
                      {trendInfo.icon}
                      <span className="text-sm font-bold">
                        {growthRateAbs > 0 ? '+' : ''}
                        {growthRateAbs > 0 ? `${growthRateAbs.toFixed(0)}%` : '0%'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
