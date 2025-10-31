
'use client';

import { useEffect, useRef, useMemo } from 'react';
import maplibregl, { Map, LngLatBoundsLike } from 'maplibre-gl';
import * as turf from '@turf/turf';

type Props = {
  height?: string;
  showLabelsDefault?: boolean;
  predictionData?: { [districtName: string]: number };
};

const MapLegend = ({ title, stops }: { title: string, stops: [number, string][] }) => (
  <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-md max-w-xs">
    <h3 className="font-semibold text-sm mb-2">{title}</h3>
    <div className="flex flex-col gap-1">
      {stops.map(([value, color], i) => {
        const intValue = Math.floor(value);
        const nextIntValue = i < stops.length - 1 ? Math.floor(stops[i + 1][0]) : null;
        return (
          <div key={i} className="flex items-center gap-2">
            <span style={{ backgroundColor: color }} className="w-4 h-4 rounded-sm border border-black/20" />
            <span className="text-xs">
              {i === 0
                ? `< ${nextIntValue}`
                : i === stops.length - 1
                  ? `≥ ${intValue}`
                  : `${intValue} - ${nextIntValue}`
              }
            </span>
          </div>
        );
      })}
    </div>
  </div>
);

export default function DiarrhoeaMap({
  height = '550px',
  showLabelsDefault = true,
  predictionData = {},
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  // Dynamic color stops based on actual data
  const colorStops: [number, string][] = useMemo(() => {
    const values = Object.values(predictionData).filter((v) => v !== undefined && !isNaN(v));

    // If no data, use default scale
    if (values.length === 0) {
      return [
        [0, '#f7fcfd'],
        [5, '#e0ecf4'],
        [10, '#bfd3e6'],
        [20, '#9ebcda'],
        [40, '#8c96c6'],
        [60, '#8c6bb1'],
        [80, '#88419d'],
        [100, '#6e016b']
      ];
    }

    const min = Math.floor(Math.min(...values));
    const max = Math.ceil(Math.max(...values));

    // If all values are the same or max is 0, use a simple scale
    if (min === max || max === 0) {
      return [
        [0, '#f7fcfd'],
        [1, '#e0ecf4'],
        [2, '#bfd3e6'],
        [3, '#9ebcda'],
        [4, '#8c96c6'],
        [5, '#8c6bb1'],
        [8, '#88419d'],
        [10, '#6e016b']
      ];
    }

    // Color palette (blues to purples - same as before)
    const colors = ['#f7fcfd', '#e0ecf4', '#bfd3e6', '#9ebcda', '#8c96c6', '#8c6bb1', '#88419d', '#6e016b'];

    // Create dynamic stops - use exponential distribution for better visualization
    const stops: [number, string][] = [];
    const range = max - min;

    // Create 8 stops with exponential distribution
    for (let i = 0; i < colors.length; i++) {
      let value: number;
      if (i === 0) {
        value = min;
      } else {
        // Exponential distribution: more granularity at lower values
        const ratio = i / (colors.length - 1);
        const exponentialRatio = Math.pow(ratio, 1.5); // 1.5 exponent for slight curve
        value = Math.floor(min + range * exponentialRatio);
      }
      stops.push([value, colors[i]]);
    }

    // Ensure the last stop is exactly the max
    stops[stops.length - 1][0] = max;

    return stops;
  }, [predictionData]);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
           'osm': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          }
        },
        layers: [
            { id: 'osm-raster', type: 'raster', source: 'osm' }
        ],
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      },
      center: [90.4, 23.7],
      zoom: 5.5,
      attributionControl: false,
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), 'top-right');

    map.on('load', async () => {
      // 1. Fetch GeoJSON
      const res = await fetch('/geo/districts.geojson');
      const gj = await res.json();

      // 2. Create a case-insensitive lookup map from predictionData
      const predictionLookup: { [districtName: string]: number } = {};
      Object.entries(predictionData).forEach(([district, cases]) => {
        predictionLookup[district.toLowerCase()] = cases;
      });

      // 3. Join data into GeoJSON
      gj.features.forEach((feature: any) => {
        const geojsonDistrictName = feature.properties.ADM2_EN.toLowerCase();
        const predictedCases = predictionLookup[geojsonDistrictName];

        feature.properties.predictedCases = predictedCases;
        feature.properties.fillColor =
            predictedCases !== undefined
            ? (colorStops.slice().reverse().find(stop => predictedCases >= stop[0])?.[1] || '#CCCCCC')
            : '#CCCCCC';
      });

      map.addSource('districts', {
        type: 'geojson',
        data: gj,
        promoteId: 'ADM2_EN'
      });

      map.addLayer({
        id: 'district-fill',
        type: 'fill',
        source: 'districts',
        paint: {
          'fill-color': ['get', 'fillColor'],
          'fill-opacity': 0.7,
          'fill-outline-color': '#000000',
        }
      });
      
      map.addLayer({
        id: 'district-outline',
        type: 'line',
        source: 'districts',
        paint: { 'line-width': 1, 'line-color': '#333' }
      });

      const bbox = turf.bbox(gj) as LngLatBoundsLike;
      map.fitBounds(bbox, { padding: 24 });
      
      const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false });
      map.on('mousemove', 'district-fill', (e) => {
        const f = e.features && e.features[0];
        if (!f) return;
        const p = f.properties || {};
        const cases = p.predictedCases !== undefined ? Math.floor(p.predictedCases).toLocaleString() : 'No data';
        const html = `<div style="font-size:12px; color: #000;"><b>District:</b> ${p.ADM2_EN || ''}<br/><b>Predicted Cases:</b> ${cases}</div>`;
        popup.setLngLat(e.lngLat).setHTML(html).addTo(map);
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'district-fill', () => {
        popup.remove();
        map.getCanvas().style.cursor = '';
      });
    });

    mapRef.current = map;
    return () => {
        mapRef.current?.remove();
        mapRef.current = null;
    }
  }, [predictionData, showLabelsDefault]);

  return (
    <div className="relative w-full">
      <div ref={containerRef} style={{ height }} className="rounded-lg overflow-hidden shadow" />
      <div className="absolute bottom-2 left-2 z-10">
          <MapLegend title="Total Predicted Cases" stops={colorStops} />
      </div>
    </div>
  );
}
