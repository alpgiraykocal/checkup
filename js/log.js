/* Değişiklik günlüğü ekranı.
   Kayıtlar Store içinde tutulur ve yalnızca eklenir; bu ekran okuma ve
   süzmeden ibarettir. Denetimde "bu yanıt ne zaman ve kim tarafından
   değişti" sorusunun cevabı buradadır. */

const ChangeLog = (() => {
  const { esc, fmtInt, statTile, emptyState, selectOptions } = UI;
  const t = (k, p) => I18n.t(k, p);

  const ui = { what: '', q: '' };

  const TURLER = ['answer', 'inherent', 'method', 'action-add', 'action-edit', 'action-delete', 'merge', 'import'];
  const turAdi = w => {
    const v = t('lgWhat_' + w);
    return v === 'lgWhat_' + w ? w : v;
  };

  /* Günlük değerleri dilden bağımsız saklanır (yanıt "Evet", durum "Açık",
     yöntem "true"). Ekranda ve CSV'de seçili dile çevrilir; kayıt değişmez. */
  function degerMetni(e, v) {
    if (v === undefined || v === null || v === '') return '';
    if (e.what === 'answer' || e.what === 'inherent') {
      return DATA.ref.answers.includes(v) ? I18n.ref('answers', v) : v;
    }
    if (e.what === 'method') return v === 'true' ? t('mtExposure') : v === 'false' ? t('mtDefault') : v;
    if (e.what === 'import' || e.what === 'merge') {
      let o = null;
      try { o = JSON.parse(v); } catch { return v; }            // eski sürüm: düz metin
      if (!o || typeof o !== 'object') return v;
      if (e.what === 'import') return t('impSummary', { a: o.a, b: o.b });
      if (Array.isArray(o.p)) {
        const ad = k => (typeof Merge !== 'undefined' ? Merge.parcaEtiketi(k) : k);
        return t('mgLogAfter', { n: o.n, p: o.p.map(ad).join(', ') });
      }
      return t('mgLogBefore', { n: o.n });
    }
    if (e.what === 'action-add' || e.what === 'action-edit') {
      let o = null;
      try { o = JSON.parse(v); } catch { /* düz metin ya da kısaltılmış kayıt */ }
      if (!o && v.startsWith('{')) {
        // 120 karakterde kesilmiş kayıt: bütün kalan "alan":"değer" çiftleri okunur
        o = {};
        for (const m of v.matchAll(/"(\w+)":"((?:[^"\\]|\\.)*)"/g)) o[m[1]] = m[2];
      }
      if (!o || typeof o !== 'object') return v;
      return [o.finding,
        o.status && `${t('status')}: ${I18n.ref('status', o.status)}`,
        o.crit && `${t('criticality')}: ${I18n.ref('crit', o.crit)}`,
        o.owner && `${t('colOwner')}: ${o.owner}`,
        o.due && `${t('colDue')}: ${o.due}`,
        o.closedAt && `${t('fClosedAt')}: ${o.closedAt}`].filter(Boolean).join(' · ');
    }
    return v;
  }

  /** En yeni başta, süzülmüş liste. */
  function filtrele(log) {
    const term = ui.q.trim().toLocaleLowerCase(I18n.locale);
    return log.filter(e => {
      if (ui.what && e.what !== ui.what) return false;
      if (term) {
        const hay = [e.ref, e.who, e.from, e.to, degerMetni(e, e.from), degerMetni(e, e.to), turAdi(e.what)].join(' ').toLocaleLowerCase(I18n.locale);
        if (!hay.includes(term)) return false;
      }
      return true;
    }).slice().reverse();
  }

  function view(host, { state }) {
    const log = Array.isArray(state.log) ? state.log : [];
    const liste = filtrele(log);
    const sayimlar = {};
    log.forEach(e => { sayimlar[e.what] = (sayimlar[e.what] || 0) + 1; });

    host.innerHTML = `
      ${Views.banner('info', t('lgIntroTtl'), t('lgIntroBody', { n: fmtInt(4000) }))}

      <div class="grid grid-kpi">
        ${statTile({ label: t('lgCount', { n: '' }).replace(/\s*$/, ''), value: fmtInt(log.length),
          foot: log.length ? `${esc(new Date(log[0].at).toLocaleDateString(I18n.locale))} →` : '' })}
        ${TURLER.filter(w => sayimlar[w]).slice(0, 4).map(w =>
          statTile({ label: turAdi(w), value: fmtInt(sayimlar[w]) })).join('')}
      </div>

      ${log.length ? `
      <div class="toolbar no-print">
        <div class="field grow">
          <label for="lg-q">${t('lgSearch')}</label>
          <input type="text" id="lg-q" data-lg-q value="${esc(ui.q)}" placeholder="${t('lgSearchPh')}">
        </div>
        <div class="field">
          <label for="lg-what">${t('lgWhat')}</label>
          <select id="lg-what" data-lg-what>
            <option value="">${t('lgFilterAll')} (${log.length})</option>
            ${TURLER.filter(w => sayimlar[w]).map(w =>
              `<option value="${w}"${ui.what === w ? ' selected' : ''}>${esc(turAdi(w))} (${sayimlar[w]})</option>`).join('')}
          </select>
        </div>
        <div class="toolbar-actions">
          <button class="btn" data-lg-csv>${Icons.download()} ${t('lgCsv')}</button>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <h2>${t('ttlLog')}</h2>
          <span class="subtle">${t('lgCount', { n: fmtInt(liste.length) })}</span>
        </div>
        <div class="card-body flush">
          <div class="table-wrap"><table>
            <thead><tr>
              <th>${t('lgWhen')}</th><th>${t('lgWho')}</th><th>${t('lgWhat')}</th>
              <th>${t('lgRef')}</th><th>${t('lgFrom')}</th><th>${t('lgTo')}</th>
            </tr></thead>
            <tbody>${liste.slice(0, 500).map(satir).join('')}</tbody>
          </table></div>
          ${liste.length > 500 ? `<div class="card-body"><p class="subtle">${t('firstNShown', { n: 500 })}</p></div>` : ''}
        </div>
      </div>`
      : emptyState(t('lgEmpty'), t('lgEmptyBody'))}`;

    bind(host);
  }

  function satir(e) {
    const d = new Date(e.at);
    return `<tr>
      <td class="nowrap subtle">${esc(d.toLocaleDateString(I18n.locale))}
        <div>${esc(d.toLocaleTimeString(I18n.locale))}</div></td>
      <td>${esc(e.who || '—')}</td>
      <td><span class="chip">${esc(turAdi(e.what))}</span></td>
      <td class="mono">${esc(e.ref || '')}</td>
      <td class="subtle">${esc(degerMetni(e, e.from) || '—')}</td>
      <td>${esc(degerMetni(e, e.to) || '—')}</td>
    </tr>`;
  }

  function bind(host) {
    host.addEventListener('input', e => {
      const q = e.target.closest('[data-lg-q]');
      if (q) { ui.q = q.value; clearTimeout(bind._t); bind._t = setTimeout(() => App.rerender(), 200); }
    });
    host.addEventListener('change', e => {
      const w = e.target.closest('[data-lg-what]');
      if (w) { ui.what = w.value; App.rerender(); }
    });
    host.addEventListener('click', e => {
      if (e.target.closest('[data-lg-csv]')) Exporter.exportCSV('log', App.calc);
    });
  }

  return { view, turAdi, degerMetni };
})();
