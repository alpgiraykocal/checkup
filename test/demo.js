#!/usr/bin/env node
/* Demo çalışma dosyası üreticisi.

   Her ekranı dolduran, iç tutarlılığı sağlam ve gerçekçi bir değerlendirme
   kurar; sonucu tek bir JSON dosyasına yazar. Uygulamada "Çalışma dosyası
   yükle" ile açılır.

   Tasarım kararı: sonuç kasten KARIŞIK. Her şey yeşil olsaydı ısı haritası,
   aşım uyarıları, açık kritik listesi ve bulgu planı boş görünürdü. Bu yüzden
   bazı domainler güçlü, bazıları zayıf; birkaç iştah aşımı, gecikmiş bulgu ve
   QA çelişkisi var. Tutarsızlık uyarıları ise tetiklenmez — sayılar birbiriyle
   uyumlu.

     node test/demo.js [çıktı-yolu]
*/

const fs = require('fs');
const path = require('path');
const H = require('./harness.js');
const A = H.load();
const { DATA, EXTRA, RISKMODEL, PORTFOLIO, OPERATIONS, Store, Calc, Compare, I18n } = A;

I18n.apply('tr');

/* ---------- Kurum profili ---------- */
const MUSTERI = 128400;          // portföy matrisi tam bu toplamı verir
const YUKSEK_RISKLI = 7356;      // matristeki Yüksek + Çok Yüksek toplamı
const PEP = 412;
const ISLEM = 9240000;
const SINIR_OTESI = 812000;
const FTE = 26;

const s = JSON.parse(JSON.stringify(Store.snapshot()));

Object.assign(s.kunye, {
  kurum_unvani: 'Demo Bank A.Ş.',
  yukumlu_tipi: 'Banka',
  lisanslar: 'BDDK bankacılık lisansı; SPK yatırım hizmetleri yetki belgeleri; BKM üye kuruluş',
  faaliyet_gosterilen_ulkeler: 'TR, DE, NL, AE, GB (şube ve iştirak dahil)',
  donem_baslangic: '2025-01-01',
  donem_bitis: '2025-12-31',
  degerlendirmeyi_yapan: 'Öz değerlendirme — uyum + iş birimleri',
  uyum_gorevlisi: 'Elif Demirtaş (Uyum Görevlisi), Kerem Aydın (Vekil)',
  toplam_musteri_sayisi: MUSTERI,
  yuksek_riskli_musteri_sayisi: YUKSEK_RISKLI,
  pep_musteri_sayisi: PEP,
  yillik_islem_adedi: ISLEM,
  yillik_sinir_otesi_islem_adedi: SINIR_OTESI,
  uyum_birimi_kadrosu_fte: FTE,
  i_zleme_sistemi: 'Kroton AML Monitoring v4.2 (kurum içi kurulum)',
  yaptirim_tarama_sistemi: 'Kroton Sanction Miner v3.1 — gerçek zamanlı ödeme taraması',
  trade_finance_faaliyeti_var_mi: 'Evet',
  muhabir_bankacilik_var_mi: 'Evet',
  sanal_varlik_faaliyeti_var_mi: 'Hayır',      // kapsam kuralı çalışsın
  uzaktan_musteri_kabulu_var_mi: 'Evet',
  acente_temsilci_agi_var_mi: 'Evet',
  yurt_disi_sube_istirak_var_mi: 'Evet',
  son_bagimsiz_aml_denetimi_tarihi: '2025-04-18',
  son_ewra_tarihi: '2025-11-20',
  son_senaryo_tuning_tarihi: '2025-06-30',
  son_tarama_esigi_kalibrasyon_tarihi: '2024-09-15'   // 12 ayı aşıyor → yaşlandırma uyarısı
});

/* ---------- Doğuştan risk: 25 faktör ----------
   Gerçek bir bankanın profili: müşteri ve coğrafya yüksek, kanal orta,
   ürün ve işlem karışık. 4-5 skorlarda gerekçe zorunlu olduğu için yazıldı. */
const FAKTOR_SKOR = {
  'Müşteri|Yüksek riskli müşteri segmentlerinin payı': [4, 'Yüksek riskli pay %5,5 — sektör ortalamasının üzerinde; kurumsal portföyde yoğunlaşıyor.'],
  'Müşteri|PEP ve ilişkili kişi maruziyeti': [3, 'PEP payı %0,32; yerli PEP ağırlıklı, RCA tespiti otomatik.'],
  'Müşteri|Nakit yoğun sektör müşterilerinin payı': [4, 'Akaryakıt, kuyumculuk ve inşaat portföyünün %11,8 payı var.'],
  'Müşteri|Karmaşık sahiplik yapılı tüzel kişi oranı': [3, 'Çok katmanlı yapı oranı %6,4; üç katmandan derin yapılarda EDD zorunlu.'],
  'Müşteri|Yerleşik olmayan (non-resident) müşteri oranı': [3, ''],
  'Coğrafya ve Yaptırım|FATF gri/kara liste ülkeleriyle iş hacmi': [4, 'Gri listeli üç koridorda düzenli hacim; kara listeyle temas sistemsel engelli.'],
  'Coğrafya ve Yaptırım|Yaptırım rejimi altındaki ülkelere komşuluk/ticaret': [4, 'Komşu ülkeler üzerinden transit ticaret hacmi belirgin; yeniden faturalandırma riski izleniyor.'],
  'Coğrafya ve Yaptırım|Offshore ve vergi cenneti bağlantılı müşteri hacmi': [3, ''],
  'Coğrafya ve Yaptırım|Muhabir bankacılık ağının coğrafi riski': [4, 'Muhabir ağının %22si işaretli ülkelerde; nested tespiti aktif.'],
  'Coğrafya ve Yaptırım|Sınır ötesi transfer hacminin toplam içindeki payı': [3, ''],
  'Ürün|Nakit yoğun ürünlerin payı': [3, ''],
  'Ürün|Ön ödemeli / anonimlik derecesi yüksek ürünler': [2, ''],
  'Ürün|Trade finance ürün hacmi': [4, 'Dış ticaret finansmanı toplam gelirin %18i; dual-use kalem taraması devrede.'],
  'Ürün|Sanal varlık ürün ve hizmetleri': [1, 'Sanal varlık faaliyeti yok; VASP müşteri kabulü yasaklı listede.'],
  'Ürün|Özel bankacılık / servet yönetimi hacmi': [3, ''],
  'Kanal|Uzaktan (yüz yüze olmayan) müşteri kabul oranı': [4, 'Yeni hesapların %46sı uzaktan; canlılık tespiti ve belge doğrulama zorunlu.'],
  'Kanal|Acente ve temsilci kanalı payı': [3, ''],
  'Kanal|Üçüncü taraf / açık bankacılık entegrasyonları': [2, ''],
  'Kanal|Gözetimsiz kanallar (ATM, kiosk) işlem payı': [3, ''],
  'Kanal|Aracı kurum / muhabir üzerinden dolaylı erişim': [3, ''],
  'İşlem|Yıllık işlem hacmi ve büyüme hızı': [4, 'Hacim yıllık %19 büyüdü; izleme kapasitesi aynı oranda artmadı.'],
  'İşlem|Sınır ötesi elektronik transfer yoğunluğu': [3, ''],
  'İşlem|Nakit işlem hacmi': [3, ''],
  'İşlem|İşlem hızının kontrol süresine oranı (gerçek zamanlı ürünler)': [4, 'Anlık transfer ürünlerinde kontrol penceresi saniye altı; ön kontrol zorunlu.'],
  'İşlem|Eşik altı işlem yoğunluğu': [3, '']
};

DATA.inherentFactors.forEach(f => {
  const rec = FAKTOR_SKOR[f.key];
  if (!rec) return;
  s.inherent[f.key] = rec[0];
  if (rec[1]) s.inherentNotes[f.key] = rec[1];
});
// Bir faktör kurum kararıyla ağırlıklandırıldı, biri kapsam dışı bırakıldı
s.inherentWeights['Coğrafya ve Yaptırım|Muhabir bankacılık ağının coğrafi riski'] = 5;
s.inherentNA['Ürün|Ön ödemeli / anonimlik derecesi yüksek ürünler'] = true;
delete s.inherent['Ürün|Ön ödemeli / anonimlik derecesi yüksek ürünler'];

/* ---------- Anket: 218 soru ----------
   Domain başına farklı olgunluk profili: D6 ve D5 güçlü (yaptırım ve CDD'ye
   yatırım yapılmış), D4 ve D7 zayıf (veri ve izleme borcu), gerisi orta. */
const PROFIL = {
  D1: [0.80, 0.15], D2: [0.72, 0.18], D3: [0.66, 0.22], D4: [0.48, 0.24],
  D5: [0.82, 0.12], D6: [0.86, 0.10], D7: [0.52, 0.26], D8: [0.76, 0.16],
  D9: [0.70, 0.20], D10: [0.74, 0.18], D11: [0.62, 0.24]
};
const KANIT = {
  D1: 'YK kararı 2025/14, Uyum Programı v6.1', D2: 'Risk modeli dok. RM-2025-03',
  D3: 'Ürün envanteri PE-2025, NPA formu 41', D4: 'Veri kalitesi raporu DQ-2025-Q4',
  D5: 'CDD prosedürü P-05 v9, örnek dosya 1204', D6: 'Tarama konfig. SC-2025-11, test raporu T-88',
  D7: 'Senaryo envanteri SM-2025, tuning raporu TR-14', D8: 'ŞİB prosedürü P-08 v5, MASAK kayıtları',
  D9: 'Bulgu takip listesi BT-2025', D10: 'Eğitim planı EG-2025, sınav sonuçları',
  D11: 'EWRA 2025 raporu, YK onayı 2025/41'
};

/* Belirlenmiş sözde rastgele: her koşuda aynı dosya üretilsin. */
let tohum = 20260815;
const rnd = () => { tohum = (tohum * 1103515245 + 12345) & 0x7fffffff; return tohum / 0x7fffffff; };

DATA.questions.forEach(q => {
  const [evetOran, kismenOran] = PROFIL[q.domain];
  const r = rnd();
  let a;
  if (r < evetOran) a = 'Evet';
  else if (r < evetOran + kismenOran) a = 'Kısmen';
  else a = 'Hayır';

  const rec = { a, evidence: KANIT[q.domain] };
  // "Evet" dışındaki yanıtlarda bulgu notu — aksiyon üretimini besler
  if (a !== 'Evet') {
    rec.note = a === 'Kısmen'
      ? 'Kontrol var ancak kapsamı kısmi; dokümantasyon ve düzenli test eksik.'
      : 'Kontrol tanımlı değil; kapatma için sistem ve süreç değişikliği gerekiyor.';
  }
  if (q.qa) {
    // Test sonuçları: çoğu doğrulandı, bir kısmı kısmi, üç tanesi çelişkili
    const rq = rnd();
    rec.qaResult = rq < 0.62 ? 'Doğrulandı'
      : rq < 0.82 ? 'Kısmen doğrulandı'
      : rq < 0.88 ? 'Çelişkili' : 'Test edilmedi';
    if (rec.qaResult !== 'Test edilmedi') {
      rec.qaSample = String(20 + Math.floor(rnd() * 40));
      rec.qaErrors = String(Math.floor(rnd() * 5));
      rec.qaNote = rec.qaResult === 'Çelişkili'
        ? 'Dosya testinde beyan doğrulanamadı; kontrol örneklemde çalışmıyor.'
        : 'Örneklem testi tamamlandı, bulgular kayıtlı.';
    }
  }
  s.answers[q.id] = rec;
});

/* ---------- Ek kontroller: 44 soru ----------
   Kapsam dışı setler (sigorta, e-para, VASP, kambiyo, sermaye piyasası) banka
   olduğu için otomatik kapanır; yine de yanıt yazılır ki dosya tam olsun. */
EXTRA.sets.forEach(set => {
  const zayifSet = set.key === 'model' || set.key === 'ichat';   // yeni alanlar zayıf
  set.questions.forEach(q => {
    const r = rnd();
    const a = zayifSet ? (r < 0.35 ? 'Evet' : r < 0.65 ? 'Kısmen' : 'Hayır')
                       : (r < 0.62 ? 'Evet' : r < 0.85 ? 'Kısmen' : 'Hayır');
    const rec = { a, evidence: 'Ek kontrol kanıt dosyası ' + q.id };
    if (a !== 'Evet') rec.note = 'Yeni eklenen kontrol alanı; kapatma planı 2026 Q1.';
    if (q.qa) rec.qaResult = r < 0.5 ? 'Doğrulandı' : r < 0.8 ? 'Kısmen doğrulandı' : 'Test edilmedi';
    s.answers[q.id] = rec;
  });
});

/* ---------- QA örneklem hacimleri: 24 popülasyon ---------- */
const QA_HACIM = {
  'Verilen ŞİB dosyaları': 418,
  'ŞİB verilmeyen ancak eşiği geçen kapatılmış vakalar': 2140,
  'Dondurma ve varlık kısıtlama kararları': 26,
  'Yaptırım gerçek eşleşme (true match) vakaları': 34,
  'Kapatılan yaptırım alertleri': 18600,
  'PEP müşteri dosyaları': 412,
  'Müşteri çıkış (exit) kararları': 96,
  'Kolluk ve yargı bilgi talepleri': 288,
  'EDD dosyaları': 3160,
  'Kapatılan izleme (monitoring) alertleri': 26400,
  'Yüksek riskli yeni müşteri hesap açılışları': 1840,
  'Muhabir banka ilişkileri': 74,
  'Trade finance dosyaları': 5620,
  'Risk skoru override edilen müşteriler': 640,
  'Gecikmiş periyodik KYC dosyaları': 1290,
  'Uzaktan açılan hesaplar': 10800,
  'Eksik bilgili elektronik transferler': 3420,
  'Sanal varlık transferleri': 0,
  'Standart yeni müşteri hesap açılışları': 23400,
  'Eşik üstü nakit işlemler': 48200,
  'Reddedilen müşteri başvuruları': 730,
  'Eğitim tamamlama kayıtları': 2480,
  'Kapatılan denetim ve validasyon bulguları': 112,
  'Veri mutabakatı ve besleme hatası kayıtları': 940
};
DATA.qaPopulations.forEach(p => {
  const v = QA_HACIM[p.key];
  if (v !== undefined && v > 0) s.qaVolumes[p.key] = v;
});

/* ---------- Operasyon: 101 ölçüt ----------
   Tüm tutarlılık kuralları sağlanır (izlenen ≤ toplam, vaka ≤ alert,
   ŞİB ≤ vaka, tamamlayan ≤ hedef, kritik hata ≤ test dosyası...). */
const OPS = {
  // evren
  islem_toplam: { adet: ISLEM },
  islem_izlenen: { adet: 8930000 },
  nakit: { adet: 1108000, tutar: 42600000000 },
  nakit_esik_ustu: { adet: 48200 },
  nakit_esik_alti_yogun: { adet: 6340 },
  giden_transfer: { adet: 438000, tutar: 129000000000 },
  gelen_transfer: { adet: 374000, tutar: 141000000000 },
  eksik_bilgili: { adet: 3420 },
  askiya_alinan: { adet: 1180 },
  gozetimsiz_kanal: { adet: 812000 },
  acente_islem: { adet: 296000 },
  sanal_varlik_transfer: { adet: 0, tutar: 0 },
  unhosted: { adet: 0 },
  // yaptırım
  taranan_musteri: { adet: 128400 },
  taranan_islem: { adet: 9240000 },
  musteri_alert: { adet: 6420 },
  islem_alert: { adet: 12180 },
  true_match: { adet: 34 },
  bloke_islem: { adet: 21, tutar: 18400000 },
  red_islem: { adet: 13, tutar: 6900000 },
  serbest_birakilan: { adet: 18566 },
  alert_kapanis_saat: { saat: 9 },
  liste_guncelleme: { adet: 214 },
  liste_yansima_saat: { saat: 6 },
  rescreening: { adet: 214 },
  dolayli_sahiplik_tespit: { adet: 47 },
  tarama_kesinti_saat: { saat: 3 },
  // trade finance
  akreditif_ithalat: { adet: 2140, tutar: 8600000000 },
  akreditif_ihracat: { adet: 1860, tutar: 7200000000 },
  vesaik: { adet: 980, tutar: 2100000000 },
  teminat_mektubu: { adet: 640, tutar: 1400000000 },
  kabul_aval: { adet: 210 },
  trade_toplam_dosya: { adet: 5620 },
  mal_tarama: { adet: 5620 },
  gemi_tarama: { adet: 4180 },
  liman_tarama: { adet: 4180 },
  son_kullanici_tarama: { adet: 3960 },
  dual_use: { adet: 186 },
  yuksek_riskli_koridor: { adet: 742 },
  fiyat_makulluk: { adet: 5620 },
  transit_serbest_bolge: { adet: 418 },
  trade_kirmizi_bayrak: { adet: 63 },
  trade_red: { adet: 11 },
  trade_sib: { adet: 24 },
  // muhabir
  muhabir_aktif: { adet: 74 },
  muhabir_yeni: { adet: 6 },
  muhabir_kapanan: { adet: 3 },
  muhabir_karsi_taraf_kapatti: { adet: 1 },
  cbddq: { adet: 74 },
  nested_tespit: { adet: 4 },
  rfi_gelen: { adet: 312 },
  rfi_yanitlanan: { adet: 298 },
  rfi_yanit_gun: { gun: 8 },
  rfi_giden: { adet: 146 },
  muhabirden_iade: { adet: 62, tutar: 41000000 },
  muhabire_iade: { adet: 28, tutar: 19000000 },
  muhabir_islem: { adet: 184000 },
  payable_through: { adet: 0 },
  // izleme
  senaryo_aktif: { adet: 46 },
  senaryo_degisiklik: { adet: 11 },
  izleme_alert: { adet: 28600 },
  izleme_alert_kapatilan: { adet: 26400 },
  izleme_vaka: { adet: 3140 },
  toplu_kapatma: { adet: 1420 },
  backlog: { adet: 2200 },
  alert_kapanis_gun: { gun: 14 },
  izleme_kesinti_saat: { saat: 11 },
  dahili_bildirim: { adet: 168 },
  // ŞİB, dondurma, kolluk
  sib_adet: { adet: 418 },
  sib_tutar: { tutar: 3860000000 },
  sib_sure_gun: { gun: 9 },
  sib_gecikmis: { adet: 12 },
  sib_verilmeyen: { adet: 2140 },
  sib_tekrar: { adet: 84 },
  dondurma_karar: { adet: 26 },
  dondurulan_hesap: { adet: 31, tutar: 14200000 },
  dondurma_kaldirma: { adet: 4 },
  istisna_talep: { adet: 2 },
  kolluk_talep: { adet: 288 },
  kolluk_yanit_gun: { gun: 6 },
  exit_karar: { adet: 96 },
  red_basvuru: { adet: 730 },
  tipping_off_ihlal: { adet: 0 },
  // müşteri kabul
  yeni_hesap: { adet: 23400 },
  uzaktan_hesap: { adet: 10800 },
  canlilik_basarisiz: { adet: 640 },
  edd_dosya: { adet: 3160 },
  edd_onay_ust_yonetim: { adet: 3160 },
  gf_tespit_edilemeyen: { adet: 38 },
  risk_override: { adet: 640 },
  periyodik_tamamlanan: { adet: 19800 },
  kyc_gecikmis: { adet: 1290 },
  kisitlama_uygulanan: { adet: 410 },
  adverse_media_hit: { adet: 1840 },
  // kalite güvence
  qa_test_dosya: { adet: 1240 },
  qa_kritik_hata: { adet: 41 },
  qa_major_hata: { adet: 118 },
  qa_minor_hata: { adet: 264 },
  qa_yeniden_test: { adet: 41 },
  egitim_hedef: { adet: 2480 },
  egitim_tamamlayan: { adet: 2372 }
};
s.operations = OPS;

/* ---------- KPI: 15 kalem ----------
   Otomatik dolan KPI'lar operasyon ekranından gelir; buraya hedefler ve
   otomatik dolmayan ölçümler yazılır. */
const KPI = {
  'Alert - vaka dönüşüm oranı': ['12', ''],
  'Vaka - ŞİB dönüşüm oranı': ['15', ''],
  'Ortalama ŞİB bildirim süresi (gün)': ['7', ''],
  'Yaptırım alerti ortalama kapanış süresi (saat)': ['8', ''],
  'Liste güncelleme yansıma süresi (saat)': ['4', ''],
  'Bekleyen alert sayısı (backlog)': ['1500', ''],
  'Gecikmiş periyodik KYC dosya sayısı': ['800', ''],
  'QA kritik hata oranı': ['2', ''],
  'QA majör hata oranı': ['8', ''],
  'Eğitim tamamlanma oranı': ['100', ''],
  'Dahili şüphe bildirimi sayısı': ['150', ''],
  'Kolluk talebi ortalama yanıt süresi (gün)': ['10', ''],
  'Aksiyon kapanış oranı': ['80', ''],
  'Son senaryo tuning üzerinden geçen süre (ay)': ['12', ''],
  'Son tarama kalibrasyonu üzerinden geçen süre (ay)': ['12', '']
};
DATA.kpis.forEach(k => {
  const rec = KPI[k.key];
  if (!rec) return;
  s.kpis[k.key] = { target: rec[0] };
  if (rec[1]) s.kpis[k.key].value = rec[1];
});

/* ---------- PF: 5 faktör ---------- */
const PF_SKOR = {
  'PF|BM yayılma rejimi ülkeleriyle doğrudan veya dolaylı temas': [3, 'Komşu ve transit ülkeler üzerinden dolaylı temas; her vaka incelenmiş.'],
  'PF|Çift kullanımlı ve kontrole tabi mal ticareti': [4, '186 dosyada kontrole tabi kalem; son kullanıcı doğrulaması dosyaların %70inde tam.'],
  'PF|Denizcilik, lojistik ve aracı müşteri maruziyeti': [4, 'Transit hub ülkelerinde gemi işletmecisi ve taşıma acentesi müşteriler mevcut.'],
  'PF|Paravan ve tedarik ağı yapıları': [3, 'Ortak adres/yönetici kümeleri tespit ediliyor; ağ analizi kısmi.'],
  'PF|Yaptırım kaçınma tipolojilerine maruziyet': [4, 'Üçüncü ülke üzerinden yeniden faturalandırma sinyalleri iki koridorda düzenli.']
};
RISKMODEL.pf.factors.forEach(f => {
  const rec = PF_SKOR[f.key];
  if (rec) s.pf[f.key] = { score: rec[0], note: rec[1] };
});

/* ---------- İş kolları: paylar 100 ---------- */
const LINES = {
  bireysel: [28, { 'Müşteri': 3, 'Coğrafya ve Yaptırım': 2, 'Ürün': 2, 'Kanal': 4, 'İşlem': 3 }],
  kurumsal: [22, { 'Müşteri': 4, 'Coğrafya ve Yaptırım': 4, 'Ürün': 3, 'Kanal': 2, 'İşlem': 4 }],
  kobi:     [14, { 'Müşteri': 4, 'Coğrafya ve Yaptırım': 3, 'Ürün': 3, 'Kanal': 3, 'İşlem': 3 }],
  ozel:     [8,  { 'Müşteri': 5, 'Coğrafya ve Yaptırım': 4, 'Ürün': 4, 'Kanal': 2, 'İşlem': 3 }],
  hazine:   [6,  { 'Müşteri': 2, 'Coğrafya ve Yaptırım': 3, 'Ürün': 3, 'Kanal': 1, 'İşlem': 3 }],
  trade:    [10, { 'Müşteri': 4, 'Coğrafya ve Yaptırım': 5, 'Ürün': 4, 'Kanal': 2, 'İşlem': 4 }],
  muhabir:  [5,  { 'Müşteri': 4, 'Coğrafya ve Yaptırım': 5, 'Ürün': 3, 'Kanal': 4, 'İşlem': 4 }],
  odeme:    [4,  { 'Müşteri': 3, 'Coğrafya ve Yaptırım': 3, 'Ürün': 3, 'Kanal': 4, 'İşlem': 4 }],
  dijital:  [2,  { 'Müşteri': 3, 'Coğrafya ve Yaptırım': 2, 'Ürün': 2, 'Kanal': 5, 'İşlem': 3 }],
  acente:   [1,  { 'Müşteri': 3, 'Coğrafya ve Yaptırım': 3, 'Ürün': 2, 'Kanal': 5, 'İşlem': 3 }]
};
Object.keys(LINES).forEach(k => {
  const [share, dims] = LINES[k];
  s.lines[k] = { active: true, share, dims, note: '' };
});
s.lines.kambiyo = { active: false, share: '', dims: {}, note: 'Kambiyo işlemleri hazine altında raporlanıyor.' };
s.lines.sanal = { active: false, share: '', dims: {}, note: 'Sanal varlık faaliyeti yok.' };

/* ---------- Portföy: matris toplamı künyedeki müşteri sayısına eşit ---------- */
const MATRIS = {
  gercek_kisi:      { 'Düşük': 71444, 'Orta': 24800, 'Yüksek': 3900, 'Çok Yüksek': 420 },
  tuzel_kisi:       { 'Düşük': 9800,  'Orta': 8600,  'Yüksek': 1840, 'Çok Yüksek': 310 },
  tuzel_olmayan:    { 'Düşük': 1200,  'Orta': 940,   'Yüksek': 180,  'Çok Yüksek': 40 },
  trust_benzeri:    { 'Düşük': 40,    'Orta': 110,   'Yüksek': 90,   'Çok Yüksek': 60 },
  finansal_kurulus: { 'Düşük': 210,   'Orta': 340,   'Yüksek': 180,  'Çok Yüksek': 40 },
  kamo_placeholder: null,
  kamu:             { 'Düşük': 1840,  'Orta': 620,   'Yüksek': 40,   'Çok Yüksek': 0 },
  kar_amacsiz:      { 'Düşük': 620,   'Orta': 480,   'Yüksek': 190,  'Çok Yüksek': 66 }
};
delete MATRIS.kamo_placeholder;
PORTFOLIO.customerTypes.forEach(ct => { if (MATRIS[ct.key]) s.portfolio.matrix[ct.key] = MATRIS[ct.key]; });

const SEGMENT = {
  pep:               [412, 412],
  non_resident:      [4180, 980],
  karmasik_sahiplik: [1420, 640],
  nakit_yogun:       [15100, 2840],
  offshore:          [860, 620],
  vasp:              [0, 0],
  ozel_bankacilik:   [1240, 410],
  kar_amacsiz:       [1356, 256],
  yeni_musteri:      [23400, 1840],
  reddedilen:        [730, 730],
  exit:              [96, 96],
  atil:              [8600, 240]
};
PORTFOLIO.segments.forEach(sg => {
  const rec = SEGMENT[sg.key];
  if (!rec) return;
  s.portfolio.segments[sg.key] = { customers: rec[0], highRisk: rec[1],
    note: sg.key === 'vasp' ? 'VASP müşteri kabulü yasaklı listede.' : '' };
});

s.portfolio.countries = [
  { code: 'TR', name: 'Türkiye', relations: ['yurt_ici', 'musteri_ikametgahi', 'sube_istirak'], customers: 119800, txIn: 3980000, txOut: 4140000 },
  { code: 'DE', name: 'Almanya', relations: ['musteri_ikametgahi', 'islem_karsi_taraf', 'muhabir', 'sube_istirak', 'ticaret'], customers: 3200, txIn: 141000, txOut: 128000 },
  { code: 'NL', name: 'Hollanda', relations: ['islem_karsi_taraf', 'muhabir', 'ticaret'], customers: 640, txIn: 62000, txOut: 58000 },
  { code: 'GB', name: 'Birleşik Krallık', relations: ['islem_karsi_taraf', 'muhabir'], customers: 480, txIn: 48000, txOut: 44000 },
  { code: 'AE', name: 'Birleşik Arap Emirlikleri', relations: ['musteri_ikametgahi', 'islem_karsi_taraf', 'muhabir', 'ticaret'], customers: 1840, txIn: 74000, txOut: 86000 },
  { code: 'RU', name: 'Rusya', relations: ['islem_karsi_taraf', 'ticaret'], customers: 210, txIn: 12400, txOut: 9800 },
  { code: 'IR', name: 'İran', relations: ['islem_karsi_taraf'], customers: 12, txIn: 180, txOut: 140 },
  { code: 'AZ', name: 'Azerbaycan', relations: ['musteri_ikametgahi', 'islem_karsi_taraf', 'ticaret'], customers: 620, txIn: 18600, txOut: 16400 },
  { code: 'KZ', name: 'Kazakistan', relations: ['islem_karsi_taraf', 'ticaret'], customers: 340, txIn: 11200, txOut: 9600 },
  { code: 'AF', name: 'Afganistan', relations: ['islem_karsi_taraf'], customers: 8, txIn: 90, txOut: 60 },
  { code: 'PA', name: 'Panama', relations: ['musteri_ikametgahi'], customers: 96, txIn: 2400, txOut: 2100 },
  { code: 'KY', name: 'Cayman Adaları', relations: ['musteri_ikametgahi'], customers: 64, txIn: 1800, txOut: 1600 },
  { code: 'VN', name: 'Vietnam', relations: ['ticaret'], customers: 148, txIn: 6200, txOut: 5400 },
  { code: 'NG', name: 'Nijerya', relations: ['ticaret', 'islem_karsi_taraf'], customers: 92, txIn: 3100, txOut: 2600 }
];

s.portfolio.branches = [
  { name: 'Genel Müdürlük', type: 'merkez', country: 'TR', customers: 0, highRiskCustomers: 0, complianceFte: 18, lastAudit: '2025-04-18' },
  { name: 'İstanbul Kurumsal', type: 'sube', country: 'TR', customers: 18400, highRiskCustomers: 2140, complianceFte: 3, lastAudit: '2025-02-10' },
  { name: 'İstanbul Bireysel', type: 'sube', country: 'TR', customers: 62800, highRiskCustomers: 1840, complianceFte: 2.5, lastAudit: '2025-03-06' },
  { name: 'İzmir Şube', type: 'sube', country: 'TR', customers: 21600, highRiskCustomers: 1120, complianceFte: 1.5, lastAudit: '2024-11-22' },
  { name: 'Ankara Şube', type: 'sube', country: 'TR', customers: 17000, highRiskCustomers: 640, complianceFte: 1.5, lastAudit: '2025-01-15' },
  { name: 'Frankfurt Şube', type: 'yurtdisi', country: 'DE', customers: 3200, highRiskCustomers: 480, complianceFte: 2, lastAudit: '2023-05-30' },
  { name: 'Amsterdam İştirak', type: 'istirak', country: 'NL', customers: 640, highRiskCustomers: 160, complianceFte: 1, lastAudit: '2024-08-14' },
  { name: 'Dubai Temsilcilik', type: 'temsilcilik', country: 'AE', customers: 1840, highRiskCustomers: 620, complianceFte: 0.5, lastAudit: '2022-10-04' },
  { name: 'Acente Ağı (142 nokta)', type: 'acente', country: 'TR', customers: 2920, highRiskCustomers: 96, complianceFte: 1, lastAudit: '2025-05-20' },
  { name: 'Dijital Kanal', type: 'dijital', country: 'TR', customers: 0, highRiskCustomers: 0, complianceFte: 1, lastAudit: '2025-06-11' }
];

/* ---------- Ülke risk kurum kararları ---------- */
s.countryRisk = {
  AZ: ['weakAml', 'fatfGrey'],          // kurum kendi değerlendirmesiyle gri ekledi
  VN: ['fatfGrey', 'weakAml'],
  AE: ['offshore', 'weakAml'],
  TR: []                                 // yurt içi, işaret kaldırıldı
};

/* ---------- İştah: iki alanda kurum kararı ---------- */
s.appetite = { D6: 1.2, D8: 1.2, PF: 2.0 };

/* ---------- Bulgu ve aksiyon planı ----------
   Terminler dosyanın üretildiği güne göre hesaplanır; demo aylar sonra
   açıldığında da anlamlı kalır. İki bulgu kasten gecikmiş bırakıldı. */
const bugun = new Date(); bugun.setHours(12, 0, 0, 0);
const gunEkle = n => { const d = new Date(bugun); d.setDate(d.getDate() + n); return Calc.toISODate(d); };
s.actions = [
  { id: 'BLG-001', domain: 'D4', questionId: 'D4-04', finding: 'Kaynak sistemler ile izleme sistemi arasındaki günlük mutabakat üç kalemde yapılmıyor; kart işlemleri ve POS akışında fark tespit edildi.',
    source: 'Anket — D4-04 (yanıt: Hayır)', rootCause: 'Sistem', crit: 'Kritik',
    action: 'Kart ve POS akışları için otomatik mutabakat işi kurulacak, fark eşiği %0,1 olarak tanımlanacak.',
    owner: 'BT — Veri Yönetimi', due: gunEkle(45), verification: 'Üç ay üst üste mutabakat raporu ve fark kaydı incelemesi',
    status: 'Devam Ediyor', closedAt: '', residualAfter: 'Orta' },
  { id: 'BLG-002', domain: 'D7', questionId: 'D7-08', finding: 'Eşik altı (below-the-line) testi son 18 ayda hiç yapılmadı; kaçırılmış şüphe riski ölçülmemiş.',
    source: 'Anket — D7-08 (yanıt: Hayır)', rootCause: 'Yönetişim', crit: 'Kritik',
    action: 'Yıllık BTL test planı hazırlanacak, ilk test 2026 Q1 içinde bağımsız ekiple yürütülecek.',
    owner: 'Uyum — Model Yönetimi', due: gunEkle(78), verification: 'BTL test raporu ve bulgu kapanış kaydı',
    status: 'Açık', closedAt: '', residualAfter: 'Orta' },
  { id: 'BLG-003', domain: 'D6', questionId: 'D6-02', finding: 'Liste güncelleme yansıma süresi SLA (4 saat) yılda 11 kez aşıldı; ortalama 6 saat.',
    source: 'Operasyon ölçümü — liste yansıma süresi', rootCause: 'Süreç', crit: 'Kritik',
    action: 'Liste besleme işi saatlik tetiklenecek; aşım durumunda otomatik eskalasyon kurulacak.',
    owner: 'BT — Entegrasyon', due: gunEkle(-210), verification: 'Üç aylık SLA ölçüm raporu',
    status: 'Kapalı', closedAt: gunEkle(-217), residualAfter: 'Düşük' },
  { id: 'BLG-004', domain: 'D5', questionId: 'D5-18', finding: 'EDD dosyalarının %30unda servet kaynağı beyan dışı bağımsız kanıtla desteklenmemiş.',
    source: 'QA örneklemi — EDD dosyaları', rootCause: 'Süreç', crit: 'Yüksek',
    action: 'SoW kanıt şablonu yayımlanacak, kabul öncesi kontrol listesine eklenecek.',
    owner: 'Uyum — KYC', due: gunEkle(21), verification: 'Sonraki QA örnekleminde %95 tamlık',
    status: 'Doğrulama Bekliyor', closedAt: '', residualAfter: 'Düşük' },
  { id: 'BLG-005', domain: 'D2', questionId: 'D2-15', finding: 'Nested muhabir ilişkileri elle tespit ediliyor; sistemsel kontrol yok. Dönem içinde 4 vaka bulundu.',
    source: 'Anket — D2-15 (yanıt: Kısmen)', rootCause: 'Sistem', crit: 'Kritik',
    action: 'Muhabir işlemlerinde karşı taraf kurumu tespit eden kural geliştirilecek.',
    owner: 'BT — AML Sistemleri', due: gunEkle(-24), verification: 'Kural testi ve üç aylık tespit raporu',
    status: 'Açık', closedAt: '', residualAfter: 'Orta' },
  { id: 'BLG-006', domain: 'D10', questionId: 'D10-06', finding: 'Eğitimi tamamlamayan 108 çalışan için eskalasyon uygulanmamış.',
    source: 'Operasyon ölçümü — eğitim tamamlanma', rootCause: 'İnsan/Kapasite', crit: 'Orta',
    action: 'Tamamlamayanlar için otomatik hatırlatma ve yönetici bilgilendirme kurulacak.',
    owner: 'İnsan Kaynakları', due: gunEkle(112), verification: 'Tamamlanma oranı %100',
    status: 'Açık', closedAt: '', residualAfter: 'Düşük' },
  { id: 'BLG-007', domain: 'D8', questionId: 'D8-03', finding: '12 ŞİB mevzuattaki süre sınırından sonra bildirildi; gecikme nedeni vaka devir sürecinde bekleme.',
    source: 'Operasyon ölçümü — gecikmiş bildirim', rootCause: 'Süreç', crit: 'Yüksek',
    action: 'Vaka devir süresi için iç SLA tanımlanacak, bekleyen vaka uyarısı kurulacak.',
    owner: 'Uyum — İnceleme', due: gunEkle(-240), verification: 'Gecikmiş bildirim sayısı sıfır',
    status: 'Kapalı', closedAt: gunEkle(-248), residualAfter: 'Düşük' },
  { id: 'BLG-008', domain: 'D11', questionId: 'D11-13', finding: 'EWRA çıktıları senaryo eşiklerine ve KYC frekanslarına fiilen yansıtılmamış.',
    source: 'Anket — D11-13 (yanıt: Kısmen)', rootCause: 'Yönetişim', crit: 'Kritik',
    action: 'EWRA aksiyon maddeleri senaryo ve frekans değişikliklerine referansla izlenecek.',
    owner: 'Uyum Görevlisi', due: gunEkle(160), verification: 'Değişiklik kayıtlarında EWRA referansı',
    status: 'Açık', closedAt: '', residualAfter: 'Orta' },
  { id: 'BLG-009', domain: 'D9', questionId: 'D9-02', finding: 'Geçen dönem denetim bulgularının 9 tanesinde bağımsız yeniden test yapılmadan kapatma yapılmış.',
    source: 'Bulgu takip listesi incelemesi', rootCause: 'Yönetişim', crit: 'Yüksek',
    action: 'Kapanış onayı iç denetim re-test kaydına bağlanacak.',
    owner: 'İç Denetim', due: gunEkle(-300), verification: 'Re-test kaydı olmadan kapanış yapılamaması',
    status: 'Kapalı', closedAt: gunEkle(-306), residualAfter: 'Düşük' },
  { id: 'BLG-010', domain: 'D3', questionId: 'D3-06', finding: 'Sahte ve manipüle belge tespit oranı ölçülmüyor; uzaktan kabulde 640 canlılık başarısızlığı analiz edilmemiş.',
    source: 'Anket — D3-06 (yanıt: Hayır)', rootCause: 'Veri', crit: 'Orta',
    action: 'Canlılık ve belge doğrulama başarısızlıkları aylık raporlanacak, örüntü analizi yapılacak.',
    owner: 'Dijital Kanal', due: gunEkle(134), verification: 'Aylık tespit raporu',
    status: 'Açık', closedAt: '', residualAfter: 'Orta' },
  { id: 'BLG-011', domain: 'D6', questionId: 'D6-17', finding: 'Trade finance dosyalarının %26sında gemi ve liman taraması yapılmamış (4.180 / 5.620).',
    source: 'Operasyon ölçümü — trade tarama örtüsü', rootCause: 'Süreç', crit: 'Kritik',
    action: 'Gemi ve liman taraması dosya açılış kontrol listesine zorunlu alan olarak eklenecek.',
    owner: 'Dış Ticaret Operasyon', due: gunEkle(-11), verification: 'Tarama örtüsü %100',
    status: 'Açık', closedAt: '', residualAfter: 'Yüksek' },
  { id: 'BLG-012', domain: 'D7', questionId: 'D7-17', finding: 'Dönem içinde 1.420 alert toplu kapatma ile kapatılmış (kapatılanların %5,4ü); özel onay kaydı bulunmuyor.',
    source: 'Operasyon ölçümü — toplu kapatma payı', rootCause: 'İç kontrol', crit: 'Kritik',
    action: 'Toplu kapatma sistemsel olarak engellenecek; istisna için ikinci seviye onay kurulacak.',
    owner: 'BT — AML Sistemleri', due: gunEkle(58), verification: 'Toplu kapatma sayısı sıfır veya onaylı',
    status: 'Devam Ediyor', closedAt: '', residualAfter: 'Orta' }
];

/* ---------- Ekip ataması ---------- */
s.assign = {
  D1: 'Elif Demirtaş — Uyum Görevlisi',
  D2: 'Kerem Aydın — Uyum Vekili',
  D3: 'Sinem Kaya — Ürün Yönetimi',
  D4: 'Onur Şahin — BT Veri Yönetimi',
  D5: 'Zeynep Arslan — KYC Ekip Lideri',
  D6: 'Murat Özkan — Yaptırım Uyumu',
  D7: 'Deniz Yıldız — Model Yönetimi',
  D8: 'Elif Demirtaş — Uyum Görevlisi',
  D9: 'Burak Çelik — İç Denetim',
  D10: 'Ayşe Toprak — İnsan Kaynakları',
  D11: 'Elif Demirtaş — Uyum Görevlisi'
};

/* ---------- İmza bloğu ---------- */
s.signoff = {
  prepared: { name: 'Elif Demirtaş — Uyum Görevlisi', date: '2026-01-12' },
  reviewed: { name: 'Burak Çelik — İç Denetim Müdürü', date: '2026-01-19' },
  approved: { name: 'Ahmet Vural — Genel Müdür Yardımcısı (Uyum)', date: '2026-01-26' }
};

/* ---------- Yöntem: varsayılan (çalışma kitabı paritesi) ---------- */
s.method = { weightByExposure: false };

/* ---------- Değişiklik günlüğü ----------
   Gerçek bir çalışmada oluşacak izin küçük bir örneği. */
const gun = (g, sa) => new Date(2025, 11, g, sa, 15, 0).toISOString();
s.log = [
  { at: gun(2, 9),  who: 'Elif Demirtaş — Uyum Görevlisi', what: 'answer', ref: 'D1-01', from: '', to: 'Evet' },
  { at: gun(2, 10), who: 'Elif Demirtaş — Uyum Görevlisi', what: 'inherent', ref: 'Müşteri|Yüksek riskli müşteri segmentlerinin payı', from: '', to: '4' },
  { at: gun(4, 11), who: 'Murat Özkan — Yaptırım Uyumu', what: 'answer', ref: 'D6-02', from: 'Evet', to: 'Kısmen' },
  { at: gun(4, 11), who: 'Murat Özkan — Yaptırım Uyumu', what: 'action-add', ref: 'BLG-003', from: '', to: '{"finding":"Liste güncelleme yansıma süresi SLA aşımı","status":"Açık","crit":"Kritik"}' },
  { at: gun(8, 14), who: 'Onur Şahin — BT Veri Yönetimi', what: 'answer', ref: 'D4-04', from: 'Kısmen', to: 'Hayır' },
  { at: gun(9, 15), who: 'Elif Demirtaş — Uyum Görevlisi', what: 'merge', ref: 'yaptirim-ekibi.json', from: '14 farklı parça', to: '2 parça alındı: D6 · Finansal Yaptırımlar ve Tarama, Coğrafya ve Yaptırım' },
  { at: gun(12, 16), who: 'Deniz Yıldız — Model Yönetimi', what: 'answer', ref: 'D7-08', from: '', to: 'Hayır' },
  { at: gun(12, 16), who: 'Deniz Yıldız — Model Yönetimi', what: 'action-add', ref: 'BLG-002', from: '', to: '{"finding":"BTL testi yapılmamış","status":"Açık","crit":"Kritik"}' },
  { at: gun(18, 10), who: 'Murat Özkan — Yaptırım Uyumu', what: 'action-edit', ref: 'BLG-003', from: '{"status":"Devam Ediyor"}', to: '{"status":"Kapalı","closedAt":"2025-12-08"}' },
  { at: gun(20, 9),  who: 'Elif Demirtaş — Uyum Görevlisi', what: 'inherent', ref: 'Ürün|Ön ödemeli / anonimlik derecesi yüksek ürünler', from: '2', to: 'Uygulanamaz' },
  { at: gun(22, 13), who: 'Burak Çelik — İç Denetim', what: 'answer', ref: 'D9-02', from: 'Evet', to: 'Kısmen' },
  { at: gun(28, 17), who: 'Elif Demirtaş — Uyum Görevlisi', what: 'action-add', ref: 'BLG-012', from: '', to: '{"finding":"Toplu alert kapatma onay kaydı yok","status":"Devam Ediyor","crit":"Kritik"}' }
];

/* ---------- Önceki dönem referansı ----------
   Karşılaştırma ekranı boş kalmasın: 2024 dönemi, bu dönemden belirgin
   şekilde zayıf. Aynı üretici mantığıyla kurulup özetlenir. */
function oncekiDonem() {
  const p = JSON.parse(JSON.stringify(s));
  p.kunye.donem_baslangic = '2024-01-01';
  p.kunye.donem_bitis = '2024-12-31';
  p.updatedAt = '2025-01-24T10:00:00.000Z';
  // Geçen dönem daha zayıftı: "Evet" yanıtlarının bir kısmı "Kısmen"e çekilir
  let t = 777;
  const r2 = () => { t = (t * 1103515245 + 12345) & 0x7fffffff; return t / 0x7fffffff; };
  DATA.questions.forEach(q => {
    const rec = p.answers[q.id];
    if (!rec) return;
    if (rec.a === 'Evet' && r2() < 0.34) rec.a = 'Kısmen';
    else if (rec.a === 'Kısmen' && r2() < 0.30) rec.a = 'Hayır';
    if (q.qa && rec.qaResult === 'Doğrulandı' && r2() < 0.28) rec.qaResult = 'Kısmen doğrulandı';
  });
  // Doğuştan risk bir tık yüksekti
  Object.keys(p.inherent).forEach(k => { if (p.inherent[k] < 5 && r2() < 0.22) p.inherent[k] += 1; });
  // Bulgular: bu dönem kapananlar o dönem açıktı, iki tanesi de o döneme özgü
  p.actions = s.actions.map(a => Object.assign({}, a, { status: 'Açık', closedAt: '' }))
    .filter(a => ['BLG-001', 'BLG-002', 'BLG-003', 'BLG-005', 'BLG-007', 'BLG-009'].includes(a.id));
  p.actions.push({ id: 'BLG-901', domain: 'D5', finding: 'Periyodik gözden geçirme frekansı risk seviyesine göre farklılaşmıyor.',
    rootCause: 'Politika', crit: 'Yüksek', action: 'Frekans tablosu yayımlandı.', owner: 'Uyum — KYC',
    due: gunEkle(-500), status: 'Kapalı', closedAt: gunEkle(-513), verification: 'Politika revizyonu', residualAfter: 'Düşük' });
  p.actions.push({ id: 'BLG-902', domain: 'D3', finding: 'Yeni ürün onay sürecinde AML değerlendirmesi zorunlu kalem değil.',
    rootCause: 'Süreç', crit: 'Yüksek', action: 'NPA formuna zorunlu alan eklendi.', owner: 'Ürün Yönetimi',
    due: gunEkle(-410), status: 'Kapalı', closedAt: gunEkle(-429), verification: 'Form revizyonu', residualAfter: 'Düşük' });
  return Store.normalize(p);
}

const onceki = oncekiDonem();
s.baseline = Compare.summarize(onceki);
s.baseline.savedAt = onceki.updatedAt;

/* ---------- Yaz ve doğrula ---------- */
const durum = Store.normalize(s);
durum.updatedAt = new Date().toISOString();
durum.ui = { theme: 'light', lang: 'tr', kbdHintSeen: true,
             lastExport: new Date().toISOString(), lastExportSize: 0 };
durum.ui.lastExportSize = Object.keys(durum.answers).length
  + Object.keys(durum.inherent).length + durum.actions.length;

const c = Calc.compute(durum);

const cikti = process.argv[2] || path.join(__dirname, '..', 'demo-calisma-dosyasi.json');
fs.writeFileSync(cikti, JSON.stringify(durum, null, 2) + '\n');

/* ---------- Özet ---------- */
const p1 = v => (v === null ? '—' : (v * 100).toFixed(1) + '%');
const n2 = v => (v === null ? '—' : v.toFixed(2));
console.log(`\nDemo dosyası yazıldı: ${path.relative(process.cwd(), cikti)}  (${Math.round(fs.statSync(cikti).size / 1024)} KB)\n`);
console.log('KURUM                 ', durum.kunye.kurum_unvani, '·', c.kunye.periodLabel);
console.log('Künye                 ', `${c.kunye.filled}/${c.kunye.total} alan dolu, ${c.kunye.warnings.length} uyarı, ${c.kunye.stale.filter(x => x.overdue).length} yaşlanmış tarih`);
console.log('Anket                 ', `${c.totals.answered}/${c.totals.count} yanıt · beyan ${p1(c.totals.effectiveness)} · test ile ${p1(c.totals.effectivenessTested)} · ${c.totals.maturity}`);
console.log('QA güvence            ', `${c.qa2.tested}/${c.qa2.required} test edildi (${p1(c.qa2.coverage)}) · ${c.qa2.conflicts.length} çelişki`);
console.log('Doğuştan risk         ', `${n2(c.inherent.general)}/5 · ${c.inherent.scored}/${c.inherent.applicable} faktör · ${c.inherent.na} N/A · ${c.inherent.missingNotes} gerekçesiz`);
console.log('Boyutlar              ', Calc.DIMS.map(d => `${d.split(' ')[0]} ${n2(c.inherent.dims[d].value)}`).join(' · '));
console.log('PF                    ', `${n2(c.pf.value)}/5 · artık ${n2(c.pfLine.residual)} · iştah ${c.pfLine.appetite}${c.pfLine.breach ? ' · AŞIM' : ''}`);
console.log('İş kolları            ', `${c.lines.active} aktif · pay ${c.lines.shareSum}% · ağırlıklı doğuştan ${n2(c.lines.weightedInherent)}`);
console.log('Genel artık risk      ', `${n2(c.generalResidual)}/5 · en yüksek domain ${c.worstDomain.code} (${n2(c.worstDomain.residual)})`);
console.log('İştah aşımı           ', `${c.breaches} alan: ${c.residual.filter(r => r.breach).map(r => r.code).join(', ')}${c.pfLine.breach ? ', PF' : ''}`);
console.log('Açık kritik kontrol   ', c.totals.openCritical, '· aksiyon gerektiren', c.totals.actionsNeeded);
console.log('Ek kontroller         ', `${c.extra.activeSets}/${c.extra.totalSets} set geçerli · ${c.extra.totals.answered}/${c.extra.totals.count} yanıt · ${p1(c.extra.totals.effectivenessTested)}`);
console.log('Portföy               ', `${c.portfolio.total.toLocaleString('tr-TR')} müşteri · yüksek riskli ${p1(c.portfolio.highRiskShare)} · ${c.portfolio.countries.count} ülke (${c.portfolio.countries.flagged} işaretli) · ${c.portfolio.branches.count} birim`);
console.log('Portföy uyarısı       ', c.portfolio.warnings.length ? c.portfolio.warnings.join(' | ') : 'yok');
console.log('Operasyon             ', `${c.operations.filled}/${c.operations.total} ölçüt dolu · ${Object.keys(c.operations.kpi).length} KPI otomatik · ${Object.keys(c.operations.hints).length} skor önerisi`);
console.log('Operasyon uyarısı     ', c.operations.warnings.length ? c.operations.warnings.join(' | ') : 'yok');
console.log('QA örneklem           ', `yıllık ${c.qaTotals.yearlySample.toLocaleString('tr-TR')} · test başına ${c.qaTotals.perTest.toLocaleString('tr-TR')}`);
console.log('Bulgular              ', `${c.actionStats.total} toplam · ${c.actionStats.open} açık · ${c.actionStats.overdue} gecikmiş · ${c.actionStats.critical} kritik açık · kapanış ${p1(c.actionStats.closureRate)}`);
console.log('Değişiklik günlüğü    ', durum.log.length, 'kayıt');
console.log('Referans dönem        ', `${s.baseline.period} · etkinlik ${p1(s.baseline.totals.effectivenessTested)} · artık ${n2(s.baseline.generalResidual)} · ${s.baseline.breaches} aşım`);
console.log('İmza                  ', Object.keys(durum.signoff).length, 'satır dolu');
console.log('');
