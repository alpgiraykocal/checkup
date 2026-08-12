/* English content layer. Keys are the Turkish source strings / stable ids,
   values are the English display strings. Missing entries fall back to Turkish. */

const DATA_EN = {

  domains: {
    D1: 'Governance and Compliance Programme',
    D2: 'Customer Profile and Geographic Risk',
    D3: 'Product and Channel Risk',
    D4: 'Transaction Universe and Data Integrity',
    D5: 'Customer Lifecycle (CDD/EDD)',
    D6: 'Financial Sanctions and Screening',
    D7: 'AML Transaction Monitoring',
    D8: 'STR, Freezing and Customer Exit',
    D9: 'Regulatory Events and Law Enforcement Requests',
    D10: 'Training, Awareness and Management Feedback',
    D11: 'Enterprise-Wide Risk Assessment (EWRA)'
  },

  sections: {
    'Uyum Görevlisi': 'Compliance Officer',
    'Kaynak ve Organizasyon': 'Resources and Organisation',
    'Uyum Programı': 'Compliance Programme',
    'Politika ve Prosedür': 'Policies and Procedures',
    'Bağımsız Denetim': 'Independent Testing',
    'Değişiklik Yönetimi': 'Change Management',
    'Dış Hizmet ve Acente': 'Outsourcing and Agents',
    'Kültür ve Sorumluluk': 'Culture and Accountability',
    'Müşteri Tabanı': 'Customer Base',
    'PEP': 'PEPs',
    'Coğrafi Risk': 'Geographic Risk',
    'Muhabir Bankacılık': 'Correspondent Banking',
    'Sınır Ötesi Yapı': 'Cross-Border Structure',
    'Kabul Politikası': 'Acceptance Policy',
    'Tutarlılık': 'Consistency',
    'Ürün Envanteri': 'Product Inventory',
    'Dijital Kanal': 'Digital Channel',
    'Nakit ve Ön Ödemeli': 'Cash and Prepaid',
    'Sanal Varlık': 'Virtual Assets',
    'Trade Finance': 'Trade Finance',
    'Yatırım ve Kambiyo': 'Investment and FX',
    'Aracılı Kanal': 'Intermediated Channel',
    'Risk İştahı': 'Risk Appetite',
    'İşlem Evreni': 'Transaction Universe',
    'Mutabakat': 'Reconciliation',
    'Veri Kalitesi': 'Data Quality',
    'Bağlantı ve Bütünlük': 'Linkage and Integrity',
    'Transfer Bilgisi': 'Wire Transfer Information',
    'Saklama': 'Record Retention',
    'Test Ortamı': 'Test Environment',
    'Erişim': 'Access Control',
    'Kimlik Tespiti': 'Identification',
    'Müşteri Kabul': 'Customer Onboarding',
    'Gerçek Faydalanıcı': 'Beneficial Ownership',
    'Risk Derecelendirme': 'Risk Rating',
    'EDD': 'EDD',
    'Periyodik Gözden Geçirme': 'Periodic Review',
    'Sürekli İzleme': 'Ongoing Monitoring',
    'Kalite Kontrol': 'Quality Control',
    'Liste Yönetimi': 'List Management',
    'Sahiplik ve Kontrol': 'Ownership and Control',
    'Kapsam': 'Coverage',
    'Tarama Motoru': 'Screening Engine',
    'İşlem Taraması': 'Transaction Screening',
    'Alert Yönetimi': 'Alert Management',
    'Test ve Süreklilik': 'Testing and Continuity',
    'Senaryo Yönetimi': 'Scenario Management',
    'Eşik ve Kalibrasyon': 'Thresholds and Calibration',
    'Model Validasyon': 'Model Validation',
    'Alert Operasyonu': 'Alert Operations',
    'Etkinlik Ölçümü': 'Effectiveness Measurement',
    'Süreklilik': 'Continuity',
    'ŞİB Süreci': 'STR Process',
    'ŞİB Kalitesi': 'STR Quality',
    'Gizlilik': 'Confidentiality',
    'Dondurma': 'Asset Freezing',
    'Müşteri Çıkışı': 'Customer Exit',
    'Raporlama': 'Reporting',
    'Denetim Bulguları': 'Audit Findings',
    'Düzenleyici İletişim': 'Regulatory Communication',
    'Kolluk Talepleri': 'Law Enforcement Requests',
    'Kurumlar Arası Talep': 'Inter-Institution Requests',
    'Mevzuat Takibi': 'Regulatory Change Tracking',
    'Tipoloji Takibi': 'Typology Tracking',
    'Eğitim Planı': 'Training Plan',
    'Katılım ve Takip': 'Attendance and Follow-Up',
    'Etkinlik': 'Effectiveness',
    'Yönetim Geri Bildirimi': 'Management Feedback',
    'Metodoloji': 'Methodology',
    'Skorlama': 'Scoring',
    'Girdi Kaynakları': 'Input Sources',
    'Etki': 'Impact',
    'Yönetişim': 'Governance'
  },

  /* Reference lists — stored values stay Turkish, only labels change. */
  ref: {
    answers: { 'Evet': 'Yes', 'Kısmen': 'Partial', 'Hayır': 'No', 'Uygulanamaz': 'Not applicable' },
    crit: { 'Kritik': 'Critical', 'Yüksek': 'High', 'Orta': 'Medium', 'Düşük': 'Low' },
    rootCause: {
      'Politika': 'Policy', 'Süreç': 'Process', 'Sistem': 'System', 'Veri': 'Data',
      'İnsan/Kapasite': 'People / capacity', 'Yönetişim': 'Governance', 'Üçüncü Taraf': 'Third party'
    },
    status: {
      'Açık': 'Open', 'Devam Ediyor': 'In progress', 'Doğrulama Bekliyor': 'Awaiting verification',
      'Kapalı': 'Closed', 'Kabul Edilen Risk': 'Risk accepted'
    },
    riskLevel: { 'Çok Yüksek': 'Very high', 'Yüksek': 'High', 'Orta': 'Medium', 'Düşük': 'Low' },
    freq: { 'Çeyreklik': 'Quarterly', 'Altı Aylık': 'Semi-annual', 'Yıllık': 'Annual' },
    qaResult: {
      'Doğrulandı': 'Confirmed', 'Kısmen doğrulandı': 'Partly confirmed',
      'Çelişkili': 'Contradicted', 'Test edilmedi': 'Not tested'
    },
    maturity: {
      'Gelişmiş': 'Advanced', 'Yeterli': 'Adequate', 'Gelişime Açık': 'Needs improvement',
      'Zayıf': 'Weak', 'Kritik Zayıf': 'Critically weak'
    }
  },

  /* Inherent risk dimensions */
  dims: {
    'Müşteri': 'Customer',
    'Coğrafya ve Yaptırım': 'Geography and Sanctions',
    'Ürün': 'Product',
    'Kanal': 'Channel',
    'İşlem': 'Transaction',
    'GENEL': 'OVERALL'
  },

  residualSource: {
    'Genel ortalama': 'Overall average',
    'Müşteri + Coğrafya': 'Customer + Geography',
    'Ürün + Kanal': 'Product + Channel',
    'İşlem': 'Transaction',
    'Müşteri': 'Customer',
    'Coğrafya ve Yaptırım': 'Geography and Sanctions',
    'İşlem + Ürün': 'Transaction + Product',
    'Müşteri + İşlem': 'Customer + Transaction'
  },

  scopeReasons: {
    'Trade finance faaliyeti yok': 'No trade finance activity',
    'Muhabir bankacılık yok': 'No correspondent banking',
    'Sanal varlık faaliyeti yok': 'No virtual asset activity',
    'Uzaktan müşteri kabulü yok': 'No non-face-to-face onboarding',
    'Acente / temsilci ağı yok': 'No agent or representative network',
    'Trade finance faaliyeti yok faaliyeti yok': 'No trade finance activity'
  },

  scopeLabels: {
    'Trade finance': 'Trade finance',
    'Muhabir bankacılık': 'Correspondent banking',
    'Sanal varlık': 'Virtual assets',
    'Uzaktan müşteri kabulü': 'Non-face-to-face onboarding',
    'Acente/temsilci ağı': 'Agent / representative network'
  },

  dimNote: 'Inherent risk is the structural exposure the institution carries regardless of how well its controls work. Control effectiveness is measured in the question bank, not on this page.',

  /* Küye groups */
  kunyeGroups: {
    'Kurum kimliği': { name: 'Institution profile', help: 'Identifies who the report belongs to and which regulatory regime applies.' },
    'Değerlendirme': { name: 'Assessment', help: 'The period covered and who performed the assessment. Affects how much evidential weight the scores carry.' },
    'Ölçek ve maruziyet': { name: 'Scale and exposure', help: 'These figures drive the automatic score suggestions for four factors on the inherent risk page.' },
    'Sistemler': { name: 'Systems', help: 'Clarifies which product the system-related questions in the bank refer to.' },
    'Faaliyet kapsamı': { name: 'Business scope', help: 'A "No" answer automatically takes the related questions and risk factors out of scope.' },
    'Denetim ve model geçmişi': { name: 'Audit and model history', help: 'Dates produce ageing warnings and auto-populate two KPIs.' }
  },

  /* Künye fields */
  kunye: {
    kurum_unvani: { label: 'Institution name', placeholder: 'Example Bank Inc.',
      help: 'Full legal name as registered. Appears in the report header.' },
    yukumlu_tipi: { label: 'Obliged entity type',
      help: 'Your obliged-entity class under the AML act. Determines which regulatory set applies to you.',
      options: ['Bank', 'Participation bank', 'Development and investment bank', 'Investment firm',
        'Asset management company', 'Insurance / pension company', 'Financial leasing', 'Factoring',
        'Financing company', 'Electronic money institution', 'Payment institution',
        'Crypto-asset service provider', 'Authorised FX bureau', 'Postal service',
        'Asset management (NPL) company', 'Other'] },
    lisanslar: { label: 'Licences and authorisations', placeholder: 'Banking licence; brokerage authorisation certificates',
      help: 'Regulator and document names. Separate multiple entries with semicolons.' },
    faaliyet_gosterilen_ulkeler: { label: 'Countries of operation', placeholder: 'TR, BG, DE',
      help: 'All countries including branches, subsidiaries and representative offices. Country code or name.' },
    donem_baslangic: { label: 'Assessment period — start', help: 'First day of the period the questionnaire covers.' },
    donem_bitis: { label: 'Assessment period — end',
      help: 'Usually one calendar year. Evidence and QA samples are drawn from this period.' },
    degerlendirmeyi_yapan: { label: 'Assessment performed by',
      help: 'In a self-assessment, statements do not count as evidence until confirmed by QA file testing; an independent review gives the scores far stronger evidential weight.',
      options: ['Self-assessment (compliance)',
        'Self-assessment (compliance + business)',
        'Independent internal audit',
        'Independent external review'] },
    uyum_gorevlisi: { label: 'Compliance officer', placeholder: 'Full name',
      help: 'The compliance officer notified to the regulator.' },
    toplam_musteri_sayisi: { label: 'Total number of customers', unit: 'customers',
      help: 'Active customers as at period end. All ratio calculations use this as the denominator.' },
    yuksek_riskli_musteri_sayisi: { label: 'High-risk customers', unit: 'customers',
      help: 'Customers falling into the high and very high classes of your own risk rating.' },
    pep_musteri_sayisi: { label: 'PEP customers', unit: 'customers',
      help: 'Total including PEPs, family members and close associates.' },
    yillik_islem_adedi: { label: 'Annual transaction count', unit: 'transactions',
      help: 'Total number of transactions in the period (count, not value).' },
    yillik_sinir_otesi_islem_adedi: { label: 'Annual cross-border transaction count', unit: 'transactions',
      help: 'Number of outgoing and incoming cross-border transfers.' },
    uyum_birimi_kadrosu_fte: { label: 'Compliance headcount (FTE)', unit: 'FTE', placeholder: '12.5',
      help: 'Full-time equivalent. A part-time employee counts as 0.5.' },
    i_zleme_sistemi: { label: 'Transaction monitoring system', placeholder: 'Vendor product v9.1 / in-house rule engine',
      help: 'Product name and version. State if it is developed in house.' },
    yaptirim_tarama_sistemi: { label: 'Sanctions screening system', placeholder: 'Vendor screening product v7',
      help: 'Product name and version. If customer and transaction screening use different products, list both.' },
    trade_finance_faaliyeti_var_mi: { label: 'Any trade finance activity?',
      help: 'Letters of credit, collections, guarantees and other trade finance products.',
      scopeNote: 'No: the D6 Trade Finance questions and the trade finance risk factor are taken out of scope.' },
    muhabir_bankacilik_var_mi: { label: 'Any correspondent banking?',
      help: 'Providing correspondent services to, or receiving them from, another bank.',
      scopeNote: 'No: the D2 Correspondent Banking questions and the correspondent geographic risk factor are taken out of scope.' },
    sanal_varlik_faaliyeti_var_mi: { label: 'Any virtual asset activity?',
      help: 'Direct crypto-asset services or VASP customer relationships.',
      scopeNote: 'No: the D3 Virtual Assets questions and the virtual asset risk factor are taken out of scope.' },
    uzaktan_musteri_kabulu_var_mi: { label: 'Non-face-to-face onboarding?',
      help: 'Account opening by remote means (mobile, video, e-signature).',
      scopeNote: 'No: the D3 Digital Channel questions and the remote onboarding risk factor are taken out of scope.' },
    acente_temsilci_agi_var_mi: { label: 'Agent or representative network?',
      help: 'Customer acceptance or transactions through agents, representatives or outsourced providers.',
      scopeNote: 'No: the D3 Intermediated Channel and D1 Outsourcing questions and the agent risk factor are taken out of scope.' },
    yurt_disi_sube_istirak_var_mi: { label: 'Foreign branches or subsidiaries?',
      help: 'Branches, subsidiaries or affiliates abroad.',
      scopeNote: 'No: note this for the group-level policy and information sharing questions.' },
    son_bagimsiz_aml_denetimi_tarihi: { label: 'Date of last independent AML audit',
      help: 'Date of the internal audit or external review report. Older than 24 months is a risk signal for the D1 independent testing questions.' },
    son_ewra_tarihi: { label: 'Date of last EWRA',
      help: 'Date the enterprise-wide risk assessment was approved by the board. Annual refresh is expected.' },
    son_senaryo_tuning_tarihi: { label: 'Date of last scenario tuning',
      help: 'Date monitoring scenario thresholds were last calibrated. Feeds the D7 KPI automatically.' },
    son_tarama_esigi_kalibrasyon_tarihi: { label: 'Date of last screening threshold calibration',
      help: 'Date the sanctions screening fuzzy threshold was last calibrated. Feeds the D6 KPI automatically.' }
  },

  /* Operational KPIs */
  kpis: {
    'Alert - vaka dönüşüm oranı': { name: 'Alert-to-case conversion rate', unit: '%',
      help: 'What percentage of generated alerts became cases. A very low value points to excessive noise, a very high one to narrow scenario coverage.',
      source: 'Monitoring system report' },
    'Vaka - ŞİB dönüşüm oranı': { name: 'Case-to-STR conversion rate', unit: '%',
      help: 'What percentage of opened cases resulted in an STR.', source: 'Case management system' },
    'Ortalama ŞİB bildirim süresi (gün)': { name: 'Average STR filing time', unit: 'days',
      help: 'Average time from the moment suspicion arises to filing with the FIU.', source: 'STR records' },
    'Yaptırım alerti ortalama kapanış süresi (saat)': { name: 'Average sanctions alert closure time', unit: 'hours',
      help: 'Average time from alert generation to decision.', source: 'Screening system' },
    'Liste güncelleme yansıma süresi (saat)': { name: 'List update propagation time', unit: 'hours',
      help: 'Time from publication of a sanctions list to it taking effect in production.', source: 'Screening system logs' },
    'Bekleyen alert sayısı (backlog)': { name: 'Open alert backlog', unit: 'items',
      help: 'Alerts still awaiting a decision at period end.', source: 'Monitoring system report' },
    'Gecikmiş periyodik KYC dosya sayısı': { name: 'Overdue periodic KYC files', unit: 'items',
      help: 'Customer files whose periodic review date has passed.', source: 'KYC ageing report' },
    'QA kritik hata oranı': { name: 'QA critical error rate', unit: '%',
      help: 'Files with a critical error as a share of files tested.', source: 'QA test results' },
    'QA majör hata oranı': { name: 'QA major error rate', unit: '%',
      help: 'Files with a major error as a share of files tested.', source: 'QA test results' },
    'Eğitim tamamlanma oranı': { name: 'Training completion rate', unit: '%',
      help: 'Share of staff who completed mandatory AML training.', source: 'Learning management system' },
    'Dahili şüphe bildirimi sayısı': { name: 'Internal suspicion reports', unit: 'items',
      help: 'Internal reports raised to compliance by branches and business units. A near-zero figure points to an awareness problem.',
      source: 'Compliance function records' },
    'Kolluk talebi ortalama yanıt süresi (gün)': { name: 'Average law enforcement response time', unit: 'days',
      help: 'Average response time to law enforcement and judicial information requests.', source: 'Request log system' },
    'Aksiyon kapanış oranı': { name: 'Action closure rate', unit: '%',
      help: 'Closed findings as a share of all findings in the action plan. Calculated automatically from the action plan page.',
      source: 'Action plan' },
    'Son senaryo tuning üzerinden geçen süre (ay)': { name: 'Time since last scenario tuning', unit: 'months',
      help: 'Months elapsed since the scenario tuning date in the institution profile. Calculated automatically.',
      source: 'Model management record' },
    'Son tarama kalibrasyonu üzerinden geçen süre (ay)': { name: 'Time since last screening calibration', unit: 'months',
      help: 'Months elapsed since the screening calibration date in the institution profile. Calculated automatically.',
      source: 'Model management record' }
  },

  /* QA sampling populations */
  qa: {
    'Verilen ŞİB dosyaları': { pop: 'Filed STR files', focus: 'Timeliness, narrative quality, enhanced monitoring' },
    'ŞİB verilmeyen ancak eşiği geçen kapatılmış vakalar': { pop: 'Closed cases above threshold with no STR filed', focus: 'Is the rationale sufficient, were any STRs missed' },
    'Dondurma ve varlık kısıtlama kararları': { pop: 'Freezing and asset restriction decisions', focus: 'Implementation time, notification, inventory reconciliation' },
    'Yaptırım gerçek eşleşme (true match) vakaları': { pop: 'Sanctions true match cases', focus: 'Block/reject decision, notification, audit trail' },
    'Kapatılan yaptırım alertleri': { pop: 'Closed sanctions alerts', focus: 'Four-eyes review, rationale quality, false negatives' },
    'PEP müşteri dosyaları': { pop: 'PEP customer files', focus: 'Approval, SoF/SoW, periodic review' },
    'Müşteri çıkış (exit) kararları': { pop: 'Customer exit decisions', focus: 'STR assessment, approval, return of balances' },
    'Kolluk ve yargı bilgi talepleri': { pop: 'Law enforcement and judicial requests', focus: 'Response time, completeness, risk review' },
    'EDD dosyaları': { pop: 'EDD files', focus: 'SoF/SoW evidence, approval, adverse media' },
    'Kapatılan izleme (monitoring) alertleri': { pop: 'Closed monitoring alerts', focus: 'Decision quality, missed typologies, bulk closure' },
    'Yüksek riskli yeni müşteri hesap açılışları': { pop: 'High-risk new account openings', focus: 'CDD completeness, UBO identification, senior management approval' },
    'Muhabir banka ilişkileri': { pop: 'Correspondent banking relationships', focus: 'CBDDQ, senior management approval, nesting detection' },
    'Trade finance dosyaları': { pop: 'Trade finance files', focus: 'Goods/vessel/port screening, dual-use, price reasonableness' },
    'Risk skoru override edilen müşteriler': { pop: 'Customers with overridden risk score', focus: 'Rationale, approval level, pattern analysis' },
    'Gecikmiş periyodik KYC dosyaları': { pop: 'Overdue periodic KYC files', focus: 'Reason for delay, whether restrictions were applied' },
    'Uzaktan açılan hesaplar': { pop: 'Remotely opened accounts', focus: 'Liveness, document verification, fraud detection' },
    'Eksik bilgili elektronik transferler': { pop: 'Wire transfers with missing information', focus: 'R.16 compliance, suspension/return decision' },
    'Sanal varlık transferleri': { pop: 'Virtual asset transfers', focus: 'Travel Rule, unhosted wallet controls' },
    'Standart yeni müşteri hesap açılışları': { pop: 'Standard new account openings', focus: 'Identity verification, data quality' },
    'Eşik üstü nakit işlemler': { pop: 'Cash transactions above threshold', focus: 'Identification, source of funds enquiry' },
    'Reddedilen müşteri başvuruları': { pop: 'Declined customer applications', focus: 'Rejection rationale, STR assessment, reapplication' },
    'Eğitim tamamlama kayıtları': { pop: 'Training completion records', focus: 'Attendance, test results, archiving' },
    'Kapatılan denetim ve validasyon bulguları': { pop: 'Closed audit and validation findings', focus: 'Closure evidence, independent re-test' },
    'Veri mutabakatı ve besleme hatası kayıtları': { pop: 'Data reconciliation and feed failure records', focus: 'Variance explanation, reprocessing, remediation' }
  },

  /* Inherent risk factors — keyed by "dimension|factor" */
  factors: {
    'Müşteri|Yüksek riskli müşteri segmentlerinin payı': {
      factor: 'Share of high-risk customer segments',
      why: 'Customers rated high risk as a share of the total customer base.',
      anchors: ['High-risk customers below 1%',
        '1–3%; segments defined and narrow',
        '3–7%; several high-risk segments',
        '7–15%; high-risk segments are part of the business model',
        'Above 15%, or the segment classification is not reliable']
    },
    'Müşteri|PEP ve ilişkili kişi maruziyeti': {
      factor: 'PEP and associate exposure',
      why: 'Weight and type of PEPs, family members and close associates in the customer base.',
      anchors: ['No PEPs, or below 0.1%',
        'Below 0.5%, predominantly domestic PEPs',
        '0.5–1%, or foreign PEP relationships present',
        '1–3%, or PEPs from high-risk jurisdictions',
        'Above 3%, or systematic PEP / close associate business']
    },
    'Müşteri|Nakit yoğun sektör müşterilerinin payı': {
      factor: 'Share of cash-intensive sector customers',
      why: 'Share of customers in cash-intensive sectors such as fuel, FX, precious metals, restaurants and gaming.',
      anchors: ['Below 2%', '2–5%', '5–12%', '12–25%', 'Above 25%']
    },
    'Müşteri|Karmaşık sahiplik yapılı tüzel kişi oranı': {
      factor: 'Share of legal entities with complex ownership',
      why: 'Multi-layered, cross-border or bearer-like structures that obscure the beneficial owner.',
      anchors: ['Almost no legal entity customers, or all single-layer',
        'Multi-layered structures below 5%',
        '5–15%; some structures two to three layers deep',
        '15–30%, or structures containing offshore layers',
        'Above 30%, or the beneficial owner is routinely three or more layers away']
    },
    'Müşteri|Yerleşik olmayan (non-resident) müşteri oranı': {
      factor: 'Share of non-resident customers',
      why: 'Share of non-resident individual and legal entity customers.',
      anchors: ['Below 1%', '1–5%', '5–15%', '15–30%', 'Above 30%']
    },

    'Coğrafya ve Yaptırım|FATF gri/kara liste ülkeleriyle iş hacmi': {
      factor: 'Business volume with FATF grey/black list jurisdictions',
      why: 'Business volume with jurisdictions under FATF increased monitoring (grey) and call for action (black).',
      anchors: ['No relationship',
        'Below 1% and grey list only',
        '1–5% regular business with grey list jurisdictions',
        '5–10%, or flows touching a black list jurisdiction',
        'Above 10%, or regular business with black list jurisdictions']
    },
    'Coğrafya ve Yaptırım|Yaptırım rejimi altındaki ülkelere komşuluk/ticaret': {
      factor: 'Proximity to or trade with sanctioned jurisdictions',
      why: 'Geographic proximity, transit and trade links to jurisdictions under sanctions.',
      anchors: ['No geographic or commercial link',
        'Indirect and infrequent contact',
        'Proximity exists, trade limited',
        'Regular trade or material transit risk',
        'Heavy trade and operation in a known sanctions-evasion corridor']
    },
    'Coğrafya ve Yaptırım|Offshore ve vergi cenneti bağlantılı müşteri hacmi': {
      factor: 'Offshore and tax haven linked customer volume',
      why: 'Customer and flow volume linked to offshore financial centres and low-tax or low-transparency regimes.',
      anchors: ['No link', 'Below 1%', '1–5%', '5–10%', 'Above 10%']
    },
    'Coğrafya ve Yaptırım|Muhabir bankacılık ağının coğrafi riski': {
      factor: 'Geographic risk of the correspondent banking network',
      why: 'Risk profile of the jurisdictions where correspondent relationships sit, and the possibility of nested access.',
      anchors: ['No correspondent banking activity',
        'Low-risk jurisdictions only, limited number of relationships',
        'Mixed geography; low weighting of high-risk jurisdictions',
        'Correspondent relationships in high-risk jurisdictions',
        'Nested / payable-through relationships, or weakly supervised jurisdictions dominate']
    },
    'Coğrafya ve Yaptırım|Sınır ötesi transfer hacminin toplam içindeki payı': {
      factor: 'Cross-border transfers as a share of total volume',
      why: 'Share of cross-border transfers in total transaction volume.',
      anchors: ['Below 5%', '5–15%', '15–30%', '30–50%', 'Above 50%']
    },

    'Ürün|Nakit yoğun ürünlerin payı': {
      factor: 'Share of cash-intensive products',
      why: 'Weight of cash deposit, withdrawal and cash-equivalent transactions in the product portfolio.',
      anchors: ['Below 2%', '2–10%', '10–25%', '25–40%', 'Above 40%']
    },
    'Ürün|Ön ödemeli / anonimlik derecesi yüksek ürünler': {
      factor: 'Prepaid or high-anonymity products',
      why: 'Presence and limits of prepaid cards, e-money and products with a high degree of anonymity.',
      anchors: ['No such products',
        'Registered, low-limit products only',
        'Registered products with mid-range limits',
        'Anonymous loading possible, or limits are high',
        'Anonymous use, high limits and cross-border acceptance combined']
    },
    'Ürün|Trade finance ürün hacmi': {
      factor: 'Trade finance product volume',
      why: 'Volume of letters of credit, collections, guarantees and other trade finance products, and the goods/corridor risk they carry.',
      anchors: ['No trade finance activity', 'Below 2%', '2–10%', '10–20%',
        'Above 20%, or heavy in dual-use goods / high-risk corridors']
    },
    'Ürün|Sanal varlık ürün ve hizmetleri': {
      factor: 'Virtual asset products and services',
      why: 'Relationships with virtual asset service providers, or direct provision of virtual asset services.',
      anchors: ['No virtual asset exposure',
        'A limited number of VASP customer relationships only',
        'VASP relationships are regular and material',
        'Virtual asset services are provided directly',
        'Interaction with unhosted wallets or anonymity-enhancing services']
    },
    'Ürün|Özel bankacılık / servet yönetimi hacmi': {
      factor: 'Private banking / wealth management volume',
      why: 'Size of the private banking and wealth management book and its cross-border component.',
      anchors: ['Service not offered', 'Below 2%', '2–10%', '10–20%',
        'Above 20%, or predominantly cross-border wealth management']
    },

    'Kanal|Uzaktan (yüz yüze olmayan) müşteri kabul oranı': {
      factor: 'Non-face-to-face onboarding rate',
      why: 'Share of accounts opened by remote means and the strength of verification.',
      anchors: ['No remote onboarding',
        'Below 10%; liveness and document verification are strong',
        '10–35%',
        '35–70%',
        'Above 70%, or verification controls are weak']
    },
    'Kanal|Acente ve temsilci kanalı payı': {
      factor: 'Agent and representative channel share',
      why: 'Customer acceptance and transaction share through agents, representatives and outsourced providers.',
      anchors: ['No agent / representative network',
        'Below 5% and under close oversight',
        '5–20%',
        '20–40%',
        'Above 40%, or channel oversight is weak']
    },
    'Kanal|Üçüncü taraf / açık bankacılık entegrasyonları': {
      factor: 'Third-party / open banking integrations',
      why: 'Number of API, open banking and third-party provider integrations and the level of control over them.',
      anchors: ['No integrations',
        'One or two integrations; contractual and technical controls are strong',
        'Several integrations; controls are defined',
        'Many integrations, or data ownership is unclear',
        'Uncontrolled API access; customer origin cannot be traced']
    },
    'Kanal|Gözetimsiz kanallar (ATM, kiosk) işlem payı': {
      factor: 'Unattended channel (ATM, kiosk) transaction share',
      why: 'Share of transactions passing through ATMs, kiosks and similar unstaffed channels.',
      anchors: ['Below 2%', '2–10%', '10–25%', '25–40%', 'Above 40%']
    },
    'Kanal|Aracı kurum / muhabir üzerinden dolaylı erişim': {
      factor: 'Indirect access via intermediaries or correspondents',
      why: 'Possibility of third-party institutions reaching your systems through their own customers.',
      anchors: ['No indirect access',
        'Limited indirect access with known counterparties',
        'Moderate indirect access',
        'Nesting is possible and detection controls are partial',
        'Nested / downstream relationships have been identified']
    },

    'İşlem|Yıllık işlem hacmi ve büyüme hızı': {
      factor: 'Annual transaction volume and growth rate',
      why: 'Size of transaction volume and whether the growth rate is matched by control capacity.',
      anchors: ['Low volume, flat',
        'Low to moderate volume, annual growth below 10%',
        'Moderate volume, growth 10–25%',
        'High volume, or growth 25–50%',
        'Very high volume, or growth above 50% outpacing control capacity']
    },
    'İşlem|Sınır ötesi elektronik transfer yoğunluğu': {
      factor: 'Cross-border wire transfer intensity',
      why: 'Share of cross-border wire transfers in total transaction count.',
      anchors: ['Below 5%', '5–15%', '15–30%', '30–50%', 'Above 50%']
    },
    'İşlem|Nakit işlem hacmi': {
      factor: 'Cash transaction volume',
      why: 'Share of cash transactions in total transaction volume.',
      anchors: ['Below 2%', '2–10%', '10–20%', '20–35%', 'Above 35%']
    },
    'İşlem|İşlem hızının kontrol süresine oranı (gerçek zamanlı ürünler)': {
      factor: 'Transaction speed versus control time (real-time products)',
      why: 'The gap left by how fast a transaction settles relative to when the control takes effect.',
      anchors: ['All transactions can be controlled pre-execution',
        'Pre-execution control is possible for most transactions',
        'Real-time products exist; control is partly pre-execution',
        'Predominantly real-time; control is post-execution',
        'Instant and 24/7 products; control is post-execution only']
    },
    'İşlem|Eşik altı işlem yoğunluğu': {
      factor: 'Just-below-threshold transaction density',
      why: 'Transaction patterns clustering just below reporting and identification thresholds.',
      anchors: ['No below-threshold clustering observed',
        'Slight clustering; explainable',
        'Observable clustering present',
        'Marked clustering; structuring signal',
        'Systematic below-threshold pattern identified']
    }
  }
};
