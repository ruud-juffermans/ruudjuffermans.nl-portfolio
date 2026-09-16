// Pass-through root layout: <html>/<body> live in [locale]/layout.tsx (they
// need the locale), but Next requires a root layout for the root
// not-found.tsx to exist — which handles paths that resolve to no valid
// locale, e.g. /llms.txt (dotted paths skip the i18n middleware).
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
