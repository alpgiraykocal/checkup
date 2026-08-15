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

process.exitCode = H.report('Veri sözleşmesi') ? 1 : 0;
