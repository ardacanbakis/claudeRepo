import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { niceTicks } from '../src/chart.js';
import { comparisonCardLabel, primaryLabel } from '../src/labels.js';
import type { Bucket, Summary } from '../src/types.js';
import { formatDelta, formatPrecip, formatTemp, formatWind } from '../src/units.js';
import { describeCode } from '../src/weather-codes.js';

const empty: Summary = { tMax: null, tMin: null, tMean: null, precip: null, wind: null, code: null, days: 0 };

function bucket(partial: Partial<Bucket>): Bucket {
    return {
        start: '2026-11-27',
        end: '2026-11-27',
        expectedDays: 1,
        coveredDays: 1,
        partial: false,
        primary: empty,
        comparison: empty,
        comparisonStart: '2025-11-27',
        comparisonEnd: '2025-11-27',
        ...partial,
    };
}

describe('units', () => {
    it('formats temperatures in both units', () => {
        assert.equal(formatTemp(20, 'metric'), '20°C');
        assert.equal(formatTemp(20, 'imperial'), '68°F');
        assert.equal(formatTemp(-0.2, 'metric'), '0°C');
        assert.equal(formatTemp(null, 'metric'), '–');
    });

    it('scales deltas without offsetting them', () => {
        assert.equal(formatDelta(2, 'metric'), '+2.0°C');
        assert.equal(formatDelta(2, 'imperial'), '+3.6°F');
        assert.equal(formatDelta(-1.26, 'metric'), '−1.3°C');
        assert.equal(formatDelta(0.01, 'metric'), '±0°C');
    });

    it('formats rain and wind', () => {
        assert.equal(formatPrecip(4.24, 'metric'), '4.2 mm');
        assert.equal(formatPrecip(25.4, 'imperial'), '1.00 in');
        assert.equal(formatWind(16.09, 'imperial'), '10 mph');
        assert.equal(formatWind(null, 'metric'), '–');
    });
});

describe('weather codes', () => {
    it('describes known, unknown and missing codes', () => {
        assert.equal(describeCode(0).label, 'Clear sky');
        assert.equal(describeCode(1234).label, 'Unknown conditions');
        assert.equal(describeCode(null).label, 'No data');
    });
});

describe('labels', () => {
    it('marks today and partial periods', () => {
        assert.equal(primaryLabel(bucket({}), 'daily', '2026-11-27', 'en-US').subtitle, 'Today');
        const week = bucket({ start: '2026-11-23', end: '2026-11-27', expectedDays: 7, coveredDays: 5, partial: true });
        assert.equal(primaryLabel(week, 'weekly', '2026-11-27', 'en-US').subtitle, 'Partial week · 5 of 7 days');
        const month = bucket({ start: '2026-11-01', end: '2026-11-27', expectedDays: 30, coveredDays: 27, partial: true });
        const label = primaryLabel(month, 'monthly', '2026-11-27', 'en-US');
        assert.equal(label.title, 'November 2026');
        assert.equal(label.subtitle, 'Partial month · 27 of 30 days');
    });

    it('labels comparison cards with their own year', () => {
        const label = comparisonCardLabel(bucket({}), 'daily', { kind: 'previous' }, 'en-US');
        assert.equal(label.title, 'Nov 27, 2025');
        const avg = comparisonCardLabel(bucket({}), 'daily', { kind: 'average' }, 'en-US');
        assert.equal(avg.subtitle, '10-year average');
    });
});

describe('niceTicks', () => {
    it('produces round, covering ticks', () => {
        assert.deepEqual(niceTicks(1.3, 17.8), [0, 5, 10, 15, 20]);
        const flat = niceTicks(5, 5);
        assert.ok((flat[0] ?? 99) <= 4 && (flat[flat.length - 1] ?? 0) >= 6);
        assert.deepEqual(niceTicks(Number.NaN, 1), []);
    });
});
