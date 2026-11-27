// Collect the files the browser needs into _site/ for GitHub Pages.
import { cp, mkdir, rm } from 'node:fs/promises';

await rm('_site', { recursive: true, force: true });
await mkdir('_site/dist', { recursive: true });
await cp('index.html', '_site/index.html');
await cp('styles.css', '_site/styles.css');
await cp('dist/src', '_site/dist/src', { recursive: true });
console.log('Site written to _site/');
