#!/usr/bin/env node
/* Dependency-free preview checks for the Speedle hub. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pages = ['index.html', 'zh/index.html', '404.html'];
const results = [];

function abs(rel) { return path.join(root, rel); }
function text(rel) { return fs.readFileSync(abs(rel), 'utf8'); }
function exists(rel) { return fs.existsSync(abs(rel)); }
function assert(condition, message) { if (!condition) throw new Error(message); }

function check(name, fn) {
  try {
    const detail = fn();
    results.push({ ok: true, name, detail });
  } catch (error) {
    results.push({ ok: false, name, detail: error.message });
  }
}

/* Files and preview controls */
for (const page of pages) {
  check(`page exists: ${page}`, () => {
    assert(fs.existsSync(abs(page)), `${page} is missing`);
    return page;
  });
}
check('.nojekyll exists', () => {
  assert(fs.existsSync(abs('.nojekyll')), '.nojekyll is missing');
  return '.nojekyll';
});
check('CNAME is exactly preview.speedle.io', () => {
  const value = text('CNAME').trim();
  assert(value === 'preview.speedle.io', `expected preview.speedle.io, got ${JSON.stringify(value)}`);
  return value;
});
check('robots.txt disallows every path', () => {
  const value = text('robots.txt').replace(/\r\n/g, '\n').trim();
  assert(value === 'User-agent: *\nDisallow: /', `unexpected robots.txt:\n${value}`);
  return 'User-agent: * / Disallow: /';
});
check('no sitemap.xml in the preview', () => {
  assert(!exists('sitemap.xml'), 'sitemap.xml must not exist in the preview');
  return 'absent';
});
check('no llms.txt in the preview', () => {
  assert(!exists('llms.txt'), 'llms.txt must not exist in the preview');
  return 'absent';
});
for (const asset of ['assets/styles.css', 'assets/site.js', 'favicon.svg', 'favicon.ico', 'apple-touch-icon.png']) {
  check(`asset exists: ${asset}`, () => {
    assert(fs.existsSync(abs(asset)), `${asset} is missing`);
    return asset;
  });
}

/* Per-page preview safety and basics */
for (const page of pages) {
  check(`${page}: robots noindex, nofollow`, () => {
    const match = text(page).match(/<meta\s+name=["']robots["']\s+content=["']([^"']*)["']/i);
    assert(match, 'robots meta is missing');
    const value = match[1].toLowerCase();
    assert(value.includes('noindex'), `robots meta lacks noindex: ${match[1]}`);
    assert(value.includes('nofollow'), `robots meta lacks nofollow: ${match[1]}`);
    return match[1];
  });
  check(`${page}: preview ribbon is enabled`, () => {
    const html = text(page);
    assert(/<body[^>]*\bclass=["'][^"']*\bis-preview\b/.test(html), 'body lacks the is-preview class');
    assert(/class=["']preview-ribbon["']/.test(html), 'preview ribbon is missing');
    return 'body.is-preview + .preview-ribbon';
  });
  check(`${page}: no analytics beacon`, () => {
    assert(!/cloudflareinsights|googletagmanager|gtag\(/i.test(text(page)), 'analytics or beacon found');
    return 'none';
  });
  check(`${page}: canonical, hreflang and og:url stay commented out`, () => {
    const active = text(page).replace(/<!--[\s\S]*?-->/g, '');
    assert(!/<link[^>]+rel=["']canonical["']/i.test(active), 'active canonical link found');
    assert(!/<link[^>]+hreflang=/i.test(active), 'active hreflang link found');
    assert(!/<meta[^>]+property=["']og:url["']/i.test(active), 'active og:url found');
    return 'commented out with TODO(launch)';
  });
  check(`${page}: no OG image`, () => {
    assert(!/<meta[^>]+property=["']og:image/i.test(text(page)), 'og:image must not be set yet');
    return 'none';
  });
  check(`${page}: title has no trailing full stop`, () => {
    const match = text(page).match(/<title>([^<]*)<\/title>/i);
    assert(match, '<title> is missing');
    const value = match[1].trim();
    assert(!/[.。]\s*$/.test(value), `title ends with a full stop: ${value}`);
    return value;
  });
  check(`${page}: every image has alt text`, () => {
    const tags = text(page).match(/<img\b[^>]*>/gi) || [];
    for (const tag of tags) {
      const alt = tag.match(/\balt=["']([^"']*)["']/i);
      assert(alt && alt[1].trim(), `image without alt text: ${tag}`);
    }
    return `${tags.length} image(s) checked`;
  });
}

check('the two language pages switch to each other', () => {
  assert(/href=["']\/zh\/["']/.test(text('index.html')), 'English page does not link /zh/');
  assert(/href=["']\/["']/.test(text('zh/index.html')), 'Chinese page does not link /');
  return 'EN -> /zh/, ZH -> /';
});
check('English cross-site links use English URLs', () => {
  const bad = [];
  for (const match of text('index.html').matchAll(/href=["'](https:\/\/(?:engine|cloud|ai)\.speedle\.io[^"']*)["']/g)) {
    if (/\/(?:zh|zh-CN)(?:\/|$)/.test(match[1])) bad.push(match[1]);
  }
  assert(bad.length === 0, bad.join(', '));
  return 'Engine, Cloud and AI links stay in English';
});
check('Chinese cross-site links use Chinese URLs', () => {
  const bad = [];
  for (const match of text('zh/index.html').matchAll(/href=["'](https:\/\/[^"']+)["']/g)) {
    const url = match[1];
    if (/^https:\/\/engine\.speedle\.io\//.test(url) && !/^https:\/\/engine\.speedle\.io\/zh\//.test(url)) bad.push(url);
    if (/^https:\/\/cloud\.speedle\.io\//.test(url) && !/^https:\/\/cloud\.speedle\.io\/zh-CN\//.test(url)) bad.push(url);
    if (/^https:\/\/ai\.speedle\.io\//.test(url) && !/^https:\/\/ai\.speedle\.io\/zh\//.test(url)) bad.push(url);
  }
  assert(bad.length === 0, bad.join(', '));
  return 'Engine /zh/, Cloud /zh-CN/, AI /zh/';
});

/* Links: internal targets resolve, externals are https */
const hrefPattern = /\b(?:href|src)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
let internalCount = 0;
let externalCount = 0;
let anchorCount = 0;
const linkFailures = [];
const externalFailures = [];

function resolveTarget(page, rawPath) {
  let target;
  if (rawPath.startsWith('/')) {
    target = path.resolve(root, `.${rawPath}`);
  } else {
    target = path.resolve(path.dirname(abs(page)), rawPath);
  }
  const prefix = root + path.sep;
  assert(target === root || target.startsWith(prefix), `link escapes the repository root: ${rawPath}`);
  if (target === root) {
    assert(fs.existsSync(path.join(root, 'index.html')), 'repository root has no index.html');
    return path.join(root, 'index.html');
  }
  if (fs.existsSync(target) && fs.statSync(target).isFile()) return target;
  const candidates = [];
  if (!path.extname(target)) candidates.push(`${target}.html`);
  candidates.push(path.join(target, 'index.html'));
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  throw new Error(`target not found: ${rawPath}`);
}

for (const page of pages) {
  const html = text(page);
  for (const match of html.matchAll(hrefPattern)) {
    const url = (match[1] ?? match[2] ?? '').trim();
    if (!url) continue;
    if (/^(mailto:|tel:|data:)/i.test(url)) { externalCount += 1; continue; }
    if (/^http:\/\//i.test(url) || /^\/\//.test(url)) {
      externalFailures.push(`${page}: ${url}`);
      continue;
    }
    if (/^https:\/\//i.test(url)) { externalCount += 1; continue; }
    if (url.startsWith('#')) {
      const id = decodeURIComponent(url.slice(1));
      if (!id) { anchorCount += 1; continue; }
      if (!new RegExp(`\\bid=["']${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`).test(html)) {
        linkFailures.push(`${page}: missing anchor #${id}`);
        continue;
      }
      anchorCount += 1;
      continue;
    }
    const [withoutHash, hash = ''] = url.split('#');
    const rawPath = withoutHash.split('?')[0];
    try {
      const target = resolveTarget(page, rawPath || page);
      if (hash) {
        const id = decodeURIComponent(hash);
        const targetHtml = fs.readFileSync(target, 'utf8');
        assert(new RegExp(`\\bid=["']${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`).test(targetHtml), `${page}: ${url} has no target id #${id}`);
      }
      internalCount += 1;
    } catch (error) {
      linkFailures.push(`${page}: ${url} (${error.message})`);
    }
  }
}
check('internal links resolve', () => {
  assert(linkFailures.length === 0, linkFailures.join('; '));
  return `${internalCount} internal target(s)`;
});
check('in-page anchors resolve', () => `${anchorCount} anchor(s)`);
check('external links use https', () => {
  assert(externalFailures.length === 0, externalFailures.join('; '));
  return `${externalCount} external URL(s)`;
});
check('stylesheets and scripts load no external resources', () => {
  const css = text('assets/styles.css');
  const js = text('assets/site.js');
  assert(!/url\(\s*["']?https?:/i.test(css), 'CSS loads an external URL');
  assert(!/https?:\/\/(?!github\.com|engine\.speedle\.io|cloud\.speedle\.io|ai\.speedle\.io)/i.test(js), 'JS loads an unexpected external URL');
  return 'none';
});

/* English and Chinese pages carry the same sections */
check('EN and ZH have the same sections', () => {
  const sections = (page) => [...text(page).matchAll(/<section\b[^>]*\bid=["']([^"']+)["']/gi)].map((m) => m[1]).sort();
  const en = sections('index.html');
  const zh = sections('zh/index.html');
  assert(en.length > 0, 'no sections found in index.html');
  assert(JSON.stringify(en) === JSON.stringify(zh), `EN [${en.join(', ')}] != ZH [${zh.join(', ')}]`);
  return en.join(', ');
});
check('EN and ZH have matching heading counts', () => {
  const counts = (page) => [2, 3].map((level) => (text(page).match(new RegExp(`<h${level}\\b`, 'gi')) || []).length);
  const en = counts('index.html');
  const zh = counts('zh/index.html');
  assert(JSON.stringify(en) === JSON.stringify(zh), `EN h2/h3 ${en} != ZH h2/h3 ${zh}`);
  return `h2 ${en[0]}, h3 ${en[1]}`;
});
check('EN and ZH use the same section order', () => {
  const sections = (page) => [...text(page).matchAll(/<section\b[^>]*\bid=["']([^"']+)["']/gi)].map((m) => m[1]);
  assert(JSON.stringify(sections('index.html')) === JSON.stringify(sections('zh/index.html')), 'section order differs');
  return sections('index.html').join(' -> ');
});

/* Report */
for (const result of results) {
  const prefix = result.ok ? 'ok  ' : 'FAIL';
  console.log(`${prefix} ${result.name} — ${result.detail}`);
}
const failures = results.filter((result) => !result.ok);
console.log('');
if (failures.length) {
  console.error(`${failures.length} check(s) failed.`);
  process.exit(1);
}
console.log(`All ${results.length} checks passed.`);
