/* Bozuk, eksik ve düşmanca veriyle tüm hesap yollarını dener. */
const H = require('./harness.js');
const { check } = H;
const A = H.load();
const { DATA, Calc, Store, Portfolio, Operations, Compare, EXTRA } = A;

const hepsi = st => {
  const c = Calc.compute(st);
  Portfolio.compute(st); Operations.compute(st); Compare.summarize(st);
  return c;
};
const dene = (ad, raw) => {
  try { const st = Store.normalize(raw); const c = hepsi(st);
    const j = JSON.stringify(c);
    check(ad + ' — çalıştı', true);
    check(ad + ' — NaN yok', !/:NaN/.test(j.replace(/"/g,'')) && !j.includes('null,NaN'), '');
    // sayısal alanlarda NaN taraması
    const nan = [];
    (function tara(o, yol) {
      if (typeof o === 'number' && Number.isNaN(o)) nan.push(yol);
      else if (o && typeof o === 'object') for (const k of Object.keys(o)) { if (k==='spec'||k==='f') continue; tara(o[k], yol+'.'+k); }
    })(c, '');
    check(ad + ' — NaN alan yok', nan.length === 0, nan.slice(0,5));
  } catch (e) { check(ad + ' — çalıştı', false, e.message); }
};

const b = () => JSON.parse(JSON.stringify(Store.snapshot()));

dene('tamamen boş', b());
dene('null alanlar', Object.assign(b(), { answers:null, inherent:null, actions:null, kpis:null, qaVolumes:null,
  portfolio:null, operations:null, pf:null, lines:null, appetite:null, countryRisk:null, kunye:null }));
dene('yanlış tipler', Object.assign(b(), { answers:'metin', inherent:42, actions:{}, qaVolumes:[], kunye:[] }));
dene('bilinmeyen anahtarlar', Object.assign(b(), { answers:{ 'YOK-99':{a:'Evet'} }, inherent:{ 'yok|faktör':3 },
  qaVolumes:{ 'yok':100 }, appetite:{ 'D99': 2 }, kpis:{ 'yok':{target:'1'} } }));
dene('geçersiz yanıt değerleri', (()=>{ const s=b(); DATA.questions.slice(0,20).forEach((q,i)=>
  s.answers[q.id]={a:[null,undefined,'','Belki',123,{},[]][i%7]}); return s; })());
dene('geçersiz skorlar', (()=>{ const s=b(); DATA.inherentFactors.forEach((f,i)=>
  s.inherent[f.key]=[0,-1,99,'abc',null,NaN,Infinity,1.5][i%8]); return s; })());
dene('geçersiz hacimler', (()=>{ const s=b(); DATA.qaPopulations.forEach((p,i)=>
  s.qaVolumes[p.key]=[-1,0,'abc',null,Infinity,1e15,0.5][i%7]); return s; })());
dene('bozuk aksiyonlar', Object.assign(b(), { actions:[ null, {}, {id:null}, {id:'X',due:'abc'},
  {id:'Y',due:'2026-13-45'}, {id:'Z',status:123}, 'metin' ] }));
dene('bozuk portföy', (()=>{ const s=b(); s.portfolio={ matrix:{bilinmeyen:{x:'a'}}, segments:null,
  countries:[null,{},{code:'ZZ',customers:'abc'},{code:null}], branches:[null,{},{type:'yok'}] }; return s; })());
dene('bozuk operasyon', Object.assign(b(), { operations:{ islem_toplam:{adet:'abc'}, yok:{x:1}, bos:null } }));
dene('bozuk iş kolu', (()=>{ const s=b(); s.lines={ bireysel:{active:'evet',share:'abc',dims:null}, yok:{active:true} }; return s; })());
dene('bozuk PF', Object.assign(b(), { pf:{ 'yok':{score:'x'}, [A.RISKMODEL?.pf?.factors?.[0]?.key||'k']:{score:null} } }));
dene('aşırı büyük sayılar', (()=>{ const s=b(); s.kunye.toplam_musteri_sayisi=1e18; s.kunye.yillik_islem_adedi=1e18;
  s.kunye.uyum_birimi_kadrosu_fte=1e-9; return s; })());
dene('geçersiz tarihler', (()=>{ const s=b(); s.kunye.donem_baslangic='abc'; s.kunye.donem_bitis='2026-99-99';
  s.kunye.son_ic_denetim_tarihi=''; return s; })());
dene('çok uzun metin', (()=>{ const s=b(); s.answers['D1-01']={a:'Evet',evidence:'x'.repeat(200000),note:'y'.repeat(200000)}; return s; })());
dene('HTML enjeksiyon denemesi', (()=>{ const s=b(); s.kunye.kurum_unvani='<img src=x onerror=alert(1)>';
  s.answers['D1-01']={a:'Evet',evidence:'</td><script>alert(1)</script>'};
  s.actions=[{id:'<b>X</b>',finding:'<script>bad()</script>',status:'Açık'}]; return s; })());
dene('ek kontroller bozuk', (()=>{ const s=b(); EXTRA.sets.forEach(x=>x.questions.forEach((q,i)=>
  s.answers[q.id]={a:[null,'Evet',5,'Yok'][i%4]})); s.kunye.yukumlu_tipi=12345; return s; })());
dene('döngüsel olmayan derin iç içe', (()=>{ const s=b(); s.portfolio.countries=Array.from({length:500},(_,i)=>({code:'DE',customers:i})); return s; })());

process.exitCode = H.report('Dayanıklılık — bozuk ve düşmanca veri') ? 1 : 0;
