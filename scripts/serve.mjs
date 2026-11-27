// Minimal static file server for local development: `npm run serve`.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';

const root = resolve(process.argv[2] ?? '.');
const port = Number(process.env.PORT ?? 8080);
const types = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.map': 'application/json; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
};

createServer(async (req, res) => {
    try {
        const { pathname } = new URL(req.url ?? '/', 'http://localhost');
        let file = normalize(join(root, decodeURIComponent(pathname)));
        if (file !== root && !file.startsWith(root + sep)) {
            res.writeHead(403).end('Forbidden');
            return;
        }
        if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
        const body = await readFile(file);
        res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' }).end(body);
    } catch {
        res.writeHead(404).end('Not found');
    }
}).listen(port, () => {
    console.log(`Weather Timeline running at http://localhost:${port}/`);
});
