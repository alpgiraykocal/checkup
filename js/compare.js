/* Dönem karşılaştırması.
   Check-up yılda bir tekrarlanır; asıl soru "geçen döneme göre ne değişti".
   Önceki dönemin çalışma dosyası yüklenir, ondan kompakt bir referans özeti
   çıkarılır ve state.baseline içinde saklanır. Tam durum saklanmaz: yedekler
   de aynı depoda tutulduğu için boyutu birkaç katına çıkarmanın anlamı yok. */

const Compare = (() => {
  const { esc, fmtInt, fmtPct, fmtPct1, fmtNum2, fmtDate, levelClass, effClass, statTile, emptyState } = UI;
  const t = (k, p) => I18n.t(k, p);

  /** Bir çalışma durumundan karşılaştırmaya yeten en küçük özet. */
  function summarize(state) {
    const c = Calc.compute(state);
    return {
      at: new Date().toISOString(),
      savedAt: state.updatedAt || null,
      institution: state.kunye.kurum_unvani || '',
      period: c.kunye.periodLabel || state.kunye.degerlendirme_donemi || '',
      assessor: state.kunye.degerlendirmeyi_yapan || '',
      method: c.method && c.method.applied ? 'exposure' : 'default',
      totals: {
        count: c.totals.count, answered: c.totals.answered,
        effectiveness: c.totals.effectiveness,
        effectivenessTested: c.totals.effectivenessTested,
        assurance: c.totals.assurance,
        openCritical: c.totals.openCritical
      },
      inherent: { general: c.inherent.measured ? c.inherent.general : null, scored: c.inherent.scored },
      generalResidual: c.generalResidual,
      breaches: c.breaches,
      domains: c.residual.map(r => {
        const d = c.domains.find(x => x.code === r.code);
        return {
          code: r.code, name: r.name,
          effectivenessTested: d.effectivenessTested,
          inherentRisk: r.inherentRisk, residual: r.residual,
          breach: r.breach, openCritical: d.openCritical, answered: d.answered, count: d.count
        };
      }),
      pf: { inherent: c.pf.measured ? c.pf.value : null, residual: c.pfLine.residual, breach: c.pfLine.breach },
      actions: {
        total: c.actionStats.total, open: c.actionStats.open,
        closed: c.actionStats.closed, overdue: c.actionStats.overdue,
        ids: (state.actions || []).map(a => ({ id: a.id, status: a.status, crit: a.crit, finding: (a.finding || '').slice(0, 120) }))
      }
    };
  }

  /* ---------- Fark okuma ---------- */

  const delta = (now, was) => (now === null || now === undefined || was === null || was === undefined) ? null : now - was;

  /** İyileşme yönü: etkinlik yükselirse iyi, risk yükselirse kötü. */
  function tone(d, goodWhen) {
    if (d === null || Math.abs(d) < 0.0005) return '';
    const up = d > 0;
    return (goodWhen === 'up' ? up : !up) ? 'ok' : 'danger';
  }

  function arrow(d, goodWhen, fmt) {
    if (d === null) return '<span class="subtle">—</span>';
    if (Math.abs(d) < 0.0005) return `<span class="subtle">${t('cmpSame')}</span>`;
    const cls = tone(d, goodWhen);
    const sign = d > 0 ? '+' : '−';
    return `<span class="delta ${cls}">${d > 0 ? '▲' : '▼'} ${sign}${fmt(Math.abs(d))}</span>`;
  }

  /* ---------- Ekran ---------- */

  function view(host, { state, calc }) {
    const base = state.baseline || null;

    if (!base) {
      host.innerHTML = `
        ${Views.banner('info', t('cmpIntroTtl'), t('cmpIntroBody'))}
        ${emptyState(t('cmpNoBase'), t('cmpNoBaseBody'),
          `<button class="btn btn-primary" data-cmp-load>${Icons.upload()} ${t('cmpLoadBtn')}</button>`)}
        <input type="file" accept="application/json,.json" class="sr-only" id="cmp-file" tabindex="-1" aria-hidden="true">`;
      bind(host);
      return;
    }

    const now = summarize(state);
    const byCode = Object.fromEntries(base.domains.map(d => [d.code, d]));

    const rows = now.domains.map(d => {
      const b = byCode[d.code] || {};
      const dEff = delta(d.effectivenessTested, b.effectivenessTested);
      const dRes = delta(d.residual, b.residual);
      const dCrit = delta(d.openCritical, b.openCritical);
      return `<tr>
        <td><b class="mono">${esc(d.code)}</b></td>
        <td><a href="#/anket?d=${esc(d.code)}">${esc(d.name)}</a></td>
        <td class="num">${fmtPct(b.effectivenessTested)}</td>
        <td class="num"><span class="heat-cell score-pill ${effClass(d.effectivenessTested)}">${fmtPct(d.effectivenessTested)}</span></td>
        <td class="num">${arrow(dEff, 'up', v => fmtPct(v))}</td>
        <td class="num">${fmtNum2(b.residual)}</td>
        <td class="num"><span class="heat-cell score-pill ${levelClass(d.breach ? 'Çok Yüksek' : 'Düşük')}">${fmtNum2(d.residual)}</span></td>
        <td class="num">${arrow(dRes, 'down', v => fmtNum2(v))}</td>
        <td class="num">${fmtInt(b.openCritical)} → <b>${fmtInt(d.openCritical)}</b>
          ${dCrit ? ` ${arrow(dCrit, 'down', v => fmtInt(v))}` : ''}</td>
        <td>${statusCell(b.breach, d.breach)}</td>
      </tr>`;
    }).join('');

    // Bulgu kapanışı: kimlik üzerinden eşleştirilir
    const wasOpen = new Set((base.actions.ids || []).filter(a => a.status !== 'Kapalı').map(a => a.id));
    const nowById = Object.fromEntries((now.actions.ids || []).map(a => [a.id, a]));
    const closedSince = [...wasOpen].filter(id => nowById[id] && nowById[id].status === 'Kapalı');
    const stillOpen = [...wasOpen].filter(id => nowById[id] && nowById[id].status !== 'Kapalı');
    const brandNew = (now.actions.ids || []).filter(a => !(base.actions.ids || []).some(b => b.id === a.id));

    host.innerHTML = `
      ${Views.banner('info', t('cmpBaseTtl', {
        p: base.period || t('cmpNoPeriod'),
        d: base.savedAt ? new Date(base.savedAt).toLocaleDateString(I18n.locale) : fmtDate(base.at)
      }), t('cmpBaseBody', { k: base.institution || t('noInstitution') }))}

      ${base.method && base.method !== now.method
        ? Views.banner('warn', t('mtCmpMismatch', { b: base.method === 'exposure' ? t('mtExposure') : t('mtDefault') }), t('mtWarn'))
        : ''}

      <div class="grid grid-kpi">
        ${cmpTile(t('colEffTested'), base.totals.effectivenessTested, now.totals.effectivenessTested, 'up', v => fmtPct1(v))}
        ${cmpTile(t('csvH.inherentRisk'), base.inherent.general, now.inherent.general, 'down', v => fmtNum2(v))}
        ${cmpTile(t('colResidual'), base.generalResidual, now.generalResidual, 'down', v => fmtNum2(v))}
        ${cmpTile(t('kpiBreaches'), base.breaches, now.breaches, 'down', v => fmtInt(v))}
        ${cmpTile(t('kpiOpenCritical'), base.totals.openCritical, now.totals.openCritical, 'down', v => fmtInt(v))}
        ${cmpTile(t('colAssurance'), base.totals.assurance, now.totals.assurance, 'up', v => fmtPct(v))}
      </div>

      <div class="card">
        <div class="card-head"><h2>${t('cmpDomainTtl')}</h2>
          <span class="subtle">${t('cmpDomainSub')}</span></div>
        <div class="card-body flush">
          <div class="table-wrap"><table>
            <thead>
            <tr>
              <th rowspan="2">${t('colCode')}</th><th rowspan="2">${t('domain')}</th>
              <th class="num group-head" colspan="3">${t('colEffTested')}</th>
              <th class="num group-head" colspan="3">${t('colResidual')}</th>
              <th class="num" rowspan="2">${t('colOpenCrit')}</th><th rowspan="2">${t('status')}</th>
            </tr>
            <tr class="subhead">
              <th class="num">${t('cmpWas')}</th><th class="num">${t('cmpNow')}</th><th class="num">${t('cmpDelta')}</th>
              <th class="num">${t('cmpWas')}</th><th class="num">${t('cmpNow')}</th><th class="num">${t('cmpDelta')}</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table></div>
        </div>
      </div>

      <div class="card">
        <div class="card-head"><h2>${t('cmpActionTtl')}</h2></div>
        <div class="card-body">
          <div class="grid grid-kpi">
            ${statTile({ label: t('cmpClosed'), value: fmtInt(closedSince.length), tone: closedSince.length ? 'ok' : '',
              foot: t('cmpClosedFoot') })}
            ${statTile({ label: t('cmpStillOpen'), value: fmtInt(stillOpen.length), tone: stillOpen.length ? 'warn' : 'ok',
              foot: t('cmpStillOpenFoot') })}
            ${statTile({ label: t('cmpNew'), value: fmtInt(brandNew.length), foot: t('cmpNewFoot') })}
          </div>
          ${stillOpen.length ? `<div class="divider"></div>
            <h3>${t('cmpStillOpen')}</h3>
            <ul>${stillOpen.slice(0, 15).map(id => {
              const a = nowById[id];
              return `<li><b class="mono">${esc(id)}</b> — ${esc(a.finding || '')} ${a.crit ? UI.critChip(a.crit) : ''}</li>`;
            }).join('')}</ul>
            ${stillOpen.length > 15 ? `<p class="subtle">${t('firstNShown', { n: 15 })}</p>` : ''}` : ''}
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <div style="flex:1;min-width:200px"><h2>${t('cmpManageTtl')}</h2>
            <div class="subtle">${t('cmpManageBody')}</div></div>
          <button class="btn" data-cmp-load>${Icons.upload()} ${t('cmpReplaceBtn')}</button>
          <button class="btn btn-danger" data-cmp-clear>${Icons.trash()} ${t('cmpClearBtn')}</button>
        </div>
      </div>
      <input type="file" accept="application/json,.json" class="sr-only" id="cmp-file" tabindex="-1" aria-hidden="true">`;

    bind(host);
  }

  function statusCell(was, now) {
    if (now === null) return '<span class="subtle">—</span>';
    if (now && !was) return `<span class="chip chip-critical">${t('cmpNewBreach')}</span>`;
    if (!now && was) return `<span class="chip chip-ok">${t('cmpFixed')}</span>`;
    if (now && was) return `<span class="chip chip-high">${t('cmpStillBreach')}</span>`;
    return `<span class="chip chip-ok">${t('withinAppetiteFull')}</span>`;
  }

  function cmpTile(label, was, now, goodWhen, fmt) {
    const d = delta(now, was);
    return statTile({
      label, value: fmt(now), tone: tone(d, goodWhen),
      foot: `${t('cmpWas')} ${fmt(was)} · ${arrow(d, goodWhen, fmt)}`
    });
  }

  function bind(host) {
    const file = UI.el('#cmp-file', host);

    host.addEventListener('click', async e => {
      if (e.target.closest('[data-cmp-load]')) { file.click(); return; }
      if (e.target.closest('[data-cmp-clear]')) {
        const ok = await UI.confirmDialog({
          title: t('cmpClearTitle'), message: t('cmpClearMsg'),
          confirmLabel: t('cmpClearBtn'), danger: true
        });
        if (ok) { Store.update(s => { delete s.baseline; }); UI.toast(t('cmpCleared')); }
      }
    });

    file.addEventListener('change', e => {
      const f = e.target.files[0];
      e.target.value = '';
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        let parsed;
        try { parsed = JSON.parse(reader.result); }
        catch { UI.toast(t('errNotJson'), 'err'); return; }
        if (!parsed || typeof parsed !== 'object' || !('answers' in parsed)) {
          UI.toast(t('errNotOurs'), 'err'); return;
        }
        // Yüklenen dosya yalnızca özetlenir; çalışan durum değişmez.
        // Şekil düzeltmesi Store ile aynı yerden gelir: bozuk dosya çökmemeli.
        const prev = Store.normalize(parsed);
        Store.update(s => { s.baseline = summarize(prev); });
        UI.toast(t('cmpLoaded'), 'ok');
      };
      reader.readAsText(f);
    });
  }

  return { view, summarize };
})();
