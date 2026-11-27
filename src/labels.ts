/** Text labels for buckets. Pure functions so they can be unit-tested. */
import { AVERAGE_YEARS } from './aggregate.js';
import { formatDate, parseISO } from './dates.js';
import type { Bucket, Compare, View } from './types.js';

export interface CardLabel {
    title: string;
    subtitle: string;
}

function formatRange(start: string, end: string, withYear: boolean, locale?: string): string {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', timeZone: 'UTC' };
    if (withYear) options.year = 'numeric';
    const format = new Intl.DateTimeFormat(locale, options);
    if (start === end) return format.format(parseISO(start));
    return format.formatRange(parseISO(start), parseISO(end));
}

function partialText(bucket: Bucket, view: View): string | null {
    if (!bucket.partial) return null;
    const unit = view === 'weekly' ? 'week' : 'month';
    return `Partial ${unit} · ${bucket.coveredDays} of ${bucket.expectedDays} days`;
}

export function primaryLabel(bucket: Bucket, view: View, today: string, locale?: string): CardLabel {
    switch (view) {
        case 'daily':
            return {
                title: formatDate(bucket.start, { month: 'short', day: 'numeric' }, locale),
                subtitle: bucket.start === today ? 'Today' : formatDate(bucket.start, { weekday: 'long' }, locale),
            };
        case 'weekly':
            return {
                title: formatRange(bucket.start, bucket.end, false, locale),
                subtitle: partialText(bucket, view) ?? 'Week',
            };
        case 'monthly':
            return {
                title: formatDate(bucket.start, { month: 'long', year: 'numeric' }, locale),
                subtitle: partialText(bucket, view) ?? 'Full month',
            };
    }
}

export function comparisonCardLabel(bucket: Bucket, view: View, compare: Compare, locale?: string): CardLabel {
    if (compare.kind === 'average') {
        const avg = `${AVERAGE_YEARS}-year average`;
        switch (view) {
            case 'daily':
                return { title: formatDate(bucket.start, { month: 'short', day: 'numeric' }, locale), subtitle: avg };
            case 'weekly':
                return { title: formatRange(bucket.start, bucket.end, false, locale), subtitle: avg };
            case 'monthly':
                return {
                    title: formatDate(bucket.start, { month: 'long' }, locale),
                    subtitle: partialText(bucket, view) ? `${avg} · same ${bucket.coveredDays} days` : avg,
                };
        }
    }
    const { comparisonStart: start, comparisonEnd: end } = bucket;
    switch (view) {
        case 'daily':
            return {
                title: formatDate(start, { month: 'short', day: 'numeric', year: 'numeric' }, locale),
                subtitle: formatDate(start, { weekday: 'long' }, locale),
            };
        case 'weekly':
            return {
                title: formatRange(start, end, true, locale),
                subtitle: partialText(bucket, view) ? `Same ${bucket.coveredDays} days` : 'Week',
            };
        case 'monthly':
            return {
                title: formatDate(start, { month: 'long', year: 'numeric' }, locale),
                subtitle: partialText(bucket, view) ? `Same ${bucket.coveredDays} days` : 'Full month',
            };
    }
}

export function chartLabels(bucket: Bucket, view: View, locale?: string): { label: string; detail: string } {
    switch (view) {
        case 'daily':
            return {
                label: formatDate(bucket.start, { month: 'short', day: 'numeric' }, locale),
                detail: formatDate(bucket.start, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }, locale),
            };
        case 'weekly':
            return {
                label: formatDate(bucket.start, { month: 'short', day: 'numeric' }, locale),
                detail: formatRange(bucket.start, bucket.end, true, locale),
            };
        case 'monthly':
            return {
                label: formatDate(bucket.start, { month: 'short', year: '2-digit' }, locale),
                detail: formatDate(bucket.start, { month: 'long', year: 'numeric' }, locale),
            };
    }
}

export function periodText(start: string, end: string, locale?: string): string {
    return formatRange(start, end, true, locale);
}
