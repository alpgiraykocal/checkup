/* Ekranlar. Her view: render(host, ctx) — ctx = {state, calc}. */

const Views = (() => {
  const { esc, fmtInt, fmtPct, fmtPct1, fmtNum1, fmtNum2, fmtDate,
          levelClass, effClass, critChip, meter, statTile, selectOptions, refOptions, emptyState } = UI;
  const t = (k, p) => I18n.t(k, p);

  /* =========================================================
     PANO
     ========================================================= */
  function dashboard(host, { state, calc }) {
    const tot = calc.totals;
    const inh = calc.inherent;
    const effTone = tot.effectiveness === null ? '' : tot.effectiveness >= 0.75 ? 'ok' : tot.effectiveness >= 0.6 ? 'warn' : 'danger';

    const tiles = [
      statTile({
        label: t('kpiEffectiveness'), value: fmtPct1(tot.effectiveness), tone: effTone,
        foot: (tot.maturity ? `${t('maturityLabel')}: <b>${esc(I18n.ref('maturity', tot.maturity))}</b>` : t('noAnswersYet'))
          + meter(tot.effectiveness, effTone === 'ok' ? 'ok' : effTone === 'warn' ? 'warn' : 'danger')
      }),
      statTile({
        label: t('kpiInherent'), value: inh.measured ? fmtNum2(inh.general) : '—', unit: '/ 5',
        tone: !inh.measured ? '' : inh.general >= 3 ? 'danger' : inh.general >= 2 ? 'warn' : 'ok',
        foot: `${inh.measured ? esc(I18n.ref('riskLevel', inh.dims.GENEL.level)) : t('notMeasured')} · ${inh.scored}/${inh.applicable} ${t('factor')}${inh.na ? ` · ${inh.na} N/A` : ''}`
      }),
      statTile({
        label: t('kpiResidual'), value: fmtNum2(calc.generalResidual), unit: '/ 5',
        tone: calc.generalResidual === null ? '' : calc.generalResidual >= 2.5 ? 'danger' : calc.generalResidual >= 1.5 ? 'warn' : 'ok',
        foot: calc.generalResidual === null ? t('effNotComputable') : esc(I18n.ref('riskLevel', Calc.residualLevel(calc.generalResidual)))
      }),
      statTile({
        label: t('kpiProgress'), value: fmtInt(tot.answered), unit: `/ ${fmtInt(tot.count)}`,
        foot: `${fmtPct(tot.progress)} ${t('pctComplete')}` + meter(tot.progress)
      }),
      statTile({
        label: t('kpiOpenCritical'), value: fmtInt(tot.openCritical), tone: tot.openCritical > 0 ? 'danger' : 'ok',
        foot: t('critRule')
      }),
      statTile({
        label: t('kpiBreaches'), value: fmtInt(calc.breaches), tone: calc.breaches > 0 ? 'danger' : 'ok',
        foot: t('overAppetite')
      }),
      statTile({
        label: t('kpiOpenActions'), value: fmtInt(calc.actionStats.open),
        tone: calc.actionStats.overdue > 0 ? 'danger' : '',
        foot: `${fmtInt(calc.actionStats.overdue)} ${t('overdueCritical', { n: fmtInt(calc.actionStats.critical) })}`
      }),
      statTile({
        label: t('kpiClosureRate'), value: fmtPct(calc.actionStats.closureRate),
        foot: `${fmtInt(calc.actionStats.closed)} / ${fmtInt(calc.actionStats.total)} ${t('closedOfTotal')}` + meter(calc.actionStats.closureRate)
      })
    ].join('');

    const banners = [];
    if (tot.answered === 0) {
      banners.push(banner('info', t('bnStartTitle'), t('bnStartBody')));
    }
    if (inh.pending > 0 && inh.scored > 0) {
      banners.push(banner('warn', t('bnInhPendTtl', { n: inh.pending }), t('bnInhPendBody')));
    }
    if (inh.missingNotes > 0) {
      banners.push(banner('warn', t('bnNotesTtl', { n: inh.missingNotes }), t('bnNotesBody')));
    }
    if (tot.openCritical > 0) {
      banners.push(banner('danger', t('bnCritTtl', { n: tot.openCritical }), t('bnCritBody')));
    }

    host.innerHTML = `
      ${banners.join('')}
      <div class="grid grid-kpi">${tiles}</div>

      <div class="card" style="margin-top:16px">
        <div class="card-head"><h2>${t('heatmapTitle')}</h2>
          <span class="subtle">${t('heatmapFormula')}</span></div>
        <div class="card-body">
          ${heatmap(calc)}
        </div>
      </div>

      <div class="card" style="margin-top:16px">
        <div class="card-head"><h2>${t('inherentDims')}</h2>
          <span class="subtle">${t('inherentDimsSub')}</span></div>
        <div class="card-body"><div class="grid grid-2">${inherentBars(calc)}</div></div>
      </div>

      <div class="card" style="margin-top:16px">
        <div class="card-head"><h2>${t('kpiSectionTitle')}</h2>
          <span class="subtle">${t('kpiSectionSub')}</span></div>
        <div class="card-body" style="padding:0">${kpiTable(state, calc)}</div>
      </div>
    `;

    host.addEventListener('input', e => {
      const f = e.target.closest('[data-kpi]');
      if (!f) return;
      const name = f.dataset.kpi, field = f.dataset.field;
      Store.update(s => {
        s.kpis[name] = s.kpis[name] || {};
        if (f.value.trim()) s.kpis[name][field] = f.value;
        else delete s.kpis[name][field];
      }, { silent: true });
    });
    // Durum sütunu yazma bitince güncellensin
    host.addEventListener('blur', e => {
      if (e.target.closest('[data-kpi]')) App.rerender();
    }, true);
  }

  function banner(kind, title, msg) {
    const icon = kind === 'danger' ? Icons.alert() : kind === 'warn' ? Icons.alert() : Icons.info();
    return `<div class="banner ${kind === 'info' ? '' : kind}">${icon}<div><b>${esc(title)}</b><span>${esc(msg)}</span></div></div>`;
  }

  function heatmap(calc) {
    const byCode = Object.fromEntries(calc.domains.map(d => [d.code, d]));
    const rows = calc.residual.map(r => {
      const d = byCode[r.code];
      const eff = d.effectiveness;
      return `<div class="heat-row">
        <div class="heat-name"><b class="mono">${esc(r.code)}</b> ${esc(r.name)}
          <div class="subtle">${fmtInt(d.answered)}/${fmtInt(d.count)} ${t('colAnswers').toLocaleLowerCase(I18n.locale)}${d.na ? ` · ${fmtInt(d.na)} N/A` : ''}</div></div>
        <div class="heat-eff-bar">${meter(eff === null ? 0 : eff, eff === null ? '' : eff >= 0.75 ? 'ok' : eff >= 0.6 ? 'warn' : 'danger')}
          <div class="subtle">${esc(d.maturity ? I18n.ref('maturity', d.maturity) : t('awaitingAnswers'))}</div></div>
        <div class="heat-cell ${effClass(eff)}" title="${t('colEffectiveness')}">${fmtPct(eff)}</div>
        <div class="heat-cell ${levelClass(r.level)}" title="${t('colResidual')}">${fmtNum2(r.residual)}</div>
        <div class="heat-cell ${r.breach ? 'lvl-cok-yuksek' : r.breach === false ? 'lvl-dusuk' : 'lvl-none'}" title="${t('colAppetiteLimit')} ${fmtNum1(r.appetite)}">
          ${r.breach === null ? '—' : r.breach ? t('breach') : t('withinAppetite')}</div>
      </div>`;
    }).join('');

    return `<div role="table" aria-label="${t('heatmapTitle')}">
      <div class="heat-row head" role="row">
        <div>${t('domain')}</div><div class="heat-eff-bar">${t('maturityLabel')}</div>
        <div class="center">${t('colEffectiveness')}</div><div class="center">${t('colResidual')}</div><div class="center">${t('colAppetite')}</div>
      </div>
      ${rows}
    </div>`;
  }

  function inherentBars(calc) {
    return Calc.DIMS.map(dimKey => {
      const d = calc.inherent.dims[dimKey];
      const domains = (DATA.dimDomains || {})[dimKey] || [];
      return `<div style="margin-bottom:12px">
        <div style="display:flex;gap:8px;align-items:baseline">
          <span style="flex:1">${esc(I18n.dim(dimKey))}</span>
          ${d.measured ? `<span class="chip ${levelClass(d.level)}">${esc(I18n.ref('riskLevel', d.level))}</span>
            <b class="num">${fmtNum2(d.value)}</b><span class="subtle">/5</span>`
            : `<span class="chip chip-na">${t('notMeasured')}</span>`}
        </div>
        ${meter(d.value / 5, !d.measured ? '' : d.value >= 3 ? 'danger' : d.value >= 2 ? 'warn' : 'ok')}
        <div class="subtle">${d.scored}/${d.applicable} ${t('factor')}${d.na ? ` · ${d.na} N/A` : ''} · ${domains.join(' ') || '—'}</div>
      </div>`;
    }).join('');
  }

  /** Hedefe göre durum. dir: down = küçük iyi, up = büyük iyi, neutral = yorum gerektirir. */
  function kpiStatus(k, target, value) {
    if (target === null || value === null) return null;
    if (k.dir === 'neutral') return { cls: 'chip-mid', text: t('kpiNeedsJudgment') };
    const ok = k.dir === 'down' ? value <= target : value >= target;
    return ok ? { cls: 'chip-ok', text: t('kpiOnTarget') } : { cls: 'chip-critical', text: t('kpiOffTarget') };
  }

  function kpiTable(state, calc) {
    const num = v => {
      const n = Number(String(v).replace(',', '.'));
      return String(v).trim() !== '' && Number.isFinite(n) ? n : null;
    };

    const rows = DATA.kpis.map((k, i) => {
      const rec = state.kpis[k.name] || {};
      const auto = Calc.autoKpi(k, state, { closureRate: calc.actionStats.closureRate });
      const target = num(rec.target);
      const manual = num(rec.value);
      const value = manual !== null ? manual : auto;
      const st = kpiStatus(k, target, value);
      const dirHint = k.dir === 'down' ? t('kpiLowerBetter') : k.dir === 'up' ? t('kpiHigherBetter') : t('kpiNeutral');
      const statusCell = st
        ? `<span class="chip ${st.cls}">${esc(st.text)}</span>`
        : target === null && value === null ? '<span class="subtle">—</span>'
        : target === null ? `<span class="subtle">${t('kpiNoTarget')}</span>`
        : `<span class="subtle">${t('kpiNoValue')}</span>`;

      return `<tr>
        <td>
          <label for="kpi-v-${i}" style="font-weight:500;color:inherit;margin:0">${esc(k.name.replace(/\s*\((gün|saat|ay)\)/, ''))}</label>
          <div class="subtle">${esc(k.help)}</div>
          <div class="subtle">${t('source')}: ${esc(k.auto ? t('kpiAutoSource') : k.source)} · ${dirHint}</div>
        </td>
        <td style="width:120px">
          <div class="input-unit">
            <input type="text" inputmode="decimal" id="kpi-t-${i}" data-kpi="${esc(k.name)}" data-field="target"
              value="${esc(rec.target || '')}" placeholder="${esc(k.placeholder || 'hedef')}"
              aria-label="${esc(k.name)} — ${t('kpiTarget')}" title="${t('kpiExampleTarget')}: ${esc(k.placeholder || '')} ${esc(k.unit)}">
            <span class="unit-tag">${esc(k.unit)}</span>
          </div>
        </td>
        <td style="width:120px">
          ${k.auto && manual === null
            ? `<div class="auto-value" title="${t('kpiAutoTitle')}">
                 <b class="num">${auto === null ? '—' : fmtInt(auto)}</b> <span class="subtle">${esc(k.unit)}</span>
                 <div class="subtle">${t('kpiAuto')}</div>
               </div>`
            : `<div class="input-unit">
                 <input type="text" inputmode="decimal" id="kpi-v-${i}" data-kpi="${esc(k.name)}" data-field="value"
                   value="${esc(rec.value || '')}" placeholder="${t('kpiMeasurement')}" aria-label="${esc(k.name)} — ${t('kpiValue')}">
                 <span class="unit-tag">${esc(k.unit)}</span>
               </div>`}
        </td>
        <td style="width:130px">${statusCell}</td>
      </tr>`;
    }).join('');

    return `<div class="table-wrap"><table>
      <thead><tr><th>${t('kpiCol')}</th><th>${t('kpiTarget')}</th><th>${t('kpiValue')}</th><th>${t('status')}</th></tr></thead>
      <tbody>${rows}</tbody></table></div>`;
  }

  /* =========================================================
     KÜNYE
     ========================================================= */
  function kunyeField(f, state) {
    const val = state.kunye[f.id] || '';
    const id = 'k-' + f.id;
    const described = (f.help || f.scopeNote) ? ` aria-describedby="${id}-help"` : '';
    let input;

    switch (f.type) {
      case 'yesno':
        input = `<select id="${id}" data-kunye="${f.id}"${described}>
          ${selectOptions(['Evet', 'Hayır'], val, t('select'), [I18n.ref('answers', 'Evet'), I18n.ref('answers', 'Hayır')])}</select>`;
        break;
      case 'select':
        // Depolanan değer Türkçe seçenek dizisinden gelir; etiket seçili dile göre gösterilir.
        input = `<select id="${id}" data-kunye="${f.id}"${described}>
          ${selectOptions(f.optionKeys || f.options, val, t('select'), f.options)}</select>`;
        break;
      case 'date':
        input = `<input type="date" id="${id}" data-kunye="${f.id}" value="${esc(val)}"${described}>`;
        break;
      case 'number':
        input = `<div class="input-unit">
          <input type="number" min="0" step="${f.step || 1}" inputmode="decimal" id="${id}"
            data-kunye="${f.id}" value="${esc(val)}" placeholder="${esc(f.placeholder || '')}"${described}>
          ${f.unit ? `<span class="unit-tag">${esc(f.unit)}</span>` : ''}
        </div>`;
        break;
      default:
        input = `<input type="text" id="${id}" data-kunye="${f.id}" value="${esc(val)}"
          placeholder="${esc(f.placeholder || '')}"${described}>`;
    }

    // Sayı alanlarında binlik ayraçlı okuma yardımı
    const readable = (f.type === 'number' && val !== '' && Number.isFinite(Number(val)))
      ? `<span class="read-back">${fmtInt(Number(val))}${f.unit ? ' ' + esc(f.unit) : ''}</span>` : '';

    return `<div class="field">
      <label for="${id}" class="${f.required ? 'req' : ''}">${esc(f.label)}</label>
      ${input}
      ${(f.help || f.scopeNote || readable) ? `<div class="help" id="${id}-help">
        ${esc(f.help || '')}${readable}
        ${f.scopeNote ? `<div class="scope-note">${Icons.link()}${esc(f.scopeNote)}</div>` : ''}
      </div>` : ''}
    </div>`;
  }

  function kunye(host, { state, calc }) {
    const k = calc.kunye;

    const groups = DATA.kunyeGroups.map(g => {
      const fields = DATA.kunyeFields.filter(f => f.group === g.name);
      const done = fields.filter(f => String(state.kunye[f.id] || '').trim()).length;
      return `<div class="card">
        <div class="card-head">
          <div style="flex:1;min-width:180px">
            <h3>${esc(g.name)}</h3>
            <div class="subtle">${esc(g.help)}</div>
          </div>
          <span class="chip ${done === fields.length ? 'chip-ok' : ''}">${done}/${fields.length}</span>
        </div>
        <div class="card-body">
          <div class="field-row">${fields.map(f => kunyeField(f, state)).join('')}</div>
        </div>
      </div>`;
    }).join('');

    const scoped = Array.from(calc.scopeMap.entries());
    const scopedQ = DATA.questions.filter(q => calc.scopeMap.has(q.domain + '|' + q.section)).length;
    const scopedFactors = calc.inherent.factors.filter(x => x.st.autoNA).length;

    host.innerHTML = `
      ${k.warnings.length ? banner('danger', t('bnInconsistent'), k.warnings.join(' ')) : ''}
      ${k.missingRequired.length
        ? banner('warn', t('bnReqTitle', { n: k.missingRequired.length }),
            k.missingRequired.map(f => f.label).join(' · '))
        : banner('info', t('bnScopeTitle'), t('bnScopeBody'))}

      <div class="grid grid-kpi" style="margin-bottom:16px">
        ${statTile({ label: t('profileCompleteness'), value: fmtPct(k.progress),
          tone: k.progress === 1 ? 'ok' : k.missingRequired.length ? 'warn' : '',
          foot: `${k.filled}/${k.total} ${t('fieldsFilled')}` + meter(k.progress, k.progress === 1 ? 'ok' : '') })}
        ${k.ratios.map(r => statTile({
          label: r.label,
          value: r.value === null ? '—' : (r.format === 'int' ? fmtInt(Math.round(r.value)) : fmtPct1(r.value)),
          foot: r.value === null ? t('ratioMissing') : esc(r.note)
        })).join('')}
      </div>

      <div class="grid grid-dims">
        ${groups}
        <div>
          <div class="card">
            <div class="card-head"><h3>${t('scopeEffect')}</h3></div>
            <div class="card-body">
              ${scoped.length ? `
                <p class="subtle">${t('scopedOutNote', { q: fmtInt(scopedQ), f: fmtInt(scopedFactors) })}</p>
                <div class="table-wrap"><table>
                  <thead><tr><th>${t('section')}</th><th>${t('rationale')}</th><th class="num">${t('colQuestions')}</th></tr></thead>
                  <tbody>${scoped.map(([key, reason]) => {
                    const [dom, sec] = key.split('|');
                    const n = DATA.questions.filter(q => q.domain === dom && q.section === sec).length;
                    const label = (DATA_EN.sections && I18n.isEn) ? (DATA_EN.sections[sec] || sec) : sec;
                    return `<tr><td><b class="mono">${esc(dom)}</b> · ${esc(label)}</td><td>${esc(reason)}</td><td class="num">${n}</td></tr>`;
                  }).join('')}</tbody></table></div>`
                : `<p class="muted">${t('noScopeNarrowing', { n: fmtInt(DATA.questions.length) })}</p>`}
              <div class="divider"></div>
              <p class="subtle">${t('manualOverridesRule')}</p>
            </div>
          </div>

          <div class="card">
            <div class="card-head"><h3>${t('dateAgeing')}</h3></div>
            <div class="card-body" style="padding:0">
              <div class="table-wrap"><table>
                <thead><tr><th>${t('colItem')}</th><th class="num">${t('colElapsed')}</th><th>${t('colExpected')}</th></tr></thead>
                <tbody>${k.stale.map(s => `<tr>
                  <td>${esc(s.field.label.replace(/ tarihi$/, '').replace(/^Date of /, ''))}</td>
                  <td class="num">${s.months === null ? '—' : fmtInt(s.months) + ' ' + t('monthsShort')}</td>
                  <td>${s.months === null ? `<span class="chip chip-na">${t('noDateEntered')}</span>`
                    : s.overdue ? `<span class="chip chip-critical">${Icons.alert()} ${t('exceededMonths', { n: s.field.staleMonths })}</span>`
                    : `<span class="chip chip-ok">${t('withinMonths', { n: s.field.staleMonths })}</span>`}</td>
                </tr>`).join('')}</tbody>
              </table></div>
            </div>
          </div>
        </div>
      </div>`;

    host.addEventListener('change', e => {
      const f = e.target.closest('[data-kunye]');
      if (!f) return;
      Store.update(s => { s.kunye[f.dataset.kunye] = f.value; });
    });
    host.addEventListener('input', e => {
      const f = e.target.closest('input[data-kunye]');
      if (!f) return;
      Store.update(s => { s.kunye[f.dataset.kunye] = f.value; }, { silent: true });
    });
    // Sayı ve metin alanlarında yazma bitince türetilenleri tazele
    host.addEventListener('blur', e => {
      if (e.target.closest('input[data-kunye]')) App.rerender();
    }, true);
  }

  /* =========================================================
     DOĞUŞTAN RİSK
     ========================================================= */
  const inhUI = { editWeights: false, showAnchors: false, only: '' };

  const scoreLabels = () => [t('scoreVeryLow'), t('scoreLow'), t('scoreMedium'), t('scoreHigh'), t('scoreVeryHigh')];

  function scoreClass(n) {
    return ['lvl-dusuk', 'lvl-dusuk', 'lvl-orta', 'lvl-yuksek', 'lvl-cok-yuksek'][n - 1] || 'lvl-none';
  }

  /** Skor önerisi: önce portföy tabloları, yoksa künyedeki sayılar. */
  function factorHint(f, state, calc) {
    const fromPortfolio = calc && calc.portfolio && calc.portfolio.hints[f.key];
    if (fromPortfolio) return fromPortfolio;
    if (!f.hint) return null;
    const num = Number(state.kunye[f.hint.num]);
    const den = Number(state.kunye[f.hint.den]);
    if (!Number.isFinite(num) || !Number.isFinite(den) || den <= 0) return null;
    const pct = (num / den) * 100;
    const suggested = f.hint.bands.findIndex(b => pct < b) + 1 || 5;
    return { pct, suggested, label: f.hint.label, source: 'kunye' };
  }

  function inherentView(host, { state, calc }) {
    const inh = calc.inherent;
    const byDim = {};
    inh.factors.forEach(x => { (byDim[x.f.dimKey] = byDim[x.f.dimKey] || []).push(x); });

    const dimCards = Calc.DIMS
      .filter(dimKey => !inhUI.only || inhUI.only === dimKey)
      .map(dimKey => dimCard(dimKey, byDim[dimKey] || [], inh.dims[dimKey], state, calc))
      .join('');

    host.innerHTML = `
      ${inherentBanners(inh)}

      <div class="grid grid-kpi" style="margin-bottom:16px">
        ${Calc.DIMS.map(dimKey => {
          const d = inh.dims[dimKey];
          return statTile({
            label: I18n.dim(dimKey),
            value: d.measured ? fmtNum2(d.value) : '—', unit: '/5',
            tone: !d.measured ? '' : d.value >= 3 ? 'danger' : d.value >= 2 ? 'warn' : 'ok',
            foot: `${d.measured ? esc(I18n.ref('riskLevel', d.level)) : t('notMeasured')} · ${d.scored}/${d.applicable} ${t('factor')}${d.na ? ` · ${d.na} N/A` : ''}`
              + meter(d.coverage)
          });
        }).join('')}
        ${statTile({
          label: I18n.dim('GENEL'), value: inh.measured ? fmtNum2(inh.general) : '—', unit: '/5',
          tone: !inh.measured ? '' : inh.general >= 3 ? 'danger' : inh.general >= 2 ? 'warn' : 'ok',
          foot: `${inh.measured ? esc(I18n.ref('riskLevel', inh.dims.GENEL.level)) : t('notMeasured')} · ${t('inhMethod2').replace(/<[^>]+>/g, '')}`
        })}
      </div>

      <div class="toolbar no-print">
        <div class="field">
          <label for="inh-only">${t('dimension')}</label>
          <select id="inh-only" data-inh-only>
            <option value="">${t('all')} (${inh.total} ${t('factor')})</option>
            ${Calc.DIMS.map(d => `<option value="${esc(d)}"${inhUI.only === d ? ' selected' : ''}>${esc(I18n.dim(d))} (${(byDim[d] || []).length})</option>`).join('')}
          </select>
        </div>
        <div class="toolbar-actions">
          <button class="btn" data-inh-anchors aria-pressed="${inhUI.showAnchors}">
            ${Icons.info()} ${inhUI.showAnchors ? t('anchorsOff') : t('anchorsOn')}
          </button>
          <button class="btn" data-inh-weights aria-pressed="${inhUI.editWeights}">
            ${Icons.edit()} ${inhUI.editWeights ? t('lockWeights') : t('editWeights')}
          </button>
          ${Object.keys(state.inherentWeights || {}).length
            ? `<button class="btn btn-danger" data-inh-resetw>${Icons.reset()} ${t('defaultWeights')}</button>` : ''}
        </div>
      </div>

      ${driversCard(inh)}
      <div class="grid grid-dims">${dimCards}</div>
      ${methodCard()}`;

    bindInherent(host);
  }

  function inherentBanners(inh) {
    const out = [];
    if (!inh.measured) {
      out.push(banner('info', t('bnInhIntroTtl'), t('bnInhIntroBody')));
    } else if (inh.pending > 0) {
      out.push(banner('warn', t('bnInhPendTtl2', { n: inh.pending }), t('bnInhPendBody2')));
    }
    if (inh.missingNotes > 0) {
      out.push(banner('danger', t('bnInhNotesTtl', { n: inh.missingNotes }), t('bnInhNotesBody')));
    }
    return out.join('');
  }

  function driversCard(inh) {
    const top = inh.drivers.slice(0, 8);
    if (!top.length) return '';
    const max = top[0].weighted || 1;
    return `<div class="card" style="margin-bottom:16px">
      <div class="card-head"><h2>${t('driversTitle')}</h2>
        <span class="subtle">${t('driversSub')}</span></div>
      <div class="card-body">
        <div class="funnel">
          ${top.map(d => `<div class="funnel-step">
            <div>
              <div style="display:flex;gap:8px;align-items:baseline;margin-bottom:4px">
                <span class="chip">${esc(d.dim)}</span>
                <span style="flex:1">${esc(d.factor)}</span>
              </div>
              <div class="funnel-bar" style="width:${Math.max(6, (d.weighted / max) * 100)}%">
                ${fmtNum1(d.weighted)}
              </div>
            </div>
            <div class="right nowrap">
              <span class="chip ${scoreClass(d.score)}">${d.score} · ${esc(scoreLabels()[d.score - 1])}</span>
              <div class="subtle">${t('weight').toLocaleLowerCase(I18n.locale)} ${fmtNum1(d.weight)}</div>
            </div>
          </div>`).join('')}
        </div>
      </div>
    </div>`;
  }

  function dimCard(dimKey, items, d, state, calc) {
    const domains = (DATA.dimDomains || {})[dimKey] || [];
    return `<div class="card">
      <div class="card-head">
        <div style="flex:1;min-width:160px">
          <h3>${esc(I18n.dim(dimKey))}</h3>
          <div class="subtle">${t('feedsDomains')}: ${domains.map(esc).join(' · ') || '—'}</div>
        </div>
        ${d.measured ? `<span class="chip ${levelClass(d.level)}">${esc(I18n.ref('riskLevel', d.level))}</span>
          <b class="num">${fmtNum2(d.value)}</b><span class="subtle">/5</span>`
          : `<span class="chip chip-na">${t('notMeasured')}</span>`}
      </div>
      <div class="card-body" style="padding:0">
        ${items.map(({ f, st }) => factorRow(f, st, state, calc)).join('')}
      </div>
      <div class="card-head" style="border-top:1px solid var(--border-soft);border-bottom:0">
        <span class="subtle" style="flex:1">${d.scored}/${d.applicable} ${t('factorsScored')}${d.na ? ` · ${d.na} ${t('naCount')}` : ''}</span>
        ${meter(d.coverage, d.complete ? 'ok' : '')}
      </div>
    </div>`;
  }

  function factorRow(f, st, state, calc) {
    const idx = DATA.inherentFactors.indexOf(f);
    const hint = factorHint(f, state, calc);
    const anchorText = st.score ? f.anchors[st.score - 1] : null;

    const buttons = [1, 2, 3, 4, 5].map(n => `
      <button type="button" class="answer-btn score-btn" data-inh-score="${esc(st.key)}" data-n="${n}"
        aria-pressed="${st.score === n}" ${st.na ? 'disabled' : ''}
        title="${esc(n + ' — ' + scoreLabels()[n - 1] + ': ' + f.anchors[n - 1])}"
        aria-label="${esc(f.factor)} — ${n} ${esc(scoreLabels()[n - 1])}">
        <span class="score-n">${n}</span>
      </button>`).join('');

    return `<div class="factor ${st.na ? 'is-na' : ''} ${st.needsNote ? 'needs-note' : ''}" id="inh-row-${idx}">
      <div class="factor-main">
        <div class="factor-title">
          <span>${esc(f.factor)}</span>
          ${st.na ? `<span class="chip chip-na">${Icons.lock()} ${esc(st.manualNA ? t('notApplicable') : st.scopeReason)}</span>` : ''}
          ${st.weightOverridden ? `<span class="chip chip-mid">${t('weightChanged')}</span>` : ''}
          ${st.needsNote ? `<span class="chip chip-critical">${Icons.alert()} ${t('rationaleNeeded')}</span>` : ''}
        </div>
        <div class="subtle">${esc(f.why)}</div>
        ${hint && !st.na ? `<div class="factor-hint">
          ${Icons.info()}<span>${hint.source === 'portfolio' ? t('pfSourcePortfolio') : t('profileHint')}: <b>${esc(hint.label)} ${fmtPct1(hint.pct / 100)}</b> → ${t('suggestedScore')} <b>${hint.suggested}</b>
          ${st.score === hint.suggested ? `(${t('applied')})` : `<button class="btn btn-sm" data-inh-apply="${esc(st.key)}" data-n="${hint.suggested}">${t('apply')}</button>`}</span>
        </div>` : ''}
      </div>

      <div class="factor-score">
        <div class="scorebar" role="group" aria-label="${esc(f.factor)}">
          ${buttons}
          <button type="button" class="answer-btn na-btn" data-inh-na="${esc(st.key)}"
            aria-pressed="${st.manualNA}" title="${t('naTitle')}">
            ${Icons.minus()}<span>${t('naShort')}</span>
          </button>
        </div>
        <div class="factor-calc">
          ${st.na ? `<span class="subtle">${t('excludedFromScoring')}</span>` : `
            <span class="subtle">${t('weight')}</span>
            ${inhUI.editWeights
              ? `<input type="number" min="0.5" max="10" step="0.5" class="w-input" id="inhw-${idx}"
                   data-inh-weight="${esc(st.key)}" value="${st.weight}" aria-label="${esc(f.factor)} — ${t('weight')}">`
              : `<b class="num">${fmtNum1(st.weight)}</b>`}
            <span class="subtle">· ${t('weighted')}</span>
            <b class="num">${st.weighted === null ? '—' : fmtNum1(st.weighted)}</b>`}
        </div>
      </div>

      ${st.na ? '' : `<div class="factor-anchors">
        ${anchorText ? `<div class="anchor-current"><b>${st.score} — ${esc(scoreLabels()[st.score - 1])}:</b> ${esc(anchorText)}</div>` : ''}
        <details class="anchor-details"${inhUI.showAnchors ? ' open' : ''}>
          <summary>${t('scoreGuide')}</summary>
          <ol class="anchor-list">
            ${f.anchors.map((a, i) => `<li class="${st.score === i + 1 ? 'is-current' : ''}">
              <span class="anchor-n ${scoreClass(i + 1)}">${i + 1}</span>${esc(a)}</li>`).join('')}
          </ol>
        </details>
      </div>`}

      ${st.na ? '' : `<div class="factor-note">
        <label for="inhn-${idx}">${st.score >= 4 ? t('rationaleReq') : t('rationaleLabel')}</label>
        <input type="text" id="inhn-${idx}" data-inh-note="${esc(st.key)}" value="${esc(st.note)}"
          placeholder="${t('rationalePh')}">
      </div>`}
    </div>`;
  }

  function methodCard() {
    return `<div class="card">
      <div class="card-head"><h2>${t('method')}</h2></div>
      <div class="card-body">
        <p>${t('inhMethod1')}</p>
        <p>${t('inhMethod2')}</p>
        <p>${t('inhMethod3')}</p>
        <div class="inline-list" style="margin:12px 0">
          <span class="chip lvl-cok-yuksek">${esc(I18n.ref('riskLevel', 'Çok Yüksek'))} ≥ ${fmtNum2(4)}</span>
          <span class="chip lvl-yuksek">${esc(I18n.ref('riskLevel', 'Yüksek'))} ≥ ${fmtNum2(3)}</span>
          <span class="chip lvl-orta">${esc(I18n.ref('riskLevel', 'Orta'))} ≥ ${fmtNum2(2)}</span>
          <span class="chip lvl-dusuk">${esc(I18n.ref('riskLevel', 'Düşük'))} &lt; ${fmtNum2(2)}</span>
        </div>
        <p class="subtle">${t('inhMethod4')}</p>
      </div>
    </div>`;
  }

  function bindInherent(host) {
    host.addEventListener('click', e => {
      const sc = e.target.closest('[data-inh-score]');
      if (sc) {
        const key = sc.dataset.inhScore, n = Number(sc.dataset.n);
        Store.update(s => {
          if (Number(s.inherent[key]) === n) delete s.inherent[key];
          else s.inherent[key] = n;
          delete s.inherentNA[key];
        });
        return;
      }
      const ap = e.target.closest('[data-inh-apply]');
      if (ap) {
        Store.update(s => { s.inherent[ap.dataset.inhApply] = Number(ap.dataset.n); });
        UI.toast(t('appliedToast'));
        return;
      }
      const na = e.target.closest('[data-inh-na]');
      if (na) {
        const key = na.dataset.inhNa;
        Store.update(s => {
          if (s.inherentNA[key]) delete s.inherentNA[key];
          else { s.inherentNA[key] = true; delete s.inherent[key]; }
        });
        return;
      }
      if (e.target.closest('[data-inh-anchors]')) { inhUI.showAnchors = !inhUI.showAnchors; App.rerender(); return; }
      if (e.target.closest('[data-inh-weights]')) { inhUI.editWeights = !inhUI.editWeights; App.rerender(); return; }
      const rw = e.target.closest('[data-inh-resetw]');
      if (rw) {
        UI.confirmDialog({
          title: t('resetWeightsTtl'),
          message: t('resetWeightsMsg'),
          confirmLabel: t('resetWeightsOk'), danger: true
        }).then(ok => { if (ok) Store.update(s => { s.inherentWeights = {}; }); });
      }
    });

    host.addEventListener('change', e => {
      const only = e.target.closest('[data-inh-only]');
      if (only) { inhUI.only = only.value; App.rerender(); return; }
      const w = e.target.closest('[data-inh-weight]');
      if (w) {
        const v = Number(w.value);
        Store.update(s => {
          const def = DATA.inherentFactors.find(f => f.key === w.dataset.inhWeight);
          if (!Number.isFinite(v) || v <= 0 || (def && v === def.weight)) delete s.inherentWeights[w.dataset.inhWeight];
          else s.inherentWeights[w.dataset.inhWeight] = v;
        });
      }
    });

    host.addEventListener('input', e => {
      const n = e.target.closest('[data-inh-note]');
      if (!n) return;
      const key = n.dataset.inhNote;
      Store.update(s => {
        if (n.value.trim()) s.inherentNotes[key] = n.value;
        else delete s.inherentNotes[key];
      }, { silent: true });
      // Gerekçe uyarısı anında düşsün; tam yeniden çizim gerekmez.
      const row = n.closest('.factor');
      if (row && row.classList.contains('needs-note') && n.value.trim()) {
        row.classList.remove('needs-note');
        const chip = row.querySelector('.chip-critical');
        if (chip) chip.remove();
      }
    });
  }

  /* =========================================================
     ANKET (SORU BANKASI)
     ========================================================= */
  const qFilter = { domain: '', section: '', crit: '', status: '', qa: '', q: '' };

  function questions(host, ctx) {
    const { state, calc } = ctx;

    const sections = qFilter.domain
      ? [...new Map(DATA.questions.filter(q => q.domain === qFilter.domain)
          .map(q => [q.sectionKey, { key: q.sectionKey, label: q.section }])).values()]
      : [];

    host.innerHTML = `
      <div class="toolbar no-print">
        <div class="field grow">
          <label for="f-q">${t('searchQuestions')}</label>
          <input type="text" id="f-q" data-f="q" value="${esc(qFilter.q)}" placeholder="${t('searchPh')}">
        </div>
        <div class="field">
          <label for="f-domain">${t('domain')}</label>
          <select id="f-domain" data-f="domain">
            <option value="">${t('all')} (${DATA.questions.length})</option>
            ${DATA.domains.map(d => {
              const n = DATA.questions.filter(q => q.domain === d.code).length;
              return `<option value="${d.code}"${qFilter.domain === d.code ? ' selected' : ''}>${esc(d.code)} — ${esc(d.name)} (${n})</option>`;
            }).join('')}
          </select>
        </div>
        <div class="field">
          <label for="f-section">${t('section')}</label>
          <select id="f-section" data-f="section" ${sections.length ? '' : 'disabled'}>
            <option value="">${t('all')}</option>
            ${sections.map(sec => `<option value="${esc(sec.key)}"${qFilter.section === sec.key ? ' selected' : ''}>${esc(sec.label)}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label for="f-crit">${t('criticality')}</label>
          <select id="f-crit" data-f="crit">
            <option value="">${t('all')}</option>
            ${['Kritik', 'Yüksek', 'Orta'].map(c => `<option value="${c}"${qFilter.crit === c ? ' selected' : ''}>${esc(I18n.ref('crit', c))}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label for="f-status">${t('filterStatus')}</label>
          <select id="f-status" data-f="status">
            <option value="">${t('all')}</option>
            <option value="unanswered"${qFilter.status === 'unanswered' ? ' selected' : ''}>${t('fltUnanswered')}</option>
            <option value="answered"${qFilter.status === 'answered' ? ' selected' : ''}>${t('fltAnswered')}</option>
            <option value="gap"${qFilter.status === 'gap' ? ' selected' : ''}>${t('fltGap')}</option>
            <option value="opencrit"${qFilter.status === 'opencrit' ? ' selected' : ''}>${t('fltOpenCrit')}</option>
            <option value="noevidence"${qFilter.status === 'noevidence' ? ' selected' : ''}>${t('fltNoEvidence')}</option>
          </select>
        </div>
        <div class="field">
          <label for="f-qa">${t('qaTest')}</label>
          <select id="f-qa" data-f="qa">
            <option value="">${t('all')}</option>
            <option value="yes"${qFilter.qa === 'yes' ? ' selected' : ''}>${t('qaRequired')}</option>
            <option value="no"${qFilter.qa === 'no' ? ' selected' : ''}>${t('qaNotRequired')}</option>
          </select>
        </div>
        <div class="toolbar-actions">
          <button class="btn" data-clear>${Icons.reset()} ${t('clearFilters')}</button>
        </div>
      </div>

      <div id="q-summary" class="grid grid-kpi" style="margin-bottom:16px"></div>
      <div id="q-list"></div>`;

    renderQuestionList(host, ctx);

    host.addEventListener('input', e => {
      const f = e.target.closest('[data-f]');
      if (f && f.dataset.f === 'q') { qFilter.q = f.value; debounceList(host, ctx); return; }
      const ev = e.target.closest('[data-evidence], [data-note]');
      if (ev) {
        const id = ev.dataset.evidence || ev.dataset.note;
        const field = ev.dataset.evidence ? 'evidence' : 'note';
        Store.update(s => {
          s.answers[id] = s.answers[id] || { a: '' };
          s.answers[id][field] = ev.value;
        }, { silent: true });
        if (field === 'evidence') {
          const card = ev.closest('.q');
          const badge = card && card.querySelector('[data-evidence-badge]');
          if (badge) badge.classList.toggle('hidden', Boolean(ev.value.trim()));
        }
      }
    });

    host.addEventListener('change', e => {
      const f = e.target.closest('[data-f]');
      if (!f || f.dataset.f === 'q') return;
      qFilter[f.dataset.f] = f.value;
      if (f.dataset.f === 'domain') qFilter.section = '';
      App.rerender();
    });

    host.addEventListener('click', e => {
      if (e.target.closest('[data-clear]')) {
        Object.keys(qFilter).forEach(k => qFilter[k] = '');
        App.rerender();
        return;
      }
      const ab = e.target.closest('[data-answer]');
      if (ab) {
        const id = ab.dataset.answer, val = ab.dataset.a;
        // Kaydırma konumu korunsun diye tüm liste değil, yalnızca ilgili kart yenilenir.
        Store.update(s => {
          s.answers[id] = s.answers[id] || {};
          s.answers[id].a = s.answers[id].a === val ? '' : val;
        }, { silent: true });
        const fresh = App.recompute();
        ctx.calc = fresh;
        const card = UI.el('#q-' + CSS.escape(id), host);
        if (card) {
          const q = DATA.questions.find(x => x.id === id);
          const tmp = document.createElement('div');
          tmp.innerHTML = questionCard(q, fresh);
          card.replaceWith(tmp.firstElementChild);
        }
        renderSummary(host, fresh);
        App.refreshChrome();
        return;
      }
      const act = e.target.closest('[data-mkaction]');
      if (act) { Actions.openForm(null, { questionId: act.dataset.mkaction }); }
    });
  }

  let listTimer = null;
  function debounceList(host, ctx) {
    clearTimeout(listTimer);
    listTimer = setTimeout(() => renderQuestionList(host, ctx), 180);
  }

  function filtered(calc) {
    const term = qFilter.q.trim().toLocaleLowerCase(I18n.locale);
    return DATA.questions.filter(q => {
      const s = calc.perQuestion[q.id];
      if (qFilter.domain && q.domain !== qFilter.domain) return false;
      if (qFilter.section && q.sectionKey !== qFilter.section) return false;
      if (qFilter.crit && q.critKey !== qFilter.crit) return false;
      if (qFilter.qa === 'yes' && !q.qa) return false;
      if (qFilter.qa === 'no' && q.qa) return false;
      if (qFilter.status === 'unanswered' && s.answered) return false;
      if (qFilter.status === 'answered' && !s.answered) return false;
      if (qFilter.status === 'gap' && (!s.actionNeeded || s.actionNeeded === 'Hayır')) return false;
      if (qFilter.status === 'opencrit' && !s.openCritical) return false;
      if (qFilter.status === 'noevidence') {
        const rec = Store.state.answers[q.id];
        if (!s.answered || (rec && rec.evidence && rec.evidence.trim())) return false;
      }
      if (term) {
        const hay = (q.id + ' ' + q.text + ' ' + q.evidence + ' ' + q.source + ' ' + q.section).toLocaleLowerCase(I18n.locale);
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }

  function renderQuestionList(host, ctx) {
    const { calc } = ctx;
    const list = filtered(calc);
    const container = UI.el('#q-list', host);

    renderSummary(host, calc, list);

    container.innerHTML = '';
    if (!list.length) {
      container.innerHTML = emptyState(t('noMatch'), t('noMatchBody'));
      return;
    }
    UI.chunkRender(container, list, q => questionCard(q, calc));
  }

  /** Filtrelenmiş seçim için özet kutuları. */
  function renderSummary(host, calc, list) {
    const summary = UI.el('#q-summary', host);
    if (!summary) return;
    const items = list || filtered(calc);

    let answered = 0, gaps = 0, openCrit = 0, appW = 0, earned = 0;
    items.forEach(q => {
      const s = calc.perQuestion[q.id];
      if (s.answered) answered += 1;
      if (s.actionNeeded && s.actionNeeded !== 'Hayır') gaps += 1;
      if (s.openCritical) openCrit += 1;
      appW += s.applicableWeight; earned += s.earned;
    });
    const eff = appW ? earned / appW : null;
    const list_ = items;

    summary.innerHTML = [
      statTile({ label: t('selectedQs'), value: fmtInt(list_.length), foot: t('ofNQuestions', { n: fmtInt(DATA.questions.length) }) }),
      statTile({ label: t('answered'), value: fmtInt(answered), foot: fmtPct(list_.length ? answered / list_.length : 0) + meter(list_.length ? answered / list_.length : 0) }),
      statTile({ label: t('selectionEff'), value: fmtPct1(eff), tone: eff === null ? '' : eff >= 0.75 ? 'ok' : eff >= 0.6 ? 'warn' : 'danger' }),
      statTile({ label: t('actionRequired'), value: fmtInt(gaps), tone: gaps ? 'warn' : 'ok', foot: t('openCriticalN', { n: fmtInt(openCrit) }) })
    ].join('');
  }

  const ANSWER_ICON = { 'Evet': Icons.check(), 'Kısmen': Icons.half(), 'Hayır': Icons.x(), 'Uygulanamaz': Icons.minus() };

  function questionCard(q, calc) {
    const s = calc.perQuestion[q.id];
    const rec = Store.state.answers[q.id] || {};
    const locked = s.autoNA;

    const answerBtns = DATA.ref.answers.map(a => `
      <button type="button" class="answer-btn" data-answer="${q.id}" data-a="${esc(a)}"
        aria-pressed="${s.answer === a}" ${locked ? 'disabled' : ''}>
        ${ANSWER_ICON[a]}<span>${esc(I18n.ref('answers', a))}</span>
      </button>`).join('');

    const missingEvidence = s.answered && !(rec.evidence || '').trim();

    return `<article class="q ${s.openCritical ? 'is-open-critical' : ''} ${locked ? 'is-locked' : ''}" id="q-${q.id}">
      <div class="q-head">
        <span class="q-id">${esc(q.id)}</span>
        <div class="q-main">
          <div class="q-text">${esc(q.text)}</div>
          <div class="q-meta">
            ${critChip(q.critKey)}
            <span class="chip">${t('weight')} ${q.weight}</span>
            <span class="chip">${esc(q.domain)} · ${esc(q.section)}</span>
            ${q.qa ? `<span class="chip chip-mid">${Icons.flask()} ${t('qaTest')}</span>` : ''}
            ${s.actionNeeded === 'EVET - ÖNCELİKLİ' ? `<span class="chip chip-critical">${Icons.alert()} ${t('priorityAction')}</span>`
              : s.actionNeeded === 'Evet' ? `<span class="chip chip-high">${t('actionNeeded')}</span>` : ''}
            ${locked ? `<span class="chip chip-na">${Icons.lock()} ${esc(s.scopeReason)}</span>` : ''}
            <span class="chip ${missingEvidence ? 'chip-high' : 'hidden'}" data-evidence-badge>${t('noEvidenceRef')}</span>
          </div>
          <div class="answers" role="group" aria-label="${t('answerFor', { id: esc(q.id) })}">${answerBtns}</div>
        </div>
      </div>
      <div class="q-detail">
        <div class="q-refs">
          <div><b>${t('expectedEvidence')}:</b> ${esc(q.evidence)}</div>
          <div><b>${t('source')}:</b> ${esc(q.source)}</div>
          ${q.pop ? `<div><b>${t('samplePopulation')}:</b> ${esc(q.pop)}</div>` : ''}
        </div>
        <div class="field-row">
          <div class="field" style="margin:0">
            <label for="ev-${q.id}">${t('evidenceRef')}</label>
            <input type="text" id="ev-${q.id}" data-evidence="${q.id}" value="${esc(rec.evidence || '')}"
              placeholder="${esc(q.evidence)} — ${t('evidencePhSuffix')}" aria-describedby="ev-${q.id}-h">
            <div class="help" id="ev-${q.id}-h">${t('evidenceHelp')}</div>
          </div>
          <div class="field" style="margin:0">
            <label for="nt-${q.id}">${t('findingNote')}</label>
            <input type="text" id="nt-${q.id}" data-note="${q.id}" value="${esc(rec.note || '')}"
              placeholder="${s.answer === 'Evet' ? t('findingPhYes') : t('findingPhNo')}"
              aria-describedby="nt-${q.id}-h">
            <div class="help" id="nt-${q.id}-h">${t('findingHelp')}</div>
          </div>
        </div>
        ${s.actionNeeded && s.actionNeeded !== 'Hayır'
          ? `<div><button class="btn btn-sm" data-mkaction="${q.id}">${Icons.plus()} ${t('createAction')}</button></div>` : ''}
      </div>
    </article>`;
  }

  /* =========================================================
     KONTROL SKORLARI
     ========================================================= */
  function domainScores(host, { calc }) {
    const tot = calc.totals;
    const rows = calc.domains.map(d => `
      <tr>
        <td><b class="mono">${esc(d.code)}</b></td>
        <td>${esc(d.name)}</td>
        <td class="num">${fmtInt(d.count)}</td>
        <td class="num">${fmtInt(d.answered)}</td>
        <td class="num">${fmtInt(d.na)}</td>
        <td class="num">${fmtNum1(d.applicableWeight)}</td>
        <td class="num">${fmtNum1(d.earned)}</td>
        <td class="num"><span class="heat-cell score-pill ${effClass(d.effectiveness)}">${fmtPct1(d.effectiveness)}</span></td>
        <td>${d.maturity ? `<span class="chip ${maturityClass(d.maturity)}">${esc(I18n.ref('maturity', d.maturity))}</span>` : '—'}</td>
        <td class="num">${d.openCritical ? `<b style="color:var(--danger)">${fmtInt(d.openCritical)}</b>` : '0'}</td>
        <td class="num">${fmtInt(d.actionsNeeded)}</td>
      </tr>`).join('');

    host.innerHTML = `
      ${banner('info', t('bnNoInputTtl'), t('bnNoInputBody'))}
      <div class="card">
        <div class="card-head"><h2>${t('ttlScores')}</h2>
          <span class="subtle">${t('scoreLegend')}</span></div>
        <div class="card-body" style="padding:0">
          <div class="table-wrap"><table>
            <thead><tr>
              <th>${t('colCode')}</th><th>${t('domain')}</th><th class="num">${t('colQuestions')}</th><th class="num">${t('colAnswers')}</th><th class="num">N/A</th>
              <th class="num">${t('colApplicableW')}</th><th class="num">${t('colEarned')}</th><th class="num">${t('colEffectiveness')}</th>
              <th>${t('maturityLabel')}</th><th class="num">${t('colOpenCrit')}</th><th class="num">${t('colActions')}</th>
            </tr></thead>
            <tbody>${rows}</tbody>
            <tfoot><tr>
              <td></td><td>${t('totalRow')}</td>
              <td class="num">${fmtInt(tot.count)}</td><td class="num">${fmtInt(tot.answered)}</td><td class="num">${fmtInt(tot.na)}</td>
              <td class="num">${fmtNum1(tot.applicableWeight)}</td><td class="num">${fmtNum1(tot.earned)}</td>
              <td class="num">${fmtPct1(tot.effectiveness)}</td><td>${esc(tot.maturity ? I18n.ref('maturity', tot.maturity) : '—')}</td>
              <td class="num">${fmtInt(tot.openCritical)}</td><td class="num">${fmtInt(tot.actionsNeeded)}</td>
            </tr></tfoot>
          </table></div>
        </div>
      </div>

      <div class="card">
        <div class="card-head"><h2>${t('maturityBands')}</h2></div>
        <div class="card-body">
          <div class="inline-list">
            <span class="chip chip-ok">${esc(I18n.ref('maturity', 'Gelişmiş'))} ≥ 90%</span>
            <span class="chip chip-mid">${esc(I18n.ref('maturity', 'Yeterli'))} ≥ 75%</span>
            <span class="chip chip-high">${esc(I18n.ref('maturity', 'Gelişime Açık'))} ≥ 60%</span>
            <span class="chip chip-high">${esc(I18n.ref('maturity', 'Zayıf'))} ≥ 40%</span>
            <span class="chip chip-critical">${esc(I18n.ref('maturity', 'Kritik Zayıf'))} &lt; 40%</span>
          </div>
        </div>
      </div>`;
  }

  function maturityClass(m) {
    return { 'Gelişmiş': 'chip-ok', 'Yeterli': 'chip-mid', 'Gelişime Açık': 'chip-high', 'Zayıf': 'chip-high', 'Kritik Zayıf': 'chip-critical' }[m] || 'chip';
  }

  /* =========================================================
     ARTIK RİSK
     ========================================================= */
  function residual(host, { calc }) {
    const rows = calc.residual.map(r => `
      <tr>
        <td><b class="mono">${esc(r.code)}</b></td>
        <td>${esc(r.name)}<div class="subtle">${t('inherentSource')}: ${esc(r.source)}</div></td>
        <td class="num">${fmtNum2(r.inherentRisk)}</td>
        <td class="num">${fmtPct1(r.effectiveness)}</td>
        <td class="num"><span class="heat-cell score-pill ${levelClass(r.level)}">${fmtNum2(r.residual)}</span></td>
        <td>${r.level ? `<span class="chip ${levelClass(r.level)}">${esc(I18n.ref('riskLevel', r.level))}</span>` : '—'}</td>
        <td class="num">${fmtNum1(r.appetite)}</td>
        <td>${r.breach === null ? '—' : r.breach
          ? `<span class="chip chip-critical">${Icons.alert()} ${t('breachAction')}</span>`
          : `<span class="chip chip-ok">${t('withinAppetiteFull')}</span>`}</td>
      </tr>`).join('');

    host.innerHTML = `
      ${calc.breaches > 0
        ? banner('danger', t('bnBreachTtl', { n: calc.breaches }), t('bnBreachBody'))
        : banner('info', t('heatmapFormula'), t('bnResidBody'))}
      <div class="card">
        <div class="card-head"><h2>${t('ttlResidual')}</h2></div>
        <div class="card-body" style="padding:0">
          <div class="table-wrap"><table>
            <thead><tr>
              <th>${t('colCode')}</th><th>${t('domain')}</th><th class="num">${t('colInherent')}</th><th class="num">${t('colEffectiveness')}</th>
              <th class="num">${t('colResidual')}</th><th>${t('level')}</th><th class="num">${t('colAppetiteLimit')}</th><th>${t('status')}</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table></div>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><h2>${t('residualBands')}</h2></div>
        <div class="card-body"><div class="inline-list">
          <span class="chip lvl-cok-yuksek">${esc(I18n.ref('riskLevel', 'Çok Yüksek'))} ≥ ${fmtNum2(3.5)}</span>
          <span class="chip lvl-yuksek">${esc(I18n.ref('riskLevel', 'Yüksek'))} ≥ ${fmtNum2(2.5)}</span>
          <span class="chip lvl-orta">${esc(I18n.ref('riskLevel', 'Orta'))} ≥ ${fmtNum2(1.5)}</span>
          <span class="chip lvl-dusuk">${esc(I18n.ref('riskLevel', 'Düşük'))} &lt; ${fmtNum2(1.5)}</span>
        </div></div>
      </div>`;
  }

  /* =========================================================
     QA ÖRNEKLEM PLANI
     ========================================================= */
  function qa(host, { calc }) {
    const rows = calc.qa.map((p, i) => `
      <tr>
        <td>${esc(p.pop)}<div class="subtle">${esc(p.focus)}</div></td>
        <td><span class="chip">${esc(p.domain)}</span></td>
        <td><span class="chip ${levelClass(p.riskKey)}">${esc(p.risk)}</span></td>
        <td style="width:150px">
          <div class="input-unit">
            <input type="number" min="0" step="1" inputmode="numeric" id="qa-vol-${i}" data-vol="${esc(p.pop)}"
              value="${p.volume === null ? '' : p.volume}" placeholder="0"
              aria-label="${esc(p.pop)} — ${t('colPeriodVol')}">
            <span class="unit-tag">${t('items')}</span>
          </div>
          ${p.volume !== null ? `<div class="subtle">${fmtInt(p.volume)} ${t('records')}</div>` : ''}
        </td>
        <td>${p.full
          ? `<span class="chip chip-critical">${t('fullCoverage')}</span><div class="subtle">${t('allTested')}</div>`
          : `${fmtInt(p.rate * 100)}% · ${t('atLeast')} ${fmtInt(p.min)}<div class="subtle">${t('whicheverLarger')}</div>`}</td>
        <td class="num"><b>${fmtInt(p.yearlySample)}</b></td>
        <td>${esc(p.freq)}<div class="subtle">${t('perYear', { n: p.tests })}</div></td>
        <td class="num">${fmtInt(p.perTest)}</td>
      </tr>`).join('');

    const covered = calc.qa.filter(p => p.volume !== null).length;

    host.innerHTML = `
      ${banner('info', t('bnQaTtl'), t('bnQaBody'))}
      <div class="grid grid-kpi" style="margin-bottom:16px">
        ${statTile({ label: t('qaPopulations'), value: fmtInt(calc.qa.length), foot: `${fmtInt(covered)} ${t('qaVolumeEntered')}` })}
        ${statTile({ label: t('qaTotalVolume'), value: fmtInt(calc.qaTotals.volume) })}
        ${statTile({ label: t('qaAnnualSample'), value: fmtInt(calc.qaTotals.yearlySample), foot: t('qaFilesToTest') })}
        ${statTile({ label: t('qaPerTest'), value: fmtInt(calc.qaTotals.perTest), foot: t('qaAllPops') })}
      </div>
      <div class="card">
        <div class="card-head"><h2>${t('qaTableTitle')}</h2></div>
        <div class="card-body" style="padding:0">
          <div class="table-wrap"><table>
            <thead><tr>
              <th>${t('colPopFocus')}</th><th>${t('domain')}</th><th>${t('colRisk')}</th><th>${t('colPeriodVol')}</th>
              <th>${t('colSampleRule')}</th><th class="num">${t('colAnnualSample')}</th><th>${t('colFrequency')}</th><th class="num">${t('colPerTest')}</th>
            </tr></thead>
            <tbody>${rows}</tbody>
            <tfoot><tr>
              <td>${t('total')}</td><td></td><td></td>
              <td class="num">${fmtInt(calc.qaTotals.volume)}</td><td></td>
              <td class="num">${fmtInt(calc.qaTotals.yearlySample)}</td><td></td>
              <td class="num">${fmtInt(calc.qaTotals.perTest)}</td>
            </tr></tfoot>
          </table></div>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><h2>${t('errorClasses')}</h2></div>
        <div class="card-body">
          <div class="table-wrap"><table>
            <thead><tr><th>${t('colClass')}</th><th>${t('colDefinition')}</th><th>${t('colClosureTime')}</th></tr></thead>
            <tbody>
              <tr><td>${critChip('Kritik')}</td><td>${t('errCritical')}</td><td>${t('slaCritical')}</td></tr>
              <tr><td>${critChip('Yüksek')}</td><td>${t('errHigh')}</td><td>${t('slaHigh')}</td></tr>
              <tr><td>${critChip('Orta')}</td><td>${t('errMedium')}</td><td>${t('slaMedium')}</td></tr>
              <tr><td>${critChip('Düşük')}</td><td>${t('errLow')}</td><td>${t('slaLow')}</td></tr>
            </tbody>
          </table></div>
          <p class="subtle" style="margin-top:12px">${t('stratNote')}</p>
        </div>
      </div>`;

    host.addEventListener('input', e => {
      const f = e.target.closest('[data-vol]');
      if (!f) return;
      Store.update(s => {
        const v = Number(f.value);
        if (f.value === '' || !Number.isFinite(v)) delete s.qaVolumes[f.dataset.vol];
        else s.qaVolumes[f.dataset.vol] = v;
      });
    });
  }

  return { dashboard, kunye, inherent: inherentView, questions, domainScores, residual, qa, banner, maturityClass };
})();
