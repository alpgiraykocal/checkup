/* Ekranlar. Her view: render(host, ctx) — ctx = {state, calc}. */

const Views = (() => {
  const { esc, fmtInt, fmtPct, fmtPct1, fmtNum1, fmtNum2, fmtDate,
          levelClass, effClass, critChip, meter, statTile, selectOptions, emptyState } = UI;

  /* =========================================================
     PANO
     ========================================================= */
  function dashboard(host, { state, calc }) {
    const t = calc.totals;
    const inh = calc.inherent;
    const effTone = t.effectiveness === null ? '' : t.effectiveness >= 0.75 ? 'ok' : t.effectiveness >= 0.6 ? 'warn' : 'danger';

    const tiles = [
      statTile({
        label: 'Genel kontrol etkinliği', value: fmtPct1(t.effectiveness), tone: effTone,
        foot: (t.maturity ? `Olgunluk: <b>${esc(t.maturity)}</b>` : 'Henüz yanıt yok') + meter(t.effectiveness, effTone === 'ok' ? 'ok' : effTone === 'warn' ? 'warn' : 'danger')
      }),
      statTile({
        label: 'Genel doğuştan risk', value: inh.measured ? fmtNum2(inh.general) : '—', unit: '/ 5',
        tone: !inh.measured ? '' : inh.general >= 3 ? 'danger' : inh.general >= 2 ? 'warn' : 'ok',
        foot: `${inh.measured ? esc(inh.dims.GENEL.level) : 'ölçülmedi'} · ${inh.scored}/${inh.applicable} faktör${inh.na ? ` · ${inh.na} N/A` : ''}`
      }),
      statTile({
        label: 'Genel artık risk', value: fmtNum2(calc.generalResidual), unit: '/ 5',
        tone: calc.generalResidual === null ? '' : calc.generalResidual >= 2.5 ? 'danger' : calc.generalResidual >= 1.5 ? 'warn' : 'ok',
        foot: calc.generalResidual === null ? 'Kontrol etkinliği hesaplanamadı' : esc(Calc.residualLevel(calc.generalResidual))
      }),
      statTile({
        label: 'Anket ilerlemesi', value: fmtInt(t.answered), unit: `/ ${fmtInt(t.count)}`,
        foot: `${fmtPct(t.progress)} tamamlandı` + meter(t.progress)
      }),
      statTile({
        label: 'Açık kritik soru', value: fmtInt(t.openCritical), tone: t.openCritical > 0 ? 'danger' : 'ok',
        foot: 'Kritiklik = Kritik ve yanıt ≠ Evet'
      }),
      statTile({
        label: 'İştahı aşan domain', value: fmtInt(calc.breaches), tone: calc.breaches > 0 ? 'danger' : 'ok',
        foot: 'Artık risk > iştah limiti'
      }),
      statTile({
        label: 'Açık aksiyon', value: fmtInt(calc.actionStats.open),
        tone: calc.actionStats.overdue > 0 ? 'danger' : '',
        foot: `${fmtInt(calc.actionStats.overdue)} gecikmiş · ${fmtInt(calc.actionStats.critical)} kritik`
      }),
      statTile({
        label: 'Aksiyon kapanış oranı', value: fmtPct(calc.actionStats.closureRate),
        foot: `${fmtInt(calc.actionStats.closed)} / ${fmtInt(calc.actionStats.total)} kapalı` + meter(calc.actionStats.closureRate)
      })
    ].join('');

    const banners = [];
    if (t.answered === 0) {
      banners.push(banner('info', 'Değerlendirmeye künye ile başlayın',
        'Künye, hangi soruların kapsam dışı sayılacağını belirler. Ardından doğuştan riski skorlayın ve soru bankasını yanıtlayın.'));
    }
    if (inh.pending > 0 && inh.scored > 0) {
      banners.push(banner('warn', `Doğuştan risk skorlaması eksik — ${inh.pending} faktör`,
        'Boyut skorları yalnızca skorlanan faktörleri yansıtır; tamamlanana kadar artık risk sonucu geçicidir.'));
    }
    if (inh.missingNotes > 0) {
      banners.push(banner('warn', `${inh.missingNotes} yüksek doğuştan risk skorunda gerekçe eksik`,
        '4 ve 5 skorları denetimde kanıtla desteklenmelidir.'));
    }
    if (t.openCritical > 0) {
      banners.push(banner('danger', `${t.openCritical} kritik kontrolde açık bulgu var`,
        'Kritik sorulara "Evet" dışında verilen her yanıt, tek başına yaptırım riski taşıyan bir kontrol boşluğuna işaret eder.'));
    }

    host.innerHTML = `
      ${banners.join('')}
      <div class="grid grid-kpi">${tiles}</div>

      <div class="card" style="margin-top:16px">
        <div class="card-head"><h2>Domain ısı haritası</h2>
          <span class="subtle">Artık Risk = Doğuştan Risk × (1 − Kontrol Etkinliği)</span></div>
        <div class="card-body">
          ${heatmap(calc)}
        </div>
      </div>

      <div class="grid grid-2" style="margin-top:16px">
        <div class="card">
          <div class="card-head"><h2>Doğuştan risk boyutları</h2></div>
          <div class="card-body">${inherentBars(calc)}</div>
        </div>
        <div class="card">
          <div class="card-head"><h2>Operasyonel KPI'lar</h2><span class="subtle">Dönemsel olarak elle girilir</span></div>
          <div class="card-body" style="padding:0">${kpiTable(state)}</div>
        </div>
      </div>
    `;

    host.addEventListener('input', e => {
      const f = e.target.closest('[data-kpi]');
      if (!f) return;
      const name = f.dataset.kpi, field = f.dataset.field;
      Store.update(s => {
        s.kpis[name] = s.kpis[name] || {};
        s.kpis[name][field] = f.value;
      }, { silent: true });
    });
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
          <div class="subtle">${fmtInt(d.answered)}/${fmtInt(d.count)} yanıt${d.na ? ` · ${fmtInt(d.na)} N/A` : ''}</div></div>
        <div class="heat-eff-bar">${meter(eff === null ? 0 : eff, eff === null ? '' : eff >= 0.75 ? 'ok' : eff >= 0.6 ? 'warn' : 'danger')}
          <div class="subtle">${esc(d.maturity || 'yanıt bekliyor')}</div></div>
        <div class="heat-cell ${effClass(eff)}" title="Kontrol etkinliği">${fmtPct(eff)}</div>
        <div class="heat-cell ${levelClass(r.level)}" title="Artık risk (0-5)">${fmtNum2(r.residual)}</div>
        <div class="heat-cell ${r.breach ? 'lvl-cok-yuksek' : r.breach === false ? 'lvl-dusuk' : 'lvl-none'}" title="İştah limiti ${fmtNum1(r.appetite)}">
          ${r.breach === null ? '—' : r.breach ? 'AŞIM' : 'İçinde'}</div>
      </div>`;
    }).join('');

    return `<div role="table" aria-label="Domain bazlı artık risk ısı haritası">
      <div class="heat-row head" role="row">
        <div>Domain</div><div class="heat-eff-bar">Olgunluk</div>
        <div class="center">Etkinlik</div><div class="center">Artık risk</div><div class="center">İştah</div>
      </div>
      ${rows}
    </div>`;
  }

  function inherentBars(calc) {
    return Calc.DIMS.map(dim => {
      const d = calc.inherent.dims[dim];
      const domains = (DATA.dimDomains || {})[dim] || [];
      return `<div style="margin-bottom:12px">
        <div style="display:flex;gap:8px;align-items:baseline">
          <span style="flex:1">${esc(dim)}</span>
          ${d.measured ? `<span class="chip ${levelClass(d.level)}">${esc(d.level)}</span>
            <b class="num">${fmtNum2(d.value)}</b><span class="subtle">/5</span>`
            : '<span class="chip chip-na">ölçülmedi</span>'}
        </div>
        ${meter(d.value / 5, !d.measured ? '' : d.value >= 3 ? 'danger' : d.value >= 2 ? 'warn' : 'ok')}
        <div class="subtle">${d.scored}/${d.applicable} faktör${d.na ? ` · ${d.na} N/A` : ''} · ${domains.join(' ') || '—'}</div>
      </div>`;
    }).join('');
  }

  function kpiTable(state) {
    const rows = DATA.kpis.map(k => {
      const v = state.kpis[k.name] || {};
      return `<tr>
        <td>${esc(k.name)}<div class="subtle">${esc(k.source)}</div></td>
        <td style="width:110px"><input type="text" inputmode="decimal" data-kpi="${esc(k.name)}" data-field="target" value="${esc(v.target || '')}" aria-label="${esc(k.name)} hedef"></td>
        <td style="width:110px"><input type="text" inputmode="decimal" data-kpi="${esc(k.name)}" data-field="value" value="${esc(v.value || '')}" aria-label="${esc(k.name)} dönem değeri"></td>
      </tr>`;
    }).join('');
    return `<div class="table-wrap"><table>
      <thead><tr><th>KPI</th><th>Hedef</th><th>Dönem değeri</th></tr></thead>
      <tbody>${rows}</tbody></table></div>`;
  }

  /* =========================================================
     KÜNYE
     ========================================================= */
  function kunye(host, { state, calc }) {
    const yesNo = new Set(DATA.yesNoFields);
    const fields = DATA.kunyeFields.map(f => {
      const val = state.kunye[f.id] || '';
      const input = yesNo.has(f.id)
        ? `<select data-kunye="${f.id}" id="k-${f.id}">${selectOptions(['Evet', 'Hayır'], val, 'Seçiniz')}</select>`
        : /tarih/i.test(f.label)
          ? `<input type="date" data-kunye="${f.id}" id="k-${f.id}" value="${esc(val)}">`
          : /sayısı|adedi|kadrosu/i.test(f.label)
            ? `<input type="number" min="0" step="1" data-kunye="${f.id}" id="k-${f.id}" value="${esc(val)}" placeholder="0">`
            : `<input type="text" data-kunye="${f.id}" id="k-${f.id}" value="${esc(val)}">`;
      return `<div class="field">
        <label for="k-${f.id}">${esc(f.label)}</label>
        ${input}
        ${f.hint ? `<div class="help">${esc(f.hint)}</div>` : ''}
      </div>`;
    }).join('');

    const scoped = Array.from(calc.scopeMap.entries());
    const scopedQ = DATA.questions.filter(q => calc.scopeMap.has(q.domain + '|' + q.section)).length;

    host.innerHTML = `
      ${banner('info', 'Künye kapsamı belirler',
        'Faaliyet sorularına "Hayır" yanıtı, ilgili soru bölümlerini otomatik olarak "Uygulanamaz" yapar ve skorlamadan çıkarır.')}
      <div class="grid grid-2">
        <div class="card">
          <div class="card-head"><h2>Kurum künyesi</h2></div>
          <div class="card-body">${fields}</div>
        </div>
        <div>
          <div class="card">
            <div class="card-head"><h2>Kapsam etkisi</h2></div>
            <div class="card-body">
              ${scoped.length ? `
                <p class="subtle">Aşağıdaki bölümler kapsam dışı; ${fmtInt(scopedQ)} soru otomatik "Uygulanamaz" sayılıyor.</p>
                <div class="table-wrap"><table>
                  <thead><tr><th>Bölüm</th><th>Gerekçe</th><th class="num">Soru</th></tr></thead>
                  <tbody>${scoped.map(([key, reason]) => {
                    const [dom, sec] = key.split('|');
                    const n = DATA.questions.filter(q => q.domain === dom && q.section === sec).length;
                    return `<tr><td><b class="mono">${esc(dom)}</b> · ${esc(sec)}</td><td>${esc(reason)}</td><td class="num">${n}</td></tr>`;
                  }).join('')}</tbody></table></div>`
                : `<p class="muted">Kapsam daraltan bir yanıt yok. Tüm ${fmtInt(DATA.questions.length)} soru skorlamaya dahil.</p>`}
              <div class="divider"></div>
              <p class="subtle">Bir soruya elle yanıt verilirse otomatik kapsam kuralı o soru için geçersiz olur.</p>
            </div>
          </div>
        </div>
      </div>`;

    host.addEventListener('change', e => {
      const f = e.target.closest('[data-kunye]');
      if (!f) return;
      const isScopeField = DATA.scopeRules.some(r => r.field === f.dataset.kunye);
      Store.update(s => { s.kunye[f.dataset.kunye] = f.value; }, { silent: !isScopeField });
    });
    host.addEventListener('input', e => {
      const f = e.target.closest('input[data-kunye]');
      if (!f) return;
      Store.update(s => { s.kunye[f.dataset.kunye] = f.value; }, { silent: true });
    });
  }

  /* =========================================================
     DOĞUŞTAN RİSK
     ========================================================= */
  const inhUI = { editWeights: false, showAnchors: false, only: '' };

  const SCORE_LABEL = ['Çok düşük', 'Düşük', 'Orta', 'Yüksek', 'Çok yüksek'];

  function scoreClass(n) {
    return ['lvl-dusuk', 'lvl-dusuk', 'lvl-orta', 'lvl-yuksek', 'lvl-cok-yuksek'][n - 1] || 'lvl-none';
  }

  /** Künyedeki sayılardan oran çıkarıp skor önerir. */
  function kunyeHint(f, state) {
    if (!f.hint) return null;
    const num = Number(state.kunye[f.hint.num]);
    const den = Number(state.kunye[f.hint.den]);
    if (!Number.isFinite(num) || !Number.isFinite(den) || den <= 0) return null;
    const pct = (num / den) * 100;
    const suggested = f.hint.bands.findIndex(b => pct < b) + 1 || 5;
    return { pct, suggested, label: f.hint.label };
  }

  function inherentView(host, { state, calc }) {
    const inh = calc.inherent;
    const byDim = {};
    inh.factors.forEach(x => { (byDim[x.f.dim] = byDim[x.f.dim] || []).push(x); });

    const dimCards = Calc.DIMS
      .filter(dim => !inhUI.only || inhUI.only === dim)
      .map(dim => dimCard(dim, byDim[dim] || [], inh.dims[dim], state))
      .join('');

    host.innerHTML = `
      ${inherentBanners(inh)}

      <div class="grid grid-kpi" style="margin-bottom:16px">
        ${Calc.DIMS.map(dim => {
          const d = inh.dims[dim];
          return statTile({
            label: dim,
            value: d.measured ? fmtNum2(d.value) : '—', unit: '/5',
            tone: !d.measured ? '' : d.value >= 3 ? 'danger' : d.value >= 2 ? 'warn' : 'ok',
            foot: `${d.measured ? esc(d.level) : 'ölçülmedi'} · ${d.scored}/${d.applicable} faktör${d.na ? ` · ${d.na} N/A` : ''}`
              + meter(d.coverage)
          });
        }).join('')}
        ${statTile({
          label: 'GENEL', value: inh.measured ? fmtNum2(inh.general) : '—', unit: '/5',
          tone: !inh.measured ? '' : inh.general >= 3 ? 'danger' : inh.general >= 2 ? 'warn' : 'ok',
          foot: `${inh.measured ? esc(inh.dims.GENEL.level) : 'ölçülmedi'} · beş boyutun ortalaması`
        })}
      </div>

      <div class="toolbar no-print">
        <div class="field">
          <label for="inh-only">Boyut</label>
          <select id="inh-only" data-inh-only>
            <option value="">Tümü (${inh.total} faktör)</option>
            ${Calc.DIMS.map(d => `<option value="${esc(d)}"${inhUI.only === d ? ' selected' : ''}>${esc(d)} (${(byDim[d] || []).length})</option>`).join('')}
          </select>
        </div>
        <div class="toolbar-actions">
          <button class="btn" data-inh-anchors aria-pressed="${inhUI.showAnchors}">
            ${Icons.info()} Skor rehberlerini ${inhUI.showAnchors ? 'kapat' : 'aç'}
          </button>
          <button class="btn" data-inh-weights aria-pressed="${inhUI.editWeights}">
            ${Icons.edit()} Ağırlıkları ${inhUI.editWeights ? 'kilitle' : 'düzenle'}
          </button>
          ${Object.keys(state.inherentWeights || {}).length
            ? `<button class="btn btn-danger" data-inh-resetw>${Icons.reset()} Varsayılan ağırlıklar</button>` : ''}
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
      out.push(banner('info', 'Doğuştan risk kontrollerden bağımsızdır',
        'Burada kurumun yapısal maruziyeti skorlanır. Kontrollerin ne kadar iyi çalıştığı bu sayfada değil, soru bankasında ölçülür. Her faktörü 1–5 arasında skorlayın veya faaliyet yoksa "Uygulanamaz" işaretleyin.'));
    } else if (inh.pending > 0) {
      out.push(banner('warn', `${inh.pending} faktör henüz skorlanmadı`,
        'Skorlanmayan faktör paydaya girmez; boyut skoru yalnızca skorlanan faktörleri yansıtır. Tamamlanmadan artık risk sonucu geçici sayılmalıdır.'));
    }
    if (inh.missingNotes > 0) {
      out.push(banner('danger', `${inh.missingNotes} yüksek skorda gerekçe eksik`,
        '4 ve 5 skorları denetimde ilk sorgulanan kalemlerdir; her biri için kanıta dayalı gerekçe girin.'));
    }
    return out.join('');
  }

  function driversCard(inh) {
    const top = inh.drivers.slice(0, 8);
    if (!top.length) return '';
    const max = top[0].weighted || 1;
    return `<div class="card" style="margin-bottom:16px">
      <div class="card-head"><h2>Baskın risk sürücüleri</h2>
        <span class="subtle">Ağırlıklı katkısı en yüksek faktörler · skor × ağırlık</span></div>
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
              <span class="chip ${scoreClass(d.score)}">${d.score} · ${esc(SCORE_LABEL[d.score - 1])}</span>
              <div class="subtle">ağırlık ${fmtNum1(d.weight)}</div>
            </div>
          </div>`).join('')}
        </div>
      </div>
    </div>`;
  }

  function dimCard(dim, items, d, state) {
    const domains = (DATA.dimDomains || {})[dim] || [];
    return `<div class="card">
      <div class="card-head">
        <div style="flex:1;min-width:160px">
          <h3>${esc(dim)}</h3>
          <div class="subtle">Beslediği domainler: ${domains.map(esc).join(' · ') || '—'}</div>
        </div>
        ${d.measured ? `<span class="chip ${levelClass(d.level)}">${esc(d.level)}</span>
          <b class="num">${fmtNum2(d.value)}</b><span class="subtle">/5</span>`
          : '<span class="chip chip-na">ölçülmedi</span>'}
      </div>
      <div class="card-body" style="padding:0">
        ${items.map(({ f, st }) => factorRow(f, st, state)).join('')}
      </div>
      <div class="card-head" style="border-top:1px solid var(--border-soft);border-bottom:0">
        <span class="subtle" style="flex:1">${d.scored}/${d.applicable} faktör skorlandı${d.na ? ` · ${d.na} uygulanamaz` : ''}</span>
        ${meter(d.coverage, d.complete ? 'ok' : '')}
      </div>
    </div>`;
  }

  function factorRow(f, st, state) {
    const idx = DATA.inherentFactors.indexOf(f);
    const hint = kunyeHint(f, state);
    const anchorText = st.score ? f.anchors[st.score - 1] : null;

    const buttons = [1, 2, 3, 4, 5].map(n => `
      <button type="button" class="answer-btn score-btn" data-inh-score="${esc(st.key)}" data-n="${n}"
        aria-pressed="${st.score === n}" ${st.na ? 'disabled' : ''}
        title="${esc(n + ' — ' + SCORE_LABEL[n - 1] + ': ' + f.anchors[n - 1])}">
        <span class="score-n">${n}</span>
      </button>`).join('');

    return `<div class="factor ${st.na ? 'is-na' : ''} ${st.needsNote ? 'needs-note' : ''}" id="inh-row-${idx}">
      <div class="factor-main">
        <div class="factor-title">
          <span>${esc(f.factor)}</span>
          ${st.na ? `<span class="chip chip-na">${Icons.lock()} ${esc(st.manualNA ? 'Uygulanamaz' : st.scopeReason)}</span>` : ''}
          ${st.weightOverridden ? `<span class="chip chip-mid">ağırlık değiştirildi</span>` : ''}
          ${st.needsNote ? `<span class="chip chip-critical">${Icons.alert()} Gerekçe gerekli</span>` : ''}
        </div>
        <div class="subtle">${esc(f.why)}</div>
        ${hint && !st.na ? `<div class="factor-hint">
          ${Icons.info()}<span>Künye: <b>${esc(hint.label)} ${fmtPct1(hint.pct / 100)}</b> → önerilen skor <b>${hint.suggested}</b>
          ${st.score === hint.suggested ? '(uygulandı)' : `<button class="btn btn-sm" data-inh-apply="${esc(st.key)}" data-n="${hint.suggested}">Uygula</button>`}</span>
        </div>` : ''}
      </div>

      <div class="factor-score">
        <div class="scorebar" role="group" aria-label="${esc(f.factor)} skoru">
          ${buttons}
          <button type="button" class="answer-btn na-btn" data-inh-na="${esc(st.key)}"
            aria-pressed="${st.manualNA}" title="Faktör bu kurum için geçerli değil">
            ${Icons.minus()}<span>N/A</span>
          </button>
        </div>
        <div class="factor-calc">
          ${st.na ? '<span class="subtle">Skorlamadan çıkarıldı</span>' : `
            <span class="subtle">Ağırlık</span>
            ${inhUI.editWeights
              ? `<input type="number" min="0.5" max="10" step="0.5" class="w-input" id="inhw-${idx}"
                   data-inh-weight="${esc(st.key)}" value="${st.weight}" aria-label="${esc(f.factor)} ağırlığı">`
              : `<b class="num">${fmtNum1(st.weight)}</b>`}
            <span class="subtle">· Ağırlıklı</span>
            <b class="num">${st.weighted === null ? '—' : fmtNum1(st.weighted)}</b>`}
        </div>
      </div>

      ${st.na ? '' : `<div class="factor-anchors">
        ${anchorText ? `<div class="anchor-current"><b>${st.score} — ${esc(SCORE_LABEL[st.score - 1])}:</b> ${esc(anchorText)}</div>` : ''}
        <details class="anchor-details"${inhUI.showAnchors ? ' open' : ''}>
          <summary>Skor rehberi (1–5)</summary>
          <ol class="anchor-list">
            ${f.anchors.map((a, i) => `<li class="${st.score === i + 1 ? 'is-current' : ''}">
              <span class="anchor-n ${scoreClass(i + 1)}">${i + 1}</span>${esc(a)}</li>`).join('')}
          </ol>
        </details>
      </div>`}

      ${st.na ? '' : `<div class="factor-note">
        <label for="inhn-${idx}">Gerekçe / kanıt${st.score >= 4 ? ' (zorunlu)' : ''}</label>
        <input type="text" id="inhn-${idx}" data-inh-note="${esc(st.key)}" value="${esc(st.note)}"
          placeholder="Ölçüm, rapor adı, dönem — skorun dayanağı">
      </div>`}
    </div>`;
  }

  function methodCard() {
    return `<div class="card">
      <div class="card-head"><h2>Yöntem</h2></div>
      <div class="card-body">
        <p><b>Boyut skoru</b> = Σ(skor × ağırlık) / Σ(skorlanan faktörlerin ağırlığı).
          Uygulanamaz ve henüz skorlanmamış faktörler paydaya girmez; tüm faktörler skorlandığında
          sonuç kaynak çalışma kitabıyla birebir aynıdır.</p>
        <p><b>GENEL</b> = beş boyut skorunun aritmetik ortalaması (ölçülmüş boyutlar üzerinden).</p>
        <p><b>Artık risk</b> hesabı bu sayfadan beslenir: her domain, kendisine atanmış boyutların
          ortalamasını doğuştan risk olarak alır. İlgili boyut ölçülmemişse o domainin artık riski hesaplanmaz.</p>
        <div class="inline-list" style="margin:12px 0">
          <span class="chip lvl-cok-yuksek">Çok Yüksek ≥ 4,00</span>
          <span class="chip lvl-yuksek">Yüksek ≥ 3,00</span>
          <span class="chip lvl-orta">Orta ≥ 2,00</span>
          <span class="chip lvl-dusuk">Düşük &lt; 2,00</span>
        </div>
        <p class="subtle">Varsayım: ağırlıklar sektör uygulamasına dayalı başlangıç değerleridir ve kurumun
          onaylı risk metodolojisine göre kalibre edilmelidir. Değiştirilen ağırlıklar "ağırlık değiştirildi"
          etiketiyle işaretlenir ve CSV çıktısına yansır.</p>
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
        UI.toast('Künye oranından skor uygulandı. Gerekçeyi doğrulayın.');
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
          title: 'Ağırlıklar sıfırlansın mı?',
          message: 'Tüm ağırlıklar kaynak çalışma kitabındaki varsayılan değerlere döner. Skorlar ve gerekçeler korunur.',
          confirmLabel: 'Varsayılana dön', danger: true
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
      ? [...new Set(DATA.questions.filter(q => q.domain === qFilter.domain).map(q => q.section))]
      : [];

    host.innerHTML = `
      <div class="toolbar no-print">
        <div class="field grow">
          <label for="f-q">Soruda ara</label>
          <input type="text" id="f-q" data-f="q" value="${esc(qFilter.q)}" placeholder="Soru metni, ID, kanıt veya kaynak">
        </div>
        <div class="field">
          <label for="f-domain">Domain</label>
          <select id="f-domain" data-f="domain">
            <option value="">Tümü (${DATA.questions.length})</option>
            ${DATA.domains.map(d => {
              const n = DATA.questions.filter(q => q.domain === d.code).length;
              return `<option value="${d.code}"${qFilter.domain === d.code ? ' selected' : ''}>${esc(d.code)} — ${esc(d.name)} (${n})</option>`;
            }).join('')}
          </select>
        </div>
        <div class="field">
          <label for="f-section">Bölüm</label>
          <select id="f-section" data-f="section" ${sections.length ? '' : 'disabled'}>
            <option value="">Tümü</option>
            ${sections.map(s => `<option value="${esc(s)}"${qFilter.section === s ? ' selected' : ''}>${esc(s)}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label for="f-crit">Kritiklik</label>
          <select id="f-crit" data-f="crit">
            <option value="">Tümü</option>
            ${['Kritik', 'Yüksek', 'Orta'].map(c => `<option value="${c}"${qFilter.crit === c ? ' selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label for="f-status">Durum</label>
          <select id="f-status" data-f="status">
            <option value="">Tümü</option>
            <option value="unanswered"${qFilter.status === 'unanswered' ? ' selected' : ''}>Yanıtlanmamış</option>
            <option value="answered"${qFilter.status === 'answered' ? ' selected' : ''}>Yanıtlanmış</option>
            <option value="gap"${qFilter.status === 'gap' ? ' selected' : ''}>Aksiyon gerektiren</option>
            <option value="opencrit"${qFilter.status === 'opencrit' ? ' selected' : ''}>Açık kritik</option>
            <option value="noevidence"${qFilter.status === 'noevidence' ? ' selected' : ''}>Kanıt referansı boş</option>
          </select>
        </div>
        <div class="field">
          <label for="f-qa">QA testi</label>
          <select id="f-qa" data-f="qa">
            <option value="">Tümü</option>
            <option value="yes"${qFilter.qa === 'yes' ? ' selected' : ''}>Gerekli</option>
            <option value="no"${qFilter.qa === 'no' ? ' selected' : ''}>Gerekli değil</option>
          </select>
        </div>
        <div class="toolbar-actions">
          <button class="btn" data-clear>${Icons.reset()} Filtreleri sıfırla</button>
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
    const term = qFilter.q.trim().toLocaleLowerCase('tr');
    return DATA.questions.filter(q => {
      const s = calc.perQuestion[q.id];
      if (qFilter.domain && q.domain !== qFilter.domain) return false;
      if (qFilter.section && q.section !== qFilter.section) return false;
      if (qFilter.crit && q.crit !== qFilter.crit) return false;
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
        const hay = (q.id + ' ' + q.text + ' ' + q.evidence + ' ' + q.source + ' ' + q.section).toLocaleLowerCase('tr');
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
      container.innerHTML = emptyState('Eşleşen soru yok', 'Filtreleri gevşetin veya arama terimini değiştirin.');
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
      statTile({ label: 'Seçili soru', value: fmtInt(list_.length), foot: `${fmtInt(DATA.questions.length)} sorudan` }),
      statTile({ label: 'Yanıtlanan', value: fmtInt(answered), foot: fmtPct(list_.length ? answered / list_.length : 0) + meter(list_.length ? answered / list_.length : 0) }),
      statTile({ label: 'Seçim kontrol etkinliği', value: fmtPct1(eff), tone: eff === null ? '' : eff >= 0.75 ? 'ok' : eff >= 0.6 ? 'warn' : 'danger' }),
      statTile({ label: 'Aksiyon gerektiren', value: fmtInt(gaps), tone: gaps ? 'warn' : 'ok', foot: `${fmtInt(openCrit)} açık kritik` })
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
        ${ANSWER_ICON[a]}<span>${esc(a)}</span>
      </button>`).join('');

    const missingEvidence = s.answered && !(rec.evidence || '').trim();

    return `<article class="q ${s.openCritical ? 'is-open-critical' : ''} ${locked ? 'is-locked' : ''}" id="q-${q.id}">
      <div class="q-head">
        <span class="q-id">${esc(q.id)}</span>
        <div class="q-main">
          <div class="q-text">${esc(q.text)}</div>
          <div class="q-meta">
            ${critChip(q.crit)}
            <span class="chip">Ağırlık ${q.weight}</span>
            <span class="chip">${esc(q.domain)} · ${esc(q.section)}</span>
            ${q.qa ? `<span class="chip chip-mid">${Icons.flask()} QA testi</span>` : ''}
            ${s.actionNeeded === 'EVET - ÖNCELİKLİ' ? `<span class="chip chip-critical">${Icons.alert()} Öncelikli aksiyon</span>`
              : s.actionNeeded === 'Evet' ? `<span class="chip chip-high">Aksiyon gerekli</span>` : ''}
            ${locked ? `<span class="chip chip-na">${Icons.lock()} ${esc(s.scopeReason)}</span>` : ''}
            <span class="chip ${missingEvidence ? 'chip-high' : 'hidden'}" data-evidence-badge>Kanıt referansı yok</span>
          </div>
          <div class="answers" role="group" aria-label="${esc(q.id)} yanıtı">${answerBtns}</div>
        </div>
      </div>
      <div class="q-detail">
        <div class="q-refs">
          <div><b>Beklenen kanıt:</b> ${esc(q.evidence)}</div>
          <div><b>Kaynak:</b> ${esc(q.source)}</div>
          ${q.pop ? `<div><b>Örneklem popülasyonu:</b> ${esc(q.pop)}</div>` : ''}
        </div>
        <div class="field-row">
          <div class="field" style="margin:0">
            <label for="ev-${q.id}">Kanıt referansı</label>
            <input type="text" id="ev-${q.id}" data-evidence="${q.id}" value="${esc(rec.evidence || '')}"
              placeholder="Dosya adı, sistem raporu, tarih">
          </div>
          <div class="field" style="margin:0">
            <label for="nt-${q.id}">Bulgu / not</label>
            <input type="text" id="nt-${q.id}" data-note="${q.id}" value="${esc(rec.note || '')}"
              placeholder="Tespit, sapma, gerekçe">
          </div>
        </div>
        ${s.actionNeeded && s.actionNeeded !== 'Hayır'
          ? `<div><button class="btn btn-sm" data-mkaction="${q.id}">${Icons.plus()} Bu sorudan aksiyon oluştur</button></div>` : ''}
      </div>
    </article>`;
  }

  /* =========================================================
     KONTROL SKORLARI
     ========================================================= */
  function domainScores(host, { calc }) {
    const t = calc.totals;
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
        <td>${d.maturity ? `<span class="chip ${maturityClass(d.maturity)}">${esc(d.maturity)}</span>` : '—'}</td>
        <td class="num">${d.openCritical ? `<b style="color:var(--danger)">${fmtInt(d.openCritical)}</b>` : '0'}</td>
        <td class="num">${fmtInt(d.actionsNeeded)}</td>
      </tr>`).join('');

    host.innerHTML = `
      ${banner('info', 'Bu sayfada girdi yoktur',
        'Tüm değerler soru bankasından türetilir. Kontrol etkinliği = kazanılan puan / uygulanabilir toplam ağırlık.')}
      <div class="card">
        <div class="card-head"><h2>Domain bazlı kontrol etkinliği</h2>
          <span class="subtle">Evet = 1,00 · Kısmen = 0,50 · Hayır = 0,00 · Uygulanamaz = skorlama dışı</span></div>
        <div class="card-body" style="padding:0">
          <div class="table-wrap"><table>
            <thead><tr>
              <th>Kod</th><th>Domain</th><th class="num">Soru</th><th class="num">Yanıt</th><th class="num">N/A</th>
              <th class="num">Uyg. ağırlık</th><th class="num">Kazanılan</th><th class="num">Etkinlik</th>
              <th>Olgunluk</th><th class="num">Açık kritik</th><th class="num">Aksiyon</th>
            </tr></thead>
            <tbody>${rows}</tbody>
            <tfoot><tr>
              <td></td><td>TOPLAM / AĞIRLIKLI ORTALAMA</td>
              <td class="num">${fmtInt(t.count)}</td><td class="num">${fmtInt(t.answered)}</td><td class="num">${fmtInt(t.na)}</td>
              <td class="num">${fmtNum1(t.applicableWeight)}</td><td class="num">${fmtNum1(t.earned)}</td>
              <td class="num">${fmtPct1(t.effectiveness)}</td><td>${esc(t.maturity || '—')}</td>
              <td class="num">${fmtInt(t.openCritical)}</td><td class="num">${fmtInt(t.actionsNeeded)}</td>
            </tr></tfoot>
          </table></div>
        </div>
      </div>

      <div class="card">
        <div class="card-head"><h2>Olgunluk eşikleri</h2></div>
        <div class="card-body">
          <div class="inline-list">
            <span class="chip chip-ok">Gelişmiş ≥ %90</span>
            <span class="chip chip-mid">Yeterli ≥ %75</span>
            <span class="chip chip-high">Gelişime Açık ≥ %60</span>
            <span class="chip chip-high">Zayıf ≥ %40</span>
            <span class="chip chip-critical">Kritik Zayıf &lt; %40</span>
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
        <td>${esc(r.name)}<div class="subtle">Doğuştan risk kaynağı: ${esc(r.source)}</div></td>
        <td class="num">${fmtNum2(r.inherentRisk)}</td>
        <td class="num">${fmtPct1(r.effectiveness)}</td>
        <td class="num"><span class="heat-cell score-pill ${levelClass(r.level)}">${fmtNum2(r.residual)}</span></td>
        <td>${r.level ? `<span class="chip ${levelClass(r.level)}">${esc(r.level)}</span>` : '—'}</td>
        <td class="num">${fmtNum1(r.appetite)}</td>
        <td>${r.breach === null ? '—' : r.breach
          ? `<span class="chip chip-critical">${Icons.alert()} AŞIM — AKSİYON</span>`
          : `<span class="chip chip-ok">İştah içinde</span>`}</td>
      </tr>`).join('');

    host.innerHTML = `
      ${calc.breaches > 0
        ? banner('danger', `${calc.breaches} domain risk iştahını aşıyor`, 'Aşan her domain için aksiyon planında en az bir kayıt bulunmalıdır.')
        : banner('info', 'Artık Risk = Doğuştan Risk × (1 − Kontrol Etkinliği)', 'Varsayılan iştah limiti 1,50 (Orta–Yüksek sınırı). Kurumun onaylı risk iştahına göre güncellenmelidir.')}
      <div class="card">
        <div class="card-head"><h2>Artık risk matrisi</h2></div>
        <div class="card-body" style="padding:0">
          <div class="table-wrap"><table>
            <thead><tr>
              <th>Kod</th><th>Domain</th><th class="num">Doğuştan (1-5)</th><th class="num">Kontrol etkinliği</th>
              <th class="num">Artık risk</th><th>Seviye</th><th class="num">İştah limiti</th><th>Durum</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table></div>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><h2>Artık risk seviyesi eşikleri</h2></div>
        <div class="card-body"><div class="inline-list">
          <span class="chip lvl-cok-yuksek">Çok Yüksek ≥ 3,50</span>
          <span class="chip lvl-yuksek">Yüksek ≥ 2,50</span>
          <span class="chip lvl-orta">Orta ≥ 1,50</span>
          <span class="chip lvl-dusuk">Düşük &lt; 1,50</span>
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
        <td><span class="chip ${levelClass(p.risk)}">${esc(p.risk)}</span></td>
        <td style="width:130px">
          <input type="number" min="0" step="1" id="qa-vol-${i}" data-vol="${esc(p.pop)}" value="${p.volume === null ? '' : p.volume}"
            placeholder="0" aria-label="${esc(p.pop)} yıllık hacim">
        </td>
        <td>${p.full ? '<span class="chip chip-critical">Tam kapsam</span>' : `%${fmtInt(p.rate * 100)} · min ${fmtInt(p.min)}`}</td>
        <td class="num"><b>${fmtInt(p.yearlySample)}</b></td>
        <td>${esc(p.freq)}</td>
        <td class="num">${fmtInt(p.perTest)}</td>
      </tr>`).join('');

    const covered = calc.qa.filter(p => p.volume !== null).length;

    host.innerHTML = `
      ${banner('info', 'Örneklem kuralı',
        'Tam kapsam "Evet" ise tüm popülasyon test edilir. Diğerlerinde örneklem = MAK(hacim × oran, asgari sayı), hacmi aşamaz. Test başına örneklem = yıllık örneklem / frekans, yukarı yuvarlanır.')}
      <div class="grid grid-kpi" style="margin-bottom:16px">
        ${statTile({ label: 'Popülasyon', value: fmtInt(calc.qa.length), foot: `${fmtInt(covered)} tanesinin hacmi girildi` })}
        ${statTile({ label: 'Toplam yıllık hacim', value: fmtInt(calc.qaTotals.volume) })}
        ${statTile({ label: 'Yıllık örneklem', value: fmtInt(calc.qaTotals.yearlySample), foot: 'Test edilecek toplam dosya' })}
        ${statTile({ label: 'Test başına örneklem', value: fmtInt(calc.qaTotals.perTest), foot: 'Tüm popülasyonlar toplamı' })}
      </div>
      <div class="card">
        <div class="card-head"><h2>Yıllık QA planı ve risk bazlı örnekleme</h2></div>
        <div class="card-body" style="padding:0">
          <div class="table-wrap"><table>
            <thead><tr>
              <th>Popülasyon / test odağı</th><th>Domain</th><th>Risk</th><th>Yıllık hacim</th>
              <th>Örneklem kuralı</th><th class="num">Yıllık örneklem</th><th>Frekans</th><th class="num">Test başına</th>
            </tr></thead>
            <tbody>${rows}</tbody>
            <tfoot><tr>
              <td>TOPLAM</td><td></td><td></td>
              <td class="num">${fmtInt(calc.qaTotals.volume)}</td><td></td>
              <td class="num">${fmtInt(calc.qaTotals.yearlySample)}</td><td></td>
              <td class="num">${fmtInt(calc.qaTotals.perTest)}</td>
            </tr></tfoot>
          </table></div>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><h2>Hata sınıflandırması ve kapanış süresi</h2></div>
        <div class="card-body">
          <div class="table-wrap"><table>
            <thead><tr><th>Sınıf</th><th>Tanım</th><th>Kapanış süresi</th></tr></thead>
            <tbody>
              <tr><td>${critChip('Kritik')}</td><td>Bildirim yapılmamış / yaptırım ihlali</td><td>5 iş günü</td></tr>
              <tr><td>${critChip('Yüksek')}</td><td>Gerekçe yetersiz, EDD eksik</td><td>30 gün</td></tr>
              <tr><td>${critChip('Orta')}</td><td>Dokümantasyon eksikliği</td><td>90 gün</td></tr>
              <tr><td>${critChip('Düşük')}</td><td>Gözlem</td><td>Sonraki QA döngüsü</td></tr>
            </tbody>
          </table></div>
          <p class="subtle" style="margin-top:12px">Katmanlama: her örneklem risk seviyesi, ürün, senaryo ve analist bazında tabakalandırılmalıdır.</p>
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
