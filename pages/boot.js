(function () {
  if (!window.__hooked) {
    const orig = DataTransfer.prototype.setData;
    DataTransfer.prototype.setData = function (t, v) {
      if (t === 'text/html') {
        if (window.__inject) { v = window.__inject; window.__inject = null; window.__injected = true; }
        else window.__lastCopy = v;
      }
      if (t === 'text/plain' && window.__injectText) { v = window.__injectText; window.__injectText = null; window.__txtDone = true; }
      (window.__full = window.__full || []).push([t, (v || '').length]);
      return orig.call(this, t, v);
    };
    window.__hooked = true;
  }
  window.__pbj = JSON.parse(localStorage.__f2f_tpl);
  if (localStorage.__f2f_vtpl) window.__videoTpl = JSON.parse(localStorage.__f2f_vtpl);
  window.__parsePB = (h) => { const m = h.match(/data-framer-pasteboard="([^"]*)"/); return JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&')); };
  return 'boot ok';
})();
