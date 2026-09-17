/**
 * Cloudflare Worker proxy for the OpenWeatherMap API.
 *
 * Keeps the API key server-side: the browser calls this Worker, the Worker
 * adds the key and forwards to OpenWeatherMap. The key is never served to
 * the client, so the static site can be public without exposing it.
 *
 * Deploy instructions: see README.md in this directory.
 */

const OWM_BASE = 'https://api.openweathermap.org';

// Only these routes are proxied, and only these query params are forwarded.
// Without an allowlist the Worker would be an open proxy to the whole
// OpenWeatherMap API, billed to our key.
const ROUTES = {
    '/api/weather': { path: '/data/2.5/weather', params: ['lat', 'lon', 'units'] },
    '/api/geo/direct': { path: '/geo/1.0/direct', params: ['q', 'limit'] },
    '/api/geo/reverse': { path: '/geo/1.0/reverse', params: ['lat', 'lon', 'limit'] }
};

// Cache upstream responses at the edge. Weather does not change by the
// second, and this keeps repeat visitors off our OpenWeatherMap quota.
const EDGE_CACHE_SECONDS = 300;

export default {
    async fetch(request, env) {
        const cors = corsHeaders(request, env);

        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: cors });
        }

        if (request.method !== 'GET') {
            return json({ message: 'Method not allowed' }, 405, cors);
        }

        const url = new URL(request.url);
        const route = ROUTES[url.pathname];

        if (!route) {
            return json({ message: 'Not found' }, 404, cors);
        }

        if (!env.OWM_API_KEY) {
            return json({ message: 'Worker is missing the OWM_API_KEY secret' }, 500, cors);
        }

        const upstream = new URL(OWM_BASE + route.path);
        for (const param of route.params) {
            const value = url.searchParams.get(param);
            if (value !== null) {
                upstream.searchParams.set(param, value);
            }
        }
        upstream.searchParams.set('appid', env.OWM_API_KEY);

        let response;
        try {
            response = await fetch(upstream.toString(), {
                cf: { cacheTtl: EDGE_CACHE_SECONDS, cacheEverything: true }
            });
        } catch (error) {
            return json({ message: 'Upstream request failed' }, 502, cors);
        }

        // Pass the upstream body and status through unchanged so the client
        // sees OpenWeatherMap's own error messages (bad city, bad key, etc).
        return new Response(await response.text(), {
            status: response.status,
            headers: {
                ...cors,
                'Content-Type': 'application/json',
                'Cache-Control': `public, max-age=${EDGE_CACHE_SECONDS}`
            }
        });
    }
};

function corsHeaders(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '')
        .split(',')
        .map(value => value.trim())
        .filter(Boolean);

    // With no ALLOWED_ORIGINS configured, allow any origin — convenient for
    // local development. Set it in wrangler.toml to lock down production.
    const allowOrigin = allowed.length === 0
        ? '*'
        : (allowed.includes(origin) ? origin : allowed[0]);

    return {
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
        Vary: 'Origin'
    };
}

function json(body, status, cors) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...cors, 'Content-Type': 'application/json' }
    });
}
