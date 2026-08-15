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

process.exitCode = H.report('Dil sızıntısı denetimi') ? 1 : 0;
