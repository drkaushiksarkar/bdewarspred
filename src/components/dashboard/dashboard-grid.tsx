"use client";

import { useSearchParams } from 'next/navigation';
import MetricsPanels from './metrics-panels';
import CombinedPredictionChart from './CombinedPredictionChart';
import FilterBar from './filter-bar';
import {
  getRealTimeSeriesData,
  dengueRiskData,
  malariaRiskData,
  diarrhoeaRiskData,
  featureImportanceData,
  locations,
  getAggregatedDenguePredictions,
  weatherDiseaseTriggers,
  getMonthlyCases,
} from '@/lib/data';
import FeatureImportanceChart from './feature-importance-chart';
import DistrictSatelliteMap from './DistrictSatelliteMap';
import RiskHeatmap from './risk-heatmap';
import { getLiveWeatherData } from '@/lib/weather';
import type { WeatherData, DiseaseData, RiskData } from '@/lib/types';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import MalariaMap from './malaria-map';
import DiarrhoeaMap from './DiarrhoeaMap';
import WeatherDiseaseTriggers from './WeatherDiseaseTriggers';


async function fetchAndFormatWeatherData(): Promise<{data: WeatherData[], error: boolean}> {
    try {
        const liveWeather = await getLiveWeatherData('Dhaka', 'BD');
        if (!liveWeather) return { data: [], error: true };

        const { temp, humidity, rainfall } = liveWeather;
        
        const weatherData: WeatherData[] = [
            { 
                label: 'Temperature', 
                value: `${temp.toFixed(1)}°C`, 
                is_extreme: temp > 35 
            },
            { 
                label: 'Humidity', 
                value: `${humidity}%`, 
                is_extreme: humidity > 90 
            },
            { 
                label: 'Rainfall', 
                value: `${rainfall}mm`,
                is_extreme: rainfall > 20 // threshold for heavy rainfall in an hour
            },
        ];
        return { data: weatherData, error: false };
    } catch (error) {
        console.error("Failed to fetch weather data:", error);
        return { data: [], error: true };
    }
}


export default function DashboardGrid() {
  const searchParams = useSearchParams();
  const districtId = searchParams.get('district') || '47'; // Default to Dhaka district
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

    // Load disease data
    const monthlyCases = getMonthlyCases();
    setDiseaseData(monthlyCases);
  }, []);

  const timeSeriesData = React.useMemo(() => {
    const selectedDistrict = locations.find(l => l.id === districtId && l.level === 'district');
    const districtName = selectedDistrict ? selectedDistrict.name : 'Dhaka'; // Fallback to Dhaka
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

  const denguePredictionData = React.useMemo(() => getAggregatedDenguePredictions(), []);

  return (
    <div className="grid flex-1 items-start gap-4 sm:gap-6">
      {/* Filter Bar */}
      <FilterBar />

      {/* Row 1: All 6 metric cards */}
      <MetricsPanels weatherData={weatherData} diseaseData={diseaseData} weatherError={weatherError} />

      {/* Row 2: Combined Prediction Chart (50%) and Risk Heatmap (50%) */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <CombinedPredictionChart data={timeSeriesData} />
        <RiskHeatmap data={riskDataForDisease} />
      </div>

      {/* Row 3: Feature Importance (30%) and Weather Disease Triggers (70%) */}
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-10">
        <div className="lg:col-span-3">
          <FeatureImportanceChart data={featureImportanceData} />
        </div>
        <div className="lg:col-span-7">
          <WeatherDiseaseTriggers data={weatherDiseaseTriggers} />
        </div>
      </div>

      {/* Row 4+: Disease Heatmaps */}
      <div className="grid gap-4 sm:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Dengue Predicted Cases Heatmap</CardTitle>
            <CardDescription>Total predicted dengue cases by district.</CardDescription>
          </CardHeader>
          <CardContent>
            <DistrictSatelliteMap
              height="550px"
              showLabelsDefault={true}
              predictionData={denguePredictionData}
            />
          </CardContent>
        </Card>
        <MalariaMap />
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Diarrhoea Predicted Cases Heatmap</CardTitle>
            <CardDescription>Total predicted Acute Watery Diarrhoea cases by district.</CardDescription>
          </CardHeader>
          <CardContent>
            <DiarrhoeaMap
              height="550px"
              showLabelsDefault={true}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
