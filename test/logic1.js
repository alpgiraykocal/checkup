const H = require('./harness.js');
const { check, near } = H;
const A = H.load();
const { DATA, Calc, Store, RISKMODEL } = A;

const blank = () => JSON.parse(JSON.stringify(Store.snapshot()));
const withState = mut => { const s = blank(); mut(s); return s; };

/* ---------- 1. Yanıt katsayıları ---------- */
{
  const q = DATA.questions[0];
  const cases = [['Evet',1],['Kısmen',0.5],['Hayır',0]];
  cases.forEach(([ans, coef]) => {
    const c = Calc.compute(withState(s => { s.answers[q.id] = { a: ans }; }));
    const st = c.perQuestion[q.id];
    check(`katsayı ${ans}`, st.coef === coef, st.coef);
    check(`kazanılan ${ans}`, near(st.earned, q.weight * coef), st.earned);
    check(`uygulanabilir ağırlık ${ans}`, st.applicableWeight === q.weight, st.applicableWeight);
  });
  const na = Calc.compute(withState(s => { s.answers[q.id] = { a: 'Uygulanamaz' }; }));
  const st = na.perQuestion[q.id];
  check('Uygulanamaz paydadan çıkar', st.applicableWeight === 0 && st.coef === null, st);
  check('Uygulanamaz yanıtlanmış sayılır', st.answered === true);
}

/* ---------- 2. QA tavanı ---------- */
{
  const q = DATA.questions.find(x => x.qa);
  const t = (a, qaResult) => Calc.compute(withState(s => { s.answers[q.id] = { a, qaResult }; })).perQuestion[q.id];
  let st = t('Evet', 'Çelişkili');
  check('Evet+Çelişkili → test katsayısı 0', st.coefTested === 0 && st.coef === 1, st);
  check('Evet+Çelişkili → çelişki bayrağı', st.qaConflict === true);
  st = t('Evet', 'Kısmen doğrulandı');
  check('Evet+Kısmen doğrulandı → 0,5 tavan', st.coefTested === 0.5, st.coefTested);
  st = t('Kısmen', 'Kısmen doğrulandı');
  check('Kısmen+Kısmen doğrulandı → düşürme yok', st.coefTested === 0.5 && st.qaAdjusted === false, st);
  st = t('Hayır', 'Çelişkili');
  check('Hayır+Çelişkili → çelişki bayrağı yok', st.qaConflict === false);
  st = t('Evet', 'Doğrulandı');
  check('Evet+Doğrulandı → tavan yok', st.coefTested === 1 && st.qaAdjusted === false);
  st = t('Evet', 'Test edilmedi');
  check('Evet+Test edilmedi → tavan yok', st.coefTested === 1, st.coefTested);
}

/* ---------- 3. Kritiklik ve aksiyon ---------- */
{
  const kritik = DATA.questions.find(q => q.critKey === 'Kritik');
  const orta = DATA.questions.find(q => q.critKey === 'Orta');
  let st = Calc.compute(withState(s => { s.answers[kritik.id] = { a: 'Kısmen' }; })).perQuestion[kritik.id];
  check('kritik + Kısmen → açık kritik', st.openCritical === true && st.actionNeeded === 'EVET - ÖNCELİKLİ', st);
  st = Calc.compute(withState(s => { s.answers[kritik.id] = { a: 'Evet' }; })).perQuestion[kritik.id];
  check('kritik + Evet → açık değil', st.openCritical === false && st.actionNeeded === 'Hayır');
  st = Calc.compute(withState(s => { s.answers[kritik.id] = { a: 'Uygulanamaz' }; })).perQuestion[kritik.id];
  check('kritik + Uygulanamaz → açık kritik değil', st.openCritical === false && st.actionNeeded === '', st);
  st = Calc.compute(withState(s => { s.answers[orta.id] = { a: 'Hayır' }; })).perQuestion[orta.id];
  check('orta + Hayır → normal aksiyon', st.actionNeeded === 'Evet' && st.openCritical === false, st);
}

/* ---------- 4. Domain etkinliği = Σkazanılan / Σuygulanabilir ---------- */
{
  const st = withState(s => { DATA.questions.forEach((q,i) => { s.answers[q.id] = { a: ['Evet','Kısmen','Hayır','Uygulanamaz'][i%4] }; }); });
  const c = Calc.compute(st);
  DATA.domains.forEach(d => {
    const qs = DATA.questions.filter(q => q.domain === d.code);
    let w = 0, e = 0;
    qs.forEach(q => { const s2 = c.perQuestion[q.id]; w += s2.applicableWeight; e += s2.earned; });
    const dom = c.domains.find(x => x.code === d.code);
    check(`${d.code} etkinlik formülü`, near(dom.effectiveness, e / w), { a: dom.effectiveness, b: e / w });
  });
  const totW = c.domains.reduce((a,d)=>a+d.applicableWeight,0);
  const totE = c.domains.reduce((a,d)=>a+d.earned,0);
  check('toplam etkinlik', near(c.totals.effectiveness, totE/totW));
  check('Uygulanamaz sayımı', c.totals.na === DATA.questions.filter((q,i)=>i%4===3).length, c.totals.na);
}

/* ---------- 5. Doğuştan risk: ağırlıklı ortalama ---------- */
{
  const st = withState(s => { DATA.inherentFactors.forEach((f,i) => { s.inherent[f.key] = (i%5)+1; }); });
  const c = Calc.compute(st);
  Calc.DIMS.forEach(dim => {
    const fs = DATA.inherentFactors.filter(f => f.dimKey === dim);
    let num = 0, den = 0;
    fs.forEach(f => { const sc = st.inherent[f.key]; num += sc * f.weight; den += f.weight; });
    check(`${dim} boyut skoru`, near(c.inherent.dims[dim].value, num/den), { a: c.inherent.dims[dim].value, b: num/den });
  });
  const mean = Calc.DIMS.reduce((a,d)=>a+c.inherent.dims[d].value,0)/Calc.DIMS.length;
  check('GENEL = boyut ortalaması', near(c.inherent.general, mean), { a: c.inherent.general, b: mean });
}

/* ---------- 6. Ağırlık geçersiz kılma ---------- */
{
  const f = DATA.inherentFactors[0];
  const st = withState(s => { s.inherent[f.key] = 5; s.inherentWeights[f.key] = 10; });
  const c = Calc.compute(st);
  const fs = c.inherent.factors.find(x => x.st.key === f.key);
  check('ağırlık geçersiz kılma uygulanır', fs.st.weight === 10 && fs.st.weighted === 50, fs.st);
  check('geçersiz kılma işareti', fs.st.weightOverridden === true);
  const st2 = withState(s => { s.inherent[f.key] = 5; s.inherentWeights[f.key] = -3; });
  const fs2 = Calc.compute(st2).inherent.factors.find(x => x.st.key === f.key);
  check('negatif ağırlık yok sayılır', fs2.st.weight === f.weight, fs2.st.weight);
  const st3 = withState(s => { s.inherent[f.key] = 5; s.inherentWeights[f.key] = 0; });
  const fs3 = Calc.compute(st3).inherent.factors.find(x => x.st.key === f.key);
  check('sıfır ağırlık yok sayılır', fs3.st.weight === f.weight, fs3.st.weight);
}

/* ---------- 7. Uygulanamaz faktör ---------- */
{
  const f = DATA.inherentFactors[0];
  const st = withState(s => { DATA.inherentFactors.forEach(x => s.inherent[x.key] = 3); s.inherentNA[f.key] = true; });
  const c = Calc.compute(st);
  const dim = c.inherent.dims[f.dimKey];
  check('NA faktör paydada yok', dim.na === 1 && dim.scored === dim.applicable, { na: dim.na, scored: dim.scored, app: dim.applicable });
  check('NA faktör skoru etkilemez', near(dim.value, 3), dim.value);
}

/* ---------- 8. Artık risk formülü ve tavan ---------- */
{
  const st = withState(s => {
    DATA.inherentFactors.forEach(f => s.inherent[f.key] = 4);
    DATA.questions.forEach(q => s.answers[q.id] = { a: 'Evet' });
  });
  const c = Calc.compute(st);
  c.residual.forEach(r => {
    const applied = Math.min(r.effectivenessTested, 0.95);
    check(`${r.code} artık risk formülü`, near(r.residual, r.inherentRisk * (1 - applied)), { r: r.residual });
    check(`${r.code} tavan uygulandı`, near(r.effectiveApplied, 0.95), r.effectiveApplied);
    check(`${r.code} sıfır değil`, r.residual > 0, r.residual);
  });
  check('genel artık risk tavanlı', near(c.generalResidual, c.inherent.general * 0.05), c.generalResidual);
}

/* ---------- 9. İştah ve aşım ---------- */
{
  const st = withState(s => {
    DATA.inherentFactors.forEach(f => s.inherent[f.key] = 5);
    DATA.questions.forEach(q => s.answers[q.id] = { a: 'Hayır' });
    s.appetite = { D1: 3 };
  });
  const c = Calc.compute(st);
  const d1 = c.residual.find(r => r.code === 'D1');
  check('iştah geçersiz kılma', d1.appetite === 3 && d1.appetiteOverridden === true, d1.appetite);
  c.residual.forEach(r => check(`${r.code} aşım tutarlı`, r.breach === (r.residual > r.appetite), { res: r.residual, app: r.appetite, br: r.breach }));
  check('aşım sayısı', c.breaches === c.residual.filter(r=>r.breach).length + (c.pfLine.breach?1:0), c.breaches);
}

/* ---------- 10. Ölçülmemiş durumlar null döner ---------- */
{
  const c = Calc.compute(blank());
  check('boş: etkinlik null', c.totals.effectiveness === null, c.totals.effectiveness);
  check('boş: genel artık null', c.generalResidual === null, c.generalResidual);
  check('boş: doğuştan ölçülmedi', c.inherent.measured === false);
  c.residual.forEach(r => check(`${r.code} boşta null`, r.residual === null && r.breach === null));
  check('boş: aşım 0', c.breaches === 0);
  check('boş: en kötü domain yok', c.worstDomain === null);
}

/* ---------- 11. Doğuştan ölçülmeden artık risk hesaplanmaz ---------- */
{
  const st = withState(s => { DATA.questions.forEach(q => s.answers[q.id] = { a: 'Evet' }); });
  const c = Calc.compute(st);
  check('doğuştan yokken artık risk null', c.residual.every(r => r.residual === null), c.residual.map(r=>r.residual));
  check('doğuştan yokken genel artık null', c.generalResidual === null);
}

process.exitCode = H.report('Mantık — skorlama zinciri') ? 1 : 0;
