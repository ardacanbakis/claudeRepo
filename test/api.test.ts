import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { comparisonRange, widestPresetRange } from '../src/aggregate.js';
import {
    ApiError,
    clearCache,
    type FetchFn,
    fetchDaily,
    formatCoords,
    parseDaily,
    parseQuery,
    planRequests,
    RECENT_DAYS,
    searchPlaces,
} from '../src/api.js';
import { addDays, eachDay } from '../src/dates.js';
import { openMeteoDaily } from './helpers.js';

const TODAY = '2026-11-27';

/** Fake fetch that serves Open-Meteo-shaped responses and records every URL. */
function fakeFetch(handler?: (url: URL) => Response | undefined): { fetchFn: FetchFn; calls: URL[] } {
    const calls: URL[] = [];
    const fetchFn: FetchFn = (raw) => {
        const url = new URL(raw);
        calls.push(url);
        const custom = handler?.(url);
        if (custom) return Promise.resolve(custom);
        const p = url.searchParams;
        let dates: string[];
        if (url.hostname.startsWith('archive')) {
            dates = eachDay(p.get('start_date') ?? '', p.get('end_date') ?? '');
        } else {
            dates = eachDay(addDays(TODAY, -Number(p.get('past_days'))), TODAY);
        }
        return Promise.resolve(Response.json(openMeteoDaily(dates)));
    };
    return { fetchFn, calls };
}

beforeEach(() => { clearCache(); });

describe('planRequests', () => {
    it('uses one archive request and one forecast request for the default view', () => {
        const primary = widestPresetRange(TODAY);
        const plan = planRequests([primary, comparisonRange(primary, { kind: 'previous' })], TODAY);
        assert.equal(plan.archive.length, 1);
        assert.equal(plan.archive[0]?.end, addDays(TODAY, -RECENT_DAYS - 1));
        assert.equal(plan.forecastPastDays, RECENT_DAYS);
    });

    it('skips the forecast for ranges entirely in the past', () => {
        const plan = planRequests([{ start: '2020-01-01', end: '2020-02-01' }], TODAY);
        assert.equal(plan.forecastPastDays, null);
        assert.deepEqual(plan.archive, [{ start: '2020-01-01', end: '2020-02-01' }]);
    });

    it('keeps far-apart ranges as separate requests and clamps to the archive start', () => {
        const plan = planRequests(
            [
                { start: '1939-06-01', end: '1940-02-01' },
                { start: '2020-01-01', end: '2020-02-01' },
            ],
            TODAY,
        );
        assert.equal(plan.archive.length, 2);
        assert.equal(plan.archive[0]?.start, '1940-01-01');
    });

    it('ignores future dates', () => {
        const plan = planRequests([{ start: '2027-01-01', end: '2027-02-01' }], TODAY);
        assert.deepEqual(plan, { archive: [], forecastPastDays: null });
    });
});

describe('fetchDaily', () => {
    it('loads the default view with at most two weather requests', async () => {
        const { fetchFn, calls } = fakeFetch();
        const primary = widestPresetRange(TODAY);
        const ranges = [primary, comparisonRange(primary, { kind: 'previous' })];
        const data = await fetchDaily(51.5, -0.12, ranges, TODAY, { fetchFn });
        assert.ok(calls.length <= 2, `made ${calls.length} requests`);
        for (const r of ranges) for (const d of eachDay(r.start, r.end)) assert.ok(data.has(d), `missing ${d}`);
        assert.equal(data.get(TODAY)?.tMax, 15);
    });

    it('caches identical requests', async () => {
        const { fetchFn, calls } = fakeFetch();
        const ranges = [{ start: '2020-01-01', end: '2020-01-31' }];
        await fetchDaily(1, 2, ranges, TODAY, { fetchFn });
        await fetchDaily(1, 2, ranges, TODAY, { fetchFn });
        assert.equal(calls.length, 1);
    });

    it('turns HTTP errors into readable ApiErrors', async () => {
        const { fetchFn } = fakeFetch(() => Response.json({ error: true, reason: 'Latitude must be in range' }, { status: 400 }));
        await assert.rejects(fetchDaily(1, 2, [{ start: '2020-01-01', end: '2020-01-02' }], TODAY, { fetchFn }), (err: unknown) => {
            assert.ok(err instanceof ApiError);
            assert.match(err.message, /400.*Latitude must be in range/);
            return true;
        });
    });

    it('explains rate limiting', async () => {
        const { fetchFn } = fakeFetch(() => new Response('', { status: 429 }));
        await assert.rejects(fetchDaily(1, 2, [{ start: '2020-01-01', end: '2020-01-02' }], TODAY, { fetchFn }), /Wait a minute/);
    });

    it('reports network failures', async () => {
        const fetchFn: FetchFn = () => Promise.reject(new TypeError('Failed to fetch'));
        await assert.rejects(fetchDaily(1, 2, [{ start: '2020-01-01', end: '2020-01-02' }], TODAY, { fetchFn }), /Could not reach/);
    });

    it('lets aborts propagate untouched', async () => {
        const fetchFn: FetchFn = () => Promise.reject(new DOMException('Aborted', 'AbortError'));
        await assert.rejects(fetchDaily(1, 2, [{ start: '2020-01-01', end: '2020-01-02' }], TODAY, { fetchFn }), { name: 'AbortError' });
    });
});

describe('parseDaily', () => {
    it('keeps nulls from the provider', () => {
        const json = openMeteoDaily(['2026-01-01']) as { daily: Record<string, unknown[]> };
        json.daily.temperature_2m_max = [null];
        const [first] = parseDaily(json);
        assert.equal(first?.tMax, null);
        assert.equal(first.tMin, 5);
    });

    it('rejects malformed responses', () => {
        assert.throws(() => parseDaily({}), ApiError);
        assert.throws(() => parseDaily({ daily: { time: ['2026-01-01'], temperature_2m_max: ['hot'] } }), ApiError);
        assert.throws(() => parseDaily({ daily: { time: ['2026-01-01'], temperature_2m_max: [1, 2] } }), ApiError);
    });
});

describe('searchPlaces', () => {
    const results = {
        results: [
            { name: 'Paris', latitude: 48.85, longitude: 2.35, country: 'France', country_code: 'FR', admin1: 'Île-de-France' },
            { name: 'Paris', latitude: 33.66, longitude: -95.55, country: 'United States', country_code: 'US', admin1: 'Texas' },
        ],
    };

    it('splits a qualifier off the query', () => {
        assert.deepEqual(parseQuery('Paris, Texas'), { name: 'Paris', qualifier: 'Texas' });
        assert.deepEqual(parseQuery(' London '), { name: 'London', qualifier: null });
    });

    it('filters by region, country name or code', async () => {
        const { fetchFn, calls } = fakeFetch(() => Response.json(results));
        const texas = await searchPlaces('Paris, Texas', { fetchFn });
        assert.equal(texas.length, 1);
        assert.equal(texas[0]?.detail, 'Texas, United States');
        assert.equal(calls[0]?.searchParams.get('name'), 'Paris');
        clearCache();
        const usa = await searchPlaces('Paris, USA', { fetchFn });
        assert.equal(usa[0]?.lat, 33.66);
        clearCache();
        const all = await searchPlaces('Paris', { fetchFn });
        assert.equal(all.length, 2);
    });

    it('returns no places when the service finds nothing', async () => {
        const { fetchFn } = fakeFetch(() => Response.json({ generationtime_ms: 0.5 }));
        assert.deepEqual(await searchPlaces('Xyzzyville', { fetchFn }), []);
    });

    it('does not search for a single character', async () => {
        const { fetchFn, calls } = fakeFetch();
        assert.deepEqual(await searchPlaces('P', { fetchFn }), []);
        assert.equal(calls.length, 0);
    });
});

describe('formatCoords', () => {
    it('formats hemispheres', () => {
        assert.equal(formatCoords(51.5072, -0.1276), '51.51°N, 0.13°W');
        assert.equal(formatCoords(-33.87, 151.21), '33.87°S, 151.21°E');
    });
});
