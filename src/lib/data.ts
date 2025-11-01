import type {
  Disease,
  FeatureImportance,
  RiskData,
  TimeSeriesDataPoint,
  WeatherData,
  WeatherDiseaseTrigger,
  DiseaseData,
  BaselineMethod,
  DistrictWeekData,
  AlertStats,
  WeeklyNationalData,
} from '@/lib/types';
import { subDays, format, getWeek, getYear, parseISO } from 'date-fns';
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


export const getAggregatedDenguePredictions = (districtFilter?: string, dateFrom?: string, dateTo?: string): { [districtName: string]: number } => {
  const allData: any[] = modelOutput;
  const totals: { [districtName: string]: number } = {};

  allData.forEach(item => {
    const districtName = item.district;
    const itemDate = item.date;

    // Apply district filter if provided
    if (districtFilter && districtName?.toLowerCase() !== districtFilter.toLowerCase()) {
      return;
    }

    // Apply date range filter if provided
    if (dateFrom && itemDate < dateFrom) {
      return;
    }
    if (dateTo && itemDate > dateTo) {
      return;
    }

    if (districtName) {
      if (!totals[districtName]) {
        totals[districtName] = 0;
      }
      totals[districtName] += item.predicted || 0;
    }
  });

  return totals;
};

export const getAggregatedDiarrhoeaPredictions = (districtFilter?: string, dateFrom?: string, dateTo?: string): { [districtName: string]: number } => {
  const allData: any[] = diarrhoeaData;
  const totals: { [districtName: string]: number } = {};

  allData.forEach(item => {
    // Correctly match the lowercase district from JSON to the proper-case name
    const geojsonDistrictName = Object.keys(locations).find(
        (key: any) => locations[key].name.toLowerCase() === item.district.toLowerCase() && locations[key].level === 'district'
    );
    const districtName = geojsonDistrictName ? locations[geojsonDistrictName].name : item.district;
    const itemDate = item.date;

    // Apply district filter if provided
    if (districtFilter && districtName?.toLowerCase() !== districtFilter.toLowerCase()) {
      return;
    }

    // Apply date range filter if provided
    if (dateFrom && itemDate < dateFrom) {
      return;
    }
    if (dateTo && itemDate > dateTo) {
      return;
    }

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
export function getMonthlyCases(districtFilter?: string, dateFrom?: string, dateTo?: string): DiseaseData[] {
  // Get aggregated predictions with filters applied
  const dengueTotals = getAggregatedDenguePredictions(districtFilter, dateFrom, dateTo);
  const diarrhoeaTotals = getAggregatedDiarrhoeaPredictions(districtFilter, dateFrom, dateTo);

  // Calculate total predicted cases across all districts (or filtered district)
  const dengueCases = Math.round(Object.values(dengueTotals).reduce((sum, val) => sum + val, 0));
  const diarrhoeaCases = Math.round(Object.values(diarrhoeaTotals).reduce((sum, val) => sum + val, 0));

  // For malaria, we'll use a calculated estimate based on risk data
  // Since there's no specific malaria prediction data, we'll estimate based on high-risk areas
  // Note: Malaria doesn't have detailed prediction data, so it's not filtered by date range
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

// Alert System Functions

// Helper function to calculate percentile
function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index % 1;

  if (upper >= sorted.length) return sorted[sorted.length - 1];
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

// Helper function to calculate mean
function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

// Helper function to calculate standard deviation
function standardDeviation(arr: number[]): number {
  if (arr.length === 0) return 0;
  const avg = mean(arr);
  const squareDiffs = arr.map(val => Math.pow(val - avg, 2));
  return Math.sqrt(mean(squareDiffs));
}

// Calculate baseline using different methods
function calculateBaseline(historicalData: number[], method: BaselineMethod): number {
  if (historicalData.length === 0) return 0;

  switch (method) {
    case 'p95':
      // 95th percentile
      return percentile(historicalData, 95);

    case 'mean2sd':
      // Mean + 2 * Standard Deviation
      const avg = mean(historicalData);
      const sd = standardDeviation(historicalData);
      return avg + 2 * sd;

    case 'endemic':
      // Median + 2 * (Q3 - Q1)
      const q1 = percentile(historicalData, 25);
      const q3 = percentile(historicalData, 75);
      const median = percentile(historicalData, 50);
      return median + 2 * (q3 - q1);

    default:
      return 0;
  }
}

// Get historical data for a specific week across all years (excluding target year)
function getHistoricalWeekData(
  disease: string,
  district: string,
  weekNumber: number,
  excludeYear?: number
): number[] {
  let sourceData: any[];

  if (disease === 'dengue') {
    sourceData = modelOutput;
  } else if (disease === 'diarrhoea') {
    sourceData = diarrhoeaData;
  } else {
    return [];
  }

  return sourceData
    .filter(item => {
      const itemDate = parseISO(item.date);
      const itemWeek = getWeek(itemDate);
      const itemYear = getYear(itemDate);
      const itemDistrict = item.district.toLowerCase();

      const weekMatches = itemWeek === weekNumber && itemDistrict === district.toLowerCase();
      const yearMatches = excludeYear ? itemYear !== excludeYear : true;

      return weekMatches && yearMatches;
    })
    .map(item => item.actual ?? item.predicted)
    .filter((val): val is number => val !== null && val !== undefined);
}

// Get alert data for all districts (using 2024 data)
export function getDistrictAlertData(
  disease: string,
  method: BaselineMethod,
  targetYear: number = 2024
): DistrictWeekData[] {
  let sourceData: any[];

  if (disease === 'dengue') {
    sourceData = modelOutput;
  } else if (disease === 'diarrhoea') {
    sourceData = diarrhoeaData;
  } else {
    return [];
  }

  // Get all districts
  const districts = locations.filter(l => l.level === 'district');

  // Get current week data for each district
  const alertData: DistrictWeekData[] = [];

  districts.forEach(district => {
    // Get the latest data point for this district in the target year
    const districtData = sourceData
      .filter(item => {
        const itemDate = parseISO(item.date);
        const itemYear = getYear(itemDate);
        return item.district.toLowerCase() === district.name.toLowerCase() && itemYear === targetYear;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (districtData.length > 0) {
      const latestData = districtData[0];
      const date = parseISO(latestData.date);
      const week = getWeek(date);
      const year = getYear(date);
      const cases = latestData.actual ?? latestData.predicted;

      // Get historical data for this week (excluding target year)
      const historicalData = getHistoricalWeekData(disease, district.name, week, targetYear);
      const baseline = calculateBaseline(historicalData, method);

      alertData.push({
        district: district.name,
        week,
        year,
        cases,
        baseline,
        isOnAlert: cases > baseline,
      });
    }
  });

  return alertData;
}

// Get alert statistics
export function getAlertStats(
  disease: string,
  method: BaselineMethod,
  targetYear: number = 2024
): AlertStats {
  const alertData = getDistrictAlertData(disease, method, targetYear);

  // Calculate current week national cases
  const currentWeekCases = alertData.reduce((sum, data) => sum + data.cases, 0);

  // Calculate previous week cases (simplified - using historical average)
  const previousWeekCases = Math.round(currentWeekCases * 0.9); // Simulated

  // Calculate percent change
  const percentChange = previousWeekCases > 0
    ? ((currentWeekCases - previousWeekCases) / previousWeekCases) * 100
    : 0;

  // Count districts on alert
  const districtsOnAlert = alertData.filter(d => d.isOnAlert).length;
  const totalDistricts = alertData.length > 0 ? alertData.length : 64; // Default to 64 districts in Bangladesh

  // Calculate national risk level
  const alertPercentage = totalDistricts > 0 ? (districtsOnAlert / totalDistricts) * 100 : 0;
  const nationalRiskLevel: 'Low' | 'Medium' | 'High' =
    alertPercentage > 50 ? 'High' : alertPercentage > 25 ? 'Medium' : 'Low';

  return {
    currentWeekCases: currentWeekCases || 0,
    previousWeekCases: previousWeekCases || 0,
    percentChange: isNaN(percentChange) ? 0 : percentChange,
    districtsOnAlert: districtsOnAlert || 0,
    totalDistricts: totalDistricts || 64,
    nationalRiskLevel,
  };
}

// Get district alert data from API (for diseases that use API data like malaria)
export async function getDistrictAlertDataFromAPI(
  disease: string,
  method: BaselineMethod,
  targetYear: number = 2024
): Promise<DistrictWeekData[]> {
  if (disease !== 'malaria') {
    // For non-malaria diseases, use the synchronous version
    return getDistrictAlertData(disease, method, targetYear);
  }

  // Check if we're on the client side
  if (typeof window === 'undefined') {
    console.log('Server-side rendering detected, returning empty array for malaria');
    return [];
  }

  try {
    const response = await fetch('/api/drilldown/malaria', {
      cache: 'no-cache',
    });
    if (!response.ok) {
      console.error('Failed to fetch malaria data from API, status:', response.status);
      return [];
    }

    const data = await response.json();

    // Group by district and get the latest month data
    const districtMap = new Map<string, any>();

    data.forEach((item: any) => {
      const district = item.district;
      const year = item.year;
      const month = item.month;

      if (year !== targetYear) return;

      const key = district;
      const existing = districtMap.get(key);

      // Keep the latest month data
      if (!existing || month > existing.month) {
        districtMap.set(key, item);
      }
    });

    // Convert to DistrictWeekData format
    const alertData: DistrictWeekData[] = [];

    districtMap.forEach((item, district) => {
      const cases = parseFloat(item.this_week_actual) || parseFloat(item.this_week_predicted) || 0;
      const month = item.month;
      const year = item.year;

      // Convert month to approximate week
      const approximateWeek = Math.round(month * 4.33 - 2);

      // For baseline, we'll use a simple threshold for now
      // In a real implementation, you'd calculate this from historical data
      const baseline = 5; // Simple threshold

      alertData.push({
        district,
        week: approximateWeek,
        year,
        cases,
        baseline,
        isOnAlert: cases > baseline,
      });
    });

    return alertData;
  } catch (error) {
    console.error('Error fetching malaria district alert data:', error);
    return [];
  }
}

// Get alert statistics from API
export async function getAlertStatsFromAPI(
  disease: string,
  method: BaselineMethod,
  targetYear: number = 2024
): Promise<AlertStats> {
  const alertData = await getDistrictAlertDataFromAPI(disease, method, targetYear);

  // Calculate current week national cases
  const currentWeekCases = alertData.reduce((sum, data) => sum + data.cases, 0);

  // Calculate previous week cases (simplified - using historical average)
  const previousWeekCases = Math.round(currentWeekCases * 0.9); // Simulated

  // Calculate percent change
  const percentChange = previousWeekCases > 0
    ? ((currentWeekCases - previousWeekCases) / previousWeekCases) * 100
    : 0;

  // Count districts on alert
  const districtsOnAlert = alertData.filter(d => d.isOnAlert).length;
  const totalDistricts = alertData.length > 0 ? alertData.length : 64;

  // Calculate national risk level
  const alertPercentage = totalDistricts > 0 ? (districtsOnAlert / totalDistricts) * 100 : 0;
  const nationalRiskLevel: 'Low' | 'Medium' | 'High' =
    alertPercentage > 50 ? 'High' : alertPercentage > 25 ? 'Medium' : 'Low';

  return {
    currentWeekCases: currentWeekCases || 0,
    previousWeekCases: previousWeekCases || 0,
    percentChange: isNaN(percentChange) ? 0 : percentChange,
    districtsOnAlert: districtsOnAlert || 0,
    totalDistricts: totalDistricts || 64,
    nationalRiskLevel,
  };
}

// Get available districts for a disease
export function getAvailableDistricts(disease: string): string[] {
  let sourceData: any[];

  if (disease === 'dengue') {
    sourceData = modelOutput;
  } else if (disease === 'diarrhoea') {
    sourceData = diarrhoeaData;
  } else {
    return [];
  }

  const districts = new Set<string>();
  sourceData.forEach(item => {
    if (item.district) {
      districts.add(item.district);
    }
  });

  return Array.from(districts).sort();
}

// Get weekly data from API for chart (fetches from external API)
export async function getWeeklyNationalDataFromAPI(
  disease: string,
  method: BaselineMethod,
  targetYear: number = 2024
): Promise<WeeklyNationalData[]> {
  // Check if we're on the client side
  if (typeof window === 'undefined') {
    console.log('Server-side rendering detected, returning empty array');
    return [];
  }

  try {
    const apiEndpoint = disease === 'dengue'
      ? '/api/drilldown/dengue'
      : disease === 'malaria'
      ? '/api/drilldown/malaria'
      : '/api/drilldown/awd';

    const response = await fetch(apiEndpoint, {
      cache: 'no-cache',
    });
    if (!response.ok) {
      console.error(`Failed to fetch data from API: ${apiEndpoint}, status: ${response.status}`);
      return [];
    }

    const data = await response.json();

    if (disease === 'dengue') {
      // First, group ALL data by year and week to get national totals per year-week
      const yearWeekMap = new Map<string, number>();

      data.forEach((item: any) => {
        const week = item.epi_week;
        const year = item.year;
        const cases = item.weekly_hospitalised_cases;
        const key = `${year}-${week}`;

        yearWeekMap.set(key, (yearWeekMap.get(key) || 0) + cases);
      });

      // Now group by week and separate target year from historical years
      const weeklyMap = new Map<number, { cases: number; historicalNationalTotals: number[]; }>();

      yearWeekMap.forEach((nationalTotal, key) => {
        const [yearStr, weekStr] = key.split('-');
        const year = parseInt(yearStr);
        const week = parseInt(weekStr);

        if (!weeklyMap.has(week)) {
          weeklyMap.set(week, { cases: 0, historicalNationalTotals: [] });
        }

        const weekData = weeklyMap.get(week)!;

        // For target year, use the national total
        if (year === targetYear) {
          weekData.cases = nationalTotal;
        }

        // For historical years, collect national totals for baseline calculation
        if (year !== targetYear) {
          weekData.historicalNationalTotals.push(nationalTotal);
        }
      });

      // Convert to array and calculate baselines using selected method
      const result: WeeklyNationalData[] = [];
      weeklyMap.forEach((weekData, week) => {
        // Calculate baseline using the selected method on historical NATIONAL totals
        const baseline = calculateBaseline(weekData.historicalNationalTotals, method);

        // Only include weeks from target year that have data
        if (weekData.cases > 0) {
          result.push({
            week,
            year: targetYear,
            date: new Date(targetYear, 0, week * 7).toISOString(), // Approximate date
            cases: weekData.cases,
            baseline: baseline,
          });
        }
      });

      return result.sort((a, b) => a.week - b.week);
    } else if (disease === 'malaria') {
      // Malaria data - group by month and convert to week equivalents
      // First, group ALL data by year and month to get national totals per year-month
      const yearMonthMap = new Map<string, { cases: number; predicted: number; }>();

      data.forEach((item: any) => {
        const year = item.year;
        const month = item.month;
        const cases = parseFloat(item.this_week_actual) || 0;
        const predicted = parseFloat(item.this_week_predicted) || 0;
        const key = `${year}-${month}`;

        const existing = yearMonthMap.get(key) || { cases: 0, predicted: 0 };
        yearMonthMap.set(key, {
          cases: existing.cases + cases,
          predicted: existing.predicted + predicted
        });
      });

      // Now group by month (converted to approximate week) and separate target year from historical years
      const weeklyMap = new Map<number, { cases: number; historicalNationalTotals: number[]; }>();

      yearMonthMap.forEach((monthData, key) => {
        const [yearStr, monthStr] = key.split('-');
        const year = parseInt(yearStr);
        const month = parseInt(monthStr);

        // Convert month to approximate week (mid-month week: month * 4.33 - 2)
        // This gives us roughly the middle week of each month
        const approximateWeek = Math.round(month * 4.33 - 2);

        if (!weeklyMap.has(approximateWeek)) {
          weeklyMap.set(approximateWeek, { cases: 0, historicalNationalTotals: [] });
        }

        const weekData = weeklyMap.get(approximateWeek)!;

        // Use actual cases if available, otherwise use predicted
        const totalCases = monthData.cases > 0 ? monthData.cases : monthData.predicted;

        // For target year, use the national total
        if (year === targetYear) {
          weekData.cases = totalCases;
        }

        // For historical years, collect national totals for baseline calculation
        if (year !== targetYear) {
          weekData.historicalNationalTotals.push(totalCases);
        }
      });

      // Convert to array and calculate baselines using selected method
      const result: WeeklyNationalData[] = [];
      weeklyMap.forEach((weekData, week) => {
        // Calculate baseline using the selected method on historical NATIONAL totals
        const baseline = calculateBaseline(weekData.historicalNationalTotals, method);

        // Include all weeks (even with 0 cases) to show complete picture
        result.push({
          week,
          year: targetYear,
          date: new Date(targetYear, 0, week * 7).toISOString(), // Approximate date
          cases: weekData.cases || 0,
          baseline: baseline || 0,
        });
      });

      return result.sort((a, b) => a.week - b.week);
    } else {
      // AWD data - group by week from dates
      // First, group ALL data by year and week to get national totals per year-week
      const yearWeekMap = new Map<string, number>();

      data.forEach((item: any) => {
        const date = new Date(item.date);
        const year = date.getFullYear();
        const week = getWeek(date);
        const cases = item.daily_cases;
        const key = `${year}-${week}`;

        yearWeekMap.set(key, (yearWeekMap.get(key) || 0) + cases);
      });

      // Now group by week and separate target year from historical years
      const weeklyMap = new Map<number, { cases: number; historicalNationalTotals: number[]; }>();

      yearWeekMap.forEach((nationalTotal, key) => {
        const [yearStr, weekStr] = key.split('-');
        const year = parseInt(yearStr);
        const week = parseInt(weekStr);

        if (!weeklyMap.has(week)) {
          weeklyMap.set(week, { cases: 0, historicalNationalTotals: [] });
        }

        const weekData = weeklyMap.get(week)!;

        // For target year, use the national total
        if (year === targetYear) {
          weekData.cases = nationalTotal;
        }

        // For historical years, collect national totals for baseline calculation
        if (year !== targetYear) {
          weekData.historicalNationalTotals.push(nationalTotal);
        }
      });

      // Convert to array and calculate baselines using selected method
      const result: WeeklyNationalData[] = [];
      weeklyMap.forEach((weekData, week) => {
        // Calculate baseline using the selected method on historical NATIONAL totals
        const baseline = calculateBaseline(weekData.historicalNationalTotals, method);

        // Only include weeks from target year that have data
        if (weekData.cases > 0) {
          result.push({
            week,
            year: targetYear,
            date: new Date(targetYear, 0, week * 7).toISOString(), // Approximate date
            cases: weekData.cases,
            baseline: baseline,
          });
        }
      });

      return result.sort((a, b) => a.week - b.week);
    }
  } catch (error) {
    console.error('Error fetching weekly national data:', error);
    return [];
  }
}

// Get weekly data for chart (district-level or national) - Legacy function for backward compatibility
export function getWeeklyNationalData(
  disease: string,
  method: BaselineMethod,
  targetYear: number = 2024,
  districtName?: string
): WeeklyNationalData[] {
  let sourceData: any[];

  if (disease === 'dengue') {
    sourceData = modelOutput;
  } else if (disease === 'diarrhoea') {
    sourceData = diarrhoeaData;
  } else {
    return [];
  }

  // Filter for optional district only (removed year filter to show all available data)
  const filteredData = sourceData.filter(item => {
    const districtMatches = districtName ? item.district.toLowerCase() === districtName.toLowerCase() : true;
    return districtMatches;
  });

  // Group by week
  const weeklyData = new Map<number, { cases: number; dates: Date[]; districts: Set<string> }>();

  filteredData.forEach(item => {
    const date = parseISO(item.date);
    const week = getWeek(date);

    if (!weeklyData.has(week)) {
      weeklyData.set(week, { cases: 0, dates: [], districts: new Set() });
    }

    const data = weeklyData.get(week)!;
    data.cases += item.actual ?? item.predicted;
    data.dates.push(date);
    data.districts.add(item.district);
  });

  // Convert to array and calculate baselines
  const result: WeeklyNationalData[] = [];

  weeklyData.forEach((data, week) => {
    // Calculate baseline for this week (using all historical data excluding current data's year)
    let totalBaseline = 0;
    const currentYear = getYear(data.dates[0]);

    if (districtName) {
      // District-level baseline
      const historicalData = getHistoricalWeekData(disease, districtName, week, currentYear);
      totalBaseline = calculateBaseline(historicalData, method);
    } else {
      // National baseline (sum across all districts for this week)
      const districts = Array.from(data.districts);
      districts.forEach(district => {
        const historicalData = getHistoricalWeekData(disease, district, week, currentYear);
        totalBaseline += calculateBaseline(historicalData, method);
      });
    }

    result.push({
      week,
      year: currentYear,
      date: data.dates[0].toISOString(),
      cases: data.cases,
      baseline: totalBaseline,
    });
  });

  // Sort by date to handle multi-year data correctly
  return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
