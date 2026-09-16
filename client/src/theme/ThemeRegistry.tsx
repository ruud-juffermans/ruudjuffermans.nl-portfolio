"use client";

import * as React from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme";

// AppRouterCacheProvider (not a bare emotion CacheProvider): it flushes the
// styles emotion collects during SSR into the HTML via useServerInsertedHTML.
// The previous module-level cache never did that, so every component style
// arrived only at hydration — the whole page painted unstyled first and then
// reflowed (CLS 0.93, the "flash of unstyled content" on slow connections).
export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppRouterCacheProvider options={{ key: "mui", prepend: true }}>
      <ThemeProvider theme={theme} defaultMode="system">
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
