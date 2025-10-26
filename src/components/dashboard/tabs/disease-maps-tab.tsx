"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DistrictSatelliteMap from '../DistrictSatelliteMap';
import MalariaMap from '../malaria-map';
import DiarrhoeaMap from '../DiarrhoeaMap';
import { getAggregatedDenguePredictions } from '@/lib/data';
import React from 'react';

export default function DiseaseMapsTab() {
  const denguePredictionData = React.useMemo(() => getAggregatedDenguePredictions(), []);

  return (
    <div className="space-y-6">
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

      <MalariaMap />

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
    </div>
  );
}
