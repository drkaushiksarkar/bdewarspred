"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Thermometer,
  CloudRain,
  Droplets,
  Info,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface ClimateFeature {
  feature: string;
  baseVar: string;
  lagInfo: string;
  correlation: number;
  absCorrelation: number;
  label: string;
  description: string;
  icon: string;
}

interface ClimateInfluenceResponse {
  features: ClimateFeature[];
}

interface ClimateInfluenceCardProps {
  disease: string;
}

const iconMap: { [key: string]: any } = {
  Thermometer,
  CloudRain,
  Droplets,
  Info
};

export default function ClimateInfluenceCard({ disease }: ClimateInfluenceCardProps) {
  const [features, setFeatures] = useState<ClimateFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchClimateInfluence() {
      setLoading(true);
      setError(false);
      try {
        const response = await fetch(`/api/climate-influence?disease=${disease}&limit=6`);
        console.log('Climate influence response status:', response.status);
        if (response.ok) {
          const data: ClimateInfluenceResponse = await response.json();
          console.log('Climate influence data:', data);
          setFeatures(data.features);
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error('Failed to fetch climate influence data:', response.status, errorData);
          setError(true);
        }
      } catch (err) {
        console.error('Error loading climate influence:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchClimateInfluence();
  }, [disease]);

  if (error) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline">Climate Influence on Disease</CardTitle>
          <CardDescription className="mt-1">
            How climate factors affect disease outbreak patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <p className="mt-2 text-sm font-medium text-destructive">
              Could not load climate influence data.
            </p>
            <p className="text-xs text-muted-foreground">Please check database connection.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxAbsCorr = Math.max(...features.map(f => f.absCorrelation), 0.01);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="font-headline">Climate Influence on Disease</CardTitle>
        <CardDescription className="mt-1">
          How climate factors affect disease outbreak patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-muted-foreground">Loading climate influence data...</div>
          </div>
        ) : (
          <>
            <div className="mb-6 rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                Climate influence shows how weather and environmental factors correlate with disease outbreaks.
                Positive values indicate factors that <span className="font-semibold text-blue-600">increase outbreak risk</span>, while
                negative values indicate factors that <span className="font-semibold text-orange-600">reduce outbreak risk</span>.
                The magnitude represents the strength of the correlation.
              </p>
              <div className="mt-3 flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-8 rounded bg-blue-500" />
                  <span className="text-muted-foreground">Positive Impact: Increases disease outbreak probability</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-8 rounded bg-orange-500" />
                  <span className="text-muted-foreground">Negative Impact: Decreases disease outbreak probability</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {features.map((feature, index) => {
                const Icon = iconMap[feature.icon] || Info;
                const isPositive = feature.correlation > 0;
                const barWidth = (feature.absCorrelation / maxAbsCorr) * 100;
                const isExpanded = expandedIndex === index;

                return (
                  <div
                    key={feature.feature}
                    className="group rounded-lg border border-border/40 bg-card transition-all hover:border-border hover:shadow-sm"
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "rounded-lg p-2",
                          isPositive ? "bg-blue-100" : "bg-orange-100"
                        )}>
                          <Icon className={cn(
                            "h-5 w-5",
                            isPositive ? "text-blue-600" : "text-orange-600"
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <div className="flex items-baseline gap-2">
                              <h4 className="text-sm font-semibold">{feature.label}</h4>
                              {feature.lagInfo && feature.lagInfo !== '' && (
                                <span className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                  {feature.lagInfo.replace('_', '')}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => setExpandedIndex(isExpanded ? null : index)}
                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="h-3 w-3" />
                                  Hide
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-3 w-3" />
                                  Details
                                </>
                              )}
                            </button>
                          </div>

                          <div className="mt-3 flex items-center gap-3">
                            <div className="flex-1 h-6 rounded-full bg-muted overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all duration-500",
                                  isPositive ? "bg-blue-500" : "bg-orange-500"
                                )}
                                style={{ width: `${barWidth}%` }}
                              />
                            </div>
                            <div className={cn(
                              "text-sm font-bold tabular-nums min-w-[3.5rem] text-right",
                              isPositive ? "text-blue-600" : "text-orange-600"
                            )}>
                              {feature.correlation > 0 ? '+' : ''}{feature.absCorrelation.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 pl-14 pr-4 pb-2">
                          <div className={cn(
                            "rounded-lg border-l-4 p-3",
                            isPositive
                              ? "border-blue-500 bg-blue-50/50"
                              : "border-orange-500 bg-orange-50/50"
                          )}>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Why this matters:</p>
                            <p className="text-sm text-foreground leading-relaxed">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground">
              <p>
                <span className="font-semibold">Note:</span> These correlation values represent the Pearson correlation
                between each climate variable and next week's disease cases. Higher absolute values indicate stronger relationships.
                The lag information shows how we're using historical climate data to predict future outbreaks.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
