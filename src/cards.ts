/** DOM builders for timeline cards and the data table. All data goes in via textContent. */
import { chartLabels, comparisonCardLabel, primaryLabel } from './labels.js';
import type { Bucket, Compare, Summary, Unit, View } from './types.js';
import { formatDelta, formatPrecip, formatTemp, formatWind } from './units.js';
import { describeCode } from './weather-codes.js';

export interface RenderContext {
    view: View;
    compare: Compare;
    unit: Unit;
    today: string;
    comparisonName: string;
    locale?: string;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function detail(term: string, value: string): HTMLDivElement {
    const row = el('div');
    row.append(el('dt', undefined, term), el('dd', undefined, value));
    return row;
}

/** Difference in mean temperature, or null when either side lacks data. */
export function bucketDelta(bucket: Bucket): number | null {
    const a = bucket.primary.tMean;
    const b = bucket.comparison.tMean;
    return a !== null && b !== null ? a - b : null;
}

function cardBody(card: HTMLLIElement, summary: Summary, ctx: RenderContext): void {
    if (summary.days === 0) {
        card.classList.add('card-empty');
        card.append(el('p', 'card-nodata', 'No data'));
        return;
    }
    const condition = describeCode(summary.code);
    const icon = el('p', 'card-icon', condition.icon);
    icon.setAttribute('aria-hidden', 'true');
    card.append(icon, el('p', 'card-condition', condition.label));

    const aggregated = ctx.view !== 'daily';
    const temps = el('p', 'card-temps');
    const high = el('span', 'temp-high');
    high.append(el('span', 'visually-hidden', aggregated ? 'Average high ' : 'High '), formatTemp(summary.tMax, ctx.unit));
    const low = el('span', 'temp-low');
    low.append(el('span', 'visually-hidden', aggregated ? ', average low ' : ', low '), formatTemp(summary.tMin, ctx.unit));
    temps.append(high, low);
    card.append(temps);

    const details = el('dl', 'card-details');
    details.append(
        detail(aggregated ? 'Total rain' : 'Rain', formatPrecip(summary.precip, ctx.unit)),
        detail(aggregated ? 'Peak wind' : 'Wind', formatWind(summary.wind, ctx.unit)),
    );
    card.append(details);
}

export function buildPrimaryCard(bucket: Bucket, ctx: RenderContext): HTMLLIElement {
    const card = el('li', 'card');
    const label = primaryLabel(bucket, ctx.view, ctx.today, ctx.locale);
    if (ctx.view === 'daily' && bucket.start === ctx.today) card.classList.add('card-today');
    if (bucket.partial) card.classList.add('card-partial');
    card.append(el('p', 'card-date', label.title), el('p', 'card-sub', label.subtitle));
    cardBody(card, bucket.primary, ctx);

    const delta = bucketDelta(bucket);
    if (delta !== null && bucket.primary.days > 0) {
        const rounded = Math.round(delta * 10) / 10;
        const direction = rounded > 0 ? 'warmer' : rounded < 0 ? 'cooler' : 'same';
        const arrow = direction === 'warmer' ? '▲ ' : direction === 'cooler' ? '▼ ' : '';
        const badge = el('p', `delta delta-${direction}`);
        badge.append(
            el('span', 'delta-value', `${arrow}${formatDelta(delta, ctx.unit)}`),
            document.createTextNode(` vs ${ctx.comparisonName}`),
        );
        card.append(badge);
    }
    return card;
}

export function buildComparisonCard(bucket: Bucket, ctx: RenderContext): HTMLLIElement {
    const card = el('li', 'card card-comparison');
    const label = comparisonCardLabel(bucket, ctx.view, ctx.compare, ctx.locale);
    card.append(el('p', 'card-date', label.title), el('p', 'card-sub', label.subtitle));
    cardBody(card, bucket.comparison, ctx);
    return card;
}

/** Accessible table view of the same data the chart and cards show. */
export function buildTable(table: HTMLTableElement, buckets: Bucket[], ctx: RenderContext, primaryName: string): void {
    table.replaceChildren();
    const caption = el('caption', 'visually-hidden', `Average temperature and rainfall, ${primaryName} vs ${ctx.comparisonName}`);
    const head = el('thead');
    const headRow = el('tr');
    for (const h of [
        'Period',
        `${primaryName} avg`,
        `${ctx.comparisonName} avg`,
        'Difference',
        `${primaryName} rain`,
        `${ctx.comparisonName} rain`,
    ]) {
        const th = el('th', undefined, h);
        th.scope = 'col';
        headRow.append(th);
    }
    head.append(headRow);

    const body = el('tbody');
    for (const bucket of buckets) {
        const row = el('tr');
        const th = el('th', undefined, chartLabels(bucket, ctx.view, ctx.locale).detail);
        th.scope = 'row';
        const delta = bucketDelta(bucket);
        row.append(
            th,
            el('td', undefined, formatTemp(bucket.primary.tMean, ctx.unit)),
            el('td', undefined, formatTemp(bucket.comparison.tMean, ctx.unit)),
            el('td', undefined, delta === null ? '–' : formatDelta(delta, ctx.unit)),
            el('td', undefined, formatPrecip(bucket.primary.precip, ctx.unit)),
            el('td', undefined, formatPrecip(bucket.comparison.precip, ctx.unit)),
        );
        body.append(row);
    }
    table.append(caption, head, body);
}
