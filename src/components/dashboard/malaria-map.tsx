"use client";

import { useEffect, useRef, useState } from 'react';
import maplibregl, { Map, LngLatBoundsLike } from 'maplibre-gl';
import * as turf from '@turf/turf';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import Papa from 'papaparse';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const MapLegend = ({ title, stops }: { title: string, stops: [number, string][] }) => (
    <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-md max-w-xs">
        <h3 className="font-semibold text-sm mb-2">{title}</h3>
        <div className="flex flex-col gap-1">
            {stops.map(([value, color], i) => (
                <div key={i} className="flex items-center gap-2">
                    <span style={{ backgroundColor: color }} className="w-4 h-4 rounded-sm border border-black/20" />
                    <span className="text-xs">
                        {i === 0 ? `< ${stops[i + 1][0]}` : i === stops.length - 1 ? `> ${value}` : `${value} - ${stops[i + 1]?.[0] ?? ''}`}
                    </span>
                </div>
            ))}
        </div>
    </div>
);

type MalariaSpecies = 'pv_rate' | 'pf_rate' | 'mixed_rate';

export default function MalariaMap() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<Map | null>(null);
    const [geojsonData, setGeojsonData] = useState<any>(null);
    const [species, setSpecies] = useState<MalariaSpecies>('pv_rate');
    const [isContainerReady, setIsContainerReady] = useState(false);

    const colorStops: [number, string][] = [
        [-1e-5, '#2c7bb6'],
        [-1e-6, '#abd9e9'],
        [0, '#ffffbf'],
        [1e-6, '#fee090'],
        [1e-5, '#fdae61'],
        [1e-4, '#f46d43'],
        [5e-4, '#d73027']
    ];

    useEffect(() => {
        async function loadData() {
            try {
                const [geojsonRes, csvRes] = await Promise.all([
                    fetch('/geo/malaria.geojson'),
                    fetch('/geo/malaria_predictions.csv')
                ]);

                if (!geojsonRes.ok || !csvRes.ok) {
                    console.error("Failed to fetch map data");
                    return;
                }

                const geojson = await geojsonRes.json();
                const csvText = await csvRes.text();

                Papa.parse(csvText, {
                    header: true,
                    dynamicTyping: true,
                    complete: (results) => {
                        const predictionsByUpazila: { [key: string]: any } = {};
                        (results.data as any[]).forEach((row: any) => {
                            if (row.UpazilaID) {
                                predictionsByUpazila[row.UpazilaID] = {
                                    pv_rate: row.pv_rate,
                                    pf_rate: row.pf_rate,
                                    mixed_rate: row.mixed_rate
                                };
                            }
                        });

                        geojson.features.forEach((feature: any) => {
                            const upazilaId = feature.properties.UpazilaID;
                            const predictions = predictionsByUpazila[upazilaId];
                            if (predictions) {
                                feature.properties.pv_rate = predictions.pv_rate ?? 0;
                                feature.properties.pf_rate = predictions.pf_rate ?? 0;
                                feature.properties.mixed_rate = predictions.mixed_rate ?? 0;
                            }
                        });
                        setGeojsonData(geojson);
                    }
                });
            } catch (error) {
                console.error("Error loading map data:", error);
            }
        }

        loadData();
    }, []);

    // Wait for container to be ready
    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;

        // Use setTimeout to ensure the container has been painted
        const timer = setTimeout(() => {
            if (container.offsetWidth > 0 && container.offsetHeight > 0) {
                setIsContainerReady(true);
            }
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!containerRef.current || !geojsonData || !isContainerReady) return;
        if (mapRef.current) mapRef.current.remove();

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
                layers: [{ id: 'osm-raster', type: 'raster', source: 'osm' }],
                glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
            },
            center: [91.8, 22.3],
            zoom: 7,
            attributionControl: false,
        });

        mapRef.current = map;

        map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
        map.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), 'top-right');

        map.on('load', () => {
            map.addSource('malaria-data', {
                type: 'geojson',
                data: geojsonData
            });

            // Create fill color expression
            const fillColorExpression = [
                'interpolate',
                ['linear'],
                ['get', species],
                ...colorStops.flatMap(([value, color]) => [value, color])
            ];

            map.addLayer({
                id: 'malaria-fill',
                type: 'fill',
                source: 'malaria-data',
                paint: {
                    'fill-opacity': 0.7,
                    'fill-color': fillColorExpression as any
                }
            });

            map.addLayer({
                id: 'malaria-outline',
                type: 'line',
                source: 'malaria-data',
                paint: { 'line-width': 0.5, 'line-color': '#333' }
            });
            
            try {
                const bbox = turf.bbox(geojsonData) as LngLatBoundsLike;
                map.fitBounds(bbox, { padding: 24 });
            } catch (e) {
                console.error("Could not fit bounds", e);
            }

            const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false });
            map.on('mousemove', 'malaria-fill', (e: any) => {
                const f = e.features && e.features[0];
                if (!f) return;
                const p = f.properties || {};
                const rate = p[species];
                const html = `<div style="font-size:12px; color: #000;"><b>Upazila:</b> ${p.UpazilaNameEng || ''}<br/><b>Risk Rate:</b> ${rate !== undefined ? rate.toExponential(2) : 'No data'}</div>`;
                popup.setLngLat(e.lngLat).setHTML(html).addTo(map);
                map.getCanvas().style.cursor = 'pointer';
            });
            map.on('mouseleave', 'malaria-fill', () => {
                popup.remove();
                map.getCanvas().style.cursor = '';
            });
        });
        
        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
        }

    }, [geojsonData, species, isContainerReady, colorStops]);


    useEffect(() => {
        const map = mapRef.current;
        if (!map || !map.isStyleLoaded() || !geojsonData) return;
        
        const fillColorExpression = [
            'interpolate',
            ['linear'],
            ['get', species],
            ...colorStops.flatMap(([value, color]) => [value, color])
        ];

        map.setPaintProperty('malaria-fill', 'fill-color', fillColorExpression as any);

    }, [species, geojsonData, colorStops]);

    return (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="font-headline">Malaria Geospatial Risk Map</CardTitle>
                <CardDescription>
                    Simulated malaria risk by upazila based on species.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="relative w-full">
                    <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
                        <MapLegend title="Malaria Risk Rate" stops={colorStops} />
                        <div className="bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-md max-w-xs space-y-2">
                            <Label htmlFor="species-select">Species</Label>
                            <Select value={species} onValueChange={(value) => setSpecies(value as MalariaSpecies)}>
                                <SelectTrigger id="species-select">
                                    <SelectValue placeholder="Select Species" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pv_rate">Vivax (pv_rate)</SelectItem>
                                    <SelectItem value="pf_rate">Falciparum (pf_rate)</SelectItem>
                                    <SelectItem value="mixed_rate">Mixed (mixed_rate)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div ref={containerRef} style={{ height: '550px', width: '100%' }} className="rounded-lg overflow-hidden shadow" />
                </div>
            </CardContent>
        </Card>
    );
}
