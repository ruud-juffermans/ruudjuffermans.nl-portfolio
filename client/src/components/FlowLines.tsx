"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./FlowLines.module.css";

// How many pixels the dash pattern travels per pixel scrolled. Higher = the
// light dots race further along the lines for the same scroll distance.
// Instances can override this via the `rate` prop.
const FLOW_RATE = 1.15;

// Delay, in pixels of scroll. The flow would otherwise begin the moment the
// layer's top edge reaches the bottom of the viewport; this holds the dots
// still until the section has scrolled this much further up.
const FLOW_DELAY = 100;

// Each variant is one tile of artwork, in SVG user units. The paths are drawn
// so the tile stacks seamlessly: every line leaves the bottom edge at roughly
// the x it enters the top edge, so repeating the group reads as one continuous
// flow. Gradient ids must be unique per variant — two variants can share a
// page, and url(#…) resolves against the whole document.
const VARIANTS = {
  // Smooth serpentine loops sweeping in from the left edge.
  loops: {
    tileW: 740,
    tileH: 2000,
    gradientId: "flowLinesStrokeLoops",
    paths: [
      "m 106,45h 375c 114,0 226,128 226,235v 236c 0,136 -122,222 -224,221l -182,-2c -89,1 -141,42 -142,158l -2,204c -1,117 37,173 134,173h 186c 110,-3 230,111 230,220v 242c 0,113 -125,225 -248,225H 105",
      "m 33,85h 444c 96,0 190,107 190,201v 224c 0,116 -98,188 -190,187l -192,-2c -92,0 -166,75 -166,168v 278c 0,94 74,169 166,169h 194c 92,0 188,94 188,188v 228c 0,94 -104,191 -214,191H 105",
      "m 155,127h 308c 94,0 162,86 162,177v 178c 0,109 -50,174 -166,173L 277,653C 158,653 77,762 77,849v 302c 0,118 107,196 180,197l 204,4c 92,0 164,67 164,160v 200c 0,91 -89,163 -188,163H 105",
      "m 283,173c 2,0 165,0 165,0C 544,175 577,238 577,330v 156c 0,94 -48,126 -140,125L 269,609C 167,602 29,702 29,851v 312c 0,111 101,235 242,235h 162c 109,1 144,49 144,136v 162c 0,73 -53,130 -118,130l -353,1",
    ],
  },
  // Bus of strands: the four lines ride one serpentine route — vertical runs
  // swept left and right through wide quarter-circle arches — as true
  // concentric offsets, the way the loop strands nest. Each strand's corner
  // radius grows or shrinks by its offset (outside vs inside of the bend), so
  // the perpendicular distance between strands never changes anywhere along
  // the route. Every jog spans 2R vertically and sums to zero horizontally,
  // so the strands stay in step and exit the tile at the x they entered.
  circuit: {
    tileW: 1200,
    tileH: 2000,
    gradientId: "flowLinesStrokeCircuit",
    paths: [0, 44, 96, 156].map((o) => {
      const R = 200;
      // Jog right/left: quarter arc out of the vertical, straight run,
      // quarter arc back into the vertical. Offset strands take R±o radii.
      const right = (run: number) =>
        `a ${R + o},${R + o} 0 0 0 ${R + o},${R + o} h ${run} a ${R - o},${
          R - o
        } 0 0 1 ${R - o},${R - o}`;
      const left = (run: number) =>
        `a ${R - o},${R - o} 0 0 1 ${-(R - o)},${R - o} h ${-run} a ${R + o},${
          R + o
        } 0 0 0 ${-(R + o)},${R + o}`;
      return `m ${540 - o},0 v 80 ${right(40)} v 80 ${left(80)} v 80 ${right(
        80
      )} v 80 ${left(40)} v 80`;
    }),
  },
} as const;

export type FlowLinesVariant = keyof typeof VARIANTS;

// Scroll-driven backdrop of flowing dashed lines. Renders as an absolutely
// positioned layer that fills its (relatively positioned) parent, so it spans
// exactly the sections the parent wraps. Per-section visibility is not handled
// here — sections dial it with their own translucent background.
export default function FlowLines({
  variant = "loops",
  rate = FLOW_RATE,
}: {
  variant?: FlowLinesVariant;
  rate?: number;
}) {
  const { tileW, tileH, gradientId, paths } = VARIANTS[variant];
  const ref = useRef<HTMLDivElement>(null);
  const [tiles, setTiles] = useState(1);

  // Repeat the tile enough times to cover however tall the wrapped sections are.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () =>
      setTiles(Math.max(1, Math.ceil(el.offsetHeight / tileH)));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [tileH]);

  // Advance the dash offset with scroll position, rAF-throttled. The layer's
  // document-space top is cached so the per-scroll work reads only scrollY —
  // calling getBoundingClientRect here, after the previous frame's
  // --flow-offset write invalidated style, would force a layout every frame
  // (and did: ~70ms of forced reflow per PageSpeed trace).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let docTop = 0;
    const measure = () => {
      docTop = el.getBoundingClientRect().top + window.scrollY;
    };
    const update = () => {
      frame = 0;
      // Pixels scrolled since the layer's top entered the viewport bottom,
      // minus the delay — negative values are clamped away below.
      const travelled = window.innerHeight - FLOW_DELAY - (docTop - window.scrollY);
      el.style.setProperty(
        "--flow-offset",
        String(-Math.max(0, travelled) * rate)
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const remeasure = () => {
      measure();
      schedule();
    };

    measure();
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", remeasure);
    // Content above the layer growing or shrinking moves its document-space
    // top without a window resize; watching the page's height catches that.
    const observer = new ResizeObserver(remeasure);
    observer.observe(document.body);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", remeasure);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [rate]);

  return (
    <div
      className={
        variant === "circuit" ? `${styles.layer} ${styles.repeat}` : styles.layer
      }
      ref={ref}
      aria-hidden="true"
    >
      <svg
        className={styles.svg}
        width={tileW}
        height={tileH * tiles}
        viewBox={`0 0 ${tileW} ${tileH * tiles}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id={gradientId}
            gradientUnits="objectBoundingBox"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop offset="0%" stopColor="var(--app-red-light)" />
            <stop offset="45%" stopColor="var(--app-red)" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
        </defs>
        {Array.from({ length: tiles }, (_, tile) => (
          <g key={tile} transform={`translate(0 ${tile * tileH})`}>
            {paths.map((d, i) => (
              <path
                key={i}
                d={d}
                data-line={i + 1}
                style={{ stroke: `url(#${gradientId})` }}
              />
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}
