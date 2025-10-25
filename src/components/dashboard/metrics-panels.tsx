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

const weatherColors = {
  Temperature: {
    bg: 'bg-orange-50',
    icon: 'text-orange-600',
    border: 'border-orange-200',
  },
  Humidity: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    border: 'border-blue-200',
  },
  Rainfall: {
    bg: 'bg-cyan-50',
    icon: 'text-cyan-600',
    border: 'border-cyan-200',
  },
};

const diseaseColors = {
  Malaria: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    border: 'border-purple-200',
  },
  Dengue: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    border: 'border-red-200',
  },
  Diarrhoea: {
    bg: 'bg-amber-50',
    icon: 'text-amber-600',
    border: 'border-amber-200',
  },
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
        const colors = weatherColors[item.label];
        return (
          <Card key={item.label} className={cn('flex flex-col border-2', colors.bg, colors.border)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.label}
              </CardTitle>
              <Icon className={cn('h-5 w-5', colors.icon)} />
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
        const colors = diseaseColors[item.label];
        return (
          <Card key={item.label} className={cn('flex flex-col border-2', colors.bg, colors.border)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.label}
              </CardTitle>
              <Icon className={cn('h-5 w-5', colors.icon)} />
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
