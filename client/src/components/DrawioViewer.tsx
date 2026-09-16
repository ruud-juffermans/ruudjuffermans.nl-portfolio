"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { palette } from "@/theme/theme";

/**
 * draw.io's own viewer, for the architecture diagrams.
 *
 * The other figures are flat SVG exports, which is right for a diagram you
 * read in one glance. The architecture diagrams carry more than fits in the
 * content column, so they get the real thing: draw.io's GraphViewer, with its
 * zoom controls, wheel/pinch zoom and drag-to-pan. The
 * `.drawio` source is served from /diagrams, so the viewer renders exactly the
 * file in the repo, with no export step in between.
 *
 * The viewer script comes from viewer.diagrams.net — loaded once per page, and
 * only when a diagram is close to the viewport. Until it is ready (and if it
 * never arrives) the static SVG stays on screen, so the page is never empty.
 * The origin is allow-listed in the CSP in next.config.ts.
 */

const VIEWER_SRC = "https://viewer.diagrams.net/js/viewer-static.min.js";

declare global {
  interface Window {
    GraphViewer?: { createViewerForElement: (el: Element, cb?: () => void) => void };
  }
}

let viewerPromise: Promise<void> | null = null;

function loadViewer(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.GraphViewer) return Promise.resolve();
  if (viewerPromise) return viewerPromise;

  viewerPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${VIEWER_SRC}"]`);
    const script = existing ?? document.createElement("script");
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => reject(new Error("draw.io viewer failed to load")));
    if (!existing) {
      script.src = VIEWER_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
  });
  return viewerPromise;
}

export interface DrawioViewerProps {
  /** Path to the .drawio source under /public. */
  src: string;
  /** Static SVG, shown while the viewer loads and left in place if it fails. */
  fallbackSrc: string;
  width: number;
  height: number;
  alt: string;
  priority?: boolean;
}

export default function DrawioViewer({
  src,
  fallbackSrc,
  width,
  height,
  alt,
  priority = false,
}: DrawioViewerProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<"idle" | "ready" | "failed">("idle");

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;

    async function start() {
      try {
        const [xml] = await Promise.all([
          fetch(src).then((r) => {
            if (!r.ok) throw new Error(`${r.status} for ${src}`);
            return r.text();
          }),
          loadViewer(),
        ]);
        if (cancelled || !hostRef.current || !window.GraphViewer) return;

        const mount = document.createElement("div");
        mount.className = "mxgraph";
        mount.style.maxWidth = "100%";
        mount.setAttribute(
          "data-mxgraph",
          JSON.stringify({
            xml,
            highlight: "#3b82f6",
            nav: true,
            resize: true,
            center: true,
            zoom: 1,
            toolbar: "zoom layers",
            "toolbar-nohide": true,
            // No lightbox. `lightbox: "open"` makes a click on the diagram open
            // it on viewer.diagrams.net in a new tab, which is a link off the
            // site — the whole point here is that nothing in a diagram is
            // clickable. Zoom and pan stay; only the pop-out goes.
            lightbox: false,
            edit: null,
            links: false,
            "target-blank": false,
          }),
        );

        hostRef.current.replaceChildren(mount);
        window.GraphViewer.createViewerForElement(mount);

        // The config above should leave nothing clickable, but the viewer is a
        // third-party bundle: unwrap any anchor it still injects rather than
        // trusting it, and swallow clicks on the canvas itself.
        for (const a of Array.from(mount.querySelectorAll("a"))) {
          a.replaceWith(...Array.from(a.childNodes));
        }
        mount.addEventListener("click", (e) => e.stopPropagation(), true);

        if (!cancelled) setState("ready");
      } catch {
        if (!cancelled) setState("failed");
      }
    }

    // Only pay for a 1 MB script once the figure is near the viewport.
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer.disconnect();
        void start();
      },
      { rootMargin: "400px" },
    );

    if (priority) void start();
    else observer.observe(host);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [src, priority]);

  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: "16px",
        border: `1px solid ${palette.gray200}`,
        backgroundColor: palette.navy,
        boxShadow: "0 2px 12px rgba(11, 17, 32, 0.06)",
        overflow: "hidden",
        p: { xs: 1.5, md: 2.5 },
        // draw.io brings its own chrome; keep it on the navy and out of the
        // way until the pointer is over the figure.
        "& .mxgraph, & .geDiagramContainer": { maxWidth: "100%" },
        "& div.geToolbarContainer": {
          backgroundColor: "rgba(11, 17, 32, 0.82) !important",
          border: `1px solid ${palette.navySurface} !important`,
          borderRadius: "10px !important",
          boxShadow: "none !important",
          opacity: 0.55,
          transition: "opacity 120ms ease",
        },
        "&:hover div.geToolbarContainer": { opacity: 1 },
        "& div.geToolbarContainer img": { filter: "invert(1) brightness(1.6)" },
      }}
    >
      {state !== "ready" ? (
        <Box
          component="img"
          src={fallbackSrc}
          width={width}
          height={height}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          sx={{ display: "block", width: "100%", height: "auto" }}
        />
      ) : null}

      <Box
        ref={hostRef}
        role="img"
        aria-label={alt}
        sx={{ display: state === "ready" ? "block" : "none" }}
      />

    </Box>
  );
}
