import {
    addDays,
    addMonths,
    eachDay,
    endOfMonth,
    minISO,
    mondayOf,
    shiftYears,
    startOfMonth,
    yearOf,
} from './dates.js';
import type { Bucket, Compare, DailyWeather, DateRange, Summary, View } from './types.js';

/** Number of past years averaged by the "average" comparison. */
export const AVERAGE_YEARS = 10;

/** Longest custom range we allow (keeps the timeline and requests bounded). */
export const MAX_RANGE_DAYS = 731;

export type DayLookup = (iso: string) => DailyWeather | undefined;

/** The default window for each view, ending today. */
export function presetRange(view: View, today: string): DateRange {
    switch (view) {
        case 'daily':
            return { start: addDays(today, -29), end: today };
        case 'weekly':
            // The current ISO week plus the 11 before it.
            return { start: addDays(mondayOf(today), -7 * 11), end: today };
        case 'monthly':
            // The current month plus the 11 before it.
            return { start: addMonths(startOfMonth(today), -11), end: today };
    }
}

/** One range that covers every view's preset, so switching views needs no new data. */
export function widestPresetRange(today: string): DateRange {
    const views: View[] = ['daily', 'weekly', 'monthly'];
    const start = views.map((v) => presetRange(v, today).start).reduce(minISO);
    return { start, end: today };
}

/** Year offset between the primary period and a single-year comparison. Always negative. */
export function compareOffset(compare: Compare, rangeEnd: string): number {
    if (compare.kind === 'year') {
        const offset = compare.year - yearOf(rangeEnd);
        if (offset < 0) return offset;
    }
    return -1;
}

/** The dates that must be downloaded to show the comparison row. */
export function comparisonRange(range: DateRange, compare: Compare): DateRange {
    if (compare.kind === 'average') {
        return { start: shiftYears(range.start, -AVERAGE_YEARS), end: shiftYears(range.end, -1) };
    }
    const offset = compareOffset(compare, range.end);
    return { start: shiftYears(range.start, offset), end: shiftYears(range.end, offset) };
}

/** Human label for the comparison series, e.g. "2025" or "2016–2025 avg". */
export function comparisonLabel(range: DateRange, compare: Compare): string {
    const endYear = yearOf(range.end);
    if (compare.kind === 'average') return `${endYear - AVERAGE_YEARS}–${endYear - 1} avg`;
    const offset = compareOffset(compare, range.end);
    const startYear = yearOf(range.start) + offset;
    const lastYear = endYear + offset;
    return startYear === lastYear ? String(lastYear) : `${startYear}–${lastYear}`;
}

export function primaryLabel(range: DateRange): string {
    const a = yearOf(range.start);
    const b = yearOf(range.end);
    return a === b ? String(b) : `${a}–${b}`;
}

function mean(values: number[]): number | null {
    if (values.length === 0) return null;
    return values.reduce((s, v) => s + v, 0) / values.length;
}

function present<T>(values: (T | null | undefined)[]): T[] {
    return values.filter((v): v is T => v !== null && v !== undefined);
}

/** Most common code; ties go to the higher (more severe) WMO code. */
function modeCode(codes: number[]): number | null {
    if (codes.length === 0) return null;
    const counts = new Map<number, number>();
    for (const c of codes) counts.set(c, (counts.get(c) ?? 0) + 1);
    let best = codes[0] as number;
    let bestCount = 0;
    for (const [code, count] of counts) {
        if (count > bestCount || (count === bestCount && code > best)) {
            best = code;
            bestCount = count;
        }
    }
    return best;
}

function midpoint(day: DailyWeather): number | null {
    return day.tMax !== null && day.tMin !== null ? (day.tMax + day.tMin) / 2 : null;
}

export function summarize(days: DailyWeather[]): Summary {
    const precip = present(days.map((d) => d.precip));
    const wind = present(days.map((d) => d.wind));
    return {
        tMax: mean(present(days.map((d) => d.tMax))),
        tMin: mean(present(days.map((d) => d.tMin))),
        tMean: mean(present(days.map(midpoint))),
        precip: precip.length ? precip.reduce((s, v) => s + v, 0) : null,
        wind: wind.length ? Math.max(...wind) : null,
        code: modeCode(present(days.map((d) => d.code))),
        days: days.filter((d) => d.tMax !== null || d.tMin !== null).length,
    };
}

/** Average several years' observations of the same calendar day into one synthetic day. */
export function averageDay(date: string, days: DailyWeather[]): DailyWeather {
    return {
        date,
        tMax: mean(present(days.map((d) => d.tMax))),
        tMin: mean(present(days.map((d) => d.tMin))),
        precip: mean(present(days.map((d) => d.precip))),
        wind: mean(present(days.map((d) => d.wind))),
        code: modeCode(present(days.map((d) => d.code))),
    };
}

export interface ComparisonSource {
    lookup: DayLookup;
    /** The comparison date shown for a primary date (identity for averages). */
    dateFor: (iso: string) => string;
}

export function comparisonSource(
    data: ReadonlyMap<string, DailyWeather>,
    range: DateRange,
    compare: Compare,
): ComparisonSource {
    if (compare.kind === 'average') {
        return {
            lookup: (iso) => {
                const years: DailyWeather[] = [];
                for (let k = 1; k <= AVERAGE_YEARS; k++) {
                    const day = data.get(shiftYears(iso, -k));
                    if (day) years.push(day);
                }
                return years.length ? averageDay(iso, years) : undefined;
            },
            dateFor: (iso) => iso,
        };
    }
    const offset = compareOffset(compare, range.end);
    return {
        lookup: (iso) => data.get(shiftYears(iso, offset)),
        dateFor: (iso) => shiftYears(iso, offset),
    };
}

/** Calendar bucket a date belongs to: the day itself, its ISO week's Monday, or its month's 1st. */
export function bucketKey(iso: string, view: View): string {
    if (view === 'weekly') return mondayOf(iso);
    if (view === 'monthly') return startOfMonth(iso);
    return iso;
}

function bucketEnd(key: string, view: View): string {
    if (view === 'weekly') return addDays(key, 6);
    if (view === 'monthly') return endOfMonth(key);
    return key;
}

/**
 * Group the range into calendar buckets. Comparison values are looked up by
 * shifting each primary date, so the two rows always have the same columns and
 * each column covers the same calendar days.
 */
export function buildBuckets(
    range: DateRange,
    view: View,
    primary: DayLookup,
    comparison: ComparisonSource,
): Bucket[] {
    const groups = new Map<string, string[]>();
    for (const day of eachDay(range.start, range.end)) {
        const key = bucketKey(day, view);
        const group = groups.get(key);
        if (group) group.push(day);
        else groups.set(key, [day]);
    }

    const buckets: Bucket[] = [];
    for (const [key, days] of groups) {
        const start = days[0] as string;
        const end = days[days.length - 1] as string;
        const fullEnd = bucketEnd(key, view);
        const expectedDays = eachDay(key, fullEnd).length;
        buckets.push({
            start,
            end,
            expectedDays,
            coveredDays: days.length,
            partial: days.length < expectedDays,
            primary: summarize(present(days.map(primary))),
            comparison: summarize(present(days.map(comparison.lookup))),
            comparisonStart: comparison.dateFor(start),
            comparisonEnd: comparison.dateFor(end),
        });
    }
    return buckets;
}

/** Whole-period totals for the headline summary. */
export function periodSummary(
    range: DateRange,
    primary: DayLookup,
    comparison: ComparisonSource,
): { primary: Summary; comparison: Summary } {
    const days = eachDay(range.start, range.end);
    return {
        primary: summarize(present(days.map(primary))),
        comparison: summarize(present(days.map(comparison.lookup))),
    };
}
