// HTML page -> Framer pasteboard. Runs inside the Framer editor tab.
// Needs window.__pbj (a real Framer copy payload, used as a template).
(() => {
  const RID = () => { const a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; let s = ''; for (let i = 0; i < 9; i++) s += a[Math.floor(Math.random() * a.length)]; return s; };
  // stable ids: the same DOM node gets the same layer id in every breakpoint build
  let IDS = new WeakMap(), SEQ = 0, PFX = 'pg';
  const idFor = (key, suffix) => {
    if (!key) return RID();
    let base = IDS.get(key);
    if (!base) { base = PFX + (SEQ++).toString(36).padStart(5, '0'); IDS.set(key, base); }
    return suffix ? base + suffix : base;
  };
  const OVPFX = 'local-module:codeFile/XWmYBIh:';
  const CCPFX = 'local-module:codeFile/qd3XfBd:';
  const tplRoot = window.__pbj.layers.tree.root.children[0];
  const FT = structuredClone(tplRoot); delete FT.children; delete FT.position; FT.visible = true; FT.opacity = 1; FT.rotation = 0;
  for (const k of ['duplicatedFrom', 'link', 'cursor', 'customCursorSmartComponentId', 'customCursorType', 'boxShadows', 'fillImage', 'fillImageOriginalName']) FT[k] = null;
  FT.boxShadows = []; FT.cursor = null; FT.customCursorType = null;
  const TT = structuredClone(tplRoot.children.find((c) => c.__class === 'RichTextNode')); delete TT.children; delete TT.position; TT.duplicatedFrom = null; TT.visible = true; TT.opacity = 1;
  for (const k of Object.keys(TT)) if (k.startsWith('stylePreset')) delete TT[k];

  const FONTS = {
    'instrument serif': { fam: '"Instrument Serif", "Instrument Serif Placeholder", serif', gf: 'Instrument Serif', w: { 400: 'regular' } },
    'instrument sans': { fam: '"Instrument Sans", "Instrument Sans Placeholder", sans-serif', gf: 'Instrument Sans', w: { 400: 'regular', 500: '500', 600: '600', 700: '700' } },
    'silkscreen': { fam: '"Silkscreen", "Silkscreen Placeholder", sans-serif', gf: 'Silkscreen', w: { 400: 'regular', 700: '700' } },
  };
  const b64 = (s) => btoa(unescape(encodeURIComponent(s)));
  const fontVars = (cs) => {
    const first = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim().toLowerCase();
    const f = FONTS[first] || FONTS['instrument sans'];
    const wt = parseInt(cs.fontWeight) || 400;
    const keys = Object.keys(f.w).map(Number);
    const near = keys.reduce((a, b) => Math.abs(b - wt) < Math.abs(a - wt) ? b : a, keys[0]);
    let variant = f.w[near];
    const italic = cs.fontStyle === 'italic';
    if (italic) variant = variant === 'regular' ? 'italic' : variant + 'italic';
    const v = [`--font-selector: ${b64('GF;' + f.gf + '-' + variant)}`, `--framer-font-family: ${f.fam}`];
    if (near !== 400) v.push(`--framer-font-weight: ${near}`);
    if (italic) v.push('--framer-font-style: italic');
    return v;
  };
  const textVars = (cs, base) => {
    const v = fontVars(cs);
    const fs = parseFloat(cs.fontSize);
    v.push(`--framer-font-size: ${Math.round(fs * 10) / 10}px`);
    v.push(`--framer-text-color: ${cs.color}`);
    if (base) {
      const lh = cs.lineHeight === 'normal' ? 1.2 : parseFloat(cs.lineHeight) / fs;
      v.push(`--framer-line-height: ${Math.round(lh * 100) / 100}em`);
      if (cs.textAlign === 'center' || cs.textAlign === 'right') v.push(`--framer-text-alignment: ${cs.textAlign}`);
    }
    const ls = parseFloat(cs.letterSpacing);
    if (ls) v.push(`--framer-letter-spacing: ${Math.round((ls / fs) * 1000) / 1000}em`);
    if (cs.textTransform && cs.textTransform !== 'none') v.push(`--framer-text-transform: ${cs.textTransform}`);
    if (cs.textDecorationLine && cs.textDecorationLine.includes('underline')) v.push('--framer-text-decoration: underline');
    else if (cs.textDecorationLine && cs.textDecorationLine.includes('line-through')) v.push('--framer-text-decoration: line-through');
    return v.join('; ').replace(/"/g, '&quot;');
  };
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const INLINE = new Set(['SPAN', 'EM', 'STRONG', 'B', 'I', 'A', 'BR', 'SMALL', 'CODE', 'SUP', 'SUB', 'U', 'MARK', 'ABBR', 'TIME', 'S']);
  const linkOf = (el) => { const a = el.closest('a[href]'); return a ? a : null; };
  let PAGEMAP = window.__pagemap || {};
  let PAGEIDS = window.__pageids || {};
  let CURDOC = null, CURPAGE = null;
  // returns a Framer link object or null
  const mapLink = (href) => {
    if (!href) return null;
    if (/^(mailto:|tel:)/.test(href)) return { type: 'url', url: href };
    if (href.startsWith('#')) {
      const t = CURDOC && href.length > 1 && CURDOC.getElementById(href.slice(1));
      if (!t || !CURPAGE || href === '#top') return null;
      return { webPageId: CURPAGE, hash: idFor(t), hashVariables: {}, type: 'webPage' };
    }
    const m = href.match(/^([A-Za-z]+)\.dc\.html(#.*)?$/);
    if (m) {
      if (PAGEIDS[m[1]]) return { webPageId: PAGEIDS[m[1]], type: 'webPage' };
      return { type: 'url', url: (PAGEMAP[m[1]] || ('/' + m[1].toLowerCase())) };
    }
    return { type: 'url', url: href };
  };
  const isExternal = (href) => /^https?:/.test(href || '');
  const linkAttr = (href, blank) => {
    const l = mapLink(href); if (!l) return '';
    const j = JSON.stringify(l).replace(/"/g, '&quot;');
    return ` data-framer-link="Link:${j}"` + (blank ? ' data-framer-open-in-new-tab=""' : '');
  };
  const inlineHTML = (node, pcs) => {
    let out = '';
    for (const c of node.childNodes) {
      if (c.nodeType === 3) { out += esc(c.textContent.replace(/\s+/g, ' ')); continue; }
      if (c.nodeType !== 1) continue;
      const cs = getComputedStyle(c);
      if (cs.display === 'none') continue;
      if (c.tagName === 'BR') { out += '<br>'; continue; }
      const inner = inlineHTML(c, cs);
      const diff = textVars(cs, false);
      let span = `<span style="${diff}">${inner}</span>`;
      if (c.tagName === 'A' && c.getAttribute('href')) span = `<a${linkAttr(c.getAttribute('href'), c.getAttribute('target') === '_blank' || /^https?:/.test(c.getAttribute('href')))}>${span}</a>`;
      out += span;
    }
    return out;
  };
  const isTextOnly = (el) => {
    let hasText = false;
    for (const c of el.childNodes) {
      if (c.nodeType === 3) { if (c.textContent.trim()) hasText = true; continue; }
      if (c.nodeType !== 1) continue;
      if (!INLINE.has(c.tagName)) return false;
      const cs = getComputedStyle(c);
      if (cs.display !== 'inline' && cs.display !== 'none' && c.tagName !== 'BR') return false;
      if (c.querySelector('img,svg,video')) return false;
      if (c.textContent.trim()) hasText = true;
    }
    return hasText;
  };
  const px = (v) => parseFloat(v) || 0;
  const color = (c) => (!c || c === 'rgba(0, 0, 0, 0)' || c === 'transparent') ? null : c;
  const assets = new Set();
  const META = new WeakMap();

  const frame = (name, r, extra, key) => Object.assign(structuredClone(FT), {
    id: idFor(key), name, children: [], width: Math.round(r.width), height: Math.round(r.height),
    widthType: 0, heightType: 0, left: null, top: null, right: null, bottom: null,
    fillEnabled: false, fillType: 'color', fillColor: 'rgba(0,0,0,0)', radius: 0, radiusTopLeft: 0, radiusTopRight: 0, radiusBottomLeft: 0, radiusBottomRight: 0, radiusPerCorner: false,
    borderEnabled: false, layout: null, gap: 0, padding: 0, paddingPerSide: false, paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0,
    opacity: 1, link: null, linkOpenInNewTab: false, stackWrapEnabled: false, intrinsicWidth: null, intrinsicHeight: null,
  }, extra || {});

  const applyBox = (n, cs, el) => {
    const bg = color(cs.backgroundColor);
    if (bg) { n.fillEnabled = true; n.fillType = 'color'; n.fillColor = bg; }
    const img = cs.backgroundImage;
    if (img && img.startsWith('linear-gradient')) {
      const cols = img.match(/rgba?\([^)]*\)/g);
      if (cols && cols.length) { n.fillEnabled = true; n.fillType = 'color'; n.fillColor = cols[Math.floor(cols.length / 2)]; }
    }
    const rr = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].map((v) => v.endsWith('%') ? Math.min(n.width, n.height) * px(v) / 100 : px(v)).map(Math.round);
    if (rr.some((x) => x)) {
      n.radius = rr[0]; n.radiusTopLeft = rr[0]; n.radiusTopRight = rr[1]; n.radiusBottomRight = rr[2]; n.radiusBottomLeft = rr[3];
      n.radiusPerCorner = !(rr[0] === rr[1] && rr[1] === rr[2] && rr[2] === rr[3]);
    }
    const bw = px(cs.borderTopWidth), bl = px(cs.borderLeftWidth), bb = px(cs.borderBottomWidth), br = px(cs.borderRightWidth);
    if ((bw || bl || bb || br) && cs.borderStyle !== 'none') {
      const sides = [[bw, cs.borderTopColor], [br, cs.borderRightColor], [bb, cs.borderBottomColor], [bl, cs.borderLeftColor]].sort((a, b) => b[0] - a[0]);
      n.borderEnabled = true; n.borderColor = sides[0][1];
      n.borderStyle = cs.borderTopStyle === 'dashed' || cs.borderBottomStyle === 'dashed' ? 'dashed' : 'solid';
      n.borderTop = bw; n.borderRight = br; n.borderBottom = bb; n.borderLeft = bl; n.borderWidth = Math.max(bw, bl, bb, br);
      n.borderPerSide = !(bw === bl && bl === bb && bb === br);
    }
    if (px(cs.opacity) < 1 && cs.opacity !== '') n.opacity = px(cs.opacity);
    const sh = cs.boxShadow;
    if (sh && sh !== 'none') {
      const m = sh.match(/(rgba?\([^)]*\))\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+([\d.]+)px(?:\s+(-?[\d.]+)px)?/);
      if (m && !sh.includes('inset')) n.boxShadows = [{ type: 'realistic', color: m[1], x: +m[2], y: +m[3], blur: +m[4], spread: +(m[5] || 0), inset: false, diffusion: 1, focus: 0.45, id: n.id + 's' }];
    }
    if (cs.overflow === 'hidden' || cs.overflowX === 'hidden' || cs.overflow === 'clip') n.overflow = 'clip';
    const a = el.tagName === 'A' ? el : null;
    if (a && a.getAttribute('href')) {
      const l = mapLink(a.getAttribute('href'));
      if (l) { n.link = l; n.linkOpenInNewTab = a.getAttribute('target') === '_blank' || isExternal(a.getAttribute('href')); }
    }
  };
  // code component instance (Video / BeforeAfter from Media.tsx)
  const ccNode = (el, r, name, controls) => {
    const tpl = structuredClone(window.__videoTpl.layers.tree.root.children[0]);
    for (const k of Object.keys(tpl)) if (k.startsWith('$control__')) delete tpl[k];
    const n = Object.assign(tpl, { id: idFor(el), name, children: [], width: Math.round(r.width), height: Math.round(r.height), widthType: 0, heightType: 0, left: null, top: null, right: null, bottom: null, visible: true, codeComponentIdentifier: CCPFX + name, aspectRatio: r.height ? Math.round((r.width / r.height) * 10000) / 10000 : null });
    delete n.position;
    for (const [k, v] of Object.entries(controls)) n['$control__' + k] = { type: typeof v === 'boolean' ? 'boolean' : typeof v === 'number' ? 'number' : (k === 'background' ? 'color' : (k === 'fit' ? 'enum' : 'string')), value: v };
    return n;
  };

  const imageNode = (el, r, cs, src, name) => {
    const n = frame(name || 'Image', r, null, el.__key || el);
    applyBox(n, cs, el);
    n.fillEnabled = true; n.fillType = 'image'; n.fillImage = src; assets.add(src);
    if (r.height) n.aspectRatio = Math.round((r.width / r.height) * 10000) / 10000;
    n.fillImageOriginalName = src.split('/').pop();
    n.fillImagePixelWidth = el.naturalWidth || +el.getAttribute('width') || Math.round(r.width);
    n.fillImagePixelHeight = el.naturalHeight || +el.getAttribute('height') || Math.round(r.height);
    n.fillImageResize = cs.objectFit === 'contain' ? 'fit' : 'fill';
    return n;
  };
  const svgNode = (el, r, cs) => {
    const clone = el.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', Math.round(r.width)); clone.setAttribute('height', Math.round(r.height));
    const data = 'data:image/svg+xml;base64,' + b64(new XMLSerializer().serializeToString(clone));
    const n = frame('Graphic', r, null, el);
    n.fillEnabled = true; n.fillType = 'image'; n.fillImage = data; n.fillImageOriginalName = 'graphic.svg';
    n.fillImagePixelWidth = Math.round(r.width); n.fillImagePixelHeight = Math.round(r.height); n.fillImageResize = 'fit';
    return n;
  };
  const textNode = (el, r, cs, htmlInner, name, key) => {
    const n = Object.assign(structuredClone(TT), {
      id: idFor(key || el), name: name || null, children: [], width: Math.ceil(r.width) + 1, height: Math.ceil(r.height),
      widthType: 0, heightType: 2, left: null, top: null, right: null, bottom: null,
      html: `<p dir="auto" style="${textVars(cs, true)}">${htmlInner}</p>`,
    });
    const lh = cs.lineHeight === 'normal' ? 1.2 * parseFloat(cs.fontSize) : parseFloat(cs.lineHeight);
    META.set(n, { singleLine: r.height <= lh * 1.5, align: cs.textAlign === 'center' ? 'center' : cs.textAlign === 'right' || cs.textAlign === 'end' ? 'end' : 'start' });
    return n;
  };

  const visible = (el, cs, r) => cs.display !== 'none' && cs.visibility !== 'hidden' && !(r.width < 0.5 || r.height < 0.5) && px(cs.opacity) > 0.01;

  // Build a node for element el. parentLayout: {dir, contentW, contentH} or null for absolute parent.
  const build = (el, parentCtx) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (!visible(el, cs, r)) return null;
    const tag = el.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'LINK' || tag === 'META' || el.dataset.helmet || el.dataset.skip) return null;
    let n;
    const name = el.getAttribute('aria-label') || el.id || null;
    const radiusOf = () => Math.round(px(cs.borderTopLeftRadius));
    if (el.dataset.cc === 'BeforeAfter') {
      n = ccNode(el, r, 'BeforeAfter', { before: el.dataset.before, after: el.dataset.after, beforeAlt: el.dataset.beforeAlt || 'Before', afterAlt: el.dataset.afterAlt || 'After', radius: radiusOf() });
      assets.add(el.dataset.before); assets.add(el.dataset.after);
    } else if (el.dataset.cc === 'ScrollImage') {
      const im = el.querySelector('img');
      n = ccNode(el, r, 'ScrollImage', { src: im.currentSrc || im.src, alt: im.alt || '', radius: radiusOf(), border: color(cs.borderTopColor) && px(cs.borderTopWidth) ? cs.borderTopColor : 'rgba(0,0,0,0)' });
      delete n.aspectRatio; n.heightType = 0; n.height = Math.round(r.height);
      n.$control__border.type = 'color';
      assets.add(im.currentSrc || im.src);
    } else if (tag === 'IMG') n = imageNode(el, r, cs, el.currentSrc || el.src, el.alt ? el.alt.slice(0, 40) : 'Image');
    else if (tag === 'VIDEO') {
      const bg = color(cs.backgroundColor) || 'rgba(0,0,0,0)';
      n = ccNode(el, r, 'Video', { src: el.getAttribute('src') || '', poster: el.getAttribute('poster') || '', autoplay: el.hasAttribute('autoplay') || el.dataset.autoplay === '1', controls: el.hasAttribute('controls'), radius: radiusOf(), fit: cs.objectFit === 'contain' ? 'contain' : 'cover', background: bg, label: el.getAttribute('aria-label') || '' });
      n.name = 'Video';
      // border on the video element -> wrap is not needed; borders are rare, keep radius only
    } else if (tag === 'svg' || tag === 'SVG') n = svgNode(el, r, cs);
    else if (isTextOnly(el) && !(color(cs.backgroundColor) || px(cs.paddingLeft) + px(cs.paddingTop) > 0 || px(cs.borderTopWidth) > 0 || tag === 'A' && (cs.display.includes('flex') || cs.display === 'inline-block'))) {
      n = textNode(el, r, cs, inlineHTML(el, cs));
      const a = el.tagName === 'A' ? el : null;
      if (a && a.getAttribute('href')) n.html = n.html.replace(/^<p([^>]*)>([\s\S]*)<\/p>$/, (m, at, inner) => `<p${at}><a${linkAttr(a.getAttribute('href'), a.getAttribute('target') === '_blank' || isExternal(a.getAttribute('href')))}>${inner}</a></p>`);
    } else if (isTextOnly(el) && tag !== 'A') {
      // text with its own background/padding/border -> padded frame around one text layer
      n = frame(name || tag.toLowerCase(), r, null, el);
      applyBox(n, cs, el);
      const pt = px(cs.paddingTop) + px(cs.borderTopWidth), pl = px(cs.paddingLeft) + px(cs.borderLeftWidth);
      const pr = px(cs.paddingRight) + px(cs.borderRightWidth), pb = px(cs.paddingBottom) + px(cs.borderBottomWidth);
      n.layout = 'stack'; n.stackDirection = 'vertical'; n.stackAlignment = cs.textAlign === 'center' ? 'center' : 'start'; n.stackDistribution = 'start'; n.gap = 0;
      n.padding = Math.round(pt); n.paddingTop = Math.round(pt); n.paddingRight = Math.round(pr); n.paddingBottom = Math.round(pb); n.paddingLeft = Math.round(pl);
      n.paddingPerSide = !(pt === pr && pr === pb && pb === pl);
      const t = textNode(el, { width: r.width - pl - pr, height: r.height - pt - pb }, cs, inlineHTML(el, cs));
      t.id = idFor(el, 't'); t.widthType = 3; t.width = Math.ceil(r.width - pl - pr) + 2; t.heightType = 2;
      META.set(t, Object.assign(META.get(t) || {}, {}));
      // one-line label (pill/badge): let the box hug its text so it never wraps if Framer's font is wider
      const lhv = cs.lineHeight === 'normal' ? px(cs.fontSize) * 1.3 : px(cs.lineHeight);
      if (r.height - pt - pb <= lhv * 1.5 && (cs.position === 'absolute' || !(cs.display === 'block' && el.parentElement && getComputedStyle(el.parentElement).display === 'block'))) {
        t.widthType = 2; n.widthType = 2; META.set(n, Object.assign(META.get(n) || {}, { hug: true }));
      }
      n.children.push(t);
      n.heightType = 2;
    } else {
      n = frame(name || tag.toLowerCase(), r, null, el);
      applyBox(n, cs, el);
      // children
      const kids = [];
      for (const c of el.childNodes) {
        if (c.nodeType === 3) {
          if (!c.textContent.trim()) continue;
          const range = document.createRange(); range.selectNodeContents(c); const tr = range.getBoundingClientRect();
          if (tr.width < 1) continue;
          kids.push({ text: c, r: tr, lines: new Set([...range.getClientRects()].map((q) => Math.round(q.top))).size });
        } else if (c.nodeType === 1) kids.push({ el: c });
      }
      const pt = px(cs.paddingTop) + px(cs.borderTopWidth), pl = px(cs.paddingLeft) + px(cs.borderLeftWidth);
      const pr = px(cs.paddingRight) + px(cs.borderRightWidth), pb = px(cs.paddingBottom) + px(cs.borderBottomWidth);
      const contentW = r.width - pl - pr, contentH = r.height - pt - pb;
      const disp = cs.display;
      let dir = 'vertical';
      if (disp.includes('flex')) dir = cs.flexDirection.startsWith('row') ? 'horizontal' : 'vertical';
      let isGrid = disp.includes('grid');
      const inflow = [], abs = [];
      for (const k of kids) {
        if (k.text) { inflow.push(k); continue; }
        const kcs = getComputedStyle(k.el);
        if (kcs.position === 'absolute' || kcs.position === 'fixed') abs.push(k); else inflow.push(k);
      }
      // inline content on one line (e.g. a small badge followed by text) -> horizontal row
      let inlineRow = false;
      if (!disp.includes('flex') && !isGrid && inflow.length > 1 && inflow.every((k) => (k.text && k.lines <= 1) || (k.el && /^inline/.test(getComputedStyle(k.el).display) && k.el.getClientRects().length <= 1))) {
        const rs = inflow.map((k) => (k.text ? k.r : k.el.getBoundingClientRect()));
        if (Math.max(...rs.map((x) => x.top)) < Math.min(...rs.map((x) => x.bottom))) { dir = 'horizontal'; inlineRow = true; }
      }
      n.layout = isGrid ? 'grid' : 'stack';
      n.stackDirection = dir;
      n.padding = Math.round(pt); n.paddingTop = Math.round(pt); n.paddingRight = Math.round(pr); n.paddingBottom = Math.round(pb); n.paddingLeft = Math.round(pl);
      n.paddingPerSide = !(pt === pr && pr === pb && pb === pl);
      const ai = cs.alignItems, jc = cs.justifyContent;
      const mapA = (v) => v.includes('center') ? 'center' : (v.includes('end') ? 'end' : 'start');
      if (disp.includes('flex')) {
        n.stackAlignment = ai === 'stretch' || ai === 'normal' ? 'start' : mapA(ai);
        n.stackDistribution = jc.includes('between') ? 'space-between' : jc.includes('around') ? 'space-around' : jc.includes('evenly') ? 'space-evenly' : mapA(jc);
        n.stackWrapEnabled = cs.flexWrap === 'wrap';
        if (n.stackWrapEnabled) {
          const kq = [...el.children].filter((c) => { const k = getComputedStyle(c); return k.position !== 'absolute' && k.display !== 'none'; }).map((c) => c.getBoundingClientRect()).filter((q) => q.width > 0 && q.height > 0);
          if (dir === 'horizontal') {
            const rows = [];
            for (const q of kq) {
              const row = rows.find((rw) => q.top < rw.bottom - 1 && q.bottom > rw.top + 1);
              if (row) { row.top = Math.min(row.top, q.top); row.bottom = Math.max(row.bottom, q.bottom); row.n++; } else rows.push({ top: q.top, bottom: q.bottom, n: 1 });
            }
            const maxPer = Math.max(...rows.map((rw) => rw.n));
            const allGrow = [...el.children].every((c) => getComputedStyle(c).position === 'absolute' || parseFloat(getComputedStyle(c).flexGrow) > 0);
            if (rows.length <= 1) n.stackWrapEnabled = false;
            else if (maxPer > 1 && allGrow) { isGrid = true; n.stackWrapEnabled = false; n.__forceCols = maxPer; }
            else if (kq.length > 1 && rows.length === kq.length) {
              // every child on its own row -> it's really a vertical stack at this width
              dir = 'vertical'; n.stackDirection = 'vertical'; n.stackWrapEnabled = false; n.stackDistribution = 'start';
              n.stackAlignment = ai.includes('center') && !jc.includes('between') ? 'center' : 'start';
            }
          } else if (new Set(kq.map((q) => Math.round(q.left / 8))).size <= 1) n.stackWrapEnabled = false;
        }
      } else if (inlineRow) { n.stackAlignment = 'center'; n.stackDistribution = cs.textAlign === 'center' ? 'center' : 'start'; }
      else { n.stackAlignment = cs.textAlign === 'center' ? 'center' : 'start'; n.stackDistribution = 'start'; }
      const rowGap = px(cs.rowGap), colGap = px(cs.columnGap);
      // build children
      const built = [];
      for (const k of inflow) {
        let cn, kr, kel = k.el;
        if (k.text) {
          kr = k.r; cn = textNode(el, kr, cs, esc(k.text.textContent.replace(/\s+/g, ' ').trim()), null, k.text);
        } else {
          kr = kel.getBoundingClientRect(); cn = build(kel, { dir, contentW, contentH, isGrid });
        }
        if (!cn) continue;
        built.push({ n: cn, r: kr, el: kel });
      }
      if (disp.includes('flex')) {
        const ord = (b) => (b.el ? parseInt(getComputedStyle(b.el).order) || 0 : 0);
        built.forEach((b, i) => { b.i = i; });
        built.sort((a, b) => ord(a) - ord(b) || a.i - b.i);
        if (cs.flexDirection.includes('reverse')) built.reverse();
      }
      const multicol = (cs.columnCount !== 'auto' || cs.columnWidth !== 'auto') && built.length > 1;
      const colCount = () => new Set(built.map((b) => Math.round(b.r.left / 6))).size;
      if (multicol || isGrid) {
        let cols = n.__forceCols || Math.max(1, Math.min(built.length || 1, colCount()));
        delete n.__forceCols;
        // fixed-count grids squeezed on small screens: fall back to fewer columns
        if (cols > 1 && contentW / cols < 120) cols = Math.max(1, Math.floor(contentW / 150));
        if (cols === 1 && !n.__keepGrid) {
          // one column: a plain vertical stack, so each card is only as tall as its own content
          n.layout = 'stack'; n.stackDirection = 'vertical'; n.stackWrapEnabled = false; n.stackDistribution = 'start'; n.stackAlignment = 'start';
          n.gap = Math.round(rowGap || px(cs.gap) || colGap);
          for (const b of built) {
            b.n.gridItemFillCellWidth = false; b.n.gridItemFillCellHeight = false;
            if (b.n.__class === 'RichTextNode' || b.n.layout || b.n.fillType !== 'image') { b.n.widthType = 3; b.n.width = 1; }
            else { b.n.widthType = 3; b.n.width = 1; }
            if (b.n.__class === 'RichTextNode' || b.n.layout) b.n.heightType = 2;
          }
        } else {
        n.layout = 'grid';
        n.gridColumnCount = cols; n.gridColumnWidthType = 'minmax'; n.gridColumnMinWidth = 10; n.gridColumnWidth = 10; n.gridRowHeightType = 'auto';
        n.gridRowCount = Math.ceil(built.length / cols); n.gridAlignment = 'start';
        n.gap = Math.round(multicol ? (px(cs.columnGap) || 16) : (colGap || rowGap || px(cs.gap)));
        if (multicol) n.gridType = 'columnMasonry';
        const stretch = !multicol && (cs.alignItems === 'normal' || cs.alignItems === 'stretch');
        for (const b of built) {
          b.n.widthType = 3; b.n.width = 1; b.n.gridItemFillCellWidth = true; b.n.gridItemFillCellHeight = false;
          if (b.n.__class === 'RichTextNode' || b.n.layout) b.n.heightType = 2;
          if (stretch && b.n.__class === 'FrameNode' && b.n.layout && b.n.fillType !== 'image') { b.n.gridItemFillCellHeight = true; b.n.heightType = 3; b.n.height = 1; }
        }
        }
      } else {
        // measure gaps along main axis
        const main = dir === 'vertical' ? 'top' : 'left', mainEnd = dir === 'vertical' ? 'bottom' : 'right';
        let gaps = [];
        for (let i = 1; i < built.length; i++) gaps.push(built[i].r[main] - built[i - 1].r[mainEnd]);
        const cssGap = dir === 'vertical' ? rowGap : colGap;
        let g = cssGap;
        if (!disp.includes('flex') || n.stackWrapEnabled) g = n.stackWrapEnabled ? cssGap : (gaps.length ? Math.max(0, Math.min(...gaps)) : 0);
        n.gap = Math.round(Math.max(0, g));
        if (n.stackWrapEnabled) { n.gap = Math.round(colGap || rowGap); }
        const out = [];
        built.forEach((b, i) => {
          if (i > 0 && !n.stackWrapEnabled && n.stackDistribution === 'start') {
            const extra = Math.round(gaps[i - 1] - n.gap);
            if (extra >= 2) { const sp = frame('Spacer', { width: dir === 'vertical' ? 1 : extra, height: dir === 'vertical' ? extra : 1 }, { widthType: dir === 'vertical' ? 3 : 0 }); sp.id = b.n.id + 'p'; out.push(sp); }
          }
          out.push(b.n);
        });
        // first-child offset (e.g. margin-top) -> add to padding
        if (built.length && !n.stackWrapEnabled && n.stackDistribution === 'start') {
          const off = Math.round(built[0].r[main] - (r[main] + (dir === 'vertical' ? pt : pl)));
          if (off >= 2) { if (dir === 'vertical') n.paddingTop += off; else n.paddingLeft += off; n.paddingPerSide = true; }
        }
        const rmap = new Map(built.map((b) => [b.n, b])); built.length = 0; out.forEach((x) => { const o = rmap.get(x); built.push({ n: x, r: o && o.r, el: o && o.el }); });
        // cross-axis centering for auto-margin children (block layouts)
        if (!disp.includes('flex') && !inlineRow) {
          const cands = built.filter((b) => b.r && b.n.name !== 'Spacer');
          const centered = cands.filter((b) => { const l = b.r.left - (r.left + pl), rr2 = (r.right - pr) - b.r.right; return Math.abs(l - rr2) <= 2 && l > 2; });
          if (centered.length && centered.length === cands.filter((b) => Math.abs(b.n.width - contentW) > 2).length) n.stackAlignment = 'center';
        }
        // sizing per child
        for (const b of built) {
          const cn = b.n; if (cn.name === 'Spacer') continue;
          const m = META.get(cn) || {};
          const cw = cn.width;
          const fillsCross = Math.abs(cw - contentW) <= 2;
          if (cn.__class === 'RichTextNode') {
            if (dir === 'vertical' && fillsCross) cn.widthType = 3;
            else if (m.singleLine) cn.widthType = 2;
            else cn.width = cn.width + 2;
          } else if (cn.fillType !== 'image' && cn.layout) {
            if (dir === 'horizontal') cn.widthType = m.grow ? 3 : (m.pill && !m.explicitW && !m.wraps ? 2 : 0);
            else if (fillsCross) cn.widthType = 3;
            else if (m.pill && !m.explicitW && !m.wraps) cn.widthType = 2;
            cn.heightType = (m.fillH && dir === 'horizontal') ? 3 : (m.explicitH ? 0 : 2);
          } else if (dir === 'vertical' && fillsCross) cn.widthType = 3;
          else if (dir === 'horizontal' && m.grow) cn.widthType = 3;
        }
      }
      // centred max-width blocks (margin: 0 auto)
      if (dir === 'vertical' && n.layout === 'stack') {
        const autoM = (b) => b.el && b.el.style && (/auto/.test(b.el.style.margin || '') || b.el.style.marginLeft === 'auto');
        const real = built.filter((b) => b.n.name !== 'Spacer');
        if (real.some(autoM) && real.every((b) => autoM(b) || b.n.widthType === 3)) n.stackAlignment = 'center';
      }
      for (const b of built) n.children.push(b.n);
      // absolute children
      for (const k of abs) {
        const kr = k.el.getBoundingClientRect();
        const cn = build(k.el, null); if (!cn) continue;
        const hug = (META.get(cn) || {}).hug;
        cn.position = 'absolute'; cn.widthType = hug ? 2 : 0; cn.heightType = (hug || cn.__class === 'RichTextNode') ? 2 : 0;
        const kcs = getComputedStyle(k.el);
        const L = kr.left - r.left, T = kr.top - r.top, R = r.right - kr.right, B = r.bottom - kr.bottom;
        const fillsBox = Math.abs(L) <= 1 && Math.abs(T) <= 1 && Math.abs(R) <= 1 && Math.abs(B) <= 1;
        if (fillsBox) { cn.left = 0; cn.top = 0; cn.right = 0; cn.bottom = 0; }
        else {
          if (kcs.left === 'auto' && kcs.right !== 'auto') { cn.right = Math.round(R); cn.left = null; }
          else if (kcs.left !== 'auto' && kcs.right !== 'auto' && !k.el.style.width) { cn.left = Math.round(L); cn.right = Math.round(R); cn.widthType = 0; }
          else cn.left = Math.round(L);
          if (kcs.top === 'auto' && kcs.bottom !== 'auto') { cn.bottom = Math.round(B); cn.top = null; }
          else if (kcs.top !== 'auto' && kcs.bottom !== 'auto' && !k.el.style.height) { cn.top = Math.round(T); cn.bottom = Math.round(B); }
          else cn.top = Math.round(T);
        }
        n.children.push(cn);
      }
      // a frame whose height is driven by content
      const explicitH = el.style.height || el.style.aspectRatio;
      n.heightType = explicitH ? 0 : 2;
      if (el.style.aspectRatio && r.height) n.aspectRatio = Math.round((r.width / r.height) * 10000) / 10000;
      if (!n.children.length) { n.layout = null; n.heightType = 0; }
    }
    if (n.__class === 'FrameNode' && tag === 'A' && n.layout) applyBox(n, cs, el);
    if (n.__class === 'FrameNode') {
      const st = el.style || {};
      META.set(n, Object.assign(META.get(n) || {}, { pill: cs.display.startsWith('inline') || (n.children.length <= 3 && n.children.every((c) => c.__class === 'RichTextNode' || c.fillType === 'image')), wraps: n.stackWrapEnabled, grow: parseFloat(cs.flexGrow) > 0 || (st.flex && /^[1-9]/.test(st.flex)), explicitW: !!(st.width || st.maxWidth || (st.flex && /px/.test(st.flex)) || st.aspectRatio), explicitH: !!(st.height || st.aspectRatio), fillH: !!(el.dataset && el.dataset.fillh) }));
      // min-height becomes a Framer min height, so the frame still grows/shrinks with its content
      if (/px$/.test(st.minHeight || '')) n.minHeight = Math.round(parseFloat(st.minHeight)) + 'px';
    } else if (!META.get(n)) META.set(n, {});
    if (n.__class === 'RichTextNode' && el.style && parseFloat(cs.flexGrow) > 0) META.get(n).grow = true;
    if (el.id && n.__class === 'FrameNode' && el.ownerDocument.querySelector('a[href="#' + el.id + '"]')) { n.elementId = el.id; n.scrollTargetEnabled = true; }
    if (/px$/.test(cs.maxWidth) && n.__class !== 'RichTextNode') n.maxWidth = Math.round(px(cs.maxWidth)) + 'px';
    if (el.dataset && el.dataset.rot) n.rotation = parseFloat(el.dataset.rot);
    if (el.dataset && el.dataset.ov) {
      // text overrides must sit on the text layer itself, not on a padded box around it
      const tgt = (/^(DogLine|PName|PTag|PFact|ModeHint)$/.test(el.dataset.ov) && n.__class === 'FrameNode' && n.children.length === 1 && n.children[0].__class === 'RichTextNode') ? n.children[0] : n;
      tgt.codeOverrideEnabled = true; tgt.codeOverrideIdentifier = OVPFX + 'with' + el.dataset.ov;
    }
    if (cs.position === 'sticky' && el.parentElement) {
      const beside = [...el.parentElement.children].some((c) => { if (c === el) return false; const q = c.getBoundingClientRect(); return q.height > 0 && q.top < r.bottom - 1 && q.bottom > r.top + 1; });
      if (beside) { n.position = 'sticky'; n.positionStickyTop = Math.round(px(cs.top)); }
    }
    return n;
  };

  // stack alternates (data-alt) on top of their group's default element
  const placeAlts = (doc) => {
    const alts = [...doc.querySelectorAll('[data-alt]')];
    alts.forEach((a) => { a.style.position = ''; a.style.left = ''; a.style.top = ''; a.style.width = ''; a.style.display = 'none'; });
    for (const a of alts) {
      const par = a.parentElement;
      const def = [...par.children].find((c) => c.dataset.grp === a.dataset.grp && !c.dataset.alt);
      if (!def) { a.style.display = ''; continue; }
      if (getComputedStyle(par).position === 'static') par.style.position = 'relative';
      const pr = par.getBoundingClientRect(), dr = def.getBoundingClientRect();
      const pcs = getComputedStyle(par);
      a.dataset.pos = JSON.stringify({ left: dr.left - pr.left - px(pcs.borderLeftWidth), top: dr.top - pr.top - px(pcs.borderTopWidth), width: dr.width });
    }
    for (const a of alts) {
      a.style.display = '';
      if (!a.dataset.pos) continue;
      const p = JSON.parse(a.dataset.pos);
      a.style.position = 'absolute'; a.style.left = p.left + 'px'; a.style.top = p.top + 'px'; a.style.width = p.width + 'px'; a.style.margin = '0';
    }
  };

  const buildTree = (doc, rootEl, opts) => {
    PAGEMAP = window.__pagemap || {}; PAGEIDS = window.__pageids || {};
    const prevGCS = window.getComputedStyle;
    const view = doc.defaultView;
    window.getComputedStyle = (e) => view.getComputedStyle(e);
    const prevCR = document.createRange.bind(document);
    document.createRange = () => doc.createRange();
    try {
      // measure without rotations (rotated boxes report inflated sizes); re-apply as layer rotation
      for (const e of doc.querySelectorAll('[style*="rotate"]')) {
        const m = (e.getAttribute('style') || '').match(/rotate\((-?[\d.]+)deg\)/);
        if (m && !e.dataset.rot) { e.dataset.rot = m[1]; e.style.transform = 'none'; }
      }
      placeAlts(doc);
      const root = build(rootEl, null);
      delete root.position; root.left = null; root.top = null; root.widthType = 3; root.heightType = 2;
      const clean = (n) => { for (const k of ['cursor', 'customCursorSmartComponentId', 'customCursorType', 'fillImage', 'fillImageOriginalName', 'intrinsicHeight', 'intrinsicWidth', 'link', 'duplicatedFrom', 'layout', 'overflow', 'aspectRatio', 'right', 'bottom']) if (n[k] === null || n[k] === undefined) delete n[k]; (n.children || []).forEach(clean); };
      clean(root);
      const fitfix = (n, parentFit) => {
        if (parentFit && n.widthType === 3) { const m = META.get(n) || {}; n.widthType = (n.__class === 'RichTextNode' && m.singleLine) ? 2 : 0; }
        (n.children || []).forEach((c) => fitfix(c, n.widthType === 2));
      };
      fitfix(root, false);
      const fr = (n) => { const horiz = n.layout === 'stack' && n.stackDirection === 'horizontal'; (n.children || []).forEach((c) => { if (c.widthType === 3) c.width = horiz ? Math.max(1, Math.round(c.width)) : 1; fr(c); }); };
      root.width = 1;
      fr(root);
      // aspect ratio only matters when the width can change
      const ar = (n) => { if (n.aspectRatio && n.widthType !== 3) delete n.aspectRatio; else if (n.aspectRatio) n.heightType = 0; (n.children || []).forEach(ar); };
      ar(root);
      root.name = opts.name || 'Page';
      return root;
    } finally { window.getComputedStyle = prevGCS; document.createRange = prevCR; }
  };

  const BPKEYS = ['layout', 'gridType', 'maxWidth', 'width', 'height', 'widthType', 'heightType', 'stackDirection', 'stackDistribution', 'stackAlignment', 'stackWrapEnabled', 'gap', 'padding', 'paddingPerSide', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'gridColumnCount', 'gridRowCount', 'html', 'left', 'top', 'right', 'bottom', 'fillImage', 'aspectRatio', 'radius', 'radiusTopLeft', 'radiusTopRight', 'radiusBottomLeft', 'radiusBottomRight', 'positionStickyTop'];
  const index = (n, m = new Map()) => { m.set(n.id, n); (n.children || []).forEach((c) => index(c, m)); return m; };
  const diffTrees = (D, X) => {
    const dm = index(D), xm = index(X), out = {};
    for (const [id, dn] of dm) {
      if (id === D.id) continue;
      const xn = xm.get(id);
      if (!xn) { if (dn.visible !== false) out[id] = { visible: false }; continue; }
      if (xn.__class !== dn.__class) continue;
      const o = {};
      for (const k of BPKEYS) {
        const a = dn[k], b = xn[k];
        if (JSON.stringify(a) !== JSON.stringify(b) && b !== undefined) o[k] = b;
      }
      if (dn.position === 'sticky' && xn.position !== 'sticky') o.position = null;
      if (Object.keys(o).length) out[id] = o;
    }
    return out;
  };

  // Build the page at several widths; returns the desktop tree plus per-breakpoint overrides
  window.__f2f = async (doc, rootEl, opts = {}) => {
    IDS = new WeakMap(); SEQ = 0; PFX = opts.pfx || 'pg'; CURDOC = doc; CURPAGE = opts.pageId || null;
    assets.clear();
    const ifr = doc.defaultView.frameElement;
    const widths = opts.widths || [1200, 810, 390];
    const trees = [];
    for (const w of widths) {
      ifr.style.width = w + 'px';
      await new Promise((r) => setTimeout(r, 400));
      trees.push(buildTree(doc, rootEl, opts));
    }
    ifr.style.width = widths[0] + 'px';
    const root = trees[0];
    const fix = (n, pid) => { n.parentid = pid; (n.children || []).forEach((c) => fix(c, n.id)); };
    fix(root, 'clipboard');
    const env = structuredClone(window.__pbj);
    env.layers.tree.root.children = [root];
    env.layers.originalFrames = {}; env.layers.masters = {}; env.layers.replicas = {}; env.layers.renamedIds = {};
    env.layers.breakpointOverrides = widths.slice(1).map((w, i) => [w, diffTrees(root, trees[i + 1])]);
    env.layers.webPagePathByWebPageId = {};
    env.assets = [...assets];
    let count = 0; const cnt = (n) => { count++; (n.children || []).forEach(cnt); }; cnt(root);
    return { env, count, height: root.height, bp: env.layers.breakpointOverrides.map(([w, o]) => [w, Object.keys(o).length]) };
  };
  window.__mk = (j) => '<p xmlns="http://www.w3.org/1999/xhtml"><span data-framer-pasteboard="' + JSON.stringify(j).replace(/&/g, '&amp;').replace(/"/g, '&quot;') + '" data-framer-pasteboard-type="application/x-framer-layers"></span></p>';
  window.__loadPage = async (url, width) => {
    const html = await (await fetch(url)).text();
    let ifr = document.getElementById('__f2f_iframe');
    if (ifr) ifr.remove();
    ifr = document.createElement('iframe'); ifr.id = '__f2f_iframe';
    ifr.style.cssText = `position:fixed;left:-${width + 200}px;top:0;width:${width}px;height:1000px;border:0;visibility:hidden`;
    document.body.appendChild(ifr);
    await new Promise((res) => { ifr.onload = res; ifr.srcdoc = html; });
    const d = ifr.contentDocument;
    await d.fonts.ready;
    await Promise.all([...d.images].map((im) => im.complete ? 1 : new Promise((r) => { im.onload = im.onerror = r; })));
    await Promise.all([...d.querySelectorAll('video')].map((v) => { v.dataset.autoplay = v.hasAttribute('autoplay') ? '1' : ''; v.removeAttribute('autoplay'); v.pause(); v.preload = 'metadata'; return v.readyState >= 1 ? 1 : new Promise((r) => { v.onloadedmetadata = v.onerror = r; setTimeout(r, 6000); v.load(); }); }));
    await new Promise((r) => setTimeout(r, 500));
    return d;
  };
  return 'f2f ready';
})();
