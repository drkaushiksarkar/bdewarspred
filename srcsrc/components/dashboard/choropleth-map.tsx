"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { genlandDistricts } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const riskColors = {
  high: 'hsl(var(--destructive) / 0.7)',
  medium: 'hsl(var(--accent) / 0.7)',
  low: 'hsl(var(--primary) / 0.5)',
};

const getRiskColor = (incidence: number) => {
  if (incidence > 0.7) return riskColors.high;
  if (incidence > 0.4) return riskColors.medium;
  return riskColors.low;
};

export default function ChoroplethMap() {
  const [selected, setSelected] = React.useState<string | null>(null);

  const selectedDistrict = selected ? genlandDistricts.find(d => d.id === selected) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Disease Incidence Map</CardTitle>
        <CardDescription>
          {selectedDistrict 
            ? `Incidence in ${selectedDistrict.name}: ${(selectedDistrict.incidence * 100).toFixed(0)}%` 
            : 'Hover or click on a district for details'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
            <div className="relative aspect-[4/3] w-full">
            <svg viewBox="0 0 400 220" className="h-full w-full">
                <g>
                {genlandDistricts.map((district) => (
                    <Tooltip key={district.id}>
                    <TooltipTrigger asChild>
                        <path
                        d={district.path}
                        fill={getRiskColor(district.incidence)}
                        stroke="hsl(var(--card-foreground))"
                        strokeWidth="0.5"
                        onClick={() => setSelected(district.id)}
                        className={cn(
                            'cursor-pointer transition-all duration-300 hover:opacity-80',
                            selected === district.id ? 'stroke-[hsl(var(--ring))] stroke-2' : ''
                        )}
                        />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{district.name}</p>
                    </TooltipContent>
                    </Tooltip>
                ))}
                </g>
            </svg>
            </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
