import { eachDay } from '../src/dates.js';
import type { DailyWeather } from '../src/types.js';

/** A deterministic day of weather: temperature rises with the day of month. */
export function day(date: string, overrides: Partial<DailyWeather> = {}): DailyWeather {
    const dom = Number(date.slice(8, 10));
    return { date, tMax: 10 + dom / 10, tMin: dom / 10, precip: 1, wind: 20, code: 3, ...overrides };
}

export function dataFor(start: string, end: string, make: (date: string) => DailyWeather = day): Map<string, DailyWeather> {
    return new Map(eachDay(start, end).map((d) => [d, make(d)]));
}

/** An Open-Meteo style daily response for the given dates. */
export function openMeteoDaily(dates: string[], value = 10): unknown {
    return {
        latitude: 51.5,
        longitude: -0.12,
        daily: {
            time: dates,
            weather_code: dates.map(() => 3),
            temperature_2m_max: dates.map(() => value + 5),
            temperature_2m_min: dates.map(() => value - 5),
            precipitation_sum: dates.map(() => 1.5),
            wind_speed_10m_max: dates.map(() => 18),
        },
    };
}
