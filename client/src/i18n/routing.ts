import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["nl", "en"],
  defaultLocale: "nl",
  localePrefix: "as-needed",
  pathnames: {
    "/": "/",
    "/projects": {
      nl: "/projecten",
      en: "/projects",
    },
    "/projects/[slug]": {
      nl: "/projecten/[slug]",
      en: "/projects/[slug]",
    },
    "/blog": "/blog",
    "/blog/[slug]": "/blog/[slug]",
    "/about": {
      nl: "/over-mij",
      en: "/about",
    },
    // The two disciplines from the homepage's "What I do": field is
    // "data-engineering" or "ai-engineering" (see EXPERTISE_FIELDS).
    "/expertise/[field]": "/expertise/[field]",
    "/contact": "/contact",
    "/privacy": "/privacy",
  },
});

export type Locale = (typeof routing.locales)[number];
export type AppPathname = keyof typeof routing.pathnames;
