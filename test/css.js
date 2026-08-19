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

process.exitCode = H.report('Biçem — dar ekran ızgara denetimi') ? 1 : 0;
