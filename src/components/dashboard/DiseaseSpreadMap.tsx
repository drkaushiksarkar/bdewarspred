"use client";

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Card } from '@/components/ui/card';
import { allocateInterventions, calculateExpectedCases, calculateRiskLevel } from '@/lib/game-theoretic-allocator';

interface DiseaseSpreadMapProps {
  originDistrict: string;
  disease: string;
  initialCases: number;
  reproductionNumber: number;
  isPlaying: boolean;
  interventions: string[];
  onReset: () => void;
}

export default function DiseaseSpreadMap({
  originDistrict,
  disease,
  initialCases,
  reproductionNumber,
  isPlaying,
  interventions,
}: DiseaseSpreadMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [isContainerReady, setIsContainerReady] = useState(false);
  const [bangladeshGeoJSON, setBangladeshGeoJSON] = useState<any>(null);
  const [weatherData, setWeatherData] = useState<any>(null);

  // Fetch weather data from database
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await fetch(
          `/api/simulation/weather-data?disease=${disease}&district=${originDistrict}`
        );
        const data = await response.json();
        if (data.success) {
          setWeatherData(data.data);
        }
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    fetchWeatherData();
  }, [disease, originDistrict]);

  // Fetch Bangladesh GeoJSON
  useEffect(() => {
    fetch('/geo/districts.geojson')
      .then(res => res.json())
      .then(data => setBangladeshGeoJSON(data))
      .catch(err => console.error('Error loading GeoJSON:', err));
  }, []);

  // Initialize container readiness
  useEffect(() => {
    const timer = setTimeout(() => setIsContainerReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !isContainerReady || map.current || !bangladeshGeoJSON) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'osm-tiles-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [90.4, 23.8],
      zoom: 6.5,
      preserveDrawingBuffer: true, // Enable screenshot capture
    });

    map.current.on('load', () => {
      if (!map.current) return;

      // Add Bangladesh districts
      map.current.addSource('bangladesh-districts', {
        type: 'geojson',
        data: bangladeshGeoJSON,
      });

      // Add district boundaries
      map.current.addLayer({
        id: 'district-boundaries',
        type: 'line',
        source: 'bangladesh-districts',
        paint: {
          'line-color': '#666',
          'line-width': 1,
          'line-opacity': 0.6,
        },
      });

      // Add subtle district fill for better visibility
      map.current.addLayer({
        id: 'district-fill',
        type: 'fill',
        source: 'bangladesh-districts',
        paint: {
          'fill-color': '#f0f0f0',
          'fill-opacity': 0.3,
        },
      }, 'district-boundaries');
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [isContainerReady, bangladeshGeoJSON]);

  // Simulation effect
  useEffect(() => {
    if (!isPlaying || !map.current) return;

    const interval = setInterval(() => {
      setCurrentWeek((prev) => {
        if (prev >= 8) return 0;
        return prev + 1;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Update isochrones based on current week
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded() || currentWeek === 0) return;

    const spreadRadius = calculateSpreadRadius(currentWeek, reproductionNumber, interventions, disease);

    // Remove old isochrone layers and sources
    for (let i = 1; i <= 8; i++) {
      // Remove outline layer first (if it exists)
      if (map.current.getLayer(`isochrone-outline-${i}`)) {
        map.current.removeLayer(`isochrone-outline-${i}`);
      }
      // Remove fill layer
      if (map.current.getLayer(`isochrone-week-${i}`)) {
        map.current.removeLayer(`isochrone-week-${i}`);
      }
      // Now safe to remove source
      if (map.current.getSource(`isochrone-source-${i}`)) {
        map.current.removeSource(`isochrone-source-${i}`);
      }
    }

    // Add new isochrone layers
    for (let week = 1; week <= currentWeek; week++) {
      const radius = spreadRadius[week - 1];
      const intensity = 1 - (week / currentWeek) * 0.7;
      const color = getDiseaseColor(disease);

      // Create a circle around origin district
      const center = getDistrictCenter(originDistrict);
      if (!center) continue;

      const circleGeoJSON = createCircle(center, radius, 64);

      map.current.addSource(`isochrone-source-${week}`, {
        type: 'geojson',
        data: circleGeoJSON as any,
      });

      map.current.addLayer({
        id: `isochrone-week-${week}`,
        type: 'fill',
        source: `isochrone-source-${week}`,
        paint: {
          'fill-color': color,
          'fill-opacity': 0.15 + intensity * 0.25,
        },
      });

      // Add outline for current week
      if (week === currentWeek) {
        map.current.addLayer({
          id: `isochrone-outline-${week}`,
          type: 'line',
          source: `isochrone-source-${week}`,
          paint: {
            'line-color': color,
            'line-width': 2,
            'line-opacity': 0.8,
          },
        });
      }
    }
  }, [currentWeek, originDistrict, disease, reproductionNumber, interventions]);

  return (
    <Card className="relative overflow-hidden shadow-md">
      <div
        ref={mapContainer}
        style={{
          width: '100%',
          height: '600px',
          position: 'relative',
        }}
      />
      {currentWeek > 0 && (() => {
        // Calculate intervention allocation and post-intervention metrics
        const allocation = allocateInterventions(disease, reproductionNumber, 1.0, interventions);
        const expectedCases = calculateExpectedCases(initialCases, allocation.effectiveR0, currentWeek);
        const risk = calculateRiskLevel(allocation.effectiveR0, expectedCases);

        return (
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg min-w-[280px]">
            <div className="text-sm font-medium text-gray-700">Simulation Progress</div>
            <div className="text-2xl font-bold text-black mt-1">Week {currentWeek}</div>

            <div className="mt-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Expected Cases:</span>
                <span className="text-sm font-semibold text-black">{expectedCases.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Effective R₀:</span>
                <span className="text-sm font-semibold text-black">{allocation.effectiveR0.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">R₀ Reduction:</span>
                <span className="text-sm font-semibold text-green-600">
                  {(allocation.totalR0Reduction * 100).toFixed(1)}%
                </span>
              </div>

              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Risk Level:</span>
                  <span
                    className="text-sm font-bold px-2 py-1 rounded"
                    style={{
                      backgroundColor: risk.color + '20',
                      color: risk.color
                    }}
                  >
                    {risk.level}
                  </span>
                </div>
              </div>

              {interventions.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="text-xs text-gray-600 mb-1">Active Interventions:</div>
                  <div className="flex flex-wrap gap-1">
                    {allocation.optimalMix.map((int) => (
                      <span
                        key={int}
                        className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded"
                      >
                        {int.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </Card>
  );
}

// Helper functions
function calculateSpreadRadius(
  week: number,
  r0: number,
  interventions: string[],
  disease: string
): number[] {
  const radii: number[] = [];

  // Use game-theoretic allocator to determine effective R0
  const allocation = allocateInterventions(disease, r0, 1.0, interventions);
  const effectiveR0 = allocation.effectiveR0;

  for (let w = 1; w <= week; w++) {
    // Radius grows based on effective R0 (in km)
    const baseRadius = 20;
    radii.push(baseRadius * Math.pow(1.4, (w - 1) * Math.log(effectiveR0)));
  }

  return radii;
}

function getDiseaseColor(disease: string): string {
  const colors = {
    dengue: [255, 50, 50], // Red
    malaria: [138, 43, 226], // Purple
    diarrhoea: [255, 165, 0], // Orange
  };

  const rgb = colors[disease as keyof typeof colors] || colors.dengue;
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

function getDistrictCenter(districtName: string): [number, number] | null {
  // Coordinates for major districts (approximate centers)
  const centers: { [key: string]: [number, number] } = {
    'Dhaka': [90.4125, 23.8103],
    'Chattogram': [91.8317, 22.3569],
    'Khulna': [89.5403, 22.8456],
    'Rajshahi': [88.6042, 24.3745],
    'Sylhet': [91.8709, 24.8978],
    'Barisal': [90.3696, 22.7010],
    'Rangpur': [89.2444, 25.7439],
    'Mymensingh': [90.4203, 24.7471],
    'Comilla': [91.1809, 23.4607],
    'Coxsbazar': [91.9774, 21.4272],
  };

  return centers[districtName] || [90.4, 23.8];
}

function createCircle(
  center: [number, number],
  radiusInKm: number,
  points: number
): GeoJSON.Feature<GeoJSON.Polygon> {
  const coords = [];
  const distanceX = radiusInKm / (111.32 * Math.cos((center[1] * Math.PI) / 180));
  const distanceY = radiusInKm / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    coords.push([center[0] + x, center[1] + y]);
  }
  coords.push(coords[0]);

  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [coords],
    },
  };
}
