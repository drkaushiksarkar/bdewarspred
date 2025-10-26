export type Location = {
  id: string;
  name: string;
  level: 'country' | 'division' | 'district' | 'upazila' | 'union';
  parent_id?: string;
};

export type Disease = {
  id: string;
  name: string;
};

export type TimeSeriesDataPoint = {
  date: string;
  district?: string;
  actual?: number | null;
  predicted: number;
  uncertainty?: [number, number]; // [low, high]
  is_outbreak?: boolean;
};

export type RiskData = {
  id: string;
  location: string;
  risk_score: number;
  change: number;
  risk_category: 'Low' | 'Medium' | 'High';
};

export type FeatureImportance = {
  feature: string;
  importance: number;
};

export type WeatherData = {
  label: 'Temperature' | 'Humidity' | 'Rainfall';
  value: string;
  is_extreme?: boolean;
  subtitle?: string;
};

export type DiseaseData = {
  label: 'Malaria' | 'Dengue' | 'Diarrhoea';
  value: string;
  is_high?: boolean;
  trend?: number;
};

export type LiveWeatherData = {
  temp: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  rainfall: number;
  weather_description?: string;
};

export type WeatherDiseaseTrigger = {
  id: number;
  variable: string;
  icon: 'Thermometer' | 'Droplets' | 'CloudRain';
  diseases: string[];
  impact: string;
};
