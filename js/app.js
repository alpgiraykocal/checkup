/* Uygulama kabuğu: yönlendirme, kenar çubuğu, tema, dışa aktarım menüsü. */

const App = (() => {
  const ROUTES = [
    { id: 'pano', key: 'Dash', icon: 'dashboard', group: 'groupGeneral', view: Views.dashboard },
    { id: 'kunye', key: 'Kunye', icon: 'building', group: 'groupInput', view: Views.kunye },
    { id: 'portfoy', key: 'Portfolio', icon: 'users', group: 'groupInput', view: Portfolio.view },
    { id: 'islem', key: 'Operations', icon: 'activity', group: 'groupInput', view: Operations.view },
    { id: 'dogustan', key: 'Inherent', icon: 'gauge', group: 'groupInput', view: Views.inherent },
    { id: 'anket', key: 'Survey', icon: 'list', group: 'groupInput', view: Views.questions },
    { id: 'qa', key: 'Qa', icon: 'flask', group: 'groupInput', view: Views.qa },
    { id: 'skorlar', key: 'Scores', icon: 'layers', group: 'groupResult', view: Views.domainScores },
    { id: 'artik', key: 'Residual', icon: 'target', group: 'groupResult', view: Views.residual },
    { id: 'aksiyon', key: 'Actions', icon: 'clipboard', group: 'groupResult', view: Actions.view },
    { id: 'rapor', key: 'Report', icon: 'print', group: 'groupResult', view: Exporter.report },
    { id: 'ayarlar', key: 'Settings', icon: 'sliders', group: 'groupSettings', view: Settings.view }
  ];

  const t = (k, p) => I18n.t(k, p);
  const routeLabel = r => t('nav' + r.key);
  const routeTitle = r => t('ttl' + r.key);
  const routeSub = r => t('sub' + r.key);

  let current = 'pano';
  let calc = null;

  function route() {
    const hash = (location.hash || '').replace('#/', '');
    return ROUTES.find(r => r.id === hash) ? hash : 'pano';
  }

  function badges(r) {
    if (!calc) return '';
    if (r.id === 'anket') {
      const t = calc.totals;
      // Rozet ilerlemeyi gösterir; kritiklik uyarısı ayrı sayfalarda verilir.
      return `<span class="nav-badge ${t.answered < t.count ? 'warn' : ''}">${t.answered}/${t.count}</span>`;
    }
    if (r.id === 'aksiyon') {
      const s = calc.actionStats;
      if (!s.total) return '';
      return `<span class="nav-badge ${s.overdue ? 'danger' : s.open ? 'warn' : ''}">${s.open}</span>`;
    }
    if (r.id === 'artik' && calc.breaches > 0) {
      return `<span class="nav-badge danger">${calc.breaches}</span>`;
    }
    if (r.id === 'dogustan') {
      const i = calc.inherent;
      if (i.scored === 0) return '';
      return `<span class="nav-badge ${i.complete ? '' : 'warn'}">${i.scored}/${i.applicable}</span>`;
    }
    if (r.id === 'islem' && calc.operations) {
      const n = calc.operations.filled;
      return n ? `<span class="nav-badge">${n}/${calc.operations.total}</span>` : '';
    }
    if (r.id === 'ayarlar') {
      const n = Object.keys(Store.state.countryRisk || {}).length;
      return n ? `<span class="nav-badge">${n}</span>` : '';
    }
    if (r.id === 'portfoy' && calc.portfolio) {
      const n = Object.keys(calc.portfolio.hints).length;
      return n ? `<span class="nav-badge">${n}</span>` : '';
    }
    return '';
  }

  function renderNav() {
    const nav = UI.el('#nav');
    let html = '', lastGroup = null;
    ROUTES.forEach(r => {
      if (r.group !== lastGroup) { html += `<div class="nav-group-label">${t(r.group)}</div>`; lastGroup = r.group; }
      html += `<button class="nav-item" data-route="${r.id}" ${current === r.id ? 'aria-current="page"' : ''}>
        ${Icons[r.icon]()}<span class="label">${UI.esc(routeLabel(r))}</span>${badges(r)}</button>`;
    });
    nav.innerHTML = html;
  }

  /** Yeniden çizim sırasında odak, imleç konumu ve kaydırma korunur. */
  function captureFocus() {
    const a = document.activeElement;
    if (!a || !a.id || a === document.body) return null;
    const snap = { id: a.id, scrollY: window.scrollY };
    if (typeof a.selectionStart === 'number') { snap.start = a.selectionStart; snap.end = a.selectionEnd; }
    return snap;
  }

  function restoreFocus(snap) {
    if (!snap) return;
    const n = document.getElementById(snap.id);
    if (!n) return;
    n.focus({ preventScroll: true });
    if (snap.start !== undefined && typeof n.setSelectionRange === 'function') {
      try { n.setSelectionRange(snap.start, snap.end); } catch { /* type desteklemiyor */ }
    }
    window.scrollTo({ top: snap.scrollY, behavior: 'auto' });
  }

  function recompute() { calc = Calc.compute(Store.state); return calc; }

  /** Kenar çubuğu rozetleri ve kayıt zamanı — tam yeniden çizim olmadan tazelenir. */
  function refreshChrome() {
    renderNav();
    paintChrome();
  }

  /** Kabuğun sabit metinleri — dil değiştiğinde de tazelenir. */
  function paintChrome() {
    const saved = Store.state.updatedAt;
    UI.el('#saved-at').textContent = saved
      ? `${t('lastSave')} ${new Date(saved).toLocaleTimeString(I18n.locale)}`
      : t('noSave');
    UI.el('#brand-title').textContent = t('appTitle');
    UI.el('#brand-sub').textContent = t('appSub');
    UI.el('#skip-link').textContent = t('skipToContent');
    UI.el('#nav').setAttribute('aria-label', t('navMain'));
    UI.el('#local-only').textContent = t('localOnly');
    UI.el('#print-btn').setAttribute('aria-label', t('print'));
    UI.els('[data-act]').forEach(b => {
      const map = { export: 'dataBackup', import: 'importBtn', reset: 'resetBtn' };
      const label = t(map[b.dataset.act]);
      const span = b.querySelector('.btn-label');
      if (span) span.textContent = label;
      b.setAttribute('aria-label', label);
    });
    UI.els('[data-lang]').forEach(b => {
      b.setAttribute('aria-pressed', String(b.dataset.lang === I18n.lang));
    });
  }

  function render() {
    const state = Store.state;
    const snap = captureFocus();
    calc = Calc.compute(state);
    const r = ROUTES.find(x => x.id === current);

    renderNav();
    UI.el('#page-title').textContent = routeTitle(r);
    UI.el('#page-sub').textContent = routeSub(r);
    document.title = `${routeLabel(r)} · ${t('appTitle')}`;

    // Dinleyicilerin birikmemesi için içerik düğümü her seferinde yenilenir.
    const old = UI.el('#content');
    // Görünüme bağlı belge düzeyi dinleyicileri temizlensin
    if (old) old.dispatchEvent(new CustomEvent('view:teardown'));
    const host = document.createElement('main');
    host.id = 'content';
    host.className = 'content';
    host.tabIndex = -1;
    old.replaceWith(host);

    r.view(host, { state, calc });

    paintChrome();
    restoreFocus(snap);
  }

  function go(id) {
    current = ROUTES.find(r => r.id === id) ? id : 'pano';
    if (location.hash !== '#/' + current) location.hash = '#/' + current;
    else render();
    const c = UI.el('#content');
    if (c) c.focus();
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function applyTheme(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    const btn = UI.el('#theme-btn');
    btn.innerHTML = mode === 'dark' ? Icons.sun() : Icons.moon();
    btn.setAttribute('aria-label', mode === 'dark' ? t('toLight') : t('toDark'));
  }

  function setLanguage(next) {
    if (next === I18n.lang) return;
    I18n.apply(next);
    Store.update(s => { s.ui.lang = next; }, { silent: true });
    applyTheme(document.documentElement.getAttribute('data-theme') || 'light');
    render();
  }

  function exportMenu() {
    const saved = Store.state.updatedAt;
    UI.modal({
      title: t('exportTitle'),
      width: 560,
      body: `
        <p class="subtle">${t('exportIntro')}
          ${saved ? t('exportLastSave', { t: new Date(saved).toLocaleString(I18n.locale) }) : t('exportNoSave')}
          ${t('exportBackupTip')}</p>
        <div class="divider"></div>
        <h3>${t('workingFile')}</h3>
        <p class="subtle">${t('workingFileDesc')}</p>
        <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px;margin-bottom:16px">
          <button class="btn btn-primary" data-x="json">${Icons.download()} ${t('downloadJson')}</button>
          <button class="btn" data-x="import">${Icons.upload()} ${t('loadFromFile')}</button>
        </div>
        <h3>${t('tableExports')}</h3>
        <p class="subtle">${t('csvNote')}</p>
        <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px">
          <button class="btn" data-x="questions">${Icons.list()} ${t('csvQuestions')}</button>
          <button class="btn" data-x="domains">${Icons.layers()} ${t('csvDomains')}</button>
          <button class="btn" data-x="portfolio">${Icons.users()} ${t('csvPortfolio')}</button>
          <button class="btn" data-x="operations">${Icons.activity()} ${t('csvOperations')}</button>
          <button class="btn" data-x="countries">${Icons.sliders()} ${t('ttlSettings')}</button>
          <button class="btn" data-x="inherent">${Icons.gauge()} ${t('csvInherent')}</button>
          <button class="btn" data-x="qa">${Icons.flask()} ${t('csvQa')}</button>
          <button class="btn" data-x="actions">${Icons.clipboard()} ${t('csvActions')}</button>
        </div>
        <div class="divider"></div>
        <h3>${t('snapTitle')}</h3>
        <p class="subtle">${t('snapHelp')}</p>
        ${(() => {
          const list = Store.snapshots();
          if (!list.length) return `<p class="muted">${t('snapNone')}</p>`;
          return `<div class="table-wrap"><table>
            <thead><tr><th>${t('snapWhen')}</th><th class="num">${t('navSurvey')}</th><th class="num">${t('totalFindings')}</th><th></th></tr></thead>
            <tbody>${list.map(s => `<tr>
              <td>${UI.esc(new Date(s.at).toLocaleString(I18n.locale))}
                <div class="subtle">${t('snapReason_' + s.reason) || s.reason}</div></td>
              <td class="num">${s.answers}</td><td class="num">${s.actions}</td>
              <td><button class="btn btn-sm" data-restore="${UI.esc(s.at)}">${Icons.reset()} ${t('snapRestore')}</button></td>
            </tr>`).join('')}</tbody></table></div>`;
        })()}

        <div class="divider"></div>
        <h3>${t('workspace')}</h3>
        <p class="subtle">${t('resetWarn')}</p>
        <button class="btn btn-danger btn-block" data-x="reset">${Icons.trash()} ${t('resetAll')}</button>`,
      footer: `<button class="btn" data-close>${t('close')}</button>`,
      onMount(scrim) {
        UI.els('[data-restore]', scrim).forEach(b => b.addEventListener('click', async () => {
          const at = b.dataset.restore;
          const ok = await UI.confirmDialog({
            title: t('snapRestoreTitle'),
            message: t('snapRestoreMsg', { t: new Date(at).toLocaleString(I18n.locale) }),
            confirmLabel: t('snapRestore'), danger: true
          });
          if (!ok) return;
          if (Store.restoreSnapshot(at)) { UI.closeModal(); UI.toast(t('snapRestored'), 'ok'); }
        }));
        UI.els('[data-x]', scrim).forEach(b => b.addEventListener('click', () => {
          const kind = b.dataset.x;
          if (kind === 'json') Exporter.saveJSON();
          else if (kind === 'import') { UI.closeModal(); UI.el('#file-input').click(); }
          else if (kind === 'reset') { UI.closeModal(); resetAll(); }
          else Exporter.exportCSV(kind, calc);
        }));
      }
    });
  }

  async function resetAll() {
    const ok = await UI.confirmDialog({
      title: t('resetTitle'),
      message: t('resetMsg'),
      confirmLabel: t('resetAll'), danger: true
    });
    if (!ok) return;
    const lang = Store.state.ui.lang, theme = Store.state.ui.theme;
    Store.reset();
    Store.update(s => { s.ui.lang = lang; s.ui.theme = theme; }, { silent: true });
    UI.toast(t('resetDone'));
  }

  function init() {
    Store.init();
    I18n.apply(Store.state.ui.lang || 'tr');
    applyTheme(Store.state.ui.theme || 'light');
    current = route();

    Store.subscribe(() => render());
    window.addEventListener('hashchange', () => { current = route(); render(); });

    document.addEventListener('click', e => {
      const nav = e.target.closest('[data-route]');
      if (nav) { go(nav.dataset.route); return; }
      if (e.target.closest('#theme-btn')) {
        const next = (document.documentElement.getAttribute('data-theme') === 'dark') ? 'light' : 'dark';
        Store.update(s => { s.ui.theme = next; }, { silent: true });
        applyTheme(next);
        return;
      }
      const langBtn = e.target.closest('[data-lang]');
      if (langBtn) { setLanguage(langBtn.dataset.lang); return; }
      if (e.target.closest('#print-btn')) { window.print(); return; }
      const act = e.target.closest('[data-act]');
      if (act) {
        if (act.dataset.act === 'export') exportMenu();
        else if (act.dataset.act === 'import') UI.el('#file-input').click();
        else if (act.dataset.act === 'reset') resetAll();
      }
    });

    UI.el('#file-input').addEventListener('change', e => {
      const f = e.target.files[0];
      if (f) Exporter.loadJSON(f);
      e.target.value = '';
    });

    render();
  }

  return { init, rerender: render, go, recompute, refreshChrome, setLanguage, get calc() { return calc; } };
})();

document.addEventListener('DOMContentLoaded', App.init);
