import type { Unit } from './types.js';

const DASH = '–';

export function convertTemp(celsius: number, unit: Unit): number {
    return unit === 'imperial' ? (celsius * 9) / 5 + 32 : celsius;
}

export function tempSymbol(unit: Unit): string {
    return unit === 'imperial' ? '°F' : '°C';
}

export function formatTemp(celsius: number | null, unit: Unit, withSymbol = true): string {
    if (celsius === null) return DASH;
    const value = Math.round(convertTemp(celsius, unit));
    // Avoid "-0°".
    const shown = Object.is(value, -0) ? 0 : value;
    return `${shown}${withSymbol ? tempSymbol(unit) : '°'}`;
}

/** A temperature difference: scaled but not offset when converting to °F. */
export function formatDelta(deltaCelsius: number, unit: Unit): string {
    const value = unit === 'imperial' ? (deltaCelsius * 9) / 5 : deltaCelsius;
    const rounded = Math.round(value * 10) / 10;
    if (rounded === 0) return `±0${tempSymbol(unit)}`;
    const sign = rounded > 0 ? '+' : '−';
    return `${sign}${Math.abs(rounded).toFixed(1)}${tempSymbol(unit)}`;
}

export function formatPrecip(mm: number | null, unit: Unit): string {
    if (mm === null) return DASH;
    if (unit === 'imperial') return `${(mm / 25.4).toFixed(2)} in`;
    return `${mm < 10 ? mm.toFixed(1) : Math.round(mm)} mm`;
}

export function formatWind(kmh: number | null, unit: Unit): string {
    if (kmh === null) return DASH;
    if (unit === 'imperial') return `${Math.round(kmh / 1.609344)} mph`;
    return `${Math.round(kmh)} km/h`;
}
