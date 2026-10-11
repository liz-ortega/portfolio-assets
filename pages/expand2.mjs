// Expand a Claude Design .dc.html page into static HTML for the Framer converter.
// "Framer mode": every interactive state is rendered, and elements are annotated with
// data-ov (code override name), data-grp/data-alt (stacked alternates), data-cc (code component)
// and data-skip (drop).
// Usage: node expand2.mjs <in.dc.html> <out.html> <Page>
import pw from "/home/claude/.npm-global/lib/node_modules/playwright/index.js";
import fs from "fs";
const [, , inp, out, page] = process.argv;
const src = fs.readFileSync(inp, "utf8");
const ASSET = "https://cdn.jsdelivr.net/gh/liz-ortega/portfolio-assets@main/";
const b = await pw.chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.setContent("<!doctype html><html><body></body></html>");
const html = await p.evaluate(({ src, ASSET, page }) => {
  const doc = new DOMParser().parseFromString(src, "text/html");
  const scriptEl = doc.querySelector("script[data-dc-script]");
  const props = {};
  try {
    const dp = JSON.parse(scriptEl.getAttribute("data-props") || "{}");
    for (const [k, v] of Object.entries(dp)) if (!k.startsWith("$") && v && "default" in v) props[k] = v.default;
  } catch (e) {}
  class DCLogic { constructor(p) { this.props = p; this.state = {}; } setState(s) { Object.assign(this.state, typeof s === "function" ? s(this.state) : s); } }
  const Component = new Function("DCLogic", scriptEl.textContent + "\n;return Component;")(DCLogic);
  const inst = new Component(props);
  const vals = inst.renderVals();
  // Framer-mode tweaks to default visuals
  if (page === "Play") Object.assign(vals, { aliveBgTx: "#16151F", abanBgTx: "#16151F", abanBg: "rgba(255,255,255,0.55)" });
  const ev = (expr, scope) => { try { return new Function("__s", "with(__s){return (" + expr + ")}")(scope); } catch (e) { return undefined; } };
  const interp = (str, scope) => {
    const whole = str.match(/^\s*\{\{([\s\S]+?)\}\}\s*$/);
    if (whole) return ev(whole[1], scope);
    return str.replace(/\{\{([\s\S]+?)\}\}/g, (m, e) => { const v = ev(e, scope); return v == null ? "" : String(v); });
  };
  const holeName = (s) => { const m = (s || "").match(/^\s*\{\{\s*([\w.]+)\s*\}\}\s*$/); return m ? m[1] : null; };
  const dogPrefix = page === "Main" ? "Dog" : "PDog";
  const ALWAYS = (name) => {
    if (name === "isSpeed") return { ov: "SpeedOnly" };
    if (name === "isFull") return { ov: "FullOnly" };
    let m = name && name.match(/^show(\d)$/);
    if (m) return { ov: dogPrefix + m[1], grp: "dog", alt: m[1] !== "0" };
    if (name === "facePixel") return { ov: "FacePixel", grp: "face", alt: false };
    if (name === "facePhoto") return { ov: "FacePhoto", grp: "face", alt: true };
    return null;
  };
  const clickOv = (name, node, scope) => {
    if (!name) return null;
    if (name === "toSpeed") return "ToSpeed";
    if (name === "toFull") return (node.getAttribute("style") || "").includes("{{fullBg}}") ? "ToFull" : "GoFull";
    let m = name.match(/^pick(\d)$/);
    if (m) return (page === "Main" ? "PickDog" : "PPick") + m[1];
    if (name === "bark") return "Bark";
    if (name === "f.pick") { const l = scope.f && scope.f.label; return l === "all" ? "FilterAll" : l === "game" ? "FilterGame" : "FilterUx"; }
    const map = { showAlive: "ShowAlive", showAban: "ShowAban", showPixel: "ShowPixel", showPhoto: "ShowPhoto" };
    return map[name] || null;
  };
  const textOv = { "cur.line": "DogLine", "sel.name": "PName", "sel.tag": "PTag", "sel.fact": "PFact", modeHint: "ModeHint" };
  const xdc = doc.querySelector("x-dc");
  const outDoc = document.implementation.createHTMLDocument("x");
  const annotate = (el, a) => { if (!el || el.nodeType !== 1) return; if (a.ov) el.setAttribute("data-ov", a.ov); if (a.grp) el.setAttribute("data-grp", a.grp); if (a.alt) el.setAttribute("data-alt", "1"); };
  const expand = (node, scope, parent) => {
    if (node.nodeType === 3) {
      const t = node.textContent;
      if (t.includes("{{")) {
        for (const [k, ov] of Object.entries(textOv)) if (t.includes("{{" + k + "}}") && parent.nodeType === 1) parent.setAttribute("data-ov", ov);
        parent.appendChild(outDoc.createTextNode(String(interp(t, scope)).replace(/&amp;/g, "&")));
      } else parent.appendChild(outDoc.createTextNode(t));
      return;
    }
    if (node.nodeType !== 1) return;
    const tag = node.tagName.toLowerCase();
    if (tag === "script") return;
    if (tag === "sc-if") {
      const raw = node.getAttribute("value") || "";
      const a = ALWAYS(holeName(raw));
      if (a) {
        const before = parent.childNodes.length;
        for (const c of node.childNodes) expand(c, scope, parent);
        for (const c of [...parent.childNodes].slice(before)) annotate(c, a);
        return;
      }
      if (interp(raw, scope)) for (const c of node.childNodes) expand(c, scope, parent);
      return;
    }
    if (tag === "sc-for") {
      const listName = holeName(node.getAttribute("list"));
      const list = interp(node.getAttribute("list") || "", scope) || [];
      const as = node.getAttribute("as") || "item";
      list.forEach((item, i) => {
        const s = Object.assign(Object.create(scope), { [as]: item, index: i });
        const before = parent.childNodes.length;
        for (const c of node.childNodes) expand(c, s, parent);
        if (listName === "shown" && item.cat) {
          const first = [...parent.childNodes].slice(before).find((c) => c.nodeType === 1);
          if (first) first.setAttribute("data-ov", item.cat === "game" ? "CatGame" : "CatUx");
        }
      });
      return;
    }
    // Play: Columbus image is a single <img> whose src depends on state -> two stacked images
    if (tag === "img" && (node.getAttribute("src") || "").includes("{{colImg}}")) {
      const srcs = ["/_blob/d97b5d34ceac0bd9fd0afa99a259add6", "/_blob/a3c9b08d9a645d28f4c62da86a422754"];
      const alts = ["Columbus alive: the school under a bright blue sky", "Abandoned Columbus: an empty lot behind a worn fence"];
      srcs.forEach((s, i) => {
        const im = outDoc.createElement("img");
        im.setAttribute("src", s); im.setAttribute("alt", alts[i]);
        im.setAttribute("style", (node.getAttribute("style") || "").replace(/transition:[^;]*;?/, ""));
        annotate(im, { ov: i ? "ColAban" : "ColAlive", grp: "col", alt: !!i });
        parent.appendChild(im);
      });
      return;
    }
    const el = outDoc.createElement(tag === "helmet" ? "div" : tag === "x-dc" ? "div" : tag);
    for (const a of node.attributes) {
      if (a.name === "onclick" || a.name === "onClick") { const ov = clickOv(holeName(a.value), node, scope); if (ov) el.setAttribute("data-ov", ov); continue; }
      if (/^on[A-Z]/.test(a.name) || /^on[a-z]+$/.test(a.name)) continue;
      if (a.name.startsWith("hint-") || a.name === "loading") continue;
      let v = a.value.includes("{{") ? interp(a.value, scope) : a.value;
      if (typeof v === "function" || v === undefined || v === false || v === null) continue;
      if (v === true) v = "";
      el.setAttribute(a.name, String(v));
    }
    // About: indicator dots get their own style overrides
    if (tag === "span" && /\{\{dot([01])\}\}/.test(node.getAttribute("style") || "")) el.setAttribute("data-ov", /dot0/.test(node.getAttribute("style")) ? "DotPixel" : "DotPhoto");
    if (tag === "aside") { el.setAttribute("data-fillh", "1"); el.setAttribute("style", (el.getAttribute("style") || "").replace(/align-self:[^;]*;?/g, "") + ";align-self:stretch"); }
    if (tag === "div" && /^width:\s*8%;height:100%/.test(node.getAttribute("style") || "")) el.setAttribute("data-ov", "ProgressBar");
    if (tag === "span" && /^\s*\d+% · LEVEL (\d+)\s*$/.test(node.textContent)) el.setAttribute("data-ov", "Progress" + node.textContent.match(/LEVEL (\d+)/)[1]);
    if (tag === "helmet") el.setAttribute("data-helmet", "1");
    for (const c of node.childNodes) expand(c, scope, el);
    parent.appendChild(el);
  };
  const root = outDoc.createElement("div");
  for (const c of xdc.childNodes) expand(c, Object.assign(Object.create(null), vals), root);
  // nav order on every page: work, about, résumé, play (then "say hi")
  for (const pl of root.querySelectorAll('a.navlink[href="Play.dc.html"]')) {
    const links = [...pl.parentElement.children].filter((c) => c.classList && c.classList.contains("navlink"));
    const last = links[links.length - 1];
    if (last && last !== pl) last.after(pl);
  }
  // work cards: image zooms and "view case study" pill fades in on hover
  for (const im of root.querySelectorAll(".wcard .card-img")) im.setAttribute("data-ov", "CardImg");
  for (const pill of root.querySelectorAll(".wcard .pill")) pill.setAttribute("data-ov", "CardPill");
  // case-study sidebar: the project facts scroll away; only the contents list + progress stay on screen
  for (const aside of root.querySelectorAll("aside")) {
    const kids = [...aside.children];
    const i = kids.findIndex((k) => /^\s*contents/i.test(k.textContent));
    if (i < 0) continue;
    const box = outDoc.createElement("div");
    box.setAttribute("data-ov", "StickyToc");
    box.setAttribute("style", "display:flex;flex-direction:column;gap:14px");
    kids[i].before(box);
    for (const k of kids.slice(i)) box.appendChild(k);
    // slightly tighter contents links so the whole list fits on a laptop screen
    for (const a of box.querySelectorAll("a")) a.setAttribute("style", (a.getAttribute("style") || "").replace("padding:5px 0 5px 10px", "padding:3px 0 3px 10px"));
  }
  // ---- mobile polish (Liz's feedback, Oct 10) ----
  // LinkedIn reviews link: drop the "sign-in required" note, keep the pill on one line
  for (const sp of [...root.querySelectorAll("span")]) {
    if (/^\s*LinkedIn sign-in required\s*$/i.test(sp.textContent)) {
      const wrap = sp.parentElement; sp.remove();
      const a = wrap && wrap.querySelector("a");
      if (a && wrap.children.length === 1 && wrap.tagName === "SPAN") { a.setAttribute("style", (a.getAttribute("style") || "") + ";white-space:nowrap"); wrap.replaceWith(a); }
    }
  }
  // "looking for summer internships" pill: keep the green dot beside the first line when it wraps
  for (const sp of root.querySelectorAll("span")) {
    if (sp.children.length && /^\s*looking for summer internships/i.test(sp.textContent) && /border-radius:999px/.test(sp.getAttribute("style") || "")) {
      sp.setAttribute("style", (sp.getAttribute("style") || "").replace("align-items:center", "align-items:flex-start"));
      const dot = sp.firstElementChild;
      if (dot) dot.setAttribute("style", (dot.getAttribute("style") || "") + ";flex:none;margin-top:7px");
    }
  }
  // nav: mark the parts so phones get a centred, single-row nav
  for (const nav of root.querySelectorAll("nav")) {
    nav.setAttribute("data-m", "nav");
    const say = [...nav.querySelectorAll("a")].find((a) => /^\s*say hi/i.test(a.textContent));
    if (say) say.setAttribute("data-m", "sayhi");
    const links = nav.querySelector("a.navlink");
    if (links) links.parentElement.setAttribute("data-m", "navlinks");
  }
  // iPhones draw some arrows/triangles as colour emoji; ask for the plain text glyph instead
  const tw = outDoc.createTreeWalker(root, 4);
  for (let t = tw.nextNode(); t; t = tw.nextNode()) if (/[↗↖↘↙↔↕▶◀☀]/.test(t.data)) t.data = t.data.replace(/([↗↖↘↙↔↕▶◀☀])(?!︎)/g, "$1︎");
  const mcss = outDoc.createElement("style");
  mcss.textContent = `
@media (max-width: 1199px) { [data-ov="StickyToc"] { display: none !important; } }
@media (max-width: 809px) {
  [data-m="nav"] { flex-direction: column !important; justify-content: center !important; gap: 4px !important; padding: 8px 12px !important; }
  [data-m="navlinks"] { justify-content: center !important; flex-wrap: nowrap !important; gap: 0 !important; }
  [data-m="navlinks"] a.navlink { padding: 8px 8px !important; font-size: 14px !important; }
  [data-m="sayhi"] { margin-left: 6px !important; padding: 8px 13px !important; font-size: 14px !important; white-space: nowrap; }
}`;
  root.insertBefore(mcss, root.firstChild);
  // USPS before/after slider -> one code component; drop the range row
  for (const im of root.querySelectorAll("img")) {
    if (!/clip-path/.test(im.getAttribute("style") || "")) continue;
    const box = im.parentElement; const imgs = box.querySelectorAll("img");
    box.setAttribute("data-cc", "BeforeAfter");
    box.setAttribute("data-before", imgs[0].getAttribute("src")); box.setAttribute("data-after", imgs[1].getAttribute("src"));
    box.setAttribute("data-before-alt", imgs[0].getAttribute("alt") || "Before"); box.setAttribute("data-after-alt", imgs[1].getAttribute("alt") || "After");
  }
  // tall image in a scroll box -> ScrollImage code component
  for (const d of root.querySelectorAll("div")) {
    const st = d.getAttribute("style") || "";
    if (/overflow-y:\s*auto/.test(st) && d.children.length === 1 && d.children[0].tagName === "IMG") d.setAttribute("data-cc", "ScrollImage");
  }
  for (const r of root.querySelectorAll('input[type="range"]')) { const l = r.closest("label") || r; l.setAttribute("data-skip", "1"); }
  let body = root.innerHTML.replace(/\/_blob\/([0-9a-f]{32})/g, (m, id) => ASSET + id + "__EXT__");
  return "<!doctype html><html><head><meta charset='utf-8'></head><body style='margin:0'>" + body + "</body></html>";
}, { src, ASSET, page });
const dir = "/home/claude/portfolio-assets/";
const files = fs.readdirSync(dir);
let tweaked = html;
// small layout tweaks for Framer: keep the three sticky notes on one row on desktop
// Nodo: four insight cards read better as a 2 x 2 grid than 3 + 1
if (page === "LATech") { const k = tweaked.indexOf("INSIGHT 01"); const j = tweaked.lastIndexOf("minmax(220px,1fr)", k); if (j > 0) tweaked = tweaked.slice(0, j) + "minmax(300px,1fr)" + tweaked.slice(j + 17); }
// Home: drop the initials circles on testimonials until real photos are added
if (page === "Main") tweaked = tweaked.replace(/<span style="width:44px;height:44px;flex:none;border-radius:50%;[^"]*">[A-Z]{1,3}<\/span>/g, "");
if (page === "FixIt") tweaked = tweaked.split("width:190px;min-height:170px;padding:18px 16px").join("width:160px;min-height:150px;padding:16px 14px");
if (page === "FixIt") tweaked = tweaked.split("flex:1 1 260px;padding:24px 22px").join("flex:1 1 220px;padding:24px 22px");
const fixed = tweaked.replace(/([0-9a-f]{32})__EXT__/g, (m, id) => { if (id === "d24634e048a85b999b854bfeb1f5fe57") return "Ortega-Elizabeth-Resume.pdf"; const f = files.find((x) => x.startsWith(id)); return f || id; });
const fixed2 = fixed.split("d24634e048a85b999b854bfeb1f5fe57.pdf").join("Ortega-Elizabeth-Resume.pdf");
fs.writeFileSync(out, fixed2);
console.log(out, fixed.length, (fixed.match(/\{\{/g) || []).length, "holes left", (fixed.match(/data-ov=/g) || []).length, "overrides");
await b.close();
