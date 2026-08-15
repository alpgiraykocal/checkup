#!/usr/bin/env node
/* Tüm test paketlerini sırayla koşar. Bağımlılık yok: node test/run.js
   Herhangi bir paket düşerse çıkış kodu 1 olur (CI ve pre-commit için). */

const { execFileSync } = require('child_process');
const path = require('path');

const PAKETLER = [
  ['logic1.js', 'Mantık — skorlama zinciri'],
  ['logic2.js', 'Mantık — kapsam, QA, SLA, PF, iş kolu, ek set, künye'],
  ['logic3.js', 'Mantık — operasyon, portföy, ülke, karşılaştırma, depolama, dil'],
  ['golden.js', 'Altın örnek — regresyon çıpası'],
  ['contract.js', 'Veri sözleşmesi'],
  ['i18n.js', 'Dil katmanı örtüsü'],
  ['lint.js', 'Dil sızıntısı denetimi'],
  ['merge.js', 'Birleştirme ve atama'],
  ['fuzz.js', 'Dayanıklılık — bozuk ve düşmanca veri'],
  ['tz.js', 'Saat dilimi matrisi']
];

let dusen = 0;
const baslangic = Date.now();

for (const [dosya, ad] of PAKETLER) {
  const tam = path.join(__dirname, dosya);
  try {
    const cikti = execFileSync('node', [tam], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    process.stdout.write(cikti);
  } catch (e) {
    dusen += 1;
    process.stdout.write((e.stdout || '') + (e.stderr || ''));
    console.log(`\n  ✗ PAKET DÜŞTÜ: ${ad} (${dosya})`);
  }
}

const sure = ((Date.now() - baslangic) / 1000).toFixed(1);
console.log(`\n${'='.repeat(60)}`);
console.log(dusen === 0
  ? `TÜM PAKETLER GEÇTİ — ${PAKETLER.length} paket, ${sure}s`
  : `${dusen}/${PAKETLER.length} PAKET DÜŞTÜ — ${sure}s`);
process.exit(dusen === 0 ? 0 : 1);
