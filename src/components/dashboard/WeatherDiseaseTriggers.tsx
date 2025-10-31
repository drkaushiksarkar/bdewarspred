"use client";

import type { WeatherDiseaseTrigger } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Thermometer, Droplets, CloudRain } from 'lucide-react';

const iconMap = {
  Thermometer: Thermometer,
  Droplets: Droplets,
  CloudRain: CloudRain,
};

interface WeatherDiseaseTriggersProps {
  data: WeatherDiseaseTrigger[];
}

export default function WeatherDiseaseTriggers({ data }: WeatherDiseaseTriggersProps) {
  const getIconColor = (variable: string) => {
    if (variable.includes('Temperature')) return 'text-orange-600';
    if (variable.includes('Humidity')) return 'text-blue-600';
    if (variable.includes('Rainfall')) return 'text-cyan-600';
    return 'text-gray-600';
  };

  const getIconBgColor = (variable: string) => {
    if (variable.includes('Temperature')) return 'bg-orange-50';
    if (variable.includes('Humidity')) return 'bg-blue-50';
    if (variable.includes('Rainfall')) return 'bg-cyan-50';
    return 'bg-gray-50';
  };

  return (
    <Card className="h-full max-h-[560px] flex flex-col shadow-md w-full max-w-full overflow-hidden">
      <CardHeader className="pb-3 text-center flex-shrink-0">
        <CardTitle className="font-headline text-lg">Weather Impact</CardTitle>
        <CardDescription className="text-xs mt-1">
          on Disease Outbreaks
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 px-4 py-2 overflow-y-auto overflow-x-hidden min-h-0">
        <div className="space-y-3">
          {data.map((trigger) => {
            const Icon = iconMap[trigger.icon];
            return (
              <div key={trigger.id} className="flex flex-col space-y-2 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors shadow-md min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`p-2 rounded-full ${getIconBgColor(trigger.variable)} flex-shrink-0`}>
                    <Icon className={`h-5 w-5 ${getIconColor(trigger.variable)}`} />
                  </div>
                  <h3 className="font-semibold text-sm break-words min-w-0">{trigger.variable}</h3>
                </div>
                <div className="flex flex-wrap gap-1 pl-11 min-w-0">
                  {trigger.diseases.map(disease => (
                    <Badge key={disease} variant="secondary" className="text-xs px-2 py-0.5 break-words">
                      {disease}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground leading-snug pl-11 break-words">
                  {trigger.impact}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
