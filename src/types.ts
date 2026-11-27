/** Time granularity of the timeline. */
export type View = 'daily' | 'weekly' | 'monthly';

/** Display units. Data is always stored in metric (°C, mm, km/h). */
export type Unit = 'metric' | 'imperial';

export type Theme = 'system' | 'light' | 'dark';

/**
 * What the primary period is compared against.
 * - previous: the same dates one year earlier
 * - year: the same dates in a specific earlier year
 * - average: the mean of the same dates over the previous AVERAGE_YEARS years
 */
export type Compare =
    | { kind: 'previous' }
    | { kind: 'year'; year: number }
    | { kind: 'average' };

export interface Place {
    name: string;
    /** Region and country, or formatted coordinates when no name is known. */
    detail: string;
    lat: number;
    lon: number;
}

/** One day of observations, metric units. `null` means the provider had no value. */
export interface DailyWeather {
    /** Local calendar date, YYYY-MM-DD. */
    date: string;
    tMax: number | null;
    tMin: number | null;
    precip: number | null;
    wind: number | null;
    code: number | null;
}

/** Inclusive range of YYYY-MM-DD dates. */
export interface DateRange {
    start: string;
    end: string;
}

/** Aggregated weather for one bucket (a day, a week or a month). */
export interface Summary {
    /** Mean of daily highs. */
    tMax: number | null;
    /** Mean of daily lows. */
    tMin: number | null;
    /** Mean of daily (high + low) / 2. Used for deltas and the chart. */
    tMean: number | null;
    /** Total precipitation. */
    precip: number | null;
    /** Highest daily maximum wind speed. */
    wind: number | null;
    /** Most common WMO weather code (ties go to the more severe code). */
    code: number | null;
    /** Number of days that had temperature data. */
    days: number;
}

export interface Bucket {
    /** First and last primary date inside this bucket (clipped to the selected range). */
    start: string;
    end: string;
    /** Number of days in the full calendar bucket (1, 7 or the month length). */
    expectedDays: number;
    /** Number of days of the bucket that fall inside the selected range. */
    coveredDays: number;
    /** True when the bucket is clipped by the range (e.g. the current, unfinished month). */
    partial: boolean;
    primary: Summary;
    comparison: Summary;
    /** Comparison dates for this bucket; only meaningful for year comparisons. */
    comparisonStart: string;
    comparisonEnd: string;
}
