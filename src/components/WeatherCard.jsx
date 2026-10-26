import React, { useState, useEffect, useCallback } from 'react';
import { fetchDestinationWeather } from '../services/weatherApi';
import { CloudSun, Wind, Droplets, RotateCcw, Loader2, WifiOff } from 'lucide-react';

const WeatherCard = ({ destinationName, latitude, longitude }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadWeather = useCallback(async () => {
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchDestinationWeather(latitude, longitude);
      setWeather(data);
    } catch (err) {
      setError(err.message || 'Unable to fetch weather forecast.');
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    let ignore = false;
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return;
    }
    fetchDestinationWeather(latitude, longitude)
      .then((data) => {
        if (!ignore) {
          setWeather(data);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'Unable to fetch weather forecast.');
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [latitude, longitude]);

  if (!latitude || !longitude) return null;

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <CloudSun className="w-5 h-5 text-secondary" />
          <h4 className="font-bold text-sm sm:text-base text-slate-800">
            {destinationName} Live Weather
          </h4>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
          Open-Meteo Live API
        </span>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-4 space-x-2 text-slate-500 text-xs">
          <Loader2 className="w-4 h-4 animate-spin text-secondary" />
          <span>Fetching real-time forecast...</span>
        </div>
      )}

      {error && (
        <div className="py-2.5 px-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <WifiOff className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" />
            <span className="line-clamp-1">{error}</span>
          </div>
          <button
            type="button"
            onClick={loadWeather}
            className="text-amber-900 font-semibold hover:underline flex items-center gap-1 flex-shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {!loading && !error && weather && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center space-x-3">
            <span className="text-3xl sm:text-4xl" role="img" aria-label={weather.condition}>
              {weather.icon}
            </span>
            <div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                  {weather.temperature}°C
                </span>
                <span className="text-sm font-semibold text-slate-600">
                  {weather.condition}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Updated at {weather.updatedAt}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
            <div className="flex items-center gap-1" title="Humidity">
              <Droplets className="w-3.5 h-3.5 text-sky-500" />
              <span>{weather.humidity}% Humidity</span>
            </div>
            <div className="flex items-center gap-1" title="Wind Speed">
              <Wind className="w-3.5 h-3.5 text-teal-500" />
              <span>{weather.windSpeed} km/h</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherCard;
