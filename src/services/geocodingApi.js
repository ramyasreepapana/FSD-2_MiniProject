/**
 * Open-Meteo Geocoding API Service
 * 
 * Provides location search, autocomplete suggestions, and coordinate resolution
 * for trip origin validation without requiring external API keys.
 */

const searchCache = new Map();
const GEOCODING_BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';

/**
 * Search locations matching a given query string
 * 
 * @param {string} query - User entered location name
 * @param {number} count - Maximum results to return (default 5)
 * @returns {Promise<Array<Object>>} List of resolved location objects
 */
export const searchLocations = async (query, count = 5) => {
  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    return [];
  }

  const normalizedQuery = query.trim().toLowerCase();

  // Return cached result if available
  if (searchCache.has(normalizedQuery)) {
    return searchCache.get(normalizedQuery);
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error('Offline: Location search unavailable without an internet connection.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000); // 6 second timeout

  try {
    const url = `${GEOCODING_BASE_URL}?name=${encodeURIComponent(normalizedQuery)}&count=${count}&language=en&format=json`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Location service error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.results || !Array.isArray(data.results)) {
      searchCache.set(normalizedQuery, []);
      return [];
    }

    const locations = data.results.map((item) => {
      const parts = [item.name, item.admin1, item.country].filter(Boolean);
      return {
        id: item.id,
        name: item.name,
        latitude: item.latitude,
        longitude: item.longitude,
        country: item.country || '',
        countryCode: item.country_code || '',
        admin1: item.admin1 || '',
        admin2: item.admin2 || '',
        formattedName: parts.join(', '),
      };
    });

    // Cache results (cap cache size at 50 items)
    if (searchCache.size > 50) {
      const firstKey = searchCache.keys().next().value;
      searchCache.delete(firstKey);
    }
    searchCache.set(normalizedQuery, locations);

    return locations;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Location search request timed out. Please try again.');
    }
    throw err;
  }
};

/**
 * Validate and resolve a location string to a verified location object
 * 
 * @param {string} locationName 
 * @returns {Promise<Object|null>} Resolved location or null
 */
export const verifyLocation = async (locationName) => {
  if (!locationName || typeof locationName !== 'string') return null;

  try {
    const results = await searchLocations(locationName, 1);
    if (results && results.length > 0) {
      return results[0];
    }
    return null;
  } catch (err) {
    console.warn('Location verification warning:', err);
    return null;
  }
};
