/* Bulgu ve Aksiyon Planı — CRUD + SLA takibi (07_Aksiyon_Plani). */

const Actions = (() => {
  const { esc, fmtInt, fmtDate, critChip, selectOptions, emptyState, statTile, fmtPct } = UI;

  const filter = { status: '', crit: '', domain: '', delay: '' };

  function nextId(state) {
    const nums = (state.actions || [])
      .map(a => Number(String(a.id || '').replace(/\D/g, '')))
      .filter(Number.isFinite);
    const max = nums.length ? Math.max(...nums) : 0;
    return 'BLG-' + String(max + 1).padStart(3, '0');
  }

  function view(host, { state, calc }) {
    const list = calc.actions.filter(a => {
      if (filter.status && a.status !== filter.status) return false;
      if (filter.crit && a.crit !== filter.crit) return false;
      if (filter.domain && a.domain !== filter.domain) return false;
      if (filter.delay === 'overdue' && a.delay !== 'GECİKMİŞ') return false;
      if (filter.delay === 'open' && a.status === 'Kapalı') return false;
      return true;
    });

    const st = calc.actionStats;

    host.innerHTML = `
      <div class="grid grid-kpi" style="margin-bottom:16px">
        ${statTile({ label: 'Toplam bulgu', value: fmtInt(st.total) })}
        ${statTile({ label: 'Açık', value: fmtInt(st.open), tone: st.open ? 'warn' : 'ok' })}
        ${statTile({ label: 'Gecikmiş', value: fmtInt(st.overdue), tone: st.overdue ? 'danger' : 'ok', foot: 'Termin geçmiş ve kapanmamış' })}
        ${statTile({ label: 'Kapanış oranı', value: fmtPct(st.closureRate), foot: UI.meter(st.closureRate) })}
      </div>

      <div class="toolbar no-print">
        <div class="field">
          <label for="a-status">Durum</label>
          <select id="a-status" data-af="status"><option value="">Tümü</option>${selectOptions(DATA.ref.status, filter.status)}</select>
        </div>
        <div class="field">
          <label for="a-crit">Kritiklik</label>
          <select id="a-crit" data-af="crit"><option value="">Tümü</option>${selectOptions(DATA.ref.crit, filter.crit)}</select>
        </div>
        <div class="field">
          <label for="a-domain">Domain</label>
          <select id="a-domain" data-af="domain"><option value="">Tümü</option>${selectOptions(DATA.domains.map(d => d.code), filter.domain)}</select>
        </div>
        <div class="field">
          <label for="a-delay">Görünüm</label>
          <select id="a-delay" data-af="delay">
            <option value="">Tümü</option>
            <option value="open"${filter.delay === 'open' ? ' selected' : ''}>Sadece açıklar</option>
            <option value="overdue"${filter.delay === 'overdue' ? ' selected' : ''}>Sadece gecikmişler</option>
          </select>
        </div>
        <div class="toolbar-actions">
          <button class="btn" data-gen>${Icons.layers()} Eksik kontrollerden üret</button>
          <button class="btn btn-primary" data-new>${Icons.plus()} Yeni bulgu</button>
        </div>
      </div>

      <div class="card">
        <div class="card-head"><h2>Bulgu ve aksiyon planı</h2>
          <span class="subtle">${fmtInt(list.length)} kayıt gösteriliyor</span></div>
        <div class="card-body" style="padding:0">
          ${list.length ? table(list) : emptyState('Kayıt yok',
            'Anket ve QA testlerinden çıkan her kontrol eksikliği için bir bulgu satırı açın.',
            `<button class="btn btn-primary" data-new style="margin-top:12px">${Icons.plus()} Yeni bulgu</button>`)}
        </div>
      </div>`;

    host.addEventListener('change', e => {
      const f = e.target.closest('[data-af]');
      if (!f) return;
      filter[f.dataset.af] = f.value;
      App.rerender();
    });

    host.addEventListener('click', e => {
      if (e.target.closest('[data-new]')) return openForm(null);
      if (e.target.closest('[data-gen]')) return generateFromGaps(calc);
      const ed = e.target.closest('[data-edit]');
      if (ed) return openForm(ed.dataset.edit);
      const del = e.target.closest('[data-del]');
      if (del) return remove(del.dataset.del);
    });
  }

  function table(list) {
    const rows = list.map(a => `
      <tr>
        <td><b class="mono">${esc(a.id)}</b>${a.questionId ? `<div class="subtle mono">${esc(a.questionId)}</div>` : ''}</td>
        <td><span class="chip">${esc(a.domain || '—')}</span></td>
        <td style="min-width:240px">${esc(a.finding)}
          ${a.rootCause ? `<div class="subtle">Kök neden: ${esc(a.rootCause)}</div>` : ''}</td>
        <td style="min-width:220px">${esc(a.action || '—')}
          ${a.verification ? `<div class="subtle">Doğrulama: ${esc(a.verification)}</div>` : ''}</td>
        <td>${a.crit ? critChip(a.crit) : '—'}</td>
        <td>${esc(a.owner || '—')}</td>
        <td class="nowrap">${fmtDate(a.due)}</td>
        <td>${statusChip(a)}</td>
        <td>
          <div class="row-actions">
            <button class="btn btn-sm btn-icon" data-edit="${esc(a.id)}" aria-label="${esc(a.id)} düzenle">${Icons.edit()}</button>
            <button class="btn btn-sm btn-icon btn-danger" data-del="${esc(a.id)}" aria-label="${esc(a.id)} sil">${Icons.trash()}</button>
          </div>
        </td>
      </tr>`).join('');

    return `<div class="table-wrap"><table>
      <thead><tr>
        <th>Bulgu ID</th><th>Domain</th><th>Bulgu / kök neden</th><th>Aksiyon / doğrulama</th>
        <th>Kritiklik</th><th>Sahip</th><th>Termin</th><th>Durum</th><th class="no-print">İşlem</th>
      </tr></thead>
      <tbody>${rows}</tbody></table></div>`;
  }

  function statusChip(a) {
    if (a.status === 'Kapalı') return `<span class="chip chip-ok">${Icons.check()} Kapalı</span>`;
    if (a.delay === 'GECİKMİŞ') return `<span class="chip chip-critical">${Icons.alert()} Gecikmiş</span><div class="subtle">${esc(a.status || '')}</div>`;
    return `<span class="chip chip-mid">${esc(a.status || 'Açık')}</span>`;
  }

  /* ---------- Form ---------- */
  function openForm(id, prefill = {}) {
    const state = Store.state;
    const existing = id ? (state.actions || []).find(a => a.id === id) : null;
    const q = prefill.questionId ? DATA.questions.find(x => x.id === prefill.questionId) : null;

    const a = existing || Object.assign({
      id: nextId(state),
      questionId: q ? q.id : '',
      domain: q ? q.domain : '',
      finding: q ? q.text : '',
      source: q ? 'Anket — ' + q.id : '',
      rootCause: '',
      crit: q ? q.crit : 'Yüksek',
      action: '',
      owner: '',
      due: q ? Calc.slaDueDate(q.crit) : Calc.slaDueDate('Yüksek'),
      verification: q && q.qa ? `${q.pop || 'İlgili popülasyon'} üzerinde yeniden örneklem testi` : '',
      status: 'Açık',
      closedAt: '',
      residualAfter: ''
    }, prefill);

    const f = (label, name, input, help) => `<div class="field">
      <label for="af-${name}">${esc(label)}</label>${input}${help ? `<div class="help">${esc(help)}</div>` : ''}</div>`;

    UI.modal({
      title: existing ? `Bulgu düzenle — ${a.id}` : 'Yeni bulgu',
      width: 780,
      body: `
        <div class="field-row">
          ${f('Bulgu ID', 'id', `<input type="text" id="af-id" name="id" value="${esc(a.id)}" ${existing ? 'readonly' : ''}>`)}
          ${f('Domain', 'domain', `<select id="af-domain" name="domain">${UI.selectOptions(DATA.domains.map(d => d.code + ' — ' + d.name), (DATA.domains.find(d => d.code === a.domain) ? a.domain + ' — ' + DATA.domains.find(d => d.code === a.domain).name : ''), 'Seçiniz')}</select>`)}
          ${f('İlgili soru ID', 'questionId', `<input type="text" id="af-questionId" name="questionId" value="${esc(a.questionId)}" placeholder="D6-02">`)}
        </div>
        ${f('Bulgu / kontrol eksikliği', 'finding', `<textarea id="af-finding" name="finding" required>${esc(a.finding)}</textarea>`)}
        <div class="field-row">
          ${f('Kaynak', 'source', `<input type="text" id="af-source" name="source" value="${esc(a.source)}" placeholder="Anket / QA testi / Örneklem testi">`)}
          ${f('Kök neden', 'rootCause', `<select id="af-rootCause" name="rootCause">${UI.selectOptions(DATA.ref.rootCause, a.rootCause, 'Seçiniz')}</select>`,
            'Kök neden sınıflandırması olmadan aksiyon planı "eğitim verilecek" listesine döner.')}
          ${f('Kritiklik', 'crit', `<select id="af-crit" name="crit">${UI.selectOptions(DATA.ref.crit, a.crit)}</select>`)}
        </div>
        ${f('Aksiyon', 'action', `<textarea id="af-action" name="action">${esc(a.action)}</textarea>`)}
        <div class="field-row">
          ${f('Sahip', 'owner', `<input type="text" id="af-owner" name="owner" value="${esc(a.owner)}" placeholder="Birim / kişi">`)}
          ${f('Termin', 'due', `<input type="date" id="af-due" name="due" value="${esc(a.due)}">`, 'Kritik 5 iş günü · Yüksek 30 gün · Orta 90 gün')}
          ${f('Durum', 'status', `<select id="af-status" name="status">${UI.selectOptions(DATA.ref.status, a.status)}</select>`)}
        </div>
        ${f('Doğrulama yöntemi (re-test)', 'verification', `<textarea id="af-verification" name="verification">${esc(a.verification)}</textarea>`,
          'Re-test tanımı olmadan kapanış denetimde geçerli sayılmaz.')}
        <div class="field-row">
          ${f('Kapanış tarihi', 'closedAt', `<input type="date" id="af-closedAt" name="closedAt" value="${esc(a.closedAt)}">`)}
          ${f('Kapanış sonrası artık risk', 'residualAfter', `<select id="af-residualAfter" name="residualAfter">${UI.selectOptions(DATA.ref.riskLevel, a.residualAfter, '—')}</select>`)}
        </div>`,
      footer: `<button class="btn" data-close>Vazgeç</button>
               <button class="btn btn-primary" data-save>${Icons.check()} Kaydet</button>`,
      onMount(scrim) {
        const critSel = UI.el('#af-crit', scrim);
        const dueInp = UI.el('#af-due', scrim);
        critSel.addEventListener('change', () => {
          if (!existing || !dueInp.value) dueInp.value = Calc.slaDueDate(critSel.value);
        });
        UI.el('[data-save]', scrim).addEventListener('click', () => {
          const get = n => { const e = UI.el(`[name="${n}"]`, scrim); return e ? e.value.trim() : ''; };
          const rec = {
            id: get('id') || nextId(Store.state),
            domain: (get('domain').split(' — ')[0] || ''),
            questionId: get('questionId'),
            finding: get('finding'),
            source: get('source'),
            rootCause: get('rootCause'),
            crit: get('crit'),
            action: get('action'),
            owner: get('owner'),
            due: get('due'),
            status: get('status'),
            verification: get('verification'),
            closedAt: get('closedAt'),
            residualAfter: get('residualAfter')
          };
          if (!rec.finding) { UI.toast('Bulgu alanı zorunlu.', 'err'); UI.el('#af-finding', scrim).focus(); return; }
          Store.update(s => {
            s.actions = s.actions || [];
            const i = s.actions.findIndex(x => x.id === (existing ? existing.id : rec.id));
            if (i >= 0) s.actions[i] = rec; else s.actions.push(rec);
          });
          UI.closeModal();
          UI.toast(existing ? 'Bulgu güncellendi.' : `${rec.id} eklendi.`, 'ok');
        });
      }
    });
  }

  async function remove(id) {
    const ok = await UI.confirmDialog({
      title: 'Bulgu silinsin mi?',
      message: `${id} kaydı kalıcı olarak silinecek. Bu işlem geri alınamaz.`,
      confirmLabel: 'Sil', danger: true
    });
    if (!ok) return;
    Store.update(s => { s.actions = (s.actions || []).filter(a => a.id !== id); });
    UI.toast(`${id} silindi.`);
  }

  /** Aksiyon gerektiren, henüz bulgu kaydı olmayan sorulardan taslak üretir. */
  async function generateFromGaps(calc) {
    const existing = new Set((Store.state.actions || []).map(a => a.questionId).filter(Boolean));
    const gaps = DATA.questions.filter(q => {
      const s = calc.perQuestion[q.id];
      return s.actionNeeded && s.actionNeeded !== 'Hayır' && !existing.has(q.id);
    });
    if (!gaps.length) { UI.toast('Kayıt açılmamış eksik kontrol yok.', 'ok'); return; }

    const ok = await UI.confirmDialog({
      title: 'Eksik kontrollerden bulgu üret',
      message: `${gaps.length} soru için taslak bulgu satırı açılacak. Kök neden, sahip ve termin alanlarını sonra doldurmanız gerekir.`,
      confirmLabel: `${gaps.length} kayıt oluştur`
    });
    if (!ok) return;

    Store.update(s => {
      s.actions = s.actions || [];
      let n = Math.max(0, ...s.actions.map(a => Number(String(a.id).replace(/\D/g, '')) || 0));
      gaps.forEach(q => {
        n += 1;
        const rec = Store.state.answers[q.id] || {};
        s.actions.push({
          id: 'BLG-' + String(n).padStart(3, '0'),
          domain: q.domain,
          questionId: q.id,
          finding: (rec.note && rec.note.trim()) ? rec.note.trim() : q.text,
          source: 'Anket — ' + q.id + (rec.a ? ' (yanıt: ' + rec.a + ')' : ''),
          rootCause: '',
          crit: q.crit,
          action: '',
          owner: '',
          due: Calc.slaDueDate(q.crit),
          status: 'Açık',
          verification: q.qa ? `${q.pop || 'İlgili popülasyon'} üzerinde yeniden örneklem testi` : 'Kanıt yeniden incelemesi',
          closedAt: '',
          residualAfter: ''
        });
      });
    });
    UI.toast(`${gaps.length} taslak bulgu oluşturuldu.`, 'ok');
  }

  return { view, openForm, generateFromGaps };
})();
