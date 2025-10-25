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
  return (
    <Card className="sm:col-span-2 xl:col-span-2">
      <CardHeader>
        <CardTitle className="font-headline">Weather Impact on Disease Outbreaks</CardTitle>
        <CardDescription>How different weather variables can influence disease transmission.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Weather Variable</TableHead>
              <TableHead>Affected Diseases</TableHead>
              <TableHead>Impact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((trigger) => {
                const Icon = iconMap[trigger.icon];
                return (
                    <TableRow key={trigger.id}>
                        <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                                <Icon className="h-5 w-5 text-muted-foreground" />
                                <span>{trigger.variable}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-wrap gap-1">
                                {trigger.diseases.map(disease => (
                                    <Badge key={disease} variant="secondary">{disease}</Badge>
                                ))}
                            </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{trigger.impact}</TableCell>
                    </TableRow>
                )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
