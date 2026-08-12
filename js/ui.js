/* Ortak UI yardımcıları: ikonlar, biçimlendirme, toast, modal, DOM kısayolları. */

const Icons = {
  _svg: (path, extra = '') => `<svg class="ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" ${extra}>${path}</svg>`,
  dashboard: () => Icons._svg('<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>'),
  building: () => Icons._svg('<path d="M4 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16"/><path d="M15 9h3a2 2 0 0 1 2 2v10"/><path d="M2 21h20"/><path d="M8 7h3M8 11h3M8 15h3"/>'),
  gauge: () => Icons._svg('<path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M13.4 10.6 19 5"/><path d="M20.7 17A9 9 0 1 0 3.3 17"/>'),
  list: () => Icons._svg('<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/>'),
  layers: () => Icons._svg('<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>'),
  target: () => Icons._svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>'),
  flask: () => Icons._svg('<path d="M9 3h6"/><path d="M10 3v6.5L4.6 18a2 2 0 0 0 1.7 3h11.4a2 2 0 0 0 1.7-3L14 9.5V3"/><path d="M7 15h10"/>'),
  clipboard: () => Icons._svg('<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 13h6M9 17h4"/>'),
  check: () => Icons._svg('<path d="m20 6-11 11-5-5"/>'),
  half: () => Icons._svg('<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor" stroke="none"/>'),
  x: () => Icons._svg('<path d="M18 6 6 18M6 6l12 12"/>'),
  minus: () => Icons._svg('<path d="M5 12h14"/>'),
  alert: () => Icons._svg('<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/>'),
  info: () => Icons._svg('<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>'),
  download: () => Icons._svg('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>'),
  upload: () => Icons._svg('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>'),
  print: () => Icons._svg('<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>'),
  plus: () => Icons._svg('<path d="M12 5v14M5 12h14"/>'),
  trash: () => Icons._svg('<path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>'),
  edit: () => Icons._svg('<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4Z"/>'),
  sun: () => Icons._svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  moon: () => Icons._svg('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>'),
  search: () => Icons._svg('<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>'),
  reset: () => Icons._svg('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'),
  file: () => Icons._svg('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/>'),
  lock: () => Icons._svg('<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'),
  users: () => Icons._svg('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>'),
  link: () => Icons._svg('<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>')
};

const UI = (() => {
  const el = (sel, root = document) => root.querySelector(sel);
  const els = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Sayı ve tarih biçimi seçili dile göre çözülür.
  const nf = (min, max) => new Intl.NumberFormat(I18n.locale,
    { minimumFractionDigits: min, maximumFractionDigits: max });
  const empty = v => (v === null || v === undefined || v === '');

  const fmtInt = v => empty(v) ? '—' : nf(0, 0).format(v);
  const fmtPct = v => empty(v) ? '—' : nf(0, 0).format(v * 100) + '%';
  const fmtPct1 = v => empty(v) ? '—' : nf(1, 1).format(v * 100) + '%';
  const fmtNum1 = v => empty(v) ? '—' : nf(1, 1).format(v);
  const fmtNum2 = v => empty(v) ? '—' : nf(2, 2).format(v);
  const fmtDate = s => {
    if (!s) return '—';
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? s : d.toLocaleDateString(I18n.locale);
  };

  function levelClass(level) {
    return {
      'Çok Yüksek': 'lvl-cok-yuksek', 'Yüksek': 'lvl-yuksek',
      'Orta': 'lvl-orta', 'Düşük': 'lvl-dusuk'
    }[level] || 'lvl-none';
  }

  /** Kontrol etkinliği için renk yönü — yüksek etkinlik iyidir. */
  function effClass(eff) {
    if (eff === null || eff === undefined) return 'lvl-none';
    if (eff >= 0.75) return 'lvl-dusuk';
    if (eff >= 0.6) return 'lvl-orta';
    if (eff >= 0.4) return 'lvl-yuksek';
    return 'lvl-cok-yuksek';
  }

  /** Kritiklik rozeti — değer Türkçe anahtardır, etiket dile göre çözülür. */
  function critChip(critKey) {
    const cls = { 'Kritik': 'chip-critical', 'Yüksek': 'chip-high', 'Orta': 'chip-mid', 'Düşük': 'chip' }[critKey] || 'chip';
    return `<span class="chip ${cls}">${esc(I18n.ref('crit', critKey))}</span>`;
  }

  /* ---------- Toast ---------- */
  function toast(msg, kind = '') {
    let host = el('.toasts');
    if (!host) { host = document.createElement('div'); host.className = 'toasts'; host.setAttribute('aria-live', 'polite'); document.body.appendChild(host); }
    const t = document.createElement('div');
    t.className = 'toast ' + kind;
    t.innerHTML = (kind === 'err' ? Icons.alert() : Icons.check()) + `<span>${esc(msg)}</span>`;
    host.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 200); }, 3800);
  }

  /* ---------- Modal ---------- */
  let modalCloser = null;
  function modal({ title, body, footer, onMount, width }) {
    closeModal();
    const scrim = document.createElement('div');
    scrim.className = 'scrim';
    scrim.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}" ${width ? `style="width:min(${width}px,100%)"` : ''}>
        <div class="modal-head">
          <h2>${esc(title)}</h2>
          <button class="btn btn-icon btn-sm" data-close aria-label="Kapat">${Icons.x()}</button>
        </div>
        <div class="modal-body">${body}</div>
        <div class="modal-foot">${footer || ''}</div>
      </div>`;
    document.body.appendChild(scrim);
    const prevFocus = document.activeElement;

    const onKey = e => {
      if (e.key === 'Escape') { e.preventDefault(); closeModal(); }
      if (e.key === 'Tab') trapFocus(e, scrim);
    };
    document.addEventListener('keydown', onKey);
    scrim.addEventListener('mousedown', e => { if (e.target === scrim) closeModal(); });
    els('[data-close]', scrim).forEach(b => b.addEventListener('click', closeModal));

    modalCloser = () => {
      document.removeEventListener('keydown', onKey);
      scrim.remove();
      modalCloser = null;
      if (prevFocus && prevFocus.focus) prevFocus.focus();
    };

    const first = el('input, select, textarea, button:not([data-close])', scrim);
    if (first) first.focus();
    if (onMount) onMount(scrim);
    return scrim;
  }

  function closeModal() { if (modalCloser) modalCloser(); }

  function trapFocus(e, root) {
    const f = els('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', root)
      .filter(n => n.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function confirmDialog({ title, message, confirmLabel = 'Onayla', danger = false }) {
    return new Promise(resolve => {
      modal({
        title,
        body: `<p>${esc(message)}</p>`,
        footer: `<button class="btn" data-close>Vazgeç</button>
                 <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-confirm>${esc(confirmLabel)}</button>`,
        width: 460,
        onMount(scrim) {
          el('[data-confirm]', scrim).addEventListener('click', () => { closeModal(); resolve(true); });
          els('[data-close]', scrim).forEach(b => b.addEventListener('click', () => resolve(false)));
          scrim.addEventListener('mousedown', e => { if (e.target === scrim) resolve(false); });
        }
      });
    });
  }

  /* ---------- Küçük bileşenler ---------- */
  function meter(value, cls) {
    const pct = Math.max(0, Math.min(1, value || 0)) * 100;
    return `<div class="meter ${cls || ''}"><span style="width:${pct.toFixed(1)}%"></span></div>`;
  }

  function statTile({ label, value, unit, foot, tone }) {
    return `<div class="stat ${tone ? 'is-' + tone : ''}">
      <div class="stat-label">${esc(label)}</div>
      <div class="stat-value">${value}${unit ? `<span class="unit"> ${esc(unit)}</span>` : ''}</div>
      ${foot ? `<div class="stat-foot">${foot}</div>` : ''}
    </div>`;
  }

  function emptyState(title, msg, action) {
    return `<div class="empty">${Icons.file()}<h3>${esc(title)}</h3><p>${esc(msg)}</p>${action || ''}</div>`;
  }

  function selectOptions(list, selected, placeholder, labels) {
    const opts = list.map((v, i) => {
      const label = labels ? labels[i] : v;
      return `<option value="${esc(v)}"${v === selected ? ' selected' : ''}>${esc(label)}</option>`;
    }).join('');
    return (placeholder !== undefined ? `<option value=""${!selected ? ' selected' : ''}>${esc(placeholder)}</option>` : '') + opts;
  }

  /** Referans listesi seçenekleri: değer Türkçe kalır, etiket çevrilir. */
  function refOptions(kind, selected, placeholder) {
    const list = DATA.ref[kind];
    return selectOptions(list, selected, placeholder, list.map(v => I18n.ref(kind, v)));
  }

  /** Uzun listeleri parça parça basar; ana iş parçacığını bloklamaz. */
  function chunkRender(container, items, renderFn, chunk = 60) {
    let i = 0;
    function step() {
      const frag = document.createDocumentFragment();
      const end = Math.min(i + chunk, items.length);
      for (; i < end; i++) {
        const wrap = document.createElement('div');
        wrap.innerHTML = renderFn(items[i], i);
        while (wrap.firstChild) frag.appendChild(wrap.firstChild);
      }
      container.appendChild(frag);
      if (i < items.length) requestAnimationFrame(step);
    }
    step();
  }

  return {
    el, els, esc, fmtInt, fmtPct, fmtPct1, fmtNum1, fmtNum2, fmtDate,
    levelClass, effClass, critChip, toast, modal, closeModal, confirmDialog,
    meter, statTile, emptyState, selectOptions, refOptions, chunkRender
  };
})();
