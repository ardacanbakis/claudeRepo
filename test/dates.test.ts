import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
    addDays,
    addMonths,
    diffDays,
    eachDay,
    endOfMonth,
    isValidISO,
    localTodayISO,
    mondayOf,
    shiftYears,
    startOfMonth,
} from '../src/dates.js';

describe('dates', () => {
    it('validates real calendar dates only', () => {
        assert.equal(isValidISO('2026-02-28'), true);
        assert.equal(isValidISO('2024-02-29'), true);
        assert.equal(isValidISO('2026-02-29'), false);
        assert.equal(isValidISO('2026-13-01'), false);
        assert.equal(isValidISO('2026-1-01'), false);
        assert.equal(isValidISO('not a date'), false);
    });

    it('adds days across month, year and DST boundaries', () => {
        assert.equal(addDays('2026-01-31', 1), '2026-02-01');
        assert.equal(addDays('2026-12-31', 1), '2027-01-01');
        assert.equal(addDays('2026-03-29', 1), '2026-03-30'); // EU DST change
        assert.equal(addDays('2026-03-01', -1), '2026-02-28');
        assert.equal(diffDays('2026-01-01', '2027-01-01'), 365);
    });

    it('lists every day in a range', () => {
        assert.deepEqual(eachDay('2026-02-27', '2026-03-02'), ['2026-02-27', '2026-02-28', '2026-03-01', '2026-03-02']);
        assert.deepEqual(eachDay('2026-03-02', '2026-03-01'), []);
    });

    it('shifts years and maps Feb 29 to Feb 28', () => {
        assert.equal(shiftYears('2026-11-27', -1), '2025-11-27');
        assert.equal(shiftYears('2024-02-29', -1), '2023-02-28');
        assert.equal(shiftYears('2024-02-29', -4), '2020-02-29');
    });

    it('finds ISO week Mondays and month bounds', () => {
        assert.equal(mondayOf('2026-11-27'), '2026-11-23'); // Friday
        assert.equal(mondayOf('2026-11-23'), '2026-11-23'); // Monday
        assert.equal(mondayOf('2026-11-29'), '2026-11-23'); // Sunday
        assert.equal(startOfMonth('2026-11-27'), '2026-11-01');
        assert.equal(endOfMonth('2026-02-10'), '2026-02-28');
        assert.equal(endOfMonth('2024-02-10'), '2024-02-29');
        assert.equal(addMonths('2026-11-01', -11), '2025-12-01');
        assert.equal(addMonths('2026-01-01', -1), '2025-12-01');
        assert.equal(addMonths('2026-12-01', 1), '2027-01-01');
    });

    it('formats local today', () => {
        assert.equal(localTodayISO(new Date(2026, 10, 27, 23, 59)), '2026-11-27');
    });
});
