/** Dependency-free SVG line chart comparing two series on one shared axis. */

export interface ChartPoint {
    /** Short x-axis label, e.g. "Nov 3". */
    label: string;
    /** Tooltip heading, e.g. "Mon, Nov 3". */
    detail: string;
    primary: number | null;
    comparison: number | null;
}

export interface ChartOptions {
    points: ChartPoint[];
    primaryName: string;
    comparisonName: string;
    /** Appended to values, e.g. "°C". */
    unitSymbol: string;
    /** Accessible description of what is plotted. */
    description: string;
}

const SVG_NS = 'http://www.w3.org/2000/svg';
const MARGIN = { top: 16, right: 76, bottom: 30, left: 44 };
const HEIGHT = 260;

/** Evenly spaced, human-friendly tick values covering [min, max]. */
export function niceTicks(min: number, max: number, target = 5): number[] {
    let lo = min;
    let hi = max;
    if (!Number.isFinite(lo) || !Number.isFinite(hi)) return [];
    if (lo === hi) {
        lo -= 1;
        hi += 1;
    }
    const raw = (hi - lo) / Math.max(1, target);
    const magnitude = 10 ** Math.floor(Math.log10(raw));
    const step = ([1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw) ?? 10 * magnitude);
    const start = Math.floor(lo / step) * step;
    const end = Math.ceil(hi / step) * step;
    const ticks: number[] = [];
    for (let v = start; v <= end + step / 2; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
    return ticks;
}

function svg<K extends keyof SVGElementTagNameMap>(
    tag: K,
    attrs: Record<string, string | number>,
): SVGElementTagNameMap[K] {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
    return el;
}

function html<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
}

function formatValue(value: number | null, unit: string): string {
    return value === null ? '–' : `${value.toFixed(1)}${unit}`;
}

/** Draw the chart into `root`, replacing its contents. Call again on resize. */
export function renderChart(root: HTMLElement, options: ChartOptions): void {
    root.replaceChildren();
    const { points } = options;
    const values = points.flatMap((p) => [p.primary, p.comparison]).filter((v): v is number => v !== null);
    if (points.length === 0 || values.length === 0) {
        root.append(html('p', 'chart-empty', 'No temperature data to chart for this period.'));
        return;
    }

    // Legend (HTML, so it wraps and stays readable at any width).
    const legend = html('ul', 'chart-legend');
    legend.setAttribute('aria-hidden', 'true');
    for (const [name, cls] of [
        [options.primaryName, 'key-primary'],
        [options.comparisonName, 'key-comparison'],
    ] as const) {
        const item = html('li');
        item.append(html('span', `line-key ${cls}`), document.createTextNode(name));
        legend.append(item);
    }
    root.append(legend);

    const width = Math.max(300, root.clientWidth || 800);
    const plotW = width - MARGIN.left - MARGIN.right;
    const plotH = HEIGHT - MARGIN.top - MARGIN.bottom;
    const ticks = niceTicks(Math.min(...values), Math.max(...values));
    const y0 = ticks[0] ?? 0;
    const y1 = ticks[ticks.length - 1] ?? 1;
    const n = points.length;
    const x = (i: number): number => MARGIN.left + (n === 1 ? plotW / 2 : (i * plotW) / (n - 1));
    const y = (v: number): number => MARGIN.top + plotH - ((v - y0) / (y1 - y0 || 1)) * plotH;

    const chart = svg('svg', {
        width,
        height: HEIGHT,
        viewBox: `0 0 ${width} ${HEIGHT}`,
        class: 'chart-svg',
        role: 'img',
        tabindex: 0,
        'aria-label': `${options.description} Use the left and right arrow keys to read values.`,
    });

    // Grid and y-axis labels.
    for (const t of ticks) {
        chart.append(svg('line', { x1: MARGIN.left, x2: MARGIN.left + plotW, y1: y(t), y2: y(t), class: 'chart-grid' }));
        const label = svg('text', { x: MARGIN.left - 8, y: y(t), class: 'chart-axis', 'text-anchor': 'end', 'dominant-baseline': 'middle' });
        label.textContent = `${t}°`;
        chart.append(label);
    }

    // X-axis labels, thinned to fit.
    const maxLabels = Math.max(2, Math.floor(plotW / 72));
    const every = Math.ceil(n / maxLabels);
    points.forEach((p, i) => {
        if (i % every !== 0) return;
        const label = svg('text', { x: x(i), y: HEIGHT - 8, class: 'chart-axis', 'text-anchor': 'middle' });
        label.textContent = p.label;
        chart.append(label);
    });

    // Series: comparison first so the primary line draws on top.
    const primarySeries = { key: 'primary' as const, cls: 'series-primary', keyCls: 'key-primary', name: options.primaryName };
    const comparisonSeries = {
        key: 'comparison' as const,
        cls: 'series-comparison',
        keyCls: 'key-comparison',
        name: options.comparisonName,
    };
    const series = [comparisonSeries, primarySeries];
    const ends: { name: string; y: number }[] = [];
    for (const s of series) {
        let d = '';
        let penDown = false;
        let last: { i: number; v: number } | null = null;
        points.forEach((p, i) => {
            const v = p[s.key];
            if (v === null) {
                penDown = false;
                return;
            }
            d += `${penDown ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`;
            penDown = true;
            last = { i, v };
        });
        if (d) chart.append(svg('path', { d, class: `chart-line ${s.cls}` }));
        if (n <= 45) {
            points.forEach((p, i) => {
                const v = p[s.key];
                if (v !== null) chart.append(svg('circle', { cx: x(i), cy: y(v), r: 4, class: `chart-dot ${s.cls}` }));
            });
        }
        const end = last as { i: number; v: number } | null;
        if (end) ends.push({ name: s.name, y: y(end.v) });
    }

    // Direct labels at the right edge, nudged apart if they collide.
    if (ends.length === 2) {
        const [a, b] = ends as [{ name: string; y: number }, { name: string; y: number }];
        const gap = 14 - Math.abs(a.y - b.y);
        if (gap > 0) {
            const up = a.y <= b.y ? a : b;
            const down = up === a ? b : a;
            up.y -= gap / 2;
            down.y += gap / 2;
        }
    }
    for (const e of ends) {
        const label = svg('text', { x: MARGIN.left + plotW + 8, y: e.y, class: 'chart-direct', 'dominant-baseline': 'middle' });
        label.textContent = e.name;
        chart.append(label);
    }

    // Crosshair and tooltip.
    const crosshair = svg('line', { y1: MARGIN.top, y2: MARGIN.top + plotH, class: 'chart-crosshair', visibility: 'hidden' });
    chart.append(crosshair);
    const hit = svg('rect', { x: MARGIN.left - 10, y: 0, width: plotW + 20, height: HEIGHT, class: 'chart-hit' });
    chart.append(hit);

    const tooltip = html('div', 'chart-tooltip');
    tooltip.hidden = true;
    const status = html('p', 'visually-hidden');
    status.setAttribute('aria-live', 'polite');

    let active = -1;
    const show = (i: number): void => {
        const p = points[i];
        if (!p) return;
        active = i;
        const cx = x(i);
        crosshair.setAttribute('x1', String(cx));
        crosshair.setAttribute('x2', String(cx));
        crosshair.setAttribute('visibility', 'visible');
        tooltip.replaceChildren(html('p', 'tooltip-heading', p.detail));
        for (const s of [primarySeries, comparisonSeries]) {
            const row = html('p', 'tooltip-row');
            row.append(
                html('span', `line-key ${s.keyCls}`),
                html('strong', undefined, formatValue(p[s.key], options.unitSymbol)),
                html('span', 'tooltip-name', s.name),
            );
            tooltip.append(row);
        }
        tooltip.hidden = false;
        const tipWidth = tooltip.offsetWidth || 160;
        const left = cx + 12 + tipWidth > width ? cx - 12 - tipWidth : cx + 12;
        tooltip.style.left = `${Math.max(0, left)}px`;
        status.textContent = `${p.detail}: ${options.primaryName} ${formatValue(p.primary, options.unitSymbol)}, ${options.comparisonName} ${formatValue(p.comparison, options.unitSymbol)}`;
    };
    const hide = (): void => {
        crosshair.setAttribute('visibility', 'hidden');
        tooltip.hidden = true;
    };
    const indexAt = (clientX: number): number => {
        const rect = chart.getBoundingClientRect();
        const px = clientX - rect.left;
        if (n === 1) return 0;
        return Math.min(n - 1, Math.max(0, Math.round(((px - MARGIN.left) / plotW) * (n - 1))));
    };

    hit.addEventListener('pointermove', (e) => { show(indexAt(e.clientX)); });
    hit.addEventListener('pointerleave', hide);
    chart.addEventListener('focus', () => { show(active >= 0 ? active : n - 1); });
    chart.addEventListener('blur', hide);
    chart.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            const next = active + (e.key === 'ArrowLeft' ? -1 : 1);
            show(Math.min(n - 1, Math.max(0, next)));
        } else if (e.key === 'Home' || e.key === 'End') {
            e.preventDefault();
            show(e.key === 'Home' ? 0 : n - 1);
        }
    });

    const frame = html('div', 'chart-frame');
    frame.append(chart, tooltip);
    root.append(frame, status);
}
