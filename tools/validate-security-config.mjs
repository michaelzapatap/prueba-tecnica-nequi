import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const cordovaConfig = await readFile(new URL('../config.xml', import.meta.url), 'utf8');
const indexHtml = await readFile(new URL('../src/index.html', import.meta.url), 'utf8');

const allowedFirebaseOrigins = [
  'https://firebaseinstallations.googleapis.com',
  'https://firebaseremoteconfig.googleapis.com',
];

assert.doesNotMatch(cordovaConfig, /<access\s+origin=["']\*["']/u);
assert.doesNotMatch(cordovaConfig, /<allow-intent\s+href=["']https?:\/\/\*\/\*["']/u);

for (const origin of allowedFirebaseOrigins) {
  assert.ok(cordovaConfig.includes('<access origin="' + origin + '" />'));
  assert.match(indexHtml, new RegExp('connect-src[^;]*' + origin));
}

assert.match(indexHtml, /http-equiv=["']Content-Security-Policy["']/u);
assert.match(indexHtml, /default-src\s+'self'/u);
assert.match(indexHtml, /object-src\s+'none'/u);
assert.doesNotMatch(indexHtml, /connect-src[^;"']*\*/u);

console.log('Cordova allowlist and Content Security Policy are restricted and valid.');
