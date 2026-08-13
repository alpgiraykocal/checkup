/* Risk modeli genişletmeleri:
   1) Yayılmanın finansmanı (PF) — FATF Tavsiye 1'in 2020 revizyonu ve Tavsiye 7,
      PF riskinin aklama ve terörün finansmanı riskinden AYRI değerlendirilmesini ister.
      Bu nedenle PF, ML/TF genel ortalamasına karıştırılmaz; kendi satırında raporlanır.
   2) İş kolu bazlı değerlendirme — EBA ML/TF risk faktörleri kılavuzu, riskin iş kolu
      ve ürün düzeyinde değerlendirilip kurum geneline toplanmasını bekler. */

const RISKMODEL = {

  /* ---------- Yayılmanın finansmanı (PF) ---------- */
  pf: {
    key: 'PF',
    tr: 'Yayılmanın Finansmanı (PF)', en: 'Proliferation Financing (PF)',
    trNote: 'FATF Tavsiye 1 (2020 revizyonu) ve Tavsiye 7, yayılmanın finansmanı riskinin aklama ve terörün finansmanı riskinden ayrı değerlendirilmesini ister. Bu boyut ML/TF genel ortalamasına dahil edilmez; kendi satırında raporlanır ve kontrol tarafında yaptırım tarama etkinliğiyle eşleştirilir.',
    enNote: 'FATF Recommendation 1 (2020 revision) and Recommendation 7 require proliferation financing risk to be assessed separately from money laundering and terrorist financing risk. This dimension is not folded into the ML/TF overall average; it is reported on its own line and paired with sanctions screening effectiveness on the control side.',
    /* Kontrol tarafı: PF kontrolleri esas olarak yaptırım tarama kontrolleridir */
    controlDomain: 'D6',
    factors: [
      { key: 'PF|BM yayılma rejimi ülkeleriyle doğrudan veya dolaylı temas',
        tr: 'BM yayılma rejimi ülkeleriyle doğrudan veya dolaylı temas',
        en: 'Direct or indirect contact with UN proliferation regime jurisdictions',
        weight: 5,
        trWhy: 'BMGK 1718 (KDHC) ve 2231 (İran) rejimleri kapsamındaki ülkelerle müşteri, işlem veya ticaret bağı.',
        enWhy: 'Customer, transaction or trade links with jurisdictions under UNSCR 1718 (DPRK) and 2231 (Iran).',
        anchors: [
          'Hiçbir bağ yok; bu ülkeler yasaklı listede ve sistemsel olarak engelli',
          'Yalnızca dolaylı ve tekil temas; her vaka incelenmiş',
          'Komşu veya transit ülkeler üzerinden düzenli dolaylı temas',
          'Doğrudan işlem veya ticaret bağı mevcut',
          'Düzenli doğrudan iş ilişkisi ya da tespit edilmiş kaçınma girişimi'
        ],
        anchorsEn: [
          'No links at all; these jurisdictions are prohibited and blocked systemically',
          'Only indirect, isolated contact; every case reviewed',
          'Regular indirect contact through neighbouring or transit jurisdictions',
          'Direct transaction or trade links exist',
          'Regular direct business relationships, or an evasion attempt identified'
        ] },
      { key: 'PF|Çift kullanımlı ve kontrole tabi mal ticareti',
        tr: 'Çift kullanımlı ve kontrole tabi mal ticareti',
        en: 'Dual-use and export-controlled goods trade',
        weight: 5, scope: 'trade_finance_faaliyeti_var_mi',
        trWhy: 'İhracat kontrol rejimlerine (Wassenaar, NSG, MTCR, Avustralya Grubu) tabi mal ve teknolojilerin finansmanı.',
        enWhy: 'Financing of goods and technologies subject to export control regimes (Wassenaar, NSG, MTCR, Australia Group).',
        anchors: [
          'Trade finance yok veya kontrole tabi mal finanse edilmiyor',
          'Nadir; her dosyada mal listesi ve son kullanım beyanı kontrol ediliyor',
          'Düzenli; kontrol listesi taraması var ancak son kullanıcı doğrulaması sınırlı',
          'Yoğun; hassas mal kategorileri portföyde belirgin',
          'Yoğun ve kontrol örtüsü eksik ya da kırmızı bayrak tespit edilmiş'
        ],
        anchorsEn: [
          'No trade finance, or no controlled goods financed',
          'Rare; goods list and end-use declaration checked on every file',
          'Regular; control list screening exists but end-user verification is limited',
          'Heavy; sensitive goods categories are prominent in the portfolio',
          'Heavy with incomplete control coverage, or a red flag identified'
        ] },
      { key: 'PF|Denizcilik, lojistik ve aracı müşteri maruziyeti',
        tr: 'Denizcilik, lojistik ve aracı müşteri maruziyeti',
        en: 'Maritime, logistics and intermediary customer exposure',
        weight: 4,
        trWhy: 'Gemi işletmecileri, taşıma acenteleri, serbest bölge tüccarları ve ara aracılar yayılma tedarik ağlarında en sık kullanılan halkalardır.',
        enWhy: 'Vessel operators, freight forwarders, free-zone traders and intermediaries are the links most often used in proliferation procurement networks.',
        anchors: [
          'Bu sektörlerde müşteri yok',
          'Sınırlı sayıda, tamamı gelişmiş ülke merkezli',
          'Orta düzeyde; transit hub ülkelerinde müşteriler var',
          'Yoğun; bayrak değişimi veya AIS kesintisi gözlenen müşteriler mevcut',
          'Yoğun ve gemiden gemiye aktarma veya sahte konşimento vakası tespit edilmiş'
        ],
        anchorsEn: [
          'No customers in these sectors',
          'A limited number, all based in developed jurisdictions',
          'Moderate; customers present in transit hub jurisdictions',
          'Heavy; customers with flag changes or AIS gaps present',
          'Heavy, with a ship-to-ship transfer or false bill of lading case identified'
        ] },
      { key: 'PF|Paravan ve tedarik ağı yapıları',
        tr: 'Paravan ve tedarik ağı yapıları',
        en: 'Front company and procurement network structures',
        weight: 4,
        trWhy: 'Yayılma ağları tipik olarak yeni kurulmuş, dar faaliyetli, ortak adres ve yönetici paylaşan şirketler üzerinden çalışır.',
        enWhy: 'Proliferation networks typically operate through newly formed, narrowly active companies sharing addresses and directors.',
        anchors: [
          'Tüzel kişi müşterilerde bu profil yok',
          'Nadir; kurulum tarihi ve adres örtüşmesi kontrolleri işliyor',
          'Gözlenebilir düzeyde; ağ analizi kısmen yapılıyor',
          'Belirgin; ortak yönetici/adres kümeleri tespit ediliyor',
          'Tedarik ağı şüphesi doğrulanmış vaka mevcut'
        ],
        anchorsEn: [
          'No such profile among legal entity customers',
          'Rare; incorporation date and address overlap checks are working',
          'Observable; network analysis is partly performed',
          'Marked; clusters sharing directors or addresses are identified',
          'A confirmed procurement network suspicion case exists'
        ] },
      { key: 'PF|Yaptırım kaçınma tipolojilerine maruziyet',
        tr: 'Yaptırım kaçınma tipolojilerine maruziyet',
        en: 'Exposure to sanctions evasion typologies',
        weight: 4,
        trWhy: 'Üçüncü ülke üzerinden yeniden faturalandırma, kripto varlıkla ödeme, nakit kurye ve karmaşık ödeme zincirleri.',
        enWhy: 'Re-invoicing through third countries, payment in crypto-assets, cash couriers and complex payment chains.',
        anchors: [
          'Tipolojiye uygun işlem örüntüsü gözlenmiyor',
          'İzole vakalar; hepsi incelenip kapatılmış',
          'Bazı koridorlarda örüntü gözleniyor',
          'Birden çok tipolojide düzenli sinyal',
          'Doğrulanmış kaçınma girişimi veya bildirim yapılmış vaka'
        ],
        anchorsEn: [
          'No transaction patterns matching the typologies observed',
          'Isolated cases; all reviewed and closed',
          'Patterns observed on some corridors',
          'Regular signals across more than one typology',
          'A confirmed evasion attempt or a reported case'
        ] }
    ]
  },

  /* ---------- İş kolları ---------- */
  businessLines: {
    trNote: 'EBA ML/TF risk faktörleri kılavuzu ve Basel yaklaşımı, riskin iş kolu ve ürün düzeyinde değerlendirilip iş hacmiyle ağırlıklandırılarak kurum geneline toplanmasını bekler. Boyut bazlı ortalama, tek bir iş kolunda yoğunlaşan riski görünmez kılabilir.',
    enNote: 'The EBA ML/TF risk factors guidelines and the Basel approach expect risk to be assessed at business line and product level and aggregated to the enterprise weighted by business volume. A dimension-level average can hide risk concentrated in a single business line.',
    dims: ['Müşteri', 'Coğrafya ve Yaptırım', 'Ürün', 'Kanal', 'İşlem'],
    lines: [
      { key: 'bireysel',   tr: 'Bireysel bankacılık',            en: 'Retail banking' },
      { key: 'kurumsal',   tr: 'Kurumsal ve ticari bankacılık',  en: 'Corporate and commercial banking' },
      { key: 'kobi',       tr: 'KOBİ bankacılığı',               en: 'SME banking' },
      { key: 'ozel',       tr: 'Özel bankacılık / servet yönetimi', en: 'Private banking / wealth management' },
      { key: 'hazine',     tr: 'Hazine ve sermaye piyasaları',   en: 'Treasury and capital markets' },
      { key: 'trade',      tr: 'Dış ticaret finansmanı',         en: 'Trade finance', scope: 'trade_finance_faaliyeti_var_mi' },
      { key: 'muhabir',    tr: 'Muhabir bankacılık',             en: 'Correspondent banking', scope: 'muhabir_bankacilik_var_mi' },
      { key: 'odeme',      tr: 'Ödeme ve transfer hizmetleri',   en: 'Payments and transfers' },
      { key: 'dijital',    tr: 'Dijital / uzaktan kanal',        en: 'Digital and remote channel', scope: 'uzaktan_musteri_kabulu_var_mi' },
      { key: 'sanal',      tr: 'Sanal varlık hizmetleri',        en: 'Virtual asset services', scope: 'sanal_varlik_faaliyeti_var_mi' },
      { key: 'acente',     tr: 'Acente ve temsilci ağı',         en: 'Agent and representative network', scope: 'acente_temsilci_agi_var_mi' },
      { key: 'kambiyo',    tr: 'Kambiyo ve efektif işlemler',    en: 'FX and cash currency operations' }
    ]
  }
};
