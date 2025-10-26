"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, Settings } from 'lucide-react';

export default function SimulationTab() {
  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline text-2xl">Disease Outbreak Simulator</CardTitle>
              <CardDescription className="mt-2">
                Test response strategies in a safe environment
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button className="bg-black text-white hover:bg-gray-800">
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96 bg-muted/20 rounded-lg border-2 border-dashed">
            <div className="text-center">
              <Play className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                Simulation Feature
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Coming soon - Disease outbreak simulation and intervention testing
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
