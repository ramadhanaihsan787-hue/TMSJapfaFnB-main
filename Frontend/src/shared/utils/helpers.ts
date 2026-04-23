/**
 * Helper Utilities
 * General-purpose helper functions
 */

import type { Coordinates } from "../types";

// ============= DISTANCE CALCULATION =============
const EARTH_RADIUS_METERS = 6371000; // Earth radius in meters

export const calculateHaversineDistance = (
  point1: Coordinates,
  point2: Coordinates
): number => {
  const toRad = (degrees: number) => (degrees * Math.PI) / 180;

  const lat1 = toRad(point1.latitude);
  const lat2 = toRad(point2.latitude);
  const deltaLat = toRad(point2.latitude - point1.latitude);
  const deltaLng = toRad(point2.longitude - point1.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c; // Distance in meters
};

export const calculateTotalDistance = (waypoints: Coordinates[]): number => {
  if (waypoints.length < 2) return 0;

  let total = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    total += calculateHaversineDistance(waypoints[i], waypoints[i + 1]);
  }

  return total;
};

// ============= TIME CONVERSION =============
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

export const timeToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

export const secondsToTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export const addMinutesToTime = (timeString: string, minutes: number): string => {
  const totalMinutes = timeToMinutes(timeString) + minutes;
  return minutesToTime(totalMinutes % 1440); // 1440 = 24 * 60
};

// ============= ARRAY UTILITIES =============
export const groupBy = <T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> => {
  return array.reduce(
    (result, item) => {
      const key = keyFn(item);
      if (!result[key]) {
        result[key] = [];
      }
      result[key].push(item);
      return result;
    },
    {} as Record<K, T[]>
  );
};

export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const unique = <T, K extends string | number>(
  array: T[],
  keyFn?: (item: T) => K
): T[] => {
  if (!keyFn) {
    return Array.from(new Set(array));
  }
  const seen = new Set<K>();
  return array.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const sortBy = <T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K,
  direction: "asc" | "desc" = "asc"
): T[] => {
  return [...array].sort((a, b) => {
    const aVal = keyFn(a);
    const bVal = keyFn(b);
    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return direction === "asc" ? comparison : -comparison;
  });
};

export const isEmpty = <T>(array: T[]): boolean => {
  return array.length === 0;
};

// ============= OBJECT UTILITIES =============
export const pick = <T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    result[key] = obj[key];
  });
  return result;
};

export const omit = <T, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result;
};

export const merge = <T extends object>(target: T, ...sources: Partial<T>[]): T => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key]) && isObject(target[key])) {
        merge(target[key] as any, source[key] as any);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return merge(target, ...sources);
};

export const isObject = (item: any): item is object => {
  return item && typeof item === "object" && !Array.isArray(item);
};

export const isEmpty_Object = (obj: object): boolean => {
  return Object.keys(obj).length === 0;
};

// ============= STRING UTILITIES =============
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const toCamelCase = (str: string): string => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
};

export const toKebabCase = (str: string): string => {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
};

export const toSnakeCase = (str: string): string => {
  return str.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
};

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// ============= DELAY & THROTTLE =============
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
