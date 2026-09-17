# Weather API Proxy (Cloudflare Worker)

Holds the OpenWeatherMap API key server-side so the public site never ships it.

The browser calls this Worker; the Worker adds the key and forwards the request
to OpenWeatherMap. Responses are cached at Cloudflare's edge for 5 minutes,
which keeps repeat visitors off the OpenWeatherMap quota entirely.

## Why this exists

A static site cannot keep a secret. Anything `app.js` needs to call
OpenWeatherMap is readable by anyone who opens DevTools — including a key
injected at build time from a GitHub Actions secret. OpenWeatherMap also has no
HTTP-referrer restriction, so a scraped key works from anywhere.

Moving the call server-side is the only way to publish a working demo without
publishing the key.

## Deploy

You need a free Cloudflare account. From this directory:

```bash
npx wrangler login
npx wrangler deploy
npx wrangler secret put OWM_API_KEY   # paste your key when prompted
```

`wrangler deploy` prints the Worker URL, something like:

```
https://weather-timeline-api.<your-subdomain>.workers.dev
```

## Point the site at it

Set that URL as `API_PROXY_URL` at the top of `../app.js`:

```js
const API_PROXY_URL = 'https://weather-timeline-api.<your-subdomain>.workers.dev';
```

Leave it as `''` to fall back to the original behaviour — each visitor enters
their own key, stored in their browser's `localStorage`. The app supports both
modes; no other code changes are needed.

## Lock down the origins

`wrangler.toml` sets `ALLOWED_ORIGINS` to the GitHub Pages origin. Update it if
you serve the site from somewhere else, then redeploy. Comma-separated, no
trailing slash:

```toml
[vars]
ALLOWED_ORIGINS = "https://ardacanbakis.github.io,http://localhost:8080"
```

This is a CORS restriction, so it stops other *websites* from calling the Worker
from a browser. It does not stop direct `curl` requests — for a free-tier key
that is generally an acceptable tradeoff. If you need more, add Cloudflare rate
limiting on the Worker route.

## Endpoints

Only these routes are proxied, and only the listed query parameters are
forwarded upstream. Without that allowlist the Worker would be an open proxy to
the whole OpenWeatherMap API, billed to your key.

| Worker route       | Upstream              | Params            |
| ------------------ | --------------------- | ----------------- |
| `/api/weather`     | `/data/2.5/weather`   | `lat, lon, units` |
| `/api/geo/direct`  | `/geo/1.0/direct`     | `q, limit`        |
| `/api/geo/reverse` | `/geo/1.0/reverse`    | `lat, lon, limit` |

## Local development

```bash
npx wrangler dev
```

Serves on `http://localhost:8787`. Set `API_PROXY_URL` to that while developing.
`wrangler dev` reads the same secret once you have set it.
