import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer, Droplets, CloudRain, AlertTriangle, Activity, Bug, Droplet } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WeatherData, DiseaseData } from '@/lib/types';

const weatherIconMap = {
  Temperature: Thermometer,
  Humidity: Droplets,
  Rainfall: CloudRain,
};

const diseaseIconMap = {
  Malaria: Bug,
  Dengue: Activity,
  Diarrhoea: Droplet,
};

interface MetricsPanelsProps {
  weatherData: WeatherData[];
  diseaseData: DiseaseData[];
  weatherError: boolean;
}

export default function MetricsPanels({ weatherData, diseaseData, weatherError }: MetricsPanelsProps) {
  if (weatherError || !weatherData || weatherData.length === 0) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <Card className="flex flex-col items-center justify-center p-4 sm:col-span-2 md:col-span-3 lg:col-span-6">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <p className="mt-2 text-sm font-medium text-destructive">Could not load metrics data.</p>
          <p className="text-xs text-muted-foreground">Please check API key or network.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      {weatherData.map((item) => {
        const Icon = weatherIconMap[item.label];
        return (
          <Card key={item.label} className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.label}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={cn('text-2xl font-bold', item.is_extreme && 'text-destructive')}
              >
                {item.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
      {diseaseData.map((item) => {
        const Icon = diseaseIconMap[item.label];
        return (
          <Card key={item.label} className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.label}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={cn('text-2xl font-bold', item.is_high && 'text-orange-600')}
              >
                {item.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Monthly Cases
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
