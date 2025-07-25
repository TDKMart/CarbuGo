// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Cache Configuration
export const CACHE_KEYS = {
  STATIONS: 'stations',
  STATION_BOUNDS: 'station-bounds',
  SEARCH_RESULTS: 'search-results',
  PRICE_STATS: 'price-stats',
  FAVORITES: 'favorites',
} as const;

export const CACHE_TIMES = {
  STATIONS: 5 * 60 * 1000, // 5 minutes
  SEARCH: 2 * 60 * 1000, // 2 minutes
  STATS: 5 * 60 * 1000, // 5 minutes
} as const;

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_CENTER: [48.8566, 2.3522] as [number, number], // Paris
  DEFAULT_ZOOM: 6,
  MIN_ZOOM_FOR_STATIONS: 5,
  CLUSTER_DISTANCE: {
    ZOOM_8: 0.05,
    ZOOM_10: 0.02,
    ZOOM_12: 0.01,
  },
} as const;

// Price Thresholds
export const PRICE_THRESHOLDS = {
  LOW: 1.65,
  HIGH: 1.80,
} as const;

// UI Configuration
export const UI_CONFIG = {
  DEBOUNCE_DELAY: 300,
  VIRTUAL_LIST_ITEM_HEIGHT: 120,
  NOTIFICATION_AUTO_HIDE_DELAY: 5000,
} as const;

// Geolocation Configuration
export const GEOLOCATION_CONFIG = {
  ENABLE_HIGH_ACCURACY: true,
  TIMEOUT: 10000,
  MAXIMUM_AGE: 300000, // 5 minutes
} as const;