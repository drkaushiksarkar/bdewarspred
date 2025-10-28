"use client";

import { useState } from 'react';
import ClimateInfluenceCard from '../climate-influence-card';
import ModelMetricsCards from '../model-metrics-cards';

export default function ModelTab() {
  const [disease, setDisease] = useState('dengue');

  return (
    <div className="space-y-6">
      {/* Model Performance Metrics */}
      <ModelMetricsCards disease={disease} setDisease={setDisease} />

      {/* Climate Influence on Disease */}
      <ClimateInfluenceCard disease={disease} />
    </div>
  );
}
