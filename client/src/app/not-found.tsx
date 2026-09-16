// 404 for paths outside any locale (e.g. /llms.txt — dotted paths skip the
// i18n middleware, so `llms.txt` reaches [locale] as an invalid locale and
// its layout calls notFound()). That bubbles up here, above the locale
// layout, so this page renders its own minimal document: no theme, no
// translations (there is no locale to translate for). Without this boundary
// those requests were 500s. Localized 404s render [locale]/not-found.tsx.
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#0B1120",
          color: "#F8FAFC",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
        }}
      >
        <div>
          <p style={{ letterSpacing: "0.12em", color: "#EF4444", margin: 0 }}>404</p>
          <h1 style={{ fontSize: 28, margin: "12px 0 24px" }}>Page not found</h1>
          <a href="/" style={{ color: "#60A5FA" }}>
            ruudjuffermans.nl
          </a>
        </div>
      </body>
    </html>
  );
}
