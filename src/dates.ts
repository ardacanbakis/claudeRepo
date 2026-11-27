/**
 * Calendar helpers that work on YYYY-MM-DD strings.
 *
 * All arithmetic happens in UTC so daylight-saving changes can never shift a
 * date. Strings compare correctly with < and >, which the rest of the app uses.
 */

const DAY_MS = 86_400_000;
const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Earliest date the Open-Meteo archive serves. */
export const EARLIEST_DATE = '1940-01-01';

function pad(n: number, width = 2): string {
    return String(n).padStart(width, '0');
}

export function isValidISO(value: string): boolean {
    const m = ISO_RE.exec(value);
    if (!m) return false;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    if (mo < 1 || mo > 12 || d < 1) return false;
    return d <= daysInMonth(y, mo);
}

/** Milliseconds since epoch for midnight UTC of the given date. Throws on invalid input. */
export function parseISO(iso: string): number {
    if (!isValidISO(iso)) throw new RangeError(`Invalid date: ${iso}`);
    const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
    return Date.UTC(y, m - 1, d);
}

export function toISO(ms: number): string {
    const date = new Date(ms);
    return `${pad(date.getUTCFullYear(), 4)}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

/** Today's date in the browser's local time zone. */
export function localTodayISO(now: Date = new Date()): string {
    return `${pad(now.getFullYear(), 4)}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function addDays(iso: string, days: number): string {
    return toISO(parseISO(iso) + days * DAY_MS);
}

/** Whole days from `a` to `b` (positive when b is later). */
export function diffDays(a: string, b: string): number {
    return Math.round((parseISO(b) - parseISO(a)) / DAY_MS);
}

/** Every date from start to end inclusive. Empty when start > end. */
export function eachDay(start: string, end: string): string[] {
    const out: string[] = [];
    const endMs = parseISO(end);
    for (let ms = parseISO(start); ms <= endMs; ms += DAY_MS) out.push(toISO(ms));
    return out;
}

export function isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** Days in a month; `month` is 1-12. */
export function daysInMonth(year: number, month: number): number {
    return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function yearOf(iso: string): number {
    return Number(iso.slice(0, 4));
}

/** Same calendar day `years` years later (negative for earlier). Feb 29 maps to Feb 28. */
export function shiftYears(iso: string, years: number): string {
    const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
    const target = y + years;
    const day = m === 2 && d === 29 && !isLeapYear(target) ? 28 : d;
    return `${pad(target, 4)}-${pad(m)}-${pad(day)}`;
}

/** Monday of the ISO week containing the date. */
export function mondayOf(iso: string): string {
    const weekday = new Date(parseISO(iso)).getUTCDay(); // 0 = Sunday
    const sinceMonday = (weekday + 6) % 7;
    return addDays(iso, -sinceMonday);
}

export function startOfMonth(iso: string): string {
    return `${iso.slice(0, 7)}-01`;
}

export function endOfMonth(iso: string): string {
    const y = yearOf(iso);
    const m = Number(iso.slice(5, 7));
    return `${iso.slice(0, 7)}-${pad(daysInMonth(y, m))}`;
}

/** First day of the month `months` months after the month containing `iso`. */
export function addMonths(iso: string, months: number): string {
    const y = yearOf(iso);
    const m = Number(iso.slice(5, 7)) - 1 + months;
    const year = y + Math.floor(m / 12);
    const month = ((m % 12) + 12) % 12;
    return `${pad(year, 4)}-${pad(month + 1)}-01`;
}

export function minISO(a: string, b: string): string {
    return a < b ? a : b;
}

export function maxISO(a: string, b: string): string {
    return a > b ? a : b;
}

/** Locale-aware formatting of a calendar date, immune to the viewer's time zone. */
export function formatDate(iso: string, options: Intl.DateTimeFormatOptions, locale?: string): string {
    return new Date(parseISO(iso)).toLocaleDateString(locale, { ...options, timeZone: 'UTC' });
}
