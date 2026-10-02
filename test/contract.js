/* Veri sözleşmesi: kod, veri katmanının belirli alanlara ve biçimlere sahip
   olduğunu varsayıyor. Bu varsayımlar burada sınanır — veri dosyası
   değiştiğinde sessizce bozulmasın. */

const H = require('./harness.js');
const { check } = H;
const A = H.load();
const { DATA, DATA_EN, EXTRA, GLOSSARY, RISKMODEL, PORTFOLIO, OPERATIONS, COUNTRIES, Calc } = A;

/* ---------- Kimlik ve benzersizlik ---------- */
const qIds = DATA.questions.map(q => q.id);
check('soru kimlikleri benzersiz', new Set(qIds).size === qIds.length);
const eIds = EXTRA.sets.flatMap(s => s.questions.map(q => q.id));
check('ek soru kimlikleri benzersiz', new Set(eIds).size === eIds.length);
check('ek ve ana kimlikler çakışmıyor', eIds.every(i => !qIds.includes(i)));
const dCodes = DATA.domains.map(d => d.code);
check('domain kodları benzersiz', new Set(dCodes).size === dCodes.length);
const cCodes = COUNTRIES.map(c => c.code);
check('ülke kodları benzersiz', new Set(cCodes).size === cCodes.length);

/* ---------- Zorunlu alanlar ---------- */
DATA.questions.forEach(q => {
  ['id', 'domain', 'sectionKey', 'section', 'text', 'critKey', 'evidence', 'source'].forEach(k =>
    check(`soru alanı ${q.id}.${k}`, q[k] !== undefined && q[k] !== ''));
  check(`soru ağırlığı ${q.id}`, Number.isFinite(q.weight) && q.weight > 0, q.weight);
  check(`soru domaini ${q.id}`, dCodes.includes(q.domain), q.domain);
  check(`soru kritikliği ${q.id}`, DATA.ref.crit.includes(q.critKey), q.critKey);
});

EXTRA.sets.forEach(s => {
  check(`ek set alanları ${s.key}`, s.tr && s.en && s.trWhy && s.enWhy);
  s.questions.forEach(q => {
    ['id', 'tr', 'en', 'trEvidence', 'enEvidence', 'source', 'domain'].forEach(k =>
      check(`ek soru alanı ${q.id}.${k}`, Boolean(q[k])));
    check(`ek soru ağırlığı ${q.id}`, Number.isFinite(q.weight) && q.weight > 0);
    check(`ek soru kritikliği ${q.id}`, DATA.ref.crit.includes(q.crit), q.crit);
    check(`ek soru domaini ${q.id}`, dCodes.includes(q.domain), q.domain);
  });
  (s.types || []).forEach(t => check(`ek set yükümlü tipi ${s.key}`,
    DATA.kunyeFields.find(f => f.id === 'yukumlu_tipi').options.includes(t), t));
  if (s.activity) check(`ek set faaliyet alanı ${s.key}`, DATA.kunyeFields.some(f => f.id === s.activity));
});

/* ---------- Doğuştan risk faktörleri ---------- */
DATA.inherentFactors.forEach(f => {
  check(`faktör sabit anahtarı ${f.factor}`, typeof f.key === 'string' && f.key.includes('|'), f.key);
  check(`faktör çıpası ${f.key}`, Array.isArray(f.anchors) && f.anchors.length === 5, (f.anchors || []).length);
  check(`faktör ağırlığı ${f.key}`, Number.isFinite(f.weight) && f.weight > 0);
  check(`faktör boyutu ${f.key}`, Calc.DIMS.includes(f.dimKey), f.dimKey);
  check(`faktör gerekçesi ${f.key}`, Boolean(f.why));
  if (f.scope) check(`faktör kapsam alanı ${f.key}`, DATA.kunyeFields.some(x => x.id === f.scope.field));
  if (f.hint) {
    check(`ipucu payı ${f.key}`, DATA.kunyeFields.some(x => x.id === f.hint.num));
    check(`ipucu paydası ${f.key}`, DATA.kunyeFields.some(x => x.id === f.hint.den));
    check(`ipucu bantları ${f.key}`, Array.isArray(f.hint.bands) && f.hint.bands.length === 4);
  }
});

RISKMODEL.pf.factors.forEach(f => {
  check(`PF çıpası ${f.key}`, f.anchors && f.anchors.length === 5);
  check(`PF EN çıpası ${f.key}`, f.anchorsEn && f.anchorsEn.length === 5);
  check(`PF ağırlığı ${f.key}`, Number.isFinite(f.weight) && f.weight > 0);
  if (f.scope) check(`PF kapsam alanı ${f.key}`, DATA.kunyeFields.some(x => x.id === f.scope));
});
check('PF kontrol domaini var', dCodes.includes(RISKMODEL.pf.controlDomain));

/* ---------- Kapsam kuralları ---------- */
const bolumler = new Set(DATA.questions.map(q => q.domain + '|' + q.sectionKey));
DATA.scopeRules.forEach(r => {
  check(`kapsam alanı ${r.field}`, DATA.kunyeFields.some(f => f.id === r.field));
  r.match.forEach(([d, s]) => check(`kapsam eşleşmesi ${d}|${s}`, bolumler.has(d + '|' + s)));
});

/* ---------- İştah, kaynak, boyut eşlemesi ---------- */
dCodes.forEach(c => {
  check(`iştah tanımı ${c}`, Number.isFinite(DATA.appetite[c]) && DATA.appetite[c] > 0);
  check(`artık risk kaynağı ${c}`, Boolean(DATA.residualSource[c]));
  check(`EN domain adı ${c}`, Boolean(DATA_EN.domains[c]));
  check(`artık risk boyutu ${c}`, Array.isArray(Calc.RESIDUAL_DIMS[c]) && Calc.RESIDUAL_DIMS[c].length > 0);
  (Calc.RESIDUAL_DIMS[c] || []).forEach(d =>
    check(`artık risk boyut adı ${c}/${d}`, d === 'GENEL' || Calc.DIMS.includes(d)));
});

/* ---------- QA popülasyonları ---------- */
const qaKeys = DATA.qaPopulations.map(p => p.key);
check('QA anahtarları benzersiz', new Set(qaKeys).size === qaKeys.length);
DATA.qaPopulations.forEach(p => {
  check(`QA oranı ${p.key}`, p.rate >= 0 && p.rate <= 1, p.rate);
  check(`QA asgari ${p.key}`, Number.isInteger(p.min) && p.min >= 0, p.min);
  check(`QA sıklığı ${p.key}`, DATA.ref.freq.includes(p.freqKey), p.freqKey);
  check(`QA risk seviyesi ${p.key}`, DATA.ref.riskLevel.includes(p.riskKey), p.riskKey);
  check(`QA domaini ${p.key}`, dCodes.includes(p.domain), p.domain);
  check(`EN QA karşılığı ${p.key}`, Boolean(DATA_EN.qa[p.key]));
});
[...new Set(DATA.questions.map(q => q.qaPop).filter(Boolean))].forEach(k =>
  check(`soru QA popülasyonu ${k}`, qaKeys.includes(k)));

/* ---------- KPI ---------- */
DATA.kpis.forEach(k => {
  check(`KPI yönü ${k.key}`, ['up', 'down', 'neutral'].includes(k.dir), k.dir);
  check(`EN KPI ${k.key}`, Boolean(DATA_EN.kpis[k.key]));
  if (k.auto) check(`KPI otomatik kaynağı ${k.key}`,
    k.auto === 'actionClosure' || k.auto.startsWith('monthsSince:'), k.auto);
});
const opsKpi = [];
OPERATIONS.groups.forEach(g => g.metrics.forEach(m => { if (m.feedsKpi) opsKpi.push(m.feedsKpi); }));
OPERATIONS.derived.forEach(d => { if (d.kpi) opsKpi.push(d.kpi); });
opsKpi.forEach(k => check(`operasyon KPI referansı ${k}`, DATA.kpis.some(x => x.key === k)));

/* ---------- Operasyon ve portföy ---------- */
const faktorAnahtarlari = new Set(DATA.inherentFactors.map(f => f.key));
OPERATIONS.groups.forEach(g => {
  check(`operasyon grubu ${g.key}`, g.tr && g.en && Array.isArray(g.metrics) && g.metrics.length > 0);
  if (g.scope) check(`operasyon kapsamı ${g.key}`, DATA.kunyeFields.some(f => f.id === g.scope));
  g.metrics.forEach(m => {
    check(`ölçüt alanları ${m.key}`, Array.isArray(m.fields) && m.fields.length > 0);
    m.fields.forEach(f => check(`ölçüt birimi ${m.key}/${f}`, Boolean(OPERATIONS.units[f])));
    if (m.feedsFactor) check(`ölçüt faktörü ${m.key}`, faktorAnahtarlari.has(m.feedsFactor), m.feedsFactor);
  });
});
OPERATIONS.derived.forEach(d => {
  if (d.factor) check(`türetilen faktör ${d.key}`, faktorAnahtarlari.has(d.factor), d.factor);
  check(`türetilen yön ${d.key}`, !d.good || ['up', 'down'].includes(d.good), d.good);
});
PORTFOLIO.segments.forEach(s => {
  if (s.feeds) check(`segment faktörü ${s.key}`, faktorAnahtarlari.has(s.feeds), s.feeds);
  if (s.bands) check(`segment bantları ${s.key}`, Array.isArray(s.bands) && s.bands.length === 4);
});
check('ülke risk tarihi biçimi', /^\d{4}-\d{2}-\d{2}$/.test(PORTFOLIO.countryRiskAsOf), PORTFOLIO.countryRiskAsOf);
COUNTRIES.forEach(c => {
  check(`ülke alanları ${c.code}`, c.tr && c.en && Array.isArray(c.flags));
  c.flags.forEach(f => check(`ülke bayrağı ${c.code}/${f}`, PORTFOLIO.countryFlags.some(x => x.key === f)));
});

/* ---------- Sözlük ---------- */
check('sözlük dolu', Array.isArray(GLOSSARY) && GLOSSARY.length > 0);
GLOSSARY.forEach(g => check(`sözlük girdisi ${g.k}`, g.k && g.tr && g.en));

/* ---------- Skor önerisi bantları = faktör tanım metinleri ----------
   Öneri "Uygula" ile tek tıkla skora dönüşür; bantlar tanımdan bir basamak
   kayarsa kurum riski sistematik olarak düşük çıkar (canlıda yedi faktör
   böyleydi: %7 offshore "%1–5" tanımlı 3 puanı alıyordu). Tanımdaki yüzde
   aralıkları okunur, her aralığın içinden oran seçilir, öneri o puanı vermeli. */
{
  const { PORTFOLIO, OPERATIONS } = A;
  const kaynaklar = {};
  const ekle = (k, bands, nereden) => (kaynaklar[k] = kaynaklar[k] || []).push({ bands, nereden });
  const src = require('fs').readFileSync(require('path').join(__dirname, '..', 'js', 'portfolio.js'), 'utf8');
  [...src.matchAll(/addHint\('([^']+)',[\s\S]*?\[([^\]]+)\]/g)].forEach(m => {
    const b = m[2].split(',').map(x => x.trim() === 'Calc.HIC' ? Calc.HIC : Number(x));
    if (b.every(Number.isFinite)) ekle(m[1], b, 'portföy');
  });
  PORTFOLIO.segments.filter(s => s.feeds && s.bands).forEach(s => ekle(s.feeds, s.bands, 'segment ' + s.key));
  OPERATIONS.groups.forEach(g => g.metrics.filter(m => m.feedsFactor && m.bands).forEach(m => ekle(m.feedsFactor, m.bands, 'işlem ' + m.key)));
  OPERATIONS.derived.filter(d => d.factor && d.bands).forEach(d => ekle(d.factor, d.bands, 'türetilen ' + d.key));
  DATA.inherentFactors.filter(f => f.hint).forEach(f => ekle(f.key, f.hint.bands, 'künye'));

  const sayi = x => Number(x.replace(',', '.'));
  // Tanım metninden temsilî bir oran: "%a–b" orta nokta, "%x'in altında" x/2,
  // "%x'in üzerinde" 1,5x, "yok / sunulmuyor" 0. Nitel tanımlar (yüzdesiz) atlanır.
  const temsil = (metin, onceki) => {
    let m = metin.match(/%\s?(\d+(?:,\d+)?)\s*[–-]\s*(\d+(?:,\d+)?)/);
    if (m) return (sayi(m[1]) + sayi(m[2])) / 2;
    m = metin.match(/%\s?(\d+(?:,\d+)?)['’](?:in|ın|un|ün|nin|nın|nun|nün|e|a|den|dan)?\s*(altında|altı)/);
    if (m) return Math.max(sayi(m[1]) / 2, onceki === 0 ? sayi(m[1]) / 2 : 0);
    m = metin.match(/%\s?(\d+(?:,\d+)?)['’](?:in|ın|un|ün|nin|nın|nun|nün)?\s*üzerinde/);
    if (m) return sayi(m[1]) * 1.5;
    if (/\byok\b|sunulmuyor|faaliyeti yok|İlişki yok|ağı yok/i.test(metin)) return 0;
    return null;
  };
  let denenen = 0;
  // Muhabir: ölçülen oran "riskli muhabir payı", tanımdaki yüzdeler başka ölçüye ait — aşağıda ayrıca sınanır
  const NITEL = new Set(['Coğrafya ve Yaptırım|Muhabir bankacılık ağının coğrafi riski']);
  Object.entries(kaynaklar).filter(([k]) => !NITEL.has(k)).forEach(([k, liste]) => {
    const f = DATA.inherentFactors.find(x => x.key === k);
    let onceki = null;
    f.anchors.forEach((a, i) => {
      const pct = temsil(a, onceki);
      onceki = pct;
      if (pct === null) return;
      liste.forEach(({ bands, nereden }) => {
        denenen += 1;
        const oneri = Calc.bandScore(pct, bands);
        check(`öneri bandı tanıma uyar: ${k.split('|')[1]} (${nereden}) %${pct} → ${i + 1}`, oneri === i + 1, `öneri ${oneri}`);
      });
    });
  });
  check('bant/tanım karşılaştırması yapıldı', denenen > 60, denenen);
  // Muhabir: nitel tanım — ilişki varsa en az 2, tamamı düşük riskli ülkede 2
  const muhabir = kaynaklar['Coğrafya ve Yaptırım|Muhabir bankacılık ağının coğrafi riski'][0].bands;
  check('muhabir: tamamı düşük riskli ülkede → 2', Calc.bandScore(0, muhabir) === 2);
  check('muhabir: riskli ağırlık düşük → 3', Calc.bandScore(10, muhabir) === 3);
  check('muhabir: riskli ağırlık yüksek → 5', Calc.bandScore(80, muhabir) === 5);
}

process.exitCode = H.report('Veri sözleşmesi') ? 1 : 0;
