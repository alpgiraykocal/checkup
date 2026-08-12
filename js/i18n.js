/* Dil katmanı / Language layer.
   Depolanan tüm değerler Türkçe anahtarlarla saklanır; yalnızca görünen metin değişir.
   All stored values keep Turkish keys; only the displayed text changes. */

const I18n = (() => {

  const UI = {
    /* --- Kabuk / shell --- */
    appTitle:        ['AML/CFT Uyum Check-up', 'AML/CFT Compliance Check-up'],
    appSub:          ['Anket · QA · Aksiyon Planı', 'Questionnaire · QA · Action Plan'],
    skipToContent:   ['İçeriğe atla', 'Skip to content'],
    navMain:         ['Ana gezinme', 'Main navigation'],
    groupGeneral:    ['GENEL', 'OVERVIEW'],
    groupInput:      ['GİRDİ', 'INPUT'],
    groupResult:     ['SONUÇ', 'RESULTS'],
    langLabel:       ['Dil', 'Language'],
    langSwitch:      ['Change language / Dili değiştir', 'Change language / Dili değiştir'],
    print:           ['Yazdır', 'Print'],
    toDark:          ['Koyu temaya geç', 'Switch to dark theme'],
    toLight:         ['Açık temaya geç', 'Switch to light theme'],
    dataBackup:      ['Veri ve yedekleme', 'Data and backup'],
    exportBtn:       ['Dışa aktar', 'Export'],
    importBtn:       ['Çalışma dosyası yükle', 'Load working file'],
    resetBtn:        ['Sıfırla', 'Reset'],
    noSave:          ['Kayıt yok', 'Not saved yet'],
    lastSave:        ['Son kayıt', 'Last saved'],
    localOnly:       ['Veriler yalnızca bu tarayıcıda saklanır.', 'Data is stored in this browser only.'],

    /* --- Sayfa başlıkları / page titles --- */
    navDash:      ['Pano', 'Dashboard'],
    navKunye:     ['Künye', 'Profile'],
    navInherent:  ['Doğuştan Risk', 'Inherent Risk'],
    navSurvey:    ['Anket', 'Questionnaire'],
    navQa:        ['QA Planı', 'QA Plan'],
    navScores:    ['Kontrol Skorları', 'Control Scores'],
    navResidual:  ['Artık Risk', 'Residual Risk'],
    navActions:   ['Aksiyon Planı', 'Action Plan'],
    navReport:    ['Yönetici Raporu', 'Executive Report'],

    ttlDash:      ['Uyum Check-up Panosu', 'Compliance Check-up Dashboard'],
    subDash:      ['Genel durum, ısı haritası ve operasyonel KPI\'lar', 'Overall status, heat map and operational KPIs'],
    ttlKunye:     ['Kurum Künyesi', 'Institution Profile'],
    subKunye:     ['Kapsam ve uygulanabilirlik burada belirlenir', 'Scope and applicability are set here'],
    ttlInherent:  ['Doğuştan Risk Değerlendirmesi', 'Inherent Risk Assessment'],
    subInherent:  ['25 alt faktör · 5 boyut · 1–5 skorlama', '25 sub-factors · 5 dimensions · 1–5 scoring'],
    ttlSurvey:    ['AML/CFT Uyum Soru Bankası', 'AML/CFT Compliance Question Bank'],
    subSurvey:    ['218 soru · 11 domain · kanıta dayalı yanıt', '218 questions · 11 domains · evidence-based answers'],
    ttlQa:        ['Yıllık QA Planı ve Risk Bazlı Örnekleme', 'Annual QA Plan and Risk-Based Sampling'],
    subQa:        ['Dönem içi hacmi girin; örneklem otomatik hesaplanır', 'Enter the period volume; sample sizes are calculated automatically'],
    ttlScores:    ['Domain Bazlı Kontrol Etkinliği', 'Control Effectiveness by Domain'],
    subScores:    ['Soru bankasından türetilir; girdi yoktur', 'Derived from the question bank; no input here'],
    ttlResidual:  ['Artık Risk Matrisi', 'Residual Risk Matrix'],
    subResidual:  ['Doğuştan Risk × (1 − Kontrol Etkinliği)', 'Inherent Risk × (1 − Control Effectiveness)'],
    ttlActions:   ['Bulgu ve Aksiyon Planı', 'Findings and Action Plan'],
    subActions:   ['Kök neden · sahip · termin · doğrulama', 'Root cause · owner · due date · verification'],
    ttlReport:    ['Yönetici Raporu', 'Executive Report'],
    subReport:    ['Yazdırma ve PDF çıktısı', 'For printing and PDF export'],

    /* --- Ortak / common --- */
    all:            ['Tümü', 'All'],
    select:         ['Seçiniz', 'Select'],
    cancel:         ['Vazgeç', 'Cancel'],
    save:           ['Kaydet', 'Save'],
    close:          ['Kapat', 'Close'],
    confirm:        ['Onayla', 'Confirm'],
    delete:         ['Sil', 'Delete'],
    edit:           ['Düzenle', 'Edit'],
    notMeasured:    ['ölçülmedi', 'not measured'],
    noDateEntered:  ['tarih girilmedi', 'no date entered'],
    optional:       ['isteğe bağlı', 'optional'],
    of:             ['/', 'of'],
    domain:         ['Domain', 'Domain'],
    section:        ['Bölüm', 'Section'],
    weight:         ['Ağırlık', 'Weight'],
    criticality:    ['Kritiklik', 'Criticality'],
    status:         ['Durum', 'Status'],
    level:          ['Seviye', 'Level'],
    source:         ['Kaynak', 'Source'],
    method:         ['Yöntem', 'Method'],
    scopeEffect:    ['Kapsam etkisi', 'Scope impact'],
    scopeNoActivity:['{label} faaliyeti yok', 'No {label} activity'],
    rationale:      ['Gerekçe', 'Rationale'],
    factor:         ['faktör', 'factors'],
    question:       ['soru', 'questions'],
    records:        ['kayıt', 'records'],
    items:          ['adet', 'items'],

    /* --- Pano / dashboard --- */
    kpiEffectiveness: ['Genel kontrol etkinliği', 'Overall control effectiveness'],
    kpiInherent:      ['Genel doğuştan risk', 'Overall inherent risk'],
    kpiResidual:      ['Genel artık risk', 'Overall residual risk'],
    kpiProgress:      ['Anket ilerlemesi', 'Questionnaire progress'],
    kpiOpenCritical:  ['Açık kritik soru', 'Open critical questions'],
    kpiBreaches:      ['İştahı aşan domain', 'Domains over appetite'],
    kpiOpenActions:   ['Açık aksiyon', 'Open actions'],
    kpiClosureRate:   ['Aksiyon kapanış oranı', 'Action closure rate'],
    maturityLabel:    ['Olgunluk', 'Maturity'],
    noAnswersYet:     ['Henüz yanıt yok', 'No answers yet'],
    effNotComputable: ['Kontrol etkinliği hesaplanamadı', 'Control effectiveness cannot be computed'],
    pctComplete:      ['tamamlandı', 'complete'],
    critRule:         ['Kritiklik = Kritik ve yanıt ≠ Evet', 'Criticality = Critical and answer ≠ Yes'],
    overAppetite:     ['Artık risk > iştah limiti', 'Residual risk above the appetite limit'],
    overdueCritical:  ['gecikmiş · {n} kritik', 'overdue · {n} critical'],
    closedOfTotal:    ['kapalı', 'closed'],
    heatmapTitle:     ['Domain ısı haritası', 'Domain heat map'],
    heatmapFormula:   ['Artık Risk = Doğuştan Risk × (1 − Kontrol Etkinliği)', 'Residual Risk = Inherent Risk × (1 − Control Effectiveness)'],
    colEffectiveness: ['Etkinlik', 'Effectiveness'],
    colResidual:      ['Artık risk', 'Residual risk'],
    colAppetite:      ['İştah', 'Appetite'],
    awaitingAnswers:  ['yanıt bekliyor', 'awaiting answers'],
    breach:           ['AŞIM', 'OVER'],
    withinAppetite:   ['İçinde', 'Within'],
    inherentDims:     ['Doğuştan risk boyutları', 'Inherent risk dimensions'],
    inherentDimsSub:  ['Her boyut, beslediği domainlerin artık riskini belirler', 'Each dimension drives the residual risk of the domains it feeds'],
    kpiSectionTitle:  ['Operasyonel KPI\'lar', 'Operational KPIs'],
    kpiSectionSub:    ['Hedefi kurumun risk iştahına göre siz belirlersiniz; üç KPI otomatik hesaplanır', 'You set the target based on the institution\'s risk appetite; three KPIs are calculated automatically'],
    kpiCol:           ['KPI', 'KPI'],
    kpiTarget:        ['Hedef', 'Target'],
    kpiValue:         ['Dönem değeri', 'Period value'],
    kpiOnTarget:      ['Hedefte', 'On target'],
    kpiOffTarget:     ['Hedef dışı', 'Off target'],
    kpiNeedsJudgment: ['Yorum gerektirir', 'Requires judgement'],
    kpiNoTarget:      ['hedef belirlenmedi', 'no target set'],
    kpiNoValue:       ['değer bekleniyor', 'awaiting value'],
    kpiAuto:          ['otomatik', 'automatic'],
    kpiAutoTitle:     ['Uygulamadan otomatik hesaplandı', 'Calculated automatically by the application'],
    kpiAutoSource:    ['uygulama içi hesaplama', 'in-app calculation'],
    kpiLowerBetter:   ['küçük olan iyi', 'lower is better'],
    kpiHigherBetter:  ['büyük olan iyi', 'higher is better'],
    kpiNeutral:       ['yön yorum gerektirir', 'direction requires judgement'],
    kpiMeasurement:   ['ölçüm', 'measurement'],
    kpiExampleTarget: ['Örnek hedef', 'Example target'],

    bnStartTitle:  ['Değerlendirmeye künye ile başlayın', 'Start with the institution profile'],
    bnStartBody:   ['Künye, hangi soruların kapsam dışı sayılacağını belirler. Ardından doğuştan riski skorlayın ve soru bankasını yanıtlayın.',
                    'The profile determines which questions fall out of scope. Then score inherent risk and answer the question bank.'],
    bnInhPendTtl:  ['Doğuştan risk skorlaması eksik — {n} faktör', 'Inherent risk scoring incomplete — {n} factors'],
    bnInhPendBody: ['Boyut skorları yalnızca skorlanan faktörleri yansıtır; tamamlanana kadar artık risk sonucu geçicidir.',
                    'Dimension scores reflect only the factors scored; the residual risk result is provisional until scoring is complete.'],
    bnNotesTtl:    ['{n} yüksek doğuştan risk skorunda gerekçe eksik', 'Rationale missing for {n} high inherent risk scores'],
    bnNotesBody:   ['4 ve 5 skorları denetimde kanıtla desteklenmelidir.', 'Scores of 4 and 5 must be supported by evidence in an audit.'],
    bnCritTtl:     ['{n} kritik kontrolde açık bulgu var', 'Open findings on {n} critical controls'],
    bnCritBody:    ['Kritik sorulara "Evet" dışında verilen her yanıt, tek başına yaptırım riski taşıyan bir kontrol boşluğuna işaret eder.',
                    'Any answer other than "Yes" on a critical question points to a control gap that on its own carries enforcement risk.'],

    /* --- Künye / profile --- */
    profileCompleteness: ['Künye tamlığı', 'Profile completeness'],
    fieldsFilled:        ['alan dolu', 'fields filled'],
    bnReqTitle:          ['{n} zorunlu alan boş', '{n} required fields are empty'],
    bnScopeTitle:        ['Künye kapsamı ve öneriyi belirler', 'The profile sets scope and suggestions'],
    bnScopeBody:         ['Faaliyet sorularına "Hayır" yanıtı ilgili soruları ve risk faktörlerini kapsam dışına alır. Müşteri ve işlem sayıları doğuştan risk sayfasında skor önerisi üretir.',
                          'A "No" answer to the business scope questions takes the related questions and risk factors out of scope. Customer and transaction counts produce score suggestions on the inherent risk page.'],
    bnInconsistent:      ['Tutarsız giriş', 'Inconsistent input'],
    scopedOutNote:       ['{q} soru ve {f} risk faktörü otomatik "Uygulanamaz" sayılıyor.', '{q} questions and {f} risk factors are automatically treated as "Not applicable".'],
    noScopeNarrowing:    ['Kapsam daraltan bir yanıt yok. Tüm {n} soru skorlamaya dahil.', 'No answer narrows the scope. All {n} questions are included in scoring.'],
    manualOverridesRule: ['Bir soruya veya faktöre elle değer girilirse otomatik kural o kayıt için geçersiz olur.',
                          'If a value is entered manually for a question or factor, the automatic rule no longer applies to that record.'],
    dateAgeing:          ['Tarih yaşlandırma', 'Date ageing'],
    colItem:             ['Kalem', 'Item'],
    colElapsed:          ['Geçen süre', 'Elapsed'],
    colExpected:         ['Beklenen', 'Expected'],
    monthsShort:         ['ay', 'months'],
    exceededMonths:      ['{n} ayı aştı', 'over {n} months'],
    withinMonths:        ['{n} ay içinde', 'within {n} months'],
    ratioHighRisk:       ['Yüksek riskli müşteri payı', 'High-risk customer share'],
    ratioPep:            ['PEP müşteri payı', 'PEP customer share'],
    ratioCrossBorder:    ['Sınır ötesi işlem payı', 'Cross-border transaction share'],
    ratioLoad:           ['Uyum personeli başına müşteri', 'Customers per compliance FTE'],
    ratioNoteHighRisk:   ['Doğuştan risk — Müşteri boyutu', 'Inherent risk — Customer dimension'],
    ratioNotePep:        ['Doğuştan risk — PEP maruziyeti', 'Inherent risk — PEP exposure'],
    ratioNoteCross:      ['Doğuştan risk — Coğrafya ve İşlem', 'Inherent risk — Geography and Transaction'],
    ratioNoteLoad:       ['Kaynak yeterliliği göstergesi', 'Resourcing adequacy indicator'],
    ratioMissing:        ['İlgili sayılar girilmedi', 'Related figures not entered'],
    errPeriod:           ['Bitiş tarihi başlangıçtan önce olamaz.', 'The end date cannot precede the start date.'],
    errExceedsTotal:     ['{label} toplam müşteri sayısını aşıyor.', '{label} exceeds the total number of customers.'],
    errCrossBorder:      ['Sınır ötesi işlem adedi toplam işlem adedini aşıyor.', 'Cross-border transaction count exceeds the total transaction count.'],
    lblHighRiskCount:    ['Yüksek riskli müşteri sayısı', 'High-risk customer count'],
    lblPepCount:         ['PEP müşteri sayısı', 'PEP customer count'],

    /* --- Doğuştan risk / inherent risk --- */
    bnInhIntroTtl:  ['Doğuştan risk kontrollerden bağımsızdır', 'Inherent risk is independent of controls'],
    bnInhIntroBody: ['Burada kurumun yapısal maruziyeti skorlanır. Kontrollerin ne kadar iyi çalıştığı bu sayfada değil, soru bankasında ölçülür. Her faktörü 1–5 arasında skorlayın veya faaliyet yoksa "Uygulanamaz" işaretleyin.',
                     'This page scores the institution\'s structural exposure. How well controls work is measured in the question bank, not here. Score each factor from 1 to 5, or mark it "Not applicable" if the activity does not exist.'],
    bnInhPendTtl2:  ['{n} faktör henüz skorlanmadı', '{n} factors not yet scored'],
    bnInhPendBody2: ['Skorlanmayan faktör paydaya girmez; boyut skoru yalnızca skorlanan faktörleri yansıtır. Tamamlanmadan artık risk sonucu geçici sayılmalıdır.',
                     'An unscored factor does not enter the denominator; the dimension score reflects only the factors scored. Until complete, treat the residual risk result as provisional.'],
    bnInhNotesTtl:  ['{n} yüksek skorda gerekçe eksik', 'Rationale missing on {n} high scores'],
    bnInhNotesBody: ['4 ve 5 skorları denetimde ilk sorgulanan kalemlerdir; her biri için kanıta dayalı gerekçe girin.',
                     'Scores of 4 and 5 are the first items challenged in an audit; enter an evidence-based rationale for each.'],
    dimension:      ['Boyut', 'Dimension'],
    anchorsOn:      ['Skor rehberlerini aç', 'Show scoring guides'],
    anchorsOff:     ['Skor rehberlerini kapat', 'Hide scoring guides'],
    editWeights:    ['Ağırlıkları düzenle', 'Edit weights'],
    lockWeights:    ['Ağırlıkları kilitle', 'Lock weights'],
    defaultWeights: ['Varsayılan ağırlıklar', 'Default weights'],
    driversTitle:   ['Baskın risk sürücüleri', 'Dominant risk drivers'],
    driversSub:     ['Ağırlıklı katkısı en yüksek faktörler · skor × ağırlık', 'Factors with the highest weighted contribution · score × weight'],
    feedsDomains:   ['Beslediği domainler', 'Feeds domains'],
    scoreGuide:     ['Skor rehberi (1–5)', 'Scoring guide (1–5)'],
    weighted:       ['Ağırlıklı', 'Weighted'],
    excludedFromScoring: ['Skorlamadan çıkarıldı', 'Excluded from scoring'],
    notApplicable:  ['Uygulanamaz', 'Not applicable'],
    naShort:        ['N/A', 'N/A'],
    naTitle:        ['Faktör bu kurum için geçerli değil', 'This factor does not apply to the institution'],
    weightChanged:  ['ağırlık değiştirildi', 'weight changed'],
    rationaleNeeded:['Gerekçe gerekli', 'Rationale required'],
    rationaleLabel: ['Gerekçe / kanıt', 'Rationale / evidence'],
    rationaleReq:   ['Gerekçe / kanıt (zorunlu)', 'Rationale / evidence (required)'],
    rationalePh:    ['Ölçüm, rapor adı, dönem — skorun dayanağı', 'Measurement, report name, period — the basis for the score'],
    factorsScored:  ['faktör skorlandı', 'factors scored'],
    naCount:        ['uygulanamaz', 'not applicable'],
    profileHint:    ['Künye', 'Profile'],
    suggestedScore: ['önerilen skor', 'suggested score'],
    applied:        ['uygulandı', 'applied'],
    apply:          ['Uygula', 'Apply'],
    appliedToast:   ['Künye oranından skor uygulandı. Gerekçeyi doğrulayın.', 'Score applied from the profile ratio. Verify the rationale.'],
    resetWeightsTtl:['Ağırlıklar sıfırlansın mı?', 'Reset weights?'],
    resetWeightsMsg:['Tüm ağırlıklar kaynak çalışma kitabındaki varsayılan değerlere döner. Skorlar ve gerekçeler korunur.',
                     'All weights return to the defaults from the source workbook. Scores and rationales are preserved.'],
    resetWeightsOk: ['Varsayılana dön', 'Restore defaults'],
    inhMethod1:     ['<b>Boyut skoru</b> = Σ(skor × ağırlık) / Σ(skorlanan faktörlerin ağırlığı). Uygulanamaz ve henüz skorlanmamış faktörler paydaya girmez; tüm faktörler skorlandığında sonuç kaynak çalışma kitabıyla birebir aynıdır.',
                     '<b>Dimension score</b> = Σ(score × weight) / Σ(weights of scored factors). Not-applicable and not-yet-scored factors are excluded from the denominator; once every factor is scored the result matches the source workbook exactly.'],
    inhMethod2:     ['<b>GENEL</b> = beş boyut skorunun aritmetik ortalaması (ölçülmüş boyutlar üzerinden).',
                     '<b>OVERALL</b> = arithmetic mean of the five dimension scores (across measured dimensions only).'],
    inhMethod3:     ['<b>Artık risk</b> hesabı bu sayfadan beslenir: her domain, kendisine atanmış boyutların ortalamasını doğuştan risk olarak alır. İlgili boyut ölçülmemişse o domainin artık riski hesaplanmaz.',
                     '<b>Residual risk</b> is fed from this page: each domain takes the average of its assigned dimensions as its inherent risk. If a dimension is unmeasured, that domain\'s residual risk is not calculated.'],
    inhMethod4:     ['Varsayım: ağırlıklar sektör uygulamasına dayalı başlangıç değerleridir ve kurumun onaylı risk metodolojisine göre kalibre edilmelidir. Değiştirilen ağırlıklar "ağırlık değiştirildi" etiketiyle işaretlenir ve CSV çıktısına yansır.',
                     'Assumption: the weights are starting values based on industry practice and should be calibrated to the institution\'s approved risk methodology. Changed weights are flagged as "weight changed" and carried into the CSV export.'],
    scoreVeryLow:   ['Çok düşük', 'Very low'],
    scoreLow:       ['Düşük', 'Low'],
    scoreMedium:    ['Orta', 'Medium'],
    scoreHigh:      ['Yüksek', 'High'],
    scoreVeryHigh:  ['Çok yüksek', 'Very high'],

    /* --- Anket / questionnaire --- */
    searchQuestions: ['Soruda ara', 'Search questions'],
    searchPh:        ['Soru metni, ID, kanıt veya kaynak', 'Question text, ID, evidence or source'],
    filterStatus:    ['Durum', 'Status'],
    fltUnanswered:   ['Yanıtlanmamış', 'Unanswered'],
    fltAnswered:     ['Yanıtlanmış', 'Answered'],
    fltGap:          ['Aksiyon gerektiren', 'Action required'],
    fltOpenCrit:     ['Açık kritik', 'Open critical'],
    fltNoEvidence:   ['Kanıt referansı boş', 'Evidence reference empty'],
    qaTest:          ['QA testi', 'QA test'],
    qaRequired:      ['Gerekli', 'Required'],
    qaNotRequired:   ['Gerekli değil', 'Not required'],
    clearFilters:    ['Filtreleri sıfırla', 'Clear filters'],
    selectedQs:      ['Seçili soru', 'Selected questions'],
    ofNQuestions:    ['{n} sorudan', 'of {n} questions'],
    answered:        ['Yanıtlanan', 'Answered'],
    selectionEff:    ['Seçim kontrol etkinliği', 'Effectiveness of selection'],
    actionRequired:  ['Aksiyon gerektiren', 'Action required'],
    openCriticalN:   ['{n} açık kritik', '{n} open critical'],
    noMatch:         ['Eşleşen soru yok', 'No matching questions'],
    noMatchBody:     ['Filtreleri gevşetin veya arama terimini değiştirin.', 'Relax the filters or change the search term.'],
    priorityAction:  ['Öncelikli aksiyon', 'Priority action'],
    actionNeeded:    ['Aksiyon gerekli', 'Action needed'],
    noEvidenceRef:   ['Kanıt referansı yok', 'No evidence reference'],
    expectedEvidence:['Beklenen kanıt', 'Expected evidence'],
    samplePopulation:['Örneklem popülasyonu', 'Sample population'],
    evidenceRef:     ['Kanıt referansı', 'Evidence reference'],
    evidencePhSuffix:['dosya adı ve tarihi', 'file name and date'],
    evidenceHelp:    ['Kanıtın nerede olduğunu yazın; denetimde bu satır üzerinden aranır.', 'State where the evidence sits; an audit will look for it from this line.'],
    findingNote:     ['Bulgu / not', 'Finding / note'],
    findingPhYes:    ['İsteğe bağlı açıklama', 'Optional comment'],
    findingPhNo:     ['Eksik ne, hangi kısmı çalışmıyor', 'What is missing, which part does not work'],
    findingHelp:     ['"Evet" dışındaki yanıtlarda buraya yazdığınız metin aksiyon kaydına taşınır.', 'For answers other than "Yes", the text you enter here is carried into the action record.'],
    createAction:    ['Bu sorudan aksiyon oluştur', 'Create an action from this question'],
    answerFor:       ['{id} yanıtı', 'Answer for {id}'],

    /* --- Kontrol skorları / control scores --- */
    bnNoInputTtl:  ['Bu sayfada girdi yoktur', 'No input on this page'],
    bnNoInputBody: ['Tüm değerler soru bankasından türetilir. Kontrol etkinliği = kazanılan puan / uygulanabilir toplam ağırlık.',
                    'All values are derived from the question bank. Control effectiveness = points earned / total applicable weight.'],
    scoreLegend:   ['Evet = 1,00 · Kısmen = 0,50 · Hayır = 0,00 · Uygulanamaz = skorlama dışı',
                    'Yes = 1.00 · Partial = 0.50 · No = 0.00 · Not applicable = excluded from scoring'],
    colCode:       ['Kod', 'Code'],
    colQuestions:  ['Soru', 'Questions'],
    colAnswers:    ['Yanıt', 'Answers'],
    colApplicableW:['Uyg. ağırlık', 'Applicable wt.'],
    colEarned:     ['Kazanılan', 'Earned'],
    colOpenCrit:   ['Açık kritik', 'Open critical'],
    colActions:    ['Aksiyon', 'Actions'],
    totalRow:      ['TOPLAM / AĞIRLIKLI ORTALAMA', 'TOTAL / WEIGHTED AVERAGE'],
    maturityBands: ['Olgunluk eşikleri', 'Maturity thresholds'],

    /* --- Artık risk / residual --- */
    bnBreachTtl:  ['{n} domain risk iştahını aşıyor', '{n} domains exceed the risk appetite'],
    bnBreachBody: ['Aşan her domain için aksiyon planında en az bir kayıt bulunmalıdır.', 'Each breaching domain must have at least one record in the action plan.'],
    bnResidBody:  ['Varsayılan iştah limiti 1,50 (Orta–Yüksek sınırı). Kurumun onaylı risk iştahına göre güncellenmelidir.',
                   'The default appetite limit is 1.50 (the Medium–High boundary). It should be updated to the institution\'s approved risk appetite.'],
    colInherent:  ['Doğuştan (1-5)', 'Inherent (1-5)'],
    colAppetiteLimit: ['İştah limiti', 'Appetite limit'],
    inherentSource: ['Doğuştan risk kaynağı', 'Inherent risk source'],
    breachAction: ['AŞIM — AKSİYON', 'OVER — ACTION'],
    withinAppetiteFull: ['İştah içinde', 'Within appetite'],
    residualBands: ['Artık risk seviyesi eşikleri', 'Residual risk level thresholds'],

    /* --- QA --- */
    bnQaTtl:  ['Ne gireceksiniz: her popülasyonun dönem içi toplam adedi', 'What to enter: the total count of each population in the period'],
    bnQaBody: ['Örneğin "EDD dosyaları" satırına, değerlendirme döneminde açılan toplam EDD dosyası sayısını yazın. Örneklem büyüklüğü otomatik hesaplanır: tam kapsam "Evet" ise tüm popülasyon test edilir, diğerlerinde MAK(hacim × oran, asgari sayı) — hacmi aşamaz. Test başına örneklem = yıllık örneklem / frekans, yukarı yuvarlanır. Hacmini bilmediğiniz satırı boş bırakabilirsiniz.',
               'For example, on the "EDD files" row enter the total number of EDD files opened during the assessment period. The sample size is calculated automatically: where full coverage is "Yes" the whole population is tested; otherwise MAX(volume × rate, minimum) — capped at the volume. Sample per test = annual sample / frequency, rounded up. Leave a row blank if you do not know its volume.'],
    qaPopulations: ['Popülasyon', 'Populations'],
    qaVolumeEntered: ['tanesinin hacmi girildi', 'have a volume entered'],
    qaTotalVolume: ['Toplam yıllık hacim', 'Total annual volume'],
    qaAnnualSample:['Yıllık örneklem', 'Annual sample'],
    qaFilesToTest: ['Test edilecek toplam dosya', 'Total files to be tested'],
    qaPerTest:     ['Test başına örneklem', 'Sample per test'],
    qaAllPops:     ['Tüm popülasyonlar toplamı', 'Sum across all populations'],
    qaTableTitle:  ['Yıllık QA planı ve risk bazlı örnekleme', 'Annual QA plan and risk-based sampling'],
    colPopFocus:   ['Popülasyon / test odağı', 'Population / test focus'],
    colRisk:       ['Risk', 'Risk'],
    colPeriodVol:  ['Dönem içi hacim', 'Volume in period'],
    colSampleRule: ['Örneklem kuralı', 'Sampling rule'],
    colAnnualSample:['Yıllık örneklem', 'Annual sample'],
    colFrequency:  ['Frekans', 'Frequency'],
    colPerTest:    ['Test başına', 'Per test'],
    fullCoverage:  ['Tam kapsam', 'Full coverage'],
    allTested:     ['tamamı test edilir', 'entire population tested'],
    atLeast:       ['en az', 'at least'],
    whicheverLarger:['hangisi büyükse', 'whichever is larger'],
    perYear:       ['yılda {n}×', '{n}× per year'],
    total:         ['TOPLAM', 'TOTAL'],
    errorClasses:  ['Hata sınıflandırması ve kapanış süresi', 'Error classification and closure time'],
    colClass:      ['Sınıf', 'Class'],
    colDefinition: ['Tanım', 'Definition'],
    colClosureTime:['Kapanış süresi', 'Closure time'],
    errCritical:   ['Bildirim yapılmamış / yaptırım ihlali', 'Report not filed / sanctions breach'],
    errHigh:       ['Gerekçe yetersiz, EDD eksik', 'Insufficient rationale, incomplete EDD'],
    errMedium:     ['Dokümantasyon eksikliği', 'Documentation gap'],
    errLow:        ['Gözlem', 'Observation'],
    slaCritical:   ['5 iş günü', '5 business days'],
    slaHigh:       ['30 gün', '30 days'],
    slaMedium:     ['90 gün', '90 days'],
    slaLow:        ['Sonraki QA döngüsü', 'Next QA cycle'],
    stratNote:     ['Katmanlama: her örneklem risk seviyesi, ürün, senaryo ve analist bazında tabakalandırılmalıdır.',
                    'Stratification: each sample should be stratified by risk level, product, scenario and analyst.'],

    /* --- Aksiyon planı / action plan --- */
    totalFindings: ['Toplam bulgu', 'Total findings'],
    open:          ['Açık', 'Open'],
    overdue:       ['Gecikmiş', 'Overdue'],
    overdueDesc:   ['Termin geçmiş ve kapanmamış', 'Past due and not closed'],
    closureRate:   ['Kapanış oranı', 'Closure rate'],
    incompleteFindings: ['Eksik alanlı bulgu', 'Findings with missing fields'],
    incompleteDesc:['Kök neden, sahip, termin veya doğrulama boş', 'Root cause, owner, due date or verification is empty'],
    allComplete:   ['Tüm kayıtlar eksiksiz', 'All records complete'],
    bnFiveFields:  ['Bir bulgunun denetimde savunulabilmesi için beş alan şart', 'Five fields are essential for a finding to stand up in an audit'],
    bnFiveFieldsBody: ['Kök neden, aksiyon, sahip, termin ve doğrulama yöntemi. "Eksik kontrollerden üret" düğmesi taslak açar; bu alanları sizin doldurmanız gerekir.',
                       'Root cause, action, owner, due date and verification method. The "Generate from control gaps" button creates drafts; you must complete these fields.'],
    viewLabel:     ['Görünüm', 'View'],
    onlyOpen:      ['Sadece açıklar', 'Open only'],
    onlyOverdue:   ['Sadece gecikmişler', 'Overdue only'],
    generateFromGaps: ['Eksik kontrollerden üret', 'Generate from control gaps'],
    newFinding:    ['Yeni bulgu', 'New finding'],
    findingsShown: ['{n} kayıt gösteriliyor', '{n} records shown'],
    noRecords:     ['Kayıt yok', 'No records'],
    noRecordsBody: ['Anket ve QA testlerinden çıkan her kontrol eksikliği için bir bulgu satırı açın.',
                    'Open a finding row for every control gap arising from the questionnaire and QA tests.'],
    colFindingId:  ['Bulgu ID', 'Finding ID'],
    colFindingRoot:['Bulgu / kök neden', 'Finding / root cause'],
    colActionVerif:['Aksiyon / doğrulama', 'Action / verification'],
    colOwner:      ['Sahip', 'Owner'],
    colDue:        ['Termin', 'Due'],
    colOps:        ['İşlem', 'Actions'],
    rootCauseLbl:  ['Kök neden', 'Root cause'],
    verificationLbl:['Doğrulama', 'Verification'],
    missingPrefix: ['Eksik', 'Missing'],
    missingTitle:  ['Bu alanlar doldurulmadan bulgu denetimde savunulamaz', 'Without these fields the finding cannot be defended in an audit'],
    mRootCause:    ['kök neden', 'root cause'],
    mAction:       ['aksiyon', 'action'],
    mOwner:        ['sahip', 'owner'],
    mDue:          ['termin', 'due date'],
    mVerification: ['doğrulama', 'verification'],
    closed:        ['Kapalı', 'Closed'],
    editFinding:   ['Bulgu düzenle', 'Edit finding'],
    formIntro:     ['Her bulgu tek satırda kapanış disiplinini taşır: ne eksik → neden eksik → ne yapılacak → kim → ne zaman → nasıl doğrulanacak.',
                    'Each finding carries the closure discipline in one row: what is missing → why → what will be done → by whom → by when → how it will be verified.'],
    fId:           ['Bulgu ID', 'Finding ID'],
    fIdHelpNew:    ['Sıradaki numara önerildi; değiştirebilirsiniz.', 'The next number is suggested; you can change it.'],
    fIdHelpEdit:   ['Kayıt oluşturulduktan sonra değişmez.', 'Cannot be changed once the record is created.'],
    fDomainHelp:   ['Bulgunun ait olduğu kontrol alanı.', 'The control area the finding belongs to.'],
    fQuestionId:   ['İlgili soru ID', 'Related question ID'],
    fQuestionHelp: ['Anketteki soruyla bağlantı. Yazmaya başlayın, liste açılır.', 'Link to the question in the bank. Start typing and the list opens.'],
    fQNotFound:    ['Bu ID ile soru bulunamadı.', 'No question found with this ID.'],
    fFinding:      ['Bulgu / kontrol eksikliği', 'Finding / control gap'],
    fFindingPh:    ['Ne eksik veya ne çalışmıyor — ölçülebilir biçimde yazın', 'What is missing or not working — state it measurably'],
    fFindingHelp:  ['Örnek: "Liste güncellemeleri kaynaktan üretime ortalama 26 saatte yansıyor."',
                    'Example: "List updates take an average of 26 hours to reach production from the source."'],
    fSourcePh:     ['Anket — D6-02 / QA testi / Örneklem testi (25 dosya)', 'Questionnaire — D6-02 / QA test / Sample test (25 files)'],
    fSourceHelp:   ['Bulgunun nereden çıktığı. Denetimde ilk sorulan budur.', 'Where the finding came from. This is the first thing an audit asks.'],
    fRootHelp:     ['Sınıflandırma olmadan aksiyon planı "eğitim verilecek" listesine döner.',
                    'Without classification the action plan degenerates into a list of "we will provide training".'],
    fCritHelp:     ['Termini otomatik belirler: Kritik 5 iş günü · Yüksek 30 gün · Orta 90 gün · Düşük sonraki QA döngüsü.',
                    'Sets the due date automatically: Critical 5 business days · High 30 days · Medium 90 days · Low next QA cycle.'],
    fAction:       ['Aksiyon', 'Action'],
    fActionPh:     ['Yapılacak somut iş — sistem, süreç veya doküman düzeyinde', 'The concrete work to be done — at system, process or document level'],
    fActionHelp:   ['Örnek: "Otomatik liste besleme kurulacak, 4 saatlik SLA tanımlanacak."',
                    'Example: "An automated list feed will be built and a 4-hour SLA defined."'],
    fOwnerPh:      ['Uyum — CDD Birimi / BT Entegrasyon', 'Compliance — CDD team / IT Integration'],
    fOwnerHelp:    ['Aksiyonu kapatmakla yükümlü birim veya kişi.', 'The unit or person accountable for closing the action.'],
    fDueHelp:      ['Kritikliğe göre önerildi; kurumun taahhüdüne göre değiştirin.', 'Suggested from criticality; change it to the institution\'s commitment.'],
    fStatusHelp:   ['"Kabul Edilen Risk" seçimi yönetim onayı gerektirir.', 'Selecting "Risk accepted" requires management approval.'],
    fVerification: ['Doğrulama yöntemi (re-test)', 'Verification method (re-test)'],
    fVerifPh:      ['Kapanışın nasıl kanıtlanacağı — örneklem, hedef hata oranı, dönem', 'How closure will be evidenced — sample, target error rate, period'],
    fVerifHelp:    ['Re-test tanımı olmadan kapanış denetimde geçerli sayılmaz. Örnek: "Yeni 25 dosyalık re-test, hedef hata oranı <%5."',
                    'Without a re-test definition, closure will not be accepted in an audit. Example: "A fresh 25-file re-test, target error rate below 5%."'],
    fClosedAt:     ['Kapanış tarihi', 'Closure date'],
    fClosedHelp:   ['Yalnızca doğrulama tamamlandığında doldurun.', 'Complete only once verification is done.'],
    fResidualAfter:['Kapanış sonrası artık risk', 'Residual risk after closure'],
    fResidualHelp: ['Aksiyon kapandığında bu kontrolde beklenen kalıntı risk seviyesi.', 'The residual risk level expected on this control once the action is closed.'],
    vFinding:      ['Bulgu alanı zorunlu.', 'The finding field is required.'],
    vRootCause:    ['Kök neden seçilmeli.', 'A root cause must be selected.'],
    vOwner:        ['Sahip alanı zorunlu.', 'The owner field is required.'],
    vDue:          ['Termin girilmeli.', 'A due date must be entered.'],
    vQuestionId:   ['Girilen soru ID bulunamadı.', 'The question ID entered was not found.'],
    vMissingCount: ['({n} eksik alan)', '({n} fields missing)'],
    savedUpdated:  ['Bulgu güncellendi.', 'Finding updated.'],
    savedAdded:    ['{id} eklendi.', '{id} added.'],
    delTitle:      ['Bulgu silinsin mi?', 'Delete this finding?'],
    delMsg:        ['{id} kaydı kalıcı olarak silinecek. Bu işlem geri alınamaz.', 'Record {id} will be permanently deleted. This cannot be undone.'],
    delDone:       ['{id} silindi.', '{id} deleted.'],
    genNoneToast:  ['Kayıt açılmamış eksik kontrol yok.', 'No control gaps without a record.'],
    genTitle:      ['Eksik kontrollerden bulgu üret', 'Generate findings from control gaps'],
    genMsg:        ['{n} soru için taslak bulgu satırı açılacak. Kök neden, sahip ve termin alanlarını sonra doldurmanız gerekir.',
                    'Draft finding rows will be created for {n} questions. You will need to complete the root cause, owner and due date fields afterwards.'],
    genOk:         ['{n} kayıt oluştur', 'Create {n} records'],
    genDone:       ['{n} taslak bulgu oluşturuldu.', '{n} draft findings created.'],
    genVerifQa:    ['{pop} üzerinde yeniden örneklem testi', 'Re-sample test on {pop}'],
    genVerifDoc:   ['Kanıt yeniden incelemesi', 'Re-review of evidence'],
    genPopFallback:['İlgili popülasyon', 'the relevant population'],
    genSourceAnswer:['Anket — {id} (yanıt: {a})', 'Questionnaire — {id} (answer: {a})'],
    genSource:     ['Anket — {id}', 'Questionnaire — {id}'],

    /* --- Dışa aktarım / export --- */
    exportTitle:   ['Veri ve yedekleme', 'Data and backup'],
    exportIntro:   ['Veriler yalnızca bu tarayıcıda saklanır ve hiçbir sunucuya gönderilmez.', 'Data is stored in this browser only and is never sent to a server.'],
    exportLastSave:['Son kayıt: {t}.', 'Last saved: {t}.'],
    exportNoSave:  ['Henüz kayıt yok.', 'Nothing saved yet.'],
    exportBackupTip:['Yedek almak veya başka bir cihaza taşımak için çalışma dosyasını indirin.', 'Download the working file to back up or move to another device.'],
    workingFile:   ['Çalışma dosyası', 'Working file'],
    workingFileDesc:['Tüm yanıtları, skorları ve aksiyon kayıtlarını içerir; geri yüklenebilir.', 'Contains all answers, scores and action records; can be restored.'],
    downloadJson:  ['JSON indir', 'Download JSON'],
    loadFromFile:  ['Dosyadan yükle', 'Load from file'],
    tableExports:  ['Tablo çıktıları (CSV)', 'Table exports (CSV)'],
    csvNote:       ['Excel\'de noktalı virgül ayracıyla açılır.', 'Opens in Excel with the semicolon separator.'],
    csvQuestions:  ['Soru bankası', 'Question bank'],
    csvDomains:    ['Domain skorları', 'Domain scores'],
    csvInherent:   ['Doğuştan risk', 'Inherent risk'],
    csvQa:         ['QA örneklem planı', 'QA sampling plan'],
    csvActions:    ['Aksiyon planı', 'Action plan'],
    workspace:     ['Çalışma alanı', 'Workspace'],
    resetWarn:     ['Sıfırlama tüm girdileri kalıcı olarak siler; önce yedek alın.', 'Reset permanently deletes all input; back up first.'],
    resetAll:      ['Her şeyi sıfırla', 'Reset everything'],
    resetTitle:    ['Tüm veriler silinsin mi?', 'Delete all data?'],
    resetMsg:      ['Künye, doğuştan risk skorları, 218 sorunun yanıtları, QA hacimleri ve aksiyon kayıtları kalıcı olarak silinir. Bu işlem geri alınamaz — önce çalışma dosyasını indirmeniz önerilir.',
                    'The profile, inherent risk scores, answers to all 218 questions, QA volumes and action records will be permanently deleted. This cannot be undone — downloading the working file first is recommended.'],
    resetDone:     ['Çalışma alanı sıfırlandı.', 'Workspace reset.'],
    savedJson:     ['Çalışma dosyası indirildi.', 'Working file downloaded.'],
    loadedJson:    ['Çalışma dosyası yüklendi.', 'Working file loaded.'],
    csvDone:       ['CSV indirildi. Excel\'de "noktalı virgül" ayracıyla açılır.', 'CSV downloaded. Open it in Excel using the semicolon separator.'],
    errNotJson:    ['Dosya okunamadı: geçerli JSON değil.', 'Could not read the file: not valid JSON.'],
    errNotOurs:    ['Bu dosya bir AML Check-up çalışma dosyası değil.', 'This is not an AML Check-up working file.'],
    replaceTitle:  ['Mevcut çalışma değiştirilecek', 'Current work will be replaced'],
    replaceMsg:    ['Yüklenen dosya ekrandaki tüm yanıtların, skorların ve aksiyon kayıtlarının yerine geçer. Devam edilsin mi?',
                    'The loaded file replaces all answers, scores and action records on screen. Continue?'],
    replaceOk:     ['Yükle ve değiştir', 'Load and replace'],

    /* --- Rapor / report --- */
    reportPrintNote:['Bu sayfa yazdırma ve PDF çıktısı için biçimlendirilmiştir.', 'This page is formatted for printing and PDF export.'],
    printPdf:      ['Yazdır / PDF', 'Print / PDF'],
    reportTitle:   ['AML/CFT Uyum Check-up — Yönetici Özeti', 'AML/CFT Compliance Check-up — Executive Summary'],
    noInstitution: ['Kurum adı girilmedi', 'Institution name not entered'],
    assessPeriod:  ['Değerlendirme dönemi', 'Assessment period'],
    reportDate:    ['Rapor tarihi', 'Report date'],
    coverage:      ['Kapsam', 'Coverage'],
    answeredPct:   ['{p} yanıtlandı', '{p} answered'],
    sectionProfile:['Kurum künyesi', 'Institution profile'],
    sectionInherentProfile: ['Doğuştan risk profili', 'Inherent risk profile'],
    sectionDomainResults:   ['Domain sonuçları', 'Domain results'],
    sectionBreaches:['Risk iştahını aşan domainler', 'Domains exceeding risk appetite'],
    sectionOpenCrit:['Açık kritik kontroller', 'Open critical controls'],
    sectionActions: ['Aksiyon planı özeti', 'Action plan summary'],
    noBreaches:    ['Ölçülebilir aşım yok.', 'No measurable breach.'],
    noOpenCrit:    ['Açık kritik kontrol yok.', 'No open critical controls.'],
    colControl:    ['Kontrol', 'Control'],
    colAnswer:     ['Yanıt', 'Answer'],
    firstNShown:   ['İlk {n} kayıt gösterildi; tamamı için soru bankası CSV çıktısını kullanın.',
                    'The first {n} records are shown; use the question bank CSV export for the full list.'],
    residualOver:  ['artık risk {r} > iştah {a}', 'residual risk {r} > appetite {a}'],
    actionsSummary:['Toplam <b>{t}</b> bulgu · açık <b>{o}</b> · gecikmiş <b>{d}</b> · kapanış oranı <b>{c}</b>',
                    'Total <b>{t}</b> findings · open <b>{o}</b> · overdue <b>{d}</b> · closure rate <b>{c}</b>'],
    dominantDrivers:['Baskın risk sürücüleri', 'Dominant risk drivers'],
    reportMethod:  ['Yöntem: Kontrol etkinliği = kazanılan puan / uygulanabilir ağırlık (Evet 1,00 · Kısmen 0,50 · Hayır 0,00 · Uygulanamaz skorlama dışı). Artık Risk = Doğuştan Risk × (1 − Kontrol Etkinliği). Anket beyanı tek başına kontrol etkinliği sayılmaz; QA dosya testi ile doğrulanmalıdır. Kaynak çerçeveler: FATF Tavsiyeleri, MASAK mevzuatı, Wolfsberg, Basel. Madde atıfları yön göstericidir; yürürlükteki metinlerle doğrulanmalıdır.',
                    'Method: control effectiveness = points earned / applicable weight (Yes 1.00 · Partial 0.50 · No 0.00 · Not applicable excluded). Residual Risk = Inherent Risk × (1 − Control Effectiveness). A questionnaire statement alone does not count as control effectiveness; it must be confirmed by QA file testing. Source frameworks: FATF Recommendations, national AML legislation, Wolfsberg, Basel. Article references are indicative and must be checked against the texts in force.'],

    /* --- CSV başlıkları / CSV headers --- */
    csvH: {
      questionId: ['Soru ID', 'Question ID'], code: ['Kod', 'Code'],
      domain: ['Domain', 'Domain'], section: ['Bölüm', 'Section'],
      questionText: ['Soru', 'Question'], answer: ['Cevap', 'Answer'],
      coefficient: ['Katsayı', 'Coefficient'], weight: ['Ağırlık', 'Weight'],
      applicableWeight: ['Uygulanabilir Ağırlık', 'Applicable Weight'],
      earned: ['Kazanılan Puan', 'Points Earned'], criticality: ['Kritiklik', 'Criticality'],
      expectedEvidence: ['Beklenen Kanıt', 'Expected Evidence'], source: ['Kaynak', 'Source'],
      qaTest: ['QA Testi', 'QA Test'], samplePop: ['Örneklem Popülasyonu', 'Sample Population'],
      evidenceRef: ['Kanıt Referansı', 'Evidence Reference'], note: ['Bulgu / Not', 'Finding / Note'],
      actionNeeded: ['Aksiyon Gerekli mi?', 'Action Needed?'], autoNaReason: ['Otomatik N/A Gerekçesi', 'Automatic N/A Reason'],
      questionCount: ['Soru Sayısı', 'Question Count'], answeredCount: ['Yanıtlanan', 'Answered'],
      notApplicable: ['Uygulanamaz', 'Not Applicable'], effectiveness: ['Kontrol Etkinliği', 'Control Effectiveness'],
      maturity: ['Olgunluk', 'Maturity'], openCritical: ['Açık Kritik Soru', 'Open Critical Questions'],
      actionRequired: ['Aksiyon Gerektiren', 'Action Required'], inherentRisk: ['Doğuştan Risk', 'Inherent Risk'],
      residualRisk: ['Artık Risk', 'Residual Risk'], residualLevel: ['Artık Risk Seviyesi', 'Residual Risk Level'],
      appetiteLimit: ['İştah Limiti', 'Appetite Limit'], appetiteBreach: ['İştah Aşımı', 'Appetite Breach'],
      population: ['Popülasyon', 'Population'], riskLevel: ['Risk Seviyesi', 'Risk Level'],
      annualVolume: ['Yıllık Hacim', 'Annual Volume'], fullCoverage: ['Tam Kapsam', 'Full Coverage'],
      sampleRate: ['Örneklem Oranı', 'Sample Rate'], minSample: ['Asgari Örneklem', 'Minimum Sample'],
      annualSample: ['Yıllık Örneklem', 'Annual Sample'], testFrequency: ['Test Frekansı', 'Test Frequency'],
      samplePerTest: ['Test Başına Örneklem', 'Sample Per Test'], testFocus: ['Test Odağı', 'Test Focus'],
      findingId: ['Bulgu ID', 'Finding ID'], relatedQuestion: ['İlgili Soru ID', 'Related Question ID'],
      findingText: ['Bulgu / Kontrol Eksikliği', 'Finding / Control Gap'], rootCause: ['Kök Neden', 'Root Cause'],
      action: ['Aksiyon', 'Action'], owner: ['Sahip', 'Owner'], due: ['Termin', 'Due Date'],
      verification: ['Doğrulama Yöntemi', 'Verification Method'], status: ['Durum', 'Status'],
      delay: ['Gecikme', 'Delay'], closedAt: ['Kapanış Tarihi', 'Closure Date'],
      residualAfter: ['Kapanış Sonrası Artık Risk', 'Residual Risk After Closure'],
      riskDimension: ['Risk Boyutu', 'Risk Dimension'], subFactor: ['Alt Faktör', 'Sub-Factor'],
      score: ['Skor (1-5)', 'Score (1-5)'], scoreDesc: ['Skor Açıklaması', 'Score Description'],
      state: ['Durum', 'State'], defaultWeight: ['Varsayılan Ağırlık', 'Default Weight'],
      weightedScore: ['Ağırlıklı Puan', 'Weighted Score'], rationale: ['Gerekçe / Kanıt', 'Rationale / Evidence'],
      feedsDomains: ['Beslediği Domainler', 'Feeds Domains'], dimension: ['Boyut', 'Dimension'],
      inherentScore: ['Doğuştan Risk (1-5)', 'Inherent Risk (1-5)'], scored: ['Skorlanan', 'Scored'],
      applicable: ['Uygulanabilir', 'Applicable'], scoredState: ['Skorlandı', 'Scored'],
      notScoredState: ['Skorlanmadı', 'Not scored']
    },

    fileQuestions: ['soru-bankasi', 'question-bank'],
    fileDomains:   ['domain-skorlari', 'domain-scores'],
    fileInherent:  ['dogustan-risk', 'inherent-risk'],
    fileQa:        ['qa-orneklem-plani', 'qa-sampling-plan'],
    fileActions:   ['aksiyon-plani', 'action-plan'],
    fileWorkbook:  ['aml-checkup', 'aml-checkup']
  };

  let lang = 'tr';
  let BASE = null;      // Türkçe temel veri anlık görüntüsü

  const idx = () => (lang === 'en' ? 1 : 0);

  /** Arayüz metni. {x} yer tutucuları params ile doldurulur. */
  function t(key, params) {
    const parts = key.split('.');
    let node = UI;
    for (const p of parts) { node = node && node[p]; }
    let s = Array.isArray(node) ? node[idx()] : (node === undefined ? key : node);
    if (params) Object.keys(params).forEach(k => { s = s.split('{' + k + '}').join(params[k]); });
    return s;
  }

  /** Referans listesi etiketi — depolanan değer Türkçe kalır. */
  function ref(kind, value) {
    if (lang === 'tr' || !value) return value;
    const m = DATA_EN.ref[kind];
    return (m && m[value]) || value;
  }

  /** Mevzuat atıflarını kural bazlı çevirir; kod ve madde numaraları korunur. */
  const SOURCE_RULES = [
    [/Uyum Programı Yön\./g, 'Compliance Programme Reg.'],
    [/Tedbirler Yön\./g, 'Measures Reg.'],
    [/MASAK tebliğleri/g, 'MASAK communiqués'],
    [/(\d+) s\.K\./g, 'Act no. $1'],
    [/\bm\.(?=\s*\d)/g, 'art. '],
    [/BM (\d+) sayılı Karar/g, 'UN Resolution $1'],
    [/AB Delege Tüzükleri/g, 'EU Delegated Regulations'],
    [/AB Konsey Kılavuzu/g, 'EU Council Guidance'],
    [/AB Best Practices/g, 'EU Best Practices'],
    [/\bAB\b/g, 'EU'],
    [/FATF tipoloji raporları/g, 'FATF typology reports'],
    [/FATF tipoloji rehberleri/g, 'FATF typology guidance'],
    [/FATF tipolojileri/g, 'FATF typologies'],
    [/FATF\/Egmont tipoloji raporları/g, 'FATF/Egmont typology reports'],
    [/FATF Plenary takvimi/g, 'FATF Plenary calendar'],
    [/\(2020 revizyonu\)/g, '(2020 revision)'],
    [/\(NRA kullanımı\)/g, '(use of the NRA)'],
    [/\(kimlik tespiti eşikleri\)/g, '(identification thresholds)'],
    [/\('gecikmeksizin'\)/g, "('without delay')"],
    [/\(SR 11-7 benzeri\)/g, '(SR 11-7 equivalent)'],
    [/FIU rehberleri/g, 'FIU guidance'],
    [/EWRA metodolojisi/g, 'EWRA methodology'],
    [/EWRA çıktıları/g, 'EWRA outputs'],
    [/Model risk yönetimi standardı/g, 'Model risk management standard'],
    [/Model risk yönetimi/g, 'Model risk management'],
    [/Model doğrulama standardı/g, 'Model validation standard'],
    [/Bilgi güvenliği standardı/g, 'Information security standard'],
    [/Denetlenebilirlik standardı/g, 'Auditability standard'],
    [/Değişiklik yönetimi standardı/g, 'Change management standard'],
    [/Veri yönetişimi standardı/g, 'Data governance standard'],
    [/BT süreklilik standardı/g, 'IT continuity standard'],
    [/İş sürekliliği standardı/g, 'Business continuity standard'],
    [/İç denetim standardı/g, 'Internal audit standard'],
    [/İç kontrol standardı/g, 'Internal control standard'],
    [/İç kontrol/g, 'Internal control'],
    [/İç raporlama/g, 'Internal reporting'],
    [/İnceleme prosedürü/g, 'Review procedure'],
    [/IIA Üç Savunma Hattı/g, 'IIA Three Lines of Defence'],
    [/IIA \/ iç kontrol standardı/g, 'IIA / internal control standard'],
    [/BCBS 239 prensipleri/g, 'BCBS 239 principles'],
    [/Görevler ayrılığı ilkesi/g, 'Segregation of duties principle'],
    [/Gizlilik yükümlülüğü/g, 'Confidentiality obligation'],
    [/Risk iştahı beyanı/g, 'Risk appetite statement'],
    [/QA programı/g, 'QA programme'],
    [/[İi]hracat kontrol rejimleri/g, 'Export control regimes'],
    [/OFAC SDN_ADVANCED yapısı/g, 'OFAC SDN_ADVANCED structure'],
    [/OFAC NS-MBS\/SSI listeleri/g, 'OFAC NS-MBS/SSI lists'],
    [/BM Güvenlik Konseyi/g, 'UN Security Council'],
    [/e-para mevzuatı/g, 'E-money regulation'],
    [/denetlenebilirlik/g, 'auditability'],
    [/\bprensip\b/g, 'principle'],
    [/ISO 20022 \/ SWIFT MT alan yapısı/g, 'ISO 20022 / SWIFT MT field structure']
  ];

  function source(s) {
    if (lang === 'tr' || !s) return s;
    let out = s;
    SOURCE_RULES.forEach(([re, to]) => { out = out.replace(re, to); });
    return out;
  }

  /** DATA nesnesini seçilen dile göre yerinde günceller. */
  function apply(next) {
    lang = (next === 'en') ? 'en' : 'tr';
    if (!BASE) BASE = JSON.parse(JSON.stringify(DATA));
    const en = lang === 'en';
    const E = DATA_EN;

    DATA.domains.forEach((d, i) => {
      d.name = en ? (E.domains[d.code] || BASE.domains[i].name) : BASE.domains[i].name;
    });

    DATA.questions.forEach((q, i) => {
      const b = BASE.questions[i];
      const e = en && QUESTIONS_EN[q.id];
      q.text = e ? e.t : b.text;
      q.evidence = e ? e.e : b.evidence;
      q.section = en ? (E.sections[b.sectionKey] || b.section) : b.section;
      q.domainName = en ? (E.domains[q.domain] || b.domainName) : b.domainName;
      q.source = en ? source(b.source) : b.source;
      q.pop = en ? (QUESTION_POPS_EN[b.pop] || b.pop) : b.pop;
      q.crit = en ? (E.ref.crit[b.critKey] || b.crit) : b.crit;
    });

    DATA.inherentFactors.forEach((f, i) => {
      const b = BASE.inherentFactors[i];
      const e = en && E.factors[b.key];
      f.factor = e ? e.factor : b.factor;
      f.why = e ? e.why : b.why;
      f.anchors = e ? e.anchors.slice() : b.anchors.slice();
      f.dim = en ? (E.dims[b.dimKey] || b.dim) : b.dim;
      if (f.scope) f.scope.reason = en ? (E.scopeReasons[BASE.inherentFactors[i].scope.reason] || f.scope.reason)
                                       : BASE.inherentFactors[i].scope.reason;
      if (f.hint) f.hint.label = en ? labelForHint(b.hint.label) : b.hint.label;
    });

    DATA.qaPopulations.forEach((p, i) => {
      const b = BASE.qaPopulations[i];
      const e = en && E.qa[b.key];
      p.pop = e ? e.pop : b.pop;
      p.focus = e ? e.focus : b.focus;
      p.risk = en ? (E.ref.riskLevel[b.riskKey] || b.risk) : b.risk;
      p.freq = en ? (E.ref.freq[b.freqKey] || b.freq) : b.freq;
    });

    DATA.kunyeFields.forEach((f, i) => {
      const b = BASE.kunyeFields[i];
      const e = en && E.kunye[f.id];
      f.label = e && e.label ? e.label : b.label;
      f.help = e && e.help ? e.help : b.help;
      f.placeholder = e && e.placeholder ? e.placeholder : b.placeholder;
      f.unit = e && e.unit ? e.unit : b.unit;
      f.scopeNote = e && e.scopeNote ? e.scopeNote : b.scopeNote;
      if (b.options) f.options = (e && e.options) ? e.options.slice() : b.options.slice();
      f.group = en ? ((E.kunyeGroups[b.groupKey] || {}).name || b.group) : b.group;
    });

    DATA.kunyeGroups.forEach((g, i) => {
      const b = BASE.kunyeGroups[i];
      const e = en && E.kunyeGroups[b.key];
      g.name = e ? e.name : b.name;
      g.help = e ? e.help : b.help;
    });

    DATA.kpis.forEach((k, i) => {
      const b = BASE.kpis[i];
      const e = en && E.kpis[b.key];
      k.name = e ? e.name : b.name;
      k.help = e ? e.help : b.help;
      k.source = e ? e.source : b.source;
      k.unit = e ? e.unit : b.unit;
    });

    Object.keys(DATA.residualSource).forEach(code => {
      const b = BASE.residualSource[code];
      DATA.residualSource[code] = en ? (E.residualSource[b] || b) : b;
    });

    DATA.scopeRules.forEach((r, i) => {
      const b = BASE.scopeRules[i];
      r.label = en ? (E.scopeLabels[b.label] || b.label) : b.label;
    });

    DATA.dimNote = en ? E.dimNote : BASE.dimNote;

    // dimDomains her zaman Türkçe boyut anahtarıyla kalır; görüntüleme dim() ile çözülür.

    document.documentElement.lang = lang;
  }

  const HINT_LABELS = {
    'Yüksek riskli müşteri payı': 'High-risk customer share',
    'PEP müşteri payı': 'PEP customer share',
    'Sınır ötesi işlem payı': 'Cross-border transaction share'
  };
  function labelForHint(l) { return HINT_LABELS[l] || l; }

  /** Ekranda gösterilecek boyut adı (Calc anahtarları Türkçe kalır). */
  function dim(dimKey) {
    return lang === 'en' ? (DATA_EN.dims[dimKey] || dimKey) : dimKey;
  }

  return {
    t, ref, dim, apply, source,
    get lang() { return lang; },
    get isEn() { return lang === 'en'; },
    get locale() { return lang === 'en' ? 'en-GB' : 'tr-TR'; }
  };
})();
