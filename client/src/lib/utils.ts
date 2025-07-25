import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { PRICE_THRESHOLDS } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Price utility functions
export function formatPrice(price: number | null): string {
  return price ? `${price.toFixed(3)} €/L` : "N/A";
}

export function getPriceColor(price: number | null): string {
  if (!price) return "text-gray-500";
  if (price < PRICE_THRESHOLDS.LOW) return "text-success";
  if (price > PRICE_THRESHOLDS.HIGH) return "text-error";
  return "text-warning";
}

export function getPriceBadgeVariant(price: number | null): "default" | "secondary" | "destructive" {
  if (!price) return "secondary";
  if (price < PRICE_THRESHOLDS.LOW) return "default";
  if (price > PRICE_THRESHOLDS.HIGH) return "destructive";
  return "secondary";
}

// Distance utility functions
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function formatDistance(distance: number | null): string {
  if (!distance) return "N/A";
  return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
}

// Date utility functions
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

// Performance utility functions
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  
  return (...args: Parameters<T>) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}

// Local storage utility functions
export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
}

export function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
  }
}