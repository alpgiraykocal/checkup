/* Biçem denetimi: dar ekranda taşmaya yol açan ızgara kuralları.

   `repeat(auto-fit, minmax(320px, 1fr))` gibi bir iz, 375 px'lik telefonda
   kabın dışına taşar ve sayfa yana kayar. Doğrusu `minmax(min(320px, 100%), 1fr)`.
   Bu paket kuralları metin düzeyinde denetler; tarayıcı gerektirmez. */

const fs = require('fs');
const path = require('path');
const H = require('./harness.js');
const { check } = H;

const KOK = path.join(__dirname, '..');
const dosyalar = ['css/app.css', 'css/kilavuz.css'];

dosyalar.forEach(rel => {
  const src = fs.readFileSync(path.join(KOK, rel), 'utf8');
  const satirlar = src.split('\n');

  // auto-fit/auto-fill izlerinde çıplak px alt sınırı olmamalı
  const kotu = [];
  satirlar.forEach((satir, i) => {
    if (!/repeat\(\s*auto-(fit|fill)/.test(satir)) return;
    const m = satir.match(/minmax\(\s*(\d+)px/);
    if (m) kotu.push(`${rel}:${i + 1} → minmax(${m[1]}px …)`);
  });
  check(`${rel} — auto-fit ızgarada çıplak px alt sınırı yok`, kotu.length === 0, kotu.slice(0, 4));

  // yatay taşmaya açık sabit genişlikler
  const sabit = satirlar
    .map((s, i) => ({ s, i }))
    .filter(x => /(^|[^-])width:\s*\d{3,}px/.test(x.s) && !/max-width|min-width/.test(x.s))
    .map(x => `${rel}:${x.i + 1} → ${x.s.trim().slice(0, 60)}`);
  check(`${rel} — 100 px üstü sabit genişlik yok`, sabit.length === 0, sabit.slice(0, 4));
});

// index.html içindeki satır içi ızgara stilleri de aynı kurala uymalı
const kabuk = fs.readFileSync(path.join(KOK, 'index.html'), 'utf8')
  + fs.readFileSync(path.join(KOK, 'js/app.js'), 'utf8');
const satirIci = (kabuk.match(/repeat\(auto-fit,\s*minmax\(\s*\d+px/g) || []);
check('satır içi ızgaralarda çıplak px alt sınırı yok', satirIci.length === 0, satirIci.slice(0, 3));

/* ---------- Renk karşıtlığı (WCAG AA) ----------
   Tarayıcıda yapılan taramada saydamlıkla soluklaştırılan satırlar bilgi
   metnini 2,2–3,5:1'e düşürüyordu. Burada iki temanın jetonları okunur ve
   metin/zemin çiftleri 4,5:1 eşiğine göre denetlenir; metin taşıyan
   soluklaştırma kurallarında saydamlık yasaktır (pasif düğme hariç). */
{
  const src = fs.readFileSync(path.join(KOK, 'css/app.css'), 'utf8');
  const bloklar = [...src.matchAll(/(:root(?:\[data-theme="dark"\])?|:root:not\(\[data-theme="light"\]\))\s*\{([^}]*)\}/g)];
  const jeton = govde => Object.fromEntries([...govde.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)].map(m => [m[1], m[2]]));
  const acik = jeton(bloklar[0][2]);
  const koyu = jeton((bloklar.find(b => b[1].includes('dark')) || bloklar[1])[2]);
  const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; const [r, g, b] = rgb(c).map(f); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const oran = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const CIFTLER = [
    ['fg', 'bg'], ['fg', 'surface'], ['fg', 'surface-2'], ['fg', 'surface-3'],
    ['fg-muted', 'bg'], ['fg-muted', 'surface'], ['fg-muted', 'surface-2'], ['fg-muted', 'surface-3'],
    ['fg-subtle', 'bg'], ['fg-subtle', 'surface'], ['fg-subtle', 'surface-2'],
    ['on-primary', 'primary'], ['primary', 'surface'], ['primary', 'primary-soft'],
    ['danger', 'danger-bg'], ['danger', 'surface'], ['warn', 'warn-bg'], ['warn', 'surface'],
    ['ok', 'ok-bg'], ['ok', 'surface'], ['fg', 'info-bg']
  ];
  [['açık', acik], ['koyu', koyu]].forEach(([ad, j]) => {
    check(`${ad} tema jetonları okundu`, Object.keys(j).length > 20, Object.keys(j).length);
    CIFTLER.forEach(([on, zemin]) => {
      if (!j[on] || !j[zemin]) { check(`${ad}: ${on}/${zemin} jetonu var`, false); return; }
      const r = oran(j[on], j[zemin]);
      check(`${ad}: ${on} / ${zemin} ≥ 4,5`, r >= 4.5, Math.round(r * 100) / 100);
    });
  });
  // Kılavuz belgeleri: metin jetonları (mürekkep, vurgu, durum renkleri) her zemine karşı
  const ksrc = fs.readFileSync(path.join(KOK, 'css/kilavuz.css'), 'utf8');
  [...ksrc.matchAll(/(:root[^{]*)\{([^}]*)\}/g)].filter(b => /--murekkep/.test(b[2])).forEach(([, sel, g]) => {
    const j = jeton(g);
    const onler = ['murekkep', 'murekkep-yumusak', 'murekkep-silik', 'vurgu', 'vurgu-derin', 'uyari', 'tehlike', 'tamam'];
    const zeminler = ['kagit', 'yuzey', 'yuzey-2'];
    onler.forEach(o => zeminler.forEach(z => {
      if (!j[o] || !j[z]) return;
      const r = oran(j[o], j[z]);
      check(`kılavuz ${sel.trim().slice(0, 30)}: ${o} / ${z} ≥ 4,5`, r >= 4.5, Math.round(r * 100) / 100);
    }));
  });
  // Yazdırma: kâğıt her zaman açık tema; imza çizgisi son satırda da basılır
  const baski = (src.match(/@media print\s*\{([\s\S]*)$/) || [, ''])[1];
  check('yazdırmada koyu tema açık jetonlara döner', /:root\[data-theme="dark"\]\s*\{[^}]*--fg:\s*#0F172A/i.test(baski));
  check('imza çizgisi son satır kuralından özgül', /\.sign-table tbody td\.sign-line\s*\{[^}]*border-bottom/.test(baski));
  check('yazdırmada tablo kabı kırpmaz', /\.table-wrap\s*\{[^}]*overflow:\s*visible/.test(baski));
  check('tablo satırı sayfada bölünmez', /\btr\s*\{[^}]*break-inside:\s*avoid/.test(baski));
  const saydam = src.split('\n').map((l, i) => [l, i + 1])
    .filter(([l]) => /opacity:\s*\.\d|opacity:\s*0\.\d/.test(l) && !/@keyframes|disabled|\.ico|::before|::after|transition/.test(l));
  check('metin taşıyan kuralda saydamlıkla soluklaştırma yok', saydam.length === 0, saydam.map(([l, n]) => `${n}: ${l.trim()}`));
}

process.exitCode = H.report('Biçem — dar ekran, renk karşıtlığı ve yazdırma') ? 1 : 0;
