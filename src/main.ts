import {
    AVERAGE_YEARS,
    buildBuckets,
    comparisonLabel,
    comparisonRange,
    comparisonSource,
    periodSummary,
    presetRange,
    primaryLabel,
    widestPresetRange,
} from './aggregate.js';
import { ApiError, fetchDaily, formatCoords, isAbortError, searchPlaces } from './api.js';
import { buildComparisonCard, buildPrimaryCard, buildTable, type RenderContext } from './cards.js';
import { type ChartOptions, renderChart } from './chart.js';
import { EARLIEST_DATE, localTodayISO, maxISO, minISO, yearOf } from './dates.js';
import { chartLabels, periodText } from './labels.js';
import {
    EARLIEST_START,
    fromQuery,
    isValidCompareYear,
    loadPrefs,
    MAX_SAVED_PLACES,
    type Prefs,
    samePlace,
    savePrefs,
    type ShareableState,
    toQuery,
    validateRange,
} from './state.js';
import type { Compare, DailyWeather, DateRange, Place, Theme, View } from './types.js';
import { convertTemp, formatDelta, formatPrecip, formatTemp, tempSymbol } from './units.js';

function byId<T extends HTMLElement>(id: string, type: { new (): T; prototype: T }): T {
    const node = document.getElementById(id);
    if (!(node instanceof type)) throw new Error(`Missing element #${id}`);
    return node;
}

function contains(outer: DateRange, inner: DateRange): boolean {
    return outer.start <= inner.start && outer.end >= inner.end;
}

type NoticeKind = 'error' | 'success' | 'info';

class WeatherTimelineApp {
    private readonly today = localTodayISO();
    private readonly locale = navigator.language;
    private prefs: Prefs = loadPrefs();
    private state: ShareableState;

    /** Downloaded days for `dataPlace`, keyed by date, and the ranges they cover. */
    private data = new Map<string, DailyWeather>();
    private loaded: DateRange[] = [];
    private dataPlace: Place | null = null;

    private controller: AbortController | null = null;
    private loadToken = 0;
    private chartOptions: ChartOptions | null = null;
    private chartWidth = 0;
    private otherMatches: Place[] = [];
    private filledRangeKey = '';

    private readonly els = {
        searchForm: byId('searchForm', HTMLFormElement),
        citySearch: byId('citySearch', HTMLInputElement),
        searchBtn: byId('searchBtn', HTMLButtonElement),
        geolocationBtn: byId('geolocationBtn', HTMLButtonElement),
        otherMatches: byId('otherMatches', HTMLDivElement),
        compareSelect: byId('compareSelect', HTMLSelectElement),
        rangeDetails: byId('rangeDetails', HTMLDetailsElement),
        rangeForm: byId('rangeForm', HTMLFormElement),
        rangeStart: byId('rangeStart', HTMLInputElement),
        rangeEnd: byId('rangeEnd', HTMLInputElement),
        rangeReset: byId('rangeReset', HTMLButtonElement),
        themeSelect: byId('themeSelect', HTMLSelectElement),
        savedPlaces: byId('savedPlaces', HTMLElement),
        savedList: byId('savedList', HTMLUListElement),
        notice: byId('notice', HTMLDivElement),
        emptyState: byId('emptyState', HTMLDivElement),
        loading: byId('loadingIndicator', HTMLDivElement),
        results: byId('resultsContent', HTMLDivElement),
        placeName: byId('placeName', HTMLHeadingElement),
        placeDetail: byId('placeDetail', HTMLParagraphElement),
        saveBtn: byId('saveBtn', HTMLButtonElement),
        shareBtn: byId('shareBtn', HTMLButtonElement),
        periodSummary: byId('periodSummary', HTMLParagraphElement),
        chartTitle: byId('chartTitle', HTMLHeadingElement),
        chart: byId('chart', HTMLDivElement),
        dataTable: byId('dataTable', HTMLTableElement),
        primaryTitle: byId('primaryTitle', HTMLHeadingElement),
        primaryRange: byId('primaryRangeLabel', HTMLSpanElement),
        comparisonTitle: byId('comparisonTitle', HTMLHeadingElement),
        comparisonRange: byId('comparisonRangeLabel', HTMLSpanElement),
        primaryScroll: byId('primaryTimeline', HTMLDivElement),
        comparisonScroll: byId('comparisonTimeline', HTMLDivElement),
        primaryTrack: byId('primaryTrack', HTMLOListElement),
        comparisonTrack: byId('comparisonTrack', HTMLOListElement),
    };

    constructor() {
        this.state = fromQuery(window.location.search, this.today);
        if (!this.state.place && this.prefs.lastPlace) this.state.place = this.prefs.lastPlace;

        this.bindEvents();
        this.applyTheme();
        this.syncControls();
        this.renderSaved();

        if (this.state.place) void this.refresh();
        else this.showEmpty();
    }

    // -----------------------------------------------------------------------
    // Derived state

    private activeRange(): DateRange {
        return this.state.range ?? presetRange(this.state.view, this.today);
    }

    /** Ranges to download. Presets download the widest window so view switches are free. */
    private neededRanges(): DateRange[] {
        const primary = this.state.range ?? widestPresetRange(this.today);
        return [primary, comparisonRange(primary, this.state.compare)].map((r) => ({
            start: maxISO(r.start, EARLIEST_DATE),
            end: minISO(r.end, this.today),
        }));
    }

    private isLoaded(range: DateRange): boolean {
        return range.start > range.end || this.loaded.some((l) => contains(l, range));
    }

    // -----------------------------------------------------------------------
    // Events

    private bindEvents(): void {
        const { els } = this;

        els.searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            void this.search(els.citySearch.value);
        });
        els.geolocationBtn.addEventListener('click', () => { this.useGeolocation(); });

        document.querySelectorAll<HTMLButtonElement>('[data-view]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view as View;
                if (view === this.state.view) return;
                this.state.view = view;
                this.syncControls();
                void this.refresh();
            });
        });

        document.querySelectorAll<HTMLButtonElement>('[data-unit]').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.prefs.unit = btn.dataset.unit === 'imperial' ? 'imperial' : 'metric';
                savePrefs(this.prefs);
                this.syncControls();
                if (!els.results.hidden) this.render();
            });
        });

        els.themeSelect.addEventListener('change', () => {
            const value = els.themeSelect.value;
            this.prefs.theme = value === 'light' || value === 'dark' ? value : 'system';
            savePrefs(this.prefs);
            this.applyTheme();
        });

        els.compareSelect.addEventListener('change', () => {
            this.state.compare = this.parseCompare(els.compareSelect.value);
            void this.refresh();
        });

        els.rangeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const range = { start: els.rangeStart.value, end: els.rangeEnd.value };
            const error = validateRange(range, this.today);
            if (error) {
                this.showNotice(error, 'error');
                return;
            }
            this.state.range = range;
            if (this.state.compare.kind === 'year' && !isValidCompareYear(this.state.compare.year, range.end)) {
                this.state.compare = { kind: 'previous' };
            }
            this.syncControls();
            void this.refresh();
        });
        els.rangeReset.addEventListener('click', () => {
            this.state.range = null;
            this.syncControls();
            void this.refresh();
        });

        els.saveBtn.addEventListener('click', () => { this.toggleSaved(); });
        els.shareBtn.addEventListener('click', () => void this.copyLink());

        this.setupScrolling();

        new ResizeObserver(() => {
            const width = els.chart.clientWidth;
            if (this.chartOptions && width !== this.chartWidth) {
                this.chartWidth = width;
                renderChart(els.chart, this.chartOptions);
            }
        }).observe(els.chart);
    }

    private setupScrolling(): void {
        const { primaryScroll: a, comparisonScroll: b } = this.els;
        // Keep both rows at the same scroll position so each column lines up.
        let leader: HTMLElement | null = null;
        let release = 0;
        const follow = (source: HTMLElement, target: HTMLElement) => (): void => {
            if (leader && leader !== source) return;
            leader = source;
            target.scrollLeft = source.scrollLeft;
            window.clearTimeout(release);
            release = window.setTimeout(() => (leader = null), 150);
        };
        a.addEventListener('scroll', follow(a, b), { passive: true });
        b.addEventListener('scroll', follow(b, a), { passive: true });

        document.querySelectorAll<HTMLButtonElement>('.scroll-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.timeline === 'comparison' ? b : a;
                const amount = Math.max(240, target.clientWidth * 0.8) * Number(btn.dataset.dir ?? 1);
                target.scrollBy({ left: amount, behavior: 'smooth' });
            });
        });
    }

    // -----------------------------------------------------------------------
    // Actions

    private async search(query: string): Promise<void> {
        const trimmed = query.trim();
        if (trimmed.length < 2) {
            this.showNotice('Type at least two letters of a place name.', 'error');
            return;
        }
        this.clearNotice();
        this.els.searchBtn.disabled = true;
        try {
            const places = await searchPlaces(trimmed, { language: this.locale.slice(0, 2) || 'en' });
            const [first, ...rest] = places;
            if (!first) {
                this.showNotice(`No place called “${trimmed}” was found. Check the spelling, or add a country: “Paris, France”.`, 'error');
                return;
            }
            this.otherMatches = rest.slice(0, 5);
            this.selectPlace(first);
        } catch (error) {
            this.showNotice(error instanceof ApiError ? error.message : 'Place search failed. Try again.', 'error');
        } finally {
            this.els.searchBtn.disabled = false;
        }
    }

    private useGeolocation(): void {
        if (!('geolocation' in navigator)) {
            this.showNotice('Your browser does not support location. Search for a city instead.', 'error');
            return;
        }
        this.clearNotice();
        this.els.geolocationBtn.disabled = true;
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.els.geolocationBtn.disabled = false;
                const { latitude: lat, longitude: lon } = position.coords;
                this.otherMatches = [];
                this.selectPlace({ name: 'Your location', detail: formatCoords(lat, lon), lat, lon });
            },
            (error) => {
                this.els.geolocationBtn.disabled = false;
                const message =
                    error.code === error.PERMISSION_DENIED
                        ? 'Location access was denied. Allow it in your browser settings, or search for a city.'
                        : 'Your location could not be determined. Search for a city instead.';
                this.showNotice(message, 'error');
            },
            { timeout: 15_000, maximumAge: 600_000 },
        );
    }

    private selectPlace(place: Place): void {
        this.state.place = place;
        this.renderOtherMatches();
        void this.refresh();
    }

    private toggleSaved(): void {
        const place = this.state.place;
        if (!place) return;
        const index = this.prefs.saved.findIndex((p) => samePlace(p, place));
        if (index >= 0) {
            this.prefs.saved.splice(index, 1);
        } else {
            if (this.prefs.saved.length >= MAX_SAVED_PLACES) {
                this.showNotice(`You can save up to ${MAX_SAVED_PLACES} places. Remove one first.`, 'error');
                return;
            }
            this.prefs.saved.push(place);
        }
        savePrefs(this.prefs);
        this.renderSaved();
        this.syncSaveButton();
    }

    private async copyLink(): Promise<void> {
        const url = window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            this.showNotice('Link copied. Anyone who opens it sees this place and period.', 'success');
        } catch {
            this.showNotice(`Copy this link: ${url}`, 'info');
        }
    }

    // -----------------------------------------------------------------------
    // Loading

    private async refresh(): Promise<void> {
        const place = this.state.place;
        if (!place) {
            this.showEmpty();
            return;
        }
        this.updateUrl();
        this.prefs.lastPlace = place;
        savePrefs(this.prefs);
        this.syncControls();

        if (!samePlace(place, this.dataPlace)) {
            this.data = new Map();
            this.loaded = [];
            this.dataPlace = place;
        }

        const missing = this.neededRanges().filter((r) => !this.isLoaded(r));
        // Any in-flight load is now out of date.
        this.controller?.abort();
        const token = ++this.loadToken;

        if (missing.length === 0) {
            this.setLoading(false);
            this.render();
            return;
        }

        const controller = new AbortController();
        this.controller = controller;
        this.setLoading(true);
        this.clearNotice();
        try {
            const days = await fetchDaily(place.lat, place.lon, missing, this.today, { signal: controller.signal });
            if (token !== this.loadToken) return;
            for (const [date, day] of days) this.data.set(date, day);
            this.loaded.push(...missing);
            this.setLoading(false);
            this.render();
        } catch (error) {
            if (token !== this.loadToken || isAbortError(error)) return;
            this.setLoading(false);
            this.els.results.hidden = true;
            this.els.emptyState.hidden = true;
            this.showNotice(
                error instanceof ApiError ? error.message : 'Something went wrong while loading weather data. Try again.',
                'error',
            );
        }
    }

    // -----------------------------------------------------------------------
    // Rendering

    private render(): void {
        const place = this.state.place;
        if (!place) return;
        const { els, state } = this;
        const range = this.activeRange();
        const unit = this.prefs.unit;
        const comparisonName = comparisonLabel(range, state.compare);
        const primaryName = primaryLabel(range);
        const primary = (iso: string): DailyWeather | undefined => this.data.get(iso);
        const comparison = comparisonSource(this.data, range, state.compare);
        const buckets = buildBuckets(range, state.view, primary, comparison);
        const ctx: RenderContext = {
            view: state.view,
            compare: state.compare,
            unit,
            today: this.today,
            comparisonName,
            locale: this.locale,
        };

        els.emptyState.hidden = true;
        els.results.hidden = false;
        els.placeName.textContent = place.name;
        els.placeDetail.textContent = place.detail;
        this.syncSaveButton();

        // Headline summary for the whole period.
        const totals = periodSummary(range, primary, comparison);
        const period = periodText(range.start, range.end, this.locale);
        if (totals.primary.days === 0) {
            els.periodSummary.textContent = `No weather data is available for ${place.name} for ${period}.`;
        } else {
            let headline = `${period}: average ${formatTemp(totals.primary.tMean, unit)}`;
            if (totals.primary.tMean !== null && totals.comparison.tMean !== null) {
                const delta = totals.primary.tMean - totals.comparison.tMean;
                const amount = formatDelta(delta, unit);
                headline += amount.startsWith('±')
                    ? `, the same as ${comparisonName}`
                    : `, ${amount.slice(1)} ${delta > 0 ? 'warmer' : 'cooler'} than ${comparisonName}`;
            }
            const rain = `rain ${formatPrecip(totals.primary.precip, unit)} (${comparisonName}: ${formatPrecip(totals.comparison.precip, unit)})`;
            els.periodSummary.textContent = `${headline}; ${rain}.`;
        }

        // Chart.
        const toUnit = (v: number | null): number | null => (v === null ? null : convertTemp(v, unit));
        els.chartTitle.textContent = `Average temperature (${tempSymbol(unit)})`;
        this.chartOptions = {
            points: buckets.map((b) => ({
                ...chartLabels(b, state.view, this.locale),
                primary: toUnit(b.primary.tMean),
                comparison: toUnit(b.comparison.tMean),
            })),
            primaryName,
            comparisonName,
            unitSymbol: tempSymbol(unit),
            description: `Line chart of ${state.view} average temperature in ${place.name}, ${primaryName} compared with ${comparisonName}.`,
        };
        this.chartWidth = els.chart.clientWidth;
        renderChart(els.chart, this.chartOptions);
        buildTable(els.dataTable, buckets, ctx, primaryName);

        // Timelines.
        els.primaryTitle.textContent = range.end === this.today && !state.range ? 'Recent weather' : 'Selected period';
        els.primaryRange.textContent = primaryName;
        els.comparisonTitle.textContent = state.compare.kind === 'average' ? `${AVERAGE_YEARS}-year average` : 'Compared with';
        els.comparisonRange.textContent = comparisonName;
        els.primaryScroll.setAttribute('aria-label', `${primaryName} timeline`);
        els.comparisonScroll.setAttribute('aria-label', `${comparisonName} timeline`);
        els.primaryTrack.replaceChildren(...buckets.map((b) => buildPrimaryCard(b, ctx)));
        els.comparisonTrack.replaceChildren(...buckets.map((b) => buildComparisonCard(b, ctx)));

        // Show the most recent end of both rows.
        requestAnimationFrame(() => {
            els.primaryScroll.scrollLeft = els.primaryScroll.scrollWidth;
            els.comparisonScroll.scrollLeft = els.comparisonScroll.scrollWidth;
        });
    }

    private renderSaved(): void {
        const { savedList, savedPlaces } = this.els;
        savedList.replaceChildren();
        for (const place of this.prefs.saved) {
            const item = document.createElement('li');
            item.className = 'chip';
            const open = document.createElement('button');
            open.type = 'button';
            open.className = 'chip-main';
            open.textContent = place.name;
            open.title = place.detail;
            open.addEventListener('click', () => {
                this.otherMatches = [];
                this.selectPlace(place);
            });
            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'chip-remove';
            remove.textContent = '×';
            remove.setAttribute('aria-label', `Remove ${place.name} from saved places`);
            remove.addEventListener('click', () => {
                this.prefs.saved = this.prefs.saved.filter((p) => !samePlace(p, place));
                savePrefs(this.prefs);
                this.renderSaved();
                this.syncSaveButton();
            });
            item.append(open, remove);
            savedList.append(item);
        }
        savedPlaces.hidden = this.prefs.saved.length === 0;
    }

    private renderOtherMatches(): void {
        const box = this.els.otherMatches;
        box.replaceChildren();
        if (this.otherMatches.length === 0) {
            box.hidden = true;
            return;
        }
        box.append(document.createTextNode('Not the place you meant? '));
        this.otherMatches.forEach((place, i) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'link-btn';
            btn.textContent = [place.name, place.detail].filter(Boolean).join(', ');
            btn.addEventListener('click', () => {
                this.otherMatches = [];
                this.selectPlace(place);
            });
            if (i > 0) box.append(document.createTextNode(' · '));
            box.append(btn);
        });
        box.hidden = false;
    }

    // -----------------------------------------------------------------------
    // Controls and UI state

    private parseCompare(value: string): Compare {
        if (value === 'average') return { kind: 'average' };
        const year = Number(value);
        if (isValidCompareYear(year, this.activeRange().end)) return { kind: 'year', year };
        return { kind: 'previous' };
    }

    private compareValue(compare: Compare): string {
        return compare.kind === 'year' ? String(compare.year) : compare.kind;
    }

    private syncControls(): void {
        const { els, state } = this;
        document.querySelectorAll<HTMLButtonElement>('[data-view]').forEach((btn) => {
            btn.setAttribute('aria-pressed', String(btn.dataset.view === state.view));
        });
        document.querySelectorAll<HTMLButtonElement>('[data-unit]').forEach((btn) => {
            btn.setAttribute('aria-pressed', String(btn.dataset.unit === this.prefs.unit));
        });
        els.themeSelect.value = this.prefs.theme;

        // Comparison choices depend on the selected period's years.
        const range = this.activeRange();
        const endYear = yearOf(range.end);
        const spanYears = endYear - yearOf(range.start);
        const select = els.compareSelect;
        select.replaceChildren();
        select.append(
            new Option(`Previous year (${comparisonLabel(range, { kind: 'previous' })})`, 'previous'),
            new Option(`${AVERAGE_YEARS}-year average (${endYear - AVERAGE_YEARS}–${endYear - 1})`, 'average'),
        );
        const group = document.createElement('optgroup');
        group.label = 'A specific year';
        for (let year = endYear - 2; year >= yearOf(EARLIEST_DATE) + spanYears; year--) {
            group.append(new Option(String(year), String(year)));
        }
        select.append(group);
        select.value = this.compareValue(state.compare);

        els.rangeStart.min = EARLIEST_START;
        els.rangeEnd.min = EARLIEST_START;
        els.rangeStart.max = this.today;
        els.rangeEnd.max = this.today;
        // Prefill with the period on screen, but only when it changes, so half-typed dates survive.
        const rangeKey = `${range.start}/${range.end}`;
        if (rangeKey !== this.filledRangeKey) {
            this.fillRangeInputs(range);
            this.filledRangeKey = rangeKey;
        }
        if (state.range) els.rangeDetails.open = true;
        els.rangeReset.disabled = !state.range;
    }

    private fillRangeInputs(range: DateRange): void {
        this.els.rangeStart.value = range.start;
        this.els.rangeEnd.value = range.end;
    }

    private syncSaveButton(): void {
        const saved = this.prefs.saved.some((p) => samePlace(p, this.state.place));
        this.els.saveBtn.setAttribute('aria-pressed', String(saved));
        this.els.saveBtn.textContent = saved ? '★ Saved' : '☆ Save place';
    }

    private applyTheme(): void {
        const theme: Theme = this.prefs.theme;
        if (theme === 'system') delete document.documentElement.dataset.theme;
        else document.documentElement.dataset.theme = theme;
    }

    private updateUrl(): void {
        const query = toQuery(this.state);
        const url = `${window.location.pathname}${query ? `?${query}` : ''}`;
        window.history.replaceState(null, '', url);
    }

    private setLoading(loading: boolean): void {
        this.els.loading.hidden = !loading;
        if (loading) {
            this.els.results.hidden = true;
            this.els.emptyState.hidden = true;
        }
    }

    private showEmpty(): void {
        this.els.emptyState.hidden = false;
        this.els.results.hidden = true;
        this.els.loading.hidden = true;
    }

    private noticeTimer = 0;

    private showNotice(message: string, kind: NoticeKind): void {
        window.clearTimeout(this.noticeTimer);
        const { notice } = this.els;
        notice.className = `notice notice-${kind}`;
        notice.textContent = message;
        // Errors stay until the next action; confirmations fade.
        if (kind === 'success') this.noticeTimer = window.setTimeout(() => { this.clearNotice(); }, 4000);
    }

    private clearNotice(): void {
        window.clearTimeout(this.noticeTimer);
        this.els.notice.className = 'notice';
        this.els.notice.textContent = '';
    }
}

document.documentElement.classList.add('js');
new WeatherTimelineApp();
