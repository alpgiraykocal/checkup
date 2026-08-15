/* Aynı SLA hesabını farklı saat dilimlerinde koşar: gün kayması olmamalı. */
const { execFileSync } = require('child_process');
const zones = ['UTC','Europe/Istanbul','Europe/Stockholm','America/New_York','America/Los_Angeles','Pacific/Kiritimati','Pacific/Pago_Pago','Asia/Tokyo','Australia/Sydney'];
const script = `
const H=require(${JSON.stringify(require('path').join(__dirname,'harness.js'))});
const A=H.load(); const C=A.Calc;
console.log(JSON.stringify({
  tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
  kritik: C.slaDueDate('Kritik','2026-08-14'),
  yuksek: C.slaDueDate('Yüksek','2026-01-01'),
  orta:   C.slaDueDate('Orta','2026-01-01'),
  dusuk:  C.slaDueDate('Düşük','2026-01-01'),
  dstIleri: C.slaDueDate('Orta','2026-02-15'),
  ay: C.monthsSince('2026-01-15'),
  ay2: C.monthsSince('2025-08-15')
}));`;
const out = zones.map(tz => JSON.parse(execFileSync('node', ['-e', script], { env: { ...process.env, TZ: tz } }).toString()));
const ref = out[0];
let sorun = 0;
out.forEach(o => {
  ['kritik','yuksek','orta','dusuk','dstIleri','ay','ay2'].forEach(k => {
    if (o[k] !== ref[k]) { console.log('  ✗ FARK', o.tz, k, o[k], '≠', ref[k]); sorun++; }
  });
});
console.log(JSON.stringify(ref, null, 1));
console.log(sorun ? `\n${sorun} saat dilimi farkı` : `\n${zones.length} saat diliminde sonuçlar aynı`);
