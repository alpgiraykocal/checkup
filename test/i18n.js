/* Dil katmanı: koddaki her t('anahtar') iki dilde de karşılık bulmalı.
   Eksik anahtar ekranda anahtarın kendisi olarak görünür — sessiz bir hata. */

const fs = require('fs');
const path = require('path');
const H = require('./harness.js');
const { check } = H;
const A = H.load();
const { DATA, EXTRA, I18n } = A;

const JS = path.join(__dirname, '..', 'js');
const dosyalar = fs.readdirSync(JS).filter(f => f.endsWith('.js'));

/* ---------- Sabit anahtarlar ---------- */
const kullanilan = new Map();
const dinamik = [];
for (const f of dosyalar) {
  const s = fs.readFileSync(path.join(JS, f), 'utf8');
  for (const m of s.matchAll(/\b(?:I18n\.t|(?<![\w.])t|T)\(\s*'([^']+)'\s*(?:,|\))/g)) {
    if (!kullanilan.has(m[1])) kullanilan.set(m[1], f);
  }
  for (const m of s.matchAll(/\b(?:I18n\.t|(?<![\w.])t|T)\(\s*'([^']*)'\s*\+/g)) dinamik.push(m[1]);
}

/* Karşılık yoksa t() anahtarın kendisini döndürür. Türkçe karşılık hiçbir zaman
   camelCase anahtarla aynı olmadığı için eksiklik TR üzerinden güvenilir
   saptanır; İngilizcede karşılık anahtarla aynı olabilir (ör. "applied"),
   bu yüzden orada yalnızca boşluk denetlenir. */
I18n.apply('tr');
for (const [k, f] of kullanilan) {
  check(`TR karşılığı yok: ${k} [${f}]`, I18n.t(k) !== k);
}
I18n.apply('en');
for (const [k, f] of kullanilan) {
  const v = I18n.t(k);
  check(`EN karşılığı boş: ${k} [${f}]`, typeof v === 'string' && v.trim() !== '');
}

/* ---------- Dinamik önekler ---------- */
const rotalar = ['Dash', 'Guide', 'Kunye', 'Portfolio', 'Operations', 'Inherent', 'Survey',
  'Extra', 'Qa', 'Scores', 'Residual', 'Actions', 'Compare', 'Merge', 'Log', 'Report', 'Settings'];
const yedekNedenleri = ['auto', 'before-load', 'before-reset', 'before-restore', 'before-merge'];

for (const lang of ['tr', 'en']) {
  I18n.apply(lang);
  rotalar.forEach(r => ['nav', 'ttl', 'sub'].forEach(p =>
    check(`${lang}: ${p}${r}`, I18n.t(p + r) !== p + r)));
  yedekNedenleri.forEach(r =>
    check(`${lang}: snapReason_${r}`, I18n.t('snapReason_' + r) !== 'snapReason_' + r));
  // CSV başlıkları
  const ex = fs.readFileSync(path.join(JS, 'export.js'), 'utf8');
  [...new Set([...ex.matchAll(/csvH\.([A-Za-z0-9_]+)/g)].map(m => m[1]))].forEach(k =>
    check(`${lang}: csvH.${k}`, I18n.t('csvH.' + k) !== 'csvH.' + k));
  // Referans listeleri
  Object.keys(DATA.ref).forEach(kind => {
    if (!Array.isArray(DATA.ref[kind])) return;
    DATA.ref[kind].forEach(v => check(`${lang}: ref ${kind}/${v}`, Boolean(I18n.ref(kind, v))));
  });
}

/* ---------- İçerik çevirisi ---------- */
I18n.apply('en');
check('EN soru metinleri', DATA.questions.every(q => q.text && q.text.trim()), '');
check('EN faktör çıpaları', DATA.inherentFactors.every(f => f.anchors.every(a => a && a.trim())));
check('EN künye etiketleri', DATA.kunyeFields.every(f => f.label && f.label.trim()));
check('EN ek set metinleri', EXTRA.sets.every(s => s.en && s.questions.every(q => q.en)));
I18n.apply('tr');
check('TR soru metinleri', DATA.questions.every(q => q.text && q.text.trim()));

/* ---------- Dilden bağımsız saklama ---------- */
I18n.apply('en');
const enKeys = DATA.kpis.map(k => k.key);
I18n.apply('tr');
const trKeys = DATA.kpis.map(k => k.key);
check('KPI anahtarları dilden bağımsız', JSON.stringify(enKeys) === JSON.stringify(trKeys));
check('faktör anahtarları dilden bağımsız', DATA.inherentFactors.every(f => f.key.includes('|')));

process.exitCode = H.report('Dil katmanı örtüsü') ? 1 : 0;
