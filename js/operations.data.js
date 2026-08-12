/* İşlem ve operasyon istatistikleri.
   Her ölçüt: key (kalıcı), etiket, alanlar ve isteğe bağlı bağlantılar.
   fields: adet | tutar | gun | saat | oran
   feedsKpi: pano KPI'sını otomatik doldurur
   feedsFactor: doğuştan risk faktörüne skor önerir (bands ile birlikte) */

const OPERATIONS = {

  units: {
    adet:  { tr: 'adet',  en: 'count' },
    tutar: { tr: 'tutar', en: 'amount' },
    gun:   { tr: 'gün',   en: 'days' },
    saat:  { tr: 'saat',  en: 'hours' },
    oran:  { tr: '%',     en: '%' }
  },

  groups: [
    /* ---------------- İşlem evreni ---------------- */
    { key: 'evren', icon: 'layers',
      tr: 'İşlem evreni', en: 'Transaction universe',
      trHelp: 'Dönem içindeki toplam hacim ve izleme kapsamı. Nakit ve sınır ötesi payları doğuştan riski besler.',
      enHelp: 'Total volume in the period and monitoring coverage. Cash and cross-border shares feed inherent risk.',
      metrics: [
        { key: 'islem_toplam', tr: 'Toplam işlem adedi', en: 'Total transactions', fields: ['adet'],
          trHelp: 'Tüm kanallar dahil.', enHelp: 'Across all channels.' },
        { key: 'islem_izlenen', tr: 'İzlemeye tabi işlem adedi', en: 'Transactions subject to monitoring', fields: ['adet'],
          trHelp: 'İzleme sistemine giren işlemler. Toplamla farkı kapsam boşluğudur.',
          enHelp: 'Transactions entering the monitoring system. The gap to the total is a coverage gap.' },
        { key: 'nakit', tr: 'Nakit işlem', en: 'Cash transactions', fields: ['adet', 'tutar'],
          feedsFactor: 'İşlem|Nakit işlem hacmi', bands: [2, 10, 20, 35], base: 'islem_toplam' },
        { key: 'nakit_esik_ustu', tr: 'Eşik üstü nakit işlem', en: 'Cash transactions above threshold', fields: ['adet'] },
        { key: 'nakit_esik_alti_yogun', tr: 'Eşik altı yoğunlaşan işlem', en: 'Transactions clustering below threshold', fields: ['adet'],
          trHelp: 'Structuring sinyali olarak izlenen işlemler.', enHelp: 'Transactions monitored as a structuring signal.' },
        { key: 'giden_transfer', tr: 'Giden sınır ötesi transfer', en: 'Outgoing cross-border transfers', fields: ['adet', 'tutar'] },
        { key: 'gelen_transfer', tr: 'Gelen sınır ötesi transfer', en: 'Incoming cross-border transfers', fields: ['adet', 'tutar'] },
        { key: 'eksik_bilgili', tr: 'Eksik bilgili transfer', en: 'Transfers with missing information', fields: ['adet'],
          trHelp: 'FATF R.16 alanları eksik olan transferler.', enHelp: 'Transfers missing FATF R.16 fields.' },
        { key: 'askiya_alinan', tr: 'Askıya alınan / iade edilen transfer', en: 'Suspended or returned transfers', fields: ['adet'] },
        { key: 'gozetimsiz_kanal', tr: 'Gözetimsiz kanal işlemi (ATM, kiosk)', en: 'Unattended channel transactions (ATM, kiosk)', fields: ['adet'] },
        { key: 'acente_islem', tr: 'Acente / temsilci kanalı işlemi', en: 'Agent channel transactions', fields: ['adet'] },
        { key: 'sanal_varlik_transfer', tr: 'Sanal varlık transferi', en: 'Virtual asset transfers', fields: ['adet', 'tutar'] },
        { key: 'unhosted', tr: 'Unhosted cüzdan işlemi', en: 'Unhosted wallet transactions', fields: ['adet'] }
      ] },

    /* ---------------- Yaptırım taraması ---------------- */
    { key: 'yaptirim', icon: 'target',
      tr: 'Yaptırım taraması ve blokaj', en: 'Sanctions screening and blocking',
      trHelp: 'Tarama hacmi, alert dönüşümü ve blokaj/red kararları. Liste yansıma süresi KPI olarak panoya taşınır.',
      enHelp: 'Screening volume, alert conversion and block/reject decisions. List propagation time is carried to the dashboard as a KPI.',
      metrics: [
        { key: 'taranan_musteri', tr: 'Taranan müşteri kaydı', en: 'Customer records screened', fields: ['adet'] },
        { key: 'taranan_islem', tr: 'Taranan işlem', en: 'Transactions screened', fields: ['adet'] },
        { key: 'musteri_alert', tr: 'Müşteri tarama alerti', en: 'Customer screening alerts', fields: ['adet'] },
        { key: 'islem_alert', tr: 'İşlem tarama alerti', en: 'Transaction screening alerts', fields: ['adet'] },
        { key: 'true_match', tr: 'Gerçek eşleşme (true match)', en: 'True matches', fields: ['adet'] },
        { key: 'bloke_islem', tr: 'Bloke edilen işlem', en: 'Blocked transactions', fields: ['adet', 'tutar'],
          trHelp: 'Yaptırım nedeniyle dondurulan/bloke edilen işlemler.', enHelp: 'Transactions frozen or blocked on sanctions grounds.' },
        { key: 'red_islem', tr: 'Reddedilen (rejected) işlem', en: 'Rejected transactions', fields: ['adet', 'tutar'],
          trHelp: 'İşleme alınmayıp gönderene iade edilenler.', enHelp: 'Not processed and returned to the sender.' },
        { key: 'serbest_birakilan', tr: 'Serbest bırakılan alert', en: 'Alerts released', fields: ['adet'] },
        { key: 'alert_kapanis_saat', tr: 'Ortalama alert kapanış süresi', en: 'Average alert closure time', fields: ['saat'],
          feedsKpi: 'Yaptırım alerti ortalama kapanış süresi (saat)' },
        { key: 'liste_guncelleme', tr: 'Liste güncelleme sayısı', en: 'List updates received', fields: ['adet'] },
        { key: 'liste_yansima_saat', tr: 'Liste güncelleme yansıma süresi', en: 'List update propagation time', fields: ['saat'],
          feedsKpi: 'Liste güncelleme yansıma süresi (saat)' },
        { key: 'rescreening', tr: 'Yeniden tarama (rescreening) çalışması', en: 'Rescreening runs', fields: ['adet'] },
        { key: 'dolayli_sahiplik_tespit', tr: 'Dolaylı sahiplik (%50) tespiti', en: 'Indirect ownership (50%) hits', fields: ['adet'] },
        { key: 'tarama_kesinti_saat', tr: 'Tarama sistemi kesinti süresi', en: 'Screening system downtime', fields: ['saat'] }
      ] },

    /* ---------------- Trade finance ---------------- */
    { key: 'trade', icon: 'file',
      tr: 'Trade finance işlemleri', en: 'Trade finance transactions',
      trHelp: 'Dış ticaret finansmanı dosyalarının ürün kırılımı ve kontrol örtüsü. Hacim payı ürün riskini besler.',
      enHelp: 'Product breakdown and control coverage for trade finance files. The volume share feeds product risk.',
      scope: 'trade_finance_faaliyeti_var_mi',
      metrics: [
        { key: 'akreditif_ithalat', tr: 'İthalat akreditifi', en: 'Import letters of credit', fields: ['adet', 'tutar'] },
        { key: 'akreditif_ihracat', tr: 'İhracat akreditifi', en: 'Export letters of credit', fields: ['adet', 'tutar'] },
        { key: 'vesaik', tr: 'Vesaik mukabili tahsilat', en: 'Documentary collections', fields: ['adet', 'tutar'] },
        { key: 'teminat_mektubu', tr: 'Teminat mektubu / garanti', en: 'Guarantees and standby LCs', fields: ['adet', 'tutar'] },
        { key: 'kabul_aval', tr: 'Kabul kredisi / aval', en: 'Acceptance credits and avals', fields: ['adet'] },
        { key: 'trade_toplam_dosya', tr: 'Toplam trade finance dosyası', en: 'Total trade finance files', fields: ['adet'],
          trHelp: 'Ürün riskindeki trade finance payı dosya adedinden değil hacim payından hesaplanır; o faktörü skor rehberine göre elle skorlayın.',
          enHelp: 'The trade finance share in product risk comes from volume, not file count; score that factor manually against the guide.' },
        { key: 'mal_tarama', tr: 'Mal taraması yapılan dosya', en: 'Files screened for goods', fields: ['adet'] },
        { key: 'gemi_tarama', tr: 'Gemi / taşıyıcı taraması yapılan dosya', en: 'Files screened for vessel or carrier', fields: ['adet'] },
        { key: 'liman_tarama', tr: 'Liman / rota taraması yapılan dosya', en: 'Files screened for port or route', fields: ['adet'] },
        { key: 'son_kullanici_tarama', tr: 'Son kullanıcı taraması yapılan dosya', en: 'Files screened for end user', fields: ['adet'] },
        { key: 'dual_use', tr: 'Çift kullanımlı (dual-use) mal içeren dosya', en: 'Files containing dual-use goods', fields: ['adet'] },
        { key: 'yuksek_riskli_koridor', tr: 'Yüksek riskli koridor dosyası', en: 'Files on high-risk corridors', fields: ['adet'] },
        { key: 'fiyat_makulluk', tr: 'Fiyat makullüğü sorgulanan dosya', en: 'Files with price reasonableness check', fields: ['adet'] },
        { key: 'transit_serbest_bolge', tr: 'Transit / serbest bölge dosyası', en: 'Transit or free-zone files', fields: ['adet'] },
        { key: 'trade_kirmizi_bayrak', tr: 'Kırmızı bayrak tespit edilen dosya', en: 'Files with a red flag', fields: ['adet'] },
        { key: 'trade_red', tr: 'Askıya alınan / reddedilen dosya', en: 'Suspended or rejected files', fields: ['adet'] },
        { key: 'trade_sib', tr: 'ŞİB verilen trade dosyası', en: 'Trade files subject to an STR', fields: ['adet'] }
      ] },

    /* ---------------- Muhabir bankacılık ---------------- */
    { key: 'muhabir', icon: 'link',
      tr: 'Muhabir bankacılık operasyonu', en: 'Correspondent banking operations',
      trHelp: 'İlişki envanteri, bilgi talebi (RFI) akışı ve muhabirden gelen iadeler. İade oranı karşı tarafın sizi nasıl gördüğünü gösterir.',
      enHelp: 'Relationship inventory, request-for-information flow and returns from correspondents. The return rate shows how counterparties see you.',
      scope: 'muhabir_bankacilik_var_mi',
      metrics: [
        { key: 'muhabir_aktif', tr: 'Aktif muhabir ilişkisi', en: 'Active correspondent relationships', fields: ['adet'] },
        { key: 'muhabir_yeni', tr: 'Dönem içinde kurulan ilişki', en: 'Relationships established in the period', fields: ['adet'] },
        { key: 'muhabir_kapanan', tr: 'Dönem içinde sonlandırılan ilişki', en: 'Relationships terminated in the period', fields: ['adet'] },
        { key: 'muhabir_karsi_taraf_kapatti', tr: 'Muhabirin sonlandırdığı ilişki (de-risking)', en: 'Relationships terminated by the correspondent', fields: ['adet'],
          trHelp: 'Karşı tarafın sizi riskli bulup çıkardığı ilişkiler.', enHelp: 'Relationships the counterparty exited on risk grounds.' },
        { key: 'cbddq', tr: 'CBDDQ alınan muhabir', en: 'Correspondents with a CBDDQ on file', fields: ['adet'] },
        { key: 'nested_tespit', tr: 'Nested / downstream ilişki tespiti', en: 'Nested or downstream relationships identified', fields: ['adet'] },
        { key: 'rfi_gelen', tr: 'Gelen bilgi talebi (RFI)', en: 'Incoming requests for information (RFI)', fields: ['adet'] },
        { key: 'rfi_yanitlanan', tr: 'Yanıtlanan RFI', en: 'RFIs answered', fields: ['adet'] },
        { key: 'rfi_yanit_gun', tr: 'Ortalama RFI yanıt süresi', en: 'Average RFI response time', fields: ['gun'] },
        { key: 'rfi_giden', tr: 'Giden bilgi talebi', en: 'Outgoing requests for information', fields: ['adet'] },
        { key: 'muhabirden_iade', tr: 'Muhabirden iade edilen işlem', en: 'Transactions returned by the correspondent', fields: ['adet', 'tutar'],
          trHelp: 'Karşı bankanın işleme almayıp geri gönderdiği transferler.', enHelp: 'Transfers the counterparty bank sent back unprocessed.' },
        { key: 'muhabire_iade', tr: 'Muhabire iade ettiğimiz işlem', en: 'Transactions we returned to the correspondent', fields: ['adet', 'tutar'] },
        { key: 'muhabir_islem', tr: 'Muhabir üzerinden geçen işlem', en: 'Transactions through correspondents', fields: ['adet'] },
        { key: 'payable_through', tr: 'Payable-through hesap', en: 'Payable-through accounts', fields: ['adet'] }
      ] },

    /* ---------------- İzleme ---------------- */
    { key: 'izleme', icon: 'gauge',
      tr: 'İşlem izleme operasyonu', en: 'Transaction monitoring operations',
      trHelp: 'Senaryo üretimi ve alert hunisi. Dönüşüm oranları panoya KPI olarak taşınır.',
      enHelp: 'Scenario output and the alert funnel. Conversion rates are carried to the dashboard as KPIs.',
      metrics: [
        { key: 'senaryo_aktif', tr: 'Aktif senaryo sayısı', en: 'Active scenarios', fields: ['adet'] },
        { key: 'senaryo_degisiklik', tr: 'Dönem içinde değiştirilen senaryo', en: 'Scenarios changed in the period', fields: ['adet'] },
        { key: 'izleme_alert', tr: 'Üretilen izleme alerti', en: 'Monitoring alerts generated', fields: ['adet'] },
        { key: 'izleme_alert_kapatilan', tr: 'Kapatılan alert', en: 'Alerts closed', fields: ['adet'] },
        { key: 'izleme_vaka', tr: 'Vakaya dönüşen alert', en: 'Alerts escalated to a case', fields: ['adet'] },
        { key: 'toplu_kapatma', tr: 'Toplu (bulk) kapatılan alert', en: 'Alerts closed in bulk', fields: ['adet'] },
        { key: 'backlog', tr: 'Dönem sonu bekleyen alert', en: 'Open alert backlog at period end', fields: ['adet'],
          feedsKpi: 'Bekleyen alert sayısı (backlog)' },
        { key: 'alert_kapanis_gun', tr: 'Ortalama alert kapanış süresi', en: 'Average alert closure time', fields: ['gun'] },
        { key: 'izleme_kesinti_saat', tr: 'İzleme sistemi kesinti süresi', en: 'Monitoring system downtime', fields: ['saat'] },
        { key: 'dahili_bildirim', tr: 'Dahili şüphe bildirimi', en: 'Internal suspicion reports', fields: ['adet'],
          feedsKpi: 'Dahili şüphe bildirimi sayısı',
          trHelp: 'Şube ve iş birimlerinden uyum birimine gelen bildirimler.', enHelp: 'Reports raised to compliance by branches and business units.' }
      ] },

    /* ---------------- ŞİB, dondurma, kolluk ---------------- */
    { key: 'sib', icon: 'clipboard',
      tr: 'ŞİB, dondurma ve kolluk', en: 'STR, freezing and law enforcement',
      trHelp: 'Bildirim ve varlık kısıtlama sonuçları. Bildirim süresi ve kolluk yanıt süresi panoya taşınır.',
      enHelp: 'Reporting and asset restriction outcomes. Filing time and law enforcement response time are carried to the dashboard.',
      metrics: [
        { key: 'sib_adet', tr: 'Verilen ŞİB', en: 'STRs filed', fields: ['adet'] },
        { key: 'sib_tutar', tr: 'ŞİB\'e konu tutar', en: 'Amount subject to STRs', fields: ['tutar'] },
        { key: 'sib_sure_gun', tr: 'Ortalama bildirim süresi', en: 'Average filing time', fields: ['gun'],
          feedsKpi: 'Ortalama ŞİB bildirim süresi (gün)' },
        { key: 'sib_gecikmis', tr: 'Gecikmiş bildirim', en: 'Late filings', fields: ['adet'] },
        { key: 'sib_verilmeyen', tr: 'Eşiği geçip ŞİB verilmeyen kapatılan vaka', en: 'Closed cases above threshold with no STR', fields: ['adet'] },
        { key: 'sib_tekrar', tr: 'Birden fazla ŞİB verilen müşteri', en: 'Customers with more than one STR', fields: ['adet'] },
        { key: 'dondurma_karar', tr: 'Dondurma kararı', en: 'Freezing decisions', fields: ['adet'] },
        { key: 'dondurulan_hesap', tr: 'Dondurulan hesap', en: 'Accounts frozen', fields: ['adet', 'tutar'] },
        { key: 'dondurma_kaldirma', tr: 'Kaldırılan dondurma', en: 'Freezes lifted', fields: ['adet'] },
        { key: 'istisna_talep', tr: 'Temel gider istisna talebi', en: 'Basic expense exemption requests', fields: ['adet'] },
        { key: 'kolluk_talep', tr: 'Kolluk ve yargı bilgi talebi', en: 'Law enforcement and judicial requests', fields: ['adet'] },
        { key: 'kolluk_yanit_gun', tr: 'Ortalama kolluk yanıt süresi', en: 'Average law enforcement response time', fields: ['gun'],
          feedsKpi: 'Kolluk talebi ortalama yanıt süresi (gün)' },
        { key: 'exit_karar', tr: 'Müşteri çıkış (exit) kararı', en: 'Customer exit decisions', fields: ['adet'] },
        { key: 'red_basvuru', tr: 'Reddedilen müşteri başvurusu', en: 'Declined customer applications', fields: ['adet'] },
        { key: 'tipping_off_ihlal', tr: 'Tespit edilen bilgi verme yasağı ihlali', en: 'Tipping-off breaches identified', fields: ['adet'] }
      ] },

    /* ---------------- Müşteri yaşam döngüsü operasyonu ---------------- */
    { key: 'cdd', icon: 'users',
      tr: 'Müşteri kabul ve gözden geçirme', en: 'Onboarding and periodic review',
      trHelp: 'Kabul hacmi, EDD yükü ve gecikmiş gözden geçirmeler. Gecikmiş KYC sayısı panoya taşınır.',
      enHelp: 'Onboarding volume, EDD workload and overdue reviews. The overdue KYC count is carried to the dashboard.',
      metrics: [
        { key: 'yeni_hesap', tr: 'Açılan yeni hesap', en: 'New accounts opened', fields: ['adet'] },
        { key: 'uzaktan_hesap', tr: 'Uzaktan açılan hesap', en: 'Accounts opened remotely', fields: ['adet'] },
        { key: 'canlilik_basarisiz', tr: 'Canlılık / belge doğrulaması başarısız başvuru', en: 'Applications failing liveness or document checks', fields: ['adet'] },
        { key: 'edd_dosya', tr: 'Açılan EDD dosyası', en: 'EDD files opened', fields: ['adet'] },
        { key: 'edd_onay_ust_yonetim', tr: 'Üst yönetim onayı alınan dosya', en: 'Files with senior management approval', fields: ['adet'] },
        { key: 'gf_tespit_edilemeyen', tr: 'Gerçek faydalanıcısı tespit edilemeyen dosya', en: 'Files where the beneficial owner could not be identified', fields: ['adet'] },
        { key: 'risk_override', tr: 'Risk skoru elle değiştirilen müşteri', en: 'Customers with a manual risk score override', fields: ['adet'] },
        { key: 'periyodik_tamamlanan', tr: 'Tamamlanan periyodik gözden geçirme', en: 'Periodic reviews completed', fields: ['adet'] },
        { key: 'kyc_gecikmis', tr: 'Gecikmiş periyodik KYC dosyası', en: 'Overdue periodic KYC files', fields: ['adet'],
          feedsKpi: 'Gecikmiş periyodik KYC dosya sayısı' },
        { key: 'kisitlama_uygulanan', tr: 'İşlem kısıtlaması uygulanan müşteri', en: 'Customers placed under transaction restrictions', fields: ['adet'] },
        { key: 'adverse_media_hit', tr: 'Olumsuz haber (adverse media) tespiti', en: 'Adverse media hits', fields: ['adet'] }
      ] },

    /* ---------------- Kalite güvence ---------------- */
    { key: 'qa', icon: 'flask',
      tr: 'Kalite güvence sonuçları', en: 'Quality assurance results',
      trHelp: 'QA testlerinin dönem sonuçları. Hata oranları panoya taşınır.',
      enHelp: 'Period results of QA testing. Error rates are carried to the dashboard.',
      metrics: [
        { key: 'qa_test_dosya', tr: 'Test edilen dosya', en: 'Files tested', fields: ['adet'] },
        { key: 'qa_kritik_hata', tr: 'Kritik hata', en: 'Critical errors', fields: ['adet'] },
        { key: 'qa_major_hata', tr: 'Majör hata', en: 'Major errors', fields: ['adet'] },
        { key: 'qa_minor_hata', tr: 'Minör hata', en: 'Minor errors', fields: ['adet'] },
        { key: 'qa_yeniden_test', tr: 'Yeniden test edilen (re-test) dosya', en: 'Files re-tested', fields: ['adet'] },
        { key: 'egitim_hedef', tr: 'Eğitim yükümlüsü personel', en: 'Staff required to train', fields: ['adet'] },
        { key: 'egitim_tamamlayan', tr: 'Eğitimi tamamlayan personel', en: 'Staff completing training', fields: ['adet'] }
      ] }
  ],

  /* Türetilen oranlar — girdilerden hesaplanır, elle girilmez */
  derived: [
    { key: 'monitoring_coverage', tr: 'İzleme kapsama oranı', en: 'Monitoring coverage',
      num: 'islem_izlenen.adet', den: 'islem_toplam.adet', good: 'up',
      trHelp: 'İzlemeye giren işlemin toplama oranı. %100 altındaki her nokta kapsam boşluğudur.',
      enHelp: 'Share of transactions entering monitoring. Anything below 100% is a coverage gap.' },
    { key: 'cash_share', tr: 'Nakit işlem payı', en: 'Cash transaction share',
      num: 'nakit.adet', den: 'islem_toplam.adet', good: 'down' },
    { key: 'cross_share', tr: 'Sınır ötesi işlem payı', en: 'Cross-border transaction share',
      num: ['giden_transfer.adet', 'gelen_transfer.adet'], den: 'islem_toplam.adet', good: 'down' },
    { key: 'alert_case', tr: 'Alert → vaka dönüşümü', en: 'Alert to case conversion',
      num: 'izleme_vaka.adet', den: 'izleme_alert.adet', kpi: 'Alert - vaka dönüşüm oranı' },
    { key: 'case_str', tr: 'Vaka → ŞİB dönüşümü', en: 'Case to STR conversion',
      num: 'sib_adet.adet', den: 'izleme_vaka.adet', kpi: 'Vaka - ŞİB dönüşüm oranı' },
    { key: 'bulk_close', tr: 'Toplu kapatma payı', en: 'Bulk closure share',
      num: 'toplu_kapatma.adet', den: 'izleme_alert_kapatilan.adet', good: 'down',
      trHelp: 'Yüksek oran, alertlerin tek tek incelenmediğine işaret eder.',
      enHelp: 'A high share suggests alerts are not being reviewed individually.' },
    { key: 'sanction_hit', tr: 'Tarama alerti isabet oranı', en: 'Screening alert hit rate',
      num: 'true_match.adet', den: ['musteri_alert.adet', 'islem_alert.adet'],
      trHelp: 'Çok düşük oran eşik kalibrasyonunun gevşek olduğunu gösterir.',
      enHelp: 'A very low rate indicates a loosely calibrated threshold.' },
    { key: 'rfi_answer', tr: 'RFI yanıtlama oranı', en: 'RFI response rate',
      num: 'rfi_yanitlanan.adet', den: 'rfi_gelen.adet', good: 'up' },
    { key: 'return_rate', tr: 'Muhabirden iade oranı', en: 'Correspondent return rate',
      num: 'muhabirden_iade.adet', den: 'muhabir_islem.adet', good: 'down',
      trHelp: 'Karşı bankaların işlemlerinizi geri gönderme sıklığı; itibar ve veri kalitesi göstergesi.',
      enHelp: 'How often counterparties send your transactions back; a reputation and data-quality indicator.' },
    { key: 'trade_screen_cov', tr: 'Trade finance tarama örtüsü', en: 'Trade finance screening coverage',
      num: 'gemi_tarama.adet', den: 'trade_toplam_dosya.adet', good: 'up' },
    { key: 'qa_critical_rate', tr: 'QA kritik hata oranı', en: 'QA critical error rate',
      num: 'qa_kritik_hata.adet', den: 'qa_test_dosya.adet', good: 'down', kpi: 'QA kritik hata oranı' },
    { key: 'qa_major_rate', tr: 'QA majör hata oranı', en: 'QA major error rate',
      num: 'qa_major_hata.adet', den: 'qa_test_dosya.adet', good: 'down', kpi: 'QA majör hata oranı' },
    { key: 'training_rate', tr: 'Eğitim tamamlanma oranı', en: 'Training completion rate',
      num: 'egitim_tamamlayan.adet', den: 'egitim_hedef.adet', good: 'up', kpi: 'Eğitim tamamlanma oranı' },
    { key: 'remote_share', tr: 'Uzaktan hesap açılış payı', en: 'Remote onboarding share',
      num: 'uzaktan_hesap.adet', den: 'yeni_hesap.adet',
      factor: 'Kanal|Uzaktan (yüz yüze olmayan) müşteri kabul oranı', bands: [10, 35, 70, 100] },
    { key: 'agent_share', tr: 'Acente kanalı işlem payı', en: 'Agent channel transaction share',
      num: 'acente_islem.adet', den: 'islem_toplam.adet',
      factor: 'Kanal|Acente ve temsilci kanalı payı', bands: [5, 20, 40, 100] },
    { key: 'unattended_share', tr: 'Gözetimsiz kanal işlem payı', en: 'Unattended channel share',
      num: 'gozetimsiz_kanal.adet', den: 'islem_toplam.adet',
      factor: 'Kanal|Gözetimsiz kanallar (ATM, kiosk) işlem payı', bands: [2, 10, 25, 40] }
  ]
};
