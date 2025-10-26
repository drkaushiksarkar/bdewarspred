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
import { getAggregatedDenguePredictions } from '@/lib/data';
import React from 'react';

export default function DiseaseMapsTab() {
  const [selectedDisease, setSelectedDisease] = React.useState<string>('dengue');
  const denguePredictionData = React.useMemo(() => getAggregatedDenguePredictions(), []);

  const renderDiseaseMap = () => {
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
