/**
 * IndexedDB & LocalStorage storage utility for large media assets (photos, base64)
 * Overcomes the 5MB browser localStorage quota limitation.
 */
import { ConcertMediaItem, Project } from '../types';

const DB_NAME = 'RonnyPortfolioDB';
const DB_VERSION = 1;
const STORE_NAME = 'media_cache';

function openDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function idbSet(key: string, value: any): Promise<void> {
  try {
    const db = await openDB();
    if (!db) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {}
      return;
    }
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(value, key);
  } catch (err) {
    console.warn(`idbSet failed for ${key}:`, err);
  }
}

export async function idbGet<T = any>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    if (!db) {
      try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    }
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);
      request.onsuccess = () => {
        if (request.result !== undefined && request.result !== null) {
          resolve(request.result);
        } else {
          // Fallback to localStorage
          try {
            const saved = localStorage.getItem(key);
            resolve(saved ? JSON.parse(saved) : null);
          } catch {
            resolve(null);
          }
        }
      };
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

// Helpers for concert photos and photosMap
export async function saveConcertPhotosLocal(photos: ConcertMediaItem[]): Promise<void> {
  await idbSet('ronny_v2_concert_photos', photos);
  try {
    localStorage.setItem('ronny_v2_concert_photos', JSON.stringify(photos));
  } catch {
    // Quota reached, IndexedDB has the data
  }
}

export async function loadConcertPhotosLocal(): Promise<ConcertMediaItem[] | null> {
  return await idbGet<ConcertMediaItem[]>('ronny_v2_concert_photos');
}

export async function savePhotosMapLocal(map: Record<string, string>): Promise<void> {
  await idbSet('ronny_v2_photos_map', map);
  try {
    localStorage.setItem('ronny_v2_photos_map', JSON.stringify(map));
  } catch {
    // Quota reached, IndexedDB has the data
  }
}

export async function loadPhotosMapLocal(): Promise<Record<string, string> | null> {
  return await idbGet<Record<string, string>>('ronny_v2_photos_map');
}

// Helpers for Projects (Drops)
export async function saveProjectsLocal(projects: Project[]): Promise<void> {
  await idbSet('ronny_v2_projects', projects);
  try {
    localStorage.setItem('ronny_v2_projects', JSON.stringify(projects));
  } catch {
    // Quota reached, IndexedDB has the data
  }
}

export async function loadProjectsLocal(): Promise<Project[] | null> {
  return await idbGet<Project[]>('ronny_v2_projects');
}

// Helpers for Hero Video
export async function saveHeroVideoLocal(video: string | null): Promise<void> {
  await idbSet('ronny_v2_hero_video', video);
  try {
    if (video && video.length < 1500000) {
      localStorage.setItem('ronny_v2_hero_video', video);
    } else {
      localStorage.removeItem('ronny_v2_hero_video');
    }
  } catch {
    // Quota reached, IndexedDB has the data
  }
}

export async function loadHeroVideoLocal(): Promise<string | null> {
  const fromIdb = await idbGet<string>('ronny_v2_hero_video');
  if (fromIdb) return fromIdb;
  try {
    return localStorage.getItem('ronny_v2_hero_video') || null;
  } catch {
    return null;
  }
}
