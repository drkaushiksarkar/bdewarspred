import type {
  Disease,
  FeatureImportance,
  RiskData,
  TimeSeriesDataPoint,
  WeatherData,
  WeatherDiseaseTrigger,
  DiseaseData,
} from '@/lib/types';
import { subDays, format } from 'date-fns';
import { locations } from '@/lib/locations';
import modelOutput from '@/lib/model-output.json';
import diarrhoeaData from '@/lib/diarrhoea-data.json';


export { locations };

export const diseases: Disease[] = [
  { id: 'dengue', name: 'Dengue' },
  { id: 'malaria', name: 'Malaria' },
  { id: 'diarrhoea', name: 'Acute Watery Diarrhoea' },
];

// Helper to match district names, accommodating slight variations.
function getDistrictNameMatch(districtName: string): string | undefined {
    const lowerCaseDistrict = districtName.toLowerCase();
    const location = locations.find(l => l.level === 'district' && l.name.toLowerCase() === lowerCaseDistrict);
    return location?.name;
}

export function getRealTimeSeriesData(districtName: string, disease: string): TimeSeriesDataPoint[] {
    const matchedDistrictName = getDistrictNameMatch(districtName);
    if (!matchedDistrictName) return [];

    let sourceData: any[];
    if (disease === 'dengue') {
        sourceData = modelOutput;
    } else if (disease === 'diarrhoea') {
        sourceData = diarrhoeaData;
    } else {
        // Return empty for malaria as it doesn't have a time-series view
        return [];
    }
    
    return sourceData
        .filter(item => item.district.toLowerCase() === matchedDistrictName.toLowerCase())
        .map((item): TimeSeriesDataPoint => ({
            date: item.date,
            actual: item.actual,
            predicted: item.predicted,
            uncertainty: item.uncertainty,
            is_outbreak: item.is_outbreak,
        }));
}


export const getAggregatedDenguePredictions = (): { [districtName: string]: number } => {
  const allData: any[] = modelOutput;
  const totals: { [districtName: string]: number } = {};

  allData.forEach(item => {
    const districtName = item.district;
    if (districtName) {
      if (!totals[districtName]) {
        totals[districtName] = 0;
      }
      totals[districtName] += item.predicted || 0;
    }
  });

  return totals;
};

export const getAggregatedDiarrhoeaPredictions = (): { [districtName: string]: number } => {
  const allData: any[] = diarrhoeaData;
  const totals: { [districtName: string]: number } = {};
  
  allData.forEach(item => {
    // Correctly match the lowercase district from JSON to the proper-case name
    const geojsonDistrictName = Object.keys(locations).find(
        (key: any) => locations[key].name.toLowerCase() === item.district.toLowerCase() && locations[key].level === 'district'
    );
    const districtName = geojsonDistrictName ? locations[geojsonDistrictName].name : item.district;

    if (districtName) {
      if (!totals[districtName]) {
        totals[districtName] = 0;
      }
      totals[districtName] += item.predicted || 0;
    }
  });

  return totals;
};


export const dengueRiskData: RiskData[] = [
  { id: '1', location: 'Mirpur, Dhaka', risk_category: 'High', risk_score: 92, change: 15 },
  { id: '2', location: 'Uttara, Dhaka', risk_category: 'High', risk_score: 89, change: 8 },
  { id: '3', location: 'Paltan, Dhaka', risk_category: 'Medium', risk_score: 74, change: -3 },
  { id: '4', location: 'Agrabad, Chattogram', risk_category: 'Medium', risk_score: 68, change: 11 },
  { id: '5', location: 'Savar, Dhaka', risk_category: 'Low', risk_score: 45, change: 2 },
];

export const malariaRiskData: RiskData[] = [
  { id: '1', location: 'Khagrachari Sadar', risk_category: 'High', risk_score: 88, change: 9 },
  { id: '2', location: 'Rangamati Sadar', risk_category: 'High', risk_score: 85, change: 5 },
  { id: '3', location: 'Bandarban Sadar', risk_category: 'Medium', risk_score: 76, change: 14 },
  { id: '4', location: 'Teknaf, Cox\'s Bazar', risk_category: 'Medium', risk_score: 65, change: -2 },
  { id: '5', location: 'Kaptai, Rangamati', risk_category: 'Low', risk_score: 52, change: 1 },
];

export const diarrhoeaRiskData: RiskData[] = [
  { id: '1', location: 'Mohammadpur, Dhaka', risk_category: 'High', risk_score: 94, change: 20 },
  { id: '2', location: 'Sitakunda, Chattogram', risk_category: 'Medium', risk_score: 78, change: 10 },
  { id: '3', location: 'Koyra, Khulna', risk_category: 'Medium', risk_score: 71, change: 5 },
  { id: '4', location: 'Patuakhali Sadar', risk_category: 'Low', risk_score: 55, change: -4 },
  { id: '5', location: 'Amtali, Barguna', risk_category: 'Low', risk_score: 49, change: 3 },
];

export const featureImportanceData: FeatureImportance[] = [
    { feature: 'Rainfall (14d lag)', importance: 0.28 },
    { feature: 'Temperature (7d lag)', importance: 0.21 },
    { feature: 'Population Density', importance: 0.15 },
    { feature: 'Previous Cases (7d)', importance: 0.12 },
    { feature: 'Humidity (7d lag)', importance: -0.09 },
    { feature: 'Govt. Interventions', importance: -0.16 },
];

export const weatherDiseaseTriggers: WeatherDiseaseTrigger[] = [
    {
        id: 1,
        variable: 'High Temperature',
        icon: 'Thermometer',
        diseases: ['Dengue', 'Diarrhoea'],
        impact: 'Increases mosquito metabolic and reproductive rates; accelerates pathogen replication.'
    },
    {
        id: 2,
        variable: 'High Humidity',
        icon: 'Droplets',
        diseases: ['Dengue', 'Malaria'],
        impact: 'Supports mosquito survival, activity, and lifespan, increasing opportunities for transmission.'
    },
    {
        id: 3,
        variable: 'Heavy Rainfall',
        icon: 'CloudRain',
        diseases: ['Dengue', 'Diarrhoea', 'Malaria'],
        impact: 'Creates breeding sites for mosquitoes (Dengue, Malaria); can contaminate water sources (Diarrhoea).'
    }
];

// Note: genlandDistricts is now deprecated and will be removed in a future update.
// For now, we will keep it for any components that might still reference it.
export const genlandDistricts = [
    { id: 'd1', name: 'Alpha', incidence: 0.8, path: "M40,50 L100,20 L160,70 L120,130 Z" },
    { id: 'd2', name: 'Beta', incidence: 0.5, path: "M100,20 L180,25 L220,80 L160,70 Z" },
    { id: 'd3', name: 'Gamma', incidence: 0.3, path: "M160,70 L220,80 L250,150 L180,140 Z" },
    { id: 'd4', name: 'Delta', incidence: 0.9, path: "M120,130 L180,140 L250,150 L150,200 Z" },
    { id: 'd5', name: 'Epsilon', incidence: 0.1, path: "M40,50 L120,130 L60,180 Z" },
    { id: 'd6', name: 'Zeta', incidence: 0.6, path: "M220,80 L280,70 L320,130 L250,150 Z" },
];


export const weatherData: WeatherData[] = [
  { label: 'Temperature', value: '30.5°C' },
  { label: 'Humidity', value: '75%' },
  { label: 'Rainfall', value: '0mm' },
];

// Calculate total monthly cases for each disease
export function getMonthlyCases(): DiseaseData[] {
  // Get aggregated predictions
  const dengueTotals = getAggregatedDenguePredictions();
  const diarrhoeaTotals = getAggregatedDiarrhoeaPredictions();

  // Calculate total predicted cases across all districts
  const dengueCases = Math.round(Object.values(dengueTotals).reduce((sum, val) => sum + val, 0));
  const diarrhoeaCases = Math.round(Object.values(diarrhoeaTotals).reduce((sum, val) => sum + val, 0));

  // For malaria, we'll use a calculated estimate based on risk data
  // Since there's no specific malaria prediction data, we'll estimate based on high-risk areas
  const malariaEstimate = Math.round(malariaRiskData.reduce((sum, area) => {
    // Estimate cases based on risk score (higher risk = more cases)
    return sum + (area.risk_score * 10); // Scale factor for estimation
  }, 0));

  // Calculate trends (simulated - in production, compare with previous month's data)
  // Positive = increase, Negative = decrease
  const malariaTrend = 12; // 12% increase from previous month
  const dengueTrend = -8; // 8% decrease from previous month
  const diarrhoeaTrend = 15; // 15% increase from previous month

  return [
    {
      label: 'Malaria',
      value: `${malariaEstimate.toLocaleString()}`,
      is_high: malariaEstimate > 4000,
      trend: malariaTrend
    },
    {
      label: 'Dengue',
      value: `${dengueCases.toLocaleString()}`,
      is_high: dengueCases > 10000,
      trend: dengueTrend
    },
    {
      label: 'Diarrhoea',
      value: `${diarrhoeaCases.toLocaleString()}`,
      is_high: diarrhoeaCases > 8000,
      trend: diarrhoeaTrend
    },
  ];
}
