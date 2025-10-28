"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, TrendingUp, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface ModelMetrics {
  r2_score?: number;
  smape?: number;
  coverage_90?: number;
}

interface ModelMetricsCardsProps {
  disease: string;
  setDisease: (disease: string) => void;
}

export default function ModelMetricsCards({ disease, setDisease }: ModelMetricsCardsProps) {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchMetrics() {
      setLoading(true);
      setError(false);
      try {
        const response = await fetch(`/api/model-metrics?disease=${disease}`);
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        } else {
          setError(true);
          console.error('Failed to fetch model metrics');
        }
      } catch (err) {
        setError(true);
        console.error('Error loading model metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, [disease]);

  const metricCards = [
    {
      label: 'R² Score',
      value: metrics?.r2_score !== undefined ? (metrics.r2_score * 100).toFixed(1) + '%' : '--',
      description: 'Model explains variance well',
      icon: Target,
      colors: {
        bg: 'bg-blue-50',
        icon: 'text-blue-600',
      },
    },
    {
      label: 'SMAPE',
      value: metrics?.smape !== undefined ? (metrics.smape * 100).toFixed(1) + '%' : '--',
      description: 'Average prediction error',
      icon: TrendingUp,
      colors: {
        bg: 'bg-green-50',
        icon: 'text-green-600',
      },
    },
    {
      label: 'Coverage 90%',
      value: metrics?.coverage_90 !== undefined ? (metrics.coverage_90 * 100).toFixed(1) + '%' : '--',
      description: 'Predictions within range',
      icon: CheckCircle2,
      colors: {
        bg: 'bg-purple-50',
        icon: 'text-purple-600',
      },
    },
    {
      label: 'Prediction Window',
      value: '7-14 days',
      description: 'Forecast time horizon',
      icon: Clock,
      colors: {
        bg: 'bg-amber-50',
        icon: 'text-amber-600',
      },
    },
  ];

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Model Performance</h2>
          <Select value={disease} onValueChange={setDisease}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select disease" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dengue">Dengue</SelectItem>
              <SelectItem value="diarrhoea">Diarrhoea</SelectItem>
              <SelectItem value="malaria">Malaria</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Card className="flex flex-col items-center justify-center p-8">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <p className="mt-2 text-sm font-medium text-destructive">
            Could not load model metrics.
          </p>
          <p className="text-xs text-muted-foreground">Please check database connection.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Model Performance</h2>
        <Select value={disease} onValueChange={setDisease}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select disease" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dengue">Dengue</SelectItem>
            <SelectItem value="diarrhoea">Diarrhoea</SelectItem>
            <SelectItem value="malaria">Malaria</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.label}
              className={cn('flex flex-col border-0 shadow-md', card.colors.bg)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
                <Icon className={cn('h-5 w-5', card.colors.icon)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-black">
                  {loading ? '...' : card.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
