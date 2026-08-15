/* Bulgu ve Aksiyon Planı — CRUD + SLA takibi (07_Aksiyon_Plani). */

const Actions = (() => {
  const { esc, fmtInt, fmtDate, critChip, selectOptions, emptyState, statTile, fmtPct } = UI;
  const banner = Views.banner;
  const t = (k, p) => I18n.t(k, p);

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
      if (filter.crit && a.crit !== filter.crit) return false;   // dil-güvenli: aksiyon kaydı sabit anahtar saklar
      if (filter.domain && a.domain !== filter.domain) return false;
      if (filter.delay === 'overdue' && a.delay !== 'GECİKMİŞ') return false;
      if (filter.delay === 'open' && a.status === 'Kapalı') return false;
      return true;
    });

    const st = calc.actionStats;

    host.innerHTML = `
      <div class="grid grid-kpi">
        ${statTile({ label: t('totalFindings'), value: fmtInt(st.total) })}
        ${statTile({ label: t('open'), value: fmtInt(st.open), tone: st.open ? 'warn' : 'ok' })}
        ${statTile({ label: t('overdue'), value: fmtInt(st.overdue), tone: st.overdue ? 'danger' : 'ok', foot: t('overdueDesc') })}
        ${(() => {
          const incomplete = calc.actions.filter(a => gaps(a).length).length;
          return statTile({ label: t('incompleteFindings'), value: fmtInt(incomplete),
            tone: incomplete ? 'warn' : 'ok',
            foot: incomplete ? t('incompleteDesc') : t('allComplete') });
        })()}
        ${statTile({ label: t('closureRate'), value: fmtPct(st.closureRate), foot: UI.meter(st.closureRate) })}
      </div>

      ${banner('info', t('bnFiveFields'), t('bnFiveFieldsBody'))}

      <div class="toolbar no-print">
        <div class="field">
          <label for="a-status">${t('status')}</label>
          <select id="a-status" data-af="status"><option value="">${t('all')}</option>${UI.refOptions('status', filter.status)}</select>
        </div>
        <div class="field">
          <label for="a-crit">${t('criticality')}</label>
          <select id="a-crit" data-af="crit"><option value="">${t('all')}</option>${UI.refOptions('crit', filter.crit)}</select>
        </div>
        <div class="field">
          <label for="a-domain">${t('domain')}</label>
          <select id="a-domain" data-af="domain"><option value="">${t('all')}</option>${selectOptions(DATA.domains.map(d => d.code), filter.domain)}</select>
        </div>
        <div class="field">
          <label for="a-delay">${t('viewLabel')}</label>
          <select id="a-delay" data-af="delay">
            <option value="">${t('all')}</option>
            <option value="open"${filter.delay === 'open' ? ' selected' : ''}>${t('onlyOpen')}</option>
            <option value="overdue"${filter.delay === 'overdue' ? ' selected' : ''}>${t('onlyOverdue')}</option>
          </select>
        </div>
        <div class="toolbar-actions">
          <button class="btn" data-gen>${Icons.layers()} ${t('generateFromGaps')}</button>
          <button class="btn btn-primary" data-new>${Icons.plus()} ${t('newFinding')}</button>
        </div>
      </div>

      <div class="card">
        <div class="card-head"><h2>${t('ttlActions')}</h2>
          <span class="subtle">${t('findingsShown', { n: fmtInt(list.length) })}</span></div>
        <div class="card-body flush">
          ${list.length ? table(list) : emptyState(t('noRecords'), t('noRecordsBody'),
            `<button class="btn btn-primary" data-new>${Icons.plus()} ${t('newFinding')}</button>`)}
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

  /** Denetimde savunulabilir bir bulgu satırında bulunması gereken alanlar. */
  function gaps(a) {
    const missing = [];
    if (!a.rootCause) missing.push(t('mRootCause'));
    if (!a.action) missing.push(t('mAction'));
    if (!a.owner) missing.push(t('mOwner'));
    if (!a.due) missing.push(t('mDue'));
    if (!a.verification) missing.push(t('mVerification'));
    return missing;
  }

  function table(list) {
    const rows = list.map(a => {
      const missing = gaps(a);
      return `
      <tr>
        <td><b class="mono">${esc(a.id)}</b>${a.questionId ? `<div class="subtle mono">${esc(a.questionId)}</div>` : ''}</td>
        <td><span class="chip">${esc(a.domain || '—')}</span></td>
        <td style="min-width:240px">${esc(a.finding)}
          ${a.rootCause ? `<div class="subtle">${t('rootCauseLbl')}: ${esc(I18n.ref('rootCause', a.rootCause))}</div>` : ''}
          ${missing.length ? `<div style="margin-top:4px"><span class="chip chip-high" title="${t('missingTitle')}">${Icons.alert()} ${t('missingPrefix')}: ${esc(missing.join(', '))}</span></div>` : ''}</td>
        <td style="min-width:220px">${esc(a.action || '—')}
          ${a.verification ? `<div class="subtle">${t('verificationLbl')}: ${esc(a.verification)}</div>` : ''}</td>
        <td>${a.crit ? critChip(a.crit) : '—'}</td>
        <td>${esc(a.owner || '—')}</td>
        <td class="nowrap">${fmtDate(a.due)}</td>
        <td>${statusChip(a)}</td>
        <td>
          <div class="row-actions">
            <button class="btn btn-sm btn-icon" data-edit="${esc(a.id)}" aria-label="${esc(a.id)} — ${t('edit')}">${Icons.edit()}</button>
            <button class="btn btn-sm btn-icon btn-danger" data-del="${esc(a.id)}" aria-label="${esc(a.id)} — ${t('delete')}">${Icons.trash()}</button>
          </div>
        </td>
      </tr>`;
    }).join('');

    return `<div class="table-wrap"><table>
      <thead><tr>
        <th>${t('colFindingId')}</th><th>${t('domain')}</th><th>${t('colFindingRoot')}</th><th>${t('colActionVerif')}</th>
        <th>${t('criticality')}</th><th>${t('colOwner')}</th><th>${t('colDue')}</th><th>${t('status')}</th><th class="no-print">${t('colOps')}</th>
      </tr></thead>
      <tbody>${rows}</tbody></table></div>`;
  }

  function statusChip(a) {
    if (a.status === 'Kapalı') return `<span class="chip chip-ok">${Icons.check()} ${t('closed')}</span>`;
    if (a.delay === 'GECİKMİŞ') return `<span class="chip chip-critical">${Icons.alert()} ${t('overdue')}</span><div class="subtle">${esc(I18n.ref('status', a.status))}</div>`;
    return `<span class="chip chip-mid">${esc(I18n.ref('status', a.status || 'Açık'))}</span>`;
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
      source: q ? t('genSource', { id: q.id }) : '',
      rootCause: '',
      crit: q ? q.critKey : 'Yüksek',
      action: '',
      owner: '',
      due: q ? Calc.slaDueDate(q.critKey) : Calc.slaDueDate('Yüksek'),
      verification: q && q.qa ? t('genVerifQa', { pop: q.pop || t('genPopFallback') }) : '',
      status: 'Açık',
      closedAt: '',
      residualAfter: ''
    }, prefill);

    const f = (label, name, input, help, req) => `<div class="field">
      <label for="af-${name}" class="${req ? 'req' : ''}">${esc(label)}</label>${input}${help ? `<div class="help">${esc(help)}</div>` : ''}</div>`;

    UI.modal({
      title: existing ? `${t('editFinding')} — ${a.id}` : t('newFinding'),
      width: 800,
      body: `
        <p class="subtle" style="margin-bottom:14px">${t('formIntro')}</p>
        <div class="field-row">
          ${f(t('fId'), 'id', `<input type="text" id="af-id" name="id" value="${esc(a.id)}" ${existing ? 'readonly' : ''}>`,
            existing ? t('fIdHelpEdit') : t('fIdHelpNew'))}
          ${f(t('domain'), 'domain', `<select id="af-domain" name="domain">${UI.selectOptions(DATA.domains.map(d => d.code), a.domain, t('select'), DATA.domains.map(d => d.code + ' — ' + d.name))}</select>`,
            t('fDomainHelp'))}
          ${f(t('fQuestionId'), 'questionId',
            `<input type="text" id="af-questionId" name="questionId" value="${esc(a.questionId)}"
               list="af-qids" placeholder="D6-02" autocomplete="off">
             <datalist id="af-qids">${DATA.questions.map(q => `<option value="${esc(q.id)}">${esc(q.text.slice(0, 70))}</option>`).join('')}</datalist>
             <div class="q-echo subtle" id="af-qecho"></div>`,
            t('fQuestionHelp'))}
        </div>
        ${f(t('fFinding'), 'finding',
          `<textarea id="af-finding" name="finding" required placeholder="${t('fFindingPh')}">${esc(a.finding)}</textarea>`,
          t('fFindingHelp'), true)}
        <div class="field-row">
          ${f(t('source'), 'source', `<input type="text" id="af-source" name="source" value="${esc(a.source)}" placeholder="${t('fSourcePh')}">`,
            t('fSourceHelp'))}
          ${f(t('rootCauseLbl'), 'rootCause', `<select id="af-rootCause" name="rootCause">${UI.refOptions('rootCause', a.rootCause, t('select'))}</select>`,
            t('fRootHelp'), true)}
          ${f(t('criticality'), 'crit', `<select id="af-crit" name="crit">${UI.refOptions('crit', a.crit)}</select>`,
            t('fCritHelp'))}
        </div>
        ${f(t('fAction'), 'action',
          `<textarea id="af-action" name="action" placeholder="${t('fActionPh')}">${esc(a.action)}</textarea>`,
          t('fActionHelp'))}
        <div class="field-row">
          ${f(t('colOwner'), 'owner', `<input type="text" id="af-owner" name="owner" value="${esc(a.owner)}" placeholder="${t('fOwnerPh')}">`,
            t('fOwnerHelp'), true)}
          ${f(t('colDue'), 'due', `<input type="date" id="af-due" name="due" value="${esc(a.due)}">`,
            t('fDueHelp'), true)}
          ${f(t('status'), 'status', `<select id="af-status" name="status">${UI.refOptions('status', a.status)}</select>`,
            t('fStatusHelp'))}
        </div>
        ${f(t('fVerification'), 'verification',
          `<textarea id="af-verification" name="verification" placeholder="${t('fVerifPh')}">${esc(a.verification)}</textarea>`,
          t('fVerifHelp'))}
        <div class="field-row">
          ${f(t('fClosedAt'), 'closedAt', `<input type="date" id="af-closedAt" name="closedAt" value="${esc(a.closedAt)}">`,
            t('fClosedHelp'))}
          ${f(t('fResidualAfter'), 'residualAfter', `<select id="af-residualAfter" name="residualAfter">${UI.refOptions('riskLevel', a.residualAfter, '—')}</select>`,
            t('fResidualHelp'))}
        </div>`,
      footer: `<button class="btn" data-close>${t('cancel')}</button>
               <button class="btn btn-primary" data-save>${Icons.check()} ${t('save')}</button>`,
      onMount(scrim) {
        const critSel = UI.el('#af-crit', scrim);
        const dueInp = UI.el('#af-due', scrim);
        critSel.addEventListener('change', () => {
          if (!existing || !dueInp.value) dueInp.value = Calc.slaDueDate(critSel.value);
        });

        // Soru ID yazıldıkça sorunun metnini göster — doğru soruya bağlandığı görülsün
        const qInp = UI.el('#af-questionId', scrim);
        const qEcho = UI.el('#af-qecho', scrim);
        const syncEcho = () => {
          const q = DATA.questions.find(x => x.id === qInp.value.trim().toUpperCase());
          qEcho.textContent = q ? `${q.domain} · ${q.section} — ${q.text}` : (qInp.value.trim() ? t('fQNotFound') : '');
          qEcho.classList.toggle('is-error', Boolean(qInp.value.trim() && !q));
        };
        qInp.addEventListener('input', syncEcho);
        syncEcho();
        UI.el('[data-save]', scrim).addEventListener('click', () => {
          const get = n => { const e = UI.el(`[name="${n}"]`, scrim); return e ? e.value.trim() : ''; };
          const rec = {
            id: get('id') || nextId(Store.state),
            domain: get('domain'),
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
          const problems = [];
          /* Yeni kayıtta kimlik alanı düzenlenebilir. Var olan bir kimlik
             yazılırsa eski bulgu sessizce üzerine yazılıyordu — denetim kaydı
             kaybı. Çakışma açıkça reddedilir. */
          if (!existing && (Store.state.actions || []).some(a => a.id === rec.id)) {
            problems.push(['af-id', t('vIdTaken', { id: rec.id })]);
          }
          if (!rec.finding) problems.push(['af-finding', t('vFinding')]);
          if (!rec.rootCause) problems.push(['af-rootCause', t('vRootCause')]);
          if (!rec.owner) problems.push(['af-owner', t('vOwner')]);
          if (!rec.due) problems.push(['af-due', t('vDue')]);
          if (rec.questionId && !DATA.questions.some(q => q.id === rec.questionId.toUpperCase())) {
            problems.push(['af-questionId', t('vQuestionId')]);
          }
          if (problems.length) {
            UI.toast(problems[0][1] + (problems.length > 1 ? ' ' + t('vMissingCount', { n: problems.length }) : ''), 'err');
            const first = UI.el('#' + problems[0][0], scrim);
            if (first) first.focus();
            return;
          }
          rec.questionId = rec.questionId.toUpperCase();
          const oncekiKayit = existing ? JSON.stringify({
            finding: existing.finding, status: existing.status, crit: existing.crit,
            owner: existing.owner, due: existing.due
          }) : '';
          const sonrakiKayit = JSON.stringify({
            finding: rec.finding, status: rec.status, crit: rec.crit, owner: rec.owner, due: rec.due
          });
          Store.update(s => {
            s.actions = s.actions || [];
            const i = s.actions.findIndex(x => x.id === (existing ? existing.id : rec.id));
            if (i >= 0) s.actions[i] = rec; else s.actions.push(rec);
          }, { log: { what: existing ? 'action-edit' : 'action-add', ref: rec.id,
                      before: oncekiKayit, after: sonrakiKayit } });
          UI.closeModal();
          UI.toast(existing ? t('savedUpdated') : t('savedAdded', { id: rec.id }), 'ok');
        });
      }
    });
  }

  async function remove(id) {
    const ok = await UI.confirmDialog({
      title: t('delTitle'),
      message: t('delMsg', { id }),
      confirmLabel: t('delete'), danger: true
    });
    if (!ok) return;
    const silinen = (Store.state.actions || []).find(a => a.id === id);
    Store.update(s => { s.actions = (s.actions || []).filter(a => a.id !== id); },
      { log: { what: 'action-delete', ref: id, before: silinen ? silinen.finding : id, after: '' } });
    UI.toast(t('delDone', { id }));
  }

  /** Aksiyon gerektiren, henüz bulgu kaydı olmayan sorulardan taslak üretir. */
  async function generateFromGaps(calc) {
    const existing = new Set((Store.state.actions || []).map(a => a.questionId).filter(Boolean));
    const gaps = DATA.questions.filter(q => {
      const s = calc.perQuestion[q.id];
      return s.actionNeeded && s.actionNeeded !== 'Hayır' && !existing.has(q.id);
    });
    if (!gaps.length) { UI.toast(t('genNoneToast'), 'ok'); return; }

    const ok = await UI.confirmDialog({
      title: t('genTitle'),
      message: t('genMsg', { n: gaps.length }),
      confirmLabel: t('genOk', { n: gaps.length })
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
          source: rec.a ? t('genSourceAnswer', { id: q.id, a: I18n.ref('answers', rec.a) }) : t('genSource', { id: q.id }),
          rootCause: '',
          crit: q.critKey,
          action: '',
          owner: '',
          due: Calc.slaDueDate(q.critKey),
          status: 'Açık',
          verification: q.qa ? t('genVerifQa', { pop: q.pop || t('genPopFallback') }) : t('genVerifDoc'),
          closedAt: '',
          residualAfter: ''
        });
      });
    });
    UI.toast(t('genDone', { n: gaps.length }), 'ok');
  }

  return { view, openForm, generateFromGaps };
})();
