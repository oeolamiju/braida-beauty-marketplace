import { secret } from "encore.dev/config";

// Mapbox API key for geocoding
const mapboxApiKey = secret("MapboxAPIKey");

// Cache for geocoding results to reduce API calls
const geocodeCache = new Map<string, { lat: number; lng: number; timestamp: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// UK-specific postcode area fallbacks (used when API is unavailable)
const POSTCODE_AREAS: Record<string, { lat: number; lng: number }> = {
  "SW": { lat: 51.4975, lng: -0.1357 },
  "SE": { lat: 51.4549, lng: -0.0733 },
  "E": { lat: 51.5406, lng: -0.0538 },
  "W": { lat: 51.5101, lng: -0.1929 },
  "N": { lat: 51.5656, lng: -0.1060 },
  "NW": { lat: 51.5434, lng: -0.2052 },
  "EC": { lat: 51.5200, lng: -0.0966 },
  "WC": { lat: 51.5152, lng: -0.1231 },
  "B": { lat: 52.4862, lng: -1.8904 },
  "M": { lat: 53.4808, lng: -2.2426 },
  "L": { lat: 53.4084, lng: -2.9916 },
  "LS": { lat: 53.8008, lng: -1.5491 },
  "NG": { lat: 52.9548, lng: -1.1581 },
  "S": { lat: 53.3811, lng: -1.4701 },
  "BS": { lat: 51.4545, lng: -2.5879 },
  "GL": { lat: 51.8642, lng: -2.2381 },
  "OX": { lat: 51.7520, lng: -1.2577 },
  "CB": { lat: 52.2053, lng: 0.1218 },
  "BR": { lat: 51.4000, lng: 0.0150 },
  "CR": { lat: 51.3762, lng: -0.0982 },
  "KT": { lat: 51.3644, lng: -0.2787 },
  "SM": { lat: 51.3798, lng: -0.1789 },
  "TW": { lat: 51.4465, lng: -0.3360 },
  "UB": { lat: 51.5352, lng: -0.4780 },
  "HA": { lat: 51.5803, lng: -0.3418 },
  "EN": { lat: 51.6538, lng: -0.0799 },
  "IG": { lat: 51.5590, lng: 0.0741 },
  "RM": { lat: 51.5505, lng: 0.1830 },
  "DA": { lat: 51.4650, lng: 0.1500 },
  "BN": { lat: 50.8225, lng: -0.1372 },
  "PO": { lat: 50.8198, lng: -1.0880 },
  "SO": { lat: 50.9097, lng: -1.4044 },
  "RG": { lat: 51.4543, lng: -0.9781 },
  "SL": { lat: 51.5105, lng: -0.5950 },
  "HP": { lat: 51.7520, lng: -0.7566 },
  "MK": { lat: 52.0406, lng: -0.7594 },
  "LU": { lat: 51.8787, lng: -0.4200 },
  "AL": { lat: 51.7520, lng: -0.3360 },
  "SG": { lat: 51.9085, lng: -0.2005 },
  "PE": { lat: 52.5695, lng: -0.2405 },
  "CV": { lat: 52.4068, lng: -1.5197 },
  "LE": { lat: 52.6369, lng: -1.1398 },
  "DE": { lat: 52.9226, lng: -1.4746 },
  "NN": { lat: 52.2405, lng: -0.9027 },
};

// City coordinates for common UK cities
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "LONDON": { lat: 51.5074, lng: -0.1278 },
  "BIRMINGHAM": { lat: 52.4862, lng: -1.8904 },
  "MANCHESTER": { lat: 53.4808, lng: -2.2426 },
  "LIVERPOOL": { lat: 53.4084, lng: -2.9916 },
  "LEEDS": { lat: 53.8008, lng: -1.5491 },
  "SHEFFIELD": { lat: 53.3811, lng: -1.4701 },
  "BRISTOL": { lat: 51.4545, lng: -2.5879 },
  "NOTTINGHAM": { lat: 52.9548, lng: -1.1581 },
  "GLASGOW": { lat: 55.8642, lng: -4.2518 },
  "EDINBURGH": { lat: 55.9533, lng: -3.1883 },
  "OXFORD": { lat: 51.7520, lng: -1.2577 },
  "CAMBRIDGE": { lat: 52.2053, lng: 0.1218 },
  "BRIGHTON": { lat: 50.8225, lng: -0.1372 },
  "SOUTHAMPTON": { lat: 50.9097, lng: -1.4044 },
  "PORTSMOUTH": { lat: 50.8198, lng: -1.0880 },
  "READING": { lat: 51.4543, lng: -0.9781 },
  "COVENTRY": { lat: 52.4068, lng: -1.5197 },
  "LEICESTER": { lat: 52.6369, lng: -1.1398 },
  "BRADFORD": { lat: 53.7960, lng: -1.7594 },
  "CARDIFF": { lat: 51.4816, lng: -3.1791 },
  "BELFAST": { lat: 54.5973, lng: -5.9301 },
  "NEWCASTLE": { lat: 54.9783, lng: -1.6178 },
  // London neighborhoods
  "PECKHAM": { lat: 51.4741, lng: -0.0691 },
  "SHOREDITCH": { lat: 51.5242, lng: -0.0778 },
  "CAMDEN": { lat: 51.5390, lng: -0.1426 },
  "BRIXTON": { lat: 51.4613, lng: -0.1157 },
  "HACKNEY": { lat: 51.5450, lng: -0.0553 },
  "ISLINGTON": { lat: 51.5465, lng: -0.1058 },
  "CROYDON": { lat: 51.3762, lng: -0.0982 },
  "KINGSTON": { lat: 51.4123, lng: -0.3007 },
  "GREENWICH": { lat: 51.4826, lng: 0.0077 },
  "LEWISHAM": { lat: 51.4415, lng: -0.0117 },
  "STRATFORD": { lat: 51.5423, lng: -0.0026 },
  "WEMBLEY": { lat: 51.5523, lng: -0.2965 },
  "EALING": { lat: 51.5130, lng: -0.3089 },
  "WIMBLEDON": { lat: 51.4161, lng: -0.2062 },
  "HAMMERSMITH": { lat: 51.4927, lng: -0.2248 },
  "KENSINGTON": { lat: 51.4988, lng: -0.1996 },
  "CHELSEA": { lat: 51.4875, lng: -0.1687 },
  "TOTTENHAM": { lat: 51.5883, lng: -0.0667 },
  "FINSBURY PARK": { lat: 51.5646, lng: -0.1066 },
  "ELEPHANT AND CASTLE": { lat: 51.4940, lng: -0.0996 },
};

function extractPostcodeArea(postcode: string): string {
  const normalized = postcode.toUpperCase().replace(/\s/g, '');
  // Match first 1-2 letters of UK postcode
  const match = normalized.match(/^([A-Z]{1,2})/);
  return match ? match[1] : '';
}

/**
 * Get coordinates from Mapbox Geocoding API
 */
async function geocodeWithMapbox(location: string): Promise<{ lat: number; lng: number } | null> {
  const apiKey = mapboxApiKey();
  
  if (!apiKey) {
    console.log("[GEOCODING] Mapbox API key not configured, using fallback");
    return null;
  }

  try {
    const encodedLocation = encodeURIComponent(`${location}, UK`);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedLocation}.json?country=GB&types=postcode,place,locality,neighborhood&limit=1&access_token=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`[GEOCODING] Mapbox API error: ${response.status}`);
      return null;
    }
    
    const data = await response.json() as any;
    
    if (data?.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng };
    }
    
    return null;
  } catch (error) {
    console.error("[GEOCODING] Mapbox geocoding error:", error);
    return null;
  }
}

/**
 * Get coordinates for a UK postcode or location name
 * Uses Mapbox API with fallback to static lookup
 */
export async function getPostcodeCoordinatesAsync(location: string): Promise<{ lat: number; lng: number } | null> {
  if (!location || location.trim() === '') {
    return null;
  }

  const normalized = location.toUpperCase().trim();
  const cacheKey = normalized;

  // Check cache first
  const cached = geocodeCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
    return { lat: cached.lat, lng: cached.lng };
  }

  // Try Mapbox API first
  const mapboxResult = await geocodeWithMapbox(location);
  if (mapboxResult) {
    geocodeCache.set(cacheKey, { ...mapboxResult, timestamp: Date.now() });
    return mapboxResult;
  }

  // Fallback to static lookup
  return getPostcodeCoordinates(location);
}

/**
 * Synchronous coordinate lookup using static data
 * Used as fallback when API is unavailable
 */
export function getPostcodeCoordinates(postcode: string): { lat: number; lng: number } | null {
  if (!postcode || postcode.trim() === '') {
    return null;
  }

  const normalized = postcode.toUpperCase().trim();
  
  // Check city coordinates first
  const cityCoords = CITY_COORDINATES[normalized];
  if (cityCoords) {
    return cityCoords;
  }
  
  // Check for partial city matches
  for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
    if (normalized.includes(city) || city.includes(normalized)) {
      return coords;
    }
  }
  
  // Extract postcode area and look up
  const area = extractPostcodeArea(postcode);
  return POSTCODE_AREAS[area] || null;
}

/**
 * Calculate distance between two points using Haversine formula
 * @returns Distance in miles
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal place
}

/**
 * Calculate distance between two points in kilometers
 */
export function calculateDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const miles = calculateDistance(lat1, lng1, lat2, lng2);
  return Math.round(miles * 1.60934 * 10) / 10; // Convert to km and round
}

/**
 * Check if a location is within a given radius of another location
 */
export function isWithinRadius(
  centerLat: number,
  centerLng: number,
  pointLat: number,
  pointLng: number,
  radiusMiles: number
): boolean {
  const distance = calculateDistance(centerLat, centerLng, pointLat, pointLng);
  return distance <= radiusMiles;
}

/**
 * Format distance for display
 */
export function formatDistance(distanceMiles: number, useKm: boolean = false): string {
  if (useKm) {
    const km = distanceMiles * 1.60934;
    if (km < 1) {
      return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(1)} km`;
  }
  
  if (distanceMiles < 0.1) {
    return "< 0.1 mi";
  }
  return `${distanceMiles.toFixed(1)} mi`;
}

/**
 * Get bounding box for a location and radius
 * Useful for database queries
 */
export function getBoundingBox(
  lat: number,
  lng: number,
  radiusMiles: number
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  const latDelta = radiusMiles / 69.0; // Approximate miles per degree latitude
  const lngDelta = radiusMiles / (69.0 * Math.cos(lat * Math.PI / 180)); // Adjust for longitude

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}
