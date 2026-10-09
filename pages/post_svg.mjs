// Replace inline <svg> elements with <img> files hosted in the asset repo (Framer previews can't show svg data URLs).
// Usage: node post_svg.mjs file.html [...]
import pw from "/home/claude/.npm-global/lib/node_modules/playwright/index.js";
import fs from "fs";
import crypto from "crypto";
const ASSET = "https://cdn.jsdelivr.net/gh/liz-ortega/portfolio-assets@main/svg/";
fs.mkdirSync("/home/claude/portfolio-assets/svg", { recursive: true });
const b = await pw.chromium.launch();
const p = await b.newPage();
for (const f of process.argv.slice(2)) {
  const html = fs.readFileSync(f, "utf8");
  await p.setContent("<!doctype html><html><body></body></html>");
  const res = await p.evaluate((html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const out = [];
    for (const svg of [...doc.querySelectorAll("svg")]) {
      if (svg.parentElement && svg.parentElement.closest("svg")) continue;
      const clone = svg.cloneNode(true);
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      for (const a of [...clone.attributes]) if (a.name.startsWith("data-") || a.name === "style" || a.name === "class" || a.name.startsWith("aria-")) clone.removeAttribute(a.name);
      const text = new XMLSerializer().serializeToString(clone);
      const img = doc.createElement("img");
      for (const a of svg.attributes) if (a.name.startsWith("data-") || a.name === "style" || a.name === "class" || a.name === "width" || a.name === "height") img.setAttribute(a.name, a.value);
      img.setAttribute("alt", svg.getAttribute("aria-label") || "");
      img.setAttribute("data-svgtext", text);
      svg.replaceWith(img);
      out.push(text);
    }
    return { html: "<!doctype html>" + doc.documentElement.outerHTML, n: out.length };
  }, html);
  // hash each svg text and write files
  let h = res.html.replace(/data-svgtext="([^"]*)"/g, (m, enc) => {
    const text = enc.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
    const id = crypto.createHash("md5").update(text).digest("hex");
    fs.writeFileSync(`/home/claude/portfolio-assets/svg/${id}.svg`, text);
    return `src="${ASSET}${id}.svg"`;
  });
  fs.writeFileSync(f, h);
  console.log(f, res.n, "svgs");
}
await b.close();
