const H = require('./harness.js');
const { check, near } = H;
const A = H.load();
const { DATA, DATA_EN, Calc, Store, PORTFOLIO, OPERATIONS, Portfolio, Operations, Compare, CountryRisk, I18n, EXTRA } = A;
const blank = () => JSON.parse(JSON.stringify(Store.snapshot()));
const withState = m => { const s = blank(); m(s); return s; };

/* ---------- 20. Operasyon türetilen oranlar ---------- */
{
  const st = withState(s => { s.operations = { islem_toplam: { adet: 1000 }, islem_izlenen: { adet: 800 } }; });
  const o = Operations.compute(st);
  const cov = o.byKey['monitoring_coverage'];
  check('izleme kapsama oranı', near(cov.value, 0.8), cov.value);
  // payda sıfırsa null
  const z = Operations.compute(withState(s => { s.operations = { islem_toplam: { adet: 0 }, islem_izlenen: { adet: 5 } }; }));
  check('sıfır payda → null', z.byKey['monitoring_coverage'].value === null, z.byKey['monitoring_coverage'].value);
  // veri yoksa null, 0 değil
  const e = Operations.compute(blank());
  check('veri yok → null', e.derived.every(d => d.value === null));
  check('veri yok → uyarı yok', e.warnings.length === 0, e.warnings);
  // tutarsızlık uyarısı
  const w = Operations.compute(withState(s => { s.operations = { islem_toplam: { adet: 100 }, islem_izlenen: { adet: 500 } }; }));
  check('izlenen > toplam uyarısı', w.warnings.length === 1, w.warnings);
  // doldurulan sayımı
  const f = Operations.compute(withState(s => { s.operations = { islem_toplam: { adet: 5 } }; }));
  check('doldurulan ölçüt sayımı', f.filled === 1, f.filled);
  check('toplam ölçüt', f.total === OPERATIONS.groups.reduce((a,g)=>a+g.metrics.length,0), f.total);
}

/* ---------- 21. Portföy hesapları ---------- */
{
  const ct = PORTFOLIO.customerTypes, rb = PORTFOLIO.riskBands;
  const st = withState(s => {
    s.portfolio.matrix[ct[0].key] = Object.fromEntries(rb.map(b => [b.key, 100]));
    s.kunye.toplam_musteri_sayisi = 400;
  });
  const p = Portfolio.compute(st);
  check('matris toplamı', p.total === 100 * rb.length, p.total);
  const yuksek = rb.filter(b => b.key === 'Yüksek' || b.key === 'Çok Yüksek').length * 100;
  check('yüksek riskli sayımı', p.highRisk === yuksek, p.highRisk);
  check('yüksek riskli payı', near(p.highRiskShare, yuksek / p.total), p.highRiskShare);
  check('künye ile tutarlı → uyarı yok', p.warnings.length === 0, p.warnings);
  // künye ile tutarsızlık
  const p2 = Portfolio.compute(withState(s => {
    s.portfolio.matrix[ct[0].key] = Object.fromEntries(rb.map(b => [b.key, 100]));
    s.kunye.toplam_musteri_sayisi = 10;
  }));
  check('toplam uyuşmazlık uyarısı', p2.warnings.length >= 1, p2.warnings);
  // ülke maruziyeti ve yurt içi ayrımı
  const p3 = Portfolio.compute(withState(s => {
    s.portfolio.countries = [
      { code: 'DE', relations: ['yurt_ici'], customers: 10, txIn: 100, txOut: 100 },
      { code: 'IR', relations: ['muhabir'], customers: 5, txIn: 50, txOut: 50 }
    ];
  }));
  check('ülke işlem toplamı', p3.countries.tx === 300, p3.countries.tx);
  check('yurt içi sınır ötesine girmez', p3.countries.crossTx === 100, p3.countries.crossTx);
  check('IR işaretli', p3.countries.rows[1].flags.length > 0, p3.countries.rows[1].flags);
  check('yaptırım payı', near(p3.countries.shares.sanctionedTx, 100/300), p3.countries.shares.sanctionedTx);
  // negatif değer sıfıra çekilir
  const p4 = Portfolio.compute(withState(s => { s.portfolio.countries = [{ code:'DE', customers: -5, txIn: -10, txOut: 3 }]; }));
  check('negatif girdi sıfırlanır', p4.countries.customers === 0 && p4.countries.tx === 3, { c: p4.countries.customers, t: p4.countries.tx });
  // şube denetim yaşı
  const p5 = Portfolio.compute(withState(s => { s.portfolio.branches = [
    { name:'A', customers: 100, complianceFte: 2, lastAudit: '2020-01-01' },
    { name:'B', customers: 50 } ]; }));
  check('eski denetim gecikmiş', p5.branches.rows[0].auditOverdue === true);
  check('denetimsiz şube gecikmiş', p5.branches.rows[1].auditOverdue === true && p5.branches.rows[1].auditMonths === null);
  check('FTE yükü', near(p5.branches.rows[0].load, 50), p5.branches.rows[0].load);
  check('FTE yoksa yük null', p5.branches.rows[1].load === null);
}

/* ---------- 22. Ülke risk geçersiz kılma ---------- */
{
  const ir = CountryRisk.byCode['IR'];
  check('IR varsayılan işaretli', ir.flags.length > 0);
  const st = withState(s => { s.countryRisk = { IR: [] }; });
  check('boş listeye çekilebilir', CountryRisk.flags('IR', st).length === 0, CountryRisk.flags('IR', st));
  check('geçersiz kılma işareti', CountryRisk.isOverridden('IR', st) === true);
  check('dokunulmayan ülke varsayılan', CountryRisk.isOverridden('DE', st) === false);
  check('bilinmeyen kod boş', CountryRisk.flags('ZZ', st).length === 0);
  check('bilinmeyen kod adı kendisi', CountryRisk.name('ZZ') === 'ZZ');
}

/* ---------- 23. Karşılaştırma ---------- */
{
  const eski = withState(s => {
    DATA.questions.forEach(q => s.answers[q.id] = { a: 'Hayır' });
    DATA.inherentFactors.forEach(f => s.inherent[f.key] = 3);
    s.actions = [ { id:'B1', status:'Açık', crit:'Kritik', finding:'x' }, { id:'B2', status:'Açık', crit:'Orta', finding:'y' } ];
  });
  const ozet = Compare.summarize(eski);
  check('özet domain sayısı', ozet.domains.length === DATA.domains.length);
  check('özet boyutu küçük', JSON.stringify(ozet).length < 8000, JSON.stringify(ozet).length);
  check('özet yanıt taşımaz', !JSON.stringify(ozet).includes('"answers"'));
  check('özet bulgu kimlikleri', ozet.actions.ids.length === 2);
  const yeni = withState(s => {
    DATA.questions.forEach(q => s.answers[q.id] = { a: 'Evet' });
    DATA.inherentFactors.forEach(f => s.inherent[f.key] = 3);
    s.actions = [ { id:'B1', status:'Kapalı', crit:'Kritik', finding:'x' }, { id:'B2', status:'Açık', crit:'Orta', finding:'y' }, { id:'B3', status:'Açık', crit:'Düşük', finding:'z' } ];
  });
  const o2 = Compare.summarize(yeni);
  check('etkinlik yükseldi', o2.totals.effectivenessTested > ozet.totals.effectivenessTested);
  check('artık risk düştü', o2.generalResidual < ozet.generalResidual);
  const wasOpen = new Set(ozet.actions.ids.filter(a=>a.status!=='Kapalı').map(a=>a.id));
  const nowById = Object.fromEntries(o2.actions.ids.map(a=>[a.id,a]));
  check('kapanan bulgu', [...wasOpen].filter(id=>nowById[id]&&nowById[id].status==='Kapalı').length === 1);
  check('hâlâ açık', [...wasOpen].filter(id=>nowById[id]&&nowById[id].status!=='Kapalı').length === 1);
  check('yeni bulgu', o2.actions.ids.filter(a=>!ozet.actions.ids.some(b=>b.id===a.id)).length === 1);
}

/* ---------- 24. Depolama: göç, yedek durumu, anlık görüntü ---------- */
{
  // KPI göçü
  const enAd = DATA_EN.kpis[DATA.kpis[0].key].name;
  const dosya = withState(s => { s.kpis = { [enAd]: { target: '9', value: '4' } }; s.answers['D1-01'] = { a: 'Evet' }; });
  Store.replace(dosya);
  check('EN adlı KPI taşındı', Store.state.kpis[DATA.kpis[0].key] !== undefined, Object.keys(Store.state.kpis));
  check('taşınan değer korundu', Store.state.kpis[DATA.kpis[0].key].target === '9');
  check('eski anahtar silindi', Store.state.kpis[enAd] === undefined);
  // TR anahtarı varsa üzerine yazılmaz
  const ikili = withState(s => { s.kpis = { [enAd]: { target: '9' }, [DATA.kpis[0].key]: { target: '1' } }; });
  Store.replace(ikili);
  check('mevcut TR kaydı korunur', Store.state.kpis[DATA.kpis[0].key].target === '1', Store.state.kpis[DATA.kpis[0].key]);
  // yedek durumu
  Store.replace(withState(s => { DATA.questions.slice(0,30).forEach(q => s.answers[q.id] = { a: 'Evet' }); }));
  let bk = Store.backupStatus();
  check('yedek yok → gerekli', bk.due === true && bk.at === null, bk);
  check('iş büyüklüğü', bk.size === 30, bk.size);
  Store.markExported();
  bk = Store.backupStatus();
  check('yedek sonrası gerekli değil', bk.due === false && bk.since === 0, bk);
  Store.update(s => { DATA.questions.slice(30,60).forEach(q => s.answers[q.id] = { a: 'Evet' }); });
  bk = Store.backupStatus();
  check('30 yeni kayıt → gerekli', bk.due === true && bk.since === 30, bk);
  // boş çalışmada hatırlatma yok
  Store.reset();
  check('boş çalışmada yedek uyarısı yok', Store.backupStatus().due === false, Store.backupStatus());
  // anlık görüntü kopyası bağımsız
  Store.replace(withState(s => { s.answers['D1-01'] = { a: 'Evet' }; }));
  const snap = Store.snapshot();
  Store.update(s => { s.answers['D1-01'].a = 'Hayır'; });
  check('anlık görüntü derin kopya', snap.answers['D1-01'].a === 'Evet', snap.answers['D1-01']);
}

/* ---------- 25. Dil değişimi hesapları bozmaz ---------- */
{
  const st = withState(s => {
    DATA.questions.forEach((q,i) => s.answers[q.id] = { a: ['Evet','Kısmen','Hayır'][i%3] });
    DATA.inherentFactors.forEach((f,i) => s.inherent[f.key] = (i%5)+1);
    DATA.qaPopulations.forEach((p,i) => s.qaVolumes[p.key] = (i+1)*100);
    EXTRA.sets.forEach(x => x.questions.forEach(q => s.answers[q.id] = { a: 'Evet' }));
  });
  I18n.apply('tr');
  const tr = Calc.compute(st);
  I18n.apply('en');
  const en = Calc.compute(st);
  I18n.apply('tr');
  const say = c => ({ eff: c.totals.effectivenessTested, inh: c.inherent.general, res: c.generalResidual,
    qa: c.qaTotals.yearlySample, ek: c.extra.totals.effectivenessTested, breaches: c.breaches });
  check('dil değişimi skorları bozmaz', JSON.stringify(say(tr)) === JSON.stringify(say(en)), { tr: say(tr), en: say(en) });
}

process.exitCode = H.report('Mantık — operasyon, portföy, ülke, karşılaştırma, depolama, dil') ? 1 : 0;
