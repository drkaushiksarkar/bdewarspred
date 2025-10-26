import DistrictSatelliteMap from '@/components/dashboard/DistrictSatelliteMap';
import { getAggregatedDenguePredictions } from '@/lib/data';

export default function DistrictsMapPage() {
  const predictionData = getAggregatedDenguePredictions();

  return (
    <main className="p-4">
      <h1 className="text-xl font-semibold mb-3">Predicted Cases Heatmap</h1>
      <DistrictSatelliteMap 
        height="calc(100vh - 160px)" 
        showLabelsDefault={false}
        predictionData={predictionData}
      />
    </main>
  );
}
