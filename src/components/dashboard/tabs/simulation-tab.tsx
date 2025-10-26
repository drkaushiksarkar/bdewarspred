"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Syringe, Droplets, ShieldCheck, Home } from 'lucide-react';
import DiseaseSpreadMap from '../DiseaseSpreadMap';
import { locations } from '@/lib/data';

export default function SimulationTab() {
  const [originDistrict, setOriginDistrict] = useState('Dhaka');
  const [disease, setDisease] = useState('dengue');
  const [initialCases, setInitialCases] = useState(100);
  const [reproductionNumber, setReproductionNumber] = useState(2.5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [interventions, setInterventions] = useState<string[]>([]);

  const districts = locations.filter(l => l.level === 'district');

  const handleReset = () => {
    setIsPlaying(false);
    setInterventions([]);
  };

  const toggleIntervention = (intervention: string) => {
    setInterventions(prev =>
      prev.includes(intervention)
        ? prev.filter(i => i !== intervention)
        : [...prev, intervention]
    );
  };

  const diseaseInfo = {
    dengue: {
      name: 'Dengue',
      r0Range: '1.5 - 3.0',
      vector: 'Aedes mosquito',
    },
    malaria: {
      name: 'Malaria',
      r0Range: '1.0 - 2.5',
      vector: 'Anopheles mosquito',
    },
    diarrhoea: {
      name: 'Acute Watery Diarrhoea',
      r0Range: '2.0 - 4.0',
      vector: 'Contaminated water',
    },
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card className="shadow-md border-2 border-gray-200">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Simulation Controls</CardTitle>
          <CardDescription>
            Configure outbreak parameters and test intervention strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Origin District */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Origin District</Label>
              <Select value={originDistrict} onValueChange={setOriginDistrict}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {districts.map((district) => (
                    <SelectItem key={district.id} value={district.name}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Disease Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Disease Type</Label>
              <Select value={disease} onValueChange={setDisease}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dengue">Dengue</SelectItem>
                  <SelectItem value="malaria">Malaria</SelectItem>
                  <SelectItem value="diarrhoea">Acute Watery Diarrhoea</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                R₀ range: {diseaseInfo[disease as keyof typeof diseaseInfo].r0Range}
              </p>
            </div>

            {/* Initial Cases */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Initial Cases: {initialCases}
              </Label>
              <Slider
                value={[initialCases]}
                onValueChange={(val) => setInitialCases(val[0])}
                min={10}
                max={1000}
                step={10}
                className="mt-2"
              />
              <p className="text-xs text-gray-500">Starting infection count</p>
            </div>

            {/* Reproduction Number */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                R₀ Value: {reproductionNumber.toFixed(1)}
              </Label>
              <Slider
                value={[reproductionNumber * 10]}
                onValueChange={(val) => setReproductionNumber(val[0] / 10)}
                min={10}
                max={50}
                step={1}
                className="mt-2"
              />
              <p className="text-xs text-gray-500">Basic reproduction number</p>
            </div>
          </div>

          {/* Intervention Buttons */}
          <div className="mt-6 space-y-3">
            <Label className="text-sm font-medium">Public Health Interventions</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant={interventions.includes('vaccination') ? 'default' : 'outline'}
                className={
                  interventions.includes('vaccination')
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : ''
                }
                onClick={() => toggleIntervention('vaccination')}
              >
                <Syringe className="h-4 w-4 mr-2" />
                Vaccination
              </Button>
              <Button
                variant={interventions.includes('mosquito-control') ? 'default' : 'outline'}
                className={
                  interventions.includes('mosquito-control')
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : ''
                }
                onClick={() => toggleIntervention('mosquito-control')}
              >
                <ShieldCheck className="h-4 w-4 mr-2" />
                Mosquito Control
              </Button>
              <Button
                variant={interventions.includes('water-sanitation') ? 'default' : 'outline'}
                className={
                  interventions.includes('water-sanitation')
                    ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                    : ''
                }
                onClick={() => toggleIntervention('water-sanitation')}
              >
                <Droplets className="h-4 w-4 mr-2" />
                Water Sanitation
              </Button>
              <Button
                variant={interventions.includes('quarantine') ? 'default' : 'outline'}
                className={
                  interventions.includes('quarantine')
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : ''
                }
                onClick={() => toggleIntervention('quarantine')}
              >
                <Home className="h-4 w-4 mr-2" />
                Quarantine
              </Button>
            </div>
          </div>

          {/* Simulation Controls */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleReset}
                disabled={!isPlaying && interventions.length === 0}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            <Button
              className="bg-black text-white hover:bg-gray-800"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause Simulation
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Simulation
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Disease Spread Map */}
      <DiseaseSpreadMap
        originDistrict={originDistrict}
        disease={disease}
        initialCases={initialCases}
        reproductionNumber={reproductionNumber}
        isPlaying={isPlaying}
        interventions={interventions}
        onReset={handleReset}
      />

      {/* Info Card */}
      <Card className="shadow-md bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-blue-600 text-lg font-bold">i</span>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-2">About this Simulation</h4>
              <p className="text-sm text-blue-800 leading-relaxed">
                This isochrone-based simulation visualizes disease spread from a selected origin district over time.
                Each expanding ring represents one week of disease progression. The spread rate is influenced by the
                basic reproduction number (R₀) and can be controlled through public health interventions. Interventions
                reduce the effective R₀ value: Vaccination (40% reduction), Mosquito Control (30% reduction),
                Water Sanitation (25% reduction), and Quarantine (50% reduction). Multiple interventions can be
                combined for greater effect.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
