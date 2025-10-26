"use client";

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AlertStatsCards from '@/components/dashboard/AlertStatsCards';
import DistrictAlertDial from '@/components/dashboard/DistrictAlertDial';
import NationalCasesBaselineChart from '@/components/dashboard/NationalCasesBaselineChart';
import { getAlertStats, getWeeklyNationalDataFromAPI, diseases } from '@/lib/data';
import { BaselineMethod, WeeklyNationalData } from '@/lib/types';
import { Info, Loader2 } from 'lucide-react';

const TARGET_YEAR = 2024;

export default function AlertTab() {
  const [selectedDisease, setSelectedDisease] = useState<string>('dengue');
  const [baselineMethod, setBaselineMethod] = useState<BaselineMethod>('p95');
  const [weeklyData, setWeeklyData] = useState<WeeklyNationalData[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate alert stats based on selected disease and method
  const alertStats = useMemo(() => {
    return getAlertStats(selectedDisease, baselineMethod, TARGET_YEAR);
  }, [selectedDisease, baselineMethod]);

  // Fetch weekly data from API when disease or baseline method changes
  useEffect(() => {
    async function loadWeeklyData() {
      setLoading(true);
      const data = await getWeeklyNationalDataFromAPI(selectedDisease, baselineMethod, TARGET_YEAR);
      setWeeklyData(data);
      setLoading(false);
    }
    loadWeeklyData();
  }, [selectedDisease, baselineMethod]);

  const baselineMethodInfo = {
    p95: 'The baseline is set at the 95th percentile of historical cases for that specific week across all previous years. This means the current number of cases is being compared to the highest 5% of historical case counts for the same week.',
    mean2sd: 'The baseline is calculated by taking the average (mean) of historical cases for that week across previous years and adding two standard deviations. This method identifies weeks where the case count is significantly higher than the historical average.',
    endemic: 'This method uses a robust statistical measure: median + 2 × (75th percentile - 25th percentile). This approach is less sensitive to extreme outliers in the historical data and provides a stable threshold.',
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Alert Dashboard</h2>
            <p className="text-muted-foreground">
              Monitor disease alerts based on baseline thresholds
            </p>
          </div>
          <div className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded text-sm font-medium text-blue-900">
            Data Year: {TARGET_YEAR}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
          {/* Disease Selector */}
          <div className="flex items-center gap-2">
            <Select value={selectedDisease} onValueChange={setSelectedDisease}>
              <SelectTrigger className="w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {diseases.map((disease) => (
                  <SelectItem key={disease.id} value={disease.id}>
                    {disease.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Baseline Method Selector */}
          <div className="flex items-center gap-2">
            <Select
              value={baselineMethod}
              onValueChange={(value) => setBaselineMethod(value as BaselineMethod)}
            >
              <SelectTrigger className="w-[280px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="p95">95th Percentile (p95)</SelectItem>
                <SelectItem value="mean2sd">Mean + 2 standard deviations (mean2sd)</SelectItem>
                <SelectItem value="endemic">Endemic channel (median + 2*IQR)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Baseline Method Information Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">
                Baseline Method: {baselineMethod.toUpperCase()}
              </p>
              <p className="text-sm text-blue-700">
                {baselineMethodInfo[baselineMethod]}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Statistics Cards */}
      <AlertStatsCards stats={alertStats} />

      {/* District Alert Dial and Chart Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Dial Graph */}
        <DistrictAlertDial
          districtsOnAlert={alertStats.districtsOnAlert}
          totalDistricts={alertStats.totalDistricts}
        />

        {/* Additional Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Alert Criteria</CardTitle>
            <CardDescription>How districts are classified as "on alert"</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-2">What triggers an alert?</h4>
              <p className="text-sm text-muted-foreground">
                A district is considered "on alert" when the number of cases for the current week
                exceeds the predefined baseline threshold calculated using historical data.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-2">Baseline Calculation Methods:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-medium text-foreground">p95:</span>
                  <span>95th percentile of historical cases</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-foreground">mean2sd:</span>
                  <span>Mean + 2 standard deviations</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-foreground">endemic:</span>
                  <span>Median + 2 × (Q3 - Q1)</span>
                </li>
              </ul>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                The baseline is calculated for each district and for each week of the year, based
                on historical data specific to that location and time period.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* National Cases vs Baseline Chart */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </CardContent>
        </Card>
      ) : (
        <NationalCasesBaselineChart
          data={weeklyData}
          year={TARGET_YEAR}
        />
      )}
    </div>
  );
}
