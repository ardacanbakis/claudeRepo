import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
    AVERAGE_YEARS,
    buildBuckets,
    comparisonLabel,
    comparisonRange,
    comparisonSource,
    presetRange,
    summarize,
    widestPresetRange,
} from '../src/aggregate.js';
import { diffDays, mondayOf, shiftYears } from '../src/dates.js';
import type { Compare, DateRange } from '../src/types.js';
import { dataFor, day } from './helpers.js';

const TODAY = '2026-11-27'; // a Friday
const previous: Compare = { kind: 'previous' };

describe('preset ranges', () => {
    it('covers 30 days, 12 ISO weeks, or 12 months ending today', () => {
        assert.deepEqual(presetRange('daily', TODAY), { start: '2026-10-29', end: TODAY });
        const weekly = presetRange('weekly', TODAY);
        assert.equal(weekly.start, '2026-09-07');
        assert.equal(mondayOf(weekly.start), weekly.start);
        assert.deepEqual(presetRange('monthly', TODAY), { start: '2025-12-01', end: TODAY });
    });

    it('widest preset contains every view preset', () => {
        const widest = widestPresetRange(TODAY);
        for (const view of ['daily', 'weekly', 'monthly'] as const) {
            const r = presetRange(view, TODAY);
            assert.ok(widest.start <= r.start && widest.end >= r.end, view);
        }
    });
});

describe('comparison ranges', () => {
    const range: DateRange = { start: '2026-10-29', end: TODAY };

    it('shifts by one year by default', () => {
        assert.deepEqual(comparisonRange(range, previous), { start: '2025-10-29', end: '2025-11-27' });
        assert.equal(comparisonLabel(range, previous), '2025');
    });

    it('supports a specific year', () => {
        assert.deepEqual(comparisonRange(range, { kind: 'year', year: 2019 }), { start: '2019-10-29', end: '2019-11-27' });
    });

    it('falls back to previous year for an invalid year', () => {
        assert.deepEqual(comparisonRange(range, { kind: 'year', year: 2026 }), comparisonRange(range, previous));
    });

    it('covers ten earlier years for the average', () => {
        const r = comparisonRange(range, { kind: 'average' });
        assert.equal(r.start, shiftYears(range.start, -AVERAGE_YEARS));
        assert.equal(r.end, '2025-11-27');
        assert.equal(comparisonLabel(range, { kind: 'average' }), '2016–2025 avg');
    });
});

describe('summarize', () => {
    it('averages temperatures, totals rain and takes the peak wind', () => {
        const s = summarize([
            day('2026-01-01', { tMax: 10, tMin: 0, precip: 2, wind: 10, code: 3 }),
            day('2026-01-02', { tMax: 14, tMin: 4, precip: 3, wind: 30, code: 61 }),
            day('2026-01-03', { tMax: null, tMin: null, precip: null, wind: null, code: 3 }),
        ]);
        assert.equal(s.tMax, 12);
        assert.equal(s.tMin, 2);
        assert.equal(s.tMean, 7);
        assert.equal(s.precip, 5);
        assert.equal(s.wind, 30);
        assert.equal(s.code, 3);
        assert.equal(s.days, 2);
    });

    it('breaks condition ties towards the more severe code', () => {
        const s = summarize([day('2026-01-01', { code: 3 }), day('2026-01-02', { code: 63 })]);
        assert.equal(s.code, 63);
    });

    it('returns nulls for no data', () => {
        const s = summarize([]);
        assert.equal(s.tMean, null);
        assert.equal(s.precip, null);
        assert.equal(s.days, 0);
    });
});

describe('buildBuckets', () => {
    const data = dataFor('2015-01-01', TODAY);
    const lookup = (iso: string) => data.get(iso);

    it('aligns daily comparison one year back, column for column', () => {
        const range = presetRange('daily', TODAY);
        const buckets = buildBuckets(range, 'daily', lookup, comparisonSource(data, range, previous));
        assert.equal(buckets.length, 30);
        for (const b of buckets) {
            assert.equal(b.comparisonStart, shiftYears(b.start, -1));
            assert.equal(b.partial, false);
        }
    });

    it('starts weekly buckets on Monday and flags the unfinished week as partial', () => {
        const range = presetRange('weekly', TODAY);
        const buckets = buildBuckets(range, 'weekly', lookup, comparisonSource(data, range, previous));
        assert.equal(buckets.length, 12);
        for (const b of buckets) assert.equal(mondayOf(b.start), b.start);
        const last = buckets[buckets.length - 1];
        assert.ok(last);
        assert.equal(last.partial, true);
        assert.equal(last.coveredDays, 5);
        assert.equal(last.expectedDays, 7);
        assert.equal(buckets.slice(0, -1).every((b) => !b.partial), true);
    });

    it('labels clipped months as partial and compares the same days', () => {
        const range = presetRange('monthly', TODAY);
        const buckets = buildBuckets(range, 'monthly', lookup, comparisonSource(data, range, previous));
        assert.equal(buckets.length, 12);
        const last = buckets[buckets.length - 1];
        assert.ok(last);
        assert.equal(last.start, '2026-11-01');
        assert.equal(last.partial, true);
        assert.equal(last.coveredDays, 27);
        assert.equal(last.expectedDays, 30);
        assert.equal(last.comparison.days, 27);
        assert.equal(last.comparisonEnd, '2025-11-27');
    });

    it('custom weekly ranges that start mid-week get a partial first bucket', () => {
        const range = { start: '2026-11-05', end: '2026-11-22' }; // Thu .. Sun
        const buckets = buildBuckets(range, 'weekly', lookup, comparisonSource(data, range, previous));
        assert.equal(buckets.length, 3);
        assert.equal(buckets[0]?.partial, true);
        assert.equal(buckets[0].coveredDays, 4);
        assert.equal(buckets[2]?.partial, false);
    });

    it('averages the same calendar days over ten years', () => {
        const flat = dataFor('2015-01-01', TODAY, (d) => day(d, { tMax: Number(d.slice(0, 4)) - 2000, tMin: Number(d.slice(0, 4)) - 2000 }));
        const range = { start: '2026-11-20', end: '2026-11-21' };
        const source = comparisonSource(flat, range, { kind: 'average' });
        const avg = source.lookup('2026-11-20');
        assert.ok(avg);
        // Years 2016..2025 → values 16..25, mean 20.5
        assert.equal(avg.tMax, 20.5);
    });

    it('reports missing data as an empty summary rather than failing', () => {
        const range = { start: '2026-11-20', end: '2026-11-21' };
        const empty = new Map();
        const buckets = buildBuckets(range, 'daily', () => undefined, comparisonSource(empty, range, previous));
        assert.equal(buckets.length, 2);
        assert.equal(buckets[0]?.primary.days, 0);
        assert.equal(diffDays(range.start, range.end), 1);
    });
});
