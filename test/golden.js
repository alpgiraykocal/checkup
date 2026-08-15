/* Altın örnek — davranış çıpası.

   NE YAPAR: Belirlenmiş (deterministik) bir değerlendirme kurar, hesap
   zincirinin tüm çıktılarını üretir ve golden.expected.json içindeki beklenen
   değerlerle karşılaştırır. Skorlamada kasıtsız bir kayma olursa test düşer.

   NE YAPMAZ: Bu, kaynak çalışma kitabına (AML_Uyum_Checkup_Anket_QA_Aksiyon.xlsx)
   karşı bir doğrulama DEĞİLDİR. Beklenen değerler uygulamanın kendi çıktısından
   üretilmiştir; yani "kod bugün, dünkü kodla aynı sonucu veriyor" demektir.
   Çalışma kitabı paritesini gerçekten sınamak için test/PARITE.md içindeki
   yordamı izleyin: kitaptan elle türetilen değerleri golden.workbook.json
   dosyasına yazın; varsa bu test onu da karşılaştırır.

   Beklenen değerleri kasıtlı bir değişiklikten sonra tazelemek için:
     node test/golden.js --yenile
*/

const fs = require('fs');
const path = require('path');
const H = require('./harness.js');
const { check, near } = H;
const A = H.load();
const { DATA, EXTRA, RISKMODEL, PORTFOLIO, Calc, Store, I18n } = A;

const BEKLENEN = path.join(__dirname, 'golden.expected.json');
const KITAP = path.join(__dirname, 'golden.workbook.json');
const yenile = process.argv.includes('--yenile');

/* ---------- Belirlenmiş değerlendirme ----------
   Tohumlu üretim: rastgelelik yok, her koşuda aynı girdi. */
function ornek() {
  const s = JSON.parse(JSON.stringify(Store.snapshot()));

  Object.assign(s.kunye, {
    kurum_unvani: 'Altın Örnek Bank A.Ş.',
    yukumlu_tipi: 'Banka',
    donem_baslangic: '2025-01-01',
    donem_bitis: '2025-12-31',
    degerlendirmeyi_yapan: 'Bağımsız iç denetim',
    toplam_musteri_sayisi: 120000,
    yuksek_riskli_musteri_sayisi: 6400,
    pep_musteri_sayisi: 380,
    yillik_islem_adedi: 8400000,
    yillik_sinir_otesi_islem_adedi: 730000,
    uyum_birimi_kadrosu_fte: 24
  });
  // Faaliyet soruları: üçüncüsü kapalı, kapsam kuralları da sınansın
  (DATA.yesNoFields || []).forEach((id, i) => { s.kunye[id] = (i % 3 === 2) ? 'Hayır' : 'Evet'; });

  // Doğuştan risk: 1..5 döngüsü, dördüncüde gerekçe, beşincide uygulanamaz
  DATA.inherentFactors.forEach((f, i) => {
    if (i % 7 === 6) { s.inherentNA[f.key] = true; return; }
    s.inherent[f.key] = (i % 5) + 1;
    if ((i % 5) + 1 >= 4) s.inherentNotes[f.key] = 'Gerekçe ' + i;
    if (i % 11 === 3) s.inherentWeights[f.key] = 5;
  });

  // Anket: dört yanıt döngüsü, QA testi olan sorularda dört sonuç döngüsü
  const yanit = ['Evet', 'Kısmen', 'Hayır', 'Evet'];
  const qaSonuc = ['Doğrulandı', 'Kısmen doğrulandı', 'Çelişkili', 'Test edilmedi'];
  DATA.questions.forEach((q, i) => {
    const rec = { a: yanit[i % 4], evidence: i % 3 === 0 ? '' : 'Kanıt ' + q.id };
    if (q.qa) rec.qaResult = qaSonuc[i % 4];
    s.answers[q.id] = rec;
  });

  EXTRA.sets.forEach((set, si) => set.questions.forEach((q, i) => {
    s.answers[q.id] = { a: yanit[(si + i) % 4], evidence: 'Ek kanıt' };
  }));

  DATA.qaPopulations.forEach((p, i) => { s.qaVolumes[p.key] = (i + 1) * 1250; });
  DATA.kpis.forEach((k, i) => { s.kpis[k.key] = { target: String(10 + i), value: String(8 + i * 2) }; });
  RISKMODEL.pf.factors.forEach((f, i) => { s.pf[f.key] = { score: (i % 4) + 2, note: 'PF ' + i }; });

  RISKMODEL.businessLines.lines.slice(0, 5).forEach((l, i) => {
    s.lines[l.key] = { active: true, share: [30, 25, 20, 15, 10][i],
      dims: Object.fromEntries(RISKMODEL.businessLines.dims.map((d, j) => [d, ((i + j) % 5) + 1])) };
  });

  PORTFOLIO.customerTypes.forEach((ct, i) => {
    s.portfolio.matrix[ct.key] = Object.fromEntries(
      PORTFOLIO.riskBands.map((b, j) => [b.key, (i + 1) * (j + 1) * 250]));
  });
  PORTFOLIO.segments.forEach((sg, i) => { s.portfolio.segments[sg.key] = { customers: (i + 1) * 320, highRisk: (i + 1) * 40 }; });
  s.portfolio.countries = [
    { code: 'DE', relations: ['yurt_ici'], customers: 42000, txIn: 310000, txOut: 260000 },
    { code: 'IR', relations: ['islem_karsi'], customers: 40, txIn: 900, txOut: 1200 },
    { code: 'AE', relations: ['muhabir'], customers: 1800, txIn: 42000, txOut: 38000 }
  ];
  s.portfolio.branches = [
    { name: 'Genel Müdürlük', type: PORTFOLIO.branchTypes[0].key, country: 'TR', customers: 90000, highRiskCustomers: 4800, complianceFte: 18, lastAudit: '2025-03-01' },
    { name: 'Frankfurt', type: 'yurtdisi', country: 'DE', customers: 12000, highRiskCustomers: 900, complianceFte: 2, lastAudit: '2022-06-01' }
  ];

  s.operations = {
    islem_toplam: { adet: 8400000 }, islem_izlenen: { adet: 8190000 },
    izleme_alert: { adet: 24000 }, izleme_vaka: { adet: 3100 }, sib_adet: { adet: 410 },
    yeni_hesap: { adet: 21000 }, uzaktan_hesap: { adet: 9400 },
    qa_test_dosya: { adet: 640 }, qa_kritik_hata: { adet: 22 },
    egitim_hedef: { adet: 2400 }, egitim_tamamlayan: { adet: 2280 }
  };

  s.actions = [
    { id: 'BLG-001', domain: 'D6', questionId: 'D6-02', finding: 'Liste güncelleme SLA aşımı',
      rootCause: 'Sistem', crit: 'Kritik', action: 'Otomatik besleme', owner: 'BT',
      due: '2025-03-01', status: 'Kapalı', closedAt: '2025-02-20', verification: 'Log testi', residualAfter: 'Düşük' },
    { id: 'BLG-002', domain: 'D5', questionId: 'D5-18', finding: 'SoW kanıtı eksik',
      rootCause: 'Süreç', crit: 'Yüksek', action: 'Şablon', owner: 'KYC',
      due: '2025-06-01', status: 'Açık', verification: 'QA örneklemi' },
    { id: 'BLG-003', domain: 'D7', questionId: 'D7-08', finding: 'BTL testi yapılmamış',
      rootCause: 'Yönetişim', crit: 'Kritik', action: 'Yıllık plan', owner: 'Uyum',
      due: '2099-12-31', status: 'Devam Ediyor', verification: 'Validasyon raporu' }
  ];

  s.appetite = { D6: 1.2, PF: 2.0 };
  s.signoff = { prepared: { name: 'A. Yılmaz', date: '2026-01-15' } };
  return s;
}

/* ---------- Ölçülen çıktılar ---------- */
function olc(c) {
  const r3 = v => (v === null || v === undefined ? null : Math.round(v * 1e6) / 1e6);
  return {
    totals: {
      count: c.totals.count, answered: c.totals.answered, na: c.totals.na,
      applicableWeight: r3(c.totals.applicableWeight), earned: r3(c.totals.earned),
      earnedTested: r3(c.totals.earnedTested),
      effectiveness: r3(c.totals.effectiveness), effectivenessTested: r3(c.totals.effectivenessTested),
      assurance: r3(c.totals.assurance), maturity: c.totals.maturity,
      openCritical: c.totals.openCritical, actionsNeeded: c.totals.actionsNeeded
    },
    domains: c.domains.map(d => ({ code: d.code, answered: d.answered, na: d.na,
      applicableWeight: r3(d.applicableWeight), effectiveness: r3(d.effectiveness),
      effectivenessTested: r3(d.effectivenessTested), maturity: d.maturity,
      assurance: r3(d.assurance), openCritical: d.openCritical })),
    inherent: {
      general: r3(c.inherent.general), scored: c.inherent.scored, na: c.inherent.na,
      applicable: c.inherent.applicable, complete: c.inherent.complete,
      missingNotes: c.inherent.missingNotes,
      dims: Object.fromEntries(Calc.DIMS.concat(['GENEL']).map(d =>
        [d, { value: r3(c.inherent.dims[d].value), level: c.inherent.dims[d].level,
              scored: c.inherent.dims[d].scored, na: c.inherent.dims[d].na }]))
    },
    residual: c.residual.map(r => ({ code: r.code, inherentRisk: r3(r.inherentRisk),
      effectivenessTested: r3(r.effectivenessTested), residual: r3(r.residual),
      level: r.level, appetite: r.appetite, breach: r.breach })),
    pf: { value: r3(c.pf.value), level: c.pf.level, residual: r3(c.pfLine.residual),
          appetite: c.pfLine.appetite, breach: c.pfLine.breach },
    lines: { shareSum: r3(c.lines.shareSum), weightedInherent: r3(c.lines.weightedInherent),
             active: c.lines.active, scored: c.lines.scored },
    genel: { generalResidual: r3(c.generalResidual), domainAvgResidual: r3(c.domainAvgResidual),
             worstDomain: c.worstDomain ? c.worstDomain.code : null, breaches: c.breaches,
             masksBreach: c.masksBreach },
    qa2: { required: c.qa2.required, tested: c.qa2.tested, coverage: r3(c.qa2.coverage),
           conflicts: c.qa2.conflicts.length },
    qaTotals: c.qaTotals,
    qa: c.qa.map(p => ({ key: p.key, volume: p.volume, yearlySample: p.yearlySample, perTest: p.perTest })),
    actionStats: { total: c.actionStats.total, open: c.actionStats.open, overdue: c.actionStats.overdue,
                   closed: c.actionStats.closed, critical: c.actionStats.critical,
                   closureRate: r3(c.actionStats.closureRate) },
    extra: c.extra ? { activeSets: c.extra.activeSets, count: c.extra.totals.count,
      answered: c.extra.totals.answered, effectivenessTested: r3(c.extra.totals.effectivenessTested),
      openCritical: c.extra.totals.openCritical } : null,
    kunye: { filled: c.kunye.filled, total: c.kunye.total, missingRequired: c.kunye.missingRequired.length,
             warnings: c.kunye.warnings.length,
             ratios: c.kunye.ratios.map(x => ({ id: x.id, value: r3(x.value) })) },
    portfolio: c.portfolio ? { total: c.portfolio.total, highRisk: c.portfolio.highRisk,
      highRiskShare: r3(c.portfolio.highRiskShare), countries: c.portfolio.countries.count,
      crossTx: c.portfolio.countries.crossTx, hints: Object.keys(c.portfolio.hints).length,
      warnings: c.portfolio.warnings.length } : null,
    operations: c.operations ? { filled: c.operations.filled, total: c.operations.total,
      hints: Object.keys(c.operations.hints).length, kpi: Object.keys(c.operations.kpi).length,
      warnings: c.operations.warnings.length,
      derived: c.operations.derived.map(d => ({ key: d.spec.key, value: r3(d.value) })) } : null
  };
}

/* ---------- Koşum ---------- */
I18n.apply('tr');
const durum = Store.normalize(ornek());
const olculen = olc(Calc.compute(durum));

if (yenile) {
  fs.writeFileSync(BEKLENEN, JSON.stringify(olculen, null, 2) + '\n');
  console.log('Altın örnek tazelendi:', path.relative(process.cwd(), BEKLENEN));
  console.log('DİKKAT: değişikliğin kasıtlı olduğunu doğrulayın; fark commit içinde görünür.');
  process.exit(0);
}

if (!fs.existsSync(BEKLENEN)) {
  console.log('Beklenen değer dosyası yok. Oluşturmak için: node test/golden.js --yenile');
  process.exit(1);
}

const beklenen = JSON.parse(fs.readFileSync(BEKLENEN, 'utf8'));

/* Derin karşılaştırma: her sapma tek tek raporlanır. */
function karsilastir(a, b, yol = '') {
  if (a === b) return;
  if (typeof a === 'number' && typeof b === 'number') {
    check(`değer${yol}`, near(a, b, 1e-6), { beklenen: b, olculen: a });
    return;
  }
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    check(`değer${yol}`, false, { beklenen: b, olculen: a });
    return;
  }
  const anahtarlar = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of anahtarlar) {
    if (!(k in a)) { check(`eksik alan${yol}.${k}`, false, { beklenen: b[k] }); continue; }
    if (!(k in b)) { check(`fazla alan${yol}.${k}`, false, { olculen: a[k] }); continue; }
    karsilastir(a[k], b[k], `${yol}.${k}`);
  }
}
karsilastir(olculen, beklenen);

/* ---------- Dil bağımsızlığı ---------- */
I18n.apply('en');
const enOlculen = olc(Calc.compute(durum));
I18n.apply('tr');
const sayisal = o => JSON.parse(JSON.stringify(o, (k, v) =>
  (k === 'maturity' || k === 'level' || k === 'worstDomain') ? undefined : v));
check('İngilizce koşumda sayısal sonuçlar aynı',
  JSON.stringify(sayisal(enOlculen)) === JSON.stringify(sayisal(olculen)));

/* ---------- Çalışma kitabı karşılaştırması (dosya varsa) ---------- */
if (fs.existsSync(KITAP)) {
  const kitap = JSON.parse(fs.readFileSync(KITAP, 'utf8'));
  Object.keys(kitap).forEach(yol => {
    const beklenenDeger = kitap[yol];
    const olculenDeger = yol.split('.').reduce((o, k) => (o === undefined ? o : o[k]), olculen);
    check(`çalışma kitabı: ${yol}`, near(Number(olculenDeger), Number(beklenenDeger), 1e-4),
      { kitap: beklenenDeger, uygulama: olculenDeger });
  });
  console.log(`  (çalışma kitabı karşılaştırması: ${Object.keys(kitap).length} değer)`);
} else {
  console.log('  (çalışma kitabı dosyası yok — yalnızca davranış çıpası; bkz. test/PARITE.md)');
}

process.exitCode = H.report('Altın örnek — regresyon çıpası') ? 1 : 0;
