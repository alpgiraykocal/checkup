/* Uygulama kabuğu: yönlendirme, kenar çubuğu, tema, dışa aktarım menüsü. */

const App = (() => {
  const ROUTES = [
    { id: 'pano', label: 'Pano', icon: 'dashboard', group: 'Genel', view: Views.dashboard, title: 'Uyum Check-up Panosu', sub: 'Genel durum, ısı haritası ve operasyonel KPI\'lar' },
    { id: 'kunye', label: 'Künye', icon: 'building', group: 'Girdi', view: Views.kunye, title: 'Kurum Künyesi', sub: 'Kapsam ve uygulanabilirlik burada belirlenir' },
    { id: 'dogustan', label: 'Doğuştan Risk', icon: 'gauge', group: 'Girdi', view: Views.inherent, title: 'Doğuştan Risk Değerlendirmesi', sub: '25 alt faktör · 5 boyut · 1–5 skorlama' },
    { id: 'anket', label: 'Anket', icon: 'list', group: 'Girdi', view: Views.questions, title: 'AML/CFT Uyum Soru Bankası', sub: '218 soru · 11 domain · kanıta dayalı yanıt' },
    { id: 'qa', label: 'QA Planı', icon: 'flask', group: 'Girdi', view: Views.qa, title: 'Yıllık QA Planı ve Risk Bazlı Örnekleme', sub: 'Yıllık hacmi girin; örneklem otomatik hesaplanır' },
    { id: 'skorlar', label: 'Kontrol Skorları', icon: 'layers', group: 'Sonuç', view: Views.domainScores, title: 'Domain Bazlı Kontrol Etkinliği', sub: 'Soru bankasından türetilir; girdi yoktur' },
    { id: 'artik', label: 'Artık Risk', icon: 'target', group: 'Sonuç', view: Views.residual, title: 'Artık Risk Matrisi', sub: 'Doğuştan Risk × (1 − Kontrol Etkinliği)' },
    { id: 'aksiyon', label: 'Aksiyon Planı', icon: 'clipboard', group: 'Sonuç', view: Actions.view, title: 'Bulgu ve Aksiyon Planı', sub: 'Kök neden · sahip · termin · doğrulama' },
    { id: 'rapor', label: 'Yönetici Raporu', icon: 'print', group: 'Sonuç', view: Exporter.report, title: 'Yönetici Raporu', sub: 'Yazdırma ve PDF çıktısı' }
  ];

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
    return '';
  }

  function renderNav() {
    const nav = UI.el('#nav');
    let html = '', lastGroup = null;
    ROUTES.forEach(r => {
      if (r.group !== lastGroup) { html += `<div class="nav-group-label">${r.group}</div>`; lastGroup = r.group; }
      html += `<button class="nav-item" data-route="${r.id}" ${current === r.id ? 'aria-current="page"' : ''}>
        ${Icons[r.icon]()}<span class="label">${r.label}</span>${badges(r)}</button>`;
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
    const saved = Store.state.updatedAt;
    UI.el('#saved-at').textContent = saved ? 'Son kayıt ' + new Date(saved).toLocaleTimeString('tr-TR') : 'Kayıt yok';
  }

  function render() {
    const state = Store.state;
    const snap = captureFocus();
    calc = Calc.compute(state);
    const r = ROUTES.find(x => x.id === current);

    renderNav();
    UI.el('#page-title').textContent = r.title;
    UI.el('#page-sub').textContent = r.sub;
    document.title = `${r.label} · AML/CFT Uyum Check-up`;

    // Dinleyicilerin birikmemesi için içerik düğümü her seferinde yenilenir.
    const old = UI.el('#content');
    const host = document.createElement('main');
    host.id = 'content';
    host.className = 'content';
    host.tabIndex = -1;
    old.replaceWith(host);

    r.view(host, { state, calc });

    const saved = Store.state.updatedAt;
    UI.el('#saved-at').textContent = saved ? 'Son kayıt ' + new Date(saved).toLocaleTimeString('tr-TR') : 'Kayıt yok';
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
    btn.setAttribute('aria-label', mode === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç');
  }

  function exportMenu() {
    const saved = Store.state.updatedAt;
    UI.modal({
      title: 'Veri ve yedekleme',
      width: 560,
      body: `
        <p class="subtle">Veriler yalnızca bu tarayıcıda saklanır ve hiçbir sunucuya gönderilmez.
          ${saved ? 'Son kayıt: ' + new Date(saved).toLocaleString('tr-TR') + '.' : 'Henüz kayıt yok.'}
          Yedek almak veya başka bir cihaza taşımak için çalışma dosyasını indirin.</p>
        <div class="divider"></div>
        <h3>Çalışma dosyası</h3>
        <p class="subtle">Tüm yanıtları, skorları ve aksiyon kayıtlarını içerir; geri yüklenebilir.</p>
        <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px;margin-bottom:16px">
          <button class="btn btn-primary" data-x="json">${Icons.download()} JSON indir</button>
          <button class="btn" data-x="import">${Icons.upload()} Dosyadan yükle</button>
        </div>
        <h3>Tablo çıktıları (CSV)</h3>
        <p class="subtle">Excel'de noktalı virgül ayracıyla açılır.</p>
        <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px">
          <button class="btn" data-x="questions">${Icons.list()} Soru bankası</button>
          <button class="btn" data-x="domains">${Icons.layers()} Domain skorları</button>
          <button class="btn" data-x="inherent">${Icons.gauge()} Doğuştan risk</button>
          <button class="btn" data-x="qa">${Icons.flask()} QA örneklem planı</button>
          <button class="btn" data-x="actions">${Icons.clipboard()} Aksiyon planı</button>
        </div>
        <div class="divider"></div>
        <h3>Çalışma alanı</h3>
        <p class="subtle">Sıfırlama tüm girdileri kalıcı olarak siler; önce yedek alın.</p>
        <button class="btn btn-danger btn-block" data-x="reset">${Icons.trash()} Her şeyi sıfırla</button>`,
      footer: `<button class="btn" data-close>Kapat</button>`,
      onMount(scrim) {
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
      title: 'Tüm veriler silinsin mi?',
      message: 'Künye, doğuştan risk skorları, 218 sorunun yanıtları, QA hacimleri ve aksiyon kayıtları kalıcı olarak silinir. Bu işlem geri alınamaz — önce çalışma dosyasını indirmeniz önerilir.',
      confirmLabel: 'Her şeyi sil', danger: true
    });
    if (!ok) return;
    Store.reset();
    UI.toast('Çalışma alanı sıfırlandı.');
  }

  function init() {
    Store.init();
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

  return { init, rerender: render, go, recompute, refreshChrome, get calc() { return calc; } };
})();

document.addEventListener('DOMContentLoaded', App.init);
