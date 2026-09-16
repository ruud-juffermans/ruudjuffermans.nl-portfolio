# SEO & performance checklist

Combined findings from PageSpeed Insights (mobile + desktop, Aug 11, 2026,
tested on `/en`) plus earlier live-site checks. Scores at time of writing:

|                | Mobile | Desktop |
| -------------- | ------ | ------- |
| Performance    | 81     | 68      |
| Accessibility  | 91     | 94      |
| Best Practices | 96     | 96      |
| SEO            | 92     | 92      |

Field data (CrUX): none yet — Core Web Vitals have no ranking effect until
real-user data accumulates. Lab findings below.

## Bugs — fix first

- [x] **Canonical/hreflang/sitemap URLs point at `www.`** — fixed:
      `NEXT_PUBLIC_SITE_URL` corrected in Dokploy and redeployed. Verified
      live: canonical/hreflang/sitemap all use the apex; www still 308s in.
- [x] **Unknown paths containing a dot return 500 instead of 404** — fixed.
      The crash was `getTranslations`/`Intl.NumberFormat` receiving the path
      (e.g. `llms.txt`) as a locale before any validation ran. Guards added in
      `[locale]/layout.tsx` `generateMetadata` and the home page component
      (pages render in parallel with the layout, so the layout guard alone
      isn't enough), plus a root `app/not-found.tsx` (+ pass-through root
      layout) to catch it. Verified: `/llms.txt`, `/foo.txt` → 404.
- [x] **Desktop CLS 0.928 — root-caused and fixed.** ThemeRegistry used a bare
      module-level Emotion cache with no `useServerInsertedHTML` flush, so the
      SSR HTML contained only the 3 `mui-global` style tags and **none of the
      193 component `mui-*` classes** — the page painted essentially unstyled
      (hero at y≈11,500px, zero padding) and then reflowed wholesale when
      Emotion inserted all component styles at hydration. Diagnosed with a
      CDP-instrumented headless probe (PerformanceObserver layout-shift
      attribution + 100ms state timeline) against the live site. Fix: replace
      the bare cache with MUI's `AppRouterCacheProvider`
      (`@mui/material-nextjs/v15-appRouter`), which flushes SSR styles into
      the HTML. Verified on the production build: CLS 0.928 → 0, desktop
      Lighthouse performance 68 → 90, LCP 1.0s → 0.8s, rendering
      pixel-identical. This also fixes the real-user flash of unstyled
      content on slow connections — it was never just a lab artifact.
- [x] **Console errors on page load** — root-caused with a headless-Chrome
      pass over `/`, `/en`, `/en/projects`, `/en/blog`, `/en/contact`
      (Aug 19, 2026). The analytics beacon is clean in prod; the only console
      error is the browser-logged 401 from the anonymous-visitor session probe
      (`GET api.ruudjuffermans.nl/api/account/auth/me`). `session.ts` handles
      the 401 correctly, but browsers always log 4xx responses and the
      session cookie is cross-origin, so the client can't skip the probe.
      Fix lives in `ruudjuffermans-server`: have `/auth/me` return 200
      `{user: null}` for anonymous instead of 401. Nothing to change here.

## SEO — off-repo actions

- [x] Fix the www env var (above), redeploy, spot-check — done and verified.
- [x] **Google Search Console**: domain verified, `sitemap.xml` submitted.
      Watch the Pages report (Indexing) over the coming days/weeks; optionally
      request indexing for the homepage via URL Inspection to skip the queue.
- [ ] Bing Webmaster Tools: one-click import from GSC (optional).
- [ ] Validate a blog post in Google's Rich Results Test (JSON-LD).
- [ ] Check OG cards: LinkedIn Post Inspector + paste a URL in Slack/Discord.
      (og:image verified serving 200/png on the live site already.)
- [ ] **Decide: locale-detection redirect.** `/` currently 307s
      English-header visitors (incl. Googlebot, which crawls with English
      headers from the US) to `/en` — it's also why PSI tested `/en`. For a
      Dutch-first site, `localeDetection: false` in the next-intl routing
      config is the SEO-safe choice: `/` always serves Dutch, humans use the
      NL/EN toggle. Tradeoff: English visitors land on Dutch first.
- [ ] **Content** — the real ranking lever now: Dutch blog posts answering
      what prospective clients search, internally linked to service pages.
- [ ] **Backlinks** — link the site from LinkedIn, Udemy instructor profile,
      GitHub profile.

## Performance — worth doing

- [x] **Hero LCP render delay** — fixed. SplitText now ships the headline
      visible in the server HTML and only hides/animates it once JS has
      mounted, so the h1 paints at FCP instead of waiting ~1.5s for
      hydration. (Reveal-wrapped blocks still fade in; only the LCP h1
      needed this.) Fonts also moved from @fontsource CSS imports to
      next/font/local: preloaded woff2 + size-adjusted fallback.
- [x] **Forced reflow (~70ms)** — fixed. The FlowLines scroll handler called
      `getBoundingClientRect` per rAF frame after the previous frame's
      `--flow-offset` write had invalidated style, forcing a layout every
      scroll frame. It now caches the layer's document-space top (re-measured
      on window resize and page-height changes via a ResizeObserver on
      `body`) and derives the offset from `scrollY` alone — no layout reads
      on the scroll path.
- [x] **Preconnect to `https://api.ruudjuffermans.nl`** — added in the locale
      layout head, emitted only when `NEXT_PUBLIC_API_URL` is set (i.e. prod).
- [x] **Render-blocking CSS** — closed, not actionable. Total CSS across the
      three chunks is ~6 KB gzip; the 870ms "estimated savings" is an
      artifact of PSI's simulated slow-4G throttling (each request costs a
      synthetic round trip regardless of size), not real transfer time.
      Inlining 6 KB would save nothing measurable for real users.
- [ ] **Brotli** — the Next standalone server only gzips, and a brotli-only
      request currently gets the homepage HTML uncompressed (591 KB,
      verified live Aug 19, 2026). A Traefik compress middleware
      (`website-compress@docker`, gzip/br/zstd on Traefik v3) is now defined
      via labels in `docker-compose.yml`; remaining off-repo step: attach it
      to the site's router in Dokploy (domain → Traefik config), then verify
      with `curl -sI -H "Accept-Encoding: br" https://ruudjuffermans.nl/en`
      → expect `content-encoding: br`. Worth ~15–25% off every cold visit.

## Performance — low priority / ignore

- Non-composited animations (89–95 elements: FlowLines dashes, ServicesShowcase
  wires, MUI hover transitions) — decorative and cheap; ignore unless they
  cause visible jank. The CLS entry above is the only one that matters.
- Legacy JavaScript (13 KiB), minify CSS (3 KiB), unused CSS (20–24 KiB),
  unused JS (25 KiB) — single-digit real-world impact; skip.
- DOM size (1,246 elements) — fine.
- Agentic Browsing category (0–1/3) — experimental; only actionable item was
  the 500 bug, tracked above.

## Accessibility — all fixed, local Lighthouse a11y score now 100

- [x] **Icon-only links** — `aria-label`s added to the footer LinkedIn /
      GitHub / e-mail IconButtons.
- [x] **Heading levels** — card/item titles on the homepage now render as
      `<h3>` (keeping their visual variant), the accordion title no longer
      nests a heading inside MUI's own `<h3>`, and `subtitle1/2` map to
      `<p>` instead of `<h6>` via the theme's variantMapping.
- [x] **Color contrast** — two real failures found and fixed: the contained
      primary button used white text on the pale dark-mode blue `#60a5fa`
      (2.5:1); text on accent is now the per-scheme `--app-on-red` token
      (white in light mode, dark navy ink in dark mode). Footer copyright
      alpha raised 0.40 → 0.55 to clear 4.5:1.

## Best practices / hardening (no SEO effect)

- [x] Security headers added in `next.config.ts`: HSTS (2y, subdomains),
      COOP `same-origin`, Permissions-Policy, and a production-only CSP
      (self-only + platform API in connect-src; 'unsafe-inline' retained for
      Next bootstrap + Emotion). X-Frame-Options/nosniff/Referrer-Policy were
      already present.
- [ ] Trusted Types (advanced CSP) — optional, skip unless bored.

## GitHub — remaining polish

- [x] README with screenshot + live link
- [x] CI (typecheck + build), Dependabot, `.nvmrc`
- [x] Repo description, topics, homepage, social preview
- [x] Legacy code removed, work committed in reviewable pieces
- [ ] CI status badge in the README (one line)
- [ ] Pin the repo on your GitHub profile
