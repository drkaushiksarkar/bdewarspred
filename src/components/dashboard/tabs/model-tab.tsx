"use client";

import FeatureImportanceChart from '../feature-importance-chart';
import WeatherDiseaseTriggers from '../WeatherDiseaseTriggers';
import { featureImportanceData, weatherDiseaseTriggers } from '@/lib/data';

export default function ModelTab() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-10">
        <div className="lg:col-span-4">
          <FeatureImportanceChart data={featureImportanceData} />
        </div>
        <div className="lg:col-span-6">
          <WeatherDiseaseTriggers data={weatherDiseaseTriggers} />
        </div>
      </div>
    </div>
  );
}
