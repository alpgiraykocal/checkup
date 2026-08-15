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
    // Gösterilen etkinlik, olgunluk ve artık riskle aynı kaynağa dayanmalı:
    // her yerde test ile düzeltilmiş değer esas alınır, beyan yanında verilir.
    const eff = tot.effectivenessTested;
    const effTone = eff === null ? '' : eff >= 0.75 ? 'ok' : eff >= 0.6 ? 'warn' : 'danger';
    const effDiffers = eff !== null && tot.effectiveness !== null && Math.abs(tot.effectiveness - eff) > 0.0005;

    /* Hiyerarşi: dört sonuç ölçümü öne çıkar (hero), ilerleme ve iş yükü
       ölçümleri onların altında daha sessiz bir satırda durur. Önceki tasarımda
       on kutu aynı ağırlıktaydı ve hiçbiri okunmuyordu. */
    const heroTiles = [
      statTile({
        hero: true,
        label: t('kpiEffectiveness'), value: fmtPct1(eff), tone: effTone,
        foot: (tot.maturity ? `${t('maturityLabel')}: <b>${esc(I18n.ref('maturity', tot.maturity))}</b>` : t('noAnswersYet'))
          + (effDiffers ? ` · ${t('colEffDeclared')} ${fmtPct1(tot.effectiveness)}` : '')
          + meter(eff, effTone === 'ok' ? 'ok' : effTone === 'warn' ? 'warn' : 'danger')
      }),
      statTile({
        hero: true,
        label: t('kpiInherent'), value: inh.measured ? fmtNum2(inh.general) : '—', unit: '/ 5',
        tone: !inh.measured ? '' : inh.general >= 3 ? 'danger' : inh.general >= 2 ? 'warn' : 'ok',
        foot: `${inh.measured ? esc(I18n.ref('riskLevel', inh.dims.GENEL.level)) : t('notMeasured')} · ${inh.scored}/${inh.applicable} ${t('factor')}${inh.na ? ` · ${inh.na} N/A` : ''}`
      }),
      statTile({
        hero: true,
        label: t('kpiResidual'), value: fmtNum2(calc.generalResidual), unit: '/ 5',
        tone: calc.generalResidual === null ? '' : calc.generalResidual >= 2.5 ? 'danger' : calc.generalResidual >= 1.5 ? 'warn' : 'ok',
        foot: calc.generalResidual === null ? t('effNotComputable') : esc(I18n.ref('riskLevel', Calc.residualLevel(calc.generalResidual)))
      }),
      statTile({
        hero: true,
        label: t('kpiWorstDomain'),
        value: calc.worstDomain ? fmtNum2(calc.worstDomain.residual) : '—', unit: '/ 5',
        tone: !calc.worstDomain ? '' : calc.worstDomain.breach ? 'danger' : calc.worstDomain.residual >= 1.5 ? 'warn' : 'ok',
        foot: calc.worstDomain
          ? `${esc(calc.worstDomain.code)} · ${esc(I18n.ref('riskLevel', calc.worstDomain.level))}`
          : t('effNotComputable')
      })
    ].join('');

    const tiles = [
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
    ].concat(calc.extra && calc.extra.totals.count ? [
      statTile({
        label: t('exEff'), value: fmtPct1(calc.extra.totals.effectivenessTested),
        tone: calc.extra.totals.effectivenessTested === null ? ''
          : calc.extra.totals.effectivenessTested >= 0.75 ? 'ok' : calc.extra.totals.effectivenessTested >= 0.6 ? 'warn' : 'danger',
        foot: `${fmtInt(calc.extra.totals.answered)}/${fmtInt(calc.extra.totals.count)} · ${t('exNotInMain')}`
          + meter(calc.extra.totals.progress)
      })
    ] : []).join('');

    const banners = [];
    // Veri kaybı en pahalı hata; hatırlatma diğer uyarıların önüne geçer.
    const bk = Store.backupStatus();
    if (bk.due) {
      const title = !bk.at ? t('bkTitleNever')
        : bk.since >= 25 ? t('bkTitleStale', { n: fmtInt(bk.since) })
        : t('bkTitleDays', { n: Math.floor(bk.days) });
      banners.push(`<div class="banner warn">${Icons.alert()}<div>
        <b>${esc(title)}</b><span>${esc(t('bkBody'))}</span>
        <button class="btn btn-sm btn-primary no-print" data-backup-now style="margin-top:8px">
          ${Icons.download()} ${t('bkAction')}</button></div></div>`);
    }
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
    if (calc.masksBreach) {
      banners.push(banner('warn', t('bnMasksTtl'),
        t('bnMasksBody', { g: fmtNum2(calc.generalResidual), d: calc.worstDomain.code, r: fmtNum2(calc.worstDomain.residual) })));
    }
    if (calc.qa2.conflicts.length) {
      banners.push(banner('danger', t('bnQaConflictTtl', { n: calc.qa2.conflicts.length }), t('bnQaConflictBody')));
    }

    /* Hiç veri yokken sonuç bölümleri yalnızca boş kutu gösterir; bunun
       yerine başlangıç kartı ve kılavuz öne çıkar. */
    const hasWork = tot.answered > 0 || inh.scored > 0 || calc.kunye.filled > 0;

    host.innerHTML = `
      ${banners.join('')}
      ${startCard(state, calc)}
      ${hasWork ? `<div class="grid grid-hero">${heroTiles}</div>
      <div class="grid grid-kpi" style="margin-top:var(--s3)">${tiles}</div>

      <div class="card">
        <div class="card-head"><h2>${t('heatmapTitle')}</h2>
          <span class="subtle">${t('heatmapFormula')}</span></div>
        <div class="card-body">
          ${heatmap(calc)}
        </div>
      </div>

      <div class="card">
        <div class="card-head"><h2>${t('inherentDims')}</h2>
          <span class="subtle">${t('inherentDimsSub')}</span></div>
        <div class="card-body"><div class="grid grid-2">${inherentBars(calc)}</div></div>
      </div>

      <div class="card">
        <div class="card-head"><h2>${t('kpiSectionTitle')}</h2>
          <span class="subtle">${t('kpiSectionSub')}</span></div>
        <div class="card-body flush">${kpiTable(state, calc)}</div>
      </div>`
      : `<div class="card">
        <div class="card-head">
          <div style="flex:1;min-width:220px">
            <h2>${t('gdIntroTtl')}</h2>
            <div class="subtle">${esc(t('gdIntroBody'))}</div>
          </div>
          <button class="btn" data-route="nasil">${Icons.info()} ${t('navGuide')}</button>
        </div>
        <div class="card-body">
          <ul class="formula-list">
            <li>${esc(t('gdF3'))}</li>
            <li>${esc(t('gdF4'))}</li>
          </ul>
          <p class="subtle" style="margin-top:10px">${esc(t('emptyDashNote'))}</p>
        </div>
      </div>`}
    `;

    host.addEventListener('click', e => {
      if (e.target.closest('[data-backup-now]')) { Exporter.saveJSON(); return; }
      if (e.target.closest('[data-goto-last]')) {
        const id = Store.state.ui.lastQuestion;
        Object.keys(qFilter).forEach(k => qFilter[k] = '');
        App.go('anket');
        setTimeout(() => {
          const card = document.getElementById('q-' + id);
          if (card) { card.classList.add('is-active'); card.scrollIntoView({ block: 'center' }); }
        }, 60);
      }
    });

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

  /** Boşken adım adım başlangıç, doluyken kaldığı yere dönüş. */
  function startCard(state, calc) {
    const tot = calc.totals, inh = calc.inherent, k = calc.kunye, pf = calc.portfolio;
    const steps = [
      { id: 'kunye', route: 'kunye', done: k.missingRequired.length === 0 && k.filled > 6,
        label: t('navKunye'), desc: t('stepKunye') },
      { id: 'portfoy', route: 'portfoy', done: pf && pf.sectionsFilled >= 2,
        label: t('navPortfolio'), desc: t('stepPortfolio') },
      { id: 'dogustan', route: 'dogustan', done: inh.complete,
        label: t('navInherent'), desc: t('stepInherent'),
        progress: inh.applicable ? inh.scored / inh.applicable : 0 },
      { id: 'anket', route: 'anket', done: tot.answered === tot.count,
        label: t('navSurvey'), desc: t('stepSurvey'), progress: tot.progress },
      { id: 'aksiyon', route: 'aksiyon', done: calc.actionStats.total > 0 && calc.actionStats.open === 0,
        label: t('navActions'), desc: t('stepActions') }
    ];
    const next = steps.find(s => !s.done) || steps[steps.length - 1];
    const fresh = tot.answered === 0 && !inh.scored && k.filled === 0;

    /* Boş çalışmada beş adım tek tek anlatılır. İş başladıktan sonra bu liste
       ekranın en büyük bloğu olup en az bilgiyi taşıyordu; yerini tek satırlık
       adım şeridi alır. */
    if (!fresh) {
      return `<div class="card start-card">
        <div class="card-body resume">
          <div class="resume-main">
            <div class="subtle">${t('continueTitle')}</div>
            <h2>${esc(next.label)}</h2>
            <div class="subtle">${esc(next.desc)}</div>
          </div>
          <ol class="step-strip" aria-label="${t('continueTitle')}">
            ${steps.map((s, i) => `<li>
              <button class="step-dot ${s.done ? 'is-done' : ''} ${s === next ? 'is-next' : ''}"
                data-route="${s.route}" title="${esc(s.label)}" aria-label="${esc(s.label)}">
                ${s.done ? Icons.check() : i + 1}
              </button>
            </li>`).join('')}
          </ol>
          <div class="resume-actions">
            ${state.ui.lastQuestion && tot.answered > 0
              ? `<button class="btn" data-goto-last>${Icons.list()} ${t('continueLast', { id: esc(state.ui.lastQuestion) })}</button>` : ''}
            <button class="btn btn-primary" data-route="${next.route}">${t('continueGo', { s: next.label })}</button>
          </div>
        </div>
      </div>`;
    }

    return `<div class="card start-card">
      <div class="card-head">
        <div style="flex:1;min-width:200px">
          <h2>${t('startTitle')}</h2>
          <div class="subtle">${t('startBody')}</div>
        </div>
        <button class="btn btn-primary" data-route="${next.route}">${t('continueGo', { s: next.label })}</button>
      </div>
      <div class="card-body">
        <ol class="steps">
          ${steps.map((s, i) => `<li class="step ${s.done ? 'is-done' : ''} ${s === next ? 'is-next' : ''}">
            <span class="step-no">${s.done ? Icons.check() : i + 1}</span>
            <button class="step-main" data-route="${s.route}">
              <b>${esc(s.label)}</b>
              <span class="subtle">${esc(s.desc)}</span>
              ${s.progress !== undefined && s.progress > 0 && s.progress < 1
                ? meter(s.progress) + `<span class="subtle">${fmtPct(s.progress)}</span>` : ''}
            </button>
          </li>`).join('')}
        </ol>
      </div>
    </div>`;
  }

  /* Her uyarı türü ayrı ikon taşır: yalnızca renkle ayırmak renk körlüğünde
     ve gri tonlu çıktıda bilgiyi yok ediyordu. */
  function banner(kind, title, msg) {
    const icon = kind === 'danger' ? Icons.alert() : kind === 'warn' ? Icons.flag() : Icons.info();
    return `<div class="banner ${kind === 'info' ? '' : kind}">${icon}<div><b>${esc(title)}</b><span>${esc(msg)}</span></div></div>`;
  }

  function heatmap(calc) {
    const byCode = Object.fromEntries(calc.domains.map(d => [d.code, d]));
    const rows = calc.residual.map(r => {
      const d = byCode[r.code];
      // Olgunluk ve artık risk test ile düzeltilmiş etkinlikten türüyor; sütun da onu gösterir.
      const eff = d.effectivenessTested;
      const declared = d.effectiveness;
      const differs = eff !== null && declared !== null && Math.abs(declared - eff) > 0.0005;
      return `<div class="heat-row">
        <div class="heat-name"><a class="heat-link" href="#/anket?d=${esc(r.code)}"><b class="mono">${esc(r.code)}</b> ${esc(r.name)}</a>
          <div class="subtle">${fmtInt(d.answered)}/${fmtInt(d.count)} ${t('colAnswers').toLocaleLowerCase(I18n.locale)}${d.na ? ` · ${fmtInt(d.na)} N/A` : ''}</div></div>
        <div class="heat-eff-bar">${meter(eff === null ? 0 : eff, eff === null ? '' : eff >= 0.75 ? 'ok' : eff >= 0.6 ? 'warn' : 'danger')}
          <div class="subtle">${esc(d.maturity ? I18n.ref('maturity', d.maturity) : t('awaitingAnswers'))}${differs ? ` · ${t('colEffDeclared')} ${fmtPct(declared)}` : ''}</div></div>
        <div class="heat-cell ${effClass(eff)}" title="${t('colEffTested')}">${fmtPct(eff)}</div>
        <div class="heat-cell ${levelClass(r.level)}" title="${t('colResidual')}">${fmtNum2(r.residual)}</div>
        <div class="heat-cell ${r.breach ? 'lvl-cok-yuksek' : r.breach === false ? 'lvl-dusuk' : 'lvl-none'}" title="${t('colAppetiteLimit')} ${fmtNum1(r.appetite)}">
          ${r.breach === null ? '—' : r.breach ? t('breach') : t('withinAppetite')}</div>
      </div>`;
    }).join('');

    return `<div role="table" aria-label="${t('heatmapTitle')}">
      <div class="heat-row head" role="row">
        <div>${t('domain')}</div><div class="heat-eff-bar">${t('maturityLabel')}</div>
        <div class="center">${t('colEffTested')}</div><div class="center">${t('colResidual')}</div><div class="center">${t('colAppetite')}</div>
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

    // Kayıt anahtarı her zaman k.key (Türkçe sabit); k.name dile göre değişir.
    const rows = DATA.kpis.map((k, i) => {
      const rec = state.kpis[k.key] || {};
      const auto = Calc.autoKpi(k, state, {
        closureRate: calc.actionStats.closureRate,
        opsKpi: calc.operations ? calc.operations.kpi : null
      });
      const fromOps = Boolean(calc.operations && calc.operations.kpi[k.key] !== undefined);
      // Otomatik gelen her değer okunur biçimde gösterilir; boş kutu bırakılmaz
      const isAuto = Boolean(k.auto) || fromOps;
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
          <div class="subtle">${t('source')}: ${esc(
             fromOps ? t('kpiFromOps') : k.auto ? t('kpiAutoSource') : k.source)} · ${dirHint}</div>
        </td>
        <td style="width:120px">
          <div class="input-unit">
            <input type="text" inputmode="decimal" id="kpi-t-${i}" data-kpi="${esc(k.key)}" data-field="target"
              value="${esc(rec.target || '')}" placeholder="${esc(k.placeholder || 'hedef')}"
              aria-label="${esc(k.name)} — ${t('kpiTarget')}" title="${t('kpiExampleTarget')}: ${esc(k.placeholder || '')} ${esc(k.unit)}">
            <span class="unit-tag">${esc(k.unit)}</span>
          </div>
        </td>
        <td style="width:120px">
          ${isAuto && manual === null
            ? `<div class="auto-value" title="${t('kpiAutoTitle')}">
                 <b class="num">${auto === null ? '—' : fmtInt(auto)}</b> <span class="subtle">${esc(k.unit)}</span>
                 <div class="subtle">${fromOps ? t('kpiFromOpsShort') : t('kpiAuto')}</div>
               </div>`
            : `<div class="input-unit">
                 <input type="text" inputmode="decimal" id="kpi-v-${i}" data-kpi="${esc(k.key)}" data-field="value"
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
      // Görünen ad yerine sabit anahtarla eşleştir
      const fields = DATA.kunyeFields.filter(f => f.groupKey === g.key);
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

      <div class="grid grid-kpi">
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
                    // sec bir bölüm anahtarıdır; q.section görünen ad olduğu için
                    // İngilizcede eşleşmiyor ve sayı 0 çıkıyordu.
                    const n = DATA.questions.filter(q => q.domain === dom && q.sectionKey === sec).length;
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
            <div class="card-body flush">
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
    const fromOps = calc && calc.operations && calc.operations.hints[f.key];
    if (fromOps) return fromOps;
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

      <div class="grid grid-kpi">
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
      ${pfCard(state, calc)}
      ${linesCard(state, calc)}
      ${methodOption(state, calc)}
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
    return `<div class="card">
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
      <div class="card-body flush">
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
          ${Icons.info()}<span>${hint.source === 'operations' ? t('opSourceOps')
             : hint.source === 'portfolio' ? t('pfSourcePortfolio') : t('profileHint')}: <b>${esc(hint.label)} ${fmtPct1(hint.pct / 100)}</b> → ${t('suggestedScore')} <b>${hint.suggested}</b>
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

  /* ---------- Yayılmanın finansmanı (PF) ---------- */

  function pfCard(state, calc) {
    const pf = calc.pf, spec = RISKMODEL.pf;
    const note = I18n.isEn ? spec.enNote : spec.trNote;

    const rows = pf.factors.map((f, i) => {
      const s = f.spec;
      const anchors = I18n.isEn ? (s.anchorsEn || s.anchors) : s.anchors;
      const why = I18n.isEn ? (s.enWhy || s.trWhy) : s.trWhy;
      const cur = f.score ? anchors[f.score - 1] : null;
      return `<div class="factor ${f.na ? 'is-na' : ''} ${f.needsNote ? 'needs-note' : ''}">
        <div class="factor-main">
          <div class="factor-title">
            <span>${esc(I18n.isEn ? s.en : s.tr)}</span>
            ${f.na ? `<span class="chip chip-na">${Icons.lock()} ${f.autoNA ? t('opOutOfScope') : t('notApplicable')}</span>` : ''}
            ${f.needsNote ? `<span class="chip chip-critical">${Icons.alert()} ${t('rationaleNeeded')}</span>` : ''}
          </div>
          <div class="subtle">${esc(why)}</div>
        </div>
        <div class="factor-score">
          <div class="scorebar" role="group" aria-label="${esc(I18n.isEn ? s.en : s.tr)}">
            ${[1, 2, 3, 4, 5].map(n => `<button type="button" class="answer-btn score-btn"
              data-pf-score="${esc(s.key)}" data-n="${n}" aria-pressed="${f.score === n}" ${f.na ? 'disabled' : ''}
              title="${esc(n + ' — ' + scoreLabels()[n - 1] + ': ' + anchors[n - 1])}">
              <span class="score-n">${n}</span></button>`).join('')}
            <button type="button" class="answer-btn na-btn" data-pf-na="${esc(s.key)}"
              aria-pressed="${!f.autoNA && f.na}" title="${t('naTitle')}">${Icons.minus()}<span>${t('naShort')}</span></button>
          </div>
          <div class="factor-calc"><span class="subtle">${t('weight')}</span><b class="num">${s.weight}</b></div>
        </div>
        ${f.na ? '' : `<div class="factor-anchors">
          ${cur ? `<div class="anchor-current"><b>${f.score} — ${esc(scoreLabels()[f.score - 1])}:</b> ${esc(cur)}</div>` : ''}
          <details class="anchor-details"><summary>${t('scoreGuide')}</summary>
            <ol class="anchor-list">${anchors.map((a, j) => `<li class="${f.score === j + 1 ? 'is-current' : ''}">
              <span class="anchor-n ${scoreClass(j + 1)}">${j + 1}</span>${esc(a)}</li>`).join('')}</ol>
          </details>
        </div>`}
        ${f.na ? '' : `<div class="factor-note">
          <label for="pfn-${i}">${f.score >= 4 ? t('rationaleReq') : t('rationaleLabel')}</label>
          <input type="text" id="pfn-${i}" data-pf-note="${esc(s.key)}" value="${esc(f.note)}" placeholder="${t('rationalePh')}">
        </div>`}
      </div>`;
    }).join('');

    return `<div class="card">
      <div class="card-head">
        <div style="flex:1;min-width:220px">
          <h2>${esc(I18n.isEn ? spec.en : spec.tr)}</h2>
          <div class="subtle">${esc(note)}</div>
        </div>
        ${pf.measured ? `<span class="chip ${levelClass(pf.level)}">${esc(I18n.ref('riskLevel', pf.level))}</span>
          <b class="num">${fmtNum2(pf.value)}</b><span class="subtle">/5</span>`
          : `<span class="chip chip-na">${t('notMeasured')}</span>`}
        <span class="chip ${pf.complete ? 'chip-ok' : ''}">${pf.scored}/${pf.applicable}</span>
      </div>
      <div class="card-body flush">${rows}</div>
    </div>`;
  }

  /* ---------- İş kolu bazlı değerlendirme ---------- */

  function linesCard(state, calc) {
    const bl = calc.lines, spec = RISKMODEL.businessLines;
    const note = I18n.isEn ? spec.enNote : spec.trNote;

    const rows = bl.lines.map(l => {
      const s = l.spec;
      const rec = (state.lines || {})[s.key] || {};
      const dis = l.outOfScope;
      return `<tr class="${l.active ? '' : 'is-muted'}">
        <td style="min-width:200px">
          <label class="flag-chip ${l.active ? 'on chip-mid' : ''}" title="${esc(I18n.isEn ? s.en : s.tr)}">
            <input type="checkbox" data-line="${s.key}" data-field="active" ${l.active ? 'checked' : ''} ${dis ? 'disabled' : ''}
              aria-label="${esc(I18n.isEn ? s.en : s.tr)}">
            <span>${esc(I18n.isEn ? s.en : s.tr)}</span>
          </label>
          ${dis ? `<div class="subtle">${t('opOutOfScope')}</div>` : ''}
        </td>
        <td style="width:140px">
          <div class="input-unit">
            <input type="number" min="0" max="100" step="0.1" inputmode="decimal" id="ls-${s.key}"
              data-line="${s.key}" data-field="share" value="${rec.share ?? ''}" placeholder="0"
              ${l.active ? '' : 'disabled'} aria-label="${esc(I18n.isEn ? s.en : s.tr)} — ${t('blShare')}">
            <span class="unit-tag">%</span>
          </div>
        </td>
        ${spec.dims.map(d => `<td style="width:92px">
          <select data-line="${s.key}" data-dim="${esc(d)}" ${l.active ? '' : 'disabled'}
            aria-label="${esc(I18n.isEn ? s.en : s.tr)} — ${esc(I18n.dim(d))}">
            ${selectOptions(['1','2','3','4','5'], l.scores[d] ? String(l.scores[d]) : '', '—')}
          </select>
        </td>`).join('')}
        <td class="num">${l.inherent === null ? '—' : `<span class="heat-cell score-pill ${levelClass(Calc.riskLevel5(l.inherent))}">${fmtNum2(l.inherent)}</span>`}</td>
      </tr>`;
    }).join('');

    return `<div class="card">
      <div class="card-head">
        <div style="flex:1;min-width:220px">
          <h2>${t('blTitle')}</h2>
          <div class="subtle">${esc(note)}</div>
        </div>
        ${bl.weightedInherent !== null ? `<span class="chip ${levelClass(Calc.riskLevel5(bl.weightedInherent))}">${t('blWeighted')}</span>
          <b class="num">${fmtNum2(bl.weightedInherent)}</b><span class="subtle">/5</span>` : ''}
      </div>
      <div class="card-body flush">
        <div class="table-wrap"><table>
          <thead><tr>
            <th>${t('blLine')}</th><th>${t('blShare')}</th>
            ${spec.dims.map(d => `<th>${esc(I18n.dim(d))}</th>`).join('')}
            <th class="num">${t('blInherent')}</th>
          </tr></thead>
          <tbody>${rows}</tbody>
          <tfoot><tr>
            <td>${t('total')}</td>
            <td class="num ${bl.shareComplete ? '' : 'is-warn'}">${fmtNum1(bl.shareSum)}%</td>
            <td colspan="${spec.dims.length}">${bl.shareComplete ? '' : `<span class="subtle">${t('blShareWarn')}</span>`}</td>
            <td class="num">${fmtNum2(bl.weightedInherent)}</td>
          </tr></tfoot>
        </table></div>
      </div>
      ${bl.worst || calc.inherent.measured ? `<div class="card-body" style="border-top:1px solid var(--border-soft)">
        <div class="inline-list">
          ${bl.worst && bl.worst.inherent !== null ? `<span class="chip chip-high">${t('blWorst')}: ${esc(I18n.isEn ? bl.worst.spec.en : bl.worst.spec.tr)} ${fmtNum2(bl.worst.inherent)}</span>` : ''}
          ${calc.inherent.measured ? `<span class="chip">${t('blDimBased')} ${fmtNum2(calc.inherent.general)}</span>` : ''}
          ${bl.weightedInherent !== null && calc.inherent.measured
            ? `<span class="chip ${Math.abs(bl.weightedInherent - calc.inherent.general) >= 0.5 ? 'chip-high' : 'chip-ok'}">${t('blDelta')} ${fmtNum2(Math.abs(bl.weightedInherent - calc.inherent.general))}</span>` : ''}
        </div>
        ${bl.weightedInherent !== null && calc.inherent.measured && Math.abs(bl.weightedInherent - calc.inherent.general) >= 0.5
          ? `<p class="subtle" style="margin-top:8px">${t('blDeltaNote')}</p>` : ''}
      </div>` : ''}
    </div>`;
  }

  /** Skorlama yöntemi seçeneği — varsayılan kapalı, kararı kurum verir. */
  function methodOption(state, calc) {
    const m = calc.method || { weightByExposure: false, applied: false };
    return `<div class="card">
      <div class="card-head">
        <div style="flex:1;min-width:220px">
          <h2>${t('mtTitle')}</h2>
          <div class="subtle">${m.applied ? t('mtApplied') : t('mtDefault')}</div>
        </div>
      </div>
      <div class="card-body">
        <div class="flag-list" style="margin-bottom:12px">
          <label class="flag-chip ${m.weightByExposure ? '' : 'on chip-mid'}">
            <input type="radio" name="scoremethod" data-method="default" ${m.weightByExposure ? '' : 'checked'}>
            <span>${t('mtDefault')}</span>
          </label>
          <label class="flag-chip ${m.weightByExposure ? 'on chip-mid' : ''}">
            <input type="radio" name="scoremethod" data-method="exposure" ${m.weightByExposure ? 'checked' : ''}>
            <span>${t('mtExposure')}</span>
          </label>
        </div>
        <p class="subtle">${esc(m.weightByExposure ? t('mtExposureD') : t('mtDefaultD'))}</p>
        <p class="subtle">${esc(t('mtWarn'))}</p>
        ${m.weightByExposure && !m.applied ? Views.banner('warn', t('mtNoData'), t('mtExposureD')) : ''}
        ${m.applied && calc.exposureDims ? `<div class="table-wrap"><table>
          <thead><tr><th>${t('dimension')}</th><th class="num">${t('mtDefault')}</th><th class="num">${t('mtExposure')}</th></tr></thead>
          <tbody>${Calc.DIMS.map(d => `<tr>
            <td>${esc(I18n.dim(d))}</td>
            <td class="num">${fmtNum2(calc.inherent.dims[d].value)}</td>
            <td class="num"><b>${calc.exposureDims[d] ? fmtNum2(calc.exposureDims[d].value) : '—'}</b></td>
          </tr>`).join('')}</tbody>
        </table></div>` : ''}
      </div>
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
    host.addEventListener('blur', e => {
      if (e.target.closest('input[data-line][data-field="share"]')) App.rerender();
    }, true);
    host.addEventListener('click', e => {
      const sc = e.target.closest('[data-inh-score]');
      if (sc) {
        const key = sc.dataset.inhScore, n = Number(sc.dataset.n);
        const onceki = Store.state.inherent[key] ?? '';
        const sonraki = Number(onceki) === n ? '' : n;
        Store.update(s => {
          if (Number(s.inherent[key]) === n) delete s.inherent[key];
          else s.inherent[key] = n;
          delete s.inherentNA[key];
        }, { log: { what: 'inherent', ref: key, before: onceki, after: sonraki } });
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
        const naOnce = Store.state.inherentNA[key] ? 'Uygulanamaz' : (Store.state.inherent[key] ?? '');
        const naSonra = Store.state.inherentNA[key] ? '' : 'Uygulanamaz';
        Store.update(s => {
          if (s.inherentNA[key]) delete s.inherentNA[key];
          else { s.inherentNA[key] = true; delete s.inherent[key]; }
        }, { log: { what: 'inherent', ref: key, before: naOnce, after: naSonra } });
        return;
      }
      const mt = e.target.closest('[data-method]');
      if (mt) {
        const expo = mt.dataset.method === 'exposure';
        Store.update(s => { s.method = s.method || {}; s.method.weightByExposure = expo; },
          { log: { what: 'method', ref: 'weightByExposure',
                   before: String(Boolean(Store.state.method && Store.state.method.weightByExposure)),
                   after: String(expo) } });
        return;
      }
      const pfs = e.target.closest('[data-pf-score]');
      if (pfs) {
        const k = pfs.dataset.pfScore, n = Number(pfs.dataset.n);
        Store.update(s => {
          s.pf[k] = s.pf[k] || {};
          if (Number(s.pf[k].score) === n) delete s.pf[k].score; else s.pf[k].score = n;
          delete s.pf[k].na;
        });
        return;
      }
      const pfna = e.target.closest('[data-pf-na]');
      if (pfna) {
        const k = pfna.dataset.pfNa;
        Store.update(s => {
          s.pf[k] = s.pf[k] || {};
          if (s.pf[k].na) delete s.pf[k].na; else { s.pf[k].na = true; delete s.pf[k].score; }
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
      const lineDim = e.target.closest('select[data-line][data-dim]');
      if (lineDim) {
        Store.update(s => {
          const k = lineDim.dataset.line;
          s.lines[k] = s.lines[k] || {}; s.lines[k].dims = s.lines[k].dims || {};
          if (lineDim.value) s.lines[k].dims[lineDim.dataset.dim] = Number(lineDim.value);
          else delete s.lines[k].dims[lineDim.dataset.dim];
        });
        return;
      }
      const lineChk = e.target.closest('input[data-line][data-field="active"]');
      if (lineChk) {
        Store.update(s => {
          const k = lineChk.dataset.line;
          s.lines[k] = s.lines[k] || {};
          if (lineChk.checked) s.lines[k].active = true; else delete s.lines[k].active;
        });
        return;
      }
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
      const pfn = e.target.closest('[data-pf-note]');
      if (pfn) {
        Store.update(s => {
          const k = pfn.dataset.pfNote;
          s.pf[k] = s.pf[k] || {};
          if (pfn.value.trim()) s.pf[k].note = pfn.value; else delete s.pf[k].note;
        }, { silent: true });
        return;
      }
      const ls = e.target.closest('input[data-line][data-field="share"]');
      if (ls) {
        Store.update(s => {
          const k = ls.dataset.line;
          s.lines[k] = s.lines[k] || {};
          if (ls.value === '') delete s.lines[k].share; else s.lines[k].share = Number(ls.value);
        }, { silent: true });
        return;
      }
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

  /* Filtreler adres satırında taşınır: sayfa yenilenince seçim korunur ve
     "D2 aşımda" gibi bir bulgudan doğrudan ilgili sorulara link verilebilir. */
  const Q_PARAM = { domain: 'd', section: 'b', crit: 'k', status: 'st', qa: 'qa', q: 'ara' };

  function readFilterFromUrl() {
    const p = App.routeQuery();
    Object.keys(Q_PARAM).forEach(k => { qFilter[k] = p.get(Q_PARAM[k]) || ''; });
  }

  function writeFilterToUrl() {
    const p = new URLSearchParams();
    Object.keys(Q_PARAM).forEach(k => { if (qFilter[k]) p.set(Q_PARAM[k], qFilter[k]); });
    App.setRouteQuery(p);
  }

  function questions(host, ctx) {
    const { state, calc } = ctx;
    readFilterFromUrl();

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
            ${/* dil-güvenli: filtre değeri bölüm anahtarıdır */ sections.map(sec => `<option value="${esc(sec.key)}"${qFilter.section === sec.key ? ' selected' : ''}>${esc(sec.label)}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label for="f-crit">${t('criticality')}</label>
          <select id="f-crit" data-f="crit">
            <option value="">${t('all')}</option>
            ${/* dil-güvenli: filtre değeri kritiklik anahtarıdır */ ['Kritik', 'Yüksek', 'Orta'].map(c => `<option value="${c}"${qFilter.crit === c ? ' selected' : ''}>${esc(I18n.ref('crit', c))}</option>`).join('')}
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
            <option value="qapending"${qFilter.status === 'qapending' ? ' selected' : ''}>${t('fltQaPending')}</option>
            <option value="qaconflict"${qFilter.status === 'qaconflict' ? ' selected' : ''}>${t('fltQaConflict')}</option>
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
          <button class="btn" data-next-open>${Icons.arrowDown()} ${t('nextUnanswered')}</button>
          <button class="btn" data-clear>${Icons.reset()} ${t('clearFilters')}</button>
          <button class="btn btn-icon" data-kbd-help aria-label="${t('kbdTitle')}" title="${t('kbdTitle')}">${Icons.keyboard()}</button>
        </div>
      </div>

      ${state.ui.kbdHintSeen ? '' : `<div class="banner no-print" data-kbd-hint>${Icons.keyboard()}<div>
        <b>${t('qKbdHintTtl')}</b><span>${esc(t('qKbdHintBody'))}</span>
        <button class="btn btn-sm" data-kbd-dismiss style="margin-top:8px">${t('qKbdHintClose')}</button></div></div>`}

      <div id="q-summary" class="grid grid-kpi"></div>
      <div id="q-list"></div>
      <div class="q-fab no-print" id="q-fab" hidden>
        <button class="btn btn-sm" data-fab-top aria-label="${t('qFabTop')}" title="${t('qFabTop')}">${Icons.arrowDown()}</button>
        <button class="btn btn-primary btn-sm" data-next-open>${Icons.arrowDown()} ${t('nextUnanswered')}
          <span class="fab-count" id="q-fab-count"></span></button>
      </div>`;

    renderQuestionList(host, ctx);
    bindFab(host);

    // Klavye kısayolları yalnızca bu ekran açıkken bağlıdır
    document.addEventListener('keydown', onSurveyKey);
    host.addEventListener('view:teardown', () => document.removeEventListener('keydown', onSurveyKey));

    // Kaldığı soruya dön
    const last = state.ui.lastQuestion;
    if (last && !qFilter.q) {
      requestAnimationFrame(() => {
        const card = UI.el('#q-' + CSS.escape(last), host);
        if (card) { card.classList.add('is-active'); card.scrollIntoView({ block: 'center' }); }
      });
    }

    host.addEventListener('input', e => {
      const f = e.target.closest('[data-f]');
      if (f && f.dataset.f === 'q') { qFilter.q = f.value; writeFilterToUrl(); debounceList(host, ctx); return; }
      const qa = e.target.closest('[data-qa]');
      if (qa) {
        Store.update(s => {
          s.answers[qa.dataset.qa] = s.answers[qa.dataset.qa] || { a: '' };
          if (qa.value === '') delete s.answers[qa.dataset.qa][qa.dataset.field];
          else s.answers[qa.dataset.qa][qa.dataset.field] = qa.value;
        }, { silent: true });
        return;
      }
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
      const qa = e.target.closest('select[data-qa]');
      if (qa) {
        Store.update(s => {
          s.answers[qa.dataset.qa] = s.answers[qa.dataset.qa] || { a: '' };
          if (qa.value === '') delete s.answers[qa.dataset.qa][qa.dataset.field];
          else s.answers[qa.dataset.qa][qa.dataset.field] = qa.value;
        });
        return;
      }
      const f = e.target.closest('[data-f]');
      if (!f || f.dataset.f === 'q') return;
      qFilter[f.dataset.f] = f.value;
      if (f.dataset.f === 'domain') qFilter.section = '';
      writeFilterToUrl();
      App.rerender();
    });

    host.addEventListener('click', e => {
      if (e.target.closest('[data-clear]')) {
        Object.keys(qFilter).forEach(k => qFilter[k] = '');
        writeFilterToUrl();
        App.rerender();
        return;
      }
      if (e.target.closest('[data-next-open]')) { gotoNextUnanswered(); return; }
      if (e.target.closest('[data-kbd-help]')) { showShortcuts(); return; }
      if (e.target.closest('[data-fab-top]')) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const f = UI.el('#f-q', host); if (f) f.focus({ preventScroll: true });
        return;
      }
      if (e.target.closest('[data-kbd-dismiss]')) {
        Store.update(s => { s.ui.kbdHintSeen = true; }, { silent: true });
        const b = e.target.closest('[data-kbd-hint]');
        if (b) b.remove();
        return;
      }
      const ab = e.target.closest('[data-answer]');
      if (ab) {
        const id = ab.dataset.answer, val = ab.dataset.a;
        // Kaydırma konumu korunsun diye tüm liste değil, yalnızca ilgili kart yenilenir.
        const oncekiYanit = (Store.state.answers[id] || {}).a || '';
        const sonrakiYanit = oncekiYanit === val ? '' : val;
        Store.update(s => {
          s.answers[id] = s.answers[id] || {};
          s.answers[id].a = sonrakiYanit;
        }, { silent: true, log: { what: 'answer', ref: id, before: oncekiYanit, after: sonrakiYanit } });
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

  /** Filtre çubuğu ekrandan çıkınca sabit gezinme düğmesi belirir;
      218 soruluk listede en üste dönmek zorunda kalınmaz. */
  function bindFab(host) {
    const fab = UI.el('#q-fab', host);
    if (!fab) return;
    const count = UI.el('#q-fab-count', fab);

    const sync = () => {
      const calc = App.calc;
      if (!calc) return;
      const open = UI.els('.q', host).filter(c => {
        const s = calc.perQuestion[c.id.replace(/^q-/, '')];
        return s && !s.answered;
      }).length;
      count.textContent = open ? open : '';
      fab.hidden = window.scrollY < 320 || open === 0;
    };

    sync();
    window.addEventListener('scroll', sync, { passive: true });
    host.addEventListener('view:teardown', () => window.removeEventListener('scroll', sync));
    // Yanıt verildikçe kalan sayısı tazelensin
    host.addEventListener('click', e => { if (e.target.closest('[data-answer]')) setTimeout(sync, 0); });
  }

  /* ---------- Anket klavye ve gezinme ---------- */

  /** Görünümün üstüne en yakın soru kartı — klavye komutlarının hedefi. */
  function activeCard() {
    const cards = UI.els('.q');
    if (!cards.length) return null;
    const focused = document.activeElement && document.activeElement.closest('.q');
    if (focused) return focused;
    const top = 110;
    return cards.find(c => c.getBoundingClientRect().bottom > top) || cards[cards.length - 1];
  }

  function focusCard(card, { evidence } = {}) {
    if (!card) return;
    UI.els('.q.is-active').forEach(c => c.classList.remove('is-active'));
    card.classList.add('is-active');
    card.scrollIntoView({ block: 'center', behavior: 'auto' });
    const target = evidence ? card.querySelector('[data-evidence]') : card.querySelector('.answer-btn:not([disabled])');
    if (target) target.focus({ preventScroll: true });
    const id = card.id.replace(/^q-/, '');
    Store.update(s => { s.ui.lastQuestion = id; }, { silent: true });
  }

  function step(dir) {
    const cards = UI.els('.q');
    const cur = activeCard();
    const i = cards.indexOf(cur);
    focusCard(cards[Math.min(cards.length - 1, Math.max(0, i + dir))]);
  }

  function gotoNextUnanswered() {
    const calc = App.calc;
    const cards = UI.els('.q');
    const cur = activeCard();
    const start = cards.indexOf(cur) + 1;
    const isOpen = c => {
      const s = calc.perQuestion[c.id.replace(/^q-/, '')];
      return s && !s.answered;
    };
    const next = cards.slice(start).find(isOpen) || cards.find(isOpen);
    if (next) focusCard(next);
    else UI.toast(t('allAnswered'), 'ok');
  }

  /** Anket ekranı açıkken çalışan kısayollar. */
  function onSurveyKey(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const el = e.target;
    const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
    if (document.querySelector('.scrim')) return;

    // Kanıt alanındayken Esc odaktan çıkar, diğer tuşlar yazıya gider
    if (typing) {
      if (e.key === 'Escape') { el.blur(); e.preventDefault(); }
      return;
    }

    const map = { '1': 'Evet', '2': 'Kısmen', '3': 'Hayır', '4': 'Uygulanamaz' };
    if (map[e.key]) {
      const card = activeCard();
      if (!card) return;
      const btn = card.querySelector(`[data-a="${map[e.key]}"]`);
      if (btn && !btn.disabled) { btn.click(); e.preventDefault(); }
      return;
    }
    const k = e.key.toLowerCase();
    if (k === 'j') { step(1); e.preventDefault(); }
    else if (k === 'k') { step(-1); e.preventDefault(); }
    else if (k === 'n') { gotoNextUnanswered(); e.preventDefault(); }
    else if (k === 'e') { focusCard(activeCard(), { evidence: true }); e.preventDefault(); }
    else if (k === '?') { showShortcuts(); e.preventDefault(); }
  }

  function showShortcuts() {
    const row = (keys, desc) => `<tr><td class="nowrap">${keys.map(x => `<kbd>${esc(x)}</kbd>`).join(' ')}</td><td>${esc(desc)}</td></tr>`;
    UI.modal({
      title: t('kbdTitle'), width: 480,
      body: `<div class="table-wrap"><table><tbody>
        ${row(['1', '2', '3', '4'], t('kbdAnswer'))}
        ${row(['J'], t('kbdNext'))}
        ${row(['K'], t('kbdPrev'))}
        ${row(['N'], t('kbdNextOpen'))}
        ${row(['E'], t('kbdEvidence'))}
        ${row(['Esc'], t('kbdEscape'))}
        ${row(['?'], t('kbdHelp'))}
      </tbody></table></div>
      <p class="subtle">${t('kbdNote')}</p>`,
      footer: `<button class="btn btn-primary" data-close>${t('close')}</button>`
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
      if (qFilter.status === 'qapending' && (!q.qa || (s.qaResult && s.qaResult !== 'Test edilmedi'))) return false;
      if (qFilter.status === 'qaconflict' && !s.qaConflict) return false;
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

    // Bölüm başlıkları: uzun listede nerede olduğunu ve bölüm ilerlemesini gösterir
    let lastKey = null;
    const html = list.map(q => {
      let head = '';
      const key = q.domain + '|' + q.sectionKey;
      if (key !== lastKey) {
        lastKey = key;
        const inSection = list.filter(x => x.domain === q.domain && x.sectionKey === q.sectionKey);
        const done = inSection.filter(x => calc.perQuestion[x.id].answered).length;
        head = `<div class="section-head" id="sec-${esc(q.domain)}-${esc(q.sectionKey.replace(/\s+/g, '_'))}">
          <div class="section-head-main">
            <b class="mono">${esc(q.domain)}</b>
            <span>${esc(q.section)}</span>
          </div>
          <span class="chip ${done === inSection.length ? 'chip-ok' : ''}">${done}/${inSection.length}</span>
          ${meter(done / inSection.length, done === inSection.length ? 'ok' : '')}
        </div>`;
      }
      return head + questionCard(q, calc);
    }).join('');
    container.innerHTML = html;
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
      statTile({ label: t('actionRequired'), value: fmtInt(gaps), tone: gaps ? 'warn' : 'ok', foot: t('openCriticalN', { n: fmtInt(openCrit) }) }),
      statTile({ label: t('qaCoverage'), value: fmtPct(calc.qa2.coverage),
        tone: calc.qa2.conflicts.length ? 'danger' : calc.qa2.coverage >= 0.8 ? 'ok' : '',
        foot: `${fmtInt(calc.qa2.tested)}/${fmtInt(calc.qa2.required)} ${t('qaTestedOf')}`
          + (calc.qa2.conflicts.length ? ` · <b style="color:var(--danger)">${calc.qa2.conflicts.length} ${t('qaConflictShort')}</b>` : '')
          + meter(calc.qa2.coverage, calc.qa2.coverage >= 0.8 ? 'ok' : '') })
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
            ${s.actionNeeded === 'EVET - ÖNCELİKLİ' ? `<span class="chip chip-critical">${Icons.alert()} ${t('priorityAction')}</span>`
              : s.actionNeeded === 'Evet' ? `<span class="chip chip-high">${t('actionNeeded')}</span>` : ''}
            ${locked ? `<span class="chip chip-na">${Icons.lock()} ${esc(s.scopeReason)}</span>` : ''}
            <span class="chip chip-high ${missingEvidence ? '' : 'hidden'}" data-evidence-badge>${t('noEvidenceRef')}</span>
            <span class="meta-line">
              <span>${esc(q.domain)} · ${esc(q.section)}</span>
              <span>${t('weight')} <b>${q.weight}</b></span>
              ${q.qa ? `<span>${Icons.flask()} ${t('qaTest')}</span>` : ''}
            </span>
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
        ${q.qa ? `<details class="qa-block"${s.qaResult ? ' open' : ''}>
          <summary>${Icons.flask()} ${t('qaResultTitle')}${s.qaResult
            ? ` — <span class="chip ${s.qaResult === 'Çelişkili' ? 'chip-critical' : s.qaResult === 'Doğrulandı' ? 'chip-ok' : 'chip-high'}">${esc(I18n.ref('qaResult', s.qaResult))}</span>`
            : ` <span class="chip chip-na">${t('qaNotEntered')}</span>`}</summary>
          <div class="field-row" style="margin-top:10px">
            <div class="field" style="margin:0">
              <label for="qr-${q.id}">${t('qaResultLabel')}</label>
              <select id="qr-${q.id}" data-qa="${q.id}" data-field="qaResult">
                ${refOptions('qaResult', s.qaResult, t('select'))}
              </select>
              <div class="help">${t('qaResultHelp')}</div>
            </div>
            <div class="field" style="margin:0">
              <label for="qs-${q.id}">${t('qaSample')}</label>
              <input type="number" min="0" step="1" inputmode="numeric" id="qs-${q.id}"
                data-qa="${q.id}" data-field="qaSample" value="${esc(s.qaSample)}" placeholder="25">
              <div class="help">${esc(q.pop || t('genPopFallback'))}</div>
            </div>
            <div class="field" style="margin:0">
              <label for="qe-${q.id}">${t('qaErrors')}</label>
              <input type="number" min="0" step="1" inputmode="numeric" id="qe-${q.id}"
                data-qa="${q.id}" data-field="qaErrors" value="${esc(s.qaErrors)}" placeholder="0">
              <div class="help">${s.qaSample && s.qaErrors !== '' && Number(s.qaSample) > 0
                ? t('qaErrorRate', { p: fmtPct1(Number(s.qaErrors) / Number(s.qaSample)) }) : t('qaErrorsHelp')}</div>
            </div>
          </div>
          <div class="field" style="margin:0">
            <label for="qn-${q.id}">${t('qaNote')}</label>
            <input type="text" id="qn-${q.id}" data-qa="${q.id}" data-field="qaNote" value="${esc(s.qaNote)}"
              placeholder="${t('qaNotePh')}">
          </div>
          ${s.qaConflict ? `<div class="banner danger" style="margin:10px 0 0">${Icons.alert()}
            <div><b>${t('qaConflictTitle')}</b><span>${t('qaConflictBody')}</span></div></div>` : ''}
        </details>` : ''}

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
        <td><a href="#/anket?d=${esc(d.code)}">${esc(d.name)}</a></td>
        <td class="num">${fmtInt(d.count)}</td>
        <td class="num">${fmtInt(d.answered)}</td>
        <td class="num">${fmtInt(d.na)}</td>
        <td class="num">${fmtNum1(d.applicableWeight)}</td>
        <td class="num">${fmtNum1(d.earned)}</td>
        <td class="num"><span class="heat-cell score-pill ${effClass(d.effectiveness)}">${fmtPct1(d.effectiveness)}</span></td>
        <td class="num"><span class="heat-cell score-pill ${effClass(d.effectivenessTested)}">${fmtPct1(d.effectivenessTested)}</span>
          ${d.qaAdjusted ? `<div class="subtle">${t('scAdjusted', { n: d.qaAdjusted })}</div>` : ''}</td>
        <td class="num">${d.qaRequired ? fmtPct(d.assurance) : '—'}
          ${d.qaRequired ? `<div class="subtle">${d.qaTested}/${d.qaRequired}</div>` : ''}</td>
        <td>${d.maturity ? `<span class="chip ${maturityClass(d.maturity)}">${esc(I18n.ref('maturity', d.maturity))}</span>` : '—'}</td>
        <td class="num">${d.openCritical ? `<b style="color:var(--danger)">${fmtInt(d.openCritical)}</b>` : '0'}</td>
        <td class="num">${fmtInt(d.actionsNeeded)}</td>
      </tr>`).join('');

    host.innerHTML = `
      ${banner('info', t('bnNoInputTtl'), t('bnNoInputBody'))}
      ${banner('info', t('bnTestedTtl'), t('bnTestedBody'))}
      <div class="card">
        <div class="card-head"><h2>${t('ttlScores')}</h2>
          <span class="subtle">${t('scoreLegend')}</span></div>
        <div class="card-body flush">
          <div class="table-wrap"><table>
            <thead><tr>
              <th>${t('colCode')}</th><th>${t('domain')}</th><th class="num">${t('colQuestions')}</th><th class="num">${t('colAnswers')}</th><th class="num">N/A</th>
              <th class="num">${t('colApplicableW')}</th><th class="num">${t('colEarned')}</th>
              <th class="num">${t('colEffDeclared')}</th><th class="num">${t('colEffTested')}</th>
              <th class="num">${t('colAssurance')}</th><th>${t('maturityLabel')}</th><th class="num">${t('colOpenCrit')}</th><th class="num">${t('colActions')}</th>
            </tr></thead>
            <tbody>${rows}</tbody>
            <tfoot><tr>
              <td></td><td>${t('totalRow')}</td>
              <td class="num">${fmtInt(tot.count)}</td><td class="num">${fmtInt(tot.answered)}</td><td class="num">${fmtInt(tot.na)}</td>
              <td class="num">${fmtNum1(tot.applicableWeight)}</td><td class="num">${fmtNum1(tot.earned)}</td>
              <td class="num">${fmtPct1(tot.effectiveness)}</td>
              <td class="num">${fmtPct1(tot.effectivenessTested)}</td>
              <td class="num">${tot.assurance === null ? '—' : fmtPct(tot.assurance)}</td>
              <td>${esc(tot.maturity ? I18n.ref('maturity', tot.maturity) : '—')}</td>
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

  /* =========================================================
     NASIL OKUNUR
     ========================================================= */
  function guide(host, { calc }) {
    const term = (tKey, mKey, where) => `<tr>
      <td style="min-width:190px"><b>${esc(t(tKey))}</b></td>
      <td>${esc(t(mKey))}</td>
      <td class="subtle nowrap">${where}</td></tr>`;

    const chain = [
      { n: 'navKunye', d: 'stepKunye', route: 'kunye' },
      { n: 'navPortfolio', d: 'stepPortfolio', route: 'portfoy' },
      { n: 'navInherent', d: 'stepInherent', route: 'dogustan' },
      { n: 'navSurvey', d: 'stepSurvey', route: 'anket' },
      { n: 'navQa', d: 'subQa', route: 'qa' },
      { n: 'navResidual', d: 'subResidual', route: 'artik' },
      { n: 'navActions', d: 'subActions', route: 'aksiyon' }
    ];

    host.innerHTML = `
      ${banner('info', t('gdIntroTtl'), t('gdIntroBody'))}

      <div class="card">
        <div class="card-head"><h2>${t('gdFlowTtl')}</h2>
          <span class="subtle">${t('gdChainTtl')}</span></div>
        <div class="card-body">
          <ol class="steps">
            ${chain.map((s, i) => `<li class="step">
              <span class="step-no">${i + 1}</span>
              <button class="step-main" data-route="${s.route}">
                <b>${esc(t(s.n))}</b><span class="subtle">${esc(t(s.d))}</span>
              </button></li>`).join('')}
          </ol>
        </div>
      </div>

      <div class="card">
        <div class="card-head"><h2>${t('gdTermsTtl')}</h2></div>
        <div class="card-body flush">
          <div class="table-wrap"><table>
            <thead><tr><th>${t('gdTerm')}</th><th>${t('gdMeans')}</th><th>${t('gdWhere')}</th></tr></thead>
            <tbody>
              ${term('gdInherentT', 'gdInherentM', `<a href="#/dogustan">${esc(t('navInherent'))}</a>`)}
              ${term('gdDeclaredT', 'gdDeclaredM', `<a href="#/skorlar">${esc(t('navScores'))}</a>`)}
              ${term('gdTestedT', 'gdTestedM', `<a href="#/skorlar">${esc(t('navScores'))}</a>`)}
              ${term('gdAssuranceT', 'gdAssuranceM', `<a href="#/qa">${esc(t('navQa'))}</a>`)}
              ${term('gdResidualT', 'gdResidualM', `<a href="#/artik">${esc(t('navResidual'))}</a>`)}
              ${term('gdAppetiteT', 'gdAppetiteM', `<a href="#/artik">${esc(t('navResidual'))}</a>`)}
              ${term('gdCapT', 'gdCapM', `<a href="#/artik">${esc(t('navResidual'))}</a>`)}
              ${term('gdCriticalT', 'gdCriticalM', `<a href="#/anket?st=opencrit">${esc(t('navSurvey'))}</a>`)}
              ${term('gdPfT', 'gdPfM', `<a href="#/artik">${esc(t('navResidual'))}</a>`)}
            </tbody>
          </table></div>
        </div>
      </div>

      <div class="card">
        <div class="card-head"><h2>${t('gdFormulaTtl')}</h2></div>
        <div class="card-body">
          <ul class="formula-list">
            <li>${esc(t('gdF1'))}</li>
            <li>${esc(t('gdF2'))}</li>
            <li>${esc(t('gdF3', { }))}</li>
            <li>${esc(t('gdF4'))}</li>
          </ul>
          <p class="subtle" style="margin-top:10px">${esc(t('gdReadTip'))}</p>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <div style="flex:1;min-width:220px">
            <h2>${t('gdGlossTtl')}</h2>
            <div class="subtle">${t('gdGlossSub')}</div>
          </div>
        </div>
        <div class="card-body flush">
          <div class="table-wrap"><table>
            <thead><tr><th style="width:26%">${t('gdTerm')}</th><th>${t('gdMeans')}</th></tr></thead>
            <tbody>${(typeof GLOSSARY === 'undefined' ? [] : GLOSSARY).map(g =>
              `<tr><td><b>${esc(g.k)}</b></td><td>${esc(I18n.isEn ? g.en : g.tr)}</td></tr>`).join('')}</tbody>
          </table></div>
        </div>
      </div>

      <div class="card">
        <div class="card-head"><h2>${t('gdCalibTtl')}</h2></div>
        <div class="card-body">
          ${(() => {
            const crit = DATA.questions.filter(q => q.critKey === 'Kritik').length;
            return `<p>${esc(t('gdCalibCrit', { n: crit, p: fmtPct(crit / DATA.questions.length) }))}</p>`;
          })()}
          <p>${esc(t('gdCalibQa'))}</p>
          <p class="subtle">${esc(t('gdCalibExtra'))}</p>
        </div>
      </div>

      <div class="card">
        <div class="card-head"><h2>${t('gdScaleTtl')}</h2></div>
        <div class="card-body">
          <h3>${t('gdScaleInh')}</h3>
          <div class="inline-list" style="margin-bottom:12px">
            ${['Çok Yüksek', 'Yüksek', 'Orta', 'Düşük'].map((lv, i) =>
              `<span class="chip ${levelClass(lv)}">${esc(I18n.ref('riskLevel', lv))} ${['≥ 4', '≥ 3', '≥ 2', '< 2'][i]}</span>`).join('')}
          </div>
          <h3>${t('gdScaleRes')}</h3>
          <div class="inline-list" style="margin-bottom:12px">
            ${['Çok Yüksek', 'Yüksek', 'Orta', 'Düşük'].map((lv, i) =>
              `<span class="chip ${levelClass(lv)}">${esc(I18n.ref('riskLevel', lv))} ${['≥ 3,50', '≥ 2,50', '≥ 1,50', '< 1,50'][i]}</span>`).join('')}
          </div>
          <h3>${t('gdScaleMat')}</h3>
          <div class="inline-list">
            ${[['Gelişmiş', '≥ 90%'], ['Yeterli', '≥ 75%'], ['Gelişime Açık', '≥ 60%'], ['Zayıf', '≥ 40%'], ['Kritik Zayıf', '< 40%']]
              .map(([m, r]) => `<span class="chip ${maturityClass(m)}">${esc(I18n.ref('maturity', m))} ${r}</span>`).join('')}
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
  function residual(host, ctx) {
    const { calc } = ctx;
    const rows = calc.residual.map(r => `
      <tr>
        <td><b class="mono">${esc(r.code)}</b></td>
        <td style="min-width:210px">
          <a href="#/anket?d=${esc(r.code)}">${esc(r.name)}</a>
          <div class="subtle" title="${t('inherentSource')}: ${esc(r.source)}">${esc(r.source)}</div>
          ${r.breach ? `<div class="subtle"><a href="#/anket?d=${esc(r.code)}&st=gap">${t('rrSeeGaps')}</a></div>` : ''}</td>
        <td class="num">${fmtNum2(r.inherentRisk)}</td>
        <td class="num">${fmtPct1(r.effectivenessTested)}
          ${r.effectiveApplied !== null && r.effectivenessTested > r.effectiveApplied
            ? `<div class="subtle">${t('rrCapped', { p: fmtPct(r.effectiveApplied) })}</div>` : ''}</td>
        <td class="num"><span class="heat-cell score-pill ${levelClass(r.level)}">${fmtNum2(r.residual)}</span></td>
        <td>${r.level ? `<span class="chip ${levelClass(r.level)}">${esc(I18n.ref('riskLevel', r.level))}</span>` : '—'}</td>
        <td style="width:92px">
          <input type="number" min="0.1" max="5" step="0.1" inputmode="decimal" id="ap-${r.code}"
            data-appetite="${r.code}" value="${r.appetite}" aria-label="${esc(r.name)} — ${t('colAppetiteLimit')}">
          ${r.appetiteOverridden ? `<div class="subtle">${t('rrOwnLimit')}</div>` : ''}
        </td>
        <td>${r.breach === null ? '—' : r.breach
          ? `<span class="chip chip-critical">${Icons.alert()} ${t('breachAction')}</span>`
          : `<span class="chip chip-ok">${t('withinAppetiteFull')}</span>`}</td>
      </tr>`).join('');

    host.innerHTML = `
      ${calc.breaches > 0
        ? banner('danger', t('bnBreachTtl', { n: calc.breaches }), t('bnBreachBody'))
        : banner('info', t('heatmapFormula'), t('bnResidBody'))}
      ${calc.masksBreach ? banner('warn', t('bnMasksTtl'),
        t('bnMasksBody', { g: fmtNum2(calc.generalResidual), d: calc.worstDomain.code, r: fmtNum2(calc.worstDomain.residual) })) : ''}
      <div class="card">
        <div class="card-head"><h2>${t('ttlResidual')}</h2></div>
        <div class="card-body flush">
          <div class="table-wrap"><table>
            <thead><tr>
              <th>${t('colCode')}</th><th>${t('domain')}</th><th class="num">${t('colInherent')}</th><th class="num">${t('colEffTested')}</th>
              <th class="num">${t('colResidual')}</th><th>${t('level')}</th><th>${t('colAppetiteLimit')}</th><th>${t('status')}</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table></div>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <div style="flex:1;min-width:220px">
            <h2>${esc(calc.pfLine.name)}</h2>
            <div class="subtle">${t('pfSeparateNote')}</div>
          </div>
        </div>
        <div class="card-body flush">
          <div class="table-wrap"><table>
            <thead><tr>
              <th>${t('colCode')}</th><th>${t('domain')}</th><th class="num">${t('colInherent')}</th>
              <th class="num">${t('colEffTested')}</th><th class="num">${t('colResidual')}</th>
              <th>${t('level')}</th><th>${t('colAppetiteLimit')}</th><th>${t('status')}</th>
            </tr></thead>
            <tbody><tr>
              <td><b class="mono">PF</b></td>
              <td>${esc(calc.pfLine.name)}<div class="subtle">${esc(calc.pfLine.source)}</div></td>
              <td class="num">${fmtNum2(calc.pfLine.inherentRisk)}</td>
              <td class="num">${fmtPct1(calc.pfLine.effectivenessTested)}</td>
              <td class="num"><span class="heat-cell score-pill ${levelClass(calc.pfLine.level)}">${fmtNum2(calc.pfLine.residual)}</span></td>
              <td>${calc.pfLine.level ? `<span class="chip ${levelClass(calc.pfLine.level)}">${esc(I18n.ref('riskLevel', calc.pfLine.level))}</span>` : '—'}</td>
              <td style="width:92px"><input type="number" min="0.1" max="5" step="0.1" inputmode="decimal" id="ap-PF"
                data-appetite="PF" value="${calc.pfLine.appetite}" aria-label="PF — ${t('colAppetiteLimit')}"></td>
              <td>${calc.pfLine.breach === null ? '—' : calc.pfLine.breach
                ? `<span class="chip chip-critical">${Icons.alert()} ${t('breachAction')}</span>`
                : `<span class="chip chip-ok">${t('withinAppetiteFull')}</span>`}</td>
            </tr></tbody>
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
      </div>

      <div class="card">
        <div class="card-head"><h2>${t('method')}</h2></div>
        <div class="card-body">
          <p>${t('rrMethod1', { p: fmtPct(calc.maxControlEffect) })}</p>
          <p>${t('rrMethod2')}</p>
          <p class="subtle">${t('rrMethod3')}</p>
        </div>
      </div>`;

    host.addEventListener('change', e => {
      const a = e.target.closest('[data-appetite]');
      if (!a) return;
      Store.update(s => {
        const v = Number(a.value);
        s.appetite = s.appetite || {};
        // Varsayılana eşitse geçersiz kılma saklanmaz (PF dahil).
        if (!Number.isFinite(v) || v <= 0 || v === Calc.defaultAppetite(a.dataset.appetite)) delete s.appetite[a.dataset.appetite];
        else s.appetite[a.dataset.appetite] = v;
      });
    });
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
      <div class="grid grid-kpi">
        ${statTile({ label: t('qaPopulations'), value: fmtInt(calc.qa.length), foot: `${fmtInt(covered)} ${t('qaVolumeEntered')}` })}
        ${statTile({ label: t('qaTotalVolume'), value: fmtInt(calc.qaTotals.volume) })}
        ${statTile({ label: t('qaAnnualSample'), value: fmtInt(calc.qaTotals.yearlySample), foot: t('qaFilesToTest') })}
        ${statTile({ label: t('qaPerTest'), value: fmtInt(calc.qaTotals.perTest), foot: t('qaAllPops') })}
      </div>
      <div class="card">
        <div class="card-head"><h2>${t('qaTableTitle')}</h2></div>
        <div class="card-body flush">
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
          <p class="subtle">${t('stratNote')}</p>
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

  return { dashboard, kunye, inherent: inherentView, questions, domainScores, residual, qa, guide, banner, maturityClass };
})();
