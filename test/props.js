/* Değişmez kural (özellik tabanlı) testi.

   Elle yazılmış örnekler yazarın aklına gelen durumları sınar. Burada sabit
   tohumlu bir üreteç binlerce gerçekçi çalışma dosyası üretir ve her birinde,
   girdi ne olursa olsun doğru kalması gereken kurallar denetlenir:
   aralıklar, tutarlılık, tekdüzelik (bir yanıtı iyileştirmek skoru
   kötüleştirmemeli), dil bağımsızlığı, yükleme/birleştirme özdeşliği.

   Tohum sabittir: bir kural düşerse aynı dosya yeniden üretilir ve rapora
   durum numarasıyla birlikte yazılır. PROPS_N ortam değişkeni sayıyı değiştirir. */

const H = require('./harness.js');
const { check } = H;
const A = H.load();
const { DATA, EXTRA, RISKMODEL, PORTFOLIO, Calc, Store, Portfolio, Operations, Merge, I18n, Compare } = A;

const N = Number(process.env.PROPS_N) || 1500;
const TOHUM = Number(process.env.PROPS_SEED) || 20260926;
const EPS = 1e-9;

/* ---------- Tohumlu üreteç (mulberry32) ---------- */
function uretec(tohum) {
  let a = tohum >>> 0;
  const r = () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  r.sec = list => list[Math.floor(r() * list.length)];
  r.tam = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
  r.olasilik = p => r() < p;
  return r;
}

const iso = d => Calc.toISODate(d);
const gunEkle = n => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + n); return iso(d); };

/* ---------- Rastgele ama geçerli çalışma dosyası ---------- */
function durumUret(r) {
  const s = JSON.parse(JSON.stringify(Store.normalize({})));
  const yogunluk = r();                      // boşa yakın ile doluya yakın arası

  // Künye: faaliyet soruları, tip, sayılar, tarihler
  (DATA.yesNoFields || []).forEach(id => { if (r.olasilik(0.8)) s.kunye[id] = r.sec(['Evet', 'Hayır', 'Evet']); });
  const tip = DATA.kunyeFields.find(f => f.id === 'yukumlu_tipi');
  if (r.olasilik(0.8)) s.kunye.yukumlu_tipi = r.sec(tip.optionKeys || tip.options);
  if (r.olasilik(0.7)) {
    const top = r.tam(100, 200000);
    s.kunye.toplam_musteri_sayisi = String(top);
    s.kunye.yuksek_riskli_musteri_sayisi = String(r.tam(0, Math.floor(top / 4)));
    s.kunye.pep_musteri_sayisi = String(r.tam(0, Math.floor(top / 50)));
    s.kunye.uyum_birimi_kadrosu_fte = String(r.tam(1, 60));
    const islem = r.tam(1000, 5000000);
    s.kunye.yillik_islem_adedi = String(islem);
    s.kunye.yillik_sinir_otesi_islem_adedi = String(r.tam(0, islem));
  }
  DATA.kunyeFields.filter(f => f.staleMonths).forEach(f => {
    if (r.olasilik(0.6)) s.kunye[f.id] = gunEkle(-r.tam(0, 1500));
  });

  // Anket ve ek kontroller. Durumların bir kısmı "mükemmel" üretilir: tam
  // puan ve doğrulanmış test %95 tavanını gerçekten zorlar.
  const mukemmel = r.olasilik(0.15);
  const yanit = () => (mukemmel ? 'Evet' : r.sec(['Evet', 'Evet', 'Kısmen', 'Hayır', 'Uygulanamaz']));
  const qaSonuc = () => (mukemmel ? 'Doğrulandı' : r.sec(['', 'Doğrulandı', 'Kısmen doğrulandı', 'Çelişkili', 'Test edilmedi']));
  DATA.questions.forEach(q => {
    if (!mukemmel && !r.olasilik(yogunluk)) return;
    s.answers[q.id] = { a: yanit() };
    if (q.qa && (mukemmel || r.olasilik(0.6))) s.answers[q.id].qaResult = qaSonuc();
  });
  EXTRA.sets.forEach(set => set.questions.forEach(q => {
    if (!r.olasilik(yogunluk * 0.7)) return;
    s.answers[q.id] = { a: yanit() };
    if (q.qa && r.olasilik(0.5)) s.answers[q.id].qaResult = qaSonuc();
  }));

  // Doğuştan risk, PF, iş kolları, yöntem
  DATA.inherentFactors.forEach(f => {
    if (r.olasilik(0.08)) { s.inherentNA[f.key] = true; return; }
    if (r.olasilik(yogunluk)) s.inherent[f.key] = r.tam(1, 5);
    if (r.olasilik(0.1)) s.inherentWeights[f.key] = r.tam(1, 20) / 2;
  });
  RISKMODEL.pf.factors.forEach(f => {
    if (r.olasilik(0.1)) s.pf[f.key] = { na: true };
    else if (r.olasilik(yogunluk)) s.pf[f.key] = { score: r.tam(1, 5) };
  });
  // Bazı durumlarda hiçbir kol skorlanmaz ya da pay girilmez: yöntem seçili olsa
  // bile uygulanamaz ve varsayılana düşmelidir.
  const hicSkorYok = r.olasilik(0.12), payYok = r.olasilik(0.08);
  RISKMODEL.businessLines.lines.forEach(l => {
    if (!r.olasilik(0.4)) return;
    const dims = {};
    // Bazı kollar paylı ama skorsuz: ağırlıklı ortalamanın paydası bunu doğru ele almalı
    const skorsuz = hicSkorYok || r.olasilik(0.25);
    RISKMODEL.businessLines.dims.forEach(d => { if (!skorsuz && r.olasilik(0.8)) dims[d] = r.tam(1, 5); });
    s.lines[l.key] = payYok ? { active: true, dims } : { active: true, share: r.tam(1, 60), dims };
  });
  if (r.olasilik(0.4)) s.method.weightByExposure = true;

  // İştah, QA hacimleri
  if (r.olasilik(0.3)) DATA.domains.forEach(d => { if (r.olasilik(0.5)) s.appetite[d.code] = r.tam(5, 40) / 10; });
  if (r.olasilik(0.2)) s.appetite.PF = r.tam(5, 40) / 10;
  DATA.qaPopulations.forEach(p => { if (r.olasilik(0.6)) s.qaVolumes[p.key] = r.tam(1, 50000); });

  // Portföy
  if (r.olasilik(0.6)) {
    PORTFOLIO.customerTypes.forEach(ct => {
      s.portfolio.matrix[ct.key] = {};
      PORTFOLIO.riskBands.forEach(b => { if (r.olasilik(0.7)) s.portfolio.matrix[ct.key][b.key] = r.tam(0, 5000); });
    });
  }

  // Bulgular
  const durumlar = DATA.ref.status;
  const n = r.tam(0, 12);
  for (let i = 0; i < n; i++) {
    const st = r.sec(durumlar);
    const kapali = Calc.ACTION_CLOSING.includes(st);
    s.actions.push({
      // Yarısı dosyaya özgü metin taşır: paralel çalışmada aynı kimlikli farklı bulgu
      id: 'BLG-' + String(i + 1).padStart(3, '0'), finding: 'f' + i + (r.olasilik(0.5) ? '-' + r.tam(1, 1e6) : ''), crit: r.sec(DATA.ref.crit),
      status: st, due: r.olasilik(0.9) ? gunEkle(r.tam(-200, 200)) : '',
      closedAt: kapali ? gunEkle(-r.tam(0, 100)) : '', verification: kapali ? 'v' : ''
    });
  }
  return s;
}

/* ---------- Bağımsız referans hesap ----------
   Kılavuzun "Metodoloji" bölümündeki formüllerden yazıldı; uygulama kodunu
   çağırmaz, yalnızca veri tablolarını (soru, faktör, kapsam kuralı) okur.
   Uygulamanın sonuçları her rastgele durumda bununla karşılaştırılır. */
const SPEC = (() => {
  const KATSAYI = { 'Evet': 1, 'Kısmen': 0.5, 'Hayır': 0 };           // Uygulanamaz: hariç
  const TAVAN = { 'Kısmen doğrulandı': 0.5, 'Çelişkili': 0 };
  const QA_SONUC = ['Doğrulandı', 'Kısmen doğrulandı', 'Çelişkili', 'Test edilmedi'];
  const KAYNAK = { D1: ['GENEL'], D2: ['Müşteri', 'Coğrafya ve Yaptırım'], D3: ['Ürün', 'Kanal'], D4: ['İşlem'],
    D5: ['Müşteri'], D6: ['Coğrafya ve Yaptırım'], D7: ['İşlem', 'Ürün'], D8: ['Müşteri', 'İşlem'],
    D9: ['GENEL'], D10: ['GENEL'], D11: ['GENEL'] };
  const BOYUTLAR = ['Müşteri', 'Coğrafya ve Yaptırım', 'Ürün', 'Kanal', 'İşlem'];

  const olgunluk = e => e === null ? '' : e >= 0.9 ? 'Gelişmiş' : e >= 0.75 ? 'Yeterli'
    : e >= 0.6 ? 'Gelişime Açık' : e >= 0.4 ? 'Zayıf' : 'Kritik Zayıf';
  const artikSeviye = v => v >= 3.5 ? 'Çok Yüksek' : v >= 2.5 ? 'Yüksek' : v >= 1.5 ? 'Orta' : 'Düşük';
  const skor = v => { const n = Number(v); return v !== '' && v !== undefined && v !== null && Number.isInteger(n) && n >= 1 && n <= 5 ? n : null; };

  function hesap(s) {
    // Kapsam: künyede "Hayır" olan faaliyetin bölümleri, yanıtlanmamışsa Uygulanamaz
    const kapsamDisi = new Set();
    DATA.scopeRules.forEach(k => { if (s.kunye[k.field] === 'Hayır') k.match.forEach(([d, b]) => kapsamDisi.add(d + '|' + b)); });

    const dom = {};
    let qaGereken = 0, qaYapilan = 0;
    DATA.domains.forEach(d => { dom[d.code] = { w: 0, beyan: 0, test: 0 }; });
    DATA.questions.forEach(q => {
      const rec = s.answers[q.id] || {};
      let a = KATSAYI[rec.a] !== undefined || rec.a === 'Uygulanamaz' ? rec.a : '';
      if (!a && kapsamDisi.has(q.domain + '|' + q.sectionKey)) a = 'Uygulanamaz';
      const qa = QA_SONUC.includes(rec.qaResult) ? rec.qaResult : '';
      if (q.qa && a !== 'Uygulanamaz') { qaGereken += 1; if (qa && qa !== 'Test edilmedi') qaYapilan += 1; }
      if (!a || a === 'Uygulanamaz') return;
      const k = KATSAYI[a];
      const kt = q.qa && TAVAN[qa] !== undefined ? Math.min(k, TAVAN[qa]) : k;
      dom[q.domain].w += q.weight; dom[q.domain].beyan += q.weight * k; dom[q.domain].test += q.weight * kt;
    });
    const etk = {};
    let W = 0, B = 0, T = 0;
    Object.entries(dom).forEach(([c, v]) => {
      etk[c] = v.w ? { beyan: v.beyan / v.w, test: v.test / v.w } : null;
      W += v.w; B += v.beyan; T += v.test;
    });

    // Doğuştan risk: boyut = Σ(skor×ağırlık)/Σ(ağırlık), skorlanan ve UA olmayan faktörler
    const boyut = {};
    BOYUTLAR.forEach(b => { boyut[b] = { n: 0, d: 0 }; });
    DATA.inherentFactors.forEach(f => {
      const sk = skor(s.inherent[f.key]);
      const oto = f.scope && s.kunye[f.scope.field] === 'Hayır' && sk === null;
      if (s.inherentNA[f.key] === true || oto || sk === null) return;
      const wo = Number(s.inherentWeights[f.key]);
      const w = s.inherentWeights[f.key] !== undefined && Number.isFinite(wo) && wo > 0 && wo <= 10 ? wo : f.weight;
      boyut[f.dimKey].n += sk * w; boyut[f.dimKey].d += w;
    });
    const bv = {};
    BOYUTLAR.forEach(b => { bv[b] = boyut[b].d ? boyut[b].n / boyut[b].d : null; });
    const olculen = BOYUTLAR.filter(b => bv[b] !== null);
    const genel = olculen.length ? olculen.reduce((a, b) => a + bv[b], 0) / olculen.length : null;

    /* İş kolu ve maruziyet yöntemi (kılavuz: "İş kolu ağırlıklı doğuştan risk =
       Σ(iş kolu skoru × pay) ÷ Σ(pay)"; seçenek açıkken boyutlar iş kolu düzeyinden
       iş hacmiyle ağırlıklandırılır). Kapsam dışı kol etkin sayılmaz. */
    const kollar = RISKMODEL.businessLines.lines.map(l => {
      const rec = s.lines[l.key] || {};
      const etkin = rec.active === true && !(l.scope && s.kunye[l.scope] === 'Hayır');
      const pay = Number(rec.share);
      const payVar = rec.share !== undefined && rec.share !== '' && Number.isFinite(pay) && pay > 0 && pay <= 100;
      const sk = {};
      RISKMODEL.businessLines.dims.forEach(d => { sk[d] = skor((rec.dims || {})[d]); });
      const dolu = Object.values(sk).filter(v => v !== null);
      return { etkin, pay: payVar ? pay : null, sk, ort: dolu.length ? dolu.reduce((a, b) => a + b, 0) / dolu.length : null };
    });
    const skorluKol = kollar.filter(k => k.etkin && k.pay !== null && k.ort !== null);
    const payTop = skorluKol.reduce((a, k) => a + k.pay, 0);
    const kolAgirlikli = payTop ? skorluKol.reduce((a, k) => a + k.ort * k.pay, 0) / payTop : null;
    const yontem = s.method.weightByExposure === true && skorluKol.length > 0;
    const mBoyut = {};
    BOYUTLAR.forEach(b => {
      let n = 0, d = 0;
      kollar.forEach(k => { if (k.etkin && k.pay !== null && k.sk[b] !== null) { n += k.sk[b] * k.pay; d += k.pay; } });
      mBoyut[b] = d ? n / d : null;
    });
    const kullanilanBoyut = b => (yontem ? mBoyut[b] : bv[b]);
    const kullanilanGenel = yontem ? kolAgirlikli : genel;

    // Artık risk
    const artik = {};
    DATA.domains.forEach(d => {
      const kay = KAYNAK[d.code];
      const degerler = kay.map(k => (k === 'GENEL' ? kullanilanGenel : kullanilanBoyut(k)));
      if (degerler.some(v => v === null) || !etk[d.code]) { artik[d.code] = null; return; }
      const ir = degerler.reduce((a, b) => a + b, 0) / degerler.length;
      artik[d.code] = ir * (1 - Math.min(etk[d.code].test, 0.95));
    });
    const genelArtik = kullanilanGenel === null || !W ? null : kullanilanGenel * (1 - Math.min(T / W, 0.95));

    // QA örneklemi
    const orneklem = DATA.qaPopulations.map(p => {
      const v = Number(s.qaVolumes[p.key]);
      if (!(Number.isFinite(v) && v > 0)) return null;
      const yil = p.full ? v : Math.min(v, Math.max(Math.round(v * p.rate), p.min));
      const test = p.freqKey === 'Çeyreklik' ? 4 : p.freqKey === 'Altı Aylık' ? 2 : 1;
      return [yil, Math.ceil(yil / test)];
    });

    // Bulgular
    const kapali = s.actions.filter(a => a.status === 'Kapalı').length;
    const kabul = s.actions.filter(a => a.status === 'Kabul Edilen Risk').length;
    const kapanis = s.actions.length - kabul ? kapali / (s.actions.length - kabul) : null;

    return { etk, W, B, T, bv, genel, artik, genelArtik, orneklem, kapanis, kolAgirlikli, yontem,
             guvence: qaGereken ? qaYapilan / qaGereken : null };
  }
  return { hesap, olgunluk, artikSeviye };
})();

const yakin = (a, b) => (a === null && b === null) || (typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) < 1e-9);

function referansla(s, c, i) {
  const yer = `durum #${i}`;
  const o = SPEC.hesap(s);
  c.domains.forEach(d => {
    const e = o.etk[d.code];
    kural('referans: domain beyan etkinliği', yakin(d.effectiveness, e ? e.beyan : null), `${yer} ${d.code} ${d.effectiveness} ≠ ${e && e.beyan}`);
    kural('referans: domain test etkinliği', yakin(d.effectivenessTested, e ? e.test : null), `${yer} ${d.code} ${d.effectivenessTested} ≠ ${e && e.test}`);
  });
  kural('referans: genel test etkinliği', yakin(c.totals.effectivenessTested, o.W ? o.T / o.W : null), yer);
  kural('referans: güvence örtüsü', yakin(c.totals.assurance, o.guvence), `${yer} ${c.totals.assurance} ≠ ${o.guvence}`);
  Calc.DIMS.forEach(b => {
    const v = c.inherent.dims[b];
    kural('referans: boyut skoru', yakin(v.measured ? v.value : null, o.bv[b]), `${yer} ${b} ${v.value} ≠ ${o.bv[b]}`);
  });
  kural('referans: genel doğuştan', yakin(c.inherent.measured ? c.inherent.general : null, o.genel), yer);
  kural('referans: iş kolu ağırlıklı doğuştan', yakin(c.lines.weightedInherent, o.kolAgirlikli), `${yer} ${c.lines.weightedInherent} ≠ ${o.kolAgirlikli}`);
  kural('referans: yöntem uygulandı mı', c.method.applied === o.yontem, yer);
  c.residual.forEach(r => kural('referans: domain artık riski', yakin(r.residual, o.artik[r.code]), `${yer} ${r.code} ${r.residual} ≠ ${o.artik[r.code]}`));
  kural('referans: genel artık risk', yakin(c.generalResidual, o.genelArtik), `${yer} ${c.generalResidual} ≠ ${o.genelArtik}`);
  c.qa.forEach((p, k) => {
    const beklenen = o.orneklem[k];
    kural('referans: QA örneklemi', beklenen === null ? p.yearlySample === null
      : (p.yearlySample === beklenen[0] && p.perTest === beklenen[1]), `${yer} ${p.key}`);
  });
  kural('referans: kapanış oranı', yakin(c.actionStats.closureRate, o.kapanis), yer);
}

/* ---------- Raporlama: kural başına ilk ihlal ---------- */
const ihlal = {};
let denetim = 0;
const kurallar = new Set();
function kural(ad, kosul, ornek) {
  denetim += 1;
  kurallar.add(ad);
  if (kosul) return;
  if (!ihlal[ad]) ihlal[ad] = { sayi: 0, ornek };
  ihlal[ad].sayi += 1;
}

const arada = (v, lo, hi) => v >= lo - EPS && v <= hi + EPS;
const sayiMi = v => typeof v === 'number' && Number.isFinite(v);

/* ---------- Değişmezler ---------- */
function denetle(s, i) {
  const c = Calc.compute(s);
  const yer = `durum #${i}`;

  // 1. Soru düzeyi: katsayılar ve puanlar
  DATA.questions.forEach(q => {
    const p = c.perQuestion[q.id];
    if (p.coef !== null) {
      kural('soru: test katsayısı ≤ beyan', p.coefTested <= p.coef + EPS, `${yer} ${q.id}`);
      kural('soru: kazanılan ≤ ağırlık', p.earnedTested <= p.earned + EPS && p.earned <= q.weight + EPS, `${yer} ${q.id}`);
    }
    kural('soru: aksiyon ↔ test katsayısı', p.coef === null ? p.actionNeeded === ''
      : (p.actionNeeded === 'Hayır') === (p.coefTested === 1), `${yer} ${q.id}`);
    kural('soru: açık kritik tanımı', p.openCritical === (p.coef !== null && q.critKey === 'Kritik' && p.coefTested < 1), `${yer} ${q.id}`);
  });

  // 2. Domain ve toplam: aralıklar, beyan ≥ test, olgunluk
  c.domains.concat([c.totals]).forEach(d => {
    const ad = d.code || 'TOPLAM';
    if (d.effectiveness !== null) {
      kural('etkinlik 0–1', arada(d.effectiveness, 0, 1) && arada(d.effectivenessTested, 0, 1), `${yer} ${ad}`);
      kural('test etkinliği ≤ beyan', d.effectivenessTested <= d.effectiveness + EPS, `${yer} ${ad}`);
      kural('olgunluk test etkinliğinden (kılavuz bantları)', d.maturity === SPEC.olgunluk(d.effectivenessTested), `${yer} ${ad}`);
    } else {
      kural('uygulanabilir ağırlık yoksa etkinlik yok', d.applicableWeight === 0 && d.effectivenessTested === null, `${yer} ${ad}`);
    }
    kural('yanıtlanan ≤ soru', d.answered <= d.count, `${yer} ${ad}`);
    if (d.assurance !== null && d.assurance !== undefined) kural('güvence 0–1', arada(d.assurance, 0, 1), `${yer} ${ad}`);
  });
  const toplam = c.domains.reduce((a, d) => a + d.applicableWeight, 0);
  kural('toplam ağırlık = domainler toplamı', Math.abs(toplam - c.totals.applicableWeight) < 1e-6, yer);
  kural('güvence: test edilen ≤ gereken', c.qa2.tested <= c.qa2.required, yer);
  kural('açık kritik toplamı', c.totals.openCritical === DATA.questions.filter(q => c.perQuestion[q.id].openCritical).length, yer);

  // 3. Doğuştan risk: 1–5 aralığı
  Calc.DIMS.forEach(d => {
    const v = c.inherent.dims[d];
    if (v.measured) kural('boyut skoru 1–5', arada(v.value, 1, 5), `${yer} ${d}`);
    kural('boyut: skorlanan ≤ uygulanabilir', v.scored <= v.applicable && v.applicable + v.na === v.total, `${yer} ${d}`);
  });
  if (c.inherent.measured) kural('genel doğuştan 1–5', arada(c.inherent.general, 1, 5), yer);
  if (c.generalInherentMeasured) kural('hesapta kullanılan genel doğuştan 1–5', arada(c.generalInherent, 1, 5), yer);
  if (c.pf.measured) kural('PF 1–5', arada(c.pf.value, 1, 5), yer);
  if (c.lines.weightedInherent !== null) {
    const skorlu = c.lines.lines.filter(l => l.active && l.inherent !== null && l.share !== null).map(l => l.inherent);
    kural('iş kolu ağırlıklı ortalama kolların arasında',
      arada(c.lines.weightedInherent, Math.min(...skorlu), Math.max(...skorlu)), yer);
  }
  if (c.exposureDims) Calc.DIMS.forEach(d => {
    if (c.exposureDims[d]) kural('maruziyet boyutu 1–5', arada(c.exposureDims[d].value, 1, 5), `${yer} ${d}`);
  });

  // 4. Artık risk: tavan, sınırlar, seviye, aşım
  c.residual.concat([c.pfLine]).forEach(r => {
    if (r.residual === null) return;
    kural('artık ≤ doğuştan', r.residual <= r.inherentRisk + EPS, `${yer} ${r.code}`);
    // Kılavuz: "Uygulanan etkinlik = MİN(test ile düzeltilmiş etkinlik, %95)" — sabit
    // koddan değil belgeden okunur, yoksa kod bozulunca kural da bozulur.
    kural('artık ≥ doğuştanın %5\'i (tavan)', r.residual >= r.inherentRisk * 0.05 - EPS, `${yer} ${r.code}`);
    kural('artık 0–5', arada(r.residual, 0, 5), `${yer} ${r.code}`);
    kural('artık seviyesi (kılavuz bantları)', r.level === SPEC.artikSeviye(r.residual), `${yer} ${r.code}`);
    kural('aşım = artık > limit', r.breach === (r.residual > r.appetite), `${yer} ${r.code}`);
    kural('limit geçerli aralıkta', arada(r.appetite, 0, Calc.APPETITE_MAX) && r.appetite > 0, `${yer} ${r.code}`);
  });
  if (c.generalResidual !== null) kural('genel artık ≤ genel doğuştan', c.generalResidual <= c.generalInherent + EPS, yer);
  kural('aşım sayısı', c.breaches === c.residual.filter(r => r.breach).length + (c.pfLine.breach ? 1 : 0), yer);
  if (c.worstDomain) kural('en kötü domain en yüksek artık', c.residual.every(r => r.residual === null || r.residual <= c.worstDomain.residual + EPS), yer);

  // 5. QA örneklem planı
  c.qa.forEach(p => {
    if (p.yearlySample === null) return;
    kural('yıllık örneklem ≤ hacim', p.yearlySample <= p.volume, `${yer} ${p.key}`);
    kural('yıllık örneklem ≥ MİN(hacim, asgari)', p.full || p.yearlySample >= Math.min(p.volume, p.min), `${yer} ${p.key}`);
    kural('test başına × test ≥ yıllık', p.perTest * p.tests >= p.yearlySample, `${yer} ${p.key}`);
    kural('tam kapsam = hacim', !p.full || p.yearlySample === p.volume, `${yer} ${p.key}`);
  });

  // 6. Bulgular
  const st = c.actionStats;
  kural('açık + kapalı + kabul = toplam', st.open + st.closed + st.accepted === st.total, yer);
  kural('gecikmiş ≤ açık, kritik ≤ açık', st.overdue <= st.open && st.critical <= st.open, yer);
  if (st.closureRate !== null) kural('kapanış oranı 0–1', arada(st.closureRate, 0, 1), yer);
  c.actions.forEach(a => {
    if (a.delay === 'GECİKMİŞ') kural('gecikmiş kayıt açık', Calc.actionOpen(a) && Calc.parseDate(a.due) < new Date(new Date().setHours(0, 0, 0, 0)), `${yer} ${a.id}`);
  });

  // 7. Ek kontroller ana skora karışmaz
  const ekYok = JSON.parse(JSON.stringify(s));
  EXTRA.sets.forEach(set => set.questions.forEach(q => { delete ekYok.answers[q.id]; }));
  const c2 = Calc.compute(ekYok);
  kural('ek kontroller ana skoru değiştirmez',
    c2.totals.effectivenessTested === c.totals.effectivenessTested && c2.totals.applicableWeight === c.totals.applicableWeight, yer);
  if (c.extra.totals.effectivenessTested !== null) {
    kural('ek set etkinliği 0–1', arada(c.extra.totals.effectivenessTested, 0, 1), yer);
  }

  // 8. Portföy
  const p = c.portfolio;
  if (p.matrixFilled) {
    kural('portföy: toplam = tip toplamı = bant toplamı',
      p.total === Object.values(p.byType).reduce((x, y) => x + y, 0) && p.total === Object.values(p.byBand).reduce((x, y) => x + y, 0), yer);
    kural('portföy: yüksek risk payı 0–1', arada(p.highRiskShare, 0, 1), yer);
  }
  return c;
}

/* ---------- Tekdüzelik: iyileştirme kötüleştirmemeli ---------- */
const SIRA = { 'Hayır': 0, 'Kısmen': 1, 'Evet': 2 };
function tekduzelik(s, r, i) {
  const yer = `durum #${i}`;
  const c0 = Calc.compute(s);

  // (a) Bir yanıtı bir basamak iyileştir
  const adaylar = DATA.questions.filter(q => s.answers[q.id] && SIRA[s.answers[q.id].a] !== undefined && s.answers[q.id].a !== 'Evet');
  if (adaylar.length) {
    const q = r.sec(adaylar);
    const t = JSON.parse(JSON.stringify(s));
    t.answers[q.id].a = s.answers[q.id].a === 'Hayır' ? 'Kısmen' : 'Evet';
    const c1 = Calc.compute(t);
    const d0 = c0.domains.find(d => d.code === q.domain), d1 = c1.domains.find(d => d.code === q.domain);
    kural('yanıt iyileşince beyan etkinliği düşmez', d1.effectiveness >= d0.effectiveness - EPS, `${yer} ${q.id}`);
    kural('yanıt iyileşince test etkinliği düşmez', d1.effectivenessTested >= d0.effectivenessTested - EPS, `${yer} ${q.id}`);
    const r0 = c0.residual.find(x => x.code === q.domain), r1 = c1.residual.find(x => x.code === q.domain);
    if (r0.residual !== null) kural('yanıt iyileşince artık risk artmaz', r1.residual <= r0.residual + EPS, `${yer} ${q.id}`);
    kural('yanıt iyileşince açık kritik artmaz', c1.totals.openCritical <= c0.totals.openCritical, `${yer} ${q.id}`);
  }

  // (b) QA sonucunu kötüleştir (Doğrulandı → Çelişkili): test etkinliği artmaz
  const qaAday = DATA.questions.filter(q => q.qa && s.answers[q.id] && c0.perQuestion[q.id].coef !== null);
  if (qaAday.length) {
    const q = r.sec(qaAday);
    const t = JSON.parse(JSON.stringify(s));
    t.answers[q.id].qaResult = 'Çelişkili';
    const c1 = Calc.compute(t);
    const d0 = c0.domains.find(d => d.code === q.domain), d1 = c1.domains.find(d => d.code === q.domain);
    kural('çelişkili test etkinliği artırmaz', d1.effectivenessTested <= d0.effectivenessTested + EPS, `${yer} ${q.id}`);
    kural('çelişkili test beyanı değiştirmez', Math.abs(d1.effectiveness - d0.effectiveness) < EPS, `${yer} ${q.id}`);
  }

  // (c) Bir faktör skorunu artır: boyut ve artık risk azalmaz
  const fAday = DATA.inherentFactors.filter(f => Calc.validScore(s.inherent[f.key]) && s.inherent[f.key] < 5 && !s.inherentNA[f.key]);
  if (fAday.length) {
    const f = r.sec(fAday);
    const t = JSON.parse(JSON.stringify(s));
    t.inherent[f.key] = s.inherent[f.key] + 1;
    const c1 = Calc.compute(t);
    kural('faktör artınca boyut azalmaz', c1.inherent.dims[f.dimKey].value >= c0.inherent.dims[f.dimKey].value - EPS, `${yer} ${f.key}`);
    c0.residual.forEach((r0, k) => {
      const r1 = c1.residual[k];
      if (r0.residual !== null && r1.residual !== null && !c0.method.applied) {
        kural('faktör artınca artık risk azalmaz', r1.residual >= r0.residual - EPS, `${yer} ${f.key} ${r0.code}`);
      }
    });
  }

  // (d) İştah limitini yükselt: aşım sayısı artmaz
  const t = JSON.parse(JSON.stringify(s));
  DATA.domains.forEach(d => { t.appetite[d.code] = Calc.APPETITE_MAX; });
  kural('limit yükselince aşım artmaz', Calc.compute(t).breaches <= c0.breaches, yer);
}

/* ---------- Birleştirme ---------- */
const FAKTOR_ALANLARI = ['inherent', 'inherentNA', 'inherentNotes', 'inherentWeights'];
function birlesmeDenetle(benim, gelen, i) {
  const yer = `durum #${i}`;
  const sonuc = JSON.parse(JSON.stringify(benim));
  const diff = Merge.parcalar(sonuc, gelen);
  Merge.birlestir(sonuc, gelen, diff, Object.fromEntries(diff.map(p => [p.key, 'theirs'])));

  DATA.questions.forEach(q => {
    if (gelen.answers[q.id] && Object.keys(gelen.answers[q.id]).length) {
      kural('birleştirme: gelen yanıt aynen alınır', JSON.stringify(sonuc.answers[q.id]) === JSON.stringify(gelen.answers[q.id]), `${yer} ${q.id}`);
    } else {
      kural('birleştirme: gelende boş yanıt benimkini korur', JSON.stringify(sonuc.answers[q.id]) === JSON.stringify(benim.answers[q.id]), `${yer} ${q.id}`);
    }
  });
  DATA.inherentFactors.forEach(f => {
    const gelenDolu = FAKTOR_ALANLARI.some(ad => gelen[ad][f.key] !== undefined && gelen[ad][f.key] !== '');
    const kaynak = gelenDolu ? gelen : benim;
    kural('birleştirme: faktör kararı bütün olarak alınır',
      FAKTOR_ALANLARI.every(ad => JSON.stringify(sonuc[ad][f.key]) === JSON.stringify(kaynak[ad][f.key])), `${yer} ${f.key}`);
  });
  const bulgu = a => (a.questionId || '') + '|' + (a.finding || '');
  const sonucBulgular = new Set(sonuc.actions.map(bulgu));
  kural('birleştirme: gelen bulgular var', gelen.actions.every(a => sonucBulgular.has(bulgu(a))), yer);
  kural('birleştirme: benim bulgularım kaybolmaz', benim.actions.every(a => sonucBulgular.has(bulgu(a))
    || gelen.actions.some(y => y.id === a.id && (y.questionId && a.questionId ? y.questionId === a.questionId : (y.finding || '') === (a.finding || '')))), yer);
  kural('birleştirme: bulgu kimlikleri benzersiz', new Set(sonuc.actions.map(a => a.id)).size === sonuc.actions.length, yer);
  kural('birleştirme sonrası hesap çalışır', Calc.compute(Store.normalize(sonuc)) !== null, yer);
}

/* ---------- Dil bağımsızlığı ---------- */
function sayisalOzet(c) {
  return JSON.stringify({
    t: c.totals, d: c.domains.map(d => [d.effectiveness, d.effectivenessTested, d.assurance, d.openCritical, d.actionsNeeded]),
    r: c.residual.map(r => [r.inherentRisk, r.residual, r.breach, r.appetite]), p: [c.pfLine.residual, c.pfLine.breach],
    i: [c.inherent.general, c.generalInherent], q: c.qa.map(p => [p.yearlySample, p.perTest]),
    a: c.actionStats, x: c.extra.totals, qa2: [c.qa2.required, c.qa2.tested]
  }, (k, v) => (typeof v === 'string' ? undefined : v));
}

/* ---------- Koşu ---------- */
const r = uretec(TOHUM);
let dilDenetimi = 0;
for (let i = 0; i < N; i++) {
  const s = durumUret(r);
  try {
    const c = denetle(s, i);
    referansla(s, c, i);
    tekduzelik(s, r, i);

    // Yükleme özdeşliği: normalize iki kez uygulanınca değişmez; JSON gidiş-dönüş aynı sonucu verir
    const n1 = Store.normalize(JSON.parse(JSON.stringify(s)));
    const n2 = Store.normalize(JSON.parse(JSON.stringify(n1)));
    kural('normalize eşgüçlü', JSON.stringify(n1) === JSON.stringify(n2), `durum #${i}`);
    kural('kaydet-yükle aynı sonuç', sayisalOzet(Calc.compute(s)) === sayisalOzet(Calc.compute(n1)), `durum #${i}`);

    // Birleştirme: kendisiyle birleştirmek ve "benimki" seçmek hiçbir şeyi değiştirmez
    const ben = JSON.parse(JSON.stringify(n1));
    const diff = Merge.parcalar(ben, n2);
    kural('kendisiyle birleştirmede çakışma yok', diff.every(p => p.conflicts === 0), `durum #${i}`);
    const secim = Object.fromEntries(diff.map(p => [p.key, 'theirs']));
    Merge.birlestir(ben, n2, diff, secim);
    kural('kendisiyle birleştirme özdeş', JSON.stringify(ben) === JSON.stringify(n1), `durum #${i}`);

    // İki farklı dosyayı birleştir: seçilen parçada gelenin verisi aynen alınır,
    // hiçbir bulgu kaybolmaz, faktör kararı (skor/UA/gerekçe/ağırlık) karışmaz.
    if (i % 3 === 0) birlesmeDenetle(n1, Store.normalize(JSON.parse(JSON.stringify(durumUret(r)))), i);

    // Dil: her 10 durumda bir iki dilde sayısal çıktı aynı
    if (i % 10 === 0) {
      dilDenetimi += 1;
      const tr = sayisalOzet(Calc.compute(s));
      I18n.apply('en');
      const en = sayisalOzet(Calc.compute(s));
      I18n.apply('tr');
      kural('dil değişimi sayıları değiştirmez', tr === en, `durum #${i}`);
    }

    // Özet ve karşılaştırma çökmesin
    Compare.summarize(n1);
  } catch (e) {
    kural('hesap çökmez', false, `durum #${i}: ${e.message}`);
  }
}

// SLA: her kritiklik ve başlangıç gününde son tarih ileride; kritikte hafta içi
const r2 = uretec(7);
for (let i = 0; i < 400; i++) {
  const from = gunEkle(r2.tam(-400, 400));
  DATA.ref.crit.forEach(crit => {
    const due = Calc.slaDueDate(crit, from);
    kural('SLA son tarihi başlangıçtan sonra', due > from, `${crit} ${from} → ${due}`);
    if (crit === 'Kritik') {
      const g = Calc.parseDate(due).getDay();
      kural('kritik SLA hafta içine düşer', g !== 0 && g !== 6, `${from} → ${due}`);
    }
  });
}

Object.entries(ihlal).forEach(([ad, v]) => check(`${ad} (${v.sayi} ihlal)`, false, v.ornek));
check(`${N} rastgele durum denetlendi`, true);
check(`${kurallar.size} farklı kural denetlendi`, kurallar.size >= 60, kurallar.size);
console.log(`  ${denetim.toLocaleString('tr-TR')} kural denetimi · ${kurallar.size} farklı kural · tohum ${TOHUM}`);
check(`dil denetimi ${dilDenetimi} durumda yapıldı`, dilDenetimi > 0);
process.exitCode = H.report(`Değişmez kurallar — ${N} rastgele durum`) ? 1 : 0;
