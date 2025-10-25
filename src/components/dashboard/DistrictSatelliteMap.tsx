
'use client';

import { useEffect, useRef, useState } from 'react';
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
      {stops.map(([value, color], i) => (
        <div key={i} className="flex items-center gap-2">
          <span style={{ backgroundColor: color }} className="w-4 h-4 rounded-sm border border-black/20" />
          <span className="text-xs">
            {i === 0 ? `< ${stops[i+1][0]}` : i === stops.length - 1 ? `> ${value}` : `${value} - ${stops[i+1][0]}`}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default function DistrictSatelliteMap({
  height = '70vh',
  showLabelsDefault = false,
  predictionData = {}
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const legendContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const [basemap, setBasemap] = useState<'esri' | 'osm'>('esri');
  const [showLabels, setShowLabels] = useState<boolean>(showLabelsDefault);

  const colorStops: [number, string][] = [
    [0, '#ffffcc'],
    [50, '#ffeda0'],
    [200, '#fed976'],
    [500, '#feb24c'],
    [1000, '#fd8d3c'],
    [2500, '#fc4e2a'],
    [5000, '#e31a1c'],
    [10000, '#b10026']
  ];

  const getFillColor = (value: number | undefined): string => {
    if (value === undefined) return '#CCCCCC'; // Default color for no data
    for (let i = colorStops.length - 1; i >= 0; i--) {
        if (value >= colorStops[i][0]) {
            return colorStops[i][1];
        }
    }
    return colorStops[0][1];
  };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {},
        layers: [],
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      },
      center: [90.4, 23.7],
      zoom: 5.5,
      attributionControl: false,
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), 'top-right');
    
    if (legendContainerRef.current) {
        map.addControl(new maplibregl.NavigationControl({}), 'top-right');
    }

    map.on('load', async () => {
      // Basemaps
      map.addSource('esri-world', {
        type: 'raster',
        tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
        tileSize: 256,
        attribution: '© Esri, Maxar, Earthstar Geographics',
      });
      map.addLayer({ id: 'esri-raster', type: 'raster', source: 'esri-world' });

      map.addSource('osm', {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors',
      });
      map.addLayer({ id: 'osm-raster', type: 'raster', source: 'osm', layout: { visibility: 'none' } });

      // Districts GeoJSON
      const res = await fetch('/geo/districts.geojson');
      const gj = await res.json();

      // Join prediction data
      gj.features.forEach((feature: any) => {
        const districtName = feature.properties.ADM2_EN;
        const predictedCases = predictionData[districtName];
        feature.properties.predictedCases = predictedCases;
        feature.properties.fillColor = getFillColor(predictedCases);
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

      // Labels
      const centroids = {
        type: 'FeatureCollection',
        features: gj.features.map((f: any) => {
          try {
            const c = turf.centroid(f);
            c.properties = { ...f.properties };
            return c;
          } catch { return null; }
        }).filter(Boolean)
      };
      map.addSource('district-labels', { type: 'geojson', data: centroids });
      map.addLayer({
        id: 'district-labels-layer',
        type: 'symbol',
        source: 'district-labels',
        layout: {
          'text-field': ['get', 'ADM2_EN'],
          'text-font': ['Noto Sans Regular'],
          'text-size': 11,
          'text-allow-overlap': false,
          'visibility': showLabelsDefault ? 'visible' : 'none'
        },
        paint: {
          'text-color': '#FFFFFF',
          'text-halo-color': '#000',
          'text-halo-width': 1.2
        }
      });

      // Tooltip
      const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false });
      map.on('mousemove', 'district-fill', (e) => {
        const f = e.features && e.features[0];
        if (!f) return;
        const p = f.properties || {};
        const cases = p.predictedCases !== undefined ? p.predictedCases.toLocaleString() : 'No data';
        const html = `<div style="font-size:12px; color: #000;"><b>District:</b> ${p.ADM2_EN || ''}<br/><b>Predicted Cases:</b> ${cases}</div>`;
        popup.setLngLat(e.lngLat).setHTML(html).addTo(map);
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'district-fill', () => {
        popup.remove();
        map.getCanvas().style.cursor = '';
      });

      // Click to zoom
      map.on('click', 'district-fill', (e) => {
        const f = e.features && e.features[0];
        if (!f) return;
        try {
          const fbbox = turf.bbox(f as any) as LngLatBoundsLike;
          map.fitBounds(fbbox, { padding: 32, maxZoom: 10 });
        } catch {}
      });
    });

    mapRef.current = map;
    return () => mapRef.current?.remove();
  }, [predictionData, showLabelsDefault]);

  // Toggle basemap
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    map.setLayoutProperty('esri-raster', 'visibility', basemap === 'esri' ? 'visible' : 'none');
    map.setLayoutProperty('osm-raster', 'visibility', basemap === 'osm' ? 'visible' : 'none');
  }, [basemap]);

  // Toggle labels
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const vis = showLabels ? 'visible' : 'none';
    if (map.getLayer('district-labels-layer')) {
      map.setLayoutProperty('district-labels-layer', 'visibility', vis);
    }
  }, [showLabels]);

  return (
    <div className="relative w-full">
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
         <div className="inline-flex rounded border p-1 bg-white shadow">
            <button
                className={`px-2 py-1 text-sm rounded ${basemap==='esri' ? 'bg-slate-900 text-white' : ''}`}
                onClick={() => setBasemap('esri')}
                aria-pressed={basemap==='esri'}
            >
                Satellite
            </button>
            <button
                className={`px-2 py-1 text-sm rounded ${basemap==='osm' ? 'bg-slate-900 text-white' : ''}`}
                onClick={() => setBasemap('osm')}
                aria-pressed={basemap==='osm'}
            >
                OSM
            </button>
        </div>
        <label className="inline-flex items-center gap-2 text-sm bg-white/80 backdrop-blur-sm px-2 py-1 rounded shadow">
            <input type="checkbox" checked={showLabels} onChange={(e)=>setShowLabels(e.target.checked)} />
            District labels
        </label>
      </div>

      <div ref={containerRef} style={{ height }} className="rounded-lg overflow-hidden shadow" />

      <div ref={legendContainerRef} className="absolute bottom-2 left-2 z-10">
          <MapLegend title="Total Predicted Cases" stops={colorStops} />
      </div>

      <p className="mt-1 text-xs text-slate-500">
        Tiles © Esri, Maxar, Earthstar Geographics; © OpenStreetMap contributors.
      </p>
    </div>
  );
}
