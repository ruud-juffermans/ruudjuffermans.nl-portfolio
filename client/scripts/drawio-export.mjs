// Exports .drawio files to SVG without the draw.io desktop app, by driving
// draw.io's embed mode (embed.diagrams.net) in headless Chrome over the
// DevTools protocol. Needs Google Chrome installed and network access; the
// diagram XML is sent to diagrams.net for rendering.
//
//   node scripts/drawio-export.mjs <out-dir> <file.drawio>...
//
// Writes <out-dir>/<name>.svg as draw.io's "xmlsvg" export (the SVG keeps the
// diagram source, so it still opens in draw.io). Pipe the result through
// scripts/drawio-to-web.mjs for the site's dark-only variant:
//
//   node scripts/drawio-export.mjs /tmp/svg ../projects/foo/*.drawio
//   node scripts/drawio-to-web.mjs /tmp/svg/foo.svg public/images/foo.svg
//
// Files may be a bare <mxGraphModel> (as saved by draw.io "Extras → Edit
// diagram") or a full <mxfile>.

import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { basename, join } from "node:path";
import { tmpdir } from "node:os";

const CHROME =
  process.env.CHROME_BIN ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const [outDir, ...files] = process.argv.slice(2);
if (!outDir || files.length === 0) {
  console.error("usage: node scripts/drawio-export.mjs <out-dir> <file.drawio>...");
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });

const diagrams = files.map((f) => {
  let xml = readFileSync(f, "utf8").trim();
  if (!xml.startsWith("<mxfile")) {
    xml = `<mxfile host="embed.diagrams.net"><diagram name="Page-1" id="p1">${xml}</diagram></mxfile>`;
  }
  return { name: basename(f).replace(/\.drawio$/, ""), xml };
});

// The host page: loads each diagram into the embed iframe, asks for an
// xmlsvg export, and posts the result back to this server.
const page = `<!doctype html><meta charset="utf-8"><body><script>
const DIAGRAMS = ${JSON.stringify(diagrams)};
let i = 0, frame;
const send = (m) => frame.contentWindow.postMessage(JSON.stringify(m), "*");
const load = () => send({ action: "load", xml: DIAGRAMS[i].xml, autosave: 0 });
window.addEventListener("message", async (ev) => {
  let msg; try { msg = JSON.parse(ev.data); } catch { return; }
  if (msg.event === "init") load();
  else if (msg.event === "load") send({ action: "export", format: "xmlsvg", transparent: true, border: 10, scale: 1 });
  else if (msg.event === "export") {
    const svg = decodeURIComponent(escape(atob(msg.data.split(",")[1])));
    await fetch("/save?name=" + encodeURIComponent(DIAGRAMS[i].name), { method: "POST", body: svg });
    console.log("exported " + DIAGRAMS[i].name);
    if (++i < DIAGRAMS.length) load(); else console.log("__DONE__");
  }
});
frame = document.createElement("iframe");
frame.width = 1600; frame.height = 1000;
frame.src = "https://embed.diagrams.net/?embed=1&proto=json&spin=1&dark=0&ui=min";
document.body.appendChild(frame);
</script>`;

const server = createServer((req, res) => {
  if (req.method === "POST" && req.url.startsWith("/save")) {
    const name = new URL(req.url, "http://x").searchParams.get("name");
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const out = join(outDir, `${basename(name)}.svg`);
      writeFileSync(out, Buffer.concat(chunks));
      console.log(`wrote ${out}`);
      res.end("ok");
    });
    return;
  }
  res.setHeader("content-type", "text/html; charset=utf-8");
  res.end(page);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const pageUrl = `http://127.0.0.1:${server.address().port}/`;

const profile = join(tmpdir(), `drawio-export-${process.pid}`);
const chrome = spawn(
  CHROME,
  ["--headless=new", "--disable-gpu", "--no-first-run", "--remote-debugging-port=0",
   `--user-data-dir=${profile}`, "about:blank"],
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
let done = false;
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id) { pending.get(m.id)?.(m.result); pending.delete(m.id); return; }
  if (m.method === "Runtime.consoleAPICalled") {
    const text = m.params.args.map((a) => a.value ?? a.description).join(" ");
    if (text === "__DONE__") done = true; else console.log(text);
  }
  if (m.method === "Runtime.exceptionThrown") console.error(JSON.stringify(m.params.exceptionDetails).slice(0, 600));
};
const send = (method, params = {}) =>
  new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });

await send("Runtime.enable");
await send("Page.navigate", { url: pageUrl });
const deadline = Date.now() + 60_000 + 20_000 * diagrams.length;
while (!done && Date.now() < deadline) await new Promise((r) => setTimeout(r, 250));

ws.close();
chrome.kill("SIGKILL");
rmSync(profile, { recursive: true, force: true });
server.close();
if (!done) { console.error("timed out waiting for draw.io"); process.exit(1); }
