/* Skorlama motoru — kaynak çalışma kitabındaki formüllerle birebir eşleşir.
   Referans: 02_Dogustan_Risk, 03_Soru_Bankasi, 04_Domain_Skorlari, 05_Artik_Risk, 06_QA_Orneklem */

const Calc = (() => {

  const ANSWER_COEF = { 'Evet': 1, 'Kısmen': 0.5, 'Hayır': 0, 'Uygulanamaz': null };

  // 05_Artik_Risk!D — her domainin doğuştan risk kaynağı (boyut ortalaması)
  const RESIDUAL_DIMS = {
    D1: ['GENEL'],
    D2: ['Müşteri', 'Coğrafya ve Yaptırım'],
    D3: ['Ürün', 'Kanal'],
    D4: ['İşlem'],
    D5: ['Müşteri'],
    D6: ['Coğrafya ve Yaptırım'],
    D7: ['İşlem', 'Ürün'],
    D8: ['Müşteri', 'İşlem'],
    D9: ['GENEL'],
    D10: ['GENEL'],
    D11: ['GENEL']
  };

  const DIMS = ['Müşteri', 'Coğrafya ve Yaptırım', 'Ürün', 'Kanal', 'İşlem'];

  /* ---------- Kapsam (künye tabanlı uygulanamazlık) ---------- */

  /** Künyede "Hayır" işaretlenen faaliyetlere bağlı soru bölümlerini kapsam dışına alır. */
  function scopedOut(state) {
    const out = new Map(); // "domain|section" -> gerekçe
    DATA.scopeRules.forEach(rule => {
      if ((state.kunye[rule.field] || '') === 'Hayır') {
        rule.match.forEach(([dom, sec]) => out.set(dom + '|' + sec,
          I18n.t('scopeNoActivity', { label: rule.label })));
      }
    });
    return out;
  }

  function questionScope(q, scopeMap) {
    return scopeMap.get(q.domain + '|' + q.sectionKey) || null;
  }

  /* ---------- Künye ---------- */

  function monthsSince(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return null;
    const now = new Date();
    return (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth())
      + (now.getDate() < d.getDate() ? -1 : 0);
  }

  function ratio(state, numId, denId) {
    const n = Number(state.kunye[numId]), d = Number(state.kunye[denId]);
    if (!Number.isFinite(n) || !Number.isFinite(d) || d <= 0) return null;
    return n / d;
  }

  /** Künye tamlığı, türetilen oranlar ve tarih yaşlandırma uyarıları. */
  function kunye(state) {
    const filled = f => String(state.kunye[f.id] || '').trim() !== '';
    const required = DATA.kunyeFields.filter(f => f.required);
    const missingRequired = required.filter(f => !filled(f));
    const missing = DATA.kunyeFields.filter(f => !filled(f));

    const stale = DATA.kunyeFields
      .filter(f => f.staleMonths)
      .map(f => {
        const m = monthsSince(state.kunye[f.id]);
        return { field: f, months: m, overdue: m !== null && m > f.staleMonths };
      });

    const T = I18n.t;
    const ratios = [
      { id: 'highRisk', label: T('ratioHighRisk'),
        value: ratio(state, 'yuksek_riskli_musteri_sayisi', 'toplam_musteri_sayisi'),
        note: T('ratioNoteHighRisk') },
      { id: 'pep', label: T('ratioPep'),
        value: ratio(state, 'pep_musteri_sayisi', 'toplam_musteri_sayisi'),
        note: T('ratioNotePep') },
      { id: 'crossBorder', label: T('ratioCrossBorder'),
        value: ratio(state, 'yillik_sinir_otesi_islem_adedi', 'yillik_islem_adedi'),
        note: T('ratioNoteCross') },
      { id: 'load', label: T('ratioLoad'),
        value: ratio(state, 'toplam_musteri_sayisi', 'uyum_birimi_kadrosu_fte'),
        format: 'int', note: T('ratioNoteLoad') }
    ];

    // Dönem tutarlılığı
    const bas = state.kunye.donem_baslangic, bit = state.kunye.donem_bitis;
    let periodError = null;
    if (bas && bit && new Date(bit) < new Date(bas)) periodError = T('errPeriod');

    // Sayısal tutarlılık
    const warnings = [];
    const tot = Number(state.kunye.toplam_musteri_sayisi);
    [['yuksek_riskli_musteri_sayisi', T('lblHighRiskCount')],
     ['pep_musteri_sayisi', T('lblPepCount')]].forEach(([id, label]) => {
      const v = Number(state.kunye[id]);
      if (Number.isFinite(v) && Number.isFinite(tot) && tot > 0 && v > tot) {
        warnings.push(T('errExceedsTotal', { label }));
      }
    });
    const cb = Number(state.kunye.yillik_sinir_otesi_islem_adedi);
    const ti = Number(state.kunye.yillik_islem_adedi);
    if (Number.isFinite(cb) && Number.isFinite(ti) && ti > 0 && cb > ti) {
      warnings.push(T('errCrossBorder'));
    }
    if (periodError) warnings.push(periodError);

    return {
      total: DATA.kunyeFields.length,
      filled: DATA.kunyeFields.length - missing.length,
      progress: (DATA.kunyeFields.length - missing.length) / DATA.kunyeFields.length,
      missing, missingRequired, stale, ratios, warnings,
      periodLabel: (bas && bit) ? `${fmtTR(bas)} – ${fmtTR(bit)}` : (state.kunye.degerlendirme_donemi || '')
    };
  }

  function fmtTR(iso) {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(I18n.locale);
  }

  /** Otomatik hesaplanabilen KPI değeri; elle girilen değer varsa o kazanır. */
  function autoKpi(spec, state, ctx) {
    if (!spec.auto) return null;
    if (spec.auto === 'actionClosure') {
      return ctx.closureRate === null ? null : Math.round(ctx.closureRate * 100);
    }
    if (spec.auto.startsWith('monthsSince:')) {
      return monthsSince(state.kunye[spec.auto.split(':')[1]]);
    }
    return null;
  }

  /* ---------- Soru düzeyi ---------- */

  /** 03_Soru_Bankasi G/I/J/R sütunları. */
  function scoreQuestion(q, rec, scopeReason) {
    const raw = rec && rec.a ? rec.a : '';
    const answer = scopeReason && !raw ? 'Uygulanamaz' : raw;
    const answered = answer !== '';
    const coef = answered ? ANSWER_COEF[answer] : undefined;
    const inScope = answered && coef !== null;      // Uygulanamaz => skorlamadan çıkar

    return {
      answer,
      answered,
      autoNA: Boolean(scopeReason && !raw),
      scopeReason: scopeReason || null,
      coef: inScope ? coef : null,
      applicableWeight: inScope ? q.weight : 0,
      earned: inScope ? q.weight * coef : 0,
      openCritical: inScope && q.critKey === 'Kritik' && coef < 1,
      actionNeeded: !inScope ? '' : (coef === 1 ? 'Hayır' : (q.critKey === 'Kritik' ? 'EVET - ÖNCELİKLİ' : 'Evet'))
    };
  }

  /* ---------- Doğuştan risk ---------- */

  /** Bir faktörün etkin durumu: ağırlık geçersiz kılma, kapsam dışılık, skor, gerekçe. */
  function factorState(f, state) {
    const key = f.key || (f.dim + '|' + f.factor);
    const wOverride = Number(state.inherentWeights[key]);
    const weight = Number.isFinite(wOverride) && wOverride > 0 ? wOverride : f.weight;

    const autoNA = Boolean(f.scope && (state.kunye[f.scope.field] || '') === 'Hayır');
    const manualNA = state.inherentNA[key] === true;
    const scoreRaw = Number(state.inherent[key]);
    const scored = Number.isFinite(scoreRaw) && scoreRaw >= 1;

    // Kapsam kuralı yalnızca elle skorlanmamış faktörü bağlar.
    const na = manualNA || (autoNA && !scored);

    return {
      key, weight, na, autoNA, manualNA,
      scopeReason: autoNA ? f.scope.reason : null,
      weightOverridden: weight !== f.weight,
      score: scored ? scoreRaw : null,
      scored: scored && !na,
      weighted: (scored && !na) ? scoreRaw * weight : null,
      note: state.inherentNotes[key] || '',
      /** 4-5 arası skorda gerekçe zorunlu sayılır — denetimde ilk sorulan budur. */
      needsNote: scored && !na && scoreRaw >= 4 && !(state.inherentNotes[key] || '').trim()
    };
  }

  /** Boyut skoru = Σ(skor × ağırlık) / Σ(skorlanan faktörlerin ağırlığı).
      Uygulanamaz ve henüz skorlanmamış faktörler paydaya girmez; tüm faktörler
      skorlandığında sonuç kaynak çalışma kitabıyla birebir aynıdır. */
  function inherent(state) {
    const byDim = {};
    DIMS.forEach(d => byDim[d] = { num: 0, den: 0, fullDen: 0, scored: 0, na: 0, total: 0, factors: [] });

    const factors = DATA.inherentFactors.map(f => {
      const st = factorState(f, state);
      const b = byDim[f.dimKey];
      if (b) {
        b.total += 1;
        b.factors.push({ f, st });
        if (st.na) b.na += 1;
        else {
          b.fullDen += st.weight;
          if (st.scored) { b.num += st.weighted; b.den += st.weight; b.scored += 1; }
        }
      }
      return { f, st };
    });

    const scores = {};
    let sum = 0, n = 0, scored = 0, na = 0, total = 0, pending = 0;
    DIMS.forEach(d => {
      const b = byDim[d];
      const applicable = b.total - b.na;
      const v = b.den ? b.num / b.den : null;
      scores[d] = {
        value: v === null ? 0 : v,
        measured: v !== null,
        level: v === null ? '' : riskLevel5(v),
        scored: b.scored, na: b.na, total: b.total, applicable,
        complete: b.scored === applicable && applicable > 0,
        coverage: applicable ? b.scored / applicable : 0,
        factors: b.factors
      };
      if (v !== null) { sum += v; n += 1; }
      scored += b.scored; na += b.na; total += b.total;
      pending += applicable - b.scored;
    });

    const general = n ? sum / n : 0;
    scores['GENEL'] = {
      value: general, measured: n > 0, level: n ? riskLevel5(general) : '',
      scored, na, total, applicable: total - na,
      complete: pending === 0 && total - na > 0,
      coverage: (total - na) ? scored / (total - na) : 0
    };

    // En yüksek ağırlıklı katkıyı veren faktörler — yönetime "neden yüksek" cevabı.
    const drivers = factors
      .filter(x => x.st.scored)
      .map(x => ({ dim: x.f.dim, dimKey: x.f.dimKey, factor: x.f.factor, score: x.st.score, weight: x.st.weight, weighted: x.st.weighted }))
      .sort((a, b) => b.weighted - a.weighted || b.score - a.score);

    return {
      dims: scores, factors, drivers,
      general, measured: n > 0,
      scored, na, total, applicable: total - na, pending,
      complete: pending === 0 && total - na > 0,
      coverage: (total - na) ? scored / (total - na) : 0,
      missingNotes: factors.filter(x => x.st.needsNote).length
    };
  }

  /** 02!I — 1-5 ölçeğinde doğuştan risk seviyesi. */
  function riskLevel5(v) {
    if (v >= 4) return 'Çok Yüksek';
    if (v >= 3) return 'Yüksek';
    if (v >= 2) return 'Orta';
    return 'Düşük';
  }

  /** 05!G — 0-5 ölçeğinde artık risk seviyesi. */
  function residualLevel(v) {
    if (v >= 3.5) return 'Çok Yüksek';
    if (v >= 2.5) return 'Yüksek';
    if (v >= 1.5) return 'Orta';
    return 'Düşük';
  }

  /** 04!H — kontrol etkinliğinden olgunluk. */
  function maturity(eff) {
    if (eff === null) return '';
    if (eff >= 0.9) return 'Gelişmiş';
    if (eff >= 0.75) return 'Yeterli';
    if (eff >= 0.6) return 'Gelişime Açık';
    if (eff >= 0.4) return 'Zayıf';
    return 'Kritik Zayıf';
  }

  /* ---------- Tam hesap ---------- */

  function compute(state) {
    const scopeMap = scopedOut(state);

    // Soru başına skor
    const perQuestion = {};
    DATA.questions.forEach(q => {
      perQuestion[q.id] = scoreQuestion(q, state.answers[q.id], questionScope(q, scopeMap));
    });

    // Domain toplamları (04_Domain_Skorlari)
    const domains = DATA.domains.map(d => {
      const qs = DATA.questions.filter(q => q.domain === d.code);
      let answered = 0, appW = 0, earned = 0, openCrit = 0, actions = 0, na = 0;
      qs.forEach(q => {
        const s = perQuestion[q.id];
        if (s.answered) answered += 1;
        if (s.coef === null && s.answered) na += 1;
        appW += s.applicableWeight;
        earned += s.earned;
        if (s.openCritical) openCrit += 1;
        if (s.actionNeeded && s.actionNeeded !== 'Hayır') actions += 1;
      });
      const eff = appW ? earned / appW : null;
      return {
        code: d.code, name: d.name,
        count: qs.length, answered, na,
        applicableWeight: appW, earned,
        effectiveness: eff, maturity: maturity(eff),
        openCritical: openCrit, actionsNeeded: actions,
        progress: qs.length ? answered / qs.length : 0
      };
    });

    const totals = domains.reduce((t, d) => {
      t.count += d.count; t.answered += d.answered; t.na += d.na;
      t.applicableWeight += d.applicableWeight; t.earned += d.earned;
      t.openCritical += d.openCritical; t.actionsNeeded += d.actionsNeeded;
      return t;
    }, { count: 0, answered: 0, na: 0, applicableWeight: 0, earned: 0, openCritical: 0, actionsNeeded: 0 });
    totals.effectiveness = totals.applicableWeight ? totals.earned / totals.applicableWeight : null;
    totals.maturity = maturity(totals.effectiveness);
    totals.progress = totals.count ? totals.answered / totals.count : 0;

    // Doğuştan + artık risk (05_Artik_Risk)
    const inh = inherent(state);
    const byCode = Object.fromEntries(domains.map(d => [d.code, d]));
    const residual = DATA.domains.map(d => {
      const dims = RESIDUAL_DIMS[d.code] || ['GENEL'];
      const parts = dims.map(k => inh.dims[k]).filter(Boolean);
      const irMeasured = parts.length > 0 && parts.every(p => p.measured);
      const ir = parts.reduce((s, p) => s + p.value, 0) / (parts.length || 1);
      const eff = byCode[d.code].effectiveness;
      // Doğuştan risk ölçülmediyse artık risk hesaplanmaz; sıfır göstermek yanıltıcı olur.
      const res = (eff === null || !irMeasured) ? null : ir * (1 - eff);
      const limit = DATA.appetite[d.code];
      return {
        code: d.code, name: d.name,
        source: DATA.residualSource[d.code] || '',
        inherentRisk: irMeasured ? ir : null, effectiveness: eff,
        residual: res, level: res === null ? '' : residualLevel(res),
        appetite: limit,
        breach: res === null ? null : res > limit
      };
    });

    const generalResidual = (totals.effectiveness === null || !inh.measured)
      ? null : inh.general * (1 - totals.effectiveness);

    // QA örneklem planı (06_QA_Orneklem)
    const qa = DATA.qaPopulations.map(p => {
      const vol = Number(state.qaVolumes[p.key]);
      const has = Number.isFinite(vol) && vol > 0;
      const yearly = !has ? null
        : (p.full ? vol : Math.min(vol, Math.max(Math.round(vol * p.rate), p.min)));
      const divisor = p.freq === 'Çeyreklik' ? 4 : p.freq === 'Altı Aylık' ? 2 : 1;
      return Object.assign({}, p, {
        volume: has ? vol : null,
        yearlySample: yearly,
        perTest: yearly === null ? null : Math.ceil(yearly / divisor),
        tests: divisor
      });
    });
    const qaTotals = qa.reduce((t, p) => {
      t.volume += p.volume || 0; t.yearlySample += p.yearlySample || 0; t.perTest += p.perTest || 0;
      return t;
    }, { volume: 0, yearlySample: 0, perTest: 0 });

    // Aksiyon planı (07)
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const actions = (state.actions || []).map(a => {
      let delay = '';
      if (a.due) {
        if (a.status === 'Kapalı') delay = 'Kapalı';
        else delay = new Date(a.due + 'T00:00:00') < today ? 'GECİKMİŞ' : 'Zamanında';
      }
      return Object.assign({}, a, { delay });
    });
    const actionStats = {
      total: actions.length,
      open: actions.filter(a => a.status && a.status !== 'Kapalı').length,
      overdue: actions.filter(a => a.delay === 'GECİKMİŞ').length,
      closed: actions.filter(a => a.status === 'Kapalı').length,
      critical: actions.filter(a => a.crit === 'Kritik' && a.status !== 'Kapalı').length
    };
    actionStats.closureRate = actionStats.total ? actionStats.closed / actionStats.total : null;

    return {
      scopeMap, perQuestion, domains, totals, kunye: kunye(state),
      portfolio: (typeof Portfolio !== 'undefined') ? Portfolio.compute(state) : null,
      inherent: inh, residual, generalResidual,
      breaches: residual.filter(r => r.breach).length,
      qa, qaTotals, actions, actionStats
    };
  }

  /** Kritikliğe göre son tarih (09_Referans SLA tablosu). */
  function slaDueDate(crit, from) {
    const days = DATA.ref.sla[crit];
    if (!days) return '';
    const d = from ? new Date(from) : new Date();
    if (crit === 'Kritik') { // 5 iş günü
      let left = days;
      while (left > 0) { d.setDate(d.getDate() + 1); const w = d.getDay(); if (w !== 0 && w !== 6) left -= 1; }
    } else {
      d.setDate(d.getDate() + days);
    }
    return d.toISOString().slice(0, 10);
  }

  return { compute, inherent, factorState, kunye, autoKpi, monthsSince,
           maturity, riskLevel5, residualLevel, slaDueDate,
           ANSWER_COEF, DIMS, RESIDUAL_DIMS };
})();
