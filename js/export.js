/* Dışa/içe aktarım ve yönetici raporu. Tüm işlemler tarayıcı içinde; sunucuya veri gitmez. */

const Exporter = (() => {
  const { esc, fmtInt, fmtPct, fmtPct1, fmtNum1, fmtNum2, fmtDate, levelClass, effClass, critChip } = UI;

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
    download(`aml-checkup-${name}-${stamp()}.json`, JSON.stringify(snap, null, 2), 'application/json');
    UI.toast('Çalışma dosyası indirildi.', 'ok');
  }

  function loadJSON(file) {
    const reader = new FileReader();
    reader.onload = async () => {
      let parsed;
      try { parsed = JSON.parse(reader.result); }
      catch { UI.toast('Dosya okunamadı: geçerli JSON değil.', 'err'); return; }
      if (!parsed || typeof parsed !== 'object' || !('answers' in parsed)) {
        UI.toast('Bu dosya bir AML Check-up çalışma dosyası değil.', 'err'); return;
      }
      const hasWork = Object.keys(Store.state.answers).length || (Store.state.actions || []).length;
      if (hasWork) {
        const ok = await UI.confirmDialog({
          title: 'Mevcut çalışma değiştirilecek',
          message: 'Yüklenen dosya ekrandaki tüm yanıtların, skorların ve aksiyon kayıtlarının yerine geçer. Devam edilsin mi?',
          confirmLabel: 'Yükle ve değiştir', danger: true
        });
        if (!ok) return;
      }
      Store.replace(parsed);
      UI.toast('Çalışma dosyası yüklendi.', 'ok');
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
      name = 'soru-bankasi';
      rows = [['Soru ID', 'Kod', 'Domain', 'Bölüm', 'Soru', 'Cevap', 'Katsayı', 'Ağırlık', 'Uygulanabilir Ağırlık',
        'Kazanılan Puan', 'Kritiklik', 'Beklenen Kanıt', 'Kaynak', 'QA Testi', 'Örneklem Popülasyonu',
        'Kanıt Referansı', 'Bulgu / Not', 'Aksiyon Gerekli mi?', 'Otomatik N/A Gerekçesi']];
      DATA.questions.forEach(q => {
        const s = calc.perQuestion[q.id], rec = state.answers[q.id] || {};
        rows.push([q.id, q.domain, q.domainName, q.section, q.text, s.answer, dec(s.coef), q.weight,
          dec(s.applicableWeight || ''), dec(s.earned || ''), q.crit, q.evidence, q.source,
          q.qa ? 'Evet' : 'Hayır', q.pop, rec.evidence || '', rec.note || '', s.actionNeeded, s.scopeReason || '']);
      });
    } else if (kind === 'domains') {
      name = 'domain-skorlari';
      rows = [['Kod', 'Domain', 'Soru Sayısı', 'Yanıtlanan', 'Uygulanamaz', 'Uygulanabilir Ağırlık', 'Kazanılan Puan',
        'Kontrol Etkinliği', 'Olgunluk', 'Açık Kritik Soru', 'Aksiyon Gerektiren',
        'Doğuştan Risk', 'Artık Risk', 'Artık Risk Seviyesi', 'İştah Limiti', 'İştah Aşımı']];
      const byCode = Object.fromEntries(calc.residual.map(r => [r.code, r]));
      calc.domains.forEach(d => {
        const r = byCode[d.code];
        rows.push([d.code, d.name, d.count, d.answered, d.na, dec(d.applicableWeight), dec(d.earned),
          dec(d.effectiveness === null ? '' : d.effectiveness.toFixed(4)), d.maturity, d.openCritical, d.actionsNeeded,
          dec(r.inherentRisk.toFixed(2)), dec(r.residual === null ? '' : r.residual.toFixed(2)),
          r.level, dec(r.appetite), r.breach === null ? '' : (r.breach ? 'AŞIM - AKSİYON' : 'İştah İçinde')]);
      });
    } else if (kind === 'qa') {
      name = 'qa-orneklem-plani';
      rows = [['Popülasyon', 'Domain', 'Risk Seviyesi', 'Yıllık Hacim', 'Tam Kapsam', 'Örneklem Oranı',
        'Asgari Örneklem', 'Yıllık Örneklem', 'Test Frekansı', 'Test Başına Örneklem', 'Test Odağı']];
      calc.qa.forEach(p => rows.push([p.pop, p.domain, p.risk, p.volume ?? '', p.full ? 'Evet' : 'Hayır',
        dec(p.rate), p.min, p.yearlySample ?? '', p.freq, p.perTest ?? '', p.focus]));
    } else if (kind === 'actions') {
      name = 'aksiyon-plani';
      rows = [['Bulgu ID', 'Domain', 'İlgili Soru ID', 'Bulgu / Kontrol Eksikliği', 'Kaynak', 'Kök Neden', 'Kritiklik',
        'Aksiyon', 'Sahip', 'Termin', 'Doğrulama Yöntemi', 'Durum', 'Gecikme', 'Kapanış Tarihi', 'Kapanış Sonrası Artık Risk']];
      calc.actions.forEach(a => rows.push([a.id, a.domain, a.questionId, a.finding, a.source, a.rootCause, a.crit,
        a.action, a.owner, a.due, a.verification, a.status, a.delay, a.closedAt, a.residualAfter]));
    } else if (kind === 'inherent') {
      name = 'dogustan-risk';
      rows = [['Risk Boyutu', 'Alt Faktör', 'Skor (1-5)', 'Skor Açıklaması', 'Durum',
        'Ağırlık', 'Varsayılan Ağırlık', 'Ağırlıklı Puan', 'Gerekçe / Kanıt', 'Beslediği Domainler']];
      calc.inherent.factors.forEach(({ f, st }) => {
        rows.push([f.dim, f.factor, st.score || '',
          st.score ? f.anchors[st.score - 1] : '',
          st.na ? (st.manualNA ? 'Uygulanamaz' : st.scopeReason) : (st.scored ? 'Skorlandı' : 'Skorlanmadı'),
          dec(st.weight), dec(f.weight), st.weighted === null ? '' : dec(st.weighted.toFixed(1)),
          st.note, ((DATA.dimDomains || {})[f.dim] || []).join(' ')]);
      });
      rows.push([]);
      rows.push(['Boyut', 'Doğuştan Risk (1-5)', 'Seviye', 'Skorlanan', 'Uygulanabilir', 'Uygulanamaz']);
      Calc.DIMS.concat(['GENEL']).forEach(d => {
        const v = calc.inherent.dims[d];
        rows.push([d, v.measured ? dec(v.value.toFixed(2)) : '', v.level, v.scored, v.applicable, v.na]);
      });
    }

    download(`${name}-${stamp()}.csv`, toCSV(rows), 'text/csv');
    UI.toast('CSV indirildi. Excel\'de "noktalı virgül" ayracıyla açılır.', 'ok');
  }

  /* ---------- Yönetici raporu ---------- */
  function report(host, { state, calc }) {
    const t = calc.totals, inh = calc.inherent;
    const k = state.kunye;
    const kv = (label, val) => `<tr><td style="width:38%">${esc(label)}</td><td><b>${esc(val || '—')}</b></td></tr>`;

    const topGaps = DATA.questions
      .map(q => ({ q, s: calc.perQuestion[q.id] }))
      .filter(x => x.s.openCritical)
      .slice(0, 15);

    const breaches = calc.residual.filter(r => r.breach);
    const overdue = calc.actions.filter(a => a.delay === 'GECİKMİŞ');

    host.innerHTML = `
      <div class="toolbar no-print">
        <div style="flex:1" class="subtle">Bu sayfa yazdırma ve PDF çıktısı için biçimlendirilmiştir.</div>
        <div class="toolbar-actions">
          <button class="btn btn-primary" onclick="window.print()">${Icons.print()} Yazdır / PDF</button>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <div>
            <h2>AML/CFT Uyum Check-up — Yönetici Özeti</h2>
            <div class="subtle">${esc(k.kurum_unvani || 'Kurum adı girilmedi')} · Değerlendirme dönemi: ${esc(k.degerlendirme_donemi || '—')} · Rapor tarihi: ${fmtDate(new Date())}</div>
          </div>
        </div>
        <div class="card-body">
          <div class="grid grid-kpi">
            ${UI.statTile({ label: 'Kontrol etkinliği', value: fmtPct1(t.effectiveness), foot: esc(t.maturity || '—') })}
            ${UI.statTile({ label: 'Doğuştan risk', value: inh.measured ? fmtNum2(inh.general) : '—', unit: '/5',
              foot: inh.measured ? esc(inh.dims.GENEL.level) + ` · ${inh.scored}/${inh.applicable} faktör` : 'ölçülmedi' })}
            ${UI.statTile({ label: 'Artık risk', value: fmtNum2(calc.generalResidual), unit: '/5',
              foot: calc.generalResidual === null ? '—' : esc(Calc.residualLevel(calc.generalResidual)) })}
            ${UI.statTile({ label: 'Kapsam', value: `${fmtInt(t.answered)} / ${fmtInt(t.count)}`, foot: `${fmtPct(t.progress)} yanıtlandı` })}
          </div>

          <div class="divider"></div>
          <h3>Kurum künyesi</h3>
          <div class="table-wrap"><table><tbody>
            ${kv('Yükümlü tipi', k.yukumlu_tipi)}
            ${kv('Faaliyet gösterilen ülkeler', k.faaliyet_gosterilen_ulkeler)}
            ${kv('Değerlendirmeyi yapan', k.degerlendirmeyi_yapan)}
            ${kv('Uyum görevlisi', k.uyum_gorevlisi)}
            ${kv('Toplam müşteri sayısı', k.toplam_musteri_sayisi)}
            ${kv('Uyum birimi kadrosu (FTE)', k.uyum_birimi_kadrosu_fte)}
            ${kv('Son bağımsız AML denetimi', k.son_bagimsiz_aml_denetimi_tarihi)}
            ${kv('Son EWRA tarihi', k.son_ewra_tarihi)}
          </tbody></table></div>

          <div class="divider"></div>
          <h3>Doğuştan risk profili</h3>
          <div class="table-wrap"><table>
            <thead><tr><th>Boyut</th><th class="num">Skor</th><th>Seviye</th><th class="num">Kapsam</th><th>Beslediği domainler</th></tr></thead>
            <tbody>${Calc.DIMS.map(d => {
              const v = inh.dims[d];
              return `<tr><td>${esc(d)}</td>
                <td class="num"><span class="heat-cell score-pill ${levelClass(v.level)}">${v.measured ? fmtNum2(v.value) : '—'}</span></td>
                <td>${esc(v.level || 'ölçülmedi')}</td>
                <td class="num">${v.scored}/${v.applicable}${v.na ? ` (${v.na} N/A)` : ''}</td>
                <td class="subtle">${((DATA.dimDomains || {})[d] || []).join(' · ')}</td></tr>`;
            }).join('')}</tbody>
          </table></div>
          ${inh.drivers.length ? `<p style="margin-top:10px"><b>Baskın risk sürücüleri:</b>
            ${inh.drivers.slice(0, 5).map(d => `${esc(d.factor)} (${d.score}×${fmtNum1(d.weight)})`).join(' · ')}</p>` : ''}

          <div class="divider"></div>
          <h3>Domain sonuçları</h3>
          <div class="table-wrap"><table>
            <thead><tr><th>Kod</th><th>Domain</th><th class="num">Etkinlik</th><th>Olgunluk</th>
              <th class="num">Artık risk</th><th>Seviye</th><th>İştah</th><th class="num">Açık kritik</th></tr></thead>
            <tbody>${calc.residual.map(r => {
              const d = calc.domains.find(x => x.code === r.code);
              return `<tr>
                <td class="mono"><b>${esc(r.code)}</b></td><td>${esc(r.name)}</td>
                <td class="num"><span class="heat-cell score-pill ${effClass(d.effectiveness)}">${fmtPct(d.effectiveness)}</span></td>
                <td>${esc(d.maturity || '—')}</td>
                <td class="num"><span class="heat-cell score-pill ${levelClass(r.level)}">${fmtNum2(r.residual)}</span></td>
                <td>${esc(r.level || '—')}</td>
                <td>${r.breach === null ? '—' : r.breach ? '<b style="color:var(--danger)">AŞIM</b>' : 'İçinde'}</td>
                <td class="num">${fmtInt(d.openCritical)}</td>
              </tr>`;
            }).join('')}</tbody>
          </table></div>

          <div class="divider"></div>
          <h3>Risk iştahını aşan domainler (${breaches.length})</h3>
          ${breaches.length ? `<ul>${breaches.map(r =>
            `<li><b>${esc(r.code)} ${esc(r.name)}</b> — artık risk ${fmtNum2(r.residual)} > iştah ${fmtNum1(r.appetite)} (${esc(r.level)})</li>`).join('')}</ul>`
            : '<p class="muted">Ölçülebilir aşım yok.</p>'}

          <div class="divider"></div>
          <h3>Açık kritik kontroller (${t.openCritical})</h3>
          ${topGaps.length ? `<div class="table-wrap"><table>
            <thead><tr><th>Soru</th><th>Kontrol</th><th>Yanıt</th><th>Kanıt referansı</th></tr></thead>
            <tbody>${topGaps.map(({ q, s }) => `<tr>
              <td class="mono">${esc(q.id)}</td><td>${esc(q.text)}</td>
              <td>${esc(s.answer)}</td><td>${esc((state.answers[q.id] || {}).evidence || '—')}</td>
            </tr>`).join('')}</tbody></table></div>
            ${t.openCritical > topGaps.length ? `<p class="subtle">İlk ${topGaps.length} kayıt gösterildi; tamamı için soru bankası CSV çıktısını kullanın.</p>` : ''}`
            : '<p class="muted">Açık kritik kontrol yok.</p>'}

          <div class="divider"></div>
          <h3>Aksiyon planı özeti</h3>
          <p>Toplam <b>${fmtInt(calc.actionStats.total)}</b> bulgu · açık <b>${fmtInt(calc.actionStats.open)}</b> ·
             gecikmiş <b style="color:var(--danger)">${fmtInt(calc.actionStats.overdue)}</b> ·
             kapanış oranı <b>${fmtPct(calc.actionStats.closureRate)}</b></p>
          ${overdue.length ? `<div class="table-wrap"><table>
            <thead><tr><th>ID</th><th>Bulgu</th><th>Sahip</th><th>Termin</th><th>Kritiklik</th></tr></thead>
            <tbody>${overdue.map(a => `<tr><td class="mono">${esc(a.id)}</td><td>${esc(a.finding)}</td>
              <td>${esc(a.owner || '—')}</td><td>${fmtDate(a.due)}</td><td>${critChip(a.crit)}</td></tr>`).join('')}
            </tbody></table></div>` : ''}

          <div class="divider"></div>
          <p class="subtle">Yöntem: Kontrol etkinliği = kazanılan puan / uygulanabilir ağırlık (Evet 1,00 · Kısmen 0,50 · Hayır 0,00 · Uygulanamaz skorlama dışı).
          Artık Risk = Doğuştan Risk × (1 − Kontrol Etkinliği). Anket beyanı tek başına kontrol etkinliği sayılmaz; QA dosya testi ile doğrulanmalıdır.
          Kaynak çerçeveler: FATF Tavsiyeleri, MASAK mevzuatı, Wolfsberg, Basel. Madde atıfları yön göstericidir; yürürlükteki metinlerle doğrulanmalıdır.</p>
        </div>
      </div>`;
  }

  return { saveJSON, loadJSON, exportCSV, report };
})();
