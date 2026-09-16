// Turns a draw.io SVG export into a lean, dark-only SVG for the site's
// brand-dark sections and the navy diagram figures on project pages.
//
//   node scripts/drawio-to-web.mjs <export.drawio.svg> <public/out.svg>
//
// In and out may be the same file: a converted file keeps draw.io's embedded
// diagram source, so it still opens in draw.io, and re-exporting over it and
// converting again is safe. Exports from draw.io's embed mode (see
// scripts/drawio-export.mjs) go through the same path.
//
// - Drops the PNG fallback draw.io renders for every label (browsers use the
//   HTML label), roughly 700 KB → 75 KB.
// - Resolves every light-dark() pair to its dark value, so the result looks
//   the same whatever the viewer's color scheme or light-dark() support.
// - Swaps draw.io's near-black dark fills for translucent white and the
//   section's navy, so boxes sit on the page instead of on black.
// - Makes the canvas transparent (drops the page-background rect and the
//   root background style) and gives edge-label backings the navy instead of
//   the white the export hardcodes, so nothing flashes white on navy.
// - Strips every <a>: draw.io wraps each label's plain-text fallback in a link
//   to its own FAQ, and nothing in these diagrams should be clickable.

import { readFileSync, writeFileSync } from "node:fs";

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error("usage: node scripts/drawio-to-web.mjs <in.drawio.svg> <out.svg>");
  process.exit(1);
}

const NAVY = "#0d2242";

// draw.io dark value → site value
const DARK_REMAP = {
  "rgb(18, 18, 18)": "rgba(255, 255, 255, 0.06)", // node fill
  "rgb(26, 26, 26)": "rgba(255, 255, 255, 0.08)", // neutral lane header
  "var(--ge-dark-color, #121212)": NAVY, // edge-label backing
};

const src = readFileSync(input, "utf8");

const out = src
  .slice(src.indexOf("<svg"))
  // draw.io links each label's SVG-1.1 fallback text to its own FAQ page.
  .replace(/<a\b[^>]*>[\s\S]*?<\/a>/g, "")
  .replace(/<image\b[^>]*xlink:href="data:image\/png;base64,[^"]*"[^>]*\/>/g, "")
  .replace(/light-dark\(((?:[^()]|\([^()]*\))*)\)/g, (_, pair) => {
    const dark = pair.slice(pair.search(/,\s*(?![^()]*\))/) + 1).trim();
    return DARK_REMAP[dark] ?? dark;
  })
  .replace(/color-scheme:\s*light dark;/, "color-scheme: dark;")
  // Root background (only present when the diagram has a page colour).
  .replace(/^(<svg[^>]*style=")background: #[0-9a-f]{6}; background-color: [^;"]*;/i, "$1background: transparent; background-color: transparent;")
  // Full-canvas page-background rect.
  .replace(/<rect fill="#ffffff" width="100%" height="100%"[^>]*\/>/, "")
  // Outer wrapper of an edge label keeps a hardcoded white backing.
  .replace(/color: #000000; background-color: #ffffff; "/g, `color: #000000; background-color: ${NAVY}; "`);

writeFileSync(output, out);
console.log(`${output}: ${(src.length / 1024).toFixed(0)} KB → ${(out.length / 1024).toFixed(0)} KB`);
