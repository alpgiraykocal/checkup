/* Ek kontroller ekranı.
   Yanıtlar ana anketle aynı kayıt biçimini (state.answers) kullanır; skorlaması
   Calc.extra() içinde ana skordan ayrı yürür. */

const Extra = (() => {
  const { esc, fmtInt, fmtPct, fmtPct1, fmtNum1, critChip, statTile, meter, refOptions } = UI;
  const t = (k, p) => I18n.t(k, p);
  const L = o => (I18n.isEn ? o.en : o.tr);

  const ANSWER_ICON = { 'Evet': 'check', 'Kısmen': 'half', 'Hayır': 'x', 'Uygulanamaz': 'minus' };

  function view(host, ctx) {
    const { state, calc } = ctx;
    const ex = calc.extra;
    if (!ex) { host.innerHTML = ''; return; }

    const tot = ex.totals;

    host.innerHTML = `
      ${Views.banner('info', t('exIntroTtl'), t('exIntroBody'))}

      <div class="grid grid-kpi" style="margin-bottom:16px">
        ${statTile({ label: t('exActiveSets'), value: fmtInt(ex.activeSets),
          foot: t('exSetsFoot', { n: ex.totalSets, m: ex.activeSets }) })}
        ${statTile({ label: t('exCoverage'), value: `${fmtInt(tot.answered)}`, unit: `/ ${fmtInt(tot.count)}`,
          foot: `${fmtPct(tot.progress)}` + meter(tot.progress) })}
        ${statTile({ label: t('exEff'), value: fmtPct1(tot.effectivenessTested),
          tone: tot.effectivenessTested === null ? '' : tot.effectivenessTested >= 0.75 ? 'ok' : tot.effectivenessTested >= 0.6 ? 'warn' : 'danger',
          foot: (tot.maturity ? esc(I18n.ref('maturity', tot.maturity)) : t('notMeasured')) + ` · ${t('exNotInMain')}` })}
        ${statTile({ label: t('kpiOpenCritical'), value: fmtInt(tot.openCritical),
          tone: tot.openCritical > 0 ? 'danger' : 'ok', foot: t('critRule') })}
      </div>

      ${tot.answered === 0 ? Views.banner('warn', t('exEmptyTtl'), t('exEmptyBody')) : ''}

      ${ex.sets.map(setCard).join('')}`;

    bind(host, ctx);
  }

  function setCard(s) {
    const spec = s.spec;
    return `<div class="card ${s.outOfScope ? 'is-muted' : ''}">
      <div class="card-head">
        <div style="flex:1;min-width:240px">
          <h2>${esc(L(spec))}</h2>
          <div class="subtle">${esc(I18n.isEn ? spec.enWhy : spec.trWhy)}</div>
        </div>
        ${s.outOfScope
          ? `<span class="chip chip-na">${Icons.lock()} ${t('exOutOfScope')}</span>`
          : `<span class="chip ${s.answered === s.count ? 'chip-ok' : ''}">${s.answered}/${s.count}</span>
             ${s.effectivenessTested === null ? '' :
               `<span class="chip ${Views.maturityClass(s.maturity)}">${fmtPct(s.effectivenessTested)}</span>`}`}
      </div>
      ${s.outOfScope
        ? `<div class="card-body"><p class="subtle">${esc(s.questions[0].st.scopeReason || '')}</p></div>`
        : `<div class="card-body" style="padding:0">${s.questions.map(x => row(x.q, x.st)).join('')}</div>`}
    </div>`;
  }

  /** Ana anketle aynı kart yapısı ve sınıfları — görsel dil bir kalsın. */
  function row(q, st) {
    const rec = Store.state.answers[q.id] || {};
    const evidence = I18n.isEn ? q.enEvidence : q.trEvidence;
    const missingEvidence = st.answered && !(rec.evidence || '').trim();

    const answerBtns = DATA.ref.answers.map(a => `
      <button type="button" class="answer-btn" data-ex-answer="${esc(q.id)}" data-a="${esc(a)}"
        aria-pressed="${st.answer === a}">
        ${Icons[ANSWER_ICON[a]]()}<span>${esc(I18n.ref('answers', a))}</span>
      </button>`).join('');

    return `<article class="q ${st.openCritical ? 'is-open-critical' : ''}" id="q-${esc(q.id)}">
      <div class="q-head">
        <span class="q-id">${esc(q.id)}</span>
        <div class="q-main">
          <div class="q-text">${esc(L(q))}</div>
          <div class="q-meta">
            ${critChip(q.crit)}
            <span class="chip">${t('weight')} ${q.weight}</span>
            <span class="chip">${esc(q.domain)}</span>
            ${q.qa ? `<span class="chip chip-mid">${Icons.flask()} ${t('qaTest')}</span>` : ''}
            ${st.actionNeeded === 'EVET - ÖNCELİKLİ' ? `<span class="chip chip-critical">${Icons.alert()} ${t('priorityAction')}</span>`
              : st.actionNeeded === 'Evet' ? `<span class="chip chip-high">${t('actionNeeded')}</span>` : ''}
            ${missingEvidence ? `<span class="chip chip-high">${t('noEvidenceRef')}</span>` : ''}
          </div>
          <div class="answers" role="group" aria-label="${t('answerFor', { id: esc(q.id) })}">${answerBtns}</div>
        </div>
      </div>
      <div class="q-detail">
        <div class="q-refs">
          <div><b>${t('expectedEvidence')}:</b> ${esc(evidence)}</div>
          <div><b>${t('source')}:</b> ${esc(q.source)}</div>
        </div>
        <div class="field" style="margin:0">
          <label for="exev-${esc(q.id)}">${t('evidenceRef')}</label>
          <input type="text" id="exev-${esc(q.id)}" data-ex-evidence="${esc(q.id)}"
            value="${esc(rec.evidence || '')}" placeholder="${esc(evidence)} — ${t('evidencePhSuffix')}">
        </div>
        ${q.qa ? `<details class="qa-block"${st.qaResult ? ' open' : ''}>
          <summary>${Icons.flask()} ${t('qaResultTitle')}${st.qaResult
            ? ` — <span class="chip ${st.qaResult === 'Çelişkili' ? 'chip-critical' : st.qaResult === 'Doğrulandı' ? 'chip-ok' : 'chip-high'}">${esc(I18n.ref('qaResult', st.qaResult))}</span>`
            : ` <span class="chip chip-na">${t('qaNotEntered')}</span>`}</summary>
          <div class="field" style="margin-top:10px">
            <label for="exqa-${esc(q.id)}">${t('qaResultLabel')}</label>
            <select id="exqa-${esc(q.id)}" data-ex-qa="${esc(q.id)}" data-field="qaResult">
              <option value="">${t('select')}</option>${refOptions('qaResult', st.qaResult)}
            </select>
          </div>
        </details>` : ''}
      </div>
    </article>`;
  }

  function bind(host, ctx) {
    host.addEventListener('click', e => {
      const b = e.target.closest('[data-ex-answer]');
      if (!b) return;
      const id = b.dataset.exAnswer, val = b.dataset.a;
      Store.update(s => {
        s.answers[id] = s.answers[id] || {};
        s.answers[id].a = s.answers[id].a === val ? '' : val;
      });
    });

    host.addEventListener('input', e => {
      const ev = e.target.closest('[data-ex-evidence]');
      if (!ev) return;
      Store.update(s => {
        const id = ev.dataset.exEvidence;
        s.answers[id] = s.answers[id] || { a: '' };
        s.answers[id].evidence = ev.value;
      }, { silent: true });
    });

    host.addEventListener('change', e => {
      const qa = e.target.closest('[data-ex-qa]');
      if (!qa) return;
      Store.update(s => {
        const id = qa.dataset.exQa;
        s.answers[id] = s.answers[id] || { a: '' };
        if (qa.value === '') delete s.answers[id].qaResult;
        else s.answers[id].qaResult = qa.value;
      });
    });
  }

  return { view };
})();
