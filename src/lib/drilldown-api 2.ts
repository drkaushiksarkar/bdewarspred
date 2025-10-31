export interface DengueData {
  id: number;
  district: string;
  year: number;
  epi_week: number;
  weekly_hospitalised_cases: number;
  total_rainfall: number;
  avg_humidity: number;
  avg_temperature: number;
  division: string;
}

export interface AWDData {
  id: number;
  division: string;
  district: string;
  date: string;
  daily_cases: number;
  temperature: number;
  humidity: number;
  rainfall: number;
}

export interface MalariaData {
  id: number;
  district: string;
  date: string;
  weekly_cases: number;
  temperature: number;
  humidity: number;
  rainfall: number;
}

// Use Next.js API routes as proxy to avoid CORS issues
const DENGUE_API = '/api/drilldown/dengue';
const AWD_API = '/api/drilldown/awd';
const MALARIA_API = '/api/drilldown/malaria';

/**
 * Fetches all dengue data from the API
 */
export async function fetchDengueData(): Promise<DengueData[] | null> {
  try {
    console.log('Fetching dengue data from:', DENGUE_API);
    const response = await fetch(DENGUE_API, {
      mode: 'cors', // Explicitly set CORS mode
      cache: 'no-cache', // Disable cache for debugging
    });

    console.log('Dengue API response status:', response.status);

    if (!response.ok) {
      console.error(`Dengue API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    console.log('Dengue data parsed successfully, records:', data.length);
    return data;
  } catch (error) {
    console.error('Error fetching dengue data:', error);
    if (error instanceof TypeError) {
      console.error('This is likely a CORS error. The API server needs to allow cross-origin requests.');
    }
    return null;
  }
}

/**
 * Fetches all AWD data from the API
 */
export async function fetchAWDData(): Promise<AWDData[] | null> {
  try {
    console.log('Fetching AWD data from:', AWD_API);
    const response = await fetch(AWD_API, {
      mode: 'cors', // Explicitly set CORS mode
      cache: 'no-cache', // Disable cache for debugging
    });

    console.log('AWD API response status:', response.status);

    if (!response.ok) {
      console.error(`AWD API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    console.log('AWD data parsed successfully, records:', data.length);
    return data;
  } catch (error) {
    console.error('Error fetching AWD data:', error);
    if (error instanceof TypeError) {
      console.error('This is likely a CORS error. The API server needs to allow cross-origin requests.');
    }
    return null;
  }
}

/**
 * Filters dengue data by district
 */
export function filterDengueByDistrict(data: DengueData[], district: string): DengueData[] {
  if (!district || district === 'all') return data;
  return data.filter(item => item.district.toLowerCase() === district.toLowerCase());
}

/**
 * Filters AWD data by district
 */
export function filterAWDByDistrict(data: AWDData[], district: string): AWDData[] {
  if (!district || district === 'all') return data;
  return data.filter(item => item.district.toLowerCase() === district.toLowerCase());
}

/**
 * Fetches all malaria data from the API
 */
export async function fetchMalariaData(): Promise<MalariaData[] | null> {
  try {
    console.log('Fetching malaria data from:', MALARIA_API);
    const response = await fetch(MALARIA_API, {
      mode: 'cors',
      cache: 'no-cache',
    });

    console.log('Malaria API response status:', response.status);

    if (!response.ok) {
      console.error(`Malaria API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    console.log('Malaria data parsed successfully, records:', data.length);
    return data;
  } catch (error) {
    console.error('Error fetching malaria data:', error);
    if (error instanceof TypeError) {
      console.error('This is likely a CORS error. The API server needs to allow cross-origin requests.');
    }
    return null;
  }
}

/**
 * Filters malaria data by district
 */
export function filterMalariaByDistrict(data: MalariaData[], district: string): MalariaData[] {
  if (!district || district === 'all') return data;
  return data.filter(item => item.district.toLowerCase() === district.toLowerCase());
}
