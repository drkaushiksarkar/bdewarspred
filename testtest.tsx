
'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl, { Map, LngLatBoundsLike } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as turf from '@turf/turf';

interface Prediction { 
    upazila: string; 
    id: string; 
    falciparum_cases: number;
    vivax_cases: number;
}

// Basic CSV parsing
function parseCSV(csv: string): Prediction[] {
    const lines = csv.trim().split(/\r\n|\n/);
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
        const values = line.split(',');
        const obj: any = {};
        headers.forEach((header, i) => {
            const value = values[i].trim();
            obj[header] = isNaN(Number(value)) ? value : Number(value);
        });
        return obj as Prediction;
    });
}

const speciesColors = {
    falciparum: '#8c0026',
    vivax: '#004b8c'
}

const MapLegend = ({ species, stops }: { species: 'falciparum' | 'vivax', stops: [number, string][] }) => (
    <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-md max-w-xs">
      <h3 className="font-semibold text-sm mb-2" style={{color: speciesColors[species]}}>
          {species === 'falciparum' ? 'P. falciparum' : 'P. vivax'} Predicted Cases
      </h3>
      <div className="flex flex-col gap-1">
        {stops.map(([value, color], i) => (
          <div key={i} className="flex items-center gap-2">
            <span style={{ backgroundColor: color }} className="w-4 h-4 rounded-sm border border-black/20" />
            <span className="text-xs">
              {stops[i+1] ? `${value} - ${stops[i+1][0]}` : `> ${value}`}
            </span>
          </div>
        ))}
      </div>
    </div>
);

type Props = {
    height?: string;
};

export default function MalariaMap({ height = '550px' }: Props) {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<Map | null>(null);
    const hasInitializedRef = useRef(false);
    const [activeSpecies, setActiveSpecies] = useState<'falciparum' | 'vivax'>('falciparum');
    const [isMapLoaded, setIsMapLoaded] = useState(false);

    const colorStops: [number, string][] = [
        [0, '#ffffcc'],
        [5, '#ffeda0'],
        [10, '#fed976'],
        [25, '#feb24c'],
        [50, '#fd8d3c'],
        [100, '#fc4e2a'],
        [200, '#e31a1c'],
        [500, '#b10026']
    ];

    useEffect(() => {
        if (hasInitializedRef.current || !mapContainerRef.current) return;
        hasInitializedRef.current = true;

        const map = new maplibregl.Map({
            container: mapContainerRef.current,
            style: {
              version: 8,
              sources: {},
              layers: [],
              glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
            },
            center: [91.8, 22.3],
            zoom: 7,
            attributionControl: false,
        });

        map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
        map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');

        map.on('load', async () => {
            map.addSource('osm', {
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '© OpenStreetMap contributors',
            });
            map.addLayer({ id: 'osm-raster', type: 'raster', source: 'osm' });

            const [geojsonRes, predictionsRes] = await Promise.all([
                fetch('/geo/malaria.geojson'),
                fetch('/geo/malaria_predictions.csv')
            ]);
            const geojson = await geojsonRes.json();
            const predictionsCsv = await predictionsRes.text();
            const predictions = parseCSV(predictionsCsv);

            const predictionsById = new Map(predictions.map(p => [p.id, p]));

            geojson.features.forEach((feature: any) => {
                const prediction = predictionsById.get(feature.properties.upazila_id);
                if (prediction) {
                    feature.properties.falciparum_cases = prediction.falciparum_cases;
                    feature.properties.vivax_cases = prediction.vivax_cases;
                }
            });

            map.addSource('malaria-upazilas', { type: 'geojson', data: geojson });
            
            const casePaint = (species: 'falciparum' | 'vivax') => {
                const stops = colorStops.reduce((acc, [stop, color]) => [...acc, stop, color], [] as (string|number)[]);
                return [
                    'step',
                    ['get', `${species}_cases`],
                    '#CCCCCC', // Default color for no data
                    ...stops
                ];
            };

            map.addLayer({
                id: 'upazila-fill-falciparum',
                type: 'fill',
                source: 'malaria-upazilas',
                paint: {
                    'fill-color': casePaint('falciparum'),
                    'fill-opacity': 0.8,
                },
                layout: { visibility: 'visible' }
            });

            map.addLayer({
                id: 'upazila-fill-vivax',
                type: 'fill',
                source: 'malaria-upazilas',
                paint: {
                    'fill-color': casePaint('vivax'),
                    'fill-opacity': 0.8
                },
                layout: { visibility: 'none' }
            });

            map.addLayer({
                id: 'upazila-outline',
                type: 'line',
                source: 'malaria-upazilas',
                paint: { 'line-width': 1, 'line-color': '#333' }
            });
            
            const bbox = turf.bbox(geojson) as LngLatBoundsLike;
            map.fitBounds(bbox, { padding: 24 });
            setIsMapLoaded(true);
        });

        mapRef.current = map;
        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
        }
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        if (!map || !isMapLoaded) return;

        const falciparumVisibility = activeSpecies === 'falciparum' ? 'visible' : 'none';
        const vivaxVisibility = activeSpecies === 'vivax' ? 'visible' : 'none';
        
        map.setLayoutProperty('upazila-fill-falciparum', 'visibility', falciparumVisibility);
        map.setLayoutProperty('upazila-fill-vivax', 'visibility', vivaxVisibility);

    }, [activeSpecies, isMapLoaded]);

    return (
        <div className="relative">
            <div className="absolute top-2 left-2 z-10">
                <div className="inline-flex rounded border p-1 bg-white shadow">
                    <button 
                        className={`px-2 py-1 text-sm rounded ${activeSpecies==='falciparum' ? 'bg-slate-900 text-white' : ''}`}
                        onClick={()=>setActiveSpecies('falciparum')}
                        aria-pressed={activeSpecies==='falciparum'}
                    >
                        P. falciparum
                    </button>
                    <button 
                        className={`px-2 py-1 text-sm rounded ${activeSpecies==='vivax' ? 'bg-slate-900 text-white' : ''}`}
                        onClick={()=>setActiveSpecies('vivax')}
                        aria-pressed={activeSpecies==='vivax'}
                    >
                        P. vivax
                    </button>
                </div>
            </div>
            <div ref={mapContainerRef} style={{ height }} className="rounded-lg overflow-hidden shadow" />
            <div className="absolute bottom-2 right-2 z-10">
                <MapLegend species={activeSpecies} stops={colorStops} />
            </div>
        </div>
    );
}