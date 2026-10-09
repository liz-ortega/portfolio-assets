// HTML page -> Framer pasteboard. Runs inside the Framer editor tab.
// Needs window.__pbj (a real Framer copy payload, used as a template).
(() => {
  const RID = () => { const a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; let s = ''; for (let i = 0; i < 9; i++) s += a[Math.floor(Math.random() * a.length)]; return s; };
  const tplRoot = window.__pbj.layers.tree.root.children[0];
  const FT = structuredClone(tplRoot); delete FT.children; delete FT.position;
  for (const k of ['duplicatedFrom', 'link', 'cursor', 'customCursorSmartComponentId', 'customCursorType', 'boxShadows', 'fillImage', 'fillImageOriginalName']) FT[k] = null;
  FT.boxShadows = []; FT.cursor = null; FT.customCursorType = null;
  const TT = structuredClone(tplRoot.children.find((c) => c.__class === 'RichTextNode')); delete TT.children; delete TT.position; TT.duplicatedFrom = null;
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
    return v.join('; ');
  };
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const INLINE = new Set(['SPAN', 'EM', 'STRONG', 'B', 'I', 'A', 'BR', 'SMALL', 'CODE', 'SUP', 'SUB', 'U', 'MARK', 'ABBR', 'TIME', 'S']);
  const linkOf = (el) => { const a = el.closest('a[href]'); return a ? a : null; };
  let PAGEMAP = window.__pagemap || {};
  const mapHref = (href) => {
    if (!href) return null;
    if (/^(mailto:|tel:)/.test(href)) return href;
    if (href.startsWith('#')) return null;
    const m = href.match(/^([A-Za-z]+)\.dc\.html(#.*)?$/);
    if (m) return (PAGEMAP[m[1]] || ('/' + m[1].toLowerCase())) + (m[2] && m[2] !== '#top' ? m[2] : '');
    return href;
  };
  const linkAttr = (href, blank) => {
    const u = mapHref(href); if (!u) return '';
    const j = JSON.stringify({ url: u, type: 'url' }).replace(/"/g, '&quot;');
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

  const frame = (name, r, extra) => Object.assign(structuredClone(FT), {
    id: RID(), name, children: [], width: Math.round(r.width), height: Math.round(r.height),
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
      n.borderEnabled = true; n.borderColor = cs.borderTopColor !== 'rgba(0, 0, 0, 0)' ? cs.borderTopColor : cs.borderBottomColor;
      n.borderStyle = cs.borderTopStyle === 'dashed' || cs.borderBottomStyle === 'dashed' ? 'dashed' : 'solid';
      n.borderTop = bw; n.borderRight = br; n.borderBottom = bb; n.borderLeft = bl; n.borderWidth = Math.max(bw, bl, bb, br);
      n.borderPerSide = !(bw === bl && bl === bb && bb === br);
    }
    if (px(cs.opacity) < 1 && cs.opacity !== '') n.opacity = px(cs.opacity);
    const sh = cs.boxShadow;
    if (sh && sh !== 'none') {
      const m = sh.match(/(rgba?\([^)]*\))\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+([\d.]+)px(?:\s+(-?[\d.]+)px)?/);
      if (m && !sh.includes('inset')) n.boxShadows = [{ type: 'realistic', color: m[1], x: +m[2], y: +m[3], blur: +m[4], spread: +(m[5] || 0), inset: false, diffusion: 1, focus: 0.45, id: RID() }];
    }
    if (cs.overflow === 'hidden' || cs.overflowX === 'hidden' || cs.overflow === 'clip') n.overflow = 'clip';
    const a = el.tagName === 'A' ? el : null;
    if (a && a.getAttribute('href')) {
      const u = mapHref(a.getAttribute('href'));
      if (u) { n.link = { type: 'url', url: u }; n.linkOpenInNewTab = a.getAttribute('target') === '_blank' || /^https?:/.test(u); }
    }
  };

  const imageNode = (el, r, cs, src, name) => {
    const n = frame(name || 'Image', r);
    applyBox(n, cs, el);
    n.fillEnabled = true; n.fillType = 'image'; n.fillImage = src; assets.add(src);
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
    const n = frame('Graphic', r);
    n.fillEnabled = true; n.fillType = 'image'; n.fillImage = data; n.fillImageOriginalName = 'graphic.svg';
    n.fillImagePixelWidth = Math.round(r.width); n.fillImagePixelHeight = Math.round(r.height); n.fillImageResize = 'fit';
    return n;
  };
  const textNode = (el, r, cs, htmlInner, name) => {
    const n = Object.assign(structuredClone(TT), {
      id: RID(), name: name || null, children: [], width: Math.ceil(r.width) + 1, height: Math.ceil(r.height),
      widthType: 0, heightType: 2, left: null, top: null, right: null, bottom: null,
      html: `<p dir="auto" style="${textVars(cs, true)}">${htmlInner}</p>`,
    });
    return n;
  };

  const visible = (el, cs, r) => cs.display !== 'none' && cs.visibility !== 'hidden' && !(r.width < 0.5 || r.height < 0.5) && px(cs.opacity) > 0.01;

  // Build a node for element el. parentLayout: {dir, contentW, contentH} or null for absolute parent.
  const build = (el, parentCtx) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (!visible(el, cs, r)) return null;
    const tag = el.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'LINK' || tag === 'META' || el.dataset.helmet) return null;
    let n;
    const name = el.getAttribute('aria-label') || el.id || null;
    if (tag === 'IMG') n = imageNode(el, r, cs, el.currentSrc || el.src, el.alt ? el.alt.slice(0, 40) : 'Image');
    else if (tag === 'VIDEO') {
      const poster = el.getAttribute('poster');
      if (!poster) return null;
      const fake = { naturalWidth: +el.getAttribute('width') || 0, naturalHeight: +el.getAttribute('height') || 0, getAttribute: (k) => el.getAttribute(k), tagName: 'VIDEO' };
      n = imageNode(fake, r, cs, poster, 'Video poster');
      n.name = 'Video · ' + (el.currentSrc || el.getAttribute('src') || '').split('/').pop();
      applyBox(n, cs, el); n.fillEnabled = true; n.fillType = 'image';
    } else if (tag === 'svg' || tag === 'SVG') n = svgNode(el, r, cs);
    else if (isTextOnly(el) && !(color(cs.backgroundColor) || px(cs.paddingLeft) + px(cs.paddingTop) > 0 || px(cs.borderTopWidth) > 0 || tag === 'A' && (cs.display.includes('flex') || cs.display === 'inline-block'))) {
      n = textNode(el, r, cs, inlineHTML(el, cs));
      const a = el.tagName === 'A' ? el : null;
      if (a && a.getAttribute('href')) n.html = n.html.replace(/^<p([^>]*)>([\s\S]*)<\/p>$/, (m, at, inner) => `<p${at}><a${linkAttr(a.getAttribute('href'), a.getAttribute('target') === '_blank' || /^https?:/.test(a.getAttribute('href')))}>${inner}</a></p>`);
    } else {
      n = frame(name || tag.toLowerCase(), r);
      applyBox(n, cs, el);
      // children
      const kids = [];
      for (const c of el.childNodes) {
        if (c.nodeType === 3) {
          if (!c.textContent.trim()) continue;
          const range = document.createRange(); range.selectNodeContents(c); const tr = range.getBoundingClientRect();
          if (tr.width < 1) continue;
          kids.push({ text: c, r: tr });
        } else if (c.nodeType === 1) kids.push({ el: c });
      }
      const pt = px(cs.paddingTop) + px(cs.borderTopWidth), pl = px(cs.paddingLeft) + px(cs.borderLeftWidth);
      const pr = px(cs.paddingRight) + px(cs.borderRightWidth), pb = px(cs.paddingBottom) + px(cs.borderBottomWidth);
      const contentW = r.width - pl - pr, contentH = r.height - pt - pb;
      const disp = cs.display;
      let dir = 'vertical';
      if (disp.includes('flex')) dir = cs.flexDirection.startsWith('row') ? 'horizontal' : 'vertical';
      const isGrid = disp.includes('grid');
      const inflow = [], abs = [];
      for (const k of kids) {
        if (k.text) { inflow.push(k); continue; }
        const kcs = getComputedStyle(k.el);
        if (kcs.position === 'absolute' || kcs.position === 'fixed') abs.push(k); else inflow.push(k);
      }
      // collapse "display: contents"/inline wrappers is skipped for simplicity
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
      } else { n.stackAlignment = cs.textAlign === 'center' ? 'center' : 'start'; n.stackDistribution = 'start'; }
      const rowGap = px(cs.rowGap), colGap = px(cs.columnGap);
      // build children
      const built = [];
      for (const k of inflow) {
        let cn, kr, kel = k.el;
        if (k.text) {
          kr = k.r; cn = textNode(el, kr, cs, esc(k.text.textContent.replace(/\s+/g, ' ').trim()));
        } else {
          kr = kel.getBoundingClientRect(); cn = build(kel, { dir, contentW, contentH, isGrid });
        }
        if (!cn) continue;
        built.push({ n: cn, r: kr, el: kel });
      }
      if (isGrid) {
        const cols = cs.gridTemplateColumns.split(' ').filter((x) => x && x !== '/').length || 1;
        n.gridColumnCount = cols; n.gridColumnWidthType = 'minmax'; n.gridColumnMinWidth = 1; n.gridRowHeightType = 'auto';
        n.gridRowCount = Math.ceil(built.length / cols); n.gap = Math.round(colGap || rowGap); n.gridAlignment = 'start';
        for (const b of built) { b.n.widthType = 3; b.n.gridItemFillCellWidth = true; b.n.gridItemFillCellHeight = false; if (b.n.__class === 'RichTextNode') b.n.heightType = 2; }
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
            if (extra >= 2) out.push(frame('Spacer', { width: dir === 'vertical' ? 1 : extra, height: dir === 'vertical' ? extra : 1 }, { widthType: dir === 'vertical' ? 3 : 0 }));
          }
          out.push(b.n);
        });
        // first-child offset (e.g. margin-top) -> add to padding
        if (built.length && !n.stackWrapEnabled && n.stackDistribution === 'start') {
          const off = Math.round(built[0].r[main] - (r[main] + (dir === 'vertical' ? pt : pl)));
          if (off >= 2) { if (dir === 'vertical') n.paddingTop += off; else n.paddingLeft += off; n.paddingPerSide = true; }
        }
        built.length = 0; out.forEach((x) => built.push({ n: x }));
        // sizing per child
        for (const b of built) {
          const cn = b.n; if (cn.name === 'Spacer') continue;
          const cw = cn.width, ch = cn.height;
          if (dir === 'vertical') {
            if (Math.abs(cw - contentW) <= 2) cn.widthType = 3;
          } else {
            // horizontal: keep fixed width; text that fits on one line -> fit
            if (cn.__class === 'RichTextNode' && ch < 1.6 * parseFloat(cs.fontSize) * 1.7) cn.widthType = 2;
          }
          if (cn.__class === 'FrameNode' && cn.fillType !== 'image' && cn.layout) cn.heightType = 2;
        }
      }
      for (const b of built) n.children.push(b.n);
      // absolute children
      for (const k of abs) {
        const kr = k.el.getBoundingClientRect();
        const cn = build(k.el, null); if (!cn) continue;
        cn.position = 'absolute'; cn.left = Math.round(kr.left - r.left); cn.top = Math.round(kr.top - r.top); cn.widthType = 0; cn.heightType = cn.__class === 'RichTextNode' ? 2 : 0;
        n.children.push(cn);
      }
      // a frame whose height is driven by content
      const explicitH = el.style.height || el.style.minHeight || el.style.aspectRatio;
      n.heightType = explicitH ? 0 : 2;
      if (!n.children.length) { n.layout = null; n.heightType = 0; }
    }
    if (n.__class === 'FrameNode' && tag === 'A' && n.layout) applyBox(n, cs, el);
    return n;
  };

  window.__f2f = (doc, rootEl, opts = {}) => {
    PAGEMAP = window.__pagemap || {};
    assets.clear();
    const prevGCS = window.getComputedStyle;
    const view = doc.defaultView;
    // use iframe's computed style + ranges
    window.getComputedStyle = (e) => view.getComputedStyle(e);
    const prevCR = document.createRange.bind(document);
    document.createRange = () => doc.createRange();
    try {
      const root = build(rootEl, null);
      delete root.position; root.left = null; root.top = null; root.widthType = 3; root.heightType = 2;
      const clean = (n) => { for (const k of ['cursor', 'customCursorSmartComponentId', 'customCursorType', 'fillImage', 'fillImageOriginalName', 'intrinsicHeight', 'intrinsicWidth', 'link', 'duplicatedFrom', 'layout', 'overflow']) if (n[k] === null || n[k] === undefined) delete n[k]; (n.children || []).forEach(clean); };
      clean(root);
      const fr = (n) => { if (n.widthType === 3) n.width = 1; if (n.heightType === 3) n.height = 1; (n.children || []).forEach(fr); };
      fr(root);
      root.name = opts.name || 'Page';
      const fix = (n, pid) => { n.parentid = pid; (n.children || []).forEach((c) => fix(c, n.id)); };
      fix(root, 'clipboard');
      const env = structuredClone(window.__pbj);
      env.layers.tree.root.children = [root];
      env.layers.originalFrames = {}; env.layers.breakpointOverrides = []; env.layers.masters = {}; env.layers.replicas = {}; env.layers.renamedIds = {};
      env.assets = [...assets];
      let count = 0; const cnt = (n) => { count++; (n.children || []).forEach(cnt); }; cnt(root);
      return { env, count, height: root.height };
    } finally { window.getComputedStyle = prevGCS; document.createRange = prevCR; }
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
    await new Promise((r) => setTimeout(r, 500));
    return d;
  };
  return 'f2f ready';
})();
