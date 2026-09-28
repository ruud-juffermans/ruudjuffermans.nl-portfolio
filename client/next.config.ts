import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  // The opengraph-image routes read these TTFs at runtime via fs; the
  // standalone trace doesn't pick that up on its own.
  outputFileTracingIncludes: {
    "/**/*": ["./src/assets/og/*.ttf"],
  },
  async headers() {
    // 'unsafe-inline' is required for Next's bootstrap scripts (incl.
    // InitColorSchemeScript) and Emotion's style tags. Production-only: next
    // dev needs eval.
    //
    // viewer.diagrams.net serves draw.io's GraphViewer, used for the
    // architecture diagrams on the project pages (see DrawioViewer.tsx). It
    // needs script-src for the viewer itself, img-src for its toolbar icons
    // and connect-src for the resources it fetches; the lightbox opens in an
    // overlay it renders itself, so no frame-src is required. The diagram XML
    // is served from this origin and never sent anywhere.
    const DRAWIO = "https://viewer.diagrams.net";
    //
    // The digital-twin assistant (NEXT_PUBLIC_TWIN_URL, e.g.
    // https://ai.ruudjuffermans.nl) serves widget.js — the floating chat
    // launcher loaded in [locale]/layout.tsx — and the chat iframe it opens.
    // So: script-src for the loader, frame-src for the iframe. Nothing else:
    // the iframe talks to the twin's API from its own origin, and the
    // launcher's icons are inline SVG. Its injected <style> is covered by
    // style-src 'unsafe-inline'. Omitted while the variable is unset.
    const TWIN = process.env.NEXT_PUBLIC_TWIN_URL ? new URL(process.env.NEXT_PUBLIC_TWIN_URL).origin : "";
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' ${DRAWIO} ${TWIN}`.trimEnd(),
      `style-src 'self' 'unsafe-inline' ${DRAWIO}`,
      `img-src 'self' data: blob: ${DRAWIO}`,
      "font-src 'self'",
      `connect-src 'self' ${DRAWIO} ${process.env.NEXT_PUBLIC_API_URL || "https://api.ruudjuffermans.nl"}`,
      ...(TWIN ? [`frame-src ${TWIN}`] : []),
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          ...(process.env.NODE_ENV === "production"
            ? [{ key: "Content-Security-Policy", value: csp }]
            : []),
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Canonical host: send www.ruudjuffermans.nl → ruudjuffermans.nl (apex is
      // canonical, matching NEXT_PUBLIC_SITE_URL). Only fires when Traefik
      // actually routes the www host to this app — see the Dokploy note below.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www\\.ruudjuffermans\\.nl" }],
        destination: "https://ruudjuffermans.nl/:path*",
        permanent: true,
      },
      // /portfolio became /projecten (nl) and /projects (en). Config redirects
      // run before the next-intl middleware, so the old paths never reach it.
      { source: "/portfolio", destination: "/projecten", permanent: true },
      { source: "/portfolio/:slug", destination: "/projecten/:slug", permanent: true },
      { source: "/en/portfolio", destination: "/en/projects", permanent: true },
      { source: "/en/portfolio/:slug", destination: "/en/projects/:slug", permanent: true },
      // The freelance site's service/package pages have no successor on the
      // portfolio; anything indexed under them lands on the projects overview.
      { source: "/diensten", destination: "/projecten", permanent: true },
      { source: "/diensten/:slug", destination: "/projecten", permanent: true },
      { source: "/en/services", destination: "/en/projects", permanent: true },
      { source: "/en/services/:slug", destination: "/en/projects", permanent: true },
    ];
  },
  async rewrites() {
    return [
      // Markdown twins of the blog posts (AEO): /blog/foo.md serves the raw
      // post as text/markdown. Dotted paths are excluded from the i18n
      // middleware matcher, so these reach the app router unprefixed and get
      // mapped onto the raw/blog handler here.
      { source: "/blog/:slug.md", destination: "/raw/blog/nl/:slug" },
      { source: "/en/blog/:slug.md", destination: "/raw/blog/en/:slug" },
      // Dev convenience: with NEXT_PUBLIC_API_URL unset the browser calls
      // same-origin /api/*, which this rewrite proxies to the local platform
      // server (ruudjuffermans-server on :4000). Production bakes the absolute
      // API origin into the client instead, so this never fires there.
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
