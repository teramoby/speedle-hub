#!/usr/bin/env node
/* Dependency-free preview checks for the Speedle hub. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pages = ['index.html', 'zh/index.html', 'ja/index.html', 'ko/index.html', 'es/index.html', '404.html'];
const languagePages = ['index.html', 'zh/index.html', 'ja/index.html', 'ko/index.html', 'es/index.html'];
const pageLang = {
  'index.html': 'en',
  'zh/index.html': 'zh-CN',
  'ja/index.html': 'ja',
  'ko/index.html': 'ko',
  'es/index.html': 'es',
  '404.html': 'en',
};
const commentedCanonical = {
  'index.html': 'https://speedle.io/',
  'zh/index.html': 'https://speedle.io/zh/',
  'ja/index.html': 'https://speedle.io/ja/',
  'ko/index.html': 'https://speedle.io/ko/',
  'es/index.html': 'https://speedle.io/es/',
};
const switcher = [
  ['/', 'en'],
  ['/zh/', 'zh-CN'],
  ['/ja/', 'ja'],
  ['/ko/', 'ko'],
  ['/es/', 'es'],
];
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
  check(`${page}: html lang`, () => {
    const lang = pageLang[page];
    assert(new RegExp(`<html lang="${lang}">`).test(text(page)), `expected lang=${lang}`);
    return lang;
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

check('every page links to all five language homes', () => {
  const missing = [];
  for (const page of pages) {
    const html = text(page);
    for (const [href] of switcher) {
      const pattern = href === '/' ? /href=["']\/["']/ : new RegExp(`href=["']${href}["']`);
      if (!pattern.test(html)) missing.push(`${page} -> ${href}`);
    }
  }
  assert(missing.length === 0, missing.join('; '));
  return 'en, zh-CN, ja, ko, es';
});
check('language pages mark the current language and hreflang', () => {
  const missing = [];
  for (const page of languagePages) {
    const html = text(page);
    for (const [href, lang] of switcher) {
      const row = new RegExp(`<a\\b[^>]*href=["']${href === '/' ? '/' : href}["'][^>]*>`, 'g');
      const tags = [...html.matchAll(row)].map((match) => match[0]);
      if (!tags.some((tag) => new RegExp(`\\bhreflang=["']${lang}["']`).test(tag))) {
        missing.push(`${page} hreflang ${lang}`);
      }
    }
    const self = switcher.find(([, lang]) => lang === pageLang[page]);
    const current = new RegExp(`<a\\b[^>]*href=["']${self[0] === '/' ? '/' : self[0]}["'][^>]*aria-current=["']page["']`);
    if (!current.test(html)) missing.push(`${page} aria-current`);
  }
  assert(missing.length === 0, missing.join('; '));
  return 'five hreflang rows, current page marked';
});
check('commented hreflang lists all five languages and x-default', () => {
  const required = ['en', 'zh-CN', 'ja', 'ko', 'es', 'x-default'];
  const missing = [];
  for (const page of languagePages) {
    const html = text(page);
    for (const lang of required) {
      if (!new RegExp(`<link rel="alternate" hreflang="${lang}"`).test(html)) missing.push(`${page} ${lang}`);
    }
    if (!/<link rel="alternate" hreflang="x-default" href="https:\/\/speedle\.io\/">/.test(html)) {
      missing.push(`${page} x-default`);
    }
    const canonical = commentedCanonical[page];
    if (!html.includes(`<link rel="canonical" href="${canonical}">`)) missing.push(`${page} canonical`);
    if (!html.includes(`<meta property="og:url" content="${canonical}">`)) missing.push(`${page} og:url`);
  }
  assert(missing.length === 0, missing.join('; '));
  return 'commented; x-default is English';
});
function crossSiteUrls(page) {
  return [...text(page).matchAll(/href=["'](https:\/\/(?:engine|cloud|ai)\.speedle\.io[^"']*)["']/g)].map((match) => match[1]);
}
check('English, Japanese, Korean and Spanish cross-site links use English URLs', () => {
  const bad = [];
  for (const page of ['index.html', 'ja/index.html', 'ko/index.html', 'es/index.html']) {
    for (const url of crossSiteUrls(page)) {
      if (/\/(?:zh-CN|zh|ja|ko|es)(?:\/|#|$)/.test(url)) bad.push(`${page}: ${url}`);
    }
  }
  assert(bad.length === 0, bad.join(', '));
  return 'Engine, Cloud and AI links stay in English';
});
check('Chinese cross-site links use Chinese URLs', () => {
  const bad = [];
  for (const url of crossSiteUrls('zh/index.html')) {
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

/* Every language page carries the same sections, headings and code samples */
function sectionIds(page) {
  return [...text(page).matchAll(/<section\b[^>]*\bid=["']([^"']+)["']/gi)].map((match) => match[1]);
}
check('language pages have the same sections', () => {
  const en = [...sectionIds('index.html')].sort();
  assert(en.length > 0, 'no sections found in index.html');
  const mismatches = [];
  for (const page of languagePages) {
    const ids = [...sectionIds(page)].sort();
    if (JSON.stringify(ids) !== JSON.stringify(en)) mismatches.push(`${page} [${ids.join(', ')}]`);
  }
  assert(mismatches.length === 0, mismatches.join('; '));
  return en.join(', ');
});
check('language pages have matching heading counts', () => {
  const counts = (page) => [1, 2, 3].map((level) => (text(page).match(new RegExp(`<h${level}\\b`, 'gi')) || []).length);
  const en = counts('index.html');
  const mismatches = [];
  for (const page of languagePages) {
    const value = counts(page);
    if (JSON.stringify(value) !== JSON.stringify(en)) mismatches.push(`${page} h1/h2/h3 ${value}`);
  }
  assert(mismatches.length === 0, mismatches.join('; '));
  return `h1 ${en[0]}, h2 ${en[1]}, h3 ${en[2]}`;
});
check('language pages use the same section order', () => {
  const en = sectionIds('index.html');
  const mismatches = [];
  for (const page of languagePages) {
    const ids = sectionIds(page);
    if (JSON.stringify(ids) !== JSON.stringify(en)) mismatches.push(`${page} ${ids.join(' -> ')}`);
  }
  assert(mismatches.length === 0, mismatches.join('; '));
  return en.join(' -> ');
});
check('language pages keep the same code samples', () => {
  const blocks = (page) => [...text(page).matchAll(/<pre\b[^>]*>\s*<code>([\s\S]*?)<\/code>\s*<\/pre>/gi)].map((match) => match[1]);
  const en = blocks('index.html');
  assert(en.length > 0, 'no code samples in index.html');
  const mismatches = [];
  for (const page of languagePages) {
    const value = blocks(page);
    if (JSON.stringify(value) !== JSON.stringify(en)) mismatches.push(page);
  }
  assert(mismatches.length === 0, `code samples differ: ${mismatches.join(', ')}`);
  return `${en.length} sample(s)`;
});

function stripTags(value) {
  return value.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
}
function elementInner(html, openEnd, tag) {
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
  re.lastIndex = openEnd;
  let depth = 1;
  let match;
  while ((match = re.exec(html))) {
    depth += match[1] ? -1 : 1;
    if (depth === 0) return html.slice(openEnd, match.index);
  }
  return '';
}
function labelValues(html) {
  const values = [];
  const title = html.match(/<title>([^<]*)<\/title>/i);
  if (title) values.push(['title', title[1].trim()]);
  for (const name of ['og:title', 'twitter:title']) {
    const attr = name.startsWith('og:') ? 'property' : 'name';
    for (const match of html.matchAll(new RegExp(`<meta\\b[^>]*\\b${attr}=["']${name}["'][^>]*>`, 'gi'))) {
      const content = match[0].match(/\bcontent=["']([^"']*)["']/i);
      if (content) values.push([name, content[1].trim()]);
    }
  }
  for (const match of html.matchAll(/\baria-label=["']([^"']*)["']/gi)) values.push(['aria-label', match[1].trim()]);
  for (const match of html.matchAll(/<h([1-3])\b[^>]*>/gi)) {
    values.push([`h${match[1]}`, stripTags(elementInner(html, match.index + match[0].length, `h${match[1]}`))]);
  }
  const classes = ['eyebrow', 'family-kicker', 'family-role', 'family-foot', 'button', 'card-cta', 'card-link', 'text-link', 'languages-button', 'products-button', 'languages-heading', 'products-heading', 'coming-soon', 'card-badge', 'pill', 'product-desc', 'footer-card-description', 'footer-tagline', 'chip', 'language-row'];
  for (const className of classes) {
    const re = new RegExp(`<(?<tag>[a-z0-9]+)\\b[^>]*\\bclass=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>`, 'gi');
    for (const match of html.matchAll(re)) {
      values.push([className, stripTags(elementInner(html, match.index + match[0].length, match.groups.tag))]);
    }
  }
  return values.filter(([, value]) => value);
}
check('titles, headings and navigation labels have no trailing full stop', () => {
  const bad = [];
  for (const page of pages) {
    for (const [kind, value] of labelValues(text(page))) {
      if (/[.。]$/.test(value)) bad.push(`${page} ${kind}: ${value}`);
    }
  }
  assert(bad.length === 0, bad.join('; '));
  return 'none';
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
