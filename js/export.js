/* Dışa/içe aktarım ve yönetici raporu. Tüm işlemler tarayıcı içinde; sunucuya veri gitmez. */

const Exporter = (() => {
  const { esc, fmtInt, fmtPct, fmtPct1, fmtNum1, fmtNum2, fmtDate, levelClass, effClass, critChip } = UI;
  const t = (k, p) => I18n.t(k, p);
  const H = k => I18n.t('csvH.' + k);

  function stamp() {
    const d = new Date();
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
  }

  function download(filename, content, mime) {
    const blob = new Blob([content], { type: mime + ';charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* ---------- JSON ---------- */
  function saveJSON() {
    const snap = Store.snapshot();
    const name = (snap.kunye.kurum_unvani || 'kurum').replace(/[^\p{L}\p{N}]+/gu, '-').slice(0, 40);
    download(`${t('fileWorkbook')}-${name}-${stamp()}.json`, JSON.stringify(snap, null, 2), 'application/json');
    // Yedeğin ne zaman ve hangi hacimde alındığı işaretlenir; hatırlatma buna bakar.
    Store.markExported();
    UI.toast(t('savedJson'), 'ok');
  }

  function loadJSON(file) {
    const reader = new FileReader();
    reader.onload = async () => {
      let parsed;
      try { parsed = JSON.parse(reader.result); }
      catch { UI.toast(t('errNotJson'), 'err'); return; }
      if (!parsed || typeof parsed !== 'object' || !('answers' in parsed)) {
        UI.toast(t('errNotOurs'), 'err'); return;
      }
      const hasWork = Object.keys(Store.state.answers).length || (Store.state.actions || []).length;
      if (hasWork) {
        const ok = await UI.confirmDialog({
          title: t('replaceTitle'),
          message: t('replaceMsg'),
          confirmLabel: t('replaceOk'), danger: true
        });
        if (!ok) return;
      }
      Store.replace(parsed);
      UI.toast(t('loadedJson'), 'ok');
    };
    reader.readAsText(file);
  }

  /* ---------- CSV ---------- */
  function csvCell(v) {
    const s = v === null || v === undefined ? '' : String(v);
    return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function toCSV(rows) {
    // Noktalı virgül + BOM: Türkçe Excel yerelinde sütunlar doğru ayrışır.
    return '﻿' + rows.map(r => r.map(csvCell).join(';')).join('\r\n');
  }
  const dec = v => (v === null || v === undefined || v === '') ? '' : String(v).replace('.', ',');

  function exportCSV(kind, calc) {
    const state = Store.state;
    let rows, name;

    if (kind === 'questions') {
      name = t('fileQuestions');
      rows = [[H('questionId'), H('code'), H('domain'), H('section'), H('questionText'), H('answer'),
        H('coefficient'), H('weight'), H('applicableWeight'), H('earned'), H('criticality'),
        H('expectedEvidence'), H('source'), H('qaTest'), H('samplePop'),
        H('evidenceRef'), H('note'), H('actionNeeded'), H('autoNaReason')]];
      const yes = I18n.ref('answers', 'Evet'), no = I18n.ref('answers', 'Hayır');
      DATA.questions.forEach(q => {
        const s = calc.perQuestion[q.id], rec = state.answers[q.id] || {};
        rows.push([q.id, q.domain, q.domainName, q.section, q.text, I18n.ref('answers', s.answer), dec(s.coef), q.weight,
          dec(s.applicableWeight || ''), dec(s.earned || ''), q.crit, q.evidence, q.source,
          q.qa ? yes : no, q.pop, rec.evidence || '', rec.note || '',
          s.actionNeeded === 'EVET - ÖNCELİKLİ' ? t('priorityAction') : s.actionNeeded ? I18n.ref('answers', s.actionNeeded) : '',
          s.scopeReason || '']);
      });
    } else if (kind === 'domains') {
      name = t('fileDomains');
      rows = [[H('code'), H('domain'), H('questionCount'), H('answeredCount'), H('notApplicable'),
        H('applicableWeight'), H('earned'), H('effectiveness'), t('colEffTested'), t('colAssurance'), H('maturity'), H('openCritical'),
        H('actionRequired'), H('inherentRisk'), H('residualRisk'), H('residualLevel'),
        H('appetiteLimit'), H('appetiteBreach')]];
      const byCode = Object.fromEntries(calc.residual.map(r => [r.code, r]));
      calc.domains.forEach(d => {
        const r = byCode[d.code];
        rows.push([d.code, d.name, d.count, d.answered, d.na, dec(d.applicableWeight), dec(d.earned),
          dec(d.effectiveness === null ? '' : d.effectiveness.toFixed(4)),
          dec(d.effectivenessTested === null ? '' : d.effectivenessTested.toFixed(4)),
          dec(d.assurance === null ? '' : d.assurance.toFixed(4)),
          I18n.ref('maturity', d.maturity), d.openCritical, d.actionsNeeded,
          dec(r.inherentRisk === null ? '' : r.inherentRisk.toFixed(2)),
          dec(r.residual === null ? '' : r.residual.toFixed(2)),
          I18n.ref('riskLevel', r.level), dec(r.appetite),
          r.breach === null ? '' : (r.breach ? t('breachAction') : t('withinAppetiteFull'))]);
      });
    } else if (kind === 'qa') {
      name = t('fileQa');
      rows = [[H('population'), H('domain'), H('riskLevel'), H('annualVolume'), H('fullCoverage'),
        H('sampleRate'), H('minSample'), H('annualSample'), H('testFrequency'),
        H('samplePerTest'), H('testFocus')]];
      calc.qa.forEach(p => rows.push([p.pop, p.domain, p.risk, p.volume ?? '',
        p.full ? I18n.ref('answers', 'Evet') : I18n.ref('answers', 'Hayır'),
        dec(p.rate), p.min, p.yearlySample ?? '', p.freq, p.perTest ?? '', p.focus]));
    } else if (kind === 'actions') {
      name = t('fileActions');
      rows = [[H('findingId'), H('domain'), H('relatedQuestion'), H('findingText'), H('source'),
        H('rootCause'), H('criticality'), H('action'), H('owner'), H('due'), H('verification'),
        H('status'), H('delay'), H('closedAt'), H('residualAfter')]];
      calc.actions.forEach(a => rows.push([a.id, a.domain, a.questionId, a.finding, a.source,
        I18n.ref('rootCause', a.rootCause), I18n.ref('crit', a.crit),
        a.action, a.owner, a.due, a.verification, I18n.ref('status', a.status),
        a.delay === 'GECİKMİŞ' ? t('overdue') : a.delay === 'Kapalı' ? t('closed') : a.delay,
        a.closedAt, I18n.ref('riskLevel', a.residualAfter)]));
    } else if (kind === 'operations') {
      name = t('fileOperations');
      const O = calc.operations;
      const LL = o => (o ? (I18n.isEn ? (o.en || o.tr) : o.tr) : '');
      rows = [[t('opMetric'), LL(OPERATIONS.units.adet), LL(OPERATIONS.units.tutar),
        LL(OPERATIONS.units.gun), LL(OPERATIONS.units.saat)]];
      OPERATIONS.groups.forEach(g => {
        rows.push([]);
        rows.push([LL(g)]);
        g.metrics.forEach(m => {
          const rec = (state.operations || {})[m.key] || {};
          rows.push([LL(m), rec.adet ?? '', rec.tutar ?? '', rec.gun ?? '', rec.saat ?? '']);
        });
      });
      rows.push([]);
      rows.push([t('opDerivedTitle')]);
      rows.push([t('opRatio'), t('opNumerator'), t('opDenominator'), t('opValue')]);
      O.derived.forEach(d => rows.push([LL(d.spec), d.num ?? '', d.den ?? '',
        d.value === null ? '' : dec((d.value * 100).toFixed(2)) + '%']));
    } else if (kind === 'countries') {
      name = 'country-risk';
      rows = [[t('pfCountry'), 'ISO', t('csFlagsCol'), t('status')]];
      COUNTRIES.forEach(c => {
        const fl = CountryRisk.flags(c.code, state);
        rows.push([CountryRisk.label(c), c.code,
          fl.map(k => { const f = PORTFOLIO.countryFlags.find(x => x.key === k); return f ? CountryRisk.label(f) : k; }).join(' | '),
          CountryRisk.isOverridden(c.code, state) ? t('csModified') : t('csDefault')]);
      });
    } else if (kind === 'portfolio') {
      name = t('filePortfolio');
      const P = calc.portfolio;
      const LL = o => (o ? (I18n.isEn ? (o.en || o.tr) : o.tr) : '');
      rows = [[t('pfMatrixTitle')]];
      rows.push([t('pfCustomerType'), ...DATA.ref.riskLevel.slice().reverse().map(r => I18n.ref('riskLevel', r)), t('total')]);
      PORTFOLIO.customerTypes.forEach(ct => {
        const row = (Store.state.portfolio.matrix || {})[ct.key] || {};
        rows.push([LL(ct), ...PORTFOLIO.riskBands.map(b => row[b.key] ?? ''), P.byType[ct.key] || '']);
      });
      rows.push([t('total'), ...PORTFOLIO.riskBands.map(b => P.byBand[b.key] || ''), P.total || '']);

      rows.push([]);
      rows.push([t('pfSegmentTitle')]);
      rows.push([t('pfSegment'), t('pfCustomers'), t('pfHighRisk'), t('pfShare'), t('pfBase')]);
      PORTFOLIO.segments.forEach(sg => {
        const g = P.segments[sg.key];
        rows.push([LL(sg), g.filled ? g.customers : '', g.highRisk || '',
          g.share === null ? '' : dec((g.share * 100).toFixed(2)) + '%',
          sg.base === 'tuzel' ? t('pfBaseEntities') : t('pfBaseAll')]);
      });

      rows.push([]);
      rows.push([t('pfCountryTitle')]);
      rows.push([t('pfCountry'), t('csvH.code'), t('pfRiskFlags'), t('pfRelation'),
        t('pfCustomers'), t('pfTxIn'), t('pfTxOut'), t('pfTxTotal')]);
      P.countries.rows.forEach(c => {
        rows.push([c.name || '', c.code || '',
          (c.flags || []).map(f => LL(PORTFOLIO.countryFlags.find(x => x.key === f))).join(' | '),
          (c.relations || []).map(r => LL(PORTFOLIO.countryRelations.find(x => x.key === r))).join(' | '),
          c.customers || '', c.txIn || '', c.txOut || '', c.tx || '']);
      });
      rows.push([t('total'), '', '', '', P.countries.customers, P.countries.txIn, P.countries.txOut, P.countries.tx]);

      rows.push([]);
      rows.push([t('pfBranchTitle')]);
      rows.push([t('pfBranchName'), t('pfBranchType'), t('pfCountry'), t('pfCustomers'),
        t('pfHighRisk'), t('pfComplianceFte'), t('pfLoad'), t('pfLastAudit'), t('pfAuditAge')]);
      P.branches.rows.forEach(b => {
        rows.push([b.name || '', LL(PORTFOLIO.branchTypes.find(x => x.key === b.type)), b.country || '',
          b.customers || '', b.highRiskCustomers || '', b.complianceFte ?? '',
          b.load === null ? '' : Math.round(b.load), b.lastAudit || '',
          b.auditMonths === null ? '' : b.auditMonths]);
      });
    } else if (kind === 'inherent') {
      name = t('fileInherent');
      rows = [[H('riskDimension'), H('subFactor'), H('score'), H('scoreDesc'), H('state'),
        H('weight'), H('defaultWeight'), H('weightedScore'), H('rationale'), H('feedsDomains')]];
      calc.inherent.factors.forEach(({ f, st }) => {
        rows.push([f.dim, f.factor, st.score || '',
          st.score ? f.anchors[st.score - 1] : '',
          st.na ? (st.manualNA ? t('notApplicable') : st.scopeReason) : (st.scored ? H('scoredState') : H('notScoredState')),
          dec(st.weight), dec(f.weight), st.weighted === null ? '' : dec(st.weighted.toFixed(1)),
          st.note, ((DATA.dimDomains || {})[f.dimKey] || []).join(' ')]);
      });
      rows.push([]);
      rows.push([I18n.isEn ? RISKMODEL.pf.en : RISKMODEL.pf.tr]);
      rows.push([H('subFactor'), H('score'), H('weight'), H('state'), H('rationale')]);
      calc.pf.factors.forEach(f => rows.push([
        I18n.isEn ? f.spec.en : f.spec.tr, f.score || '', f.spec.weight,
        f.na ? t('notApplicable') : (f.score ? H('scoredState') : H('notScoredState')), f.note]));
      rows.push([t('blInherent'), calc.pf.measured ? dec(calc.pf.value.toFixed(2)) : '',
        '', I18n.ref('riskLevel', calc.pf.level), '']);

      rows.push([]);
      rows.push([t('blTitle')]);
      rows.push([t('blLine'), t('blShare'), ...RISKMODEL.businessLines.dims.map(d => I18n.dim(d)), t('blInherent')]);
      calc.lines.lines.filter(l => l.active).forEach(l => rows.push([
        I18n.isEn ? l.spec.en : l.spec.tr, l.share ?? '',
        ...RISKMODEL.businessLines.dims.map(d => l.scores[d] ?? ''),
        l.inherent === null ? '' : dec(l.inherent.toFixed(2))]));
      rows.push([t('blWeighted'), dec(calc.lines.shareSum), '', '', '', '', '',
        calc.lines.weightedInherent === null ? '' : dec(calc.lines.weightedInherent.toFixed(2))]);

      rows.push([]);
      rows.push([H('dimension'), H('inherentScore'), H('residualLevel'), H('scored'), H('applicable'), H('notApplicable')]);
      Calc.DIMS.concat(['GENEL']).forEach(d => {
        const v = calc.inherent.dims[d];
        rows.push([I18n.dim(d), v.measured ? dec(v.value.toFixed(2)) : '',
          I18n.ref('riskLevel', v.level), v.scored, v.applicable, v.na]);
      });
    }

    download(`${name}-${stamp()}.csv`, toCSV(rows), 'text/csv');
    UI.toast(t('csvDone'), 'ok');
  }

  /* ---------- Yönetici raporu ---------- */
  function report(host, { state, calc }) {
    const tot = calc.totals, inh = calc.inherent;
    const k = state.kunye;
    const kv = (label, val) => `<tr><td style="width:38%">${esc(label)}</td><td><b>${esc(val || '—')}</b></td></tr>`;

    const topGaps = DATA.questions
      .map(q => ({ q, s: calc.perQuestion[q.id] }))
      .filter(x => x.s.openCritical)
      .slice(0, 15);

    // PF ayrı bir satır ama aşım sayımına girer — pano rozeti de onu sayıyor.
    const breaches = calc.residual.filter(r => r.breach).concat(calc.pfLine.breach ? [calc.pfLine] : []);
    const overdue = calc.actions.filter(a => a.delay === 'GECİKMİŞ');

    host.innerHTML = `
      <div class="toolbar no-print">
        <div style="flex:1" class="subtle">${t('reportPrintNote')}</div>
        <div class="toolbar-actions">
          <button class="btn btn-primary" onclick="window.print()">${Icons.print()} ${t('printPdf')}</button>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <div>
            <h2>${t('reportTitle')}</h2>
            <div class="subtle">${esc(k.kurum_unvani || t('noInstitution'))} · ${t('assessPeriod')}: ${esc(calc.kunye.periodLabel || '—')} · ${t('reportDate')}: ${fmtDate(new Date())}</div>
          </div>
        </div>
        <div class="card-body">
          <div class="grid grid-kpi">
            ${UI.statTile({ label: t('colEffTested'), value: fmtPct1(tot.effectivenessTested),
              foot: `${t('colEffDeclared')} ${fmtPct1(tot.effectiveness)} · ${esc(tot.maturity ? I18n.ref('maturity', tot.maturity) : '—')}` })}
            ${UI.statTile({ label: t('csvH.inherentRisk'), value: inh.measured ? fmtNum2(inh.general) : '—', unit: '/5',
              foot: inh.measured ? esc(I18n.ref('riskLevel', inh.dims.GENEL.level)) + ` · ${inh.scored}/${inh.applicable} ${t('factor')}` : t('notMeasured') })}
            ${UI.statTile({ label: t('colResidual'), value: fmtNum2(calc.generalResidual), unit: '/5',
              foot: calc.generalResidual === null ? '—' : esc(I18n.ref('riskLevel', Calc.residualLevel(calc.generalResidual))) })}
            ${UI.statTile({ label: t('coverage'), value: `${fmtInt(tot.answered)} / ${fmtInt(tot.count)}`, foot: t('answeredPct', { p: fmtPct(tot.progress) }) })}
          </div>

          <div class="divider"></div>
          <h3>${t('sectionProfile')}</h3>
          <div class="table-wrap"><table><tbody>
            ${['yukumlu_tipi', 'faaliyet_gosterilen_ulkeler', 'degerlendirmeyi_yapan', 'uyum_gorevlisi'].map(id => {
              const fd = DATA.kunyeFields.find(x => x.id === id);
              let v = k[id];
              if (fd && fd.optionKeys && v) { const i = fd.optionKeys.indexOf(v); if (i >= 0) v = fd.options[i]; }
              return kv(fd ? fd.label : id, v);
            }).join('')}
            ${kv(DATA.kunyeFields.find(x => x.id === 'toplam_musteri_sayisi').label,
                 k.toplam_musteri_sayisi ? UI.fmtInt(Number(k.toplam_musteri_sayisi)) : '')}
            ${kv(DATA.kunyeFields.find(x => x.id === 'uyum_birimi_kadrosu_fte').label, k.uyum_birimi_kadrosu_fte)}
            ${calc.kunye.ratios.filter(r => r.value !== null).map(r =>
              kv(r.label, r.format === 'int' ? UI.fmtInt(Math.round(r.value)) : UI.fmtPct1(r.value))).join('')}
            ${calc.kunye.stale.map(s => kv(s.field.label,
              (k[s.field.id] ? fmtDate(k[s.field.id]) : '—') +
              (s.overdue ? ` — ${s.months} ${t('monthsShort')}, ${t('exceededMonths', { n: s.field.staleMonths })}` : ''))).join('')}
          </tbody></table></div>

          ${calc.masksBreach ? `<p><b style="color:var(--warn)">${t('bnMasksTtl')}:</b>
            ${t('bnMasksBody', { g: fmtNum2(calc.generalResidual), d: calc.worstDomain.code, r: fmtNum2(calc.worstDomain.residual) })}</p>` : ''}
          ${calc.portfolio && calc.portfolio.sectionsFilled ? `
          <div class="divider"></div>
          <h3>${t('ttlPortfolio')}</h3>
          <div class="table-wrap"><table><tbody>
            ${calc.portfolio.matrixFilled ? kv(t('pfTotalCustomers'), fmtInt(calc.portfolio.total)) : ''}
            ${calc.portfolio.highRiskShare !== null ? kv(t('pfHighRiskShare'),
               `${fmtPct1(calc.portfolio.highRiskShare)} (${fmtInt(calc.portfolio.highRisk)})`) : ''}
            ${calc.portfolio.entityShare !== null ? kv(t('pfEntityShare'), fmtPct1(calc.portfolio.entityShare)) : ''}
            ${calc.portfolio.countries.count ? kv(t('pfCountryExposure'),
               `${fmtInt(calc.portfolio.countries.count)} · ${t('pfFlaggedCountries', { n: fmtInt(calc.portfolio.countries.flagged) })}`) : ''}
            ${calc.portfolio.countries.shares.fatfTx !== null ? kv(t('pfFatfTxShare'), fmtPct1(calc.portfolio.countries.shares.fatfTx)) : ''}
            ${calc.portfolio.countries.shares.sanctionedTx !== null ? kv(t('pfSanctionedTxShare'), fmtPct1(calc.portfolio.countries.shares.sanctionedTx)) : ''}
            ${calc.portfolio.countries.shares.crossBorder !== null ? kv(t('pfCrossBorderShare'), fmtPct1(calc.portfolio.countries.shares.crossBorder)) : ''}
            ${calc.portfolio.branches.count ? kv(t('pfBranchNetwork'),
               `${fmtInt(calc.portfolio.branches.count)} · ${t('pfForeignUnits', { n: fmtInt(calc.portfolio.branches.foreign), c: fmtInt(calc.portfolio.branches.countries) })}`) : ''}
            ${calc.portfolio.branches.count ? kv(t('pfAuditOverdue'), fmtInt(calc.portfolio.branches.auditOverdue)) : ''}
          </tbody></table></div>` : ''}

          <div class="divider"></div>
          <h3>${t('sectionInherentProfile')}</h3>
          <div class="table-wrap"><table>
            <thead><tr><th>${t('dimension')}</th><th class="num">${t('csvH.score')}</th><th>${t('level')}</th><th class="num">${t('coverage')}</th><th>${t('feedsDomains')}</th></tr></thead>
            <tbody>${Calc.DIMS.map(d => {
              const v = inh.dims[d];
              return `<tr><td>${esc(I18n.dim(d))}</td>
                <td class="num"><span class="heat-cell score-pill ${levelClass(v.level)}">${v.measured ? fmtNum2(v.value) : '—'}</span></td>
                <td>${esc(v.level ? I18n.ref('riskLevel', v.level) : t('notMeasured'))}</td>
                <td class="num">${v.scored}/${v.applicable}${v.na ? ` (${v.na} N/A)` : ''}</td>
                <td class="subtle">${((DATA.dimDomains || {})[d] || []).join(' · ')}</td></tr>`;
            }).join('')}</tbody>
          </table></div>
          ${inh.drivers.length ? `<p style="margin-top:10px"><b>${t('dominantDrivers')}:</b>
            ${inh.drivers.slice(0, 5).map(d => `${esc(d.factor)} (${d.score}×${fmtNum1(d.weight)})`).join(' · ')}</p>` : ''}

          ${calc.pf.measured || calc.lines.weightedInherent !== null ? `
          <div class="divider"></div>
          <h3>${t('rptRiskModel')}</h3>
          <div class="table-wrap"><table><tbody>
            ${calc.pf.measured ? kv(esc(I18n.isEn ? RISKMODEL.pf.en : RISKMODEL.pf.tr),
              `${fmtNum2(calc.pf.value)} / 5 · ${esc(I18n.ref('riskLevel', calc.pf.level))}`) : ''}
            ${calc.pfLine.residual !== null ? kv(t('colResidual') + ' (PF)',
              `${fmtNum2(calc.pfLine.residual)} · ${esc(I18n.ref('riskLevel', calc.pfLine.level))}${calc.pfLine.breach ? ' — ' + t('breachAction') : ''}`) : ''}
            ${calc.lines.weightedInherent !== null ? kv(t('blWeighted'), fmtNum2(calc.lines.weightedInherent)) : ''}
            ${calc.inherent.measured ? kv(t('blDimBased'), fmtNum2(calc.inherent.general)) : ''}
            ${calc.lines.worst && calc.lines.worst.inherent !== null
              ? kv(t('blWorst'), `${esc(I18n.isEn ? calc.lines.worst.spec.en : calc.lines.worst.spec.tr)} · ${fmtNum2(calc.lines.worst.inherent)}`) : ''}
          </tbody></table></div>
          ${calc.pf.measured ? `<p class="subtle">${t('pfSeparateNote')}</p>` : ''}` : ''}

          <div class="divider"></div>
          <h3>${t('sectionDomainResults')}</h3>
          <div class="table-wrap"><table>
            <thead><tr><th>${t('colCode')}</th><th>${t('domain')}</th><th class="num">${t('colEffectiveness')}</th><th>${t('maturityLabel')}</th>
              <th class="num">${t('colResidual')}</th><th>${t('level')}</th><th>${t('colAppetite')}</th><th class="num">${t('colOpenCrit')}</th></tr></thead>
            <tbody>${calc.residual.map(r => {
              const d = calc.domains.find(x => x.code === r.code);
              return `<tr>
                <td class="mono"><b>${esc(r.code)}</b></td><td>${esc(r.name)}</td>
                <td class="num"><span class="heat-cell score-pill ${effClass(d.effectivenessTested)}">${fmtPct(d.effectivenessTested)}</span>
                  <div class="subtle">${t('colEffDeclared')} ${fmtPct(d.effectiveness)}</div></td>
                <td>${esc(d.maturity ? I18n.ref('maturity', d.maturity) : '—')}</td>
                <td class="num"><span class="heat-cell score-pill ${levelClass(r.level)}">${fmtNum2(r.residual)}</span></td>
                <td>${esc(r.level ? I18n.ref('riskLevel', r.level) : '—')}</td>
                <td>${r.breach === null ? '—' : r.breach ? `<b style="color:var(--danger)">${t('breach')}</b>` : t('withinAppetite')}</td>
                <td class="num">${fmtInt(d.openCritical)}</td>
              </tr>`;
            }).join('')}</tbody>
          </table></div>

          <div class="divider"></div>
          <h3>${t('sectionBreaches')} (${breaches.length})</h3>
          ${breaches.length ? `<ul>${breaches.map(r =>
            `<li><b>${esc(r.code)} ${esc(r.name)}</b> — ${t('residualOver', { r: fmtNum2(r.residual), a: fmtNum1(r.appetite) })} (${esc(I18n.ref('riskLevel', r.level))})</li>`).join('')}</ul>`
            : `<p class="muted">${t('noBreaches')}</p>`}

          <div class="divider"></div>
          <h3>${t('sectionOpenCrit')} (${tot.openCritical})</h3>
          ${topGaps.length ? `<div class="table-wrap"><table>
            <thead><tr><th>${t('colQuestions')}</th><th>${t('colControl')}</th><th>${t('colAnswer')}</th><th>${t('evidenceRef')}</th></tr></thead>
            <tbody>${topGaps.map(({ q, s }) => `<tr>
              <td class="mono">${esc(q.id)}</td><td>${esc(q.text)}</td>
              <td>${esc(I18n.ref('answers', s.answer))}</td><td>${esc((state.answers[q.id] || {}).evidence || '—')}</td>
            </tr>`).join('')}</tbody></table></div>
            ${tot.openCritical > topGaps.length ? `<p class="subtle">${t('firstNShown', { n: topGaps.length })}</p>` : ''}`
            : `<p class="muted">${t('noOpenCrit')}</p>`}

          <div class="divider"></div>
          <h3>${t('sectionActions')}</h3>
          <p>${t('actionsSummary', { t: fmtInt(calc.actionStats.total), o: fmtInt(calc.actionStats.open),
               d: fmtInt(calc.actionStats.overdue), c: fmtPct(calc.actionStats.closureRate) })}</p>
          ${overdue.length ? `<div class="table-wrap"><table>
            <thead><tr><th>${t('colFindingId')}</th><th>${t('csvH.findingText')}</th><th>${t('colOwner')}</th><th>${t('colDue')}</th><th>${t('criticality')}</th></tr></thead>
            <tbody>${overdue.map(a => `<tr><td class="mono">${esc(a.id)}</td><td>${esc(a.finding)}</td>
              <td>${esc(a.owner || '—')}</td><td>${fmtDate(a.due)}</td><td>${critChip(a.crit)}</td></tr>`).join('')}
            </tbody></table></div>` : ''}

          <div class="divider"></div>
          <h3>${t('signTtl')}</h3>
          <p class="subtle no-print">${t('signBody')} ${t('signHint')}</p>
          ${signBlock(state)}

          <div class="divider"></div>
          <p class="subtle">${t('reportMethod')}</p>
        </div>
      </div>`;

    host.addEventListener('input', e => {
      const f = e.target.closest('[data-sign]');
      if (!f) return;
      Store.update(s => {
        s.signoff = s.signoff || {};
        s.signoff[f.dataset.sign] = s.signoff[f.dataset.sign] || {};
        s.signoff[f.dataset.sign][f.dataset.field] = f.value;
      }, { silent: true });
    });
  }

  /** Hazırlayan / gözden geçiren / onaylayan. Boş satır imza yeri olarak basılır. */
  function signBlock(state) {
    const so = state.signoff || {};
    const roles = [['prepared', t('signPrepared')], ['reviewed', t('signReviewed')], ['approved', t('signApproved')]];
    return `<div class="table-wrap"><table class="sign-table">
      <thead><tr><th style="width:22%"></th><th>${t('signName')}</th><th style="width:22%">${t('signDate')}</th><th class="only-print" style="width:26%"></th></tr></thead>
      <tbody>${roles.map(([key, label]) => {
        const rec = so[key] || {};
        return `<tr>
          <td><b>${esc(label)}</b></td>
          <td>
            <input class="no-print" type="text" id="sg-${key}" data-sign="${key}" data-field="name"
              value="${esc(rec.name || '')}" placeholder="${esc(t('signName'))}" aria-label="${esc(label)} — ${t('signName')}">
            <span class="only-print">${esc(rec.name || '')}</span>
          </td>
          <td>
            <input class="no-print" type="date" id="sd-${key}" data-sign="${key}" data-field="date"
              value="${esc(rec.date || '')}" aria-label="${esc(label)} — ${t('signDate')}">
            <span class="only-print">${rec.date ? fmtDate(rec.date) : ''}</span>
          </td>
          <td class="only-print sign-line"></td>
        </tr>`;
      }).join('')}</tbody>
    </table></div>`;
  }

  return { saveJSON, loadJSON, exportCSV, report };
})();
