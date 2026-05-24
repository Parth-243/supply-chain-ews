/**
 * weatherFetcher.js — Live Weather Data from WeatherAPI.com & Open-Meteo
 *
 * Primary: WeatherAPI.com (highly reliable, requires API key, 1 million calls/month free)
 * Fallback: Open-Meteo (100% free, no API key needed)
 *
 * Fetches current weather conditions at major global shipping ports and converts
 * them into a weather_severity score (0–1) that feeds into the ML risk model.
 */

// Major shipping port coordinates
const PORTS = [
  { name: 'Shanghai',         lat: 31.23,  lon: 121.47 },
  { name: 'Singapore',        lat: 1.35,   lon: 103.82 },
  { name: 'Rotterdam',        lat: 51.92,  lon: 4.48   },
  { name: 'Los Angeles',      lat: 33.74,  lon: -118.27},
  { name: 'Dubai (Jebel Ali)',lat: 25.04,  lon: 55.11  },
  { name: 'Hamburg',          lat: 53.55,  lon: 9.99   },
  { name: 'Busan',            lat: 35.18,  lon: 129.08 },
  { name: 'Mumbai',           lat: 18.95,  lon: 72.95  },
  { name: 'Santos',           lat: -23.96, lon: -46.33 },
  { name: 'Port Said',        lat: 31.26,  lon: 32.28  },
];

// Open-Meteo Weather Code Decoder
function decodeWeatherCode(code) {
  if (code === 0)                        return { severity: 0.0, label: 'Clear' };
  if (code <= 3)                         return { severity: 0.1, label: 'Partly Cloudy' };
  if (code <= 49)                        return { severity: 0.2, label: 'Foggy' };
  if (code <= 59)                        return { severity: 0.3, label: 'Drizzle' };
  if (code <= 69)                        return { severity: 0.5, label: 'Rain' };
  if (code <= 79)                        return { severity: 0.6, label: 'Snow' };
  if (code <= 82)                        return { severity: 0.6, label: 'Rain Showers' };
  if (code <= 84)                        return { severity: 0.7, label: 'Snow Showers' };
  if (code <= 94)                        return { severity: 0.85, label: 'Thunderstorm' };
  return { severity: 1.0, label: 'Severe Thunderstorm' };
}

// Wind speed (km/h) → extra severity modifier
function windSeverity(windKmh) {
  if (windKmh < 20)  return 0;
  if (windKmh < 40)  return 0.05;
  if (windKmh < 60)  return 0.15;
  if (windKmh < 80)  return 0.25;
  return 0.35; // gale / storm force
}

/**
 * Fetch current weather from WeatherAPI.com (Primary)
 */
async function fetchWeatherFromAPI(port, apiKey) {
  const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${port.lat},${port.lon}`;
  const res = await fetch(url, {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`WeatherAPI status ${res.status}`);
  
  const data = await res.json();
  const current = data.current;
  if (!current) throw new Error("Invalid response from WeatherAPI");

  const conditionText = (current.condition?.text || '').toLowerCase();
  
  // Calculate severity based on description
  let baseSeverity = 0.1;
  if (conditionText.includes('storm') || conditionText.includes('typhoon') || conditionText.includes('hurricane') || conditionText.includes('thunder') || conditionText.includes('blizzard')) {
    baseSeverity = 0.85;
  } else if (conditionText.includes('heavy') || conditionText.includes('torrential') || conditionText.includes('gale')) {
    baseSeverity = 0.65;
  } else if (conditionText.includes('moderate') || conditionText.includes('rain') || conditionText.includes('snow') || conditionText.includes('shower')) {
    baseSeverity = 0.45;
  } else if (conditionText.includes('drizzle') || conditionText.includes('light') || conditionText.includes('patchy')) {
    baseSeverity = 0.25;
  } else if (conditionText.includes('fog') || conditionText.includes('mist') || conditionText.includes('haze') || conditionText.includes('overcast')) {
    baseSeverity = 0.20;
  } else if (conditionText.includes('sunny') || conditionText.includes('clear') || conditionText.includes('cloudy')) {
    baseSeverity = 0.05;
  }

  // Adjust by wind speed (current.wind_kph is in km/h)
  const severity = Math.min(1.0, baseSeverity + windSeverity(current.wind_kph || 0));

  return {
    port:           port.name,
    lat:            port.lat,
    lon:            port.lon,
    weatherCode:    current.condition?.code || 0,
    condition:      current.condition?.text || 'Unknown',
    temperature:    current.temp_c,
    windSpeed:      current.wind_kph,
    precipitation:  current.precip_mm || 0,
    severity:       Math.round(severity * 100) / 100,
    source:         'weatherapi',
    fetchedAt:      new Date(),
  };
}

/**
 * Robust fetch method with Open-Meteo fallback
 */
async function fetchPortWeather(port) {
  const apiKey = process.env.WEATHER_API_KEY;
  const useWeatherAPI = !!(apiKey && apiKey.trim() && apiKey !== 'your_key_here');

  if (useWeatherAPI) {
    try {
      return await fetchWeatherFromAPI(port, apiKey);
    } catch (err) {
      console.warn(`⚠️ WeatherAPI.com failed for ${port.name}, falling back to Open-Meteo:`, err.message);
    }
  }

  // Open-Meteo Fallback
  const params = new URLSearchParams({
    latitude:  port.lat,
    longitude: port.lon,
    current:   'weather_code,wind_speed_10m,temperature_2m,precipitation',
    timezone:  'UTC',
  });

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) throw new Error(`Open-Meteo ${res.status} for ${port.name}`);
  const data = await res.json();
  const c = data.current;

  const { severity: baseSeverity, label } = decodeWeatherCode(c.weather_code);
  const severity = Math.min(1.0, baseSeverity + windSeverity(c.wind_speed_10m));

  return {
    port:           port.name,
    lat:            port.lat,
    lon:            port.lon,
    weatherCode:    c.weather_code,
    condition:      label,
    temperature:    c.temperature_2m,
    windSpeed:      c.wind_speed_10m,
    precipitation:  c.precipitation,
    severity:       Math.round(severity * 100) / 100,
    source:         'openmeteo',
    fetchedAt:      new Date(),
  };
}

/**
 * Fetch weather for all major ports and return the results.
 * Returns an array of port weather objects.
 */
async function fetchAllPortWeather() {
  const results = [];
  const errors  = [];

  await Promise.allSettled(
    PORTS.map(async (port) => {
      try {
        results.push(await fetchPortWeather(port));
      } catch (err) {
        errors.push({ port: port.name, error: err.message });
      }
    })
  );

  const avgSeverity = results.length
    ? Math.round((results.reduce((s, r) => s + r.severity, 0) / results.length) * 100) / 100
    : 0;

  const highRisk = results.filter(r => r.severity >= 0.6);

  console.log(`🌤  Weather: ${results.length} ports fetched, avg severity ${avgSeverity}, ${highRisk.length} high-risk ports`);
  if (errors.length) console.warn('⚠️  Weather fetch errors:', errors);

  return { ports: results, avgSeverity, highRiskPorts: highRisk, fetchedAt: new Date() };
}

module.exports = { fetchAllPortWeather };
