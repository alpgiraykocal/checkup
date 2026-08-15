/* Ek kontroller — kaynak çalışma kitabının dışındaki tamamlayıcı soru seti.
   Kapsam incelemesinde bulunan boşluklar için eklendi: terör finansmanının kontrol
   tarafı, personel ve dahili bildirim hattı, yaptırım lookback ile model yönetişimi
   ve banka dışı yükümlü tiplerine özgü kontroller.

   Skorlaması ANA SKORDAN AYRI tutulur. Nedeni: 218 soruluk bankanın paydasına
   girseydi domain etkinlikleri kayar, hem kaynak çalışma kitabıyla eşleşme hem de
   önceki dönem dosyalarıyla karşılaştırma kopardı. Bu set kendi kapsama ve
   etkinlik oranıyla raporlanır.

   scope alanları:
     activity : künyedeki faaliyet sorusu "Hayır" ise kapsam dışı
     types    : yalnızca bu yükümlü tiplerinde sorulur (boşsa tüm tipler) */

/* Soru metinlerinde açıklamasız geçen sektör terimleri. Büyük bankanın uyum
   ekibi bunları bilir; 5549 kapsamındaki küçük bir yükümlü bilmeyebilir. */
const GLOSSARY = [
  { k: 'CDD / EDD', tr: 'Müşteri tanıma (Customer Due Diligence) ve yüksek riskte uygulanan sıkılaştırılmış tanıma (Enhanced Due Diligence).', en: 'Customer Due Diligence and, for higher risk, Enhanced Due Diligence.' },
  { k: 'Gerçek faydalanıcı (UBO)', tr: 'Tüzel kişiyi nihai olarak sahiplenen veya kontrol eden gerçek kişi. Sahiplik eşiği ya da kontrol testiyle bulunur.', en: 'The natural person who ultimately owns or controls a legal entity, found via an ownership threshold or a control test.' },
  { k: 'PEP / RCA', tr: 'Siyasi nüfuz sahibi kişi ve onun aile üyeleri ile yakın iş ilişkisi içindeki kişiler (Relatives and Close Associates).', en: 'Politically exposed person, and their relatives and close associates.' },
  { k: 'SoF / SoW', tr: 'Fon kaynağı (belirli bir işlemdeki paranın nereden geldiği) ile servet kaynağı (kişinin toplam varlığını nasıl edindiği). İkisi ayrı kanıt ister.', en: 'Source of funds (where the money in a given transaction came from) and source of wealth (how the person accumulated their overall assets). Each needs separate evidence.' },
  { k: 'NPA', tr: 'Yeni ürün onay süreci (New Product Approval): ürün, hizmet veya kanal devreye alınmadan önce AML ve yaptırım etkisinin değerlendirilmesi.', en: 'New Product Approval: assessing AML and sanctions impact before a product, service or channel goes live.' },
  { k: 'BTL / ATL testi', tr: 'Eşik altı (below-the-line) testi eşiğin hemen altında kalan işlemlerde kaçırılan şüphe olup olmadığını arar; eşik üstü (above-the-line) analizi ise gereksiz alert üretimini ölçer.', en: 'Below-the-line testing looks for missed suspicion just under the threshold; above-the-line analysis measures excessive alert generation.' },
  { k: 'Tuning / kalibrasyon', tr: 'Senaryo eşik ve parametrelerinin veriye bakılarak yeniden ayarlanması.', en: 'Re-setting scenario thresholds and parameters based on data.' },
  { k: 'Drift', tr: 'Modelin zamanla gerçek davranıştan sapması; performansın sessizce bozulması.', en: 'A model drifting away from real behaviour over time; performance degrading silently.' },
  { k: 'Override', tr: 'Sistemin ürettiği risk skorunun elle değiştirilmesi. Gerekçe ve onay olmadan yapılırsa modeli anlamsız kılar.', en: 'Manually changing the risk score the system produced. Without rationale and approval it makes the model meaningless.' },
  { k: 'CBDDQ', tr: 'Wolfsberg muhabir bankacılık due diligence anketi; muhabir ilişkisinde karşı kurumun AML altyapısını sorgulayan standart form.', en: 'The Wolfsberg Correspondent Banking Due Diligence Questionnaire, the standard form for assessing a respondent\'s AML framework.' },
  { k: 'Nested ilişki', tr: 'Muhabir bankanın kendi müşterisi olan başka bir bankaya, sizin hesabınız üzerinden dolaylı erişim sağlaması. Görmediğiniz bir müşteri kitlesi yaratır.', en: 'A respondent bank giving its own bank customers indirect access through your account, creating a customer base you cannot see.' },
  { k: 'Payable-through hesap', tr: 'Muhabir bankanın müşterilerinin doğrudan işlem yapabildiği hesap; muhabirin müşterisi fiilen sizin sisteminizi kullanır.', en: 'An account through which a respondent\'s customers transact directly, effectively using your systems.' },
  { k: '%50 kuralı', tr: 'Yaptırım listesindeki kişilerin doğrudan veya dolaylı olarak %50 ve üzerinde sahip olduğu şirketlerin de listelenmiş sayılması.', en: 'Entities owned 50% or more, directly or indirectly, by listed persons are themselves treated as listed.' },
  { k: 'Transliterasyon', tr: 'Bir ismin farklı alfabe ve yazımlarla aktarılması. Tarama motorunun bunları eşleştirebilmesi gerekir.', en: 'Rendering a name across different scripts and spellings; the screening engine must match across them.' },
  { k: 'Lookback', tr: 'Bir taraf listeye girdikten sonra geçmiş işlemlerin geriye dönük taranması.', en: 'Retrospective screening of historical transactions after a party is added to a list.' },
  { k: 'Dual-use (çift kullanımlı)', tr: 'Hem sivil hem askeri amaçla kullanılabilen, ihracat kontrol rejimlerine tabi mal ve teknolojiler.', en: 'Goods and technologies usable for both civilian and military purposes, subject to export control regimes.' },
  { k: 'Travel Rule', tr: 'Transferde gönderen ve alıcı bilgisinin zincir boyunca taşınması yükümlülüğü; sanal varlıklarda da geçerlidir.', en: 'The obligation to carry originator and beneficiary information along the transfer chain, including for virtual assets.' },
  { k: 'Unhosted cüzdan', tr: 'Bir hizmet sağlayıcı tarafından barındırılmayan, anahtarları doğrudan kullanıcıda olan kripto cüzdanı.', en: 'A crypto wallet not held by a service provider, with keys directly under the user\'s control.' },
  { k: 'Tipping-off', tr: 'Bilgi verme yasağı: şüphe bildirimi yapıldığının veya inceleme yürütüldüğünün müşteriye sezdirilmemesi.', en: 'The prohibition on alerting a customer that a suspicion report was filed or an investigation is under way.' },
  { k: 'De-risking', tr: 'Riski yönetmek yerine müşteri gruplarını toplu olarak dışlamak. Finansal dışlanma yarattığı için ayrıca değerlendirilmesi beklenir.', en: 'Excluding whole customer groups instead of managing their risk. Because it drives financial exclusion it is expected to be assessed separately.' },
  { k: 'Horizon scanning', tr: 'Mevzuat ve düzenleme değişikliklerinin yürürlüğe girmeden izlenmesi.', en: 'Tracking regulatory change before it takes effect.' },
  { k: 'MCC / NACE', tr: 'İşyeri kategori kodu ve Avrupa ekonomik faaliyet sınıflaması; sektör riskini skorlamada kullanılır.', en: 'Merchant Category Code and the European classification of economic activities, used to score sector risk.' },
  { k: 'KAGK / NPO', tr: 'Kâr amacı gütmeyen kuruluş. Terör finansmanı açısından ayrı bir risk kategorisi olarak ele alınması beklenir.', en: 'Non-profit organisation, expected to be treated as a distinct risk category for terrorist financing purposes.' },
  { k: 'Ayna işlem (mirror trade)', tr: 'Aynı varlığın farklı ülkelerde eşleşen alım-satımıyla değerin sınır ötesine taşınması.', en: 'Moving value across borders through matched buy and sell trades of the same asset in different countries.' },
  { k: 'FOP transfer', tr: 'Serbest teslim: menkul kıymetin ödeme karşılığı olmadan hesaplar arasında aktarılması.', en: 'Free of payment: moving securities between accounts without a corresponding payment.' },
  { k: 'Kayıt dışı değer transferi', tr: 'Bankacılık sistemi dışında, güvene dayalı mahsuplaşmayla çalışan para aktarım ağları.', en: 'Value transfer networks operating outside the banking system through trust-based settlement.' }
];

const EXTRA = {

  sets: [

    /* ---------- 1. Terör finansmanı ve kâr amacı gütmeyen kuruluşlar ---------- */
    {
      key: 'tf',
      tr: 'Terör Finansmanı ve KAGK Kontrolleri',
      en: 'Terrorist Financing and NPO Controls',
      trWhy: 'Soru bankası TF riskini yalnızca kurumsal risk değerlendirmesi düzeyinde soruyor. TF, aklamayla aynı kontrollerle yakalanmaz: tutarlar küçüktür, fon genellikle yasal kaynaklıdır ve amaç gizlemek değil ulaştırmaktır. Bu set kontrol tarafını kapatır.',
      enWhy: 'The main bank asks about TF risk only at enterprise assessment level. TF is not caught by the same controls as laundering: amounts are small, funds are often legitimately sourced, and the aim is delivery rather than concealment. This set covers the control side.',
      questions: [
        { id: 'EK-TF-01', crit: 'Yüksek', critOriginal: 'Kritik', weight: 5, qa: true, domain: 'D11',
          tr: 'Terör finansmanı riski, aklama riskinden ayrı bir kontrol seti (senaryo, eşik, EDD tetikleyicisi) ile ele alınıyor mu?',
          en: 'Is terrorist financing risk addressed through a control set (scenarios, thresholds, EDD triggers) separate from money laundering risk?',
          trEvidence: 'TF kontrol matrisi, TF senaryo listesi', enEvidence: 'TF control matrix, TF scenario list',
          source: 'FATF R.1, R.5; 6415 s.K.' },
        { id: 'EK-TF-02', crit: 'Yüksek', critOriginal: 'Kritik', weight: 5, qa: true, domain: 'D2',
          tr: 'Kâr amacı gütmeyen kuruluş (KAGK) müşteriler ayrı bir risk kategorisinde tanımlanıp yönetiliyor mu?',
          en: 'Are non-profit organisation (NPO) customers defined and managed as a separate risk category?',
          trEvidence: 'KAGK müşteri listesi, risk kuralı', enEvidence: 'NPO customer list, risk rule',
          source: 'FATF R.8' },
        { id: 'EK-TF-03', crit: 'Yüksek', weight: 4, qa: true, domain: 'D5',
          tr: 'KAGK müşterilerde bağış kaynağı, faaliyet coğrafyası ve nihai yararlanıcı bilgisi alınıyor mu?',
          en: 'For NPO customers, is information obtained on the source of donations, area of operation and ultimate beneficiaries?',
          trEvidence: 'Örnek KAGK dosyası, bilgi formu', enEvidence: 'Sample NPO file, information form',
          source: 'FATF R.8 IN' },
        { id: 'EK-TF-04', crit: 'Yüksek', critOriginal: 'Kritik', weight: 5, qa: true, domain: 'D7',
          tr: 'Çatışma bölgelerine ve yüksek TF riskli coğrafyalara yapılan bağış ve yardım transferleri ayrıca izleniyor mu?',
          en: 'Are donation and aid transfers to conflict zones and high TF-risk geographies monitored separately?',
          trEvidence: 'İzleme senaryosu, ülke listesi', enEvidence: 'Monitoring scenario, country list',
          source: 'FATF R.8; FATF TF tipoloji raporları' },
        { id: 'EK-TF-05', crit: 'Kritik', weight: 5, qa: true, domain: 'D7',
          tr: 'Düşük tutarlı, yüksek frekanslı ve çok sayıda gönderene dayanan fon toplama örüntüleri için senaryo var mı?',
          en: 'Is there a scenario for fund-collection patterns based on low-value, high-frequency transfers from many senders?',
          trEvidence: 'Senaryo tanımı, üretilen alert örneği', enEvidence: 'Scenario definition, sample alert',
          source: 'FATF TF tipolojileri (ML eşiklerinin altında kalır)' },
        { id: 'EK-TF-06', crit: 'Yüksek', weight: 4, qa: true, domain: 'D7',
          tr: 'Kayıt dışı değer transfer sistemleriyle ilişkili örüntüler (aynı alıcıya çok sayıda küçük havale, aracı hesap kullanımı) için kontrol var mı?',
          en: 'Are there controls for patterns linked to informal value transfer systems (many small remittances to one beneficiary, use of intermediary accounts)?',
          trEvidence: 'Kontrol tanımı, tespit vakaları', enEvidence: 'Control definition, identified cases',
          source: 'FATF R.14; FATF/Egmont tipolojileri' },
        { id: 'EK-TF-07', crit: 'Kritik', weight: 5, qa: true, domain: 'D6',
          tr: '6415 sayılı Kanun kapsamındaki listelerin taranması, diğer yaptırım listelerinden ayrı olarak doğrulanıyor mu?',
          en: 'Is screening against the lists under Law No. 6415 verified separately from other sanctions lists?',
          trEvidence: 'Liste envanteri, tarama testi', enEvidence: 'List inventory, screening test',
          source: '6415 s.K.; FATF R.6' },
        { id: 'EK-TF-08', crit: 'Yüksek', weight: 4, qa: true, domain: 'D8',
          tr: 'Terör finansmanı şüphesiyle verilen bildirimler ayrı bir kategoride izleniyor ve narratif kalitesi ölçülüyor mu?',
          en: 'Are reports filed on TF suspicion tracked as a separate category, with narrative quality measured?',
          trEvidence: 'Kategori bazlı ŞİB raporu, QA bulgusu', enEvidence: 'Category-level STR report, QA finding',
          source: 'FATF R.20' },
        { id: 'EK-TF-09', crit: 'Yüksek', weight: 4, domain: 'D3',
          tr: 'Kitlesel fonlama ve dijital bağış kanalları ürün risk değerlendirmesine dahil edildi mi?',
          en: 'Are crowdfunding and digital donation channels included in the product risk assessment?',
          trEvidence: 'Ürün risk tablosu', enEvidence: 'Product risk table',
          source: 'FATF TF Risk Guidance' },
        { id: 'EK-TF-10', crit: 'Orta', weight: 3, domain: 'D10',
          tr: 'TF tipolojileri eğitim müfredatında aklama tipolojilerinden ayrı olarak yer alıyor mu?',
          en: 'Do TF typologies appear in the training curriculum separately from ML typologies?',
          trEvidence: 'Müfredat, eğitim materyali', enEvidence: 'Curriculum, training material',
          source: 'FATF R.18' }
      ]
    },

    /* ---------- 2. İç hat: personel ve dahili bildirim ---------- */
    {
      key: 'ichat',
      tr: 'Personel ve Dahili Bildirim Hattı',
      en: 'Personnel and Internal Reporting Line',
      trWhy: 'Tespit zincirinin ilk halkası şubedeki çalışandır; son halkası ise kontrolleri işleten personelin kendisidir. Ana banka bu iki ucu kapsamıyor: dahili şüphe bildirimi yalnızca sayı olarak izleniyor, personel taraması hiç sorulmuyor.',
      enWhy: 'The first link in the detection chain is the branch employee; the last is the staff operating the controls. The main bank covers neither end: internal suspicion reports are tracked only as a count, and employee screening is not asked at all.',
      questions: [
        { id: 'EK-IC-01', crit: 'Yüksek', critOriginal: 'Kritik', weight: 5, qa: true, domain: 'D1',
          tr: 'İşe alım sürecinde personel için uygunluk ve geçmiş taraması (fit and proper) uygulanıyor mu?',
          en: 'Are fit and proper / background screening procedures applied to staff during hiring?',
          trEvidence: 'İşe alım prosedürü, tarama kayıtları', enEvidence: 'Hiring procedure, screening records',
          source: 'FATF R.18 (yüksek standart taraması)' },
        { id: 'EK-IC-02', crit: 'Yüksek', weight: 4, qa: true, domain: 'D1',
          tr: 'Kritik AML/yaptırım rollerinde tarama periyodik olarak tekrarlanıyor mu?',
          en: 'Is screening repeated periodically for critical AML and sanctions roles?',
          trEvidence: 'Yeniden tarama kaydı', enEvidence: 'Rescreening record',
          source: 'FATF R.18; iç kontrol standardı' },
        { id: 'EK-IC-03', crit: 'Yüksek', weight: 4, qa: true, domain: 'D6',
          tr: 'Personel ve yöneticiler yaptırım listelerine karşı taranıyor mu?',
          en: 'Are staff and managers screened against sanctions lists?',
          trEvidence: 'Tarama kaydı', enEvidence: 'Screening record',
          source: 'FATF R.6; iç kontrol standardı' },
        { id: 'EK-IC-04', crit: 'Yüksek', weight: 4, qa: true, domain: 'D7',
          tr: 'Çalışan hesapları ve çalışan-müşteri bağlantıları için ayrı izleme kuralları var mı?',
          en: 'Are there separate monitoring rules for employee accounts and employee-customer connections?',
          trEvidence: 'Senaryo tanımı, tespit vakaları', enEvidence: 'Scenario definition, identified cases',
          source: 'İç tehdit yönetimi; Basel AML Guidelines' },
        { id: 'EK-IC-05', crit: 'Kritik', weight: 5, qa: true, domain: 'D8',
          tr: 'Çalışanların dahili şüphe bildirimi için tanımlı bir kanal ve zorunlu bir form seti var mı?',
          en: 'Is there a defined channel and mandatory form set for employees to raise internal suspicion reports?',
          trEvidence: 'Kanal tanımı, form örneği', enEvidence: 'Channel definition, sample form',
          source: '5549 s.K. m.4; FATF R.20' },
        { id: 'EK-IC-06', crit: 'Yüksek', weight: 4, qa: true, domain: 'D8',
          tr: 'Dahili bildirimin çalışandan uyum birimine ulaşma süresi ölçülüyor mu?',
          en: 'Is the time from employee to compliance unit for an internal report measured?',
          trEvidence: 'Süre ölçüm raporu', enEvidence: 'Timing report',
          source: 'İç kontrol standardı' },
        { id: 'EK-IC-07', crit: 'Kritik', weight: 5, qa: true, domain: 'D8',
          tr: 'Dahili bildirimlerin tamamının değerlendirildiği ve sonuçlandırıldığı izlenebiliyor mu (kaybolan bildirim kontrolü)?',
          en: 'Can it be demonstrated that every internal report was assessed and closed (control against reports going missing)?',
          trEvidence: 'Bildirim kayıt defteri, kapanış oranı', enEvidence: 'Report register, closure rate',
          source: 'Denetlenebilirlik standardı; FATF R.20' },
        { id: 'EK-IC-08', crit: 'Orta', weight: 3, domain: 'D10',
          tr: 'Bildirimi yapan çalışana, bilgi verme yasağı sınırları içinde sonuç geri bildirimi veriliyor mu?',
          en: 'Does the reporting employee receive outcome feedback, within tipping-off limits?',
          trEvidence: 'Geri bildirim prosedürü', enEvidence: 'Feedback procedure',
          source: '5549 s.K. m.5; Wolfsberg Culture Statement' }
      ]
    },

    /* ---------- 3. Yaptırım lookback ve model yönetişimi ---------- */
    {
      key: 'model',
      tr: 'Yaptırım Lookback ve Model Yönetişimi',
      en: 'Sanctions Lookback and Model Governance',
      trWhy: 'Ana banka liste güncellemesi sonrası müşteri tabanının yeniden taranmasını soruyor ama geçmiş işlemlerin taranmasını sormuyor; model validasyonunu klasik anlamda kapsıyor ama makine öğrenmesi tabanlı modelleri kapsamıyor.',
      enWhy: 'The main bank asks about rescreening the customer base after a list update but not about screening historical transactions; it covers model validation in the classical sense but not machine-learning based models.',
      questions: [
        { id: 'EK-MD-01', crit: 'Kritik', weight: 5, qa: true, domain: 'D6',
          tr: 'Bir taraf listeye eklendiğinde geçmiş işlemler geriye dönük olarak taranıyor mu (lookback)?',
          en: 'When a party is added to a list, are historical transactions screened retrospectively (lookback)?',
          trEvidence: 'Lookback çalışma kaydı, tespit sonuçları', enEvidence: 'Lookback run record, results',
          source: 'FATF R.6; OFAC uygulama beklentileri' },
        { id: 'EK-MD-02', crit: 'Yüksek', weight: 4, domain: 'D6',
          tr: 'Lookback penceresi (geriye kaç ay) ve kapsamı yazılı olarak tanımlı mı?',
          en: 'Are the lookback window (how many months back) and its scope defined in writing?',
          trEvidence: 'Prosedür metni', enEvidence: 'Procedure text',
          source: 'İç kontrol standardı' },
        { id: 'EK-MD-03', crit: 'Kritik', weight: 5, qa: true, domain: 'D8',
          tr: 'Lookback bulguları blokaj, bildirim ve ŞİB süreçlerine bağlanıyor mu?',
          en: 'Are lookback findings connected to blocking, notification and STR processes?',
          trEvidence: 'Vaka kayıtları', enEvidence: 'Case records',
          source: '7262 s.K.; FATF R.6' },
        { id: 'EK-MD-04', crit: 'Yüksek', weight: 4, domain: 'D7',
          tr: 'İzleme veya taramada makine öğrenmesi/yapay zeka modeli kullanılıyorsa model envanterine kaydedildi mi?',
          en: 'Where machine learning or AI models are used in monitoring or screening, are they recorded in the model inventory?',
          trEvidence: 'Model envanteri', enEvidence: 'Model inventory',
          source: 'Model risk yönetimi standardı' },
        { id: 'EK-MD-05', crit: 'Yüksek', critOriginal: 'Kritik', weight: 5, qa: true, domain: 'D7',
          tr: 'Yapay zeka destekli kararlarda gerekçe üretilebiliyor ve denetçiye açıklanabiliyor mu?',
          en: 'For AI-assisted decisions, can a rationale be produced and explained to an examiner?',
          trEvidence: 'Örnek karar gerekçesi', enEvidence: 'Sample decision rationale',
          source: 'Model risk yönetimi; denetlenebilirlik standardı' },
        { id: 'EK-MD-06', crit: 'Yüksek', weight: 4, qa: true, domain: 'D7',
          tr: 'Model performans kayması (drift) izleniyor ve müdahale eşiği tanımlı mı?',
          en: 'Is model performance drift monitored, with an intervention threshold defined?',
          trEvidence: 'Drift izleme raporu', enEvidence: 'Drift monitoring report',
          source: 'Model risk yönetimi standardı' },
        { id: 'EK-MD-07', crit: 'Orta', weight: 3, domain: 'D7',
          tr: 'Eğitim verisindeki yanlılık ve temsil sorunları değerlendirildi mi?',
          en: 'Have bias and representation issues in the training data been assessed?',
          trEvidence: 'Yanlılık değerlendirme raporu', enEvidence: 'Bias assessment report',
          source: 'Model risk yönetimi standardı' },
        { id: 'EK-MD-08', crit: 'Yüksek', critOriginal: 'Kritik', weight: 5, domain: 'D7',
          tr: 'Yapay zeka destekli kararlarda insan gözetimi ve nihai karar sorumluluğu tanımlı mı?',
          en: 'Is human oversight and final decision accountability defined for AI-assisted decisions?',
          trEvidence: 'Yetki ve sorumluluk matrisi', enEvidence: 'Authority and accountability matrix',
          source: 'Model risk yönetimi; iç kontrol standardı' }
      ]
    },

    /* ---------- 4. Sigorta ve emeklilik ---------- */
    {
      key: 'sigorta',
      tr: 'Sigorta ve Emeklilik Kontrolleri',
      en: 'Insurance and Pension Controls',
      types: ['Sigorta / emeklilik şirketi'],
      trWhy: 'Hayat sigortası ve bireysel emeklilikte risk, hesap açılışında değil lehtar ve ödeme aşamasında yoğunlaşır. Banka merkezli soru bankası bu ekseni kapsamıyor.',
      enWhy: 'In life insurance and pensions the risk concentrates at the beneficiary and payout stage rather than at onboarding. The bank-centric question set does not cover this axis.',
      questions: [
        { id: 'EK-SG-01', crit: 'Yüksek', critOriginal: 'Kritik', weight: 5, qa: true, domain: 'D5',
          tr: 'Lehtar (beneficiary) değişiklikleri bir risk faktörü olarak izleniyor ve gerekçesi sorgulanıyor mu?',
          en: 'Are beneficiary changes monitored as a risk factor, with the rationale questioned?',
          trEvidence: 'Değişiklik kayıtları, sorgu örneği', enEvidence: 'Change records, sample enquiry',
          source: 'FATF R.10 IN (hayat sigortası)' },
        { id: 'EK-SG-02', crit: 'Kritik', weight: 5, qa: true, domain: 'D5',
          tr: 'Lehtar, ödeme aşamasında kimlik tespitine ve gerektiğinde EDD\'ye tabi tutuluyor mu?',
          en: 'Is the beneficiary subject to identification and, where required, EDD at the payout stage?',
          trEvidence: 'Ödeme dosyası örneği', enEvidence: 'Sample payout file',
          source: 'FATF R.10; Tedbirler Yön.' },
        { id: 'EK-SG-03', crit: 'Yüksek', weight: 4, qa: true, domain: 'D7',
          tr: 'Tek primli/yüksek primli poliçeler ile erken iştira (surrender) işlemleri ayrıca izleniyor mu?',
          en: 'Are single-premium or high-premium policies and early surrender transactions monitored separately?',
          trEvidence: 'İzleme senaryosu', enEvidence: 'Monitoring scenario',
          source: 'FATF tipolojileri (sigorta sektörü)' },
        { id: 'EK-SG-04', crit: 'Yüksek', weight: 4, domain: 'D5',
          tr: 'Primin poliçe sahibi dışında bir üçüncü taraftan ödenmesi tespit edilip değerlendiriliyor mu?',
          en: 'Is premium payment by a third party other than the policyholder detected and assessed?',
          trEvidence: 'Kontrol kuralı, vaka örneği', enEvidence: 'Control rule, sample case',
          source: 'FATF R.10' }
      ]
    },

    /* ---------- 5. Elektronik para ve ödeme ---------- */
    {
      key: 'odeme',
      tr: 'Elektronik Para ve Ödeme Kuruluşu Kontrolleri',
      en: 'E-money and Payment Institution Controls',
      types: ['Elektronik para kuruluşu', 'Ödeme kuruluşu', 'PTT'],
      trWhy: 'Ödeme ve e-para modelinde risk dağıtıcı ağında, limit yapısında ve mesaj bütünlüğünde toplanır. Ana banka bunları şube/muhabir ekseninden soruyor.',
      enWhy: 'In payment and e-money models the risk concentrates in the distributor network, the limit structure and message integrity. The main bank asks about these from a branch and correspondent angle.',
      questions: [
        { id: 'EK-EP-01', crit: 'Yüksek', critOriginal: 'Kritik', weight: 5, qa: true, domain: 'D1',
          tr: 'Dağıtıcı, bayi ve temsilci ağı için kayıt, eğitim ve sürekli izleme yükümlülükleri uygulanıyor mu?',
          en: 'Are registration, training and ongoing monitoring obligations applied to the distributor, dealer and agent network?',
          trEvidence: 'Ağ envanteri, izleme raporu', enEvidence: 'Network inventory, monitoring report',
          source: 'FATF R.14' },
        { id: 'EK-EP-02', crit: 'Kritik', weight: 5, qa: true, domain: 'D3',
          tr: 'Anonim veya sınırlı kimlik tespitli ön ödemeli araçlarda yükleme, bakiye ve harcama limitleri mevzuata uygun şekilde sistemsel olarak uygulanıyor mu?',
          en: 'For anonymous or limited-identification prepaid instruments, are load, balance and spend limits enforced systemically in line with regulation?',
          trEvidence: 'Limit konfigürasyonu, aşım raporu', enEvidence: 'Limit configuration, breach report',
          source: 'FATF R.15; e-para mevzuatı' },
        { id: 'EK-EP-03', crit: 'Kritik', weight: 5, qa: true, domain: 'D4',
          tr: 'Hesaplar arası P2P transferlerde gönderen ve alıcı bilgisi eksiksiz taşınıyor mu?',
          en: 'In account-to-account P2P transfers, is complete originator and beneficiary information carried?',
          trEvidence: 'Mesaj örneği, eksik bilgi raporu', enEvidence: 'Sample message, missing-information report',
          source: 'FATF R.16' },
        { id: 'EK-EP-04', crit: 'Yüksek', weight: 4, qa: true, domain: 'D3',
          tr: 'Nakit yükleme ve çekme noktalarında kimlik tespiti eşikleri uygulanıyor ve bölünmüş işlemler toplanıyor mu?',
          en: 'At cash load and withdrawal points, are identification thresholds applied and split transactions aggregated?',
          trEvidence: 'Eşik kuralı, toplama kontrolü', enEvidence: 'Threshold rule, aggregation control',
          source: 'Tedbirler Yön.; FATF R.10' }
      ]
    },

    /* ---------- 6. Sanal varlık hizmet sağlayıcı ---------- */
    {
      key: 'vasp',
      tr: 'Sanal Varlık Hizmet Sağlayıcı Kontrolleri',
      en: 'Virtual Asset Service Provider Controls',
      types: ['Kripto varlık hizmet sağlayıcı'],
      activity: 'sanal_varlik_faaliyeti_var_mi',
      trWhy: 'Ana bankada sanal varlık üç soruyla ürün riski açısından ele alınıyor. Hizmeti bizzat veren kurumda karşı VASP doğrulaması, adres taraması ve zincir üstü tipolojiler asıl kontrol alanıdır.',
      enWhy: 'The main bank covers virtual assets in three questions from a product-risk angle. For a provider, counterparty VASP verification, address screening and on-chain typologies are the core control area.',
      questions: [
        { id: 'EK-KV-01', crit: 'Kritik', weight: 5, qa: true, domain: 'D3',
          tr: 'Karşı sanal varlık hizmet sağlayıcının kimliği ve yaptırım durumu transfer öncesinde doğrulanıyor mu?',
          en: 'Is the counterparty VASP\'s identity and sanctions status verified before the transfer?',
          trEvidence: 'Karşı taraf doğrulama kaydı', enEvidence: 'Counterparty verification record',
          source: 'FATF R.16 IN (Travel Rule)' },
        { id: 'EK-KV-02', crit: 'Kritik', weight: 5, qa: true, domain: 'D6',
          tr: 'Blokzincir adresleri yaptırım listeleri ve risk istihbaratına karşı taranıyor mu?',
          en: 'Are blockchain addresses screened against sanctions lists and risk intelligence?',
          trEvidence: 'Tarama kaydı, sağlayıcı kapsamı', enEvidence: 'Screening record, provider coverage',
          source: 'FATF R.6; OFAC dijital varlık rehberi' },
        { id: 'EK-KV-03', crit: 'Yüksek', weight: 4, qa: true, domain: 'D7',
          tr: 'Karıştırıcı (mixer), gizlilik odaklı varlık ve zincir atlama (chain-hopping) örüntüleri için kontrol var mı?',
          en: 'Are there controls for mixers, privacy-focused assets and chain-hopping patterns?',
          trEvidence: 'Senaryo tanımı, tespit vakaları', enEvidence: 'Scenario definition, identified cases',
          source: 'FATF VA Guidance' },
        { id: 'EK-KV-04', crit: 'Yüksek', weight: 4, qa: true, domain: 'D5',
          tr: 'Kendi kendine barındırılan (unhosted) cüzdanlarda sahiplik doğrulaması yapılıyor mu?',
          en: 'Is ownership verification performed for unhosted wallets?',
          trEvidence: 'Doğrulama yöntemi, örnek kayıt', enEvidence: 'Verification method, sample record',
          source: 'FATF VA Guidance' }
      ]
    },

    /* ---------- 7. Yetkili müessese ve kambiyo ---------- */
    {
      key: 'kambiyo',
      tr: 'Yetkili Müessese ve Kambiyo Kontrolleri',
      en: 'FX Bureau and Currency Exchange Controls',
      types: ['Yetkili müessese (döviz)'],
      trWhy: 'Döviz işlemlerinde risk, sürekli müşteri ilişkisi olmadan yapılan tek seferlik ve eşik altına bölünmüş işlemlerde toplanır.',
      enWhy: 'In currency exchange the risk concentrates in occasional transactions carried out without an ongoing relationship, and in transactions split below thresholds.',
      questions: [
        { id: 'EK-YM-01', crit: 'Kritik', weight: 5, qa: true, domain: 'D7',
          tr: 'Eşik altına bölünmüş döviz işlemleri için müşteri ve gün bazında toplama (aggregation) kontrolü var mı?',
          en: 'Is there per-customer and per-day aggregation control for currency transactions split below thresholds?',
          trEvidence: 'Toplama kuralı, tespit raporu', enEvidence: 'Aggregation rule, detection report',
          source: 'FATF R.10; Tedbirler Yön.' },
        { id: 'EK-YM-02', crit: 'Kritik', weight: 5, qa: true, domain: 'D5',
          tr: 'Sürekli iş ilişkisi olmayan (occasional) işlemlerde kimlik tespiti eşiği doğru uygulanıyor mu?',
          en: 'For occasional transactions without an ongoing business relationship, is the identification threshold applied correctly?',
          trEvidence: 'Sistem kuralı, örnek işlem', enEvidence: 'System rule, sample transaction',
          source: 'Tedbirler Yön. m.5-6' },
        { id: 'EK-YM-03', crit: 'Yüksek', weight: 4, domain: 'D7',
          tr: 'Şube ve acente bazında nakit yoğunluğu anomalileri izleniyor mu?',
          en: 'Are cash-intensity anomalies monitored at branch and agent level?',
          trEvidence: 'Şube bazlı anomali raporu', enEvidence: 'Branch-level anomaly report',
          source: 'FATF tipolojileri' }
      ]
    },

    /* ---------- 8. Aracı kurum ve portföy yönetimi ---------- */
    {
      key: 'sermaye',
      tr: 'Aracı Kurum ve Portföy Yönetimi Kontrolleri',
      en: 'Broker and Asset Management Controls',
      types: ['Aracı kurum', 'Portföy yönetim şirketi'],
      trWhy: 'Sermaye piyasasında aklama nakitle değil, varlık transferi ve fiyat manipülasyonu yoluyla yapılır; ana bankanın ödeme eksenli soruları bunu görmez.',
      enWhy: 'In capital markets laundering happens through asset transfers and price manipulation rather than cash; the main bank\'s payment-oriented questions do not see this.',
      questions: [
        { id: 'EK-AK-01', crit: 'Yüksek', critOriginal: 'Kritik', weight: 5, qa: true, domain: 'D4',
          tr: 'Menkul kıymet giriş ve çıkış transferlerinde kaynak/hedef hesap ve nihai sahiplik doğrulanıyor mu?',
          en: 'For securities transfers in and out, are the source/destination account and ultimate ownership verified?',
          trEvidence: 'Transfer dosyası örneği', enEvidence: 'Sample transfer file',
          source: 'FATF R.10; IOSCO ilkeleri' },
        { id: 'EK-AK-02', crit: 'Yüksek', weight: 4, qa: true, domain: 'D7',
          tr: 'Piyasa dışı fiyatlı, eşleşmeli (matched) veya ayna (mirror) işlemler aklama açısından izleniyor mu?',
          en: 'Are off-market priced, matched or mirror trades monitored from a laundering perspective?',
          trEvidence: 'Senaryo tanımı, tespit vakaları', enEvidence: 'Scenario definition, identified cases',
          source: 'FATF tipolojileri (ayna işlem)' },
        { id: 'EK-AK-03', crit: 'Yüksek', weight: 4, domain: 'D7',
          tr: 'Serbest teslim (free-of-payment) transferler ayrıca izleniyor ve gerekçelendiriliyor mu?',
          en: 'Are free-of-payment transfers monitored separately and justified?',
          trEvidence: 'FOP transfer raporu', enEvidence: 'FOP transfer report',
          source: 'IOSCO / piyasa gözetim standartları' }
      ]
    }
  ]
};
