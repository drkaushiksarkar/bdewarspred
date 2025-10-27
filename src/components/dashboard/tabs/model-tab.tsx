"use client";

import FeatureImportanceChart from '../feature-importance-chart';
import { featureImportanceData } from '@/lib/data';

export default function ModelTab() {
  return (
    <div className="space-y-6">
      <div className="h-[600px]">
        <FeatureImportanceChart data={featureImportanceData} />
      </div>
    </div>
  );
}
