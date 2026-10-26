/**
 * Open-Meteo Weather Service
 * 
 * Fetches genuine real-time weather forecasts for destination coordinates
 * without requiring any paid API key.
 * Includes timeout guards, error handling, and WMO code translations.
 */

// WMO Weather interpretation codes (WW)
const WMO_CODE_MAP = {
  0: { label: 'Clear Sky', icon: '☀️' },
  1: { label: 'Mainly Clear', icon: '🌤️' },
  2: { label: 'Partly Cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Foggy', icon: '🌫️' },
  48: { label: 'Depositing Rime Fog', icon: '🌫️' },
  51: { label: 'Light Drizzle', icon: '🌦️' },
  53: { label: 'Moderate Drizzle', icon: '🌧️' },
  55: { label: 'Dense Drizzle', icon: '🌧️' },
  61: { label: 'Slight Rain', icon: '🌦️' },
  63: { label: 'Moderate Rain', icon: '🌧️' },
  65: { label: 'Heavy Rain', icon: '🌧️' },
  71: { label: 'Slight Snow Fall', icon: '🌨️' },
  73: { label: 'Moderate Snow Fall', icon: '❄️' },
  75: { label: 'Heavy Snow Fall', icon: '❄️' },
  80: { label: 'Slight Rain Showers', icon: '🌦️' },
  81: { label: 'Moderate Rain Showers', icon: '🌧️' },
  82: { label: 'Violent Rain Showers', icon: '⛈️' },
  95: { label: 'Thunderstorm', icon: '⚡' },
  96: { label: 'Thunderstorm with Hail', icon: '⛈️' },
  99: { label: 'Severe Thunderstorm with Hail', icon: '⛈️' },
};

/**
 * Fetch current weather for given latitude and longitude
 * 
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<Object>} Weather details: temperature, condition, humidity, wind
 */
export const fetchDestinationWeather = async (latitude, longitude) => {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    throw new Error('Valid coordinates required for weather check.');
  }

  if (!navigator.onLine) {
    throw new Error('Offline: Weather unavailable without an internet connection.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Weather service error: ${response.status}`);
    }

    const data = await response.json();
    const current = data.current;

    const weatherInfo = WMO_CODE_MAP[current.weather_code] || {
      label: 'Pleasant',
      icon: '🌤️'
    };

    return {
      temperature: Math.round(current.temperature_2m),
      condition: weatherInfo.label,
      icon: weatherInfo.icon,
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
      updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Weather request timed out.');
    }
    throw err;
  }
};
