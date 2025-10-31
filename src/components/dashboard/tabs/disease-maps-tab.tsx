"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DistrictSatelliteMap from '../DistrictSatelliteMap';
import MalariaMap from '../malaria-map';
import DiarrhoeaMap from '../DiarrhoeaMap';
import React from 'react';

export default function DiseaseMapsTab() {
  const [selectedDisease, setSelectedDisease] = React.useState<string>('dengue');
  const [denguePredictionData, setDenguePredictionData] = React.useState<{ [districtName: string]: number }>({});
  const [diarrhoeaPredictionData, setDiarrhoeaPredictionData] = React.useState<{ [districtName: string]: number }>({});
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  // Fetch all data on mount
  React.useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        // Fetch both datasets in parallel
        const [dengueResponse, diarrhoeaResponse] = await Promise.all([
          fetch('/api/disease-map-predictions?disease=dengue'),
          fetch('/api/disease-map-predictions?disease=diarrhoea')
        ]);

        const dengueResult = await dengueResponse.json();
        const diarrhoeaResult = await diarrhoeaResponse.json();

        if (dengueResult.success) {
          setDenguePredictionData(dengueResult.data);
        }

        if (diarrhoeaResult.success) {
          setDiarrhoeaPredictionData(diarrhoeaResult.data);
        }
      } catch (error) {
        console.error('Error fetching disease data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const renderDiseaseMap = () => {
    if (isLoading) {
      return (
        <Card className="shadow-md">
          <CardContent className="flex items-center justify-center h-[550px]">
            <p className="text-gray-500">Loading map data...</p>
          </CardContent>
        </Card>
      );
    }

    switch (selectedDisease) {
      case 'dengue':
        return (
          <Card className="shadow-md">
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
        );
      case 'malaria':
        return <MalariaMap />;
      case 'diarrhoea':
        return (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline">Diarrhoea Predicted Cases Heatmap</CardTitle>
              <CardDescription>Total predicted Acute Watery Diarrhoea cases by district.</CardDescription>
            </CardHeader>
            <CardContent>
              <DiarrhoeaMap
                height="550px"
                showLabelsDefault={true}
                predictionData={diarrhoeaPredictionData}
              />
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Disease Selector */}
      <div className="flex flex-col items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Select Disease</label>
        <Select value={selectedDisease} onValueChange={setSelectedDisease}>
          <SelectTrigger className="w-[300px] bg-white">
            <SelectValue placeholder="Select a disease" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dengue">Dengue</SelectItem>
            <SelectItem value="malaria">Malaria</SelectItem>
            <SelectItem value="diarrhoea">Acute Watery Diarrhoea</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Render Selected Disease Map */}
      {renderDiseaseMap()}
    </div>
  );
}
