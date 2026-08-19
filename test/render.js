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
const { Store, Views, Portfolio, Operations, Settings, Extra, ChangeLog, Actions, Exporter, Calc, DATA, DATA_EN, I18n, RISKMODEL, UI } = A;

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

process.exitCode = H.report('Görünüm — kaçırma, anahtar ve etiket') ? 1 : 0;
