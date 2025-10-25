'use server';

import type { LiveWeatherData } from "./types";

const OPENWEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

/**
 * Fetches live weather data from the OpenWeatherMap API.
 * @param city The city to fetch weather for.
 * @param countryCode The 2-letter country code (e.g., 'BD' for Bangladesh).
 * @returns An object with temperature, humidity, and rainfall, or null if an error occurs.
 */
export async function getLiveWeatherData(city: string, countryCode: string): Promise<LiveWeatherData | null> {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    console.error('OpenWeather API key is not configured.');
    return null;
  }

  const url = `${OPENWEATHER_API_URL}?q=${city},${countryCode}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url, {
        // Revalidate data every 15 minutes
        next: { revalidate: 900 } 
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Error fetching weather: ${response.status} ${response.statusText}`, errorData);
      return null;
    }

    const data = await response.json();

    // The 'rain' object might not exist if there's no rain.
    const rainfall = data.rain && data.rain['1h'] ? data.rain['1h'] : 0;

    return {
      temp: data.main.temp,
      humidity: data.main.humidity,
      rainfall: rainfall,
    };
  } catch (error) {
    console.error('An unexpected error occurred while fetching weather data:', error);
    return null;
  }
}
