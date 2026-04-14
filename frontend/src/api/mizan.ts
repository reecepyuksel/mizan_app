import Constants from "expo-constants";
import { Platform } from "react-native";

const getApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  const hostUri = Constants.expoConfig?.hostUri || Constants.experienceUrl || "";
  let ip = "192.168.1.179"; // Hard fallback to developer's explicit LAN IP
  
  if (hostUri) {
    const match = hostUri.match(/:\/\/(.*?):/);
    if (match && match[1]) {
      ip = match[1];
    }
  } else if (__DEV__ && Platform.OS === 'android') {
    ip = "10.0.2.2";
  } else if (__DEV__ && Platform.OS === 'ios') {
    ip = "localhost";
  }
  
  return `http://${ip}:3000/api`;
};

export const API_BASE_URL = getApiBaseUrl();

export const ISTANBUL_COORDS = {
  lat: 41.0082,
  lon: 28.9784,
};

export interface DailyPrayerTimes {
  date: string;
  latitude: number;
  longitude: number;
  timezone: string;
  method: "diyanet";
  madhab: "hanafi";
  imsak: string;
  gunes: string;
  ogle: string;
  ikindi: string;
  aksam: string;
  yatsi: string;
}

export interface Ayah {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
  turkishMeal: string;
}

export interface Hadith {
  id: string;
  source: string;
  chapter?: string | null;
  content: string;
}

export interface Sirah {
  id: string;
  title: string;
  slug: string;
  partTitle: string;
  unitNumber: string;
  unitTitle: string;
  order: number;
  summary: string;
  content: string;
}



export interface QiblaDirection {
  latitude: number;
  longitude: number;
  kaabaLatitude: number;
  kaabaLongitude: number;
  qiblaAzimuth: number;
}

export interface QuranPageAyah {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
  turkishMeal?: string;
}

export interface QuranPageResponse {
  page: number;
  firstAyah: { surahNumber: number; ayahNumber: number };
  lastAyah: { surahNumber: number; ayahNumber: number };
  ayahCount: number;
  items: QuranPageAyah[];
}

export interface QuranPageMealResponse {
  page: number;
  firstAyah: { surahNumber: number; ayahNumber: number };
  lastAyah: { surahNumber: number; ayahNumber: number };
  ayahCount: number;
  fullMealText: string;
  items: Array<{
    surahNumber: number;
    ayahNumber: number;
    turkishMeal: string;
  }>;
}

type QueryValue = string | number | boolean | undefined | null;

function buildUrl(path: string, params?: Record<string, QueryValue>): string {
  if (!params) {
    return `${API_BASE_URL}${path}`;
  }

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue;
    }

    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();
  return query.length > 0
    ? `${API_BASE_URL}${path}?${query}`
    : `${API_BASE_URL}${path}`;
}

async function requestJson<T>(
  path: string,
  params?: Record<string, QueryValue>,
): Promise<T> {
  const response = await fetch(buildUrl(path, params));
  if (!response.ok) {
    throw new Error(`Request failed for ${path}`);
  }

  return (await response.json()) as T;
}

export async function getDailyPrayerTimes(
  lat = ISTANBUL_COORDS.lat,
  lon = ISTANBUL_COORDS.lon,
): Promise<DailyPrayerTimes> {
  return requestJson<DailyPrayerTimes>("/prayer-times/daily", { lat, lon });
}

export async function getQiblaDirection(
  lat = ISTANBUL_COORDS.lat,
  lon = ISTANBUL_COORDS.lon,
): Promise<QiblaDirection> {
  return requestJson<QiblaDirection>("/qibla/direction", { lat, lon });
}

export async function getAyahReference(
  surahNumber: number,
  ayahNumber: number,
  includeMeal = true,
): Promise<
  Partial<Ayah> & {
    surahNumber: number;
    ayahNumber: number;
    arabicText: string;
  }
> {
  return requestJson("/content/ayahs/reference", {
    surahNumber,
    ayahNumber,
    includeMeal,
  });
}

export async function getQuranPage(
  page: number,
  includeMeal = true,
): Promise<QuranPageResponse> {
  return requestJson<QuranPageResponse>("/content/quran-pages", {
    page,
    includeMeal,
  });
}

export async function getQuranPageMeal(
  page: number,
): Promise<QuranPageMealResponse> {
  return requestJson<QuranPageMealResponse>("/content/quran-pages/meal", {
    page,
  });
}

export async function listHadiths(
  limit = 10,
  page = 1,
  source?: string,
): Promise<Hadith[]> {
  return requestJson<Hadith[]>("/content/hadiths", { limit, page, source });
}

export async function getHadithById(id: string): Promise<Hadith> {
  return requestJson<Hadith>(`/content/hadiths/${id}`);
}

export async function listSirahs(limit = 10, page = 1): Promise<Sirah[]> {
  return requestJson<Sirah[]>("/content/sirahs", { limit, page });
}

export async function getSirahById(id: string): Promise<Sirah> {
  return requestJson<Sirah>(`/content/sirahs/${id}`);
}

export async function searchAyahs(q: string, limit = 20): Promise<Ayah[]> {
  return requestJson<Ayah[]>("/search/ayahs", { q, limit });
}

export async function searchHadiths(q: string, limit = 20): Promise<Hadith[]> {
  return requestJson<Hadith[]>("/search/hadiths", { q, limit });
}

export async function searchSirahs(q: string, limit = 20): Promise<Sirah[]> {
  return requestJson<Sirah[]>("/search/sirahs", { q, limit });
}



export function parsePrayerTimeForDate(
  time: string,
  baseDate = new Date(),
): Date {
  const [hh, mm] = time.split(":").map((value) => Number(value));
  const parsed = new Date(baseDate);
  parsed.setHours(hh, mm, 0, 0);
  return parsed;
}

export function getNextPrayerInfo(daily: DailyPrayerTimes, now = new Date()) {
  const slots = [
    { name: "İmsak", time: daily.imsak },
    { name: "Güneş", time: daily.gunes },
    { name: "Öğle", time: daily.ogle },
    { name: "İkindi", time: daily.ikindi },
    { name: "Akşam", time: daily.aksam },
    { name: "Yatsı", time: daily.yatsi },
  ].map((slot) => ({
    ...slot,
    target: parsePrayerTimeForDate(slot.time, now),
  }));

  const upcoming = slots.find((slot) => slot.target.getTime() > now.getTime());
  if (upcoming) {
    return {
      name: upcoming.name,
      time: upcoming.time,
      remainingMs: upcoming.target.getTime() - now.getTime(),
    };
  }

  const tomorrowImsak = parsePrayerTimeForDate(daily.imsak, now);
  tomorrowImsak.setDate(tomorrowImsak.getDate() + 1);

  return {
    name: "İmsak",
    time: daily.imsak,
    remainingMs: tomorrowImsak.getTime() - now.getTime(),
  };
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function getNextPrayerProgress(daily: DailyPrayerTimes, now = new Date()): number {
  const slots = [
    { name: "İmsak", time: daily.imsak },
    { name: "Güneş", time: daily.gunes },
    { name: "Öğle", time: daily.ogle },
    { name: "İkindi", time: daily.ikindi },
    { name: "Akşam", time: daily.aksam },
    { name: "Yatsı", time: daily.yatsi },
  ].map((slot) => ({
    ...slot,
    target: parsePrayerTimeForDate(slot.time, now),
  }));

  const currentIdx = slots.findIndex((slot) => slot.target.getTime() > now.getTime());
  if (currentIdx <= 0) return 1;

  const prevTarget = slots[currentIdx - 1].target.getTime();
  const nextTarget = slots[currentIdx].target.getTime();
  const totalDuration = nextTarget - prevTarget;
  const elapsed = now.getTime() - prevTarget;

  return Math.min(1, Math.max(0, elapsed / totalDuration));
}

export function calculateDistanceToKaaba(lat: number, lon: number): number {
  const R = 6371;
  const dLat = ((KAABA_COORDS.lat - lat) * Math.PI) / 180;
  const dLon = ((KAABA_COORDS.lon - lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat * Math.PI) / 180) *
      Math.cos((KAABA_COORDS.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${Math.round(km).toLocaleString("tr-TR")} km`;
}

export const KAABA_COORDS = {
  lat: 21.422487,
  lon: 39.826206,
};

export function formatPrayerDateLabel(dateValue: string): string {
  if (!dateValue) {
    return "Bugün";
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return "Bugün";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
  }).format(parsed);
}

export function formatHadithSource(source: string): string {
  if (!source) {
    return "Hadis";
  }

  return source.charAt(0).toUpperCase() + source.slice(1);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trim()}...`;
}
