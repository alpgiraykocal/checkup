/* Portföy ve maruziyet referans verileri.
   Anahtarlar Türkçe ve kalıcıdır; görünen etiketler i18n katmanından gelir. */

const PORTFOLIO = {

  /* Müşteri tipi × risk seviyesi matrisinin satırları */
  customerTypes: [
    { key: 'gercek_kisi',        tr: 'Gerçek kişi',                        en: 'Natural person' },
    { key: 'tuzel_kisi',         tr: 'Tüzel kişi',                          en: 'Legal entity' },
    { key: 'tuzel_olmayan',      tr: 'Tüzel kişiliği olmayan teşekkül',     en: 'Unincorporated body' },
    { key: 'trust_benzeri',      tr: 'Trust ve benzeri yapı',               en: 'Trust or similar arrangement' },
    { key: 'finansal_kurulus',   tr: 'Finansal kuruluş',                    en: 'Financial institution' },
    { key: 'kamu',               tr: 'Kamu kurumu',                         en: 'Public authority' },
    { key: 'kar_amacsiz',        tr: 'Kâr amacı gütmeyen kuruluş',          en: 'Non-profit organisation' }
  ],

  /* Risk seviyesi sütunları — depolanan anahtar Türkçe kalır */
  riskBands: [
    { key: 'Düşük',      tone: 'lvl-dusuk' },
    { key: 'Orta',       tone: 'lvl-orta' },
    { key: 'Yüksek',     tone: 'lvl-yuksek' },
    { key: 'Çok Yüksek', tone: 'lvl-cok-yuksek' }
  ],

  /* Doğuştan risk faktörlerini besleyen özel müşteri segmentleri.
     feeds: bu segmentin oranını skor önerisine çeviren faktör anahtarı. */
  segments: [
    { key: 'pep', tr: 'PEP, aile üyeleri ve yakın çevre', en: 'PEPs, family members and close associates',
      feeds: 'Müşteri|PEP ve ilişkili kişi maruziyeti', bands: [0.1, 0.5, 1, 3] },
    { key: 'non_resident', tr: 'Yerleşik olmayan müşteriler', en: 'Non-resident customers',
      feeds: 'Müşteri|Yerleşik olmayan (non-resident) müşteri oranı', bands: [1, 5, 15, 30] },
    { key: 'karmasik_sahiplik', tr: 'Karmaşık sahiplik yapılı tüzel kişiler', en: 'Legal entities with complex ownership',
      feeds: 'Müşteri|Karmaşık sahiplik yapılı tüzel kişi oranı', bands: [5, 15, 30, 100],
      base: 'tuzel' },
    { key: 'nakit_yogun', tr: 'Nakit yoğun sektör müşterileri', en: 'Cash-intensive sector customers',
      feeds: 'Müşteri|Nakit yoğun sektör müşterilerinin payı', bands: [2, 5, 12, 25] },
    { key: 'offshore', tr: 'Offshore / serbest bölge yapılı müşteriler', en: 'Offshore or free-zone structured customers',
      feeds: 'Coğrafya ve Yaptırım|Offshore ve vergi cenneti bağlantılı müşteri hacmi', bands: [1, 5, 10, 100] },
    { key: 'vasp', tr: 'Sanal varlık hizmet sağlayıcıları (VASP)', en: 'Virtual asset service providers (VASPs)' },
    { key: 'ozel_bankacilik', tr: 'Özel bankacılık / servet yönetimi müşterileri', en: 'Private banking / wealth management customers',
      feeds: 'Ürün|Özel bankacılık / servet yönetimi hacmi', bands: [2, 10, 20, 100] },
    { key: 'kar_amacsiz', tr: 'Kâr amacı gütmeyen kuruluşlar', en: 'Non-profit organisations' },
    { key: 'yeni_musteri', tr: 'Dönem içinde kabul edilen yeni müşteriler', en: 'New customers onboarded during the period' },
    { key: 'reddedilen', tr: 'Reddedilen başvurular', en: 'Declined applications' },
    { key: 'exit', tr: 'Sonlandırılan müşteri ilişkileri (exit)', en: 'Terminated customer relationships (exit)' },
    { key: 'atil', tr: 'Atıl (dormant) hesaplar', en: 'Dormant accounts' }
  ],

  /* Ülke ilişki tipleri */
  countryRelations: [
    { key: 'yurt_ici',           short: { tr: 'Yurt içi', en: 'Domestic' },
      tr: 'Yurt içi (sınır ötesi sayılmaz)', en: 'Domestic (not counted as cross-border)' },
    { key: 'musteri_ikametgahi', short: { tr: 'Müşteri', en: 'Customers' },
      tr: 'Müşteri ikametgâhı', en: 'Customer residence' },
    { key: 'islem_karsi_taraf',  short: { tr: 'Karşı taraf', en: 'Counterparty' },
      tr: 'İşlem karşı tarafı',  en: 'Transaction counterparty' },
    { key: 'muhabir',            short: { tr: 'Muhabir', en: 'Correspondent' },
      tr: 'Muhabir ilişkisi',    en: 'Correspondent relationship' },
    { key: 'sube_istirak',       short: { tr: 'Şube', en: 'Branch' },
      tr: 'Şube / iştirak',      en: 'Branch or subsidiary' },
    { key: 'ticaret',            short: { tr: 'Ticaret', en: 'Trade' },
      tr: 'Dış ticaret',         en: 'Trade finance' }
  ],

  /* Ülke risk işaretleri — her biri kullanıcı tarafından değiştirilebilir */
  countryFlags: [
    { key: 'fatfBlack',  short: { tr: 'FATF kara', en: 'FATF black' },
      tr: 'FATF eylem çağrısı (kara liste)', en: 'FATF call for action (black list)', weight: 5, tone: 'chip-critical' },
    { key: 'fatfGrey',   short: { tr: 'FATF gri', en: 'FATF grey' },
      tr: 'FATF artırılmış izleme (gri liste)', en: 'FATF increased monitoring (grey list)', weight: 4, tone: 'chip-high' },
    { key: 'sanctioned', short: { tr: 'Yaptırım', en: 'Sanctions' },
      tr: 'Kapsamlı yaptırım rejimi', en: 'Comprehensive sanctions regime', weight: 5, tone: 'chip-critical' },
    { key: 'euHighRisk', short: { tr: 'AB yüksek risk', en: 'EU high-risk' },
      tr: 'AB yüksek riskli üçüncü ülke', en: 'EU high-risk third country', weight: 4, tone: 'chip-high' },
    { key: 'offshore',   short: { tr: 'Offshore', en: 'Offshore' },
      tr: 'Offshore finans merkezi / vergi cenneti', en: 'Offshore centre / tax haven', weight: 3, tone: 'chip-mid' },
    { key: 'weakAml',    short: { tr: 'Zayıf AML', en: 'Weak AML' },
      tr: 'Zayıf AML denetimi / yüksek yolsuzluk', en: 'Weak AML supervision / high corruption', weight: 3, tone: 'chip-mid' }
  ],

  /* Şube ve birim tipleri */
  branchTypes: [
    { key: 'merkez',      tr: 'Genel müdürlük',        en: 'Head office' },
    { key: 'sube',        tr: 'Şube',                  en: 'Branch' },
    { key: 'yurtdisi',    tr: 'Yurt dışı şube',        en: 'Foreign branch' },
    { key: 'istirak',     tr: 'İştirak / bağlı ortaklık', en: 'Subsidiary' },
    { key: 'temsilcilik', tr: 'Temsilcilik',           en: 'Representative office' },
    { key: 'acente',      tr: 'Acente / temsilci',     en: 'Agent / representative' },
    { key: 'dijital',     tr: 'Dijital kanal',         en: 'Digital channel' }
  ],

  /* Ülke listesi ve açılış bayrakları countries.js içindedir (COUNTRIES).
     asOf: bu bayrakların dayandığı tarih; ayarlar ekranı bayatladığında uyarır. */
  countryRiskAsOf: '2026-01-01'
};
