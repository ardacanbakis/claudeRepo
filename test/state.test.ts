import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { fromQuery, isPlace, loadPrefs, savePrefs, type ShareableState, toQuery, validateRange } from '../src/state.js';

const TODAY = '2026-11-27';

class MemoryStorage implements Storage {
    private items = new Map<string, string>();
    get length(): number {
        return this.items.size;
    }
    clear(): void {
        this.items.clear();
    }
    getItem(key: string): string | null {
        return this.items.get(key) ?? null;
    }
    key(index: number): string | null {
        return [...this.items.keys()][index] ?? null;
    }
    removeItem(key: string): void {
        this.items.delete(key);
    }
    setItem(key: string, value: string): void {
        this.items.set(key, value);
    }
}

describe('URL state', () => {
    it('round-trips place, view, custom range and comparison', () => {
        const state: ShareableState = {
            place: { name: 'Paris', detail: 'Texas, United States', lat: 33.6609, lon: -95.5555 },
            view: 'weekly',
            range: { start: '2026-01-01', end: '2026-03-31' },
            compare: { kind: 'year', year: 2019 },
        };
        assert.deepEqual(fromQuery(toQuery(state), TODAY), state);
    });

    it('round-trips the average comparison and omits defaults', () => {
        const state: ShareableState = { place: null, view: 'daily', range: null, compare: { kind: 'average' } };
        assert.equal(toQuery(state), 'cmp=avg');
        assert.deepEqual(fromQuery('cmp=avg', TODAY), state);
    });

    it('ignores invalid values', () => {
        const s = fromQuery('lat=200&lon=0&view=hourly&from=2026-02-30&to=2026-03-01&cmp=2030', TODAY);
        assert.deepEqual(s, { place: null, view: 'daily', range: null, compare: { kind: 'previous' } });
    });
});

describe('validateRange', () => {
    it('accepts a normal range', () => {
        assert.equal(validateRange({ start: '2026-01-01', end: '2026-02-01' }, TODAY), null);
    });
    it('rejects reversed, future, too early and too long ranges', () => {
        assert.match(validateRange({ start: '2026-02-01', end: '2026-01-01' }, TODAY) ?? '', /before/);
        assert.match(validateRange({ start: '2026-11-01', end: '2026-12-01' }, TODAY) ?? '', /future/);
        assert.match(validateRange({ start: '1930-01-01', end: '1930-02-01' }, TODAY) ?? '', /1941/);
        assert.match(validateRange({ start: '2020-01-01', end: '2026-01-01' }, TODAY) ?? '', /731/);
    });
});

describe('preferences', () => {
    it('persists and restores preferences, dropping invalid places', () => {
        const storage = new MemoryStorage();
        const place = { name: 'Oslo', detail: 'Norway', lat: 59.91, lon: 10.75 };
        savePrefs({ unit: 'imperial', theme: 'dark', lastPlace: place, saved: [place] }, storage);
        assert.deepEqual(loadPrefs(storage), { unit: 'imperial', theme: 'dark', lastPlace: place, saved: [place] });

        storage.setItem('weather-timeline:prefs:v1', JSON.stringify({ unit: 'kelvin', saved: [{ name: 'x' }, place] }));
        const prefs = loadPrefs(storage);
        assert.equal(prefs.unit, 'metric');
        assert.deepEqual(prefs.saved, [place]);
    });

    it('removes the old OpenWeatherMap key and survives corrupt storage', () => {
        const storage = new MemoryStorage();
        storage.setItem('openweather_api_key', 'secret');
        storage.setItem('weather-timeline:prefs:v1', '{not json');
        assert.equal(loadPrefs(storage).theme, 'system');
        assert.equal(storage.getItem('openweather_api_key'), null);
    });

    it('works without storage', () => {
        assert.equal(loadPrefs(null).unit, 'metric');
        assert.doesNotThrow(() => { savePrefs(loadPrefs(null), null); });
    });

    it('validates places', () => {
        assert.equal(isPlace({ name: 'A', detail: '', lat: 0, lon: 0 }), true);
        assert.equal(isPlace({ name: 'A', detail: '', lat: 95, lon: 0 }), false);
        assert.equal(isPlace(null), false);
    });
});
