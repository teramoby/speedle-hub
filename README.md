# speedle-hub

Static hub for the Speedle family: the planned front door for `speedle.io`. Home
pages in five languages introduce Speedle Engine, Speedle Cloud and Speedle AI,
explain the shared SPDL policy model, and link to the three product sites.

No build step: plain HTML, one stylesheet, one small script, inline SVG icons.

## Status: preview

This repository is configured for a GitHub Pages preview at
**https://preview.speedle.io/** (`CNAME`). It is not live on `speedle.io` yet.
Preview hosting and DNS are configured outside this repository.

Preview safety:

- Every page carries `<meta name="robots" content="noindex, nofollow">`.
- `robots.txt` disallows every crawler.
- No sitemap, no `llms.txt`, no analytics beacon and no OG image.
- `canonical`, `hreflang`, `og:url` and JSON-LD are kept in a commented
  `TODO(launch)` block on every language page, so the preview does not claim
  the apex.
- A visible header ribbon reads **Preview**, **预览**, **プレビュー**, **프리뷰**
  or **Vista previa**. It is shown by the `is-preview` class on `<body>`;
  remove that one class from every language page to hide it at launch.

`CNAME` is `preview.speedle.io`.

## Pages

| Path | Contents |
| --- | --- |
| `/` | English hub |
| `/zh/` | Chinese hub |
| `/ja/` | Japanese hub |
| `/ko/` | Korean hub |
| `/es/` | Spanish hub |
| `/404.html` | Not-found page with links to every home page |
| `assets/styles.css` | Shared stylesheet |
| `assets/site.js` | Header menu, Products panel and language menu |
| `i18n/glossary.md` | Shared Japanese, Korean and Spanish terminology |
| `favicon.svg`, `favicon.ico`, `apple-touch-icon.png` | Hub favicons |

The five language pages have the same sections, headings and links. On Chinese
pages, cross-site links keep the page language: Engine uses `/zh/`, Cloud uses
`/zh-CN/` and AI uses `/zh/`. Japanese, Korean and Spanish pages link to the
English pages of those sites. Product names, code, CLI commands, API paths and
SPDL stay in English. `i18n/glossary.md` is the shared terminology for the
other Speedle sites.

The header and footer follow the shared Speedle website standard, with the hub's
own lock-up (sphere + Speedle wordmark, no product word) and the original orange
sphere `#ff9a45`.

## Check locally

```sh
python3 -m http.server 8000
# open http://localhost:8000/
bash scripts/check.sh
```

`scripts/check.sh` runs `scripts/check.mjs` with Node.js and no packages. It
checks that:

- every language page and `404.html` exist;
- every page has the noindex meta, the preview ribbon and no analytics;
- `robots.txt` disallows everything and `CNAME` is exactly
  `preview.speedle.io`;
- canonical, hreflang and `og:url` are not active;
- every internal link, asset reference and in-page anchor resolves;
- every external link is `https`;
- the five language pages have the same sections, section order, heading
  counts and code samples;
- each page links to all five language homes, and cross-site links use Chinese
  URLs on the Chinese page and English URLs on the others;
- titles, headings and navigation labels do not end with a full stop.

The workflow in `.github/workflows/check.yml` runs the same script on pull
requests with `permissions: contents: read`.

## Pull request review

ReviewBot reads a pull request diff and posts a static review. It does not run
the site or `scripts/check.sh`. A collaborator with write access can request
one from a pull request comment:

```text
@reviewbot review
@reviewbot recheck
@reviewbot explain why is this link on the Chinese page?
```

A bare `@reviewbot` means `review`. Commands also work on a code-line comment.
`.github/REVIEWBOT.md` describes the flow. Reviews run only after those
workflows are on the default branch.

## Launch checklist

This repository is only the static site; DNS, Cloudflare and GitHub Pages
settings are changed separately.

1. Change `CNAME` to `speedle.io`, add the existing `BingSiteAuth.xml`
   verification file at the repository root, and keep `.nojekyll`.
2. Put DNS in DNS-only mode, pause the host's redirect rule, point the apex at
   GitHub Pages and issue the certificate. Verify `https://speedle.io/` returns
   200.
3. Add the ordered Cloudflare rules: Bing verification file → hub routes →
   Engine legacy paths 301 to `https://engine.speedle.io` with the same path →
   fallback 301. Check with `curl -I` for `/`, `/zh/`, `/ja/`, `/ko/`, `/es/`,
   `/docs/spdl/`, `/zh/docs/`, `/BingSiteAuth.xml`, `/llms.txt`, `/sitemap.xml`
   and a missing path.
4. Re-enable proxying if it is used, then recheck the certificate and the
   301/200 matrix.
5. Submit the `speedle.io` sitemap to Google and Bing; keep the Engine property.
6. Update the three product sites' `llms.txt`, `website/README.md`,
   `website/DESIGN.md` and the `ai.speedle.io` README so they describe the hub.
7. Watch 404s, redirect chains and Search Console coverage for four weeks. Roll
   back by restoring the DNS records and redirect rules and reverting `CNAME`,
   as recorded in `teramoby/speedle-plus#204`.

Site changes at launch:

- Remove `is-preview` from every language page to hide the preview ribbon.
- Replace the noindex meta with `index, follow` and replace `robots.txt` with
  the launch version.
- Uncomment the canonical, hreflang, `og:url` and JSON-LD block in every
  language page.
- Add `sitemap.xml`, `llms.txt` and a 1200 × 630 OG image with the matching
  `og:image` and Twitter image tags.
- Add the Cloudflare Web Analytics beacon to every public page. Each hostname
  has its own public site token; use the `speedle.io` token when the beacon is
  enabled. No token is stored in this repository.

## Assets

- The header and footer logo is inline SVG, copied from the shared Speedle logo
  with colours changed only (wordmark `#fff`, sphere `#ff9a45`).
- `favicon.svg` is the sphere only in `#ff9a45`, transparent, with the shared
  favicon stroke treatment (outer polygon ×2.0, inner lines ×2.2) and the
  shared 115-unit viewBox.
- `favicon.ico` contains 16, 32 and 48 px PNG frames rendered from
  `favicon.svg`.
- `apple-touch-icon.png` is 180 × 180: the sphere on `#1f1142` with 20 px
  padding. Its source is `assets/apple-touch-icon-source.svg`.
