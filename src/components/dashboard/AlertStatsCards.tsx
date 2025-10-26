"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, AlertTriangle, Users, Calendar } from 'lucide-react';
import { AlertStats } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AlertStatsCardsProps {
  stats: AlertStats;
}

export default function AlertStatsCards({ stats }: AlertStatsCardsProps) {
  const {
    currentWeekCases,
    previousWeekCases,
    percentChange,
    districtsOnAlert,
    totalDistricts,
    nationalRiskLevel,
  } = stats;

  const isIncreasing = percentChange > 0;
  const alertPercentage = totalDistricts > 0 ? (districtsOnAlert / totalDistricts) * 100 : 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Current Week Cases Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Current Week National Cases</CardDescription>
          <CardTitle className="text-3xl font-bold">
            {currentWeekCases.toLocaleString()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {isIncreasing ? (
              <TrendingUp className="h-4 w-4 text-red-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-500" />
            )}
            <span
              className={cn(
                'text-sm font-medium',
                isIncreasing ? 'text-red-500' : 'text-green-500'
              )}
            >
              {Math.abs(percentChange).toFixed(1)}%
            </span>
            <span className="text-sm text-muted-foreground">
              vs previous week ({previousWeekCases.toLocaleString()})
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Districts on Alert Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Districts on Alert (this week)</CardDescription>
          <CardTitle className="text-3xl font-bold">
            {districtsOnAlert} / {totalDistricts}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {alertPercentage.toFixed(1)}% of districts exceeding baseline
            </span>
          </div>
        </CardContent>
      </Card>

      {/* National Risk Level Card */}
      <Card
        className={cn(
          'border-2',
          nationalRiskLevel === 'High' && 'border-red-500 bg-red-50',
          nationalRiskLevel === 'Medium' && 'border-yellow-500 bg-yellow-50',
          nationalRiskLevel === 'Low' && 'border-green-500 bg-green-50'
        )}
      >
        <CardHeader className="pb-2">
          <CardDescription>National Risk Level</CardDescription>
          <CardTitle className="text-3xl font-bold flex items-center gap-2">
            {nationalRiskLevel === 'High' && (
              <AlertTriangle className="h-8 w-8 text-red-500" />
            )}
            <span
              className={cn(
                nationalRiskLevel === 'High' && 'text-red-600',
                nationalRiskLevel === 'Medium' && 'text-yellow-600',
                nationalRiskLevel === 'Low' && 'text-green-600'
              )}
            >
              {nationalRiskLevel}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {alertPercentage > 50
              ? 'More than 50% of districts are on alert'
              : alertPercentage > 25
              ? 'Between 25-50% of districts are on alert'
              : 'Less than 25% of districts are on alert'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
