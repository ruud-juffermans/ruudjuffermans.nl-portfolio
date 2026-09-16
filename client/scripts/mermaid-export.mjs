// Renders a Mermaid diagram to a dark-only SVG for the navy diagram figures
// on project pages, without a local mermaid install: headless Chrome loads
// mermaid from jsdelivr, renders the diagram and dumps the DOM.
//
//   node scripts/mermaid-export.mjs <diagram.mmd> <public/out.svg>
//
// Needs Google Chrome and network access. The output is a self-contained SVG
// (text elements, no foreignObject), transparent background, white text and
// translucent boxes, so it sits on the same navy card as the draw.io exports
// (see scripts/drawio-to-web.mjs). Fonts are a plain sans-serif stack so the
// SVG looks the same in an <img>, which cannot load web fonts.

import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const CHROME =
  process.env.CHROME_BIN ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error("usage: node scripts/mermaid-export.mjs <diagram.mmd> <out.svg>");
  process.exit(1);
}

const NAVY = "#0d2242";
const ACCENT = process.env.MERMAID_ACCENT ?? "#F59E0B";

const config = {
  startOnLoad: false,
  theme: "base",
  fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
  themeVariables: {
    background: "transparent",
    fontSize: "20px",
    textColor: "#ffffff",
    lineColor: "#cfd8e6",
    primaryColor: "rgba(255,255,255,0.08)",
    primaryTextColor: "#ffffff",
    primaryBorderColor: "rgba(255,255,255,0.45)",
    actorBkg: "rgba(255,255,255,0.08)",
    actorBorder: "rgba(255,255,255,0.45)",
    actorTextColor: "#ffffff",
    actorLineColor: "rgba(255,255,255,0.35)",
    signalColor: "#e2e8f0",
    signalTextColor: "#f1f5f9",
    noteBkgColor: ACCENT,
    noteTextColor: NAVY,
    noteBorderColor: ACCENT,
    activationBkgColor: "rgba(255,255,255,0.14)",
    activationBorderColor: "rgba(255,255,255,0.5)",
    sequenceNumberColor: NAVY,
    labelBoxBkgColor: "rgba(255,255,255,0.08)",
    labelBoxBorderColor: "rgba(255,255,255,0.45)",
    labelTextColor: "#ffffff",
    loopTextColor: "#ffffff",
  },
  sequence: {
    diagramMarginX: 16,
    diagramMarginY: 16,
    actorMargin: 48,
    width: 160,
    height: 60,
    actorFontSize: 20,
    actorFontWeight: 600,
    messageFontSize: 20,
    noteFontSize: 19,
    boxMargin: 12,
    messageMargin: 40,
    mirrorActors: false,
    useMaxWidth: false,
    wrap: false,
  },
};

const source = readFileSync(input, "utf8");
const page = `<!doctype html><meta charset="utf-8"><body style="margin:0;background:${NAVY}">
<script type="module">
import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.esm.min.mjs";
mermaid.initialize(${JSON.stringify(config)});
const { svg } = await mermaid.render("diagram", ${JSON.stringify(source)});
document.body.innerHTML = '<div id="out">' + svg + '</div>';
</script>`;

const work = mkdtempSync(join(tmpdir(), "mermaid-export-"));
const pagePath = join(work, "page.html");
writeFileSync(pagePath, page);

// Drive Chrome over the DevTools protocol (as scripts/drawio-export.mjs does):
// --dump-dom does not wait for the module script's network fetch and hangs.
const chrome = spawn(
  CHROME,
  ["--headless=new", "--disable-gpu", "--no-first-run", "--remote-debugging-port=0",
   `--user-data-dir=${join(work, "profile")}`, "about:blank"],
  { stdio: ["ignore", "ignore", "pipe"] },
);
const devtools = await new Promise((resolve, reject) => {
  let buf = "";
  chrome.stderr.on("data", (d) => {
    buf += d;
    const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
    if (m) resolve(m[1]);
  });
  chrome.on("exit", () => reject(new Error("Chrome exited before DevTools came up")));
});
const port = new URL(devtools).port;
const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));

let id = 0;
const pending = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id) { pending.get(m.id)?.(m.result); pending.delete(m.id); return; }
  if (m.method === "Runtime.exceptionThrown") console.error(JSON.stringify(m.params.exceptionDetails).slice(0, 600));
};
const send = (method, params = {}) =>
  new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });

await send("Runtime.enable");
await send("Page.navigate", { url: `file://${pagePath}` });
const deadline = Date.now() + 60_000;
let dom = "";
while (!dom && Date.now() < deadline) {
  await new Promise((r) => setTimeout(r, 250));
  const r = await send("Runtime.evaluate", {
    expression: "document.querySelector('#out svg')?.outerHTML ?? ''",
    returnByValue: true,
  });
  dom = r?.result?.value ?? "";
}
ws.close();
chrome.kill("SIGKILL");
rmSync(work, { recursive: true, force: true });
if (!dom) { console.error("timed out waiting for mermaid"); process.exit(1); }

const match = dom.match(/<svg[\s\S]*?<\/svg>/);
if (!match) {
  console.error("no <svg> in the rendered page — did mermaid load?");
  process.exit(1);
}
const svg = match[0]
  // Standalone file: an XML namespace and no host-page styling hooks.
  .replace(/^<svg(?![^>]*\sxmlns=)/, '<svg xmlns="http://www.w3.org/2000/svg"')
  .replace(/ style="max-width: [^"]*"/, "");
writeFileSync(output, svg);
const box = svg.match(/viewBox="([^"]*)"/)?.[1];
console.log(`${output}: ${(svg.length / 1024).toFixed(0)} KB, viewBox ${box}`);
