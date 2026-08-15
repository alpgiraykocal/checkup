/* İşlem ve operasyon ekranı.
   Girilen sayılar türetilen oranlara, KPI'lara ve doğuştan risk önerilerine akar. */

const Operations = (() => {
  const { esc, fmtInt, fmtPct1, fmtNum1, statTile, meter } = UI;
  const t = (k, p) => I18n.t(k, p);
  const L = o => (o ? (I18n.isEn ? (o.en || o.tr) : o.tr) : '');

  function ops(state) {
    if (!state.operations) state.operations = {};
    return state.operations;
  }

  const val = (state, key, field) => {
    const rec = (state.operations || {})[key];
    if (!rec) return null;
    const v = Number(rec[field]);
    return Number.isFinite(v) ? v : null;
  };

  /** "metric.field" veya bunların dizisi -> toplam; hiçbiri girilmemişse null. */
  function pick(state, ref) {
    const list = Array.isArray(ref) ? ref : [ref];
    let sum = null;
    for (const r of list) {
      const [k, f] = r.split('.');
      const v = val(state, k, f);
      if (v !== null) sum = (sum || 0) + v;
    }
    return sum;
  }

  /* ---------- Hesaplama ---------- */

  function compute(state) {
    const scopeOff = key => {
      const g = OPERATIONS.groups.find(x => x.key === key);
      return Boolean(g && g.scope && (state.kunye[g.scope] || '') === 'Hayır');
    };

    // Doldurulan ölçüt sayısı
    let filled = 0, total = 0;
    const groups = OPERATIONS.groups.map(g => {
      const off = scopeOff(g.key);
      let gFilled = 0;
      g.metrics.forEach(m => {
        total += 1;
        const any = m.fields.some(f => val(state, m.key, f) !== null);
        if (any) { filled += 1; gFilled += 1; }
      });
      return { spec: g, filled: gFilled, count: g.metrics.length, off };
    });

    // Türetilen oranlar
    const derived = OPERATIONS.derived.map(d => {
      const num = pick(state, d.num), den = pick(state, d.den);
      const value = (num !== null && den !== null && den > 0) ? num / den : null;
      return { spec: d, num, den, value };
    });
    const byKey = Object.fromEntries(derived.map(d => [d.spec.key, d]));

    // Doğuştan risk skor önerileri
    const hints = {};
    const addHint = (factor, share, bands, label) => {
      if (share === null || !bands || !factor) return;
      const pct = share * 100;
      hints[factor] = { pct, suggested: bands.findIndex(b => pct < b) + 1 || 5, label, source: 'operations' };
    };
    OPERATIONS.groups.forEach(g => g.metrics.forEach(m => {
      if (!m.feedsFactor || !m.bands || !m.base) return;
      const num = val(state, m.key, 'adet'), den = pick(state, m.base + '.adet');
      if (num === null || den === null || den <= 0) return;
      addHint(m.feedsFactor, num / den, m.bands, L(m));
    }));
    derived.forEach(d => {
      if (d.spec.factor && d.value !== null) addHint(d.spec.factor, d.value, d.spec.bands, L(d.spec));
    });

    // KPI otomatik değerleri
    const kpi = {};
    OPERATIONS.groups.forEach(g => g.metrics.forEach(m => {
      if (!m.feedsKpi) return;
      const f = m.fields.find(x => x !== 'tutar') || m.fields[0];
      const v = val(state, m.key, f);
      if (v !== null) kpi[m.feedsKpi] = v;
    }));
    derived.forEach(d => {
      if (d.spec.kpi && d.value !== null) kpi[d.spec.kpi] = Math.round(d.value * 1000) / 10;
    });

    // Tutarlılık uyarıları
    const w = [];
    const cmp = (a, b, msg) => {
      const va = pick(state, a), vb = pick(state, b);
      if (va !== null && vb !== null && va > vb) w.push(msg);
    };
    cmp('islem_izlenen.adet', 'islem_toplam.adet', t('opWarnMonitored'));
    cmp('izleme_vaka.adet', 'izleme_alert.adet', t('opWarnCase'));
    cmp('sib_adet.adet', 'izleme_vaka.adet', t('opWarnStr'));
    cmp('rfi_yanitlanan.adet', 'rfi_gelen.adet', t('opWarnRfi'));
    cmp('egitim_tamamlayan.adet', 'egitim_hedef.adet', t('opWarnTraining'));
    cmp('qa_kritik_hata.adet', 'qa_test_dosya.adet', t('opWarnQa'));
    cmp('uzaktan_hesap.adet', 'yeni_hesap.adet', t('opWarnRemote'));
    const cross = pick(state, ['giden_transfer.adet', 'gelen_transfer.adet']);
    const totalTx = pick(state, 'islem_toplam.adet');
    if (cross !== null && totalTx !== null && cross > totalTx) w.push(t('opWarnCross'));

    return { groups, derived, byKey, hints, kpi, warnings: w, filled, total };
  }

  /* ---------- Ekran ---------- */

  function view(host, ctx) {
    const { state } = ctx;
    const o = compute(state);
    const shown = o.groups.filter(g => !g.off);

    host.innerHTML = `
      ${o.warnings.length ? Views.banner('danger', t('opWarnTitle'), o.warnings.join(' ')) : ''}
      ${Views.banner('info', t('opIntroTitle'),
        t('opIntroBody', { n: Object.keys(o.kpi).length, f: Object.keys(o.hints).length }))}

      <div class="grid grid-kpi">
        ${statTile({ label: t('opFilled'), value: `${fmtInt(o.filled)}`, unit: `/ ${fmtInt(o.total)}`,
          foot: t('opFilledFoot') + meter(o.total ? o.filled / o.total : 0) })}
        ${highlight(o, 'monitoring_coverage')}
        ${highlight(o, 'alert_case')}
        ${highlight(o, 'case_str')}
        ${highlight(o, 'return_rate')}
        ${highlight(o, 'sanction_hit')}
        ${highlight(o, 'cash_share')}
        ${highlight(o, 'trade_screen_cov')}
      </div>

      ${derivedCard(o)}

      <div class="toolbar no-print">
        <div class="field">
          <label for="op-jump">${t('opJump')}</label>
          <select id="op-jump" data-op-jump>
            ${shown.map(g => `<option value="op-${g.spec.key}">${esc(L(g.spec))} — ${g.filled}/${g.count}</option>`).join('')}
          </select>
        </div>
      </div>

      ${shown.map(g => groupCard(g, state)).join('')}
      ${o.groups.filter(g => g.off).map(g => `<div class="card">
        <div class="card-head">
          <h2>${esc(L(g.spec))}</h2>
          <span class="chip chip-na">${Icons.lock()} ${t('opOutOfScope')}</span>
        </div>
      </div>`).join('')}`;

    bind(host);
  }

  function highlight(o, key) {
    const d = o.byKey[key];
    if (!d) return '';
    const s = d.spec;
    let tone = '';
    if (d.value !== null && s.good === 'up') tone = d.value >= 0.95 ? 'ok' : d.value >= 0.8 ? 'warn' : 'danger';
    if (d.value !== null && s.good === 'down') tone = d.value <= 0.05 ? 'ok' : d.value <= 0.2 ? 'warn' : 'danger';
    return statTile({
      label: L(s), value: fmtPct1(d.value), tone,
      foot: d.value === null ? t('opNoData')
        : `${fmtInt(d.num)} / ${fmtInt(d.den)}` + meter(Math.min(1, d.value), tone === 'ok' ? 'ok' : tone === 'warn' ? 'warn' : tone === 'danger' ? 'danger' : '')
    });
  }

  function derivedCard(o) {
    const rows = o.derived.map(d => {
      const s = d.spec;
      return `<tr>
        <td>${esc(L(s))}
          ${s.trHelp || s.enHelp ? `<div class="subtle">${esc(I18n.isEn ? (s.enHelp || s.trHelp) : s.trHelp)}</div>` : ''}</td>
        <td class="num">${d.num === null ? '—' : fmtInt(d.num)}</td>
        <td class="num">${d.den === null ? '—' : fmtInt(d.den)}</td>
        <td class="num"><b>${fmtPct1(d.value)}</b></td>
        <td>${s.kpi ? `<span class="chip chip-mid">${Icons.arrowDown()} KPI</span>` : ''}
            ${s.factor ? `<span class="chip chip-mid">${Icons.link()} ${t('pfFeedsFactor')}</span>` : ''}</td>
      </tr>`;
    }).join('');

    return `<div class="card">
      <div class="card-head">
        <div style="flex:1;min-width:200px">
          <h2>${t('opDerivedTitle')}</h2>
          <div class="subtle">${t('opDerivedHelp')}</div>
        </div>
      </div>
      <div class="card-body flush">
        <div class="table-wrap"><table>
          <thead><tr><th>${t('opRatio')}</th><th class="num">${t('opNumerator')}</th>
            <th class="num">${t('opDenominator')}</th><th class="num">${t('opValue')}</th><th>${t('opFeeds')}</th></tr></thead>
          <tbody>${rows}</tbody>
        </table></div>
      </div>
    </div>`;
  }

  function groupCard(g, state) {
    const spec = g.spec;
    const rows = spec.metrics.map(m => {
      const help = I18n.isEn ? (m.enHelp || m.trHelp) : m.trHelp;
      const cells = ['adet', 'tutar', 'gun', 'saat'].map(f => {
        if (!m.fields.includes(f)) return '<td></td>';
        const v = (state.operations[m.key] || {})[f];
        return `<td style="width:150px">
          <div class="input-unit">
            <input type="number" min="0" step="${f === 'tutar' ? '0.01' : '1'}" inputmode="decimal"
              id="op-${m.key}-${f}" data-op="${m.key}" data-field="${f}"
              value="${v ?? ''}" placeholder="0" aria-label="${esc(L(m))} — ${esc(L(OPERATIONS.units[f]))}">
            <span class="unit-tag">${esc(L(OPERATIONS.units[f]))}</span>
          </div>
        </td>`;
      }).join('');
      return `<tr>
        <td style="min-width:260px">
          <label for="op-${m.key}-${m.fields[0]}" style="font-weight:500;color:inherit;margin:0">${esc(L(m))}</label>
          ${help ? `<div class="subtle">${esc(help)}</div>` : ''}
          ${m.feedsKpi ? `<div class="subtle">${Icons.arrowDown()} ${t('opFeedsKpi')}</div>` : ''}
          ${m.feedsFactor ? `<div class="subtle">${Icons.link()} ${t('pfFeedsFactor')}</div>` : ''}
        </td>
        ${cells}
      </tr>`;
    }).join('');

    return `<div class="card" id="op-${spec.key}">
      <div class="card-head">
        <div style="flex:1;min-width:220px">
          <h2>${Icons[spec.icon] ? Icons[spec.icon]() : ''} ${esc(L(spec))}</h2>
          <div class="subtle">${esc(I18n.isEn ? spec.enHelp : spec.trHelp)}</div>
        </div>
        <span class="chip ${g.filled === g.count ? 'chip-ok' : ''}">${g.filled}/${g.count}</span>
      </div>
      <div class="card-body flush">
        <div class="table-wrap"><table>
          <thead><tr>
            <th>${t('opMetric')}</th>
            <th>${esc(L(OPERATIONS.units.adet))}</th><th>${esc(L(OPERATIONS.units.tutar))}</th>
            <th>${esc(L(OPERATIONS.units.gun))}</th><th>${esc(L(OPERATIONS.units.saat))}</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table></div>
      </div>
    </div>`;
  }

  function bind(host) {
    host.addEventListener('input', e => {
      const f = e.target.closest('[data-op]');
      if (!f) return;
      Store.update(s => {
        const o = ops(s);
        o[f.dataset.op] = o[f.dataset.op] || {};
        if (f.value === '') delete o[f.dataset.op][f.dataset.field];
        else o[f.dataset.op][f.dataset.field] = Number(f.value);
        if (!Object.keys(o[f.dataset.op]).length) delete o[f.dataset.op];
      }, { silent: true });
    });
    host.addEventListener('blur', e => { if (e.target.closest('[data-op]')) App.rerender(); }, true);
    host.addEventListener('change', e => {
      const j = e.target.closest('[data-op-jump]');
      if (j) {
        const el = document.getElementById(j.value);
        if (el) el.scrollIntoView({ block: 'start' });
      }
    });
  }

  return { compute, view };
})();
