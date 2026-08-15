/* Birleştirme: alan bazında seçim, çakışma tespiti, sessiz üzerine yazma olmaması. */
const H = require('./harness.js');
const { check } = H;
const A = H.load();
const { DATA, Store, Calc, EXTRA } = A;
const blank = () => JSON.parse(JSON.stringify(Store.snapshot()));

/* Merge modülü DOM'a bağlı; birleştirme mantığını doğrudan sınamak için
   aynı kuralı burada da uygularız: "gelen" seçilen parçada yalnızca gelen
   dosyada DOLU olan alanlar aktarılır, boşlar bendekini korur. */

const dolu = v => v !== undefined && v !== null && v !== '' &&
  !(typeof v === 'object' && Object.keys(v).length === 0);

function birlestir(mine, theirs, idler) {
  const out = JSON.parse(JSON.stringify(mine));
  idler.forEach(id => { if (dolu(theirs.answers[id])) out.answers[id] = theirs.answers[id]; });
  return out;
}

/* ---------- 1. Boş alan üzerine yazmaz ---------- */
{
  const d5 = DATA.questions.filter(q => q.domain === 'D5').map(q => q.id);
  const mine = blank(); const theirs = blank();
  mine.answers[d5[0]] = { a: 'Evet', evidence: 'Benim kanıtım' };
  // theirs bu soruyu hiç yanıtlamamış
  theirs.answers[d5[1]] = { a: 'Hayır' };
  const sonuc = birlestir(mine, theirs, d5);
  check('gelen boşsa bendeki korunur', sonuc.answers[d5[0]].evidence === 'Benim kanıtım', sonuc.answers[d5[0]]);
  check('gelende dolu olan aktarılır', sonuc.answers[d5[1]].a === 'Hayır');
}

/* ---------- 2. Çakışma sayımı ---------- */
{
  const d6 = DATA.questions.filter(q => q.domain === 'D6').map(q => q.id);
  const mine = blank(); const theirs = blank();
  d6.slice(0, 5).forEach(id => { mine.answers[id] = { a: 'Evet' }; });
  d6.slice(0, 3).forEach(id => { theirs.answers[id] = { a: 'Hayır' }; });   // 3 çakışma
  d6.slice(5, 8).forEach(id => { theirs.answers[id] = { a: 'Evet' }; });    // 3 yeni
  let cakisan = 0, gelenDolu = 0;
  d6.forEach(id => {
    const x = mine.answers[id], y = theirs.answers[id];
    if (dolu(y)) gelenDolu += 1;
    if (dolu(x) && dolu(y) && JSON.stringify(x) !== JSON.stringify(y)) cakisan += 1;
  });
  check('çakışma sayısı', cakisan === 3, cakisan);
  check('gelen dolu sayısı', gelenDolu === 6, gelenDolu);
}

/* ---------- 3. Domain yalıtımı: seçilmeyen domain hiç değişmez ---------- */
{
  const d1 = DATA.questions.filter(q => q.domain === 'D1').map(q => q.id);
  const d2 = DATA.questions.filter(q => q.domain === 'D2').map(q => q.id);
  const mine = blank(); const theirs = blank();
  d1.forEach(id => { mine.answers[id] = { a: 'Evet' }; });
  d1.forEach(id => { theirs.answers[id] = { a: 'Hayır' }; });
  d2.forEach(id => { theirs.answers[id] = { a: 'Kısmen' }; });
  // yalnızca D2 alınıyor
  const sonuc = birlestir(mine, theirs, d2);
  check('seçilmeyen domain değişmedi', d1.every(id => sonuc.answers[id].a === 'Evet'));
  check('seçilen domain alındı', d2.every(id => sonuc.answers[id].a === 'Kısmen'));
}

/* ---------- 4. Birleştirme sonrası hesap tutarlı ---------- */
{
  const mine = blank(); const theirs = blank();
  DATA.questions.forEach((q, i) => { if (i % 2 === 0) mine.answers[q.id] = { a: 'Evet' }; });
  DATA.questions.forEach((q, i) => { if (i % 2 === 1) theirs.answers[q.id] = { a: 'Kısmen' }; });
  const hepsi = DATA.questions.map(q => q.id);
  const sonuc = Store.normalize(birlestir(mine, theirs, hepsi));
  const c = Calc.compute(sonuc);
  check('birleştirme sonrası tüm sorular yanıtlı', c.totals.answered === DATA.questions.length, c.totals.answered);
  check('birleştirme sonrası etkinlik hesaplanır', c.totals.effectiveness !== null && !Number.isNaN(c.totals.effectiveness));
}

/* ---------- 5. Bulgular kimlik üzerinden birleşir ---------- */
{
  const mine = blank(); const theirs = blank();
  mine.actions = [{ id: 'BLG-001', finding: 'Benim', status: 'Açık' }];
  theirs.actions = [{ id: 'BLG-001', finding: 'Gelen', status: 'Kapalı' },
                    { id: 'BLG-002', finding: 'Yeni', status: 'Açık' }];
  const byId = Object.fromEntries(mine.actions.map(x => [x.id, x]));
  theirs.actions.forEach(y => { if (byId[y.id]) Object.assign(byId[y.id], y); else mine.actions.push(y); });
  check('mevcut bulgu güncellendi', mine.actions[0].finding === 'Gelen' && mine.actions[0].status === 'Kapalı');
  check('yeni bulgu eklendi', mine.actions.length === 2 && mine.actions[1].id === 'BLG-002');
  check('kimlik mükerrer değil', new Set(mine.actions.map(a => a.id)).size === mine.actions.length);
}

/* ---------- 6. Atama durumu ---------- */
{
  const s = Store.normalize(Object.assign(blank(), { assign: { D1: 'Ayşe', D6: 'Mehmet' } }));
  check('atama saklandı', s.assign.D1 === 'Ayşe' && s.assign.D6 === 'Mehmet');
  const bozuk = Store.normalize(Object.assign(blank(), { assign: 'metin' }));
  check('bozuk atama düzeltildi', typeof bozuk.assign === 'object' && !Array.isArray(bozuk.assign));
}

process.exitCode = H.report('Birleştirme ve atama') ? 1 : 0;
