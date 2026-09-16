import { notFound } from "next/navigation";

// Catch-all for unknown paths under a valid locale: without this, next-intl
// would render Next's bare default 404 outside the locale layout. Triggering
// notFound() here bubbles up to [locale]/not-found.tsx instead.
export default function CatchAllPage() {
  notFound();
}
