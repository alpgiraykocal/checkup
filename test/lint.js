/* Yerelleştirilmiş alanı mantık anahtarı olarak kullanma denetimi.

   I18n.apply() bazı DATA alanlarının üzerine seçili dilin metnini yazar. Bu
   alanlardan biri karşılaştırmada, sözlük anahtarında ya da filtre değerinde
   kullanılırsa kod Türkçede çalışır, İngilizcede sessizce yanlış sonuç verir.
   Bu sınıftan üç hata çıktı: QA sıklık bölücüsü (test başına örneklem dört
   katı), kapsam dışı bölüm sayacı (İngilizcede 0), künye grup eşleştirmesi.

   Kural: yerelleştirilen alanın yanında sabit bir anahtar alanı varsa
   (freq→freqKey, crit→critKey, section→sectionKey, dim→dimKey, group→groupKey,
   risk→riskKey, name→key) karşılaştırmada anahtar kullanılmalıdır. */

const fs = require('fs');
const path = require('path');
const H = require('./harness.js');
const { check } = H;
const A = H.load();
const { DATA, Calc, Store, I18n, EXTRA, RISKMODEL, PORTFOLIO } = A;

const JS = path.join(__dirname, '..', 'js');
const KOD = fs.readdirSync(JS)
  .filter(f => f.endsWith('.js') && !/\.data\.js$|^data\.js$|^data\.en\.js$|^questions\.en\.js$|^countries\.js$/.test(f));

/* ---------- Statik: yerelleştirilmiş alanla karşılaştırma ---------- */
const ANAHTARLI = { freq: 'freqKey', risk: 'riskKey', crit: 'critKey', dim: 'dimKey',
                    section: 'sectionKey', group: 'groupKey' };

for (const f of KOD) {
  const satirlar = fs.readFileSync(path.join(JS, f), 'utf8').split('\n');
  satirlar.forEach((satir, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(satir)) return;          // yorum satırı
    /* Durum kayıtları (aksiyon, filtre, rota) alanlarını sabit anahtarla saklar;
       bunlar dile göre değişmez. Böyle satırlar gerekçesiyle muaf tutulur. */
    if (satir.includes('dil-güvenli')) return;
    Object.entries(ANAHTARLI).forEach(([alan, anahtar]) => {
      // "x.freq ===" ya da "=== x.freq" biçimleri (anahtarlı sürüm hariç)
      const re = new RegExp(`\\.${alan}\\s*(===|!==)|(===|!==)\\s*\\w+\\.${alan}\\b`);
      if (re.test(satir) && !satir.includes('.' + anahtar)) {
        check(`${f}:${i + 1} — .${alan} karşılaştırması (.${anahtar} kullanılmalı)`, false, satir.trim().slice(0, 90));
      }
    });
    // Bileşik anahtar yerelleştirilmiş alanla kurulmuş: q.domain + '|' + q.section gibi
    // (künyede kapsam dışı soru sayısı İngilizcede 0 çıkıyordu)
    Object.entries(ANAHTARLI).forEach(([alan, anahtar]) => {
      const re = new RegExp(`'\\|'\\s*\\+\\s*\\w+\\.${alan}\\b|\\w+\\.${alan}\\s*\\+\\s*'\\|'`);
      if (re.test(satir) && !satir.includes('.' + anahtar)) {
        check(`${f}:${i + 1} — .${alan} bileşik anahtarda (.${anahtar} kullanılmalı)`, false, satir.trim().slice(0, 90));
      }
    });
    // Sözlük anahtarı olarak yerelleştirilmiş ad: state.kpis[k.name] gibi
    if (/\[\s*\w+\.name\s*\]/.test(satir) && !/\.key\b/.test(satir)) {
      check(`${f}:${i + 1} — .name sözlük anahtarı olarak kullanılmış`, false, satir.trim().slice(0, 90));
    }
  });
}

/* ---------- Davranışsal: iki dilde sayısal sonuç aynı olmalı ---------- */
function ornekDurum() {
  const s = JSON.parse(JSON.stringify(Store.snapshot()));
  Object.assign(s.kunye, { yukumlu_tipi: 'Banka', toplam_musteri_sayisi: 5000,
    yillik_islem_adedi: 90000, uyum_birimi_kadrosu_fte: 6,
    donem_baslangic: '2025-01-01', donem_bitis: '2025-12-31' });
  (DATA.yesNoFields || []).forEach((id, i) => { s.kunye[id] = i % 3 === 2 ? 'Hayır' : 'Evet'; });
  DATA.inherentFactors.forEach((f, i) => { s.inherent[f.key] = (i % 5) + 1; });
  DATA.questions.forEach((q, i) => {
    s.answers[q.id] = { a: ['Evet', 'Kısmen', 'Hayır', 'Evet'][i % 4] };
    if (q.qa) s.answers[q.id].qaResult = ['Doğrulandı', 'Kısmen doğrulandı', 'Çelişkili', 'Test edilmedi'][i % 4];
  });
  EXTRA.sets.forEach(set => set.questions.forEach((q, i) => { s.answers[q.id] = { a: i % 2 ? 'Evet' : 'Hayır' }; }));
  DATA.qaPopulations.forEach((p, i) => { s.qaVolumes[p.key] = (i + 1) * 777; });
  RISKMODEL.pf.factors.forEach((f, i) => { s.pf[f.key] = { score: (i % 5) + 1 }; });
  RISKMODEL.businessLines.lines.slice(0, 4).forEach((l, i) => {
    s.lines[l.key] = { active: true, share: 25, dims: Object.fromEntries(RISKMODEL.businessLines.dims.map(d => [d, (i % 5) + 1])) };
  });
  PORTFOLIO.customerTypes.forEach((ct, i) => {
    s.portfolio.matrix[ct.key] = Object.fromEntries(PORTFOLIO.riskBands.map((b, j) => [b.key, (i + 1) * (j + 1) * 30]));
  });
  s.portfolio.countries = [{ code: 'IR', relations: ['muhabir'], customers: 12, txIn: 400, txOut: 300 }];
  s.portfolio.branches = [{ name: 'A', type: PORTFOLIO.branchTypes[0].key, country: 'TR', customers: 900, complianceFte: 3, lastAudit: '2023-01-01' }];
  s.operations = { islem_toplam: { adet: 90000 }, islem_izlenen: { adet: 84000 },
                   izleme_alert: { adet: 900 }, izleme_vaka: { adet: 120 }, sib_adet: { adet: 20 } };
  s.actions = [{ id: 'X1', crit: 'Kritik', status: 'Açık', due: '2025-01-01' }];
  return Store.normalize(s);
}

/** Metin alanlarını atıp yalnızca sayı/boolean bırakır. */
function sayisal(o) {
  return JSON.parse(JSON.stringify(o, (k, v) => {
    if (typeof v === 'string') return undefined;
    if (typeof v === 'function') return undefined;
    return v;
  }));
}

const durum = ornekDurum();
I18n.apply('tr');
const tr = sayisal(Calc.compute(durum));
I18n.apply('en');
const en = sayisal(Calc.compute(durum));
I18n.apply('tr');

const farklar = [];
(function fark(a, b, yol) {
  if (JSON.stringify(a) === JSON.stringify(b)) return;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    farklar.push(`${yol}: TR=${JSON.stringify(a)} EN=${JSON.stringify(b)}`);
    return;
  }
  new Set([...Object.keys(a || {}), ...Object.keys(b || {})]).forEach(k => fark(a[k], b[k], `${yol}.${k}`));
})(tr, en, '');

check('iki dilde sayısal sonuçlar aynı', farklar.length === 0, farklar.slice(0, 8));

/* Aynı denetim yardımcı hesaplar için de yapılır */
['extra', 'portfolio', 'operations'].forEach(alan => {
  I18n.apply('tr'); const a = sayisal(Calc.compute(durum)[alan]);
  I18n.apply('en'); const b = sayisal(Calc.compute(durum)[alan]);
  I18n.apply('tr');
  check(`${alan}: iki dilde aynı`, JSON.stringify(a) === JSON.stringify(b));
});

/* ---------- İngilizce arayüzde Türkçe kalıntı ----------
   Anahtar örtüsü testi her t() anahtarının iki dilde karşılığını arar; koda ya da
   veriye doğrudan yazılmış Türkçe metni görmez. Canlıda İngilizce ekranda ek
   kontrol kaynakları, sözlük terimleri ve referans paketi takvimi Türkçe
   kalmıştı. Burada kullanıcı metni nötrlenmiş bir çalışma İngilizce çizilir. */
{
  const { Views, Portfolio, Operations, Settings, Extra, ChangeLog, Actions, Exporter, GLOSSARY, REFPACK } = A;
  const TR = /[çğıöşüÇĞİÖŞÜ]/;
  const KELIME = /\b(ve|veya|ile|için|soru|yanıt|bulgu|kontrol|toplam|açık|kapalı|Evet|Hayır|Kısmen|Uygulanamaz|Seçiniz|Tümü)\b/;
  const IZIN = /Türkiye|Curaçao/;             // resmî İngilizce ülke adları
  const bul = [];
  const tara = (yer, metin) => String(metin).replace(/<[^>]+>/g, '\n').split('\n').map(x => x.trim()).filter(Boolean)
    .forEach(x => { if ((TR.test(x) || KELIME.test(x)) && !IZIN.test(x)) bul.push(`${yer}: ${x.slice(0, 80)}`); });

  I18n.apply('en');
  EXTRA.sets.forEach(set => set.questions.forEach(q => tara('ek kaynak ' + q.id, I18n.source(q.source))));
  DATA.questions.forEach(q => tara('kaynak ' + q.id, q.source));
  GLOSSARY.forEach(g => tara('sözlük', g.kEn || g.k));
  Object.values(REFPACK.sections).forEach(s => tara('referans takvimi', s.enCadence || s.cadence));

  const s = JSON.parse(JSON.stringify(Store.snapshot()));
  s.kunye.trade_finance_faaliyeti_var_mi = 'Hayır';
  s.kunye.yukumlu_tipi = 'Banka';
  DATA.questions.forEach((q, i) => { s.answers[q.id] = { a: ['Evet', 'Kısmen', 'Hayır', 'Uygulanamaz'][i % 4], evidence: 'Xx' }; if (q.qa) s.answers[q.id].qaResult = 'Çelişkili'; });
  DATA.inherentFactors.forEach((f, i) => { s.inherent[f.key] = (i % 5) + 1; });
  s.actions = [{ id: 'BLG-001', finding: 'Xx', rootCause: 'Süreç', crit: 'Yüksek', status: 'Kabul Edilen Risk', closedAt: '2026-01-01', verification: 'Xx', due: '2025-01-01', owner: 'Xx' }];
  s.portfolio.countries = [{ code: 'DE', relations: ['muhabir'], customers: 5 }];
  s.log = [{ at: new Date().toISOString(), what: 'answer', ref: 'D1-01', from: '', to: 'Evet' }];
  const temiz = JSON.parse(JSON.stringify(Store.snapshot()));
  Store.replace(s);
  const calc = Calc.compute(Store.state);
  const h = () => ({ innerHTML: '', addEventListener() {}, querySelector() { return null; } });
  [['Pano', Views.dashboard], ['Nasıl', Views.guide], ['Künye', Views.kunye], ['Doğuştan', Views.inherent],
   ['Skorlar', Views.domainScores], ['Artık', Views.residual], ['QA', Views.qa], ['Portföy', Portfolio.view],
   ['İşlem', Operations.view], ['Ayarlar', Settings.view], ['Ek', Extra.view], ['Günlük', ChangeLog.view],
   ['Bulgu', Actions.view], ['Rapor', Exporter.report]].forEach(([ad, fn]) => { const x = h(); fn(x, { state: Store.state, calc }); tara(ad, x.innerHTML); });
  const q = DATA.questions.find(x => x.qa);
  tara('soru kartı', Views.questionCard(q, calc));
  // Durum değerleri: "Kabul Edilen Risk" gibi referans değerlerinin kart içi metni
  // ve günlük tür adları da taranmış olur.
  Store.replace(temiz);
  I18n.apply('tr');
  check('İngilizce arayüzde Türkçe kalıntı yok', bul.length === 0, bul.slice(0, 8));
}

process.exitCode = H.report('Dil sızıntısı denetimi') ? 1 : 0;
