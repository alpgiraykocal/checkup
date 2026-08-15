/* Çok kullanıcılı çalışma: sorumlu ataması ve çalışma dosyası birleştirme.

   Gerçek bir check-up'ta uyum görevlisi anketi yanıtlar, QA testçisi test
   sonuçlarını girer, iş birimleri kendi domainlerini doldurur. Uygulama tek
   tarayıcıda çalıştığı için bugüne kadar tek yol dosyayı sırayla dolaştırmaktı;
   paralel çalışıldığında biri diğerinin işini eziyordu.

   Birleştirme alan bazında yapılır: her domain, her bölüm ve her veri kümesi
   ayrı ayrı "benimki" ya da "gelen" olarak seçilir. Çakışan alanlar tek tek
   gösterilir; sessiz üzerine yazma yoktur. */

const Merge = (() => {
  const { esc, fmtInt, statTile, emptyState } = UI;
  const t = (k, p) => I18n.t(k, p);

  /* Bekleyen birleştirme: dosya okunur, karşılaştırılır, kullanıcı seçim
     yapana kadar durumda değil bellekte tutulur. */
  let gelen = null;      // { name, state, diff }
  const secim = {};      // parça anahtarı -> 'mine' | 'theirs'

  /* ---------- Karşılaştırma ---------- */

  /** Birleştirme birimleri: her biri bağımsız seçilebilir. */
  function parcalar(mine, theirs) {
    const out = [];

    // Domain bazında anket yanıtları
    DATA.domains.forEach(d => {
      const ids = DATA.questions.filter(q => q.domain === d.code).map(q => q.id);
      out.push(karsilastirAnahtarlar('answers:' + d.code, `${d.code} · ${d.name}`, 'survey',
        ids, mine.answers, theirs.answers));
    });

    // Ek kontroller — set bazında
    if (typeof EXTRA !== 'undefined') {
      EXTRA.sets.forEach(s => {
        const ids = s.questions.map(q => q.id);
        out.push(karsilastirAnahtarlar('answers:extra:' + s.key,
          I18n.isEn ? s.en : s.tr, 'extra', ids, mine.answers, theirs.answers));
      });
    }

    // Doğuştan risk — boyut bazında
    Calc.DIMS.forEach(dim => {
      const keys = DATA.inherentFactors.filter(f => f.dimKey === dim).map(f => f.key);
      out.push(karsilastirCoklu('inherent:' + dim, I18n.dim(dim), 'inherent', keys,
        [mine.inherent, mine.inherentNA, mine.inherentNotes, mine.inherentWeights],
        [theirs.inherent, theirs.inherentNA, theirs.inherentNotes, theirs.inherentWeights]));
    });

    // Tek parça hâlindeki bölümler
    out.push(karsilastirNesne('kunye', t('navKunye'), 'other', mine.kunye, theirs.kunye));
    out.push(karsilastirNesne('qaVolumes', t('navQa'), 'other', mine.qaVolumes, theirs.qaVolumes));
    out.push(karsilastirNesne('operations', t('navOperations'), 'other', mine.operations, theirs.operations));
    out.push(karsilastirNesne('kpis', t('kpiSectionTitle'), 'other', mine.kpis, theirs.kpis));
    out.push(karsilastirNesne('pf', 'PF', 'other', mine.pf, theirs.pf));
    out.push(karsilastirNesne('lines', t('blTitle'), 'other', mine.lines, theirs.lines));
    out.push(karsilastirNesne('appetite', t('colAppetiteLimit'), 'other', mine.appetite, theirs.appetite));
    out.push(karsilastirNesne('countryRisk', t('ttlSettings'), 'other', mine.countryRisk, theirs.countryRisk));
    out.push(karsilastirPortfoy(mine, theirs));
    out.push(karsilastirAksiyon(mine, theirs));

    return out.filter(p => p.theirs > 0 || p.conflicts > 0);
  }

  const dolu = v => v !== undefined && v !== null && v !== '' &&
    !(typeof v === 'object' && Object.keys(v).length === 0);

  /** Belirli anahtar kümesi için iki kaynağı karşılaştırır. */
  function karsilastirAnahtarlar(key, label, kind, ids, a, b) {
    let mineN = 0, theirsN = 0, conflicts = 0;
    const ornekler = [];
    ids.forEach(id => {
      const x = a[id], y = b[id];
      const xd = dolu(x), yd = dolu(y);
      if (xd) mineN += 1;
      if (yd) theirsN += 1;
      if (xd && yd && JSON.stringify(x) !== JSON.stringify(y)) {
        conflicts += 1;
        if (ornekler.length < 5) ornekler.push({ id, mine: ozet(x), theirs: ozet(y) });
      }
    });
    return { key, label, kind, mine: mineN, theirs: theirsN, conflicts, ornekler, ids, tip: 'keys' };
  }

  /** Aynı anahtar kümesinin birden çok sözlükte tutulduğu durum (doğuştan risk). */
  function karsilastirCoklu(key, label, kind, keys, aList, bList) {
    let mineN = 0, theirsN = 0, conflicts = 0;
    const ornekler = [];
    keys.forEach(k => {
      const x = aList.map(o => (o || {})[k]);
      const y = bList.map(o => (o || {})[k]);
      const xd = x.some(dolu), yd = y.some(dolu);
      if (xd) mineN += 1;
      if (yd) theirsN += 1;
      if (xd && yd && JSON.stringify(x) !== JSON.stringify(y)) {
        conflicts += 1;
        if (ornekler.length < 5) ornekler.push({ id: k.split('|').pop(), mine: ozet(x[0]), theirs: ozet(y[0]) });
      }
    });
    return { key, label, kind, mine: mineN, theirs: theirsN, conflicts, ornekler, keys, tip: 'multi' };
  }

  function karsilastirNesne(key, label, kind, a, b) {
    const anahtarlar = [...new Set([...Object.keys(a || {}), ...Object.keys(b || {})])];
    return karsilastirAnahtarlar(key, label, kind, anahtarlar, a || {}, b || {});
  }

  function karsilastirPortfoy(mine, theirs) {
    const a = mine.portfolio || {}, b = theirs.portfolio || {};
    const say = p => Object.keys(p.matrix || {}).length + Object.keys(p.segments || {}).length
      + (p.countries || []).length + (p.branches || []).length;
    const farkli = JSON.stringify(a) !== JSON.stringify(b);
    return { key: 'portfolio', label: t('navPortfolio'), kind: 'other',
      mine: say(a), theirs: say(b), conflicts: (farkli && say(a) && say(b)) ? 1 : 0,
      ornekler: [], tip: 'whole' };
  }

  function karsilastirAksiyon(mine, theirs) {
    const a = mine.actions || [], b = theirs.actions || [];
    const aById = Object.fromEntries(a.map(x => [x.id, x]));
    let conflicts = 0;
    const ornekler = [];
    b.forEach(y => {
      const x = aById[y.id];
      if (x && JSON.stringify(x) !== JSON.stringify(y)) {
        conflicts += 1;
        if (ornekler.length < 5) ornekler.push({ id: y.id, mine: ozet(x.finding), theirs: ozet(y.finding) });
      }
    });
    return { key: 'actions', label: t('navActions'), kind: 'actions',
      mine: a.length, theirs: b.length, conflicts, ornekler, tip: 'actions' };
  }

  function ozet(v) {
    if (v === undefined || v === null) return '—';
    if (typeof v === 'object') {
      const s = v.a !== undefined ? String(v.a) : JSON.stringify(v);
      return s.length > 40 ? s.slice(0, 37) + '…' : s;
    }
    return String(v).slice(0, 40);
  }

  /* ---------- Uygulama ---------- */

  function uygula() {
    const t2 = gelen.state;
    let alinan = 0;
    const alinanParcalar = [];

    Store.update(s => {
      gelen.diff.forEach(p => {
        const sec = secim[p.key] || 'mine';
        if (sec !== 'theirs') return;
        alinan += 1;
        alinanParcalar.push(p.label);

        if (p.tip === 'keys') {
          p.ids.forEach(id => {
            const kaynak = kaynakSozluk(t2, p.key);
            const hedef = kaynakSozluk(s, p.key);
            if (dolu(kaynak[id])) hedef[id] = JSON.parse(JSON.stringify(kaynak[id]));
          });
        } else if (p.tip === 'multi') {
          const adlar = ['inherent', 'inherentNA', 'inherentNotes', 'inherentWeights'];
          p.keys.forEach(k => adlar.forEach(ad => {
            if (dolu(t2[ad][k])) s[ad][k] = t2[ad][k];
          }));
        } else if (p.tip === 'whole') {
          s.portfolio = JSON.parse(JSON.stringify(t2.portfolio));
        } else if (p.tip === 'actions') {
          // Bulgular kimlik üzerinden birleşir: gelen kayıt varsa üzerine yazar,
          // yoksa eklenir. Kimlik çakışması burada bilinçli bir seçimdir.
          const byId = Object.fromEntries((s.actions || []).map(x => [x.id, x]));
          (t2.actions || []).forEach(y => {
            if (byId[y.id]) Object.assign(byId[y.id], y);
            else s.actions.push(JSON.parse(JSON.stringify(y)));
          });
        }
      });
    });

    Store.log('merge', gelen.name, t('mgLogBefore', { n: gelen.diff.length }),
      t('mgLogAfter', { n: alinan, p: alinanParcalar.slice(0, 6).join(', ') }));
    UI.toast(t('mgDone', { n: alinan }), 'ok');
    gelen = null;
    Object.keys(secim).forEach(k => delete secim[k]);
  }

  /** Parça anahtarından ilgili sözlüğü çözer. */
  function kaynakSozluk(s, key) {
    if (key.startsWith('answers')) return s.answers;
    return s[key.split(':')[0]] || {};
  }

  /* ---------- Ekran ---------- */

  function view(host, { state, calc }) {
    host.innerHTML = `
      ${Views.banner('info', t('mgIntroTtl'), t('mgIntroBody'))}
      ${atamaKarti(state, calc)}
      ${gelen ? birlestirmeKarti() : yuklemeKarti()}
      <input type="file" accept="application/json,.json" class="sr-only" id="mg-file" tabindex="-1" aria-hidden="true">`;
    bind(host);
  }

  /** Domain bazında sorumlu ataması — kimin neyi dolduracağı yazılı olsun. */
  function atamaKarti(state, calc) {
    const atanan = Object.values(state.assign || {}).filter(Boolean).length;
    return `<div class="card">
      <div class="card-head">
        <div style="flex:1;min-width:220px">
          <h2>${t('mgAssignTtl')}</h2>
          <div class="subtle">${t('mgAssignBody')}</div>
        </div>
        <span class="chip ${atanan ? 'chip-mid' : ''}">${t('mgAssigned', { n: atanan, m: DATA.domains.length })}</span>
      </div>
      <div class="card-body flush">
        <div class="table-wrap"><table>
          <thead><tr>
            <th>${t('colCode')}</th><th>${t('domain')}</th>
            <th class="num">${t('colAnswers')}</th><th>${t('mgOwner')}</th>
          </tr></thead>
          <tbody>${DATA.domains.map(d => {
            const dom = calc.domains.find(x => x.code === d.code);
            return `<tr>
              <td><b class="mono">${esc(d.code)}</b></td>
              <td><a href="#/anket?d=${esc(d.code)}">${esc(d.name)}</a></td>
              <td class="num">${fmtInt(dom.answered)} / ${fmtInt(dom.count)}</td>
              <td style="min-width:200px"><input type="text" id="asg-${esc(d.code)}"
                data-assign="${esc(d.code)}" value="${esc((state.assign || {})[d.code] || '')}"
                placeholder="${t('mgOwnerPh')}" aria-label="${esc(d.name)} — ${t('mgOwner')}"></td>
            </tr>`;
          }).join('')}</tbody>
        </table></div>
      </div>
    </div>`;
  }

  function yuklemeKarti() {
    return `<div class="card">
      <div class="card-head">
        <div style="flex:1;min-width:220px">
          <h2>${t('mgLoadTtl')}</h2>
          <div class="subtle">${t('mgLoadBody')}</div>
        </div>
        <button class="btn btn-primary" data-mg-load>${Icons.upload()} ${t('mgLoadBtn')}</button>
      </div>
    </div>`;
  }

  function birlestirmeKarti() {
    const cakisan = gelen.diff.reduce((a, p) => a + p.conflicts, 0);
    return `<div class="card">
      <div class="card-head">
        <div style="flex:1;min-width:220px">
          <h2>${t('mgReviewTtl')}</h2>
          <div class="subtle">${t('mgReviewBody', { f: esc(gelen.name) })}</div>
        </div>
        <button class="btn" data-mg-cancel>${t('cancel')}</button>
        <button class="btn btn-primary" data-mg-apply>${Icons.check()} ${t('mgApply')}</button>
      </div>
      <div class="card-body">
        <div class="grid grid-kpi">
          ${statTile({ label: t('mgParts'), value: fmtInt(gelen.diff.length) })}
          ${statTile({ label: t('mgConflicts'), value: fmtInt(cakisan),
            tone: cakisan ? 'warn' : 'ok', foot: cakisan ? t('mgConflictsFoot') : t('mgNoConflict') })}
          ${statTile({ label: t('mgSelected'),
            value: fmtInt(gelen.diff.filter(p => secim[p.key] === 'theirs').length) })}
        </div>
      </div>
      <div class="card-body flush">
        <div class="table-wrap"><table>
          <thead><tr>
            <th>${t('mgPart')}</th><th class="num">${t('mgMine')}</th><th class="num">${t('mgTheirs')}</th>
            <th class="num">${t('mgConflicts')}</th><th>${t('mgChoose')}</th>
          </tr></thead>
          <tbody>${gelen.diff.map(p => `<tr>
            <td><b>${esc(p.label)}</b>
              ${p.ornekler.length ? `<div class="subtle">${p.ornekler.map(o =>
                `${esc(o.id)}: ${esc(o.mine)} → ${esc(o.theirs)}`).join(' · ')}</div>` : ''}</td>
            <td class="num">${fmtInt(p.mine)}</td>
            <td class="num">${fmtInt(p.theirs)}</td>
            <td class="num">${p.conflicts ? `<b class="is-warn">${fmtInt(p.conflicts)}</b>` : '0'}</td>
            <td>
              <div class="flag-list">
                <label class="flag-chip ${secim[p.key] === 'theirs' ? '' : 'on chip-mid'}">
                  <input type="radio" name="mg-${esc(p.key)}" data-mg-pick="${esc(p.key)}" data-side="mine"
                    ${secim[p.key] === 'theirs' ? '' : 'checked'}>
                  <span>${t('mgMine')}</span>
                </label>
                <label class="flag-chip ${secim[p.key] === 'theirs' ? 'on chip-mid' : ''}">
                  <input type="radio" name="mg-${esc(p.key)}" data-mg-pick="${esc(p.key)}" data-side="theirs"
                    ${secim[p.key] === 'theirs' ? 'checked' : ''}>
                  <span>${t('mgTheirs')}</span>
                </label>
              </div>
            </td>
          </tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="card-body">
        <p class="subtle">${t('mgNote')}</p>
      </div>
    </div>`;
  }

  function bind(host) {
    const file = UI.el('#mg-file', host);

    host.addEventListener('input', e => {
      const a = e.target.closest('[data-assign]');
      if (!a) return;
      Store.update(s => { s.assign = s.assign || {}; s.assign[a.dataset.assign] = a.value; },
        { silent: true });
    });

    host.addEventListener('change', e => {
      const p = e.target.closest('[data-mg-pick]');
      if (p) { secim[p.dataset.mgPick] = p.dataset.side; App.rerender(); }
    });

    host.addEventListener('click', async e => {
      if (e.target.closest('[data-mg-load]')) { file.click(); return; }
      if (e.target.closest('[data-mg-cancel]')) { gelen = null; App.rerender(); return; }
      if (e.target.closest('[data-mg-apply]')) {
        const n = gelen.diff.filter(x => secim[x.key] === 'theirs').length;
        if (!n) { UI.toast(t('mgNothingPicked'), 'err'); return; }
        const ok = await UI.confirmDialog({
          title: t('mgApply'), message: t('mgApplyMsg', { n }), confirmLabel: t('mgApply')
        });
        if (!ok) return;
        Store.snapshotNow('before-merge');
        uygula();
        App.rerender();
      }
    });

    file.addEventListener('change', ev => {
      const f = ev.target.files[0];
      ev.target.value = '';
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        let parsed;
        try { parsed = JSON.parse(reader.result); }
        catch { UI.toast(t('errNotJson'), 'err'); return; }
        if (!parsed || typeof parsed !== 'object' || !('answers' in parsed)) {
          UI.toast(t('errNotOurs'), 'err'); return;
        }
        const theirs = Store.normalize(parsed);
        const diff = parcalar(Store.state, theirs);
        if (!diff.length) { UI.toast(t('mgNothingNew'), 'ok'); return; }
        gelen = { name: f.name || '', state: theirs, diff };
        Object.keys(secim).forEach(k => delete secim[k]);
        App.rerender();
      };
      reader.readAsText(f);
    });
  }

  return { view };
})();
