const H = require('./harness.js');
const { check, near } = H;
const A = H.load();
const { DATA, Calc, Store, RISKMODEL, EXTRA, PORTFOLIO, OPERATIONS, Portfolio, Operations } = A;
const blank = () => JSON.parse(JSON.stringify(Store.snapshot()));
const withState = m => { const s = blank(); m(s); return s; };

/* ---------- 12. Kapsam kuralları ---------- */
{
  const rule = DATA.scopeRules[0];
  const st = withState(s => { s.kunye[rule.field] = 'Hayır'; });
  const c = Calc.compute(st);
  rule.match.forEach(([dom, sec]) => {
    const qs = DATA.questions.filter(q => q.domain === dom && q.sectionKey === sec);
    check(`${dom}|${sec} otomatik NA`, qs.every(q => c.perQuestion[q.id].autoNA), qs.map(q=>c.perQuestion[q.id].autoNA));
    check(`${dom}|${sec} paydadan çıkar`, qs.every(q => c.perQuestion[q.id].applicableWeight === 0));
  });
  // elle yanıt kapsam kuralını yener
  const q0 = DATA.questions.find(q => q.domain === rule.match[0][0] && q.sectionKey === rule.match[0][1]);
  const st2 = withState(s => { s.kunye[rule.field] = 'Hayır'; s.answers[q0.id] = { a: 'Evet' }; });
  const c2 = Calc.compute(st2);
  check('elle yanıt kapsamı yener', c2.perQuestion[q0.id].applicableWeight === q0.weight, c2.perQuestion[q0.id]);
  // "Evet" ya da boş → kapsam dışı değil
  const c3 = Calc.compute(withState(s => { s.kunye[rule.field] = 'Evet'; }));
  check('Evet → kapsam dışı yok', !c3.perQuestion[q0.id].autoNA);
  const c4 = Calc.compute(blank());
  check('boş künye → kapsam dışı yok', !c4.perQuestion[q0.id].autoNA);
}

/* ---------- 13. QA örneklem ---------- */
{
  const st = withState(s => { DATA.qaPopulations.forEach(p => s.qaVolumes[p.key] = 1000); });
  const c = Calc.compute(st);
  c.qa.forEach(p => {
    const beklenen = p.full ? 1000 : Math.min(1000, Math.max(Math.round(1000 * p.rate), p.min));
    check(`${p.key} yıllık örneklem`, p.yearlySample === beklenen, { a: p.yearlySample, b: beklenen });
    const div = p.freq === 'Çeyreklik' ? 4 : p.freq === 'Altı Aylık' ? 2 : 1;
    check(`${p.key} test başına`, p.perTest === Math.ceil(beklenen / div), { a: p.perTest, b: Math.ceil(beklenen/div) });
    check(`${p.key} örneklem ≤ hacim`, p.yearlySample <= p.volume, { s: p.yearlySample, v: p.volume });
  });
  // hacim asgariden küçükse örneklem hacmi aşmamalı
  const kucuk = withState(s => { DATA.qaPopulations.forEach(p => s.qaVolumes[p.key] = 3); });
  Calc.compute(kucuk).qa.forEach(p => check(`${p.key} küçük hacim`, p.yearlySample <= 3, p.yearlySample));
  // sıfır ve negatif hacim
  const sifir = withState(s => { DATA.qaPopulations.forEach(p => s.qaVolumes[p.key] = 0); });
  Calc.compute(sifir).qa.forEach(p => check(`${p.key} sıfır hacim → null`, p.yearlySample === null, p.yearlySample));
  const neg = withState(s => { DATA.qaPopulations.forEach(p => s.qaVolumes[p.key] = -5); });
  Calc.compute(neg).qa.forEach(p => check(`${p.key} negatif hacim → null`, p.yearlySample === null, p.yearlySample));
}

/* ---------- 14. SLA son tarihleri ---------- */
{
  const iş = (from, gun) => { const d = new Date(from); let left = gun;
    while (left > 0) { d.setDate(d.getDate()+1); const w = d.getDay(); if (w!==0 && w!==6) left--; } return d.toISOString().slice(0,10); };
  // 2026-08-14 Cuma
  check('Kritik 5 iş günü', Calc.slaDueDate('Kritik','2026-08-14') === iş('2026-08-14',5), Calc.slaDueDate('Kritik','2026-08-14'));
  check('Kritik hafta sonu atlar', Calc.slaDueDate('Kritik','2026-08-14') === '2026-08-21', Calc.slaDueDate('Kritik','2026-08-14'));
  check('Yüksek 30 gün', Calc.slaDueDate('Yüksek','2026-01-01') === '2026-01-31', Calc.slaDueDate('Yüksek','2026-01-01'));
  check('Orta 90 gün', Calc.slaDueDate('Orta','2026-01-01') === '2026-04-01', Calc.slaDueDate('Orta','2026-01-01'));
  check('bilinmeyen kritiklik boş', Calc.slaDueDate('Yok','2026-01-01') === '');
}

/* ---------- 15. Aksiyon istatistikleri ---------- */
{
  const bugun = new Date(); bugun.setHours(0,0,0,0);
  const dun = new Date(bugun); dun.setDate(dun.getDate()-1);
  const yarin = new Date(bugun); yarin.setDate(yarin.getDate()+1);
  const iso = d => { const p2=n=>String(n).padStart(2,'0'); return `${d.getFullYear()}-${p2(d.getMonth()+1)}-${p2(d.getDate())}`; };
  const st = withState(s => { s.actions = [
    { id:'A1', status:'Açık', due: iso(dun), crit:'Kritik' },
    { id:'A2', status:'Açık', due: iso(yarin), crit:'Orta' },
    { id:'A3', status:'Kapalı', due: iso(dun), crit:'Kritik' },
    { id:'A4', status:'Devam Ediyor', due: iso(bugun), crit:'Yüksek' },
    { id:'A5', status:'Açık' }
  ]; });
  const c = Calc.compute(st);
  const g = id => c.actions.find(a => a.id === id);
  check('geçmiş termin gecikmiş', g('A1').delay === 'GECİKMİŞ', g('A1').delay);
  check('gelecek termin zamanında', g('A2').delay === 'Zamanında', g('A2').delay);
  check('kapalı kayıt gecikmiş sayılmaz', g('A3').delay === 'Kapalı', g('A3').delay);
  check('bugün termin gecikmiş değil', g('A4').delay === 'Zamanında', g('A4').delay);
  check('terminsiz kayıt boş', g('A5').delay === '', g('A5').delay);
  check('toplam', c.actionStats.total === 5);
  check('açık', c.actionStats.open === 4, c.actionStats.open);
  check('kapalı', c.actionStats.closed === 1);
  check('gecikmiş', c.actionStats.overdue === 1, c.actionStats.overdue);
  check('kritik açık', c.actionStats.critical === 1, c.actionStats.critical);
  check('kapanış oranı', near(c.actionStats.closureRate, 0.2), c.actionStats.closureRate);
  check('boşta kapanış oranı null', Calc.compute(blank()).actionStats.closureRate === null);
}

/* ---------- 16. PF ---------- */
{
  const st = withState(s => {
    RISKMODEL.pf.factors.forEach(f => s.pf[f.key] = { score: 4 });
    DATA.questions.filter(q => q.domain === 'D6').forEach(q => s.answers[q.id] = { a: 'Evet' });
  });
  const c = Calc.compute(st);
  check('PF değeri', near(c.pf.value, 4), c.pf.value);
  const d6 = c.domains.find(d => d.code === 'D6');
  check('PF artık riski D6 etkinliğinden', near(c.pfLine.residual, 4 * (1 - Math.min(d6.effectivenessTested, 0.95))), c.pfLine.residual);
  check('PF varsayılan iştah', c.pfLine.appetite === 1.5);
  check('PF ML/TF ortalamasına karışmaz', !Calc.DIMS.some(d => c.inherent.dims[d].total > DATA.inherentFactors.filter(f=>f.dimKey===d).length));
  // kapsam dışı PF faktörü
  const scoped = RISKMODEL.pf.factors.find(f => f.scope);
  const st2 = withState(s => { s.kunye[scoped.scope] = 'Hayır'; RISKMODEL.pf.factors.forEach(f => { if (f !== scoped) s.pf[f.key] = { score: 3 }; }); });
  const c2 = Calc.compute(st2);
  check('PF kapsam dışı faktör paydada yok', c2.pf.na === 1 && c2.pf.applicable === RISKMODEL.pf.factors.length - 1, { na: c2.pf.na, app: c2.pf.applicable });
  check('PF kapsam dışıyken tam', c2.pf.complete === true, c2.pf);
}

/* ---------- 17. İş kolları ---------- */
{
  const lines = RISKMODEL.businessLines.lines, dims = RISKMODEL.businessLines.dims;
  const st = withState(s => {
    s.lines[lines[0].key] = { active: true, share: 60, dims: Object.fromEntries(dims.map(d=>[d,2])) };
    s.lines[lines[1].key] = { active: true, share: 40, dims: Object.fromEntries(dims.map(d=>[d,4])) };
  });
  const c = Calc.compute(st);
  check('iş kolu payı toplamı', near(c.lines.shareSum, 100), c.lines.shareSum);
  check('pay tamlığı', c.lines.shareComplete === true);
  check('ağırlıklı doğuştan', near(c.lines.weightedInherent, (2*60 + 4*40)/100), c.lines.weightedInherent);
  check('en kötü iş kolu', c.lines.worst.spec.key === lines[1].key, c.lines.worst.spec.key);
  // kapsam dışı iş kolu aktif olamaz
  const scoped = lines.find(l => l.scope);
  const st2 = withState(s => { s.kunye[scoped.scope] = 'Hayır'; s.lines[scoped.key] = { active: true, share: 50, dims: {} }; });
  const c2 = Calc.compute(st2);
  const l2 = c2.lines.lines.find(l => l.spec.key === scoped.key);
  check('kapsam dışı iş kolu pasif', l2.active === false && l2.outOfScope === true, l2);
  check('kapsam dışı pay toplama girmez', c2.lines.shareSum === 0, c2.lines.shareSum);
}

/* ---------- 18. Ek kontroller ana skoru bozmaz ---------- */
{
  const base = withState(s => { DATA.questions.forEach((q,i) => s.answers[q.id] = { a: i%2?'Evet':'Kısmen' }); });
  const c1 = Calc.compute(base);
  const withExtra = JSON.parse(JSON.stringify(base));
  EXTRA.sets.forEach(set => set.questions.forEach(q => { withExtra.answers[q.id] = { a: 'Hayır' }; }));
  const c2 = Calc.compute(withExtra);
  check('ana soru sayısı sabit', c1.totals.count === c2.totals.count && c2.totals.count === 218, c2.totals.count);
  check('ana etkinlik sabit', c1.totals.effectivenessTested === c2.totals.effectivenessTested);
  check('domain ağırlıkları sabit', JSON.stringify(c1.domains.map(d=>d.applicableWeight)) === JSON.stringify(c2.domains.map(d=>d.applicableWeight)));
  check('ana açık kritik sabit', c1.totals.openCritical === c2.totals.openCritical);
  // ek set kapsamı
  const banka = Calc.extra(withState(s => { s.kunye.yukumlu_tipi = 'Banka'; }));
  check('banka için evrensel setler', banka.activeSets === 3, banka.activeSets);
  const sigorta = Calc.extra(withState(s => { s.kunye.yukumlu_tipi = 'Sigorta / emeklilik şirketi'; }));
  check('sigorta için 4 set', sigorta.activeSets === 4, sigorta.activeSets);
  const bostip = Calc.extra(blank());
  check('yükümlü tipi boşken sektör setleri kapalı', bostip.activeSets === 3, bostip.activeSets);
  check('kapsam dışı set toplamda yok', banka.totals.count === EXTRA.sets.filter(s=>!s.types).reduce((a,s)=>a+s.questions.length,0), banka.totals.count);
}

/* ---------- 19. Künye türetimleri ---------- */
{
  const st = withState(s => Object.assign(s.kunye, {
    toplam_musteri_sayisi: 1000, yuksek_riskli_musteri_sayisi: 100,
    pep_musteri_sayisi: 10, yillik_islem_adedi: 5000,
    yillik_sinir_otesi_islem_adedi: 500, uyum_birimi_kadrosu_fte: 4
  }));
  const k = Calc.compute(st).kunye;
  const r = id => k.ratios.find(x => x.id === id).value;
  check('yüksek riskli oranı', near(r('highRisk'), 0.1), r('highRisk'));
  check('PEP oranı', near(r('pep'), 0.01), r('pep'));
  check('sınır ötesi oranı', near(r('crossBorder'), 0.1), r('crossBorder'));
  check('FTE başına müşteri', near(r('load'), 250), r('load'));
  // tutarsızlık uyarıları
  const bad = withState(s => Object.assign(s.kunye, {
    toplam_musteri_sayisi: 100, yuksek_riskli_musteri_sayisi: 200,
    yillik_islem_adedi: 10, yillik_sinir_otesi_islem_adedi: 50,
    donem_baslangic: '2025-12-31', donem_bitis: '2025-01-01'
  }));
  const kb = Calc.compute(bad).kunye;
  check('yüksek riskli > toplam uyarısı', kb.warnings.length >= 3, kb.warnings);
  check('dönem ters uyarısı', kb.warnings.some(w => /Biti\u015f tarihi|End date/.test(w)), kb.warnings);
  // sıfır payda
  const z = withState(s => Object.assign(s.kunye, { toplam_musteri_sayisi: 0, pep_musteri_sayisi: 5 }));
  check('sıfır payda null', Calc.compute(z).kunye.ratios.find(x=>x.id==='pep').value === null);
}

process.exitCode = H.report('Mantık — kapsam, QA, SLA, PF, iş kolu, ek set, künye') ? 1 : 0;
