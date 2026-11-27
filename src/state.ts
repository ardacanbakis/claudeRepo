/** URL (shareable) state and locally stored preferences. */
import { MAX_RANGE_DAYS } from './aggregate.js';
import { diffDays, EARLIEST_DATE, isValidISO, shiftYears, yearOf } from './dates.js';
import type { Compare, DateRange, Place, Theme, Unit, View } from './types.js';

const VIEWS: readonly View[] = ['daily', 'weekly', 'monthly'];

/** Earliest allowed start of the primary range: one year after the archive starts, so a comparison exists. */
export const EARLIEST_START = shiftYears(EARLIEST_DATE, 1);

export interface ShareableState {
    place: Place | null;
    view: View;
    /** null means "the default window for the view, ending today". */
    range: DateRange | null;
    compare: Compare;
}

function isFiniteIn(value: number, min: number, max: number): boolean {
    return Number.isFinite(value) && value >= min && value <= max;
}

/** Returns an error message, or null when the range is acceptable. */
export function validateRange(range: DateRange, today: string): string | null {
    if (!isValidISO(range.start) || !isValidISO(range.end)) return 'Enter both dates.';
    if (range.start > range.end) return 'The start date must be on or before the end date.';
    if (range.end > today) return 'The end date cannot be in the future.';
    if (range.start < EARLIEST_START) return `The start date must be on or after ${EARLIEST_START}.`;
    if (diffDays(range.start, range.end) + 1 > MAX_RANGE_DAYS) return `Choose a range of at most ${MAX_RANGE_DAYS} days.`;
    return null;
}

/** Whether a specific comparison year is usable for a range ending on `rangeEnd`. */
export function isValidCompareYear(year: number, rangeEnd: string): boolean {
    return Number.isInteger(year) && year >= yearOf(EARLIEST_DATE) && year < yearOf(rangeEnd);
}

export function toQuery(state: ShareableState): string {
    const params = new URLSearchParams();
    if (state.place) {
        params.set('lat', state.place.lat.toFixed(4));
        params.set('lon', state.place.lon.toFixed(4));
        params.set('name', state.place.name);
        if (state.place.detail) params.set('detail', state.place.detail);
    }
    if (state.view !== 'daily') params.set('view', state.view);
    if (state.range) {
        params.set('from', state.range.start);
        params.set('to', state.range.end);
    }
    if (state.compare.kind === 'average') params.set('cmp', 'avg');
    if (state.compare.kind === 'year') params.set('cmp', String(state.compare.year));
    return params.toString();
}

/** Parse a query string. Anything missing or invalid falls back to the default. */
export function fromQuery(search: string, today: string): ShareableState {
    const params = new URLSearchParams(search);

    let place: Place | null = null;
    const lat = Number(params.get('lat'));
    const lon = Number(params.get('lon'));
    if (params.has('lat') && params.has('lon') && isFiniteIn(lat, -90, 90) && isFiniteIn(lon, -180, 180)) {
        place = {
            lat,
            lon,
            name: (params.get('name') ?? '').slice(0, 100) || 'Selected location',
            detail: (params.get('detail') ?? '').slice(0, 150),
        };
    }

    const viewParam = params.get('view');
    const view: View = VIEWS.find((v) => v === viewParam) ?? 'daily';

    let range: DateRange | null = null;
    const from = params.get('from');
    const to = params.get('to');
    if (from && to && validateRange({ start: from, end: to }, today) === null) range = { start: from, end: to };

    let compare: Compare = { kind: 'previous' };
    const cmp = params.get('cmp');
    if (cmp === 'avg') compare = { kind: 'average' };
    else if (cmp && /^\d{4}$/.test(cmp) && isValidCompareYear(Number(cmp), range?.end ?? today)) {
        compare = { kind: 'year', year: Number(cmp) };
    }

    return { place, view, range, compare };
}

// ---------------------------------------------------------------------------
// Local preferences

const PREFS_KEY = 'weather-timeline:prefs:v1';
/** Left behind by version 1 of the app, which stored an OpenWeatherMap key. */
const LEGACY_KEYS = ['openweather_api_key'];
export const MAX_SAVED_PLACES = 12;

export interface Prefs {
    unit: Unit;
    theme: Theme;
    lastPlace: Place | null;
    saved: Place[];
}

export const DEFAULT_PREFS: Prefs = { unit: 'metric', theme: 'system', lastPlace: null, saved: [] };

/** localStorage, or null when the browser blocks it (private mode, disabled cookies). */
export function getStorage(): Storage | null {
    try {
        return typeof localStorage === 'undefined' ? null : localStorage;
    } catch {
        return null;
    }
}

export function isPlace(value: unknown): value is Place {
    if (typeof value !== 'object' || value === null) return false;
    const v = value as Record<string, unknown>;
    return (
        typeof v.name === 'string' &&
        typeof v.detail === 'string' &&
        typeof v.lat === 'number' &&
        typeof v.lon === 'number' &&
        isFiniteIn(v.lat, -90, 90) &&
        isFiniteIn(v.lon, -180, 180)
    );
}

export function samePlace(a: Place | null, b: Place | null): boolean {
    if (!a || !b) return false;
    return Math.abs(a.lat - b.lat) < 0.001 && Math.abs(a.lon - b.lon) < 0.001;
}

export function loadPrefs(storage: Storage | null = getStorage()): Prefs {
    if (!storage) return { ...DEFAULT_PREFS, saved: [] };
    try {
        for (const key of LEGACY_KEYS) storage.removeItem(key);
        const raw = storage.getItem(PREFS_KEY);
        if (!raw) return { ...DEFAULT_PREFS, saved: [] };
        const data: unknown = JSON.parse(raw);
        if (typeof data !== 'object' || data === null) return { ...DEFAULT_PREFS, saved: [] };
        const d = data as Record<string, unknown>;
        return {
            unit: d.unit === 'imperial' ? 'imperial' : 'metric',
            theme: d.theme === 'light' || d.theme === 'dark' ? d.theme : 'system',
            lastPlace: isPlace(d.lastPlace) ? d.lastPlace : null,
            saved: Array.isArray(d.saved) ? d.saved.filter(isPlace).slice(0, MAX_SAVED_PLACES) : [],
        };
    } catch {
        return { ...DEFAULT_PREFS, saved: [] };
    }
}

export function savePrefs(prefs: Prefs, storage: Storage | null = getStorage()): void {
    if (!storage) return;
    try {
        storage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
        // Quota exceeded or storage disabled: preferences just won't persist.
    }
}
