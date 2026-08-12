/* Portföy ve maruziyet: müşteri dağılımı, segmentler, ülke maruziyeti, şube ağı.
   Girilen sayılar doğuştan risk skor önerilerini ve künye oranlarını besler. */

const Portfolio = (() => {
  const { esc, fmtInt, fmtPct, fmtPct1, fmtNum1, fmtDate, levelClass, meter, statTile, emptyState } = UI;
  const t = (k, p) => I18n.t(k, p);
  const L = o => (o ? (I18n.isEn ? (o.en || o.tr) : o.tr) : '');
  /** Kısa etiket varsa onu kullan; tam metin başlık (title) olarak kalır. */
  const S = o => (o && o.short ? L(o.short) : L(o));

  /* ---------- Durum yardımcıları ---------- */

  function blank() {
    return { matrix: {}, segments: {}, countries: [], branches: [] };
  }

  function pf(state) {
    if (!state.portfolio) state.portfolio = blank();
    const p = state.portfolio;
    p.matrix = p.matrix || {};
    p.segments = p.segments || {};
    p.countries = p.countries || [];
    p.branches = p.branches || [];
    return p;
  }

  const num = v => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };
  const has = v => v !== '' && v !== null && v !== undefined && Number.isFinite(Number(v));

  /* ---------- Hesaplama ---------- */

  /** Tüm portföy istatistikleri ve türetilen oranlar. */
  function compute(state) {
    const p = pf(state);

    /* Müşteri tipi × risk matrisi */
    const byType = {}, byBand = {};
    PORTFOLIO.riskBands.forEach(b => byBand[b.key] = 0);
    let total = 0, highRisk = 0, entities = 0;

    PORTFOLIO.customerTypes.forEach(ct => {
      const row = p.matrix[ct.key] || {};
      let rowTotal = 0;
      PORTFOLIO.riskBands.forEach(b => {
        const n = num(row[b.key]);
        rowTotal += n;
        byBand[b.key] += n;
        if (b.key === 'Yüksek' || b.key === 'Çok Yüksek') highRisk += n;
      });
      byType[ct.key] = rowTotal;
      total += rowTotal;
      if (['tuzel_kisi', 'tuzel_olmayan', 'trust_benzeri', 'kar_amacsiz'].includes(ct.key)) entities += rowTotal;
    });

    const matrixFilled = total > 0;

    /* Segmentler */
    const seg = {};
    PORTFOLIO.segments.forEach(s => {
      const rec = p.segments[s.key] || {};
      const base = s.base === 'tuzel' ? entities : total;
      seg[s.key] = {
        spec: s,
        customers: num(rec.customers),
        highRisk: num(rec.highRisk),
        note: rec.note || '',
        filled: has(rec.customers),
        base,
        share: base > 0 && has(rec.customers) ? num(rec.customers) / base : null
      };
    });

    /* Ülke maruziyeti */
    const flagTotals = {};
    PORTFOLIO.countryFlags.forEach(f => flagTotals[f.key] = { customers: 0, tx: 0, countries: 0 });
    let cCustomers = 0, cTx = 0, cTxIn = 0, cTxOut = 0, corrTotal = 0, corrRisky = 0, crossTx = 0;

    const countries = p.countries.map(c => {
      const customers = num(c.customers);
      const txIn = num(c.txIn), txOut = num(c.txOut);
      const tx = txIn + txOut;
      const flags = c.flags || [];
      cCustomers += customers; cTx += tx; cTxIn += txIn; cTxOut += txOut;
      flags.forEach(f => {
        if (!flagTotals[f]) return;
        flagTotals[f].customers += customers;
        flagTotals[f].tx += tx;
        flagTotals[f].countries += 1;
      });
      const domestic = (c.relations || []).includes('yurt_ici');
      if (!domestic) crossTx += tx;
      const isCorr = (c.relations || []).includes('muhabir');
      if (isCorr) { corrTotal += 1; if (flags.length) corrRisky += 1; }
      // En ağır bayrak satırın risk tonunu belirler
      const worst = PORTFOLIO.countryFlags
        .filter(f => flags.includes(f.key))
        .sort((a, b) => b.weight - a.weight)[0] || null;
      return Object.assign({}, c, { customers, txIn, txOut, tx, flags, worst, isCorr, domestic });
    });

    const anyFlag = c => (c.flags || []).length > 0;
    const fatfListed = countries.filter(c => c.flags.includes('fatfGrey') || c.flags.includes('fatfBlack'));
    const sanctioned = countries.filter(c => c.flags.includes('sanctioned'));
    const offshore = countries.filter(c => c.flags.includes('offshore'));

    const sum = (arr, k) => arr.reduce((a, c) => a + c[k], 0);
    const shareOf = (v, base) => base > 0 ? v / base : null;

    const countryStats = {
      rows: countries,
      count: countries.length,
      customers: cCustomers,
      tx: cTx, txIn: cTxIn, txOut: cTxOut, crossTx,
      flagged: countries.filter(anyFlag).length,
      fatf: { countries: fatfListed.length, customers: sum(fatfListed, 'customers'), tx: sum(fatfListed, 'tx') },
      sanctioned: { countries: sanctioned.length, customers: sum(sanctioned, 'customers'), tx: sum(sanctioned, 'tx') },
      offshore: { countries: offshore.length, customers: sum(offshore, 'customers'), tx: sum(offshore, 'tx') },
      flagTotals,
      correspondent: { total: corrTotal, risky: corrRisky },
      shares: {
        fatfTx: shareOf(sum(fatfListed, 'tx'), cTx),
        sanctionedTx: shareOf(sum(sanctioned, 'tx'), cTx),
        offshoreCustomers: shareOf(sum(offshore, 'customers'), matrixFilled ? total : cCustomers),
        corrRisky: corrTotal > 0 ? corrRisky / corrTotal : null
      }
    };

    // Sınır ötesi işlem payı: künyedeki toplam işlem adedi payda
    const annualTx = Number(state.kunye.yillik_islem_adedi);
    // Sınır ötesi pay: yurt içi işaretli ülkeler paydan çıkarılır.
    countryStats.shares.crossBorder = Number.isFinite(annualTx) && annualTx > 0
      ? crossTx / annualTx
      : (cTx > 0 ? crossTx / cTx : null);

    /* Şube ve birim ağı */
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const branches = p.branches.map(b => {
      const customers = num(b.customers);
      const hr = num(b.highRiskCustomers);
      const fte = Number(b.complianceFte);
      const months = Calc.monthsSince(b.lastAudit);
      return Object.assign({}, b, {
        customers, highRiskCustomers: hr,
        complianceFte: Number.isFinite(fte) && fte > 0 ? fte : null,
        auditMonths: months,
        auditOverdue: months === null || months > 24,
        hrShare: customers > 0 ? hr / customers : null,
        load: Number.isFinite(fte) && fte > 0 ? customers / fte : null,
        foreign: ['yurtdisi', 'istirak', 'temsilcilik'].includes(b.type)
      });
    });

    const byBranchType = {};
    PORTFOLIO.branchTypes.forEach(bt => byBranchType[bt.key] = 0);
    branches.forEach(b => { if (byBranchType[b.type] !== undefined) byBranchType[b.type] += 1; });

    const branchCustomers = branches.reduce((a, b) => a + b.customers, 0);
    const branchStats = {
      rows: branches,
      count: branches.length,
      byType: byBranchType,
      foreign: branches.filter(b => b.foreign).length,
      agents: byBranchType.acente || 0,
      auditOverdue: branches.filter(b => b.auditOverdue).length,
      customers: branchCustomers,
      coverage: matrixFilled && branchCustomers > 0 ? branchCustomers / total : null,
      countries: [...new Set(branches.map(b => b.country).filter(Boolean))].length,
      topLoad: branches.filter(b => b.load !== null).sort((a, b) => b.load - a.load)[0] || null
    };

    /* Tutarlılık uyarıları */
    const warnings = [];
    const kunyeTotal = Number(state.kunye.toplam_musteri_sayisi);
    if (matrixFilled && Number.isFinite(kunyeTotal) && kunyeTotal > 0 && Math.abs(kunyeTotal - total) / kunyeTotal > 0.01) {
      warnings.push(t('pfWarnTotalMismatch', { m: fmtInt(total), k: fmtInt(kunyeTotal) }));
    }
    PORTFOLIO.segments.forEach(s => {
      const g = seg[s.key];
      if (g.filled && matrixFilled && g.customers > g.base && g.base > 0) {
        warnings.push(t('pfWarnSegmentOver', { s: L(s) }));
      }
      if (g.highRisk > g.customers && g.filled) warnings.push(t('pfWarnSegmentHr', { s: L(s) }));
    });
    if (matrixFilled && cCustomers > total * 1.01) warnings.push(t('pfWarnCountryOver'));
    if (branchCustomers > 0 && matrixFilled && branchCustomers > total * 1.01) warnings.push(t('pfWarnBranchOver'));
    if (Number.isFinite(annualTx) && annualTx > 0 && cTx > annualTx * 1.01) {
      warnings.push(t('pfWarnCrossBorderOver'));
    }

    /* Doğuştan risk skor önerileri */
    const hints = {};
    const addHint = (factorKey, share, bands, label) => {
      if (share === null || share === undefined || !bands) return;
      const pct = share * 100;
      const suggested = bands.findIndex(b => pct < b) + 1 || 5;
      hints[factorKey] = { pct, suggested, label, source: 'portfolio' };
    };

    if (matrixFilled) {
      addHint('Müşteri|Yüksek riskli müşteri segmentlerinin payı', highRisk / total, [1, 3, 7, 15], t('pfHighRiskShare'));
    }
    PORTFOLIO.segments.forEach(s => {
      if (!s.feeds || !s.bands) return;
      const g = seg[s.key];
      if (g.share !== null) addHint(s.feeds, g.share, s.bands, L(s));
    });
    addHint('Coğrafya ve Yaptırım|FATF gri/kara liste ülkeleriyle iş hacmi',
      countryStats.shares.fatfTx, [0.5, 1, 5, 10], t('pfFatfTxShare'));
    addHint('Coğrafya ve Yaptırım|Yaptırım rejimi altındaki ülkelere komşuluk/ticaret',
      countryStats.shares.sanctionedTx, [0.1, 0.5, 2, 5], t('pfSanctionedTxShare'));
    addHint('Coğrafya ve Yaptırım|Muhabir bankacılık ağının coğrafi riski',
      countryStats.shares.corrRisky, [1, 15, 35, 60], t('pfCorrRiskyShare'));
    addHint('Coğrafya ve Yaptırım|Sınır ötesi transfer hacminin toplam içindeki payı',
      countryStats.shares.crossBorder, [5, 15, 30, 50], t('pfCrossBorderShare'));
    addHint('İşlem|Sınır ötesi elektronik transfer yoğunluğu',
      countryStats.shares.crossBorder, [5, 15, 30, 50], t('pfCrossBorderShare'));

    const filledCount = (matrixFilled ? 1 : 0)
      + (Object.values(seg).some(s => s.filled) ? 1 : 0)
      + (countries.length ? 1 : 0)
      + (branches.length ? 1 : 0);

    return {
      matrixFilled, total, highRisk, entities, byType, byBand,
      highRiskShare: matrixFilled ? highRisk / total : null,
      entityShare: matrixFilled ? entities / total : null,
      segments: seg, countries: countryStats, branches: branchStats,
      warnings, hints, sectionsFilled: filledCount
    };
  }

  /* ---------- Ekran ---------- */

  function view(host, ctx) {
    const { state } = ctx;
    const p = compute(state);

    host.innerHTML = `
      ${p.warnings.length ? Views.banner('danger', t('pfWarnTitle'), p.warnings.join(' ')) : ''}
      ${p.sectionsFilled === 0
        ? Views.banner('info', t('pfIntroTitle'), t('pfIntroBody'))
        : Views.banner('info', t('pfFeedsTitle'), t('pfFeedsBody', { n: Object.keys(p.hints).length }))}

      <div class="grid grid-kpi" style="margin-bottom:16px">
        ${statTile({ label: t('pfTotalCustomers'), value: p.matrixFilled ? fmtInt(p.total) : '—',
          foot: p.matrixFilled ? t('pfFromMatrix') : t('pfMatrixEmpty') })}
        ${statTile({ label: t('pfHighRiskShare'), value: fmtPct1(p.highRiskShare),
          tone: p.highRiskShare === null ? '' : p.highRiskShare >= 0.15 ? 'danger' : p.highRiskShare >= 0.07 ? 'warn' : 'ok',
          foot: p.matrixFilled ? `${fmtInt(p.highRisk)} / ${fmtInt(p.total)}` + meter(p.highRiskShare) : '—' })}
        ${statTile({ label: t('pfCountryExposure'), value: fmtInt(p.countries.count),
          foot: t('pfFlaggedCountries', { n: fmtInt(p.countries.flagged) }) })}
        ${statTile({ label: t('pfFatfTxShare'), value: fmtPct1(p.countries.shares.fatfTx),
          tone: p.countries.shares.fatfTx === null ? '' : p.countries.shares.fatfTx >= 0.05 ? 'danger' : p.countries.shares.fatfTx > 0 ? 'warn' : 'ok',
          foot: t('pfFatfCountries', { n: fmtInt(p.countries.fatf.countries) }) })}
        ${statTile({ label: t('pfCrossBorderShare'), value: fmtPct1(p.countries.shares.crossBorder),
          foot: p.countries.shares.crossBorder === null ? t('pfNeedsAnnualTx') : t('pfOfAnnualTx') })}
        ${statTile({ label: t('pfBranchNetwork'), value: fmtInt(p.branches.count),
          foot: t('pfForeignUnits', { n: fmtInt(p.branches.foreign), c: fmtInt(p.branches.countries) }) })}
        ${statTile({ label: t('pfAuditOverdue'), value: fmtInt(p.branches.auditOverdue),
          tone: p.branches.auditOverdue ? 'warn' : 'ok', foot: t('pfAuditOverdueDesc') })}
        ${statTile({ label: t('pfHints'), value: fmtInt(Object.keys(p.hints).length),
          foot: t('pfHintsDesc') })}
      </div>

      ${matrixCard(state, p)}
      ${segmentCard(state, p)}
      ${countryCard(state, p)}
      ${branchCard(state, p)}
    `;

    bind(host, ctx);
  }

  /* ---------- Müşteri dağılımı ---------- */

  function matrixCard(state, p) {
    const rows = PORTFOLIO.customerTypes.map(ct => {
      const row = state.portfolio.matrix[ct.key] || {};
      const cells = PORTFOLIO.riskBands.map(b => `
        <td style="width:120px">
          <input type="number" min="0" step="1" inputmode="numeric"
            id="mx-${ct.key}-${b.key.replace(/\s/g, '')}"
            data-mx="${ct.key}" data-band="${esc(b.key)}"
            value="${row[b.key] ?? ''}" placeholder="0"
            aria-label="${esc(L(ct))} — ${esc(I18n.ref('riskLevel', b.key))}">
        </td>`).join('');
      const rowTotal = p.byType[ct.key];
      return `<tr>
        <td>${esc(L(ct))}</td>
        ${cells}
        <td class="num"><b>${rowTotal ? fmtInt(rowTotal) : '—'}</b></td>
        <td class="num">${p.total > 0 && rowTotal ? fmtPct1(rowTotal / p.total) : '—'}</td>
      </tr>`;
    }).join('');

    return `<div class="card">
      <div class="card-head">
        <div style="flex:1;min-width:200px">
          <h2>${t('pfMatrixTitle')}</h2>
          <div class="subtle">${t('pfMatrixHelp')}</div>
        </div>
      </div>
      <div class="card-body" style="padding:0">
        <div class="table-wrap"><table>
          <thead><tr>
            <th>${t('pfCustomerType')}</th>
            ${PORTFOLIO.riskBands.map(b => `<th>${esc(I18n.ref('riskLevel', b.key))}</th>`).join('')}
            <th class="num">${t('total')}</th><th class="num">${t('pfShare')}</th>
          </tr></thead>
          <tbody>${rows}</tbody>
          <tfoot><tr>
            <td>${t('total')}</td>
            ${PORTFOLIO.riskBands.map(b => `<td class="num">${p.byBand[b.key] ? fmtInt(p.byBand[b.key]) : '—'}</td>`).join('')}
            <td class="num">${p.matrixFilled ? fmtInt(p.total) : '—'}</td>
            <td class="num">${p.matrixFilled ? '100%' : '—'}</td>
          </tr></tfoot>
        </table></div>
      </div>
      ${p.matrixFilled ? `<div class="card-head" style="border-top:1px solid var(--border-soft);border-bottom:0">
        <div class="inline-list" style="flex:1">
          ${PORTFOLIO.riskBands.map(b => `<span class="chip ${b.tone}">${esc(I18n.ref('riskLevel', b.key))}
            ${fmtPct(p.byBand[b.key] / p.total)}</span>`).join('')}
          <span class="chip">${t('pfEntityShare')} ${fmtPct1(p.entityShare)}</span>
        </div>
      </div>` : ''}
    </div>`;
  }

  /* ---------- Segmentler ---------- */

  function segmentCard(state, p) {
    const rows = PORTFOLIO.segments.map(s => {
      const g = p.segments[s.key];
      const rec = state.portfolio.segments[s.key] || {};
      return `<tr>
        <td>
          <label for="sg-${s.key}" style="font-weight:500;color:inherit;margin:0">${esc(L(s))}</label>
          ${s.feeds ? `<div class="subtle">${Icons.link()} ${t('pfFeedsFactor')}</div>` : ''}
        </td>
        <td style="width:140px">
          <input type="number" min="0" step="1" inputmode="numeric" id="sg-${s.key}"
            data-seg="${s.key}" data-field="customers" value="${rec.customers ?? ''}" placeholder="0"
            aria-label="${esc(L(s))} — ${t('pfCustomers')}">
        </td>
        <td style="width:140px">
          <input type="number" min="0" step="1" inputmode="numeric" id="sgh-${s.key}"
            data-seg="${s.key}" data-field="highRisk" value="${rec.highRisk ?? ''}" placeholder="0"
            aria-label="${esc(L(s))} — ${t('pfHighRisk')}">
        </td>
        <td class="num">${g.share === null ? '—' : fmtPct1(g.share)}</td>
        <td>${s.base === 'tuzel' ? t('pfBaseEntities') : t('pfBaseAll')}</td>
      </tr>`;
    }).join('');

    return `<div class="card">
      <div class="card-head">
        <div style="flex:1;min-width:200px">
          <h2>${t('pfSegmentTitle')}</h2>
          <div class="subtle">${t('pfSegmentHelp')}</div>
        </div>
      </div>
      <div class="card-body" style="padding:0">
        <div class="table-wrap"><table>
          <thead><tr>
            <th>${t('pfSegment')}</th><th>${t('pfCustomers')}</th><th>${t('pfHighRisk')}</th>
            <th class="num">${t('pfShare')}</th><th>${t('pfBase')}</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table></div>
      </div>
    </div>`;
  }

  /* ---------- Ülke maruziyeti ---------- */

  function countryCard(state, p) {
    const rows = p.countries.rows.map((c, i) => `
      <tr>
        <td style="min-width:190px">
          <input type="text" id="cn-name-${i}" data-cn="${i}" data-field="name" value="${esc(c.name || '')}"
            list="country-list" placeholder="${t('pfCountryPh')}" aria-label="${t('pfCountry')}">
          ${c.code ? `<div class="subtle mono">${esc(c.code)}</div>` : ''}
        </td>
        <td style="min-width:240px">
          <div class="flag-list">
            ${PORTFOLIO.countryFlags.map(f => `
              <label class="flag-chip ${c.flags.includes(f.key) ? 'on ' + f.tone : ''}" title="${esc(L(f))}">
                <input type="checkbox" data-cn="${i}" data-flag="${f.key}" ${c.flags.includes(f.key) ? 'checked' : ''}
                  aria-label="${esc(c.name || '')} — ${esc(L(f))}">
                <span>${esc(S(f))}</span>
              </label>`).join('')}
          </div>
        </td>
        <td style="min-width:220px">
          <div class="flag-list">
            ${PORTFOLIO.countryRelations.map(r => `
              <label class="flag-chip ${(c.relations || []).includes(r.key) ? 'on chip-mid' : ''}" title="${esc(L(r))}">
                <input type="checkbox" data-cn="${i}" data-rel="${r.key}" ${(c.relations || []).includes(r.key) ? 'checked' : ''}
                  aria-label="${esc(c.name || '')} — ${esc(L(r))}">
                <span>${esc(S(r))}</span>
              </label>`).join('')}
          </div>
        </td>
        <td style="width:120px"><input type="number" min="0" step="1" inputmode="numeric" id="cn-cus-${i}"
          data-cn="${i}" data-field="customers" value="${c.customers || ''}" placeholder="0" aria-label="${t('pfCustomers')}"></td>
        <td style="width:120px"><input type="number" min="0" step="1" inputmode="numeric" id="cn-in-${i}"
          data-cn="${i}" data-field="txIn" value="${c.txIn || ''}" placeholder="0" aria-label="${t('pfTxIn')}"></td>
        <td style="width:120px"><input type="number" min="0" step="1" inputmode="numeric" id="cn-out-${i}"
          data-cn="${i}" data-field="txOut" value="${c.txOut || ''}" placeholder="0" aria-label="${t('pfTxOut')}"></td>
        <td class="num">${c.tx ? fmtInt(c.tx) : '—'}${c.domestic && c.tx ? `<div class="subtle">${t('pfDomesticShort')}</div>` : ''}</td>
        <td>${c.worst ? `<span class="chip ${c.worst.tone}" title="${esc(L(c.worst))}">${esc(S(c.worst))}</span>`
          : `<span class="chip chip-ok">${t('pfNoFlag')}</span>`}</td>
        <td class="no-print"><button class="btn btn-sm btn-icon btn-danger" data-cn-del="${i}"
          aria-label="${esc(c.name || '')} — ${t('delete')}">${Icons.trash()}</button></td>
      </tr>`).join('');

    const exposure = PORTFOLIO.countryFlags.map(f => {
      const v = p.countries.flagTotals[f.key];
      if (!v.countries) return '';
      return `<div class="exposure-row">
        <span class="chip ${f.tone}">${esc(L(f))}</span>
        <span class="subtle">${t('pfNCountries', { n: v.countries })}</span>
        <b class="num">${fmtInt(v.customers)}</b><span class="subtle">${t('pfCustomers').toLocaleLowerCase(I18n.locale)}</span>
        <b class="num">${fmtInt(v.tx)}</b><span class="subtle">${t('pfTx').toLocaleLowerCase(I18n.locale)}</span>
        <span class="num">${p.countries.tx ? fmtPct1(v.tx / p.countries.tx) : '—'}</span>
      </div>`;
    }).join('');

    return `<div class="card">
      <div class="card-head">
        <div style="flex:1;min-width:200px">
          <h2>${t('pfCountryTitle')}</h2>
          <div class="subtle">${t('pfCountryHelp')}</div>
        </div>
        <button class="btn btn-sm" data-cn-add>${Icons.plus()} ${t('pfAddCountry')}</button>
      </div>
      <div class="card-body" style="padding:0">
        ${p.countries.count ? `<div class="table-wrap"><table>
          <thead><tr>
            <th>${t('pfCountry')}</th><th>${t('pfRiskFlags')}</th><th>${t('pfRelation')}</th>
            <th>${t('pfCustomers')}</th><th>${t('pfTxIn')}</th><th>${t('pfTxOut')}</th>
            <th class="num">${t('pfTxTotal')}</th><th>${t('pfHighestFlag')}</th><th class="no-print"></th>
          </tr></thead>
          <tbody>${rows}</tbody>
          <tfoot><tr>
            <td>${t('total')}</td><td></td><td></td>
            <td class="num">${fmtInt(p.countries.customers)}</td>
            <td class="num">${fmtInt(p.countries.txIn)}</td>
            <td class="num">${fmtInt(p.countries.txOut)}</td>
            <td class="num">${fmtInt(p.countries.tx)}
              ${p.countries.crossTx !== p.countries.tx ? `<div class="subtle">${t('pfCrossOnly')}: ${fmtInt(p.countries.crossTx)}</div>` : ''}</td>
            <td></td><td class="no-print"></td>
          </tr></tfoot>
        </table></div>` : emptyState(t('pfNoCountry'), t('pfNoCountryBody'),
          `<button class="btn btn-primary" data-cn-add style="margin-top:12px">${Icons.plus()} ${t('pfAddCountry')}</button>`)}
      </div>
      ${exposure ? `<div class="card-body" style="border-top:1px solid var(--border-soft)">
        <h3 style="margin-bottom:8px">${t('pfExposureSummary')}</h3>
        ${exposure}
        <p class="subtle" style="margin-top:10px">${t('pfFlagsAsOf', { d: PORTFOLIO.countryRiskAsOf })}</p>
      </div>` : ''}
      <datalist id="country-list">
        ${PORTFOLIO.knownCountries.map(c => `<option value="${esc(L(c))}">${esc(c.code)}</option>`).join('')}
      </datalist>
    </div>`;
  }

  /* ---------- Şube ağı ---------- */

  function branchCard(state, p) {
    const rows = p.branches.rows.map((b, i) => `
      <tr>
        <td style="min-width:170px"><input type="text" id="br-name-${i}" data-br="${i}" data-field="name"
          value="${esc(b.name || '')}" placeholder="${t('pfBranchPh')}" aria-label="${t('pfBranchName')}"></td>
        <td style="min-width:180px">
          <select id="br-type-${i}" data-br="${i}" data-field="type" aria-label="${t('pfBranchType')}">
            ${UI.selectOptions(PORTFOLIO.branchTypes.map(x => x.key), b.type, t('select'),
              PORTFOLIO.branchTypes.map(x => L(x)))}
          </select>
        </td>
        <td style="min-width:140px"><input type="text" id="br-country-${i}" data-br="${i}" data-field="country"
          value="${esc(b.country || '')}" list="country-list" placeholder="TR" aria-label="${t('pfCountry')}"></td>
        <td style="width:120px"><input type="number" min="0" step="1" inputmode="numeric" id="br-cus-${i}"
          data-br="${i}" data-field="customers" value="${b.customers || ''}" placeholder="0" aria-label="${t('pfCustomers')}"></td>
        <td style="width:120px"><input type="number" min="0" step="1" inputmode="numeric" id="br-hr-${i}"
          data-br="${i}" data-field="highRiskCustomers" value="${b.highRiskCustomers || ''}" placeholder="0" aria-label="${t('pfHighRisk')}"></td>
        <td class="num">${b.hrShare === null ? '—' : fmtPct1(b.hrShare)}</td>
        <td style="width:110px"><input type="number" min="0" step="0.5" inputmode="decimal" id="br-fte-${i}"
          data-br="${i}" data-field="complianceFte" value="${b.complianceFte ?? ''}" placeholder="0" aria-label="${t('pfComplianceFte')}"></td>
        <td class="num">${b.load === null ? '—' : fmtInt(Math.round(b.load))}</td>
        <td style="width:150px"><input type="date" id="br-audit-${i}" data-br="${i}" data-field="lastAudit"
          value="${esc(b.lastAudit || '')}" aria-label="${t('pfLastAudit')}"></td>
        <td>${b.auditMonths === null
          ? `<span class="chip chip-high">${t('pfNoAudit')}</span>`
          : b.auditOverdue ? `<span class="chip chip-critical">${b.auditMonths} ${t('monthsShort')}</span>`
          : `<span class="chip chip-ok">${b.auditMonths} ${t('monthsShort')}</span>`}</td>
        <td class="no-print"><button class="btn btn-sm btn-icon btn-danger" data-br-del="${i}"
          aria-label="${esc(b.name || '')} — ${t('delete')}">${Icons.trash()}</button></td>
      </tr>`).join('');

    const typeChips = PORTFOLIO.branchTypes
      .filter(bt => p.branches.byType[bt.key] > 0)
      .map(bt => `<span class="chip">${esc(L(bt))} ${p.branches.byType[bt.key]}</span>`).join('');

    return `<div class="card">
      <div class="card-head">
        <div style="flex:1;min-width:200px">
          <h2>${t('pfBranchTitle')}</h2>
          <div class="subtle">${t('pfBranchHelp')}</div>
        </div>
        <button class="btn btn-sm" data-br-add>${Icons.plus()} ${t('pfAddBranch')}</button>
      </div>
      <div class="card-body" style="padding:0">
        ${p.branches.count ? `<div class="table-wrap"><table>
          <thead><tr>
            <th>${t('pfBranchName')}</th><th>${t('pfBranchType')}</th><th>${t('pfCountry')}</th>
            <th>${t('pfCustomers')}</th><th>${t('pfHighRisk')}</th><th class="num">${t('pfShare')}</th>
            <th>${t('pfComplianceFte')}</th><th class="num">${t('pfLoad')}</th>
            <th>${t('pfLastAudit')}</th><th>${t('pfAuditAge')}</th><th class="no-print"></th>
          </tr></thead>
          <tbody>${rows}</tbody>
          <tfoot><tr>
            <td>${t('total')}</td><td></td><td></td>
            <td class="num">${fmtInt(p.branches.customers)}</td>
            <td class="num">${fmtInt(p.branches.rows.reduce((a, b) => a + b.highRiskCustomers, 0))}</td>
            <td></td><td></td><td></td><td></td><td></td><td class="no-print"></td>
          </tr></tfoot>
        </table></div>` : emptyState(t('pfNoBranch'), t('pfNoBranchBody'),
          `<button class="btn btn-primary" data-br-add style="margin-top:12px">${Icons.plus()} ${t('pfAddBranch')}</button>`)}
      </div>
      ${p.branches.count ? `<div class="card-head" style="border-top:1px solid var(--border-soft);border-bottom:0">
        <div class="inline-list" style="flex:1">
          ${typeChips}
          ${p.branches.coverage !== null ? `<span class="chip chip-mid">${t('pfBranchCoverage')} ${fmtPct(p.branches.coverage)}</span>` : ''}
          ${p.branches.topLoad ? `<span class="chip">${t('pfTopLoad')}: ${esc(p.branches.topLoad.name || '—')} ${fmtInt(Math.round(p.branches.topLoad.load))}</span>` : ''}
        </div>
      </div>` : ''}
    </div>`;
  }

  /* ---------- Olay bağlama ---------- */

  function bind(host, ctx) {
    // Sayı ve metin girişleri: sessiz kaydet, odak kaybında türetilenleri tazele
    host.addEventListener('input', e => {
      const mx = e.target.closest('[data-mx]');
      if (mx) return set(s => {
        const m = pf(s).matrix;
        m[mx.dataset.mx] = m[mx.dataset.mx] || {};
        if (mx.value === '') delete m[mx.dataset.mx][mx.dataset.band];
        else m[mx.dataset.mx][mx.dataset.band] = Number(mx.value);
      });

      const sg = e.target.closest('[data-seg]');
      if (sg) return set(s => {
        const g = pf(s).segments;
        g[sg.dataset.seg] = g[sg.dataset.seg] || {};
        if (sg.value === '') delete g[sg.dataset.seg][sg.dataset.field];
        else g[sg.dataset.seg][sg.dataset.field] = Number(sg.value);
      });

      const cn = e.target.closest('[data-cn][data-field]');
      if (cn) return set(s => {
        const row = pf(s).countries[Number(cn.dataset.cn)];
        if (!row) return;
        const f = cn.dataset.field;
        if (f === 'name') {
          row.name = cn.value;
          const known = PORTFOLIO.knownCountries.find(k => L(k) === cn.value || k.code === cn.value.toUpperCase());
          if (known) { row.code = known.code; row.flags = known.flags.slice(); }
        } else {
          row[f] = cn.value === '' ? '' : Number(cn.value);
        }
      });

      const br = e.target.closest('[data-br][data-field]');
      if (br) return set(s => {
        const row = pf(s).branches[Number(br.dataset.br)];
        if (!row) return;
        const f = br.dataset.field;
        row[f] = (['customers', 'highRiskCustomers', 'complianceFte'].includes(f) && br.value !== '')
          ? Number(br.value) : br.value;
      });
    });

    host.addEventListener('change', e => {
      const flag = e.target.closest('[data-flag]');
      if (flag) {
        Store.update(s => {
          const row = pf(s).countries[Number(flag.dataset.cn)];
          if (!row) return;
          row.flags = row.flags || [];
          const k = flag.dataset.flag;
          if (flag.checked) { if (!row.flags.includes(k)) row.flags.push(k); }
          else row.flags = row.flags.filter(x => x !== k);
        });
        return;
      }
      const rel = e.target.closest('[data-rel]');
      if (rel) {
        Store.update(s => {
          const row = pf(s).countries[Number(rel.dataset.cn)];
          if (!row) return;
          row.relations = row.relations || [];
          const k = rel.dataset.rel;
          if (rel.checked) { if (!row.relations.includes(k)) row.relations.push(k); }
          else row.relations = row.relations.filter(x => x !== k);
        });
        return;
      }
      // select ve tarih alanları anında yeniden çizsin
      if (e.target.closest('[data-br][data-field]') || e.target.closest('[data-cn][data-field]')) App.rerender();
    });

    // Yazma bittiğinde türetilen değerler tazelenir
    host.addEventListener('blur', e => {
      if (e.target.closest('[data-mx],[data-seg],[data-cn],[data-br]')) App.rerender();
    }, true);

    host.addEventListener('click', async e => {
      if (e.target.closest('[data-cn-add]')) {
        Store.update(s => { pf(s).countries.push({ name: '', code: '', flags: [], relations: [] }); });
        const inp = UI.el('#cn-name-' + (Store.state.portfolio.countries.length - 1), host);
        if (inp) inp.focus();
        return;
      }
      if (e.target.closest('[data-br-add]')) {
        Store.update(s => { pf(s).branches.push({ name: '', type: '', country: '' }); });
        const inp = UI.el('#br-name-' + (Store.state.portfolio.branches.length - 1), host);
        if (inp) inp.focus();
        return;
      }
      const cd = e.target.closest('[data-cn-del]');
      if (cd) {
        const i = Number(cd.dataset.cnDel);
        const row = Store.state.portfolio.countries[i];
        if (row && (row.name || row.customers)) {
          const ok = await UI.confirmDialog({ title: t('pfDelCountryTitle'),
            message: t('pfDelRowMsg', { n: row.name || '—' }), confirmLabel: t('delete'), danger: true });
          if (!ok) return;
        }
        Store.update(s => { pf(s).countries.splice(i, 1); });
        return;
      }
      const bd = e.target.closest('[data-br-del]');
      if (bd) {
        const i = Number(bd.dataset.brDel);
        const row = Store.state.portfolio.branches[i];
        if (row && (row.name || row.customers)) {
          const ok = await UI.confirmDialog({ title: t('pfDelBranchTitle'),
            message: t('pfDelRowMsg', { n: row.name || '—' }), confirmLabel: t('delete'), danger: true });
          if (!ok) return;
        }
        Store.update(s => { pf(s).branches.splice(i, 1); });
      }
    });

    function set(mutator) { Store.update(mutator, { silent: true }); }
  }

  return { compute, view, blank, pf };
})();
