/**
 * Open-Meteo client. Open-Meteo is free for non-commercial use and needs no API key.
 *
 * - Archive API: reanalysis data from 1940, published with a lag of a few days.
 * - Forecast API: covers the most recent days (via `past_days`) and today.
 * - Geocoding API: place search by name.
 */
import { addDays, diffDays, EARLIEST_DATE, isValidISO, maxISO, minISO } from './dates.js';
import type { DailyWeather, DateRange, Place } from './types.js';

export const ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive';
export const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
export const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';

const DAILY_VARS = [
    'weather_code',
    'temperature_2m_max',
    'temperature_2m_min',
    'precipitation_sum',
    'wind_speed_10m_max',
] as const;

/** Days before today that are read from the forecast API, because the archive lags behind. */
export const RECENT_DAYS = 10;

/** Archive ranges whose union spans at most this many days are fetched in one request. */
const MERGE_SPAN_DAYS = 1100;

export type FetchFn = (url: string, init?: { signal?: AbortSignal }) => Promise<Response>;

export interface RequestOptions {
    signal?: AbortSignal;
    fetchFn?: FetchFn;
}

export class ApiError extends Error {
    override name = 'ApiError';
}

export function isAbortError(error: unknown): boolean {
    return typeof error === 'object' && error !== null && (error as { name?: unknown }).name === 'AbortError';
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// ---------------------------------------------------------------------------
// Request planning

export interface RequestPlan {
    archive: DateRange[];
    /** `past_days` for the forecast request, or null when no recent days are needed. */
    forecastPastDays: number | null;
}

function mergeRanges(ranges: DateRange[]): DateRange[] {
    const sorted = [...ranges].sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));
    const merged: DateRange[] = [];
    for (const range of sorted) {
        const last = merged[merged.length - 1];
        if (last && diffDays(last.start, maxISO(last.end, range.end)) <= MERGE_SPAN_DAYS) {
            last.end = maxISO(last.end, range.end);
        } else {
            merged.push({ ...range });
        }
    }
    return merged;
}

/** Split the requested ranges between the archive and the forecast API, with as few requests as possible. */
export function planRequests(ranges: DateRange[], today: string): RequestPlan {
    const recentStart = addDays(today, -RECENT_DAYS);
    const archive: DateRange[] = [];
    let forecastStart: string | null = null;

    for (const range of ranges) {
        const start = maxISO(range.start, EARLIEST_DATE);
        const end = minISO(range.end, today);
        if (start > end) continue;
        if (start < recentStart) {
            archive.push({ start, end: minISO(end, addDays(recentStart, -1)) });
        }
        if (end >= recentStart) {
            const from = maxISO(start, recentStart);
            forecastStart = forecastStart === null ? from : minISO(forecastStart, from);
        }
    }

    return {
        archive: mergeRanges(archive),
        forecastPastDays: forecastStart === null ? null : diffDays(forecastStart, today),
    };
}

function coord(value: number): string {
    return value.toFixed(4);
}

export function archiveUrl(lat: number, lon: number, range: DateRange): string {
    const params = new URLSearchParams({
        latitude: coord(lat),
        longitude: coord(lon),
        start_date: range.start,
        end_date: range.end,
        daily: DAILY_VARS.join(','),
        timezone: 'auto',
    });
    return `${ARCHIVE_URL}?${params.toString()}`;
}

export function forecastUrl(lat: number, lon: number, pastDays: number): string {
    const params = new URLSearchParams({
        latitude: coord(lat),
        longitude: coord(lon),
        past_days: String(pastDays),
        forecast_days: '1',
        daily: DAILY_VARS.join(','),
        timezone: 'auto',
    });
    return `${FORECAST_URL}?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// Response parsing

const BAD_RESPONSE = 'The weather service sent a response this app does not understand.';

function column(daily: Record<string, unknown>, key: string, length: number): (number | null)[] {
    const values = daily[key];
    if (values === undefined) return new Array<null>(length).fill(null);
    if (!Array.isArray(values) || values.length !== length) throw new ApiError(BAD_RESPONSE);
    return values.map((v: unknown) => {
        if (v === null) return null;
        if (typeof v === 'number' && Number.isFinite(v)) return v;
        throw new ApiError(BAD_RESPONSE);
    });
}

export function parseDaily(json: unknown): DailyWeather[] {
    if (!isRecord(json) || !isRecord(json.daily)) throw new ApiError(BAD_RESPONSE);
    const daily = json.daily;
    const time = daily.time;
    if (!Array.isArray(time) || !time.every((t): t is string => typeof t === 'string' && isValidISO(t))) {
        throw new ApiError(BAD_RESPONSE);
    }
    const n = time.length;
    const code = column(daily, 'weather_code', n);
    const tMax = column(daily, 'temperature_2m_max', n);
    const tMin = column(daily, 'temperature_2m_min', n);
    const precip = column(daily, 'precipitation_sum', n);
    const wind = column(daily, 'wind_speed_10m_max', n);
    return time.map((date, i) => ({
        date,
        tMax: tMax[i] ?? null,
        tMin: tMin[i] ?? null,
        precip: precip[i] ?? null,
        wind: wind[i] ?? null,
        code: code[i] ?? null,
    }));
}

// ---------------------------------------------------------------------------
// Fetching

const responseCache = new Map<string, unknown>();

/** Forget cached responses (used by tests). */
export function clearCache(): void {
    responseCache.clear();
}

async function errorFor(response: Response): Promise<ApiError> {
    if (response.status === 429) {
        return new ApiError('The weather service is limiting requests right now. Wait a minute and try again.');
    }
    let reason = '';
    try {
        const body: unknown = await response.json();
        if (isRecord(body) && typeof body.reason === 'string') reason = body.reason;
    } catch {
        // Body was not JSON; the status code is all we have.
    }
    return new ApiError(`The weather service returned an error (${response.status})${reason ? `: ${reason}` : ''}.`);
}

/** GET a JSON document, with an in-memory cache of successful responses. */
async function getJson(url: string, options: RequestOptions): Promise<unknown> {
    if (responseCache.has(url)) return responseCache.get(url);
    const fetchFn: FetchFn = options.fetchFn ?? ((u, init) => fetch(u, init));
    let response: Response;
    try {
        response = await fetchFn(url, { signal: options.signal });
    } catch (error) {
        if (isAbortError(error)) throw error;
        throw new ApiError('Could not reach the weather service. Check your connection and try again.');
    }
    if (!response.ok) throw await errorFor(response);
    let json: unknown;
    try {
        json = await response.json();
    } catch (error) {
        if (isAbortError(error)) throw error;
        throw new ApiError(BAD_RESPONSE);
    }
    responseCache.set(url, json);
    return json;
}

function hasTemperature(day: DailyWeather): boolean {
    return day.tMax !== null || day.tMin !== null;
}

/**
 * Daily weather for every date in `ranges` (clamped to 1940-01-01 .. today),
 * keyed by date. Uses one archive request per distant range plus at most one
 * forecast request for the last RECENT_DAYS days.
 */
export async function fetchDaily(
    lat: number,
    lon: number,
    ranges: DateRange[],
    today: string,
    options: RequestOptions = {},
): Promise<Map<string, DailyWeather>> {
    const plan = planRequests(ranges, today);
    const urls = plan.archive.map((r) => archiveUrl(lat, lon, r));
    if (plan.forecastPastDays !== null) urls.push(forecastUrl(lat, lon, plan.forecastPastDays));

    const responses = await Promise.all(urls.map((url) => getJson(url, options)));
    const byDate = new Map<string, DailyWeather>();
    for (const json of responses) {
        for (const day of parseDaily(json)) {
            const existing = byDate.get(day.date);
            if (!existing || (!hasTemperature(existing) && hasTemperature(day))) byDate.set(day.date, day);
        }
    }
    return byDate;
}

// ---------------------------------------------------------------------------
// Place search

const COUNTRY_ALIASES: Record<string, string> = {
    uk: 'gb',
    'united kingdom': 'gb',
    'great britain': 'gb',
    britain: 'gb',
    usa: 'us',
    'united states': 'us',
    america: 'us',
    uae: 'ae',
};

interface GeoResult {
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    countryCode: string;
    admin1: string;
}

function parseGeoResults(json: unknown): GeoResult[] {
    if (!isRecord(json)) throw new ApiError(BAD_RESPONSE);
    const results = json.results;
    // Open-Meteo omits `results` entirely when nothing matches.
    if (results === undefined) return [];
    if (!Array.isArray(results)) throw new ApiError(BAD_RESPONSE);
    const out: GeoResult[] = [];
    for (const r of results as unknown[]) {
        if (!isRecord(r)) continue;
        const { name, latitude, longitude } = r;
        if (typeof name !== 'string' || typeof latitude !== 'number' || typeof longitude !== 'number') continue;
        out.push({
            name,
            latitude,
            longitude,
            country: typeof r.country === 'string' ? r.country : '',
            countryCode: typeof r.country_code === 'string' ? r.country_code : '',
            admin1: typeof r.admin1 === 'string' ? r.admin1 : '',
        });
    }
    return out;
}

/** Split "Paris, Texas" into the name to search and a qualifier to filter by. */
export function parseQuery(query: string): { name: string; qualifier: string | null } {
    const [name = '', ...rest] = query.split(',').map((s) => s.trim());
    const qualifier = rest.filter(Boolean).join(', ');
    return { name, qualifier: qualifier || null };
}

function matchesQualifier(result: GeoResult, qualifier: string): boolean {
    const q = qualifier.toLowerCase();
    const code = result.countryCode.toLowerCase();
    if (code && (code === q || code === COUNTRY_ALIASES[q])) return true;
    return [result.country, result.admin1].some((v) => v.toLowerCase().startsWith(q));
}

export async function searchPlaces(
    query: string,
    options: RequestOptions & { language?: string } = {},
): Promise<Place[]> {
    const { name, qualifier } = parseQuery(query);
    if (name.length < 2) return [];
    const params = new URLSearchParams({
        name,
        count: '10',
        language: options.language ?? 'en',
        format: 'json',
    });
    const results = parseGeoResults(await getJson(`${GEOCODE_URL}?${params.toString()}`, options));
    const filtered = qualifier ? results.filter((r) => matchesQualifier(r, qualifier)) : results;
    return filtered.map((r) => ({
        name: r.name,
        detail: [r.admin1, r.country].filter(Boolean).join(', '),
        lat: r.latitude,
        lon: r.longitude,
    }));
}

export function formatCoords(lat: number, lon: number): string {
    const ns = lat >= 0 ? 'N' : 'S';
    const ew = lon >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(2)}°${ns}, ${Math.abs(lon).toFixed(2)}°${ew}`;
}
