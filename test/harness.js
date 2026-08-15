/* Gerçek uygulama modüllerini Node'da yükleyen koşum. DOM yalnızca modüllerin
   yüklenebilmesi için taklit edilir; hesap katmanı DOM'a dokunmaz. */
const fs = require('fs'), vm = require('vm'), path = require('path');
const P = path.join(__dirname, '..', 'js') + path.sep;

function makeCtx() {
  const store = {};
  const el = () => ({
    style: { setProperty(){}, },
    classList: { add(){}, remove(){}, toggle(){} },
    setAttribute(){}, getAttribute(){ return null; }, addEventListener(){},
    removeEventListener(){}, appendChild(){}, remove(){}, replaceWith(){},
    querySelector(){ return null; }, querySelectorAll(){ return []; },
    focus(){}, dispatchEvent(){}, textContent: '', innerHTML: '', value: '',
    getBoundingClientRect(){ return { height: 64, top: 0, bottom: 64 }; },
    files: [], dataset: {}
  });
  const doc = {
    documentElement: el(), body: el(),
    addEventListener(){}, removeEventListener(){},
    createElement(){ return el(); }, querySelector(){ return null; },
    querySelectorAll(){ return []; }, getElementById(){ return null; },
    get activeElement(){ return null; }
  };
  const ctx = {
    console, document: doc,
    window: { addEventListener(){}, removeEventListener(){}, scrollTo(){}, scrollY: 0,
              matchMedia: () => ({ matches: false, addEventListener(){} }) },
    localStorage: {
      getItem: k => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: k => { delete store[k]; },
      clear: () => { for (const k of Object.keys(store)) delete store[k]; }
    },
    setTimeout, clearTimeout, requestAnimationFrame: fn => fn(),
    Intl, Date, Math, JSON, Number, String, Object, Array, Set, Map, URLSearchParams,
    CSS: { escape: s => s },
    history: { replaceState(){} },
    location: { hash: '' },
    Blob: class { constructor(p){ this.parts = p; this.size = String(p[0] || '').length; } },
    URL: { createObjectURL: () => 'blob:x', revokeObjectURL(){} },
    FileReader: class { readAsText(){} },
    CustomEvent: class { constructor(t){ this.type = t; } },
    HTMLAnchorElement: { prototype: { click(){} } },
    __raw: store
  };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  return ctx;
}

const FILES = ['data.js','data.en.js','questions.en.js','countries.js','portfolio.data.js',
  'operations.data.js','riskmodel.data.js','extra.data.js','refpack.data.js','i18n.js','store.js','calc.js',
  'ui.js','views.js','portfolio.js','operations.js','settings.js','extra.js','compare.js',
  'log.js','merge.js','actions.js','export.js','app.js'];

function load() {
  const ctx = makeCtx();
  const src = FILES.map(f => fs.readFileSync(P + f, 'utf8')).join('\n;\n')
    + '\n;({DATA,DATA_EN,EXTRA,GLOSSARY,REFPACK,RISKMODEL,PORTFOLIO,OPERATIONS,COUNTRIES,I18n,Store,Calc,UI,Icons,Views,Portfolio,Operations,Settings,CountryRisk,Extra,Compare,ChangeLog,Merge,Actions,Exporter,App})';
  const api = vm.runInContext(src, ctx, { filename: 'bundle.js' });
  api.I18n.apply('tr');
  api.Store.init();
  api.__ctx = ctx;
  return api;
}

/* ---- küçük test çatısı ---- */
const fails = [];
let count = 0;
function check(name, cond, detail) {
  count++;
  if (!cond) fails.push({ name, detail });
}
function near(a, b, eps = 1e-9) { return Math.abs(a - b) < eps; }
function report(title) {
  console.log(`\n=== ${title} — ${count} kontrol, ${fails.length} sorun ===`);
  fails.forEach(f => console.log('  ✗', f.name, f.detail !== undefined ? '→ ' + JSON.stringify(f.detail) : ''));
  if (!fails.length) console.log('  hepsi geçti');
  return fails.length;
}
module.exports = { load, check, near, report, get fails(){ return fails; } };
