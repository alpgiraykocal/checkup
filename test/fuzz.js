/* Bozuk, eksik ve düşmanca veriyle tüm hesap yollarını dener. */
const H = require('./harness.js');
const { check } = H;
const A = H.load();
const { DATA, Calc, Store, Portfolio, Operations, Compare, EXTRA } = A;

const hepsi = st => {
  const c = Calc.compute(st);
  Portfolio.compute(st); Operations.compute(st); Compare.summarize(st);
  return c;
};
const dene = (ad, raw) => {
  try { const st = Store.normalize(raw); const c = hepsi(st);
    const j = JSON.stringify(c);
    check(ad + ' — çalıştı', true);
    check(ad + ' — NaN yok', !/:NaN/.test(j.replace(/"/g,'')) && !j.includes('null,NaN'), '');
    // sayısal alanlarda NaN taraması
    const nan = [];
    (function tara(o, yol) {
      if (typeof o === 'number' && Number.isNaN(o)) nan.push(yol);
      else if (o && typeof o === 'object') for (const k of Object.keys(o)) { if (k==='spec'||k==='f') continue; tara(o[k], yol+'.'+k); }
    })(c, '');
    check(ad + ' — NaN alan yok', nan.length === 0, nan.slice(0,5));
  } catch (e) { check(ad + ' — çalıştı', false, e.message); }
};

const b = () => JSON.parse(JSON.stringify(Store.snapshot()));

dene('tamamen boş', b());
dene('null alanlar', Object.assign(b(), { answers:null, inherent:null, actions:null, kpis:null, qaVolumes:null,
  portfolio:null, operations:null, pf:null, lines:null, appetite:null, countryRisk:null, kunye:null }));
dene('yanlış tipler', Object.assign(b(), { answers:'metin', inherent:42, actions:{}, qaVolumes:[], kunye:[] }));
dene('bilinmeyen anahtarlar', Object.assign(b(), { answers:{ 'YOK-99':{a:'Evet'} }, inherent:{ 'yok|faktör':3 },
  qaVolumes:{ 'yok':100 }, appetite:{ 'D99': 2 }, kpis:{ 'yok':{target:'1'} } }));
dene('geçersiz yanıt değerleri', (()=>{ const s=b(); DATA.questions.slice(0,20).forEach((q,i)=>
  s.answers[q.id]={a:[null,undefined,'','Belki',123,{},[]][i%7]}); return s; })());
dene('geçersiz skorlar', (()=>{ const s=b(); DATA.inherentFactors.forEach((f,i)=>
  s.inherent[f.key]=[0,-1,99,'abc',null,NaN,Infinity,1.5][i%8]); return s; })());
dene('geçersiz hacimler', (()=>{ const s=b(); DATA.qaPopulations.forEach((p,i)=>
  s.qaVolumes[p.key]=[-1,0,'abc',null,Infinity,1e15,0.5][i%7]); return s; })());
dene('bozuk aksiyonlar', Object.assign(b(), { actions:[ null, {}, {id:null}, {id:'X',due:'abc'},
  {id:'Y',due:'2026-13-45'}, {id:'Z',status:123}, 'metin' ] }));
dene('bozuk portföy', (()=>{ const s=b(); s.portfolio={ matrix:{bilinmeyen:{x:'a'}}, segments:null,
  countries:[null,{},{code:'ZZ',customers:'abc'},{code:null}], branches:[null,{},{type:'yok'}] }; return s; })());
dene('bozuk operasyon', Object.assign(b(), { operations:{ islem_toplam:{adet:'abc'}, yok:{x:1}, bos:null } }));
dene('bozuk iş kolu', (()=>{ const s=b(); s.lines={ bireysel:{active:'evet',share:'abc',dims:null}, yok:{active:true} }; return s; })());
dene('bozuk PF', Object.assign(b(), { pf:{ 'yok':{score:'x'}, [A.RISKMODEL?.pf?.factors?.[0]?.key||'k']:{score:null} } }));
dene('aşırı büyük sayılar', (()=>{ const s=b(); s.kunye.toplam_musteri_sayisi=1e18; s.kunye.yillik_islem_adedi=1e18;
  s.kunye.uyum_birimi_kadrosu_fte=1e-9; return s; })());
dene('geçersiz tarihler', (()=>{ const s=b(); s.kunye.donem_baslangic='abc'; s.kunye.donem_bitis='2026-99-99';
  s.kunye.son_ic_denetim_tarihi=''; return s; })());
dene('çok uzun metin', (()=>{ const s=b(); s.answers['D1-01']={a:'Evet',evidence:'x'.repeat(200000),note:'y'.repeat(200000)}; return s; })());
dene('HTML enjeksiyon denemesi', (()=>{ const s=b(); s.kunye.kurum_unvani='<img src=x onerror=alert(1)>';
  s.answers['D1-01']={a:'Evet',evidence:'</td><script>alert(1)</script>'};
  s.actions=[{id:'<b>X</b>',finding:'<script>bad()</script>',status:'Açık'}]; return s; })());
dene('ek kontroller bozuk', (()=>{ const s=b(); EXTRA.sets.forEach(x=>x.questions.forEach((q,i)=>
  s.answers[q.id]={a:[null,'Evet',5,'Yok'][i%4]})); s.kunye.yukumlu_tipi=12345; return s; })());
dene('döngüsel olmayan derin iç içe', (()=>{ const s=b(); s.portfolio.countries=Array.from({length:500},(_,i)=>({code:'DE',customers:i})); return s; })());

/* ---------- İç alan tipleri: ekran ve dışa aktarım çökmemeli ----------
   Canlıda: kanıt alanı metin değilse anket kartı (trim), ilişkiler liste
   değilse portföy CSV'si (map), referans dönem bozuksa karşılaştırma ekranı
   çöküyordu; nesne tipli metinler "[object Object]" basıyordu. */
{
  const { Views, Actions, Exporter, Extra, ChangeLog, RISKMODEL, I18n } = A;
  const q = DATA.questions.find(x => x.qa), f = DATA.inherentFactors[0];
  const L = RISKMODEL.businessLines.lines[0], P = RISKMODEL.pf.factors[0];
  const kotu = Object.assign(b(), {
    answers: { [q.id]: { a: 'Evet', evidence: 123, note: { x: 1 }, qaResult: 5, qaSample: {}, qaErrors: [] } },
    kunye: { kurum_unvani: { a: 1 }, toplam_musteri_sayisi: {}, son_ewra_tarihi: 12345, yukumlu_tipi: ['x'] },
    inherent: { [f.key]: 'abc' }, inherentNotes: { [f.key]: 55 }, inherentWeights: { [f.key]: 'x' },
    kpis: { [DATA.kpis[0].key]: { target: {}, value: [] } },
    lines: { [L.key]: { active: 'yes', share: 'abc', dims: 'x', note: 5 } },
    pf: { [P.key]: 'metin' },
    portfolio: { matrix: { gercek_kisi: 'x' }, segments: { a: 5 }, countries: [{ code: 5, relations: 'x', customers: 'abc' }],
                 branches: [{ name: {}, lastAudit: 99, type: 7 }] },
    signoff: { prepared: 'x', reviewed: { name: {}, date: 5 } },
    qaVolumes: { [DATA.qaPopulations[0].key]: 'abc' }, operations: { islem_toplam: 'x', izleme_alert: { adet: 'y' } },
    assign: { D1: {} }, method: { weightByExposure: 'evet' },
    actions: [{ id: 5, finding: {}, status: 7, due: 'yarın', crit: ['x'], closedAt: 3, questionId: 9 }],
    log: [{ at: 'x', what: 'answer', ref: {}, from: [], to: 5 }], appetite: { D1: 'x', PF: {} },
    baseline: { domains: 'x', totals: {}, inherent: {}, actions: { ids: 'y' } }
  });
  dene('iç alan tipleri bozuk', kotu);
  const temiz = b();
  Store.replace(kotu);
  const st = Store.state;
  check('bozuk referans dönem düşürüldü', st.baseline === null);
  check('metin alanı metne çevrildi', st.answers[q.id].evidence === '123' && !('note' in st.answers[q.id]));
  check('nesne tipli künye alanı atıldı', !('kurum_unvani' in st.kunye));
  check('ilişkiler liste oldu', Array.isArray(st.portfolio.countries[0].relations));
  check('yöntem bayrağı yalnız true', !('weightByExposure' in st.method));
  const calc = Calc.compute(st);
  check('tanınmayan QA sonucu test sayılmaz', calc.perQuestion[q.id].qaResult === '' && calc.qa2.tested === 0);
  const h = () => ({ innerHTML: '', addEventListener() {}, querySelector() { return null; } });
  const ekranlar = { 'soru kartı': () => Views.questionCard(q, calc) };
  [['Pano', Views.dashboard], ['Künye', Views.kunye], ['Doğuştan', Views.inherent], ['Artık', Views.residual],
   ['QA', Views.qa], ['Bulgu', Actions.view], ['Rapor', Exporter.report], ['Ek', Extra.view], ['Günlük', ChangeLog.view]]
    .forEach(([ad, fn]) => { ekranlar[ad] = () => { const x = h(); fn(x, { state: st, calc }); return x.innerHTML; }; });
  Object.entries(ekranlar).forEach(([ad, fn]) => {
    try { const html = fn(); check(`${ad}: çizildi`, true); check(`${ad}: [object Object] yok`, !html.includes('[object Object]')); }
    catch (e) { check(`${ad}: çizildi`, false, e.message); }
  });
  const ctx = A.__ctx, eskiUrl = ctx.URL.createObjectURL, eskiEl = ctx.document.createElement;
  ctx.URL.createObjectURL = () => 'blob:x';
  ctx.document.createElement = (...a) => Object.assign(eskiEl(...a), { click() {} });
  ['questions', 'domains', 'portfolio', 'operations', 'countries', 'inherent', 'qa', 'actions', 'log'].forEach(k => {
    try { Exporter.exportCSV(k, calc); check(`CSV ${k}: çalıştı`, true); }
    catch (e) { check(`CSV ${k}: çalıştı`, false, e.message); }
  });
  ctx.URL.createObjectURL = eskiUrl; ctx.document.createElement = eskiEl;
  Store.replace(temiz);
}

/* ---------- Aralık dışı değerler hesaba girmez, sayılır ---------- */
{
  const { RISKMODEL } = A;
  const f = DATA.inherentFactors[0], P = RISKMODEL.pf.factors[0], L = RISKMODEL.businessLines.lines[0];
  const s = Store.normalize(Object.assign(b(), {
    inherent: { [f.key]: 7 }, inherentWeights: { [DATA.inherentFactors[1].key]: 1000 },
    pf: { [P.key]: { score: 9 } },
    lines: { [L.key]: { active: true, share: 140, dims: { 'Müşteri': 8 } } },
    appetite: { D1: 9, PF: -1 }
  }));
  const c = Calc.compute(s);
  check('5 üstü skor yok sayılır', Calc.factorState(f, s).score === null && Calc.factorState(f, s).invalidScore);
  check('aşırı ağırlık varsayılana düşer', Calc.factorState(DATA.inherentFactors[1], s).weight === DATA.inherentFactors[1].weight);
  check('PF 9 yok sayılır', c.pf.value === 0 && !c.pf.measured && c.pf.invalid === 1, c.pf);
  check('100 üstü pay ve 8 skor sayılır', c.lines.invalid === 2 && c.lines.weightedInherent === null, c.lines.invalid);
  check('aralık dışı iştah varsayılana döner', c.residual[0].appetite === 1.5 && c.residual[0].appetiteInvalid && c.pfLine.appetiteInvalid);
  check('geçersiz sayımı', c.inherent.invalid === 2, c.inherent.invalid);
  check('geçerli sınırlar kabul', Calc.validScore('3') === 3 && Calc.validWeight(10) === 10 && Calc.validAppetite(5) === 5
    && Calc.validScore(2.5) === null && Calc.validWeight(0) === null && Calc.validAppetite(5.1) === null);
}

/* ---------- Gelecek tarih ve negatif değer ---------- */
{
  const ileri = (() => { const d = new Date(); d.setMonth(d.getMonth() + 5); return Calc.toISODate(d); })();
  const yarin = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return Calc.toISODate(d); })();
  const s = Store.normalize(Object.assign(b(), {
    kunye: { son_ewra_tarihi: ileri, son_senaryo_tuning_tarihi: yarin, toplam_musteri_sayisi: '-100', yuksek_riskli_musteri_sayisi: '5' },
    portfolio: { matrix: { gercek_kisi: { 'Düşük': -50 } }, segments: {}, countries: [],
                 branches: [{ name: 'Şube A', lastAudit: ileri, customers: 10 }] },
    operations: { islem_toplam: { adet: -3 } },
    qaVolumes: { [DATA.qaPopulations[0].key]: -500 }
  }));
  const k = Calc.kunye(s);
  const ewra = k.stale.find(x => x.field.id === 'son_ewra_tarihi');
  check('ileri tarih süre üretmez', ewra.months === null && ewra.future && !ewra.overdue, ewra);
  check('yarınki tarih de ileri sayılır', k.stale.find(x => x.field.id === 'son_senaryo_tuning_tarihi').future);
  check('ileri tarih künye uyarısı', k.warnings.filter(w => /ileri|future/i.test(w)).length === 2, k.warnings);
  check('negatif künye sayısı uyarı', k.warnings.some(w => /negatif|negative/i.test(w)), k.warnings);
  check('negatif paydada oran yok', k.ratios[0].value === null);
  const kpi = DATA.kpis.find(x => x.auto === 'monthsSince:son_senaryo_tuning_tarihi');
  check('ileri tarihli KPI değersiz', Calc.autoKpi(kpi, s, { closureRate: null }) === null);
  const p = Portfolio.compute(s);
  check('ileri tarihli denetim yapılmamış sayılır', p.branches.rows[0].auditMonths === null && p.branches.rows[0].auditOverdue);
  check('ileri tarihli denetim uyarısı', p.warnings.some(w => w.includes('Şube A')), p.warnings);
  check('negatif portföy uyarısı', p.warnings.some(w => /negatif|negative/i.test(w)), p.warnings);
  const o = Operations.compute(s);
  check('negatif operasyon uyarısı ve yok sayma', o.warnings.some(w => /negatif|negative/i.test(w)) && o.filled === 0, o.warnings);
  const c = Calc.compute(s);
  check('negatif QA hacmi geçersiz', c.qa[0].invalidVolume && c.qa[0].yearlySample === null && c.qa[0].rawVolume === -500);
  check('QA örneklem denetimi', Calc.qaSampleCheck('10', '25').error === 'over' && Calc.qaSampleCheck('-1', '0').error === 'negative'
    && Calc.qaSampleCheck('20', '5').rate === 0.25 && Calc.qaSampleCheck('', '').error === null);
}

/* ---------- Güvence örtüsü uygulanamaz soruyu beklemez ---------- */
{
  const s = Store.normalize(b());
  s.kunye.trade_finance_faaliyeti_var_mi = 'Hayır';
  const c0 = Calc.compute(s);
  DATA.questions.forEach(q => {
    if (c0.perQuestion[q.id].autoNA) return;
    s.answers[q.id] = q.qa ? { a: 'Evet', qaResult: 'Doğrulandı' } : { a: 'Evet' };
  });
  const elle = DATA.questions.find(q => q.qa && !c0.perQuestion[q.id].autoNA && q.domain === 'D1');
  s.answers[elle.id] = { a: 'Uygulanamaz' };
  const c = Calc.compute(s);
  check('kapsam dışı soru varken güvence %100', c.totals.assurance === 1, c.totals.assurance);
  check('domain güvencesi %100', c.domains.every(d => d.assurance === null || d.assurance === 1), c.domains.map(d => d.assurance));
  check('QA paydası uygulanamazı dışlar', c.qa2.required === DATA.questions.filter(q => q.qa).length
    - DATA.questions.filter(q => q.qa && c0.perQuestion[q.id].autoNA).length - 1, c.qa2.required);
  const bos = Calc.compute(Store.normalize(b()));
  check('yanıtsız QA sorusu paydada kalır', bos.qa2.required === DATA.questions.filter(q => q.qa).length);
}

process.exitCode = H.report('Dayanıklılık — bozuk ve düşmanca veri') ? 1 : 0;
