/* Görünüm katmanı denetimi.

   Buradaki üç sınıf hata canlıda görülmüştü:
   1) Sayısal alanlar HTML'e kaçırılmadan yazılıyordu; elle düzenlenmiş ya da
      ekipten gelen bir çalışma dosyası value="" niteliğinden çıkıp betik
      çalıştırabiliyordu.
   2) QA hacimleri popülasyonun görünen adıyla saklanıyordu; İngilizce arayüzde
      girilen hacmi hesap hiç görmüyordu.
   3) Otomatik hesaplanan KPI satırında değer kutusu çizilmediği hâlde
      <label for> duruyordu — ekran okuyucu için sahipsiz etiket.

   Test DOM'a girmez: her ekran sahte bir düğüme çizilir ve üretilen HTML
   metin olarak denetlenir. */

const H = require('./harness.js');
const { check } = H;
const A = H.load();
const { Store, Views, Portfolio, Operations, Settings, Extra, ChangeLog, Actions, Exporter, Calc, DATA, DATA_EN, EXTRA, I18n, RISKMODEL, UI } = A;

const YUK = '"><img src=x onerror=alert(1)>';

function host() {
  return {
    innerHTML: '', addEventListener() {}, removeEventListener() {},
    querySelector() { return null; }, querySelectorAll() { return []; },
    classList: { add() {}, remove() {}, toggle() {} }, style: { setProperty() {} },
    setAttribute() {}, getAttribute() { return null; }, focus() {}, appendChild() {}, dispatchEvent() {}
  };
}

/* Sahte DOM'u olmayan ekranlar (anket, karşılaştırma, birleştirme) burada
   değil, kendi paketlerinde sınanır. */
const EKRANLAR = {
  'Pano': Views.dashboard, 'Künye': Views.kunye, 'Doğuştan Risk': Views.inherent,
  'Kontrol Skorları': Views.domainScores, 'Artık Risk': Views.residual, 'QA Planı': Views.qa,
  'Nasıl Okunur': Views.guide, 'Portföy': Portfolio.view, 'İşlem Detayı': Operations.view,
  'Ayarlar': Settings.view, 'Ek Kontroller': Extra.view, 'Değişiklik Günlüğü': ChangeLog.view,
  'Aksiyon Planı': Actions.view, 'Yönetici Raporu': Exporter.report
};

/* ---------- 1. Kaçırılmamış HTML ---------- */

function dusmancaDurum() {
  Store.reset();
  const s = Store.state;
  s.kunye.kurum_unvani = YUK;
  s.kunye.toplam_musteri_sayisi = YUK;
  s.appetite = { D1: YUK, PF: YUK };
  s.inherent[DATA.inherentFactors[0].key] = YUK;
  s.inherentWeights[DATA.inherentFactors[0].key] = YUK;
  s.inherentNotes[DATA.inherentFactors[0].key] = YUK;
  s.lines = { bireysel: { active: true, share: YUK, dims: { 'Müşteri': YUK }, note: YUK } };
  s.pf = { [RISKMODEL.pf.factors[0].key]: { score: YUK, note: YUK } };
  s.qaVolumes[DATA.qaPopulations[0].key] = YUK;
  s.operations = { islem_toplam: { adet: YUK } };
  s.kpis = { [DATA.kpis[0].key]: { target: YUK, value: YUK } };
  s.portfolio = {
    matrix: { gercek_kisi: { dusuk: YUK } },
    segments: { pep: { customers: YUK, highRisk: YUK } },
    countries: [{ code: 'DE', name: YUK, customers: YUK, txIn: YUK, txOut: YUK, relations: ['musteri'] }],
    branches: [{ name: YUK, type: 'sube', country: 'DE', customers: YUK, highRiskCustomers: YUK, complianceFte: YUK, lastAudit: YUK }]
  };
  s.answers[DATA.questions[0].id] = { a: 'Evet', evidence: YUK, note: YUK, qaResult: 'Çelişkili', qaSample: YUK, qaErrors: YUK, qaNote: YUK };
  s.actions = [{ id: YUK, domain: 'D1', questionId: YUK, finding: YUK, source: YUK, rootCause: YUK,
    crit: 'Kritik', action: YUK, owner: YUK, due: '2020-01-01', status: 'Açık', verification: YUK }];
  s.log = [{ at: new Date().toISOString(), who: YUK, what: 'answer', ref: YUK, from: YUK, to: YUK }];
  s.signoff = { preparer: YUK, reviewer: YUK, approver: YUK };
  return s;
}

['tr', 'en'].forEach(dil => {
  I18n.apply(dil);
  const s = dusmancaDurum();
  Object.keys(EKRANLAR).forEach(ad => {
    const h = host();
    let html = '';
    try {
      EKRANLAR[ad](h, { state: s, calc: Calc.compute(s) });
      html = h.innerHTML || '';
    } catch (e) {
      check(`${dil} · ${ad} — çizildi`, false, e.message);
      return;
    }
    check(`${dil} · ${ad} — çizildi`, true);
    check(`${dil} · ${ad} — kaçırılmamış HTML yok`, !html.includes('<img src=x onerror='),
      html.slice(Math.max(0, html.indexOf('<img src=x onerror=') - 80), html.indexOf('<img src=x onerror=') + 30));
    check(`${dil} · ${ad} — NaN/undefined göstermiyor`,
      !/>NaN<|>undefined<|\[object Object\]/.test(html));
  });
});

/* ---------- 2. QA hacim anahtarı dile bağlı olmamalı ---------- */

['tr', 'en'].forEach(dil => {
  I18n.apply(dil);
  Store.reset();
  const h = host();
  Views.qa(h, { state: Store.state, calc: Calc.compute(Store.state) });
  const anahtarlar = [...h.innerHTML.matchAll(/data-vol="([^"]+)"/g)].map(m => m[1]);
  const beklenen = DATA.qaPopulations.map(p => p.key);
  check(`${dil} — QA hacim anahtarı sabit (görünen ad değil)`,
    anahtarlar.length === beklenen.length && anahtarlar.every((k, i) => k === beklenen[i]),
    anahtarlar.slice(0, 2));
});

// Hacim yazıldığında hesap onu görmeli — iki dilde de aynı sonuç
['tr', 'en'].forEach(dil => {
  I18n.apply(dil);
  Store.reset();
  const p = DATA.qaPopulations.find(x => !x.full);
  Store.state.qaVolumes[p.key] = 1000;
  const c = Calc.compute(Store.state);
  const satir = c.qa.find(x => x.key === p.key);
  check(`${dil} — girilen hacim hesaba giriyor`, satir.volume === 1000 && satir.yearlySample > 0,
    { volume: satir.volume, sample: satir.yearlySample });
});

// Eski dosyada İngilizce adla yazılmış hacim TR anahtarına taşınır
(() => {
  I18n.apply('tr');
  const p = DATA.qaPopulations[0];
  const enAd = DATA_EN.qa[p.key] && DATA_EN.qa[p.key].pop;
  const eski = { schema: 1, answers: {}, qaVolumes: { [enAd]: 750 } };
  Store.replace(eski);
  check('göç — İngilizce adlı hacim sabit anahtara taşındı', Store.state.qaVolumes[p.key] === 750,
    Store.state.qaVolumes);
  check('göç — görünen adlı kayıt kalmadı', !(enAd in Store.state.qaVolumes));
  check('göç — hesap taşınan hacmi görüyor', Calc.compute(Store.state).qa[0].volume === 750);
})();

/* ---------- 3. Sahipsiz <label for> olmamalı ---------- */

['tr', 'en'].forEach(dil => {
  I18n.apply(dil);
  Store.reset();
  const s = Store.state;
  DATA.questions.slice(0, 5).forEach(q => { s.answers[q.id] = { a: 'Evet' }; });
  Object.keys(EKRANLAR).forEach(ad => {
    const h = host();
    try { EKRANLAR[ad](h, { state: s, calc: Calc.compute(s) }); } catch { return; }
    const html = h.innerHTML || '';
    const idler = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
    const hedefsiz = [...new Set([...html.matchAll(/\bfor="([^"]+)"/g)].map(m => m[1]))]
      .filter(f => !idler.has(f));
    check(`${dil} · ${ad} — her label bir alanı gösteriyor`, hedefsiz.length === 0, hedefsiz.slice(0, 5));
    const idListe = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
    const cift = [...new Set(idListe.filter((x, i) => idListe.indexOf(x) !== i))];
    check(`${dil} · ${ad} — çift kimlik yok`, cift.length === 0, cift.slice(0, 5));
  });
});

/* ---------- 4. Sayı biçimleyiciler bozuk veriye "—" der ---------- */

[UI.fmtInt, UI.fmtNum1, UI.fmtNum2, UI.fmtPct, UI.fmtPct1].forEach((f, i) => {
  check(`biçimleyici ${i} — metin girdide NaN yazmaz`, f('abc') === '—', f('abc'));
  check(`biçimleyici ${i} — boşta tire`, f(null) === '—' && f('') === '—');
  check(`biçimleyici ${i} — sayı girdide biçimlendirir`, f(1) !== '—');
});

/* ---------- 5. Ek kontrol satırı ana anketle aynı alanlara sahip ---------- */

['tr', 'en'].forEach(dil => {
  I18n.apply(dil);
  Store.reset();
  const s = Store.state;
  s.kunye.yukumlu_tipi = 'Banka';
  const kapsamda = Calc.extra(s).sets.find(x => !x.outOfScope);
  const qa = kapsamda.questions.find(x => x.q.qa).q;
  const bos = kapsamda.questions.find(x => !x.q.qa || x.q.id !== qa.id).q;
  s.answers[qa.id] = { a: 'Evet', evidence: 'P-1', note: 'n', qaResult: 'Çelişkili', qaSample: '20', qaErrors: '5', qaNote: 'q' };
  s.answers[bos.id] = { a: 'Hayır' };

  const h = host();
  Extra.view(h, { state: s, calc: Calc.compute(s) });
  const html = h.innerHTML;

  check(`${dil} — ek sette bulgu notu alanı var`, html.includes(`data-ex-note="${qa.id}"`));
  check(`${dil} — ek sette QA örneklem alanı var`, html.includes('data-field="qaSample"'));
  check(`${dil} — ek sette QA hata alanı var`, html.includes('data-field="qaErrors"'));
  check(`${dil} — ek sette QA not alanı var`, html.includes('data-field="qaNote"'));
  check(`${dil} — ek sette QA çelişki uyarısı çıkıyor`, html.includes('banner danger'));
  check(`${dil} — eksik satırda aksiyon düğmesi var`, html.includes('data-ex-mkaction'));
});

/* ---------- 6. Toplu bulgu üretimi ek setleri de kapsar ---------- */

(() => {
  I18n.apply('tr');
  Store.reset();
  const s = Store.state;
  s.kunye.yukumlu_tipi = 'Banka';
  const anaQ = DATA.questions[0];
  s.answers[anaQ.id] = { a: 'Kısmen' };

  const ex = Calc.extra(s);
  const kapsamda = ex.sets.find(x => !x.outOfScope);
  const kapsamDisi = ex.sets.find(x => x.outOfScope);
  const ekQ = kapsamda.questions[0].q;
  s.answers[ekQ.id] = { a: 'Hayır' };
  if (kapsamDisi) s.answers[kapsamDisi.questions[0].q.id] = { a: 'Hayır' };

  const gaps = Actions.gapQuestions(Calc.compute(s));
  const idler = gaps.map(g => g.id);
  check('toplu üretim — ana anket sorusu listede', idler.includes(anaQ.id), idler);
  check('toplu üretim — kapsam içi ek set sorusu listede', idler.includes(ekQ.id), idler);
  if (kapsamDisi) {
    check('toplu üretim — kapsam dışı set atlanır',
      !idler.includes(kapsamDisi.questions[0].q.id), idler);
  }
  check('toplu üretim — kayıtlar tam şekilli',
    gaps.every(g => g.id && g.domain && g.critKey && typeof g.text === 'string'));

  // Bulgusu açılmış soru ikinci kez üretilmez
  Store.state.actions = [{ id: 'BLG-001', questionId: ekQ.id, finding: 'x', status: 'Açık' }];
  const ikinci = Actions.gapQuestions(Calc.compute(Store.state)).map(g => g.id);
  check('toplu üretim — bulgusu olan soru atlanır', !ikinci.includes(ekQ.id), ikinci);
})();

/* ---------- 7. Soru çözümleyici iki bankayı da tanır ---------- */

['tr', 'en'].forEach(dil => {
  I18n.apply(dil);
  const ana = Calc.findQuestion(DATA.questions[0].id);
  const ek = Calc.findQuestion(EXTRA.sets[0].questions[0].id);
  check(`${dil} — ana soru çözümleniyor`, Boolean(ana && ana.extra === false && ana.text));
  check(`${dil} — ek set sorusu çözümleniyor`, Boolean(ek && ek.extra === true && ek.text && ek.critKey));
  check(`${dil} — küçük harfli kimlik de çözümleniyor`,
    Boolean(Calc.findQuestion(EXTRA.sets[0].questions[0].id.toLowerCase())));
  check(`${dil} — bilinmeyen kimlik null döner`, Calc.findQuestion('YOK-99') === null);
  check(`${dil} — boş kimlik null döner`, Calc.findQuestion('') === null && Calc.findQuestion(null) === null);
});

/* ---------- 8. Dil ve tema cihazın tercihidir ---------- */

(() => {
  I18n.apply('tr');
  Store.reset();
  Store.update(s => { s.ui.lang = 'en'; s.ui.theme = 'dark'; }, { silent: true });

  const gelen = { schema: 1, answers: { 'D1-01': { a: 'Evet' } }, ui: { lang: 'tr', theme: 'light' } };
  Store.replace(JSON.parse(JSON.stringify(gelen)));
  check('içe aktarma dili değiştirmiyor', Store.state.ui.lang === 'en', Store.state.ui);
  check('içe aktarma temayı değiştirmiyor', Store.state.ui.theme === 'dark', Store.state.ui);
  check('içe aktarma veriyi getiriyor', Boolean(Store.state.answers['D1-01']));

  const yedek = Store.snapshots()[0];
  if (yedek) {
    Store.restoreSnapshot(yedek.at);
    check('yedek geri yükleme dili değiştirmiyor', Store.state.ui.lang === 'en', Store.state.ui);
  }

  // Cihazda tercih yoksa dosyanınki kabul edilir
  Store.update(s => { s.ui = {}; }, { silent: true });
  Store.replace(JSON.parse(JSON.stringify(gelen)));
  check('tercih yokken dosyanınki alınır',
    Store.state.ui.lang === 'tr' && Store.state.ui.theme === 'light', Store.state.ui);
})();

/* ---------- 9. Sekmeler arası yazma uyarısı ---------- */

(() => {
  check('dış değişiklik dinleyicisi var', typeof Store.onExternalChange === 'function');
  check('başlangıçta dış değişiklik yok', Store.externalChange === false);
})();

/* ---------- Odak kaybında yeniden çizim tıklamayı yutmamalı ----------
   Alan odağı kaybedince ekran hemen yeniden çizilirse fareyle basılan düğme
   DOM'dan kalkar ve tıklama gelmez (canlıda: "Ülke ekle" ilk basışta
   çalışmıyordu). blur dinleyicileri App.rerenderAfterBlur kullanmalı. */
(() => {
  const fs = require('fs'), path = require('path');
  const JS = path.join(__dirname, '..', 'js');
  let dinleyici = 0;
  fs.readdirSync(JS).filter(f => f.endsWith('.js')).forEach(f => {
    const kod = fs.readFileSync(path.join(JS, f), 'utf8');
    const re = /addEventListener\('blur',[\s\S]{0,200}?\}, true\)/g;
    let m;
    while ((m = re.exec(kod))) {
      dinleyici += 1;
      check(`${f}: blur dinleyicisi tıklamayı yutmaz`, !/App\.rerender\(\)/.test(m[0]), m[0].slice(0, 120));
    }
  });
  check('blur dinleyicileri bulundu', dinleyici >= 6, dinleyici);
  check('ertelenmiş çizim dışa açık', typeof A.App.rerenderAfterBlur === 'function');
})();

/* ---------- Kayıttan gelen çizim de tıklamayı yutmamalı ----------
   Metin alanının "change" olayı fareye basıldığı anda kaydı tetikler; abone
   çizimi ertelenmezse kenar çubuğu yeniden kurulur, gezinme tıklaması kaybolur. */
(() => {
  const kod = require('fs').readFileSync(require('path').join(__dirname, '..', 'js', 'app.js'), 'utf8');
  check('Store aboneliği ertelenmiş çizimi kullanır', /Store\.subscribe\(\(\) => rerenderAfterBlur\(\)\)/.test(kod));
})();

/* ---------- Otomatik kapsam dışı kayıt elle yanıtlanabilir ----------
   Künye "elle girilen değer otomatik kuralı yener" der; düğme kapalıysa
   bu yola girilemez. */
(() => {
  const temiz = JSON.parse(JSON.stringify(Store.snapshot()));
  const kural = DATA.scopeRules[0];
  const s = JSON.parse(JSON.stringify(temiz));
  s.kunye[kural.field] = 'Hayır';
  RISKMODEL.pf.factors.filter(f => f.scope).forEach(f => { s.kunye[f.scope] = 'Hayır'; });
  Store.replace(s);
  const calc = Calc.compute(Store.state);
  const q = DATA.questions.find(x => calc.perQuestion[x.id].autoNA);
  const kart = Views.questionCard(q, calc);
  check('kapsam dışı soru kartı kilit işaretli', /is-locked/.test(kart));
  check('kapsam dışı soruda yanıt düğmesi açık', !/data-answer="[^"]+"[^>]*disabled/.test(kart), kart.slice(0, 200));

  const h = host(); Views.inherent(h, { state: Store.state, calc });
  const f = calc.inherent.factors.find(x => x.st.autoNA);
  const skorDugmesi = new RegExp(`data-inh-score="${f.st.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`, 'g');
  const dugmeler = h.innerHTML.match(skorDugmesi) || [];
  check('kapsam dışı faktörde skor düğmeleri var', dugmeler.length === 5, dugmeler.length);
  check('kapsam dışı faktörde skor düğmeleri açık', dugmeler.every(b => !/disabled/.test(b)), dugmeler[0]);
  const pfKapsam = calc.pf.factors.find(x => x.autoNA);
  if (pfKapsam) {
    const pfDugme = h.innerHTML.match(new RegExp(`data-pf-score="${pfKapsam.spec.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`, 'g')) || [];
    check('kapsam dışı PF faktöründe skor düğmeleri açık', pfDugme.length === 5 && pfDugme.every(b => !/disabled/.test(b)), pfDugme[0]);
  }
  check('PF kapsamlı faktör bulundu', Boolean(pfKapsam));
  Store.replace(temiz);
})();

/* ---------- Kurum kararıyla değişen iştah limiti raporda görünür ---------- */
(() => {
  const temiz = JSON.parse(JSON.stringify(Store.snapshot()));
  const s = JSON.parse(JSON.stringify(temiz));
  s.appetite = { D2: 2.2, PF: 1.1 };
  DATA.inherentFactors.forEach(f => { s.inherent[f.key] = 3; });
  RISKMODEL.pf.factors.forEach(f => { s.pf[f.key] = { score: 3 }; });
  DATA.questions.forEach(q => { s.answers[q.id] = { a: 'Kısmen' }; });
  Store.replace(s);
  const calc = Calc.compute(Store.state);
  const h = host(); Exporter.report(h, { state: Store.state, calc });
  const kurum = I18n.t('rrOwnLimit');
  check('raporda domain limiti kurum kararı olarak yazılı', h.innerHTML.includes('2,2 · ' + kurum), h.innerHTML.match(/2,2[^<]{0,40}/));
  check('raporda PF limiti kurum kararı olarak yazılı', h.innerHTML.includes('1,1 (' + kurum + ')'));
  const r = host(); Views.residual(r, { state: Store.state, calc });
  check('artık risk ekranında PF kurum kararı işareti', (r.innerHTML.match(new RegExp(kurum, 'g')) || []).length === 2);
  Store.replace(temiz);
})();

/* ---------- Soru CSV'si ek set notunu taşır ---------- */
(() => {
  const ctx = A.__ctx;
  let yakalanan = null;
  const eskiUrl = ctx.URL.createObjectURL, eskiEl = ctx.document.createElement;
  ctx.URL.createObjectURL = b => { yakalanan = b.parts.join(''); return 'blob:x'; };
  ctx.document.createElement = (...a) => Object.assign(eskiEl(...a), { click() {} });
  const eskiEkle = ctx.document.body.appendChild;
  try {
    const temiz = JSON.parse(JSON.stringify(Store.snapshot()));
    const exQ = EXTRA.sets[0].questions[0];
    Store.replace(Object.assign(JSON.parse(JSON.stringify(temiz)), { answers: { [exQ.id]: { a: 'Hayır', note: 'EKNOTU-123' } } }));
    Exporter.exportCSV('questions', Calc.compute(Store.state));
    check('soru CSV\'si ek set notunu içerir', yakalanan && yakalanan.includes('EKNOTU-123'));
    Store.replace(temiz);
  } finally {
    ctx.URL.createObjectURL = eskiUrl; ctx.document.createElement = eskiEl; ctx.document.body.appendChild = eskiEkle;
  }
})();

/* ---------- Toplu üretim günlüğe yazılır; yöntem olayı adlandırılmış ---------- */
(() => {
  const temiz = JSON.parse(JSON.stringify(Store.snapshot()));
  const kod = require('fs').readFileSync(require('path').join(__dirname, '..', 'js', 'actions.js'), 'utf8');
  check('toplu üretim her bulguyu günlüğe yazar', /uretilen\.forEach\(a => Store\.log\('action-add'/.test(kod));
  check('yöntem olayının adı var', ChangeLog.turAdi('method') !== 'method', ChangeLog.turAdi('method'));
  Store.replace(temiz);
})();

/* ---------- Risk kabulü raporda, bulgu ekranında ve ek sette görünür ---------- */
(() => {
  const temiz = JSON.parse(JSON.stringify(Store.snapshot()));
  const s = JSON.parse(JSON.stringify(temiz));
  s.actions = [
    { id: 'RK-1', finding: 'Kabul edilen bulgu', crit: 'Yüksek', status: 'Kabul Edilen Risk',
      closedAt: '2026-01-10', verification: 'YK-2026/14', due: '2025-01-01' },
    { id: 'RK-2', finding: 'Açık', crit: 'Orta', status: 'Açık', due: '2099-01-01' }
  ];
  const set = EXTRA.sets.find(x => Array.isArray(x.types) && x.types.length);
  s.kunye.yukumlu_tipi = 'Banka';
  s.answers[set.questions[0].id] = { a: 'Hayır' };
  Store.replace(s);
  const calc = Calc.compute(Store.state);
  const r = host(); Exporter.report(r, { state: Store.state, calc });
  check('raporda risk kabulü tablosu', r.innerHTML.includes(I18n.t('rptAcceptedTtl')) && r.innerHTML.includes('YK-2026/14'));
  check('rapor özeti kabul sayısını verir', /risk kabulü <b>1<\/b>/.test(r.innerHTML));
  const a = host(); Actions.view(a, { state: Store.state, calc });
  check('bulgu ekranında kabul kutucuğu', a.innerHTML.includes(I18n.t('acceptedFoot')));
  const satir = (a.innerHTML.split('<tr>').find(x => x.includes('>RK-1<')) || '');
  check('kabul edilen bulgu satırı bulundu', satir.length > 0);
  check('kabul edilen bulgu gecikmiş rozeti almaz', !satir.includes(I18n.t('overdue')) && satir.includes('chip-na'), satir.slice(-300));
  const e = host(); Extra.view(e, { state: Store.state, calc });
  check('kapsam dışı sette bekleyen yanıt uyarısı', e.innerHTML.includes(I18n.t('exHeldAnswers', { n: '1' })));
  Store.replace(temiz);
})();

/* ---------- CSV yapısı ----------
   Dokuz dışa aktarım gerçek bir ayrıştırıcıyla okunur: her tabloda satır
   genişliği başlıkla aynı, ondalık biçimi dile uygun (TR ; ve virgül, EN , ve
   nokta), formül enjeksiyonu yükleri etkisiz, EN başlıklarda Türkçe yok.
   Canlıda şube FTE'si, iş kolu payı ve işlem tutarı noktalı ondalık yazılıyor;
   İngilizce CSV de noktalı virgülle bölünüyordu. */
(() => {
  const ctx = A.__ctx;
  let yakalanan = null;
  const eskiUrl = ctx.URL.createObjectURL, eskiEl = ctx.document.createElement;
  ctx.URL.createObjectURL = b => { yakalanan = b.parts.join(''); return 'blob:x'; };
  ctx.document.createElement = (...a) => Object.assign(eskiEl(...a), { click() {} });
  const temiz = JSON.parse(JSON.stringify(Store.snapshot()));
  try {
    const demo = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '..', 'demo-calisma-dosyasi.json'), 'utf8'));
    demo.actions[0].finding = '=HYPERLINK("http://x")'; demo.actions[0].owner = '+1 555';
    demo.answers['D1-01'].evidence = '@SUM(A1)'; demo.answers['D1-02'].note = '-cmd|calc';
    demo.portfolio.branches[0].complianceFte = 2.5;
    demo.operations.islem_toplam = Object.assign({}, demo.operations.islem_toplam, { tutar: 1234.56 });
    Object.values(demo.lines || {}).forEach(l => { l.share = 12.5; });
    demo.log = [{ at: new Date().toISOString(), what: 'answer', ref: 'D1-01', from: 'Hayır', to: 'Evet', who: '=1+1' }];
    Store.replace(demo);
    const ayristir = (t, sep) => {
      const rows = []; let row = [], cell = '', q = false;
      for (let i = 0; i < t.length; i++) {
        const ch = t[i];
        if (q) { if (ch === '"') { if (t[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += ch; }
        else if (ch === '"') q = true; else if (ch === sep) { row.push(cell); cell = ''; }
        else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; } else if (ch !== '\r') cell += ch;
      }
      row.push(cell); rows.push(row); return rows;
    };
    const sorun = [];
    ['tr', 'en'].forEach(dil => {
      I18n.apply(dil);
      const calc = Calc.compute(Store.state);
      ['questions', 'domains', 'portfolio', 'operations', 'countries', 'inherent', 'qa', 'actions', 'log'].forEach(k => {
        yakalanan = null; Exporter.exportCSV(k, calc);
        if (!yakalanan.startsWith('\ufeff')) sorun.push(`${dil} ${k}: BOM yok`);
        const rows = ayristir(yakalanan.slice(1), dil === 'en' ? ',' : ';');
        const bloklar = []; let b = [];
        rows.forEach(r => { if (r.length === 1 && r[0] === '') { if (b.length) bloklar.push(b); b = []; } else b.push(r); });
        if (b.length) bloklar.push(b);
        bloklar.forEach((bl, bi) => {
          const i = bl[0].length === 1 && bl.length > 1 ? 1 : 0;
          const w = bl[i].length;
          bl.slice(i + 1).forEach((r, ri) => { if (r.length !== w) sorun.push(`${dil} ${k} blok ${bi} satır ${ri + 1}: ${r.length} ≠ ${w}`); });
          if (dil === 'en') bl[i].forEach(h => { if (/[çğıöşüÇĞİÖŞÜ]/.test(h)) sorun.push(`en ${k} başlık: ${h}`); });
        });
        rows.forEach(r => r.forEach(c => {
          if (/^[=+\-@]/.test(c) && !/^[+-]?(\d+([.,]\d+)?|[.,]\d+)%?$/.test(c.trim())) sorun.push(`${dil} ${k}: korumasız "${c.slice(0, 20)}"`);
          if (dil === 'tr' && /^-?\d+\.\d+%?$/.test(c)) sorun.push(`tr ${k}: noktalı ondalık "${c}"`);
          if (dil === 'en' && /^-?\d+,\d+%?$/.test(c)) sorun.push(`en ${k}: virgüllü ondalık "${c}"`);
          if (/NaN|undefined|\[object/.test(c)) sorun.push(`${dil} ${k}: "${c.slice(0, 30)}"`);
        }));
      });
    });
    I18n.apply('tr');
    check('CSV yapısı: hiza, ondalık, enjeksiyon, dil', sorun.length === 0, sorun.slice(0, 6));
  } finally {
    ctx.URL.createObjectURL = eskiUrl; ctx.document.createElement = eskiEl;
    Store.replace(temiz);
  }
})();

/* ---------- Büyük portföy: ülke listesi satır başına basılmaz ----------
   500 ülke satırında her satıra 250 seçenekli liste basmak ekranı ~3 sn
   donduruyordu. Liste ilk etkileşimde doldurulur (CountryRisk.optionsLazy). */
(() => {
  const temiz = JSON.parse(JSON.stringify(Store.snapshot()));
  const s = JSON.parse(JSON.stringify(temiz));
  s.portfolio.countries = Array.from({ length: 500 }, (_, i) => ({ code: ['DE', 'IR', 'TR'][i % 3], relations: [], customers: i }));
  s.portfolio.branches = Array.from({ length: 50 }, (_, i) => ({ name: 'Ş' + i, country: 'DE' }));
  Store.replace(s);
  const x = host(); Portfolio.view(x, { state: Store.state, calc: Calc.compute(Store.state) });
  const secenek = (x.innerHTML.match(/<option/g) || []).length;
  check('büyük portföyde seçenek sayısı satır sayısıyla orantılı', secenek < 2000, secenek);
  check('ülke satırı seçili ülkeyi taşır', /value="IR" selected/.test(x.innerHTML));
  check('tembel liste işaretli', (x.innerHTML.match(/data-ulke-tembel/g) || []).length === 550);
  const tam = A.CountryRisk.options('DE', Store.state);
  check('tam liste ilk etkileşimde doldurulabilir', (tam.match(/<option/g) || []).length > 150 && /value="DE" selected/.test(tam));
  Store.replace(temiz);
})();

/* ---------- İçerik güvenlik politikası ----------
   Sayfalar dışarıya bağlanamaz ve başka kaynaktan betik yükleyemez. Politika
   satır içi betiği de reddeder; bu yüzden şablonlarda on* niteliği olmamalı. */
(() => {
  const fs = require('fs'), path = require('path'), KOK = path.join(__dirname, '..');
  ['index.html', 'KILAVUZ.html', 'GUIDE.html'].forEach(f => {
    const h = fs.readFileSync(path.join(KOK, f), 'utf8');
    const m = h.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/);
    check(`${f}: CSP var`, Boolean(m));
    if (m) {
      check(`${f}: dışarıya bağlantı yok`, /connect-src 'none'/.test(m[1]));
      // file: yalnızca index.html çift tıklanarak açıldığında geçerlidir; https sayfası yerel dosya yükleyemez
      check(`${f}: betik yalnız aynı kaynaktan`, /script-src 'self'( file:)?(;|$)/.test(m[1]) && !/script-src[^;]*(unsafe|https?:|\*)/.test(m[1]));
    }
    check(`${f}: satır içi betik yok`, !/<script(?![^>]*\bsrc=)[^>]*>/.test(h));
  });
  const kod = fs.readdirSync(path.join(KOK, 'js')).map(f => fs.readFileSync(path.join(KOK, 'js', f), 'utf8')).join('\n');
  check('şablonlarda on* olay niteliği yok', !/\son(click|load|error|change|input|submit|mouse\w+|key\w+)=/.test(kod));
})();

process.exitCode = H.report('Görünüm — kaçırma, anahtar ve etiket') ? 1 : 0;
