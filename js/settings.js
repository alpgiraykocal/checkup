/* Ayarlar — ülke risk sınıflandırması.
   COUNTRIES varsayılan bayrakları taşır; kurumun kendi kararları
   state.countryRisk içinde yalnızca fark olarak saklanır. */

const CountryRisk = (() => {

  const byCode = Object.fromEntries(COUNTRIES.map(c => [c.code, c]));

  const label = c => (c ? (I18n.isEn ? c.en : c.tr) : '');

  /** Ülkenin görünen adı — kod ile. */
  function name(code) {
    const c = byCode[code];
    return c ? label(c) : (code || '');
  }

  /** Etkin bayraklar: kurum kararı varsa o, yoksa varsayılan. */
  function flags(code, state) {
    const ov = (state || Store.state).countryRisk || {};
    if (Object.prototype.hasOwnProperty.call(ov, code)) return ov[code] || [];
    const c = byCode[code];
    return c ? c.flags.slice() : [];
  }

  function isOverridden(code, state) {
    const ov = (state || Store.state).countryRisk || {};
    return Object.prototype.hasOwnProperty.call(ov, code);
  }

  /** En ağır bayrak — satır rengini belirler. */
  function worst(list) {
    return PORTFOLIO.countryFlags
      .filter(f => list.includes(f.key))
      .sort((a, b) => b.weight - a.weight)[0] || null;
  }

  /** Seçim listesi: alfabetik, işaretli ülkeler etiketli. */
  function options(selected, state) {
    const opts = COUNTRIES.map(c => {
      const fl = flags(c.code, state);
      const w = worst(fl);
      const suffix = w ? ` — ${I18n.isEn ? (w.short.en) : (w.short.tr)}` : '';
      return `<option value="${c.code}"${c.code === selected ? ' selected' : ''}>${UI.esc(label(c))} (${c.code})${UI.esc(suffix)}</option>`;
    }).join('');
    return `<option value=""${!selected ? ' selected' : ''}>${UI.esc(I18n.t('select'))}</option>` + opts;
  }

  /** Bayrak dağılımı — ayar ekranı özeti. */
  function summary(state) {
    const out = {};
    PORTFOLIO.countryFlags.forEach(f => out[f.key] = 0);
    let flagged = 0, overridden = 0;
    COUNTRIES.forEach(c => {
      const fl = flags(c.code, state);
      if (fl.length) flagged += 1;
      if (isOverridden(c.code, state)) overridden += 1;
      fl.forEach(k => { if (out[k] !== undefined) out[k] += 1; });
    });
    return { byFlag: out, flagged, overridden, total: COUNTRIES.length };
  }

  return { byCode, label, name, flags, isOverridden, worst, options, summary };
})();


const Settings = (() => {
  const { esc, fmtInt, statTile, emptyState } = UI;
  const t = (k, p) => I18n.t(k, p);

  const ui = { q: '', only: '' };

  function view(host, { state }) {
    const sum = CountryRisk.summary(state);
    const term = ui.q.trim().toLocaleLowerCase(I18n.locale);

    const list = COUNTRIES.filter(c => {
      const fl = CountryRisk.flags(c.code, state);
      if (ui.only === 'flagged' && !fl.length) return false;
      if (ui.only === 'clean' && fl.length) return false;
      if (ui.only === 'changed' && !CountryRisk.isOverridden(c.code, state)) return false;
      if (ui.only && PORTFOLIO.countryFlags.some(f => f.key === ui.only) && !fl.includes(ui.only)) return false;
      if (term) {
        const hay = (c.tr + ' ' + c.en + ' ' + c.code).toLocaleLowerCase(I18n.locale);
        if (!hay.includes(term)) return false;
      }
      return true;
    });

    host.innerHTML = `
      ${Views.banner('info', t('csTitle'), t('csBody', { d: PORTFOLIO.countryRiskAsOf }))}

      <div class="grid grid-kpi" style="margin-bottom:16px">
        ${statTile({ label: t('csTotal'), value: fmtInt(sum.total), foot: t('csTotalFoot') })}
        ${statTile({ label: t('csFlagged'), value: fmtInt(sum.flagged),
          foot: `${fmtInt(sum.total - sum.flagged)} ${t('csClean')}` })}
        ${statTile({ label: t('csChanged'), value: fmtInt(sum.overridden),
          tone: sum.overridden ? 'ok' : '', foot: t('csChangedFoot') })}
        ${PORTFOLIO.countryFlags.slice(0, 3).map(f => statTile({
          label: CountryRisk.label(f), value: fmtInt(sum.byFlag[f.key]), foot: t('csCountriesWithFlag')
        })).join('')}
      </div>

      <div class="toolbar no-print">
        <div class="field grow">
          <label for="cs-q">${t('csSearch')}</label>
          <input type="text" id="cs-q" data-cs-q value="${esc(ui.q)}" placeholder="${t('csSearchPh')}">
        </div>
        <div class="field">
          <label for="cs-only">${t('csFilter')}</label>
          <select id="cs-only" data-cs-only>
            <option value="">${t('all')} (${COUNTRIES.length})</option>
            <option value="flagged"${ui.only === 'flagged' ? ' selected' : ''}>${t('csOnlyFlagged')}</option>
            <option value="clean"${ui.only === 'clean' ? ' selected' : ''}>${t('csOnlyClean')}</option>
            <option value="changed"${ui.only === 'changed' ? ' selected' : ''}>${t('csOnlyChanged')}</option>
            ${PORTFOLIO.countryFlags.map(f => `<option value="${f.key}"${ui.only === f.key ? ' selected' : ''}>${esc(CountryRisk.label(f))}</option>`).join('')}
          </select>
        </div>
        <div class="toolbar-actions">
          ${sum.overridden ? `<button class="btn btn-danger" data-cs-reset>${Icons.reset()} ${t('csResetAll')}</button>` : ''}
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <h2>${t('csTableTitle')}</h2>
          <span class="subtle">${t('csShown', { n: fmtInt(list.length) })}</span>
        </div>
        <div class="card-body" style="padding:0">
          ${list.length ? `<div class="table-wrap"><table>
            <thead><tr>
              <th>${t('pfCountry')}</th><th>${t('csFlagsCol')}</th><th>${t('status')}</th><th class="no-print"></th>
            </tr></thead>
            <tbody>${list.map(c => row(c, state)).join('')}</tbody>
          </table></div>` : emptyState(t('csNoMatch'), t('csNoMatchBody'))}
        </div>
      </div>`;

    bind(host);
  }

  function row(c, state) {
    const fl = CountryRisk.flags(c.code, state);
    const changed = CountryRisk.isOverridden(c.code, state);
    return `<tr>
      <td style="min-width:190px">
        <b>${esc(CountryRisk.label(c))}</b>
        <div class="subtle mono">${esc(c.code)}</div>
      </td>
      <td style="min-width:320px">
        <div class="flag-list">
          ${PORTFOLIO.countryFlags.map(f => `
            <label class="flag-chip ${fl.includes(f.key) ? 'on ' + f.tone : ''}" title="${esc(CountryRisk.label(f))}">
              <input type="checkbox" data-cs-flag="${f.key}" data-code="${c.code}" ${fl.includes(f.key) ? 'checked' : ''}
                aria-label="${esc(CountryRisk.label(c))} — ${esc(CountryRisk.label(f))}">
              <span>${esc(I18n.isEn ? f.short.en : f.short.tr)}</span>
            </label>`).join('')}
        </div>
      </td>
      <td>${changed ? `<span class="chip chip-mid">${t('csModified')}</span>` : `<span class="chip chip-na">${t('csDefault')}</span>`}</td>
      <td class="no-print">${changed
        ? `<button class="btn btn-sm btn-icon" data-cs-revert="${c.code}" aria-label="${esc(CountryRisk.label(c))} — ${t('csRevert')}" title="${t('csRevert')}">${Icons.reset()}</button>`
        : ''}</td>
    </tr>`;
  }

  function bind(host) {
    host.addEventListener('input', e => {
      const q = e.target.closest('[data-cs-q]');
      if (q) { ui.q = q.value; clearTimeout(bind._t); bind._t = setTimeout(() => App.rerender(), 200); }
    });
    host.addEventListener('change', e => {
      const only = e.target.closest('[data-cs-only]');
      if (only) { ui.only = only.value; App.rerender(); return; }
      const fl = e.target.closest('[data-cs-flag]');
      if (fl) {
        const code = fl.dataset.code, key = fl.dataset.csFlag;
        Store.update(s => {
          s.countryRisk = s.countryRisk || {};
          const cur = CountryRisk.flags(code, s).slice();
          const next = fl.checked ? [...new Set([...cur, key])] : cur.filter(x => x !== key);
          const def = (CountryRisk.byCode[code] || { flags: [] }).flags;
          // Varsayılana eşitse geçersiz kılmayı kaldır
          if (next.length === def.length && next.every(x => def.includes(x))) delete s.countryRisk[code];
          else s.countryRisk[code] = next;
        });
      }
    });
    host.addEventListener('click', async e => {
      const rev = e.target.closest('[data-cs-revert]');
      if (rev) {
        Store.update(s => { delete (s.countryRisk || {})[rev.dataset.csRevert]; });
        return;
      }
      if (e.target.closest('[data-cs-reset]')) {
        const ok = await UI.confirmDialog({
          title: t('csResetTitle'), message: t('csResetMsg'),
          confirmLabel: t('csResetAll'), danger: true
        });
        if (ok) { Store.update(s => { s.countryRisk = {}; }); UI.toast(t('csResetDone')); }
      }
    });
  }

  return { view };
})();
