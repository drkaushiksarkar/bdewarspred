"use client";

import { useSearchParams } from 'next/navigation';
import MetricsPanels from '../metrics-panels';
import CombinedPredictionChart from '../CombinedPredictionChart';
import FilterBar from '../filter-bar';
import RiskHeatmap from '../risk-heatmap';
import { getLiveWeatherData } from '@/lib/weather';
import type { WeatherData, DiseaseData, RiskData } from '@/lib/types';
import React from 'react';
import {
  getRealTimeSeriesData,
  dengueRiskData,
  malariaRiskData,
  diarrhoeaRiskData,
  locations,
  getMonthlyCases,
} from '@/lib/data';

async function fetchAndFormatWeatherData(): Promise<{data: WeatherData[], error: boolean}> {
  try {
    const liveWeather = await getLiveWeatherData('Dhaka', 'BD');
    if (!liveWeather) return { data: [], error: true };

    const { temp, temp_min, temp_max, humidity, rainfall, weather_description } = liveWeather;

    const weatherData: WeatherData[] = [
      {
        label: 'Temperature',
        value: `${temp.toFixed(1)}°C`,
        subtitle: `Min: ${temp_min.toFixed(1)}°C / Max: ${temp_max.toFixed(1)}°C`,
        is_extreme: temp > 35
      },
      {
        label: 'Humidity',
        value: `${humidity}%`,
        subtitle: weather_description ? weather_description.charAt(0).toUpperCase() + weather_description.slice(1) : '',
        is_extreme: humidity > 90
      },
      {
        label: 'Rainfall',
        value: `${rainfall}mm`,
        subtitle: rainfall > 0 ? 'Last hour' : 'No rain',
        is_extreme: rainfall > 20
      },
    ];
    return { data: weatherData, error: false };
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    return { data: [], error: true };
  }
}

export default function OverviewTab() {
  const searchParams = useSearchParams();
  const districtId = searchParams.get('district') || '47';
  const disease = searchParams.get('disease') || 'dengue';

  const [weatherData, setWeatherData] = React.useState<WeatherData[]>([]);
  const [diseaseData, setDiseaseData] = React.useState<DiseaseData[]>([]);
  const [weatherError, setWeatherError] = React.useState(false);

  React.useEffect(() => {
    async function loadWeather() {
      const { data, error } = await fetchAndFormatWeatherData();
      setWeatherData(data);
      setWeatherError(error);
    }
    loadWeather();

    const monthlyCases = getMonthlyCases();
    setDiseaseData(monthlyCases);
  }, []);

  const timeSeriesData = React.useMemo(() => {
    const selectedDistrict = locations.find(l => l.id === districtId && l.level === 'district');
    const districtName = selectedDistrict ? selectedDistrict.name : 'Dhaka';
    return getRealTimeSeriesData(districtName, disease);
  }, [districtId, disease]);

  const riskDataForDisease: RiskData[] = React.useMemo(() => {
    switch (disease) {
      case 'dengue':
        return dengueRiskData;
      case 'malaria':
        return malariaRiskData;
      case 'diarrhoea':
        return diarrhoeaRiskData;
      default:
        return dengueRiskData;
    }
  }, [disease]);

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <FilterBar />

      {/* 6 Metric Cards */}
      <MetricsPanels weatherData={weatherData} diseaseData={diseaseData} weatherError={weatherError} />

      {/* Prediction Chart and Risk Heatmap */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CombinedPredictionChart data={timeSeriesData} />
        <RiskHeatmap data={riskDataForDisease} />
      </div>
    </div>
  );
}
