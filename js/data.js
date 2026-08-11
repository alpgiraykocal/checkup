// AML/CFT Uyum Check-up — veri katmanı. Kaynak: AML_Uyum_Checkup_Anket_QA_Aksiyon.xlsx
const DATA = {
 "kunyeFields": [
  {
   "id": "kurum_unvani",
   "label": "Kurum unvanı",
   "hint": ""
  },
  {
   "id": "yukumlu_tipi",
   "label": "Yükümlü tipi",
   "hint": "Banka / katılım bankası / aracı kurum / e-para / ödeme kuruluşu / sigorta / VASP / diğer"
  },
  {
   "id": "faaliyet_gosterilen_ulkeler",
   "label": "Faaliyet gösterilen ülkeler",
   "hint": "Şube ve iştirak dahil"
  },
  {
   "id": "lisanslar",
   "label": "Lisanslar",
   "hint": ""
  },
  {
   "id": "degerlendirme_donemi",
   "label": "Değerlendirme dönemi",
   "hint": "Ör. 01.01.2026 - 31.12.2026"
  },
  {
   "id": "degerlendirmeyi_yapan",
   "label": "Değerlendirmeyi yapan",
   "hint": "Öz değerlendirme / bağımsız inceleme"
  },
  {
   "id": "uyum_gorevlisi",
   "label": "Uyum görevlisi",
   "hint": ""
  },
  {
   "id": "toplam_musteri_sayisi",
   "label": "Toplam müşteri sayısı",
   "hint": ""
  },
  {
   "id": "yuksek_riskli_musteri_sayisi",
   "label": "Yüksek riskli müşteri sayısı",
   "hint": "Risk derecelendirme çıktısına göre"
  },
  {
   "id": "pep_musteri_sayisi",
   "label": "PEP müşteri sayısı",
   "hint": ""
  },
  {
   "id": "yillik_islem_adedi",
   "label": "Yıllık işlem adedi",
   "hint": ""
  },
  {
   "id": "yillik_sinir_otesi_islem_adedi",
   "label": "Yıllık sınır ötesi işlem adedi",
   "hint": ""
  },
  {
   "id": "uyum_birimi_kadrosu_fte",
   "label": "Uyum birimi kadrosu (FTE)",
   "hint": ""
  },
  {
   "id": "i_zleme_sistemi",
   "label": "İzleme sistemi",
   "hint": "Ürün adı ve sürümü"
  },
  {
   "id": "yaptirim_tarama_sistemi",
   "label": "Yaptırım tarama sistemi",
   "hint": "Ürün adı ve sürümü"
  },
  {
   "id": "trade_finance_faaliyeti_var_mi",
   "label": "Trade finance faaliyeti var mı?",
   "hint": "Hayır ise D6 trade finance soruları 'Uygulanamaz'"
  },
  {
   "id": "muhabir_bankacilik_var_mi",
   "label": "Muhabir bankacılık var mı?",
   "hint": "Hayır ise D2 muhabir soruları 'Uygulanamaz'"
  },
  {
   "id": "sanal_varlik_faaliyeti_var_mi",
   "label": "Sanal varlık faaliyeti var mı?",
   "hint": "Hayır ise D3 sanal varlık soruları 'Uygulanamaz'"
  },
  {
   "id": "uzaktan_musteri_kabulu_var_mi",
   "label": "Uzaktan müşteri kabulü var mı?",
   "hint": "Hayır ise D3 dijital kanal soruları 'Uygulanamaz'"
  },
  {
   "id": "acente_temsilci_agi_var_mi",
   "label": "Acente/temsilci ağı var mı?",
   "hint": "Hayır ise ilgili sorular 'Uygulanamaz'"
  },
  {
   "id": "yurt_disi_sube_istirak_var_mi",
   "label": "Yurt dışı şube/iştirak var mı?",
   "hint": "Hayır ise grup düzeyi soruları 'Uygulanamaz'"
  },
  {
   "id": "son_bagimsiz_aml_denetimi_tarihi",
   "label": "Son bağımsız AML denetimi tarihi",
   "hint": ""
  },
  {
   "id": "son_ewra_tarihi",
   "label": "Son EWRA tarihi",
   "hint": ""
  },
  {
   "id": "son_senaryo_tuning_tarihi",
   "label": "Son senaryo tuning tarihi",
   "hint": ""
  },
  {
   "id": "son_tarama_esigi_kalibrasyon_tarihi",
   "label": "Son tarama eşiği kalibrasyon tarihi",
   "hint": ""
  }
 ],
 "yesNoFields": [
  "trade_finance_faaliyeti_var_mi",
  "muhabir_bankacilik_var_mi",
  "sanal_varlik_faaliyeti_var_mi",
  "uzaktan_musteri_kabulu_var_mi",
  "acente_temsilci_agi_var_mi",
  "yurt_disi_sube_istirak_var_mi"
 ],
 "inherentFactors": [
  {
   "dim": "Müşteri",
   "factor": "Yüksek riskli müşteri segmentlerinin payı",
   "weight": 3.0,
   "key": "Müşteri|Yüksek riskli müşteri segmentlerinin payı",
   "why": "Yüksek riskli olarak derecelendirilmiş müşterilerin toplam müşteri tabanına oranı.",
   "anchors": [
    "Yüksek riskli müşteri payı %1'in altında",
    "%1–3; segmentler tanımlı ve dar",
    "%3–7; birden çok yüksek riskli segment",
    "%7–15; yüksek riskli segmentler iş modelinin parçası",
    "%15'in üzerinde veya segment sınıflandırması güvenilir değil"
   ],
   "hint": {
    "num": "yuksek_riskli_musteri_sayisi",
    "den": "toplam_musteri_sayisi",
    "bands": [
     1,
     3,
     7,
     15
    ],
    "label": "Yüksek riskli müşteri payı"
   }
  },
  {
   "dim": "Müşteri",
   "factor": "PEP ve ilişkili kişi maruziyeti",
   "weight": 3.0,
   "key": "Müşteri|PEP ve ilişkili kişi maruziyeti",
   "why": "PEP, aile üyeleri ve yakın çevrenin müşteri tabanındaki ağırlığı ve türü.",
   "anchors": [
    "PEP yok veya %0,1'in altında",
    "%0,5'in altında, ağırlıklı olarak yerli PEP",
    "%0,5–1 veya yabancı PEP ilişkisi mevcut",
    "%1–3 veya yüksek riskli ülke PEP'leri",
    "%3'ün üzerinde ya da sistematik PEP / yakın çevre işi"
   ],
   "hint": {
    "num": "pep_musteri_sayisi",
    "den": "toplam_musteri_sayisi",
    "bands": [
     0.1,
     0.5,
     1,
     3
    ],
    "label": "PEP müşteri payı"
   }
  },
  {
   "dim": "Müşteri",
   "factor": "Nakit yoğun sektör müşterilerinin payı",
   "weight": 2.0,
   "key": "Müşteri|Nakit yoğun sektör müşterilerinin payı",
   "why": "Akaryakıt, döviz, kuyum, restoran, şans oyunları gibi nakit yoğun sektör müşterilerinin payı.",
   "anchors": [
    "%2'nin altında",
    "%2–5",
    "%5–12",
    "%12–25",
    "%25'in üzerinde"
   ]
  },
  {
   "dim": "Müşteri",
   "factor": "Karmaşık sahiplik yapılı tüzel kişi oranı",
   "weight": 3.0,
   "key": "Müşteri|Karmaşık sahiplik yapılı tüzel kişi oranı",
   "why": "Çok katmanlı, sınır ötesi veya hamiline benzeri yapılarla gerçek faydalanıcıya ulaşmanın zorlaştığı tüzel kişiler.",
   "anchors": [
    "Tüzel kişi müşteri yok denecek kadar az veya tamamı tek katmanlı",
    "Çok katmanlı yapı %5'in altında",
    "%5–15; bazı yapılar iki-üç katmanlı",
    "%15–30 veya offshore katman içeren yapılar",
    "%30'un üzerinde ya da gerçek faydalanıcı düzenli olarak üç ve üzeri katman ardında"
   ]
  },
  {
   "dim": "Müşteri",
   "factor": "Yerleşik olmayan (non-resident) müşteri oranı",
   "weight": 2.0,
   "key": "Müşteri|Yerleşik olmayan (non-resident) müşteri oranı",
   "why": "Türkiye'de yerleşik olmayan gerçek ve tüzel kişi müşterilerin payı.",
   "anchors": [
    "%1'in altında",
    "%1–5",
    "%5–15",
    "%15–30",
    "%30'un üzerinde"
   ]
  },
  {
   "dim": "Coğrafya ve Yaptırım",
   "factor": "FATF gri/kara liste ülkeleriyle iş hacmi",
   "weight": 3.0,
   "key": "Coğrafya ve Yaptırım|FATF gri/kara liste ülkeleriyle iş hacmi",
   "why": "FATF artırılmış izleme (gri) ve eylem çağrısı (kara) listesindeki ülkelerle iş hacmi.",
   "anchors": [
    "İlişki yok",
    "%1'in altında ve yalnızca gri liste",
    "%1–5 gri liste ülkeleriyle düzenli iş",
    "%5–10 veya kara liste ülkesiyle teması olan akışlar",
    "%10'un üzerinde ya da kara liste ülkeleriyle düzenli iş"
   ]
  },
  {
   "dim": "Coğrafya ve Yaptırım",
   "factor": "Yaptırım rejimi altındaki ülkelere komşuluk/ticaret",
   "weight": 3.0,
   "key": "Coğrafya ve Yaptırım|Yaptırım rejimi altındaki ülkelere komşuluk/ticaret",
   "why": "Yaptırım rejimi altındaki ülkelere coğrafi yakınlık, transit ve ticaret bağı.",
   "anchors": [
    "Coğrafi veya ticari bağ yok",
    "Dolaylı ve nadir temas",
    "Komşuluk var, ticaret sınırlı",
    "Düzenli ticaret veya belirgin transit riski",
    "Yoğun ticaret ve bilinen yaptırım kaçınma koridorunda faaliyet"
   ]
  },
  {
   "dim": "Coğrafya ve Yaptırım",
   "factor": "Offshore ve vergi cenneti bağlantılı müşteri hacmi",
   "weight": 2.0,
   "key": "Coğrafya ve Yaptırım|Offshore ve vergi cenneti bağlantılı müşteri hacmi",
   "why": "Offshore finans merkezleri ve düşük vergi/şeffaflık rejimleriyle bağlantılı müşteri ve akış hacmi.",
   "anchors": [
    "Bağlantı yok",
    "%1'in altında",
    "%1–5",
    "%5–10",
    "%10'un üzerinde"
   ]
  },
  {
   "dim": "Coğrafya ve Yaptırım",
   "factor": "Muhabir bankacılık ağının coğrafi riski",
   "weight": 3.0,
   "key": "Coğrafya ve Yaptırım|Muhabir bankacılık ağının coğrafi riski",
   "why": "Muhabir ilişkilerinin bulunduğu ülkelerin risk profili ve nested erişim ihtimali.",
   "anchors": [
    "Muhabir bankacılık faaliyeti yok",
    "Yalnızca düşük riskli ülkelerde, sınırlı sayıda ilişki",
    "Karışık coğrafya; yüksek riskli ülke ağırlığı düşük",
    "Yüksek riskli ülkelerde muhabir ilişkileri mevcut",
    "Nested / payable-through ilişki veya denetimi zayıf ülkeler ağırlıkta"
   ],
   "scope": {
    "field": "muhabir_bankacilik_var_mi",
    "reason": "Muhabir bankacılık yok"
   }
  },
  {
   "dim": "Coğrafya ve Yaptırım",
   "factor": "Sınır ötesi transfer hacminin toplam içindeki payı",
   "weight": 2.0,
   "key": "Coğrafya ve Yaptırım|Sınır ötesi transfer hacminin toplam içindeki payı",
   "why": "Sınır ötesi transferlerin toplam işlem hacmi içindeki payı.",
   "anchors": [
    "%5'in altında",
    "%5–15",
    "%15–30",
    "%30–50",
    "%50'nin üzerinde"
   ],
   "hint": {
    "num": "yillik_sinir_otesi_islem_adedi",
    "den": "yillik_islem_adedi",
    "bands": [
     5,
     15,
     30,
     50
    ],
    "label": "Sınır ötesi işlem payı"
   }
  },
  {
   "dim": "Ürün",
   "factor": "Nakit yoğun ürünlerin payı",
   "weight": 3.0,
   "key": "Ürün|Nakit yoğun ürünlerin payı",
   "why": "Nakit yatırma, çekme ve nakit karşılığı işlemlerin ürün portföyündeki ağırlığı.",
   "anchors": [
    "%2'nin altında",
    "%2–10",
    "%10–25",
    "%25–40",
    "%40'ın üzerinde"
   ]
  },
  {
   "dim": "Ürün",
   "factor": "Ön ödemeli / anonimlik derecesi yüksek ürünler",
   "weight": 3.0,
   "key": "Ürün|Ön ödemeli / anonimlik derecesi yüksek ürünler",
   "why": "Ön ödemeli kart, e-para ve anonimlik derecesi yüksek ürünlerin varlığı ve limitleri.",
   "anchors": [
    "Bu tür ürün yok",
    "Yalnızca kayıtlı, düşük limitli ürünler",
    "Kayıtlı ürünler, orta seviye limitler",
    "Anonim yükleme mümkün veya limitler yüksek",
    "Anonim kullanım, yüksek limit ve sınır ötesi kabul bir arada"
   ]
  },
  {
   "dim": "Ürün",
   "factor": "Trade finance ürün hacmi",
   "weight": 2.0,
   "key": "Ürün|Trade finance ürün hacmi",
   "why": "Akreditif, tahsilat, garanti ve diğer dış ticaret finansmanı ürünlerinin hacmi ve mal/koridor riski.",
   "anchors": [
    "Trade finance faaliyeti yok",
    "%2'nin altında",
    "%2–10",
    "%10–20",
    "%20'nin üzerinde veya çift kullanımlı mal / yüksek riskli koridor yoğun"
   ],
   "scope": {
    "field": "trade_finance_faaliyeti_var_mi",
    "reason": "Trade finance faaliyeti yok"
   }
  },
  {
   "dim": "Ürün",
   "factor": "Sanal varlık ürün ve hizmetleri",
   "weight": 3.0,
   "key": "Ürün|Sanal varlık ürün ve hizmetleri",
   "why": "Sanal varlık hizmet sağlayıcılarıyla ilişki veya doğrudan sanal varlık hizmeti sunumu.",
   "anchors": [
    "Sanal varlık teması yok",
    "Yalnızca sınırlı sayıda VASP müşteri ilişkisi",
    "VASP ilişkileri düzenli ve hacimli",
    "Doğrudan sanal varlık hizmeti sunuluyor",
    "Unhosted cüzdan veya anonimlik artırıcı hizmetlerle etkileşim var"
   ],
   "scope": {
    "field": "sanal_varlik_faaliyeti_var_mi",
    "reason": "Sanal varlık faaliyeti yok"
   }
  },
  {
   "dim": "Ürün",
   "factor": "Özel bankacılık / servet yönetimi hacmi",
   "weight": 2.0,
   "key": "Ürün|Özel bankacılık / servet yönetimi hacmi",
   "why": "Özel bankacılık ve servet yönetimi portföyünün büyüklüğü ve sınır ötesi bileşeni.",
   "anchors": [
    "Bu hizmet sunulmuyor",
    "%2'nin altında",
    "%2–10",
    "%10–20",
    "%20'nin üzerinde veya ağırlıklı olarak sınır ötesi servet yönetimi"
   ]
  },
  {
   "dim": "Kanal",
   "factor": "Uzaktan (yüz yüze olmayan) müşteri kabul oranı",
   "weight": 3.0,
   "key": "Kanal|Uzaktan (yüz yüze olmayan) müşteri kabul oranı",
   "why": "Yüz yüze olmayan yöntemlerle açılan hesapların payı ve doğrulama gücü.",
   "anchors": [
    "Uzaktan müşteri kabulü yok",
    "%10'un altında; canlılık ve belge doğrulama güçlü",
    "%10–35",
    "%35–70",
    "%70'in üzerinde veya doğrulama kontrolleri zayıf"
   ],
   "scope": {
    "field": "uzaktan_musteri_kabulu_var_mi",
    "reason": "Uzaktan müşteri kabulü yok"
   }
  },
  {
   "dim": "Kanal",
   "factor": "Acente ve temsilci kanalı payı",
   "weight": 2.0,
   "key": "Kanal|Acente ve temsilci kanalı payı",
   "why": "Acente, temsilci ve dış hizmet kanalı üzerinden gerçekleşen müşteri kabulü ve işlem payı.",
   "anchors": [
    "Acente / temsilci ağı yok",
    "%5'in altında ve yakın gözetim altında",
    "%5–20",
    "%20–40",
    "%40'ın üzerinde veya kanal gözetimi zayıf"
   ],
   "scope": {
    "field": "acente_temsilci_agi_var_mi",
    "reason": "Acente / temsilci ağı yok"
   }
  },
  {
   "dim": "Kanal",
   "factor": "Üçüncü taraf / açık bankacılık entegrasyonları",
   "weight": 2.0,
   "key": "Kanal|Üçüncü taraf / açık bankacılık entegrasyonları",
   "why": "API, açık bankacılık ve üçüncü taraf sağlayıcı entegrasyonlarının sayısı ve kontrol düzeyi.",
   "anchors": [
    "Entegrasyon yok",
    "Bir-iki entegrasyon; sözleşmesel ve teknik kontrol güçlü",
    "Birden çok entegrasyon; kontroller tanımlı",
    "Çok sayıda entegrasyon veya veri sahipliği belirsiz",
    "Kontrolsüz API erişimi; müşteri kaynağı izlenemiyor"
   ]
  },
  {
   "dim": "Kanal",
   "factor": "Gözetimsiz kanallar (ATM, kiosk) işlem payı",
   "weight": 2.0,
   "key": "Kanal|Gözetimsiz kanallar (ATM, kiosk) işlem payı",
   "why": "ATM, kiosk ve benzeri personelsiz kanallardan geçen işlem payı.",
   "anchors": [
    "%2'nin altında",
    "%2–10",
    "%10–25",
    "%25–40",
    "%40'ın üzerinde"
   ]
  },
  {
   "dim": "Kanal",
   "factor": "Aracı kurum / muhabir üzerinden dolaylı erişim",
   "weight": 2.0,
   "key": "Kanal|Aracı kurum / muhabir üzerinden dolaylı erişim",
   "why": "Kurumun sistemlerine üçüncü kurumların müşterileri üzerinden dolaylı erişim ihtimali.",
   "anchors": [
    "Dolaylı erişim yok",
    "Sınırlı ve tarafları bilinen dolaylı erişim",
    "Orta düzeyde dolaylı erişim",
    "Nested erişim ihtimali var, tespit kontrolleri kısmi",
    "Nested / downstream ilişki tespit edilmiş"
   ]
  },
  {
   "dim": "İşlem",
   "factor": "Yıllık işlem hacmi ve büyüme hızı",
   "weight": 3.0,
   "key": "İşlem|Yıllık işlem hacmi ve büyüme hızı",
   "why": "İşlem hacminin büyüklüğü ve büyüme hızının kontrol kapasitesiyle uyumu.",
   "anchors": [
    "Düşük hacim, durağan",
    "Düşük-orta hacim, yıllık büyüme %10'un altında",
    "Orta hacim, büyüme %10–25",
    "Yüksek hacim veya büyüme %25–50",
    "Çok yüksek hacim ya da %50'nin üzerinde, kontrol kapasitesini aşan büyüme"
   ]
  },
  {
   "dim": "İşlem",
   "factor": "Sınır ötesi elektronik transfer yoğunluğu",
   "weight": 3.0,
   "key": "İşlem|Sınır ötesi elektronik transfer yoğunluğu",
   "why": "Sınır ötesi elektronik transferlerin işlem adedi içindeki payı.",
   "anchors": [
    "%5'in altında",
    "%5–15",
    "%15–30",
    "%30–50",
    "%50'nin üzerinde"
   ],
   "hint": {
    "num": "yillik_sinir_otesi_islem_adedi",
    "den": "yillik_islem_adedi",
    "bands": [
     5,
     15,
     30,
     50
    ],
    "label": "Sınır ötesi işlem payı"
   }
  },
  {
   "dim": "İşlem",
   "factor": "Nakit işlem hacmi",
   "weight": 3.0,
   "key": "İşlem|Nakit işlem hacmi",
   "why": "Nakit işlemlerin toplam işlem hacmi içindeki payı.",
   "anchors": [
    "%2'nin altında",
    "%2–10",
    "%10–20",
    "%20–35",
    "%35'in üzerinde"
   ]
  },
  {
   "dim": "İşlem",
   "factor": "İşlem hızının kontrol süresine oranı (gerçek zamanlı ürünler)",
   "weight": 2.0,
   "key": "İşlem|İşlem hızının kontrol süresine oranı (gerçek zamanlı ürünler)",
   "why": "İşlemin tamamlanma hızının, kontrolün devreye girme süresine göre bıraktığı açık.",
   "anchors": [
    "Tüm işlemler işlem öncesi kontrol edilebiliyor",
    "İşlemlerin çoğunda işlem öncesi kontrol mümkün",
    "Gerçek zamanlı ürünler var; kontrol kısmen işlem öncesi",
    "Ağırlıklı olarak gerçek zamanlı; kontrol işlem sonrası",
    "Anlık ve 7/24 ürünler; kontrol yalnızca işlem sonrası"
   ]
  },
  {
   "dim": "İşlem",
   "factor": "Eşik altı işlem yoğunluğu",
   "weight": 2.0,
   "key": "İşlem|Eşik altı işlem yoğunluğu",
   "why": "Bildirim ve kimlik tespiti eşiklerinin hemen altında yoğunlaşan işlem örüntüsü.",
   "anchors": [
    "Eşik altı yoğunlaşma gözlenmiyor",
    "Hafif yoğunlaşma; açıklanabilir",
    "Gözlenebilir yoğunlaşma var",
    "Belirgin yoğunlaşma; structuring sinyali",
    "Sistematik eşik altı örüntü tespit edilmiş"
   ]
  }
 ],
 "questions": [
  {
   "id": "D1-01",
   "domain": "D1",
   "domainName": "Yönetişim ve Uyum Programı",
   "section": "Uyum Görevlisi",
   "text": "Uyum görevlisi ve vekili mevzuata uygun şekilde atandı ve MASAK'a bildirildi mi?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Atama kararı, MASAK bildirim yazısı",
   "source": "MASAK Uyum Programı Yön. m.16-18",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D1-02",
   "domain": "D1",
   "domainName": "Yönetişim ve Uyum Programı",
   "section": "Uyum Görevlisi",
   "text": "Uyum görevlisi yönetim kuruluna doğrudan raporlama hattına sahip mi?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Organizasyon şeması, görev tanımı",
   "source": "FATF R.18; Uyum Programı Yön. m.17",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D1-03",
   "domain": "D1",
   "domainName": "Yönetişim ve Uyum Programı",
   "section": "Uyum Görevlisi",
   "text": "Uyum görevlisinin görevden alınması yönetim kurulu kararına ve MASAK bildirimine bağlı mı?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Prosedür metni",
   "source": "Uyum Programı Yön. m.18",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D1-04",
   "domain": "D1",
   "domainName": "Yönetişim ve Uyum Programı",
   "section": "Uyum Görevlisi",
   "text": "Uyum görevlisi, çıkar çatışması yaratabilecek iş birimi görevlerinden bağımsız mı?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Görev tanımı, ikincil görev listesi",
   "source": "FATF R.18; Basel AML/CFT Guidelines",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D1-05",
   "domain": "D1",
   "domainName": "Yönetişim ve Uyum Programı",
   "section": "Uyum Görevlisi",
   "text": "Uyum görevlisi tüm müşteri, işlem ve sistem verilerine sınırsız erişim yetkisine sahip mi?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Yetki matrisi",
   "source": "Uyum Programı Yön. m.17",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D1-06",
   "domain": "D1",
   "domainName": "Yönetişim ve Uyum Programı",
   "section": "Kaynak ve Organizasyon",
   "text": "Uyum biriminin bütçesi ve kadrosu yönetim kurulunca yıllık olarak onaylanıyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "YK kararı, bütçe onayı",
   "source": "Basel AML Guidelines, prensip 3",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D1-07",
   "domain": "D1",
   "domainName": "Yönetişim ve Uyum Programı",
   "section": "Kaynak ve Organizasyon",
   "text": "Uyum kadrosu (FTE) müşteri/alert hacmine dayalı bir kapasite analizine dayandırıldı mı?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Kapasite analizi dokümanı",
   "source": "Wolfsberg Effectiveness Statement",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D1-08",
   "domain": "D1",
   "domainName": "Yönetişim ve Uyum Programı",
   "section": "Kaynak ve Organizasyon",
   "text": "Kilit uyum rolleri için yedekleme ve iş sürekliliği planı var mı?",
   "weight": 3,
   "crit": "Orta",
   "evidence": "Süreklilik planı",
   "source": "Basel AML Guidelines",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D1-09",
   "domain": "D1",
   "domainName": "Yönetişim ve Uyum Programı",
   "section": "Uyum Programı",
   "text": "Uyum programı; politika, risk yönetimi, izleme-kontrol, eğitim ve iç denetim bileşenlerinin tamamını kapsıyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Uyum programı dokümanı",
   "source": "Uyum Programı Yön. m.4",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D1-10",
   "domain": "D1",
   "domainName": "Yönetişim ve Uyum Programı",
   "section": "Politika ve Prosedür",
   "text": "AML/CFT politikası yönetim kurulunca onaylandı ve son 12 ayda gözden geçirildi mi?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Onaylı politika, revizyon tarihi",
   "source": "Uyum Programı Yön. m.5-6",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D1-11",
   "domain": "D1",
   "domainName": "Yönetişim ve Uyum Programı",
   "section": "Politika ve Prosedür",
   "text": "Prosedürler politika ile eşleşen bir sürüm kontrolü ve sahiplik kaydına tabi mi?",
   "weight": 3,
   "crit": "Orta",
   "evidence": "Doküman yönetim kaydı",
   "source": "İç kontrol standardı",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D1-12",
   "domain": "D1",
   "domainName": "Yönetişim ve Uyum Programı",
   "section": "Politika ve Prosedür",
   "text": "Grup düzeyinde (yurt dışı şube/iştirak) tutarlı bir AML politikası uygulanıyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Grup politikası, yerel eklentiler",
   "source": "FATF R.18; AMLR 2024/1624",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D1-13",
   "domain": "D1",
   "domainName": "Yönetişim ve Uyum Programı",
   "section": "Politika ve Prosedür",
   "text": "Yerel mevzuatın grup politikasıyla çatıştığı durumlar için eskalasyon prosedürü var mı?",
   "weight": 3,
   "crit": "Orta",
   "evidence": "Prosedür, çatışma kaydı",
   "source": "FATF R.18 IN",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D1-14",
   "domain": "D1",
   "domainName": "Yönetişim ve Uyum Programı",
   "section": "Bağımsız Denetim",
   "text": "AML/CFT iç denetimi yıllık denetim planına dahil mi ve birinci/ikinci hattan bağımsız mı?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Denetim planı, denetim raporu",
   "source": "FATF R.18; IIA Üç Savunma Hattı",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D1-15",
   "domain": "D1",
   "domainName": "Yönetişim ve Uyum Programı",
   "section": "Bağımsız Denetim",
   "text": "İç denetim bulguları için kapanış takibi ve bağımsız yeniden test (re-test) yapılıyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Bulgu takip listesi, re-test kaydı",
   "source": "IIA / iç kontrol standardı",
   "qa": true,
   "pop": "Son 24 ayda kapatılan denetim bulguları"
  },
  {
   "id": "D1-16",
   "domain": "D1",
   "domainName": "Yönetişim ve Uyum Programı",
   "section": "Değişiklik Yönetimi",
   "text": "Yeni ürün, hizmet, kanal ve teknolojiler devreye alınmadan önce AML risk onayı (NPA) alınıyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "NPA formu, onay kaydı",
   "source": "FATF R.15",
   "qa": true,
   "pop": "Son 12 ayda onaylanan yeni ürünler"
  },
  {
   "id": "D1-17",
   "domain": "D1",
   "domainName": "Yönetişim ve Uyum Programı",
   "section": "Dış Hizmet ve Acente",
   "text": "Dış hizmet, acente ve temsilci ilişkilerinde AML sorumlulukları sözleşmeye bağlandı mı?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Sözleşme örnekleri",
   "source": "FATF R.14, R.17",
   "qa": true,
   "pop": "Aktif acente/dış hizmet sözleşmeleri"
  },
  {
   "id": "D1-18",
   "domain": "D1",
   "domainName": "Yönetişim ve Uyum Programı",
   "section": "Dış Hizmet ve Acente",
   "text": "Üçüncü tarafça yapılan müşteri tanıma işlemlerinde belgeler gecikmesiz temin edilebiliyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Belge talep-yanıt kaydı",
   "source": "FATF R.17",
   "qa": true,
   "pop": "Üçüncü taraf üzerinden açılan hesaplar"
  },
  {
   "id": "D1-19",
   "domain": "D1",
   "domainName": "Yönetişim ve Uyum Programı",
   "section": "Kültür ve Sorumluluk",
   "text": "Uyum ihlallerine ilişkin disiplin ve sonuç yönetimi (consequence management) tanımlı mı?",
   "weight": 3,
   "crit": "Orta",
   "evidence": "Disiplin yönetmeliği, uygulanan vakalar",
   "source": "Wolfsberg Culture Statement",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D1-20",
   "domain": "D1",
   "domainName": "Yönetişim ve Uyum Programı",
   "section": "Kültür ve Sorumluluk",
   "text": "Misilleme koruması sağlayan bir ihbar (whistleblowing) kanalı mevcut mu?",
   "weight": 3,
   "crit": "Orta",
   "evidence": "Kanal tanımı, kullanım istatistiği",
   "source": "AMLD/AMLR; FATF R.21",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D2-01",
   "domain": "D2",
   "domainName": "Müşteri Profili ve Coğrafi Risk",
   "section": "Müşteri Tabanı",
   "text": "Müşteri tabanının risk seviyesine göre dağılımı düzenli olarak raporlanıyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Risk dağılım raporu",
   "source": "FATF R.1",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D2-02",
   "domain": "D2",
   "domainName": "Müşteri Profili ve Coğrafi Risk",
   "section": "Müşteri Tabanı",
   "text": "Yüksek riskli müşteri oranındaki değişimler üst yönetime periyodik olarak sunuluyor mu?",
   "weight": 3,
   "crit": "Orta",
   "evidence": "Yönetim raporu",
   "source": "Basel AML Guidelines",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D2-03",
   "domain": "D2",
   "domainName": "Müşteri Profili ve Coğrafi Risk",
   "section": "Müşteri Tabanı",
   "text": "Tüzel kişi müşterilerde faaliyet sektörü (NACE/MCC) risk skorlamasına giriyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Risk modeli dokümanı",
   "source": "FATF R.1; EBA ML/TF Risk Factors GL",
   "qa": true,
   "pop": "Yeni açılan tüzel kişi hesapları"
  },
  {
   "id": "D2-04",
   "domain": "D2",
   "domainName": "Müşteri Profili ve Coğrafi Risk",
   "section": "Müşteri Tabanı",
   "text": "Nakit yoğun sektör müşterileri ayrı bir portföy olarak izleniyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Portföy tanımı, izleme senaryosu",
   "source": "FATF tipoloji raporları",
   "qa": true,
   "pop": "Nakit yoğun sektör müşterileri"
  },
  {
   "id": "D2-05",
   "domain": "D2",
   "domainName": "Müşteri Profili ve Coğrafi Risk",
   "section": "PEP",
   "text": "PEP envanteri güncel tutuluyor; yerli, yabancı ve uluslararası kuruluş PEP ayrımı yapılıyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "PEP listesi, sınıflandırma kuralı",
   "source": "FATF R.12; Tedbirler Yön. m.19",
   "qa": true,
   "pop": "PEP müşteriler"
  },
  {
   "id": "D2-06",
   "domain": "D2",
   "domainName": "Müşteri Profili ve Coğrafi Risk",
   "section": "PEP",
   "text": "PEP'lerin aile üyeleri ve yakın iş ilişkisi içindeki kişiler (RCA) tespit ediliyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Tespit yöntemi, örnek dosya",
   "source": "FATF R.12 IN",
   "qa": true,
   "pop": "PEP müşteriler"
  },
  {
   "id": "D2-07",
   "domain": "D2",
   "domainName": "Müşteri Profili ve Coğrafi Risk",
   "section": "PEP",
   "text": "PEP ilişkisinin kurulması ve sürdürülmesi üst düzey yönetici onayına tabi mi?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Onay kayıtları",
   "source": "FATF R.12",
   "qa": true,
   "pop": "Son 12 ayda açılan PEP hesapları"
  },
  {
   "id": "D2-08",
   "domain": "D2",
   "domainName": "Müşteri Profili ve Coğrafi Risk",
   "section": "Coğrafi Risk",
   "text": "Yüksek riskli ülke listesi FATF kara/gri liste, AB yüksek riskli üçüncü ülkeler ve kurum içi kriterlerle oluşturuluyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Ülke risk metodolojisi",
   "source": "FATF R.19; AB Delege Tüzükleri",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D2-09",
   "domain": "D2",
   "domainName": "Müşteri Profili ve Coğrafi Risk",
   "section": "Coğrafi Risk",
   "text": "Ülke risk metodolojisi yolsuzluk, TF, yaptırım, vergi cenneti ve uyuşturucu göstergelerini içeriyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Metodoloji dokümanı, gösterge kaynakları",
   "source": "Basel AML Index, TI CPI",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D2-10",
   "domain": "D2",
   "domainName": "Müşteri Profili ve Coğrafi Risk",
   "section": "Coğrafi Risk",
   "text": "Ülke risk skorları en az yılda bir ve liste değişikliklerinde güncelleniyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Güncelleme kaydı",
   "source": "FATF Plenary takvimi",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D2-11",
   "domain": "D2",
   "domainName": "Müşteri Profili ve Coğrafi Risk",
   "section": "Coğrafi Risk",
   "text": "Müşterinin uyruğu, ikametgahı, işlem coğrafyası ve fon kaynağı ülkesi ayrı ayrı değerlendiriliyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Risk modeli alanları",
   "source": "EBA ML/TF Risk Factors GL",
   "qa": true,
   "pop": "Sınır ötesi işlem yapan müşteriler"
  },
  {
   "id": "D2-12",
   "domain": "D2",
   "domainName": "Müşteri Profili ve Coğrafi Risk",
   "section": "Coğrafi Risk",
   "text": "Yüksek riskli ülkelerle ilişkili müşteri ve işlemlerde EDD otomatik olarak tetikleniyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Sistem kuralı, örnek dosya",
   "source": "FATF R.19",
   "qa": true,
   "pop": "Yüksek riskli ülke bağlantılı müşteriler"
  },
  {
   "id": "D2-13",
   "domain": "D2",
   "domainName": "Müşteri Profili ve Coğrafi Risk",
   "section": "Muhabir Bankacılık",
   "text": "Muhabir banka ilişkilerinde due diligence anketi (ör. Wolfsberg CBDDQ) alınıyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Tamamlanmış CBDDQ dosyaları",
   "source": "FATF R.13; Wolfsberg CBDDQ",
   "qa": true,
   "pop": "Aktif muhabir ilişkileri"
  },
  {
   "id": "D2-14",
   "domain": "D2",
   "domainName": "Müşteri Profili ve Coğrafi Risk",
   "section": "Muhabir Bankacılık",
   "text": "Muhabir ilişkilerin kurulması üst yönetim onayına tabi mi?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Onay kayıtları",
   "source": "FATF R.13",
   "qa": true,
   "pop": "Son 24 ayda kurulan muhabir ilişkileri"
  },
  {
   "id": "D2-15",
   "domain": "D2",
   "domainName": "Müşteri Profili ve Coğrafi Risk",
   "section": "Muhabir Bankacılık",
   "text": "İç içe (nested) muhabir ilişkileri ve payable-through hesaplar tespit ediliyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Tespit yöntemi, tespit edilen vakalar",
   "source": "FATF R.13 IN",
   "qa": true,
   "pop": "Muhabir işlem akışları"
  },
  {
   "id": "D2-16",
   "domain": "D2",
   "domainName": "Müşteri Profili ve Coğrafi Risk",
   "section": "Muhabir Bankacılık",
   "text": "Tabela banka (shell bank) ile ilişki kurulmaması sistemsel olarak kontrol ediliyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Kontrol tanımı",
   "source": "FATF R.13",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D2-17",
   "domain": "D2",
   "domainName": "Müşteri Profili ve Coğrafi Risk",
   "section": "Sınır Ötesi Yapı",
   "text": "Yurt dışı şube ve iştiraklerin bulunduğu ülkelerin risk seviyeleri kurum risk iştahına uygun mu?",
   "weight": 3,
   "crit": "Orta",
   "evidence": "Ülke-iştirak risk matrisi",
   "source": "FATF R.18",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D2-18",
   "domain": "D2",
   "domainName": "Müşteri Profili ve Coğrafi Risk",
   "section": "Sınır Ötesi Yapı",
   "text": "Offshore, serbest bölge ve vergi cenneti yapılı müşteriler ayrıca işaretleniyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "İşaretleme kuralı, müşteri listesi",
   "source": "FATF tipolojileri",
   "qa": true,
   "pop": "Offshore yapılı müşteriler"
  },
  {
   "id": "D2-19",
   "domain": "D2",
   "domainName": "Müşteri Profili ve Coğrafi Risk",
   "section": "Kabul Politikası",
   "text": "Kurumun yasaklı ülke/sektör (prohibited) listesi tanımlı ve onboarding'te kontrol ediliyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Yasaklı liste, sistem kontrolü",
   "source": "Risk iştahı beyanı",
   "qa": true,
   "pop": "Reddedilen başvurular"
  },
  {
   "id": "D2-20",
   "domain": "D2",
   "domainName": "Müşteri Profili ve Coğrafi Risk",
   "section": "Tutarlılık",
   "text": "Müşteri risk dağılımı ile alert ve ŞİB dağılımı arasındaki tutarlılık analiz ediliyor mu?",
   "weight": 3,
   "crit": "Orta",
   "evidence": "Karşılaştırmalı analiz raporu",
   "source": "Wolfsberg Effectiveness Statement",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D3-01",
   "domain": "D3",
   "domainName": "Ürün ve Kanal Riski",
   "section": "Ürün Envanteri",
   "text": "Tüm ürün ve hizmetler için güncel bir envanter tutuluyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Ürün envanteri",
   "source": "FATF R.1",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D3-02",
   "domain": "D3",
   "domainName": "Ürün ve Kanal Riski",
   "section": "Ürün Envanteri",
   "text": "Her ürün için ML/TF doğuştan risk skoru belirlendi mi?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Ürün risk skor tablosu",
   "source": "FATF R.1; EWRA metodolojisi",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D3-03",
   "domain": "D3",
   "domainName": "Ürün ve Kanal Riski",
   "section": "Ürün Envanteri",
   "text": "Ürün risk skorlaması anonimlik, işlem hızı, coğrafi erişim, nakit yoğunluğu ve üçüncü taraf fon kabulü kriterlerini içeriyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Skorlama metodolojisi",
   "source": "EBA ML/TF Risk Factors GL",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D3-04",
   "domain": "D3",
   "domainName": "Ürün ve Kanal Riski",
   "section": "Ürün Envanteri",
   "text": "Yeni ürün onay sürecinde AML ve yaptırım etkisi zorunlu bir değerlendirme kalemi mi?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "NPA formu",
   "source": "FATF R.15",
   "qa": true,
   "pop": "Son 12 ayda onaylanan ürünler"
  },
  {
   "id": "D3-05",
   "domain": "D3",
   "domainName": "Ürün ve Kanal Riski",
   "section": "Dijital Kanal",
   "text": "Uzaktan müşteri kabulünde canlılık tespiti ve belge doğrulama kontrolleri uygulanıyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Sistem konfigürasyonu, örnek kayıt",
   "source": "FATF Digital ID Guidance; Tedbirler Yön.",
   "qa": true,
   "pop": "Uzaktan açılan hesaplar"
  },
  {
   "id": "D3-06",
   "domain": "D3",
   "domainName": "Ürün ve Kanal Riski",
   "section": "Dijital Kanal",
   "text": "Sahte veya manipüle belge tespit oranı ölçülüyor ve raporlanıyor mu?",
   "weight": 3,
   "crit": "Orta",
   "evidence": "Tespit istatistikleri",
   "source": "FATF Digital ID Guidance",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D3-07",
   "domain": "D3",
   "domainName": "Ürün ve Kanal Riski",
   "section": "Dijital Kanal",
   "text": "API/açık bankacılık üzerinden gelen üçüncü taraf işlemlerinde fon kaynağı izlenebiliyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Veri akış şeması",
   "source": "FATF R.16",
   "qa": true,
   "pop": "Üçüncü taraf sağlayıcı işlemleri"
  },
  {
   "id": "D3-08",
   "domain": "D3",
   "domainName": "Ürün ve Kanal Riski",
   "section": "Dijital Kanal",
   "text": "ATM, kiosk gibi gözetimsiz kanallar için ek izleme senaryoları var mı?",
   "weight": 3,
   "crit": "Orta",
   "evidence": "Senaryo listesi",
   "source": "FATF tipolojileri",
   "qa": true,
   "pop": "Gözetimsiz kanal işlemleri"
  },
  {
   "id": "D3-09",
   "domain": "D3",
   "domainName": "Ürün ve Kanal Riski",
   "section": "Nakit ve Ön Ödemeli",
   "text": "Ön ödemeli kart ve e-para ürünlerinde yükleme/harcama limitleri risk bazlı olarak belirlendi mi?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Limit tablosu",
   "source": "FATF R.15; e-para mevzuatı",
   "qa": true,
   "pop": "Ön ödemeli ürün işlemleri"
  },
  {
   "id": "D3-10",
   "domain": "D3",
   "domainName": "Ürün ve Kanal Riski",
   "section": "Nakit ve Ön Ödemeli",
   "text": "Nakit işlemler için ürün bazlı eşik ve kontroller tanımlı mı?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Eşik tablosu",
   "source": "Tedbirler Yön. (kimlik tespiti eşikleri)",
   "qa": true,
   "pop": "Eşik üstü nakit işlemler"
  },
  {
   "id": "D3-11",
   "domain": "D3",
   "domainName": "Ürün ve Kanal Riski",
   "section": "Sanal Varlık",
   "text": "Sanal varlık hizmet sağlayıcı (VASP) ilişkileri ayrı bir risk kategorisinde yönetiliyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "VASP müşteri listesi, risk kuralı",
   "source": "FATF R.15 IN",
   "qa": true,
   "pop": "VASP müşterileri"
  },
  {
   "id": "D3-12",
   "domain": "D3",
   "domainName": "Ürün ve Kanal Riski",
   "section": "Sanal Varlık",
   "text": "Sanal varlık transferlerinde Travel Rule (gönderen/alıcı bilgisi) uygulanıyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Sistem kaydı, örnek transfer",
   "source": "FATF R.16 IN",
   "qa": true,
   "pop": "Sanal varlık transferleri"
  },
  {
   "id": "D3-13",
   "domain": "D3",
   "domainName": "Ürün ve Kanal Riski",
   "section": "Sanal Varlık",
   "text": "Kendi kendine barındırılan (unhosted) cüzdan işlemleri için ek kontrol var mı?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Kontrol tanımı",
   "source": "FATF VA Guidance",
   "qa": true,
   "pop": "Unhosted cüzdan işlemleri"
  },
  {
   "id": "D3-14",
   "domain": "D3",
   "domainName": "Ürün ve Kanal Riski",
   "section": "Trade Finance",
   "text": "Trade finance ürünleri için ayrı bir AML/yaptırım risk değerlendirmesi yapıldı mı?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Trade finance risk değerlendirmesi",
   "source": "FATF/Wolfsberg Trade Finance Principles",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D3-15",
   "domain": "D3",
   "domainName": "Ürün ve Kanal Riski",
   "section": "Yatırım ve Kambiyo",
   "text": "Menkul kıymet ve yatırım ürünlerinde enstrüman bazlı yaptırım kontrolü yapılıyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "ISIN/enstrüman tarama kaydı",
   "source": "OFAC NS-MBS/SSI listeleri",
   "qa": true,
   "pop": "Menkul kıymet işlemleri"
  },
  {
   "id": "D3-16",
   "domain": "D3",
   "domainName": "Ürün ve Kanal Riski",
   "section": "Yatırım ve Kambiyo",
   "text": "Tek seferlik (occasional) işlemlerde kimlik tespiti eşiği doğru uygulanıyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Sistem kuralı, örnek işlem",
   "source": "Tedbirler Yön. m.5-6",
   "qa": true,
   "pop": "Müşteri olmayan tek seferlik işlemler"
  },
  {
   "id": "D3-17",
   "domain": "D3",
   "domainName": "Ürün ve Kanal Riski",
   "section": "Aracılı Kanal",
   "text": "Acente ve temsilci kanalı üzerinden yapılan işlemler ayrıca izleniyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Kanal bazlı izleme raporu",
   "source": "FATF R.14",
   "qa": true,
   "pop": "Acente kanalı işlemleri"
  },
  {
   "id": "D3-18",
   "domain": "D3",
   "domainName": "Ürün ve Kanal Riski",
   "section": "Risk İştahı",
   "text": "Riski kurum iştahının dışına çıkan ürünler için kısıtlama veya sonlandırma mekanizması var mı?",
   "weight": 3,
   "crit": "Orta",
   "evidence": "Karar kaydı",
   "source": "Risk iştahı beyanı",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D4-01",
   "domain": "D4",
   "domainName": "İşlem Evreni ve Veri Bütünlüğü",
   "section": "İşlem Evreni",
   "text": "İzlemeye tabi işlem tiplerinin tam envanteri (transaction universe) dokümante edildi mi?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "İşlem evreni dokümanı",
   "source": "Model risk yönetimi standardı",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D4-02",
   "domain": "D4",
   "domainName": "İşlem Evreni ve Veri Bütünlüğü",
   "section": "İşlem Evreni",
   "text": "İzleme kapsamı dışında bırakılan işlem tipleri gerekçelendirildi ve onaylandı mı?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Kapsam dışı listesi ve gerekçe",
   "source": "Model risk yönetimi standardı",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D4-03",
   "domain": "D4",
   "domainName": "İşlem Evreni ve Veri Bütünlüğü",
   "section": "İşlem Evreni",
   "text": "Şube ve iştirak verilerinin merkezî izlemeye dahil olma oranı biliniyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Kapsam raporu",
   "source": "FATF R.18",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D4-04",
   "domain": "D4",
   "domainName": "İşlem Evreni ve Veri Bütünlüğü",
   "section": "Mutabakat",
   "text": "Kaynak sistemler ile izleme sistemi arasında düzenli mutabakat (reconciliation) yapılıyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Mutabakat raporları",
   "source": "Veri yönetişimi standardı",
   "qa": true,
   "pop": "Günlük mutabakat kayıtları"
  },
  {
   "id": "D4-05",
   "domain": "D4",
   "domainName": "İşlem Evreni ve Veri Bütünlüğü",
   "section": "Mutabakat",
   "text": "Mutabakat farkları için eşik ve eskalasyon prosedürü tanımlı mı?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Prosedür, eskalasyon kayıtları",
   "source": "Veri yönetişimi standardı",
   "qa": true,
   "pop": "Eşik aşan mutabakat farkları"
  },
  {
   "id": "D4-06",
   "domain": "D4",
   "domainName": "İşlem Evreni ve Veri Bütünlüğü",
   "section": "Mutabakat",
   "text": "Veri besleme hatalarında uyarı ve yeniden işleme (reprocessing) mekanizması var mı?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Hata logu, yeniden işleme kaydı",
   "source": "BT süreklilik standardı",
   "qa": true,
   "pop": "Son 12 aydaki besleme hataları"
  },
  {
   "id": "D4-07",
   "domain": "D4",
   "domainName": "İşlem Evreni ve Veri Bütünlüğü",
   "section": "Veri Kalitesi",
   "text": "Kritik alanların (tutar, para birimi, karşı taraf, ülke, IBAN, unvan) doluluk oranı ölçülüyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Veri kalitesi raporu",
   "source": "BCBS 239 prensipleri",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D4-08",
   "domain": "D4",
   "domainName": "İşlem Evreni ve Veri Bütünlüğü",
   "section": "Veri Kalitesi",
   "text": "Eksik veya hatalı veri oranı için kabul edilebilir eşik tanımlı mı?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Eşik tanımı",
   "source": "BCBS 239",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D4-09",
   "domain": "D4",
   "domainName": "İşlem Evreni ve Veri Bütünlüğü",
   "section": "Veri Kalitesi",
   "text": "Veri kalitesi göstergeleri düzenli yönetim raporlamasında yer alıyor mu?",
   "weight": 3,
   "crit": "Orta",
   "evidence": "Yönetim raporu",
   "source": "BCBS 239",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D4-10",
   "domain": "D4",
   "domainName": "İşlem Evreni ve Veri Bütünlüğü",
   "section": "Veri Kalitesi",
   "text": "İzleme sisteminde kullanılan referans veriler (ülke, kur, MCC, sektör) güncel tutuluyor mu?",
   "weight": 3,
   "crit": "Orta",
   "evidence": "Referans veri güncelleme kaydı",
   "source": "Veri yönetişimi standardı",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D4-11",
   "domain": "D4",
   "domainName": "İşlem Evreni ve Veri Bütünlüğü",
   "section": "Veri Kalitesi",
   "text": "Çoklu para birimi işlemlerinde eşik hesabı için kur dönüşümü tutarlı bir kaynaktan yapılıyor mu?",
   "weight": 3,
   "crit": "Orta",
   "evidence": "Kur kaynağı tanımı",
   "source": "İç kontrol",
   "qa": true,
   "pop": "Yabancı para işlemler"
  },
  {
   "id": "D4-12",
   "domain": "D4",
   "domainName": "İşlem Evreni ve Veri Bütünlüğü",
   "section": "Bağlantı ve Bütünlük",
   "text": "Müşteri statik verisi ile işlem verisi arasındaki eşleştirme doğrulandı mı?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Eşleştirme test raporu",
   "source": "Model doğrulama standardı",
   "qa": true,
   "pop": "Müşteri-işlem eşleşme örneklemi"
  },
  {
   "id": "D4-13",
   "domain": "D4",
   "domainName": "İşlem Evreni ve Veri Bütünlüğü",
   "section": "Transfer Bilgisi",
   "text": "Ödeme mesajlarında gönderen ve alıcı bilgisinin eksiksizliği kontrol ediliyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Kontrol kuralı, istisna raporu",
   "source": "FATF R.16",
   "qa": true,
   "pop": "Giden/gelen elektronik transferler"
  },
  {
   "id": "D4-14",
   "domain": "D4",
   "domainName": "İşlem Evreni ve Veri Bütünlüğü",
   "section": "Transfer Bilgisi",
   "text": "Eksik bilgili transferler için askıya alma, iade veya bilgi talebi prosedürü uygulanıyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "İşlem kararı kayıtları",
   "source": "FATF R.16 IN",
   "qa": true,
   "pop": "Eksik bilgili transferler"
  },
  {
   "id": "D4-15",
   "domain": "D4",
   "domainName": "İşlem Evreni ve Veri Bütünlüğü",
   "section": "Saklama",
   "text": "İşlem ve müşteri kayıtları mevzuatın öngördüğü asgari süre boyunca erişilebilir şekilde saklanıyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Saklama politikası, arşiv testi",
   "source": "FATF R.11; 5549 s.K. m.8",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D4-16",
   "domain": "D4",
   "domainName": "İşlem Evreni ve Veri Bütünlüğü",
   "section": "Değişiklik Yönetimi",
   "text": "Sistem değişikliği veya veri göçü sonrası veri bütünlüğü testi yapılıyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Test raporu",
   "source": "Değişiklik yönetimi standardı",
   "qa": true,
   "pop": "Son 24 aydaki değişiklikler"
  },
  {
   "id": "D4-17",
   "domain": "D4",
   "domainName": "İşlem Evreni ve Veri Bütünlüğü",
   "section": "Test Ortamı",
   "text": "Test ortamında üretim benzeri veriyle senaryo doğrulaması yapılabiliyor mu?",
   "weight": 3,
   "crit": "Orta",
   "evidence": "Test ortamı tanımı",
   "source": "Model doğrulama standardı",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D4-18",
   "domain": "D4",
   "domainName": "İşlem Evreni ve Veri Bütünlüğü",
   "section": "Erişim",
   "text": "Veri erişim yetkileri rol bazlı, kısıtlı ve loglanabilir mi?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Yetki matrisi, erişim logu",
   "source": "Bilgi güvenliği standardı",
   "qa": true,
   "pop": "Yetkili kullanıcı örneklemi"
  },
  {
   "id": "D5-01",
   "domain": "D5",
   "domainName": "Müşteri Yaşam Döngüsü (CDD/EDD)",
   "section": "Kimlik Tespiti",
   "text": "Kimlik tespiti tüm müşteri tiplerini (gerçek kişi, tüzel kişi, tüzel kişiliği olmayan teşekkül, trust benzeri yapılar) kapsıyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Prosedür, örnek dosyalar",
   "source": "FATF R.10; Tedbirler Yön. m.6-12",
   "qa": true,
   "pop": "Yeni açılan hesaplar"
  },
  {
   "id": "D5-02",
   "domain": "D5",
   "domainName": "Müşteri Yaşam Döngüsü (CDD/EDD)",
   "section": "Kimlik Tespiti",
   "text": "Kimlik bilgileri güvenilir ve bağımsız kaynaklardan doğrulanıyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Doğrulama kayıtları (NVİ, MERSİS, sicil)",
   "source": "FATF R.10",
   "qa": true,
   "pop": "Yeni açılan hesaplar"
  },
  {
   "id": "D5-03",
   "domain": "D5",
   "domainName": "Müşteri Yaşam Döngüsü (CDD/EDD)",
   "section": "Kimlik Tespiti",
   "text": "Müşteri adına hareket eden kişilerin yetkisi ve kimliği ayrıca tespit ediliyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Vekaletname, imza sirküleri",
   "source": "Tedbirler Yön. m.14",
   "qa": true,
   "pop": "Vekil/temsilci ile açılan hesaplar"
  },
  {
   "id": "D5-04",
   "domain": "D5",
   "domainName": "Müşteri Yaşam Döngüsü (CDD/EDD)",
   "section": "Kimlik Tespiti",
   "text": "Tam müşteri tanıma tamamlanmadan işlem yapılması sistemsel olarak engelleniyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Sistem kontrolü, istisna listesi",
   "source": "FATF R.10",
   "qa": true,
   "pop": "Yeni açılan hesaplar"
  },
  {
   "id": "D5-05",
   "domain": "D5",
   "domainName": "Müşteri Yaşam Döngüsü (CDD/EDD)",
   "section": "Müşteri Kabul",
   "text": "Müşteri kabul politikası yazılı ve reddetme kriterlerini içeriyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Kabul politikası",
   "source": "Basel AML Guidelines",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D5-06",
   "domain": "D5",
   "domainName": "Müşteri Yaşam Döngüsü (CDD/EDD)",
   "section": "Müşteri Kabul",
   "text": "Yüksek riskli müşteri kabulü üst düzey yönetici onayına tabi mi?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Onay kayıtları",
   "source": "FATF R.10, R.12",
   "qa": true,
   "pop": "Yüksek riskli yeni müşteriler"
  },
  {
   "id": "D5-07",
   "domain": "D5",
   "domainName": "Müşteri Yaşam Döngüsü (CDD/EDD)",
   "section": "Gerçek Faydalanıcı",
   "text": "Gerçek faydalanıcı tespiti sahiplik eşiği ve kontrol testleri ile katmanlı yapıya kadar izleniyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Sahiplik şeması, tespit dosyası",
   "source": "FATF R.24-25; Tedbirler Yön. m.12",
   "qa": true,
   "pop": "Tüzel kişi müşteriler"
  },
  {
   "id": "D5-08",
   "domain": "D5",
   "domainName": "Müşteri Yaşam Döngüsü (CDD/EDD)",
   "section": "Gerçek Faydalanıcı",
   "text": "Gerçek faydalanıcı tespit edilemediğinde üst düzey yönetici uygulamasına başvurulması gerekçelendiriliyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Gerekçe kayıtları",
   "source": "FATF R.10 IN",
   "qa": true,
   "pop": "Üst düzey yönetici uygulanan dosyalar"
  },
  {
   "id": "D5-09",
   "domain": "D5",
   "domainName": "Müşteri Yaşam Döngüsü (CDD/EDD)",
   "section": "Gerçek Faydalanıcı",
   "text": "Trust, vakıf, hamiline yazılı hisse ve nominee yapıları için ek kontroller uygulanıyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Ek kontrol prosedürü, örnek dosya",
   "source": "FATF R.24-25",
   "qa": true,
   "pop": "Karmaşık yapılı müşteriler"
  },
  {
   "id": "D5-10",
   "domain": "D5",
   "domainName": "Müşteri Yaşam Döngüsü (CDD/EDD)",
   "section": "Gerçek Faydalanıcı",
   "text": "Beyan edilen gerçek faydalanıcı bilgisi resmi sicil kayıtlarıyla karşılaştırılıp tutarsızlıklar raporlanıyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Karşılaştırma kaydı, tutarsızlık raporu",
   "source": "AMLD5 m.30(4); AMLR 2024/1624",
   "qa": true,
   "pop": "Tüzel kişi müşteriler"
  },
  {
   "id": "D5-11",
   "domain": "D5",
   "domainName": "Müşteri Yaşam Döngüsü (CDD/EDD)",
   "section": "Risk Derecelendirme",
   "text": "Müşteri risk derecelendirme modeli yazılı, ağırlıklandırılmış ve onaylı mı?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Model dokümanı, onay kaydı",
   "source": "FATF R.1",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D5-12",
   "domain": "D5",
   "domainName": "Müşteri Yaşam Döngüsü (CDD/EDD)",
   "section": "Risk Derecelendirme",
   "text": "Risk derecelendirme modeli en az yılda bir bağımsız validasyona tabi mi?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Validasyon raporu",
   "source": "Model risk yönetimi (SR 11-7 benzeri)",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D5-13",
   "domain": "D5",
   "domainName": "Müşteri Yaşam Döngüsü (CDD/EDD)",
   "section": "Risk Derecelendirme",
   "text": "Model çıktısının manuel değiştirilmesi (override) gerekçe ve onayla kayıt altına alınıyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Override kayıtları",
   "source": "İç kontrol standardı",
   "qa": true,
   "pop": "Risk skoru override edilen müşteriler"
  },
  {
   "id": "D5-14",
   "domain": "D5",
   "domainName": "Müşteri Yaşam Döngüsü (CDD/EDD)",
   "section": "Risk Derecelendirme",
   "text": "Override oranı izleniyor ve anormal eğilimler analiz ediliyor mu?",
   "weight": 3,
   "crit": "Orta",
   "evidence": "Override istatistikleri",
   "source": "İç kontrol standardı",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D5-15",
   "domain": "D5",
   "domainName": "Müşteri Yaşam Döngüsü (CDD/EDD)",
   "section": "Risk Derecelendirme",
   "text": "Tetikleyici olaylarda (olumsuz haber, PEP olma, işlem anomalisi) risk skoru gecikmeksizin güncelleniyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Tetikleyici kural, örnek vaka",
   "source": "FATF R.10",
   "qa": true,
   "pop": "Tetikleyici olay yaşanan müşteriler"
  },
  {
   "id": "D5-16",
   "domain": "D5",
   "domainName": "Müşteri Yaşam Döngüsü (CDD/EDD)",
   "section": "EDD",
   "text": "EDD tetikleyicileri yazılı olarak tanımlı mı?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "EDD prosedürü",
   "source": "FATF R.10, R.12, R.19",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D5-17",
   "domain": "D5",
   "domainName": "Müşteri Yaşam Döngüsü (CDD/EDD)",
   "section": "EDD",
   "text": "EDD kapsamında fon kaynağı (SoF) belgeye dayalı olarak doğrulanıyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "SoF belgeleri",
   "source": "FATF R.12",
   "qa": true,
   "pop": "EDD dosyaları"
  },
  {
   "id": "D5-18",
   "domain": "D5",
   "domainName": "Müşteri Yaşam Döngüsü (CDD/EDD)",
   "section": "EDD",
   "text": "Servet kaynağı (SoW) beyan dışı bağımsız kanıtla destekleniyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "SoW dosyası",
   "source": "FATF R.12",
   "qa": true,
   "pop": "EDD dosyaları"
  },
  {
   "id": "D5-19",
   "domain": "D5",
   "domainName": "Müşteri Yaşam Döngüsü (CDD/EDD)",
   "section": "EDD",
   "text": "Olumsuz haber (adverse media) taraması hem kabulde hem periyodik olarak yapılıyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Tarama kayıtları",
   "source": "FATF R.10 IN",
   "qa": true,
   "pop": "Yüksek riskli müşteriler"
  },
  {
   "id": "D5-20",
   "domain": "D5",
   "domainName": "Müşteri Yaşam Döngüsü (CDD/EDD)",
   "section": "EDD",
   "text": "EDD dosyaları üst düzey yönetici onayına sunuluyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Onay kayıtları",
   "source": "FATF R.12",
   "qa": true,
   "pop": "EDD dosyaları"
  },
  {
   "id": "D5-21",
   "domain": "D5",
   "domainName": "Müşteri Yaşam Döngüsü (CDD/EDD)",
   "section": "Periyodik Gözden Geçirme",
   "text": "Periyodik gözden geçirme frekansı risk seviyesine göre farklılaştırılmış mı?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Frekans tablosu",
   "source": "FATF R.10 IN",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D5-22",
   "domain": "D5",
   "domainName": "Müşteri Yaşam Döngüsü (CDD/EDD)",
   "section": "Periyodik Gözden Geçirme",
   "text": "Gecikmiş (overdue) KYC dosyalarının sayısı ve yaşlandırması raporlanıyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Yaşlandırma raporu",
   "source": "İç kontrol standardı",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D5-23",
   "domain": "D5",
   "domainName": "Müşteri Yaşam Döngüsü (CDD/EDD)",
   "section": "Periyodik Gözden Geçirme",
   "text": "Gecikmiş KYC için işlem kısıtlaması veya eskalasyon uygulanıyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Kısıtlama kayıtları",
   "source": "FATF R.10",
   "qa": true,
   "pop": "Gecikmiş KYC dosyaları"
  },
  {
   "id": "D5-24",
   "domain": "D5",
   "domainName": "Müşteri Yaşam Döngüsü (CDD/EDD)",
   "section": "Sürekli İzleme",
   "text": "Müşteri profili ile fiili işlem davranışı karşılaştırılıyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Profil-davranış analiz raporu",
   "source": "FATF R.10(d)",
   "qa": true,
   "pop": "Profil sapması olan müşteriler"
  },
  {
   "id": "D5-25",
   "domain": "D5",
   "domainName": "Müşteri Yaşam Döngüsü (CDD/EDD)",
   "section": "Sürekli İzleme",
   "text": "Atıl (dormant) hesapların yeniden aktifleşmesi tetikleyici olay olarak tanımlı mı?",
   "weight": 3,
   "crit": "Orta",
   "evidence": "Senaryo tanımı",
   "source": "FATF tipolojileri",
   "qa": true,
   "pop": "Yeniden aktifleşen hesaplar"
  },
  {
   "id": "D5-26",
   "domain": "D5",
   "domainName": "Müşteri Yaşam Döngüsü (CDD/EDD)",
   "section": "Kalite Kontrol",
   "text": "Müşteri dosyalarının tamlığı düzenli QA örneklemesiyle test ediliyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "QA test raporu",
   "source": "QA programı",
   "qa": true,
   "pop": "Tüm müşteri dosyaları"
  },
  {
   "id": "D6-01",
   "domain": "D6",
   "domainName": "Finansal Yaptırımlar ve Tarama",
   "section": "Liste Yönetimi",
   "text": "Uygulanan yaptırım listelerinin envanteri (BM, OFAC, AB, UK OFSI, ulusal kararlar) tanımlı mı?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Liste envanteri",
   "source": "FATF R.6-7; 7262 s.K.",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D6-02",
   "domain": "D6",
   "domainName": "Finansal Yaptırımlar ve Tarama",
   "section": "Liste Yönetimi",
   "text": "Liste güncellemelerinin kaynaktan üretime yansıma süresi için SLA tanımlı ve ölçülüyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "SLA tanımı, güncelleme logları",
   "source": "FATF R.6 IN ('gecikmeksizin')",
   "qa": true,
   "pop": "Son 12 aydaki liste güncellemeleri"
  },
  {
   "id": "D6-03",
   "domain": "D6",
   "domainName": "Finansal Yaptırımlar ve Tarama",
   "section": "Liste Yönetimi",
   "text": "Liste güncellemesi sonrası tüm müşteri tabanı yeniden taranıyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Rescreening logları",
   "source": "FATF R.6",
   "qa": true,
   "pop": "Liste güncelleme olayları"
  },
  {
   "id": "D6-04",
   "domain": "D6",
   "domainName": "Finansal Yaptırımlar ve Tarama",
   "section": "Liste Yönetimi",
   "text": "Ulusal dondurma kararları (7262 s.K. kapsamı) gecikmeksizin uygulanıyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Karar uygulama kayıtları",
   "source": "7262 s.K.; MASAK tebliğleri",
   "qa": true,
   "pop": "Ulusal dondurma kararları"
  },
  {
   "id": "D6-05",
   "domain": "D6",
   "domainName": "Finansal Yaptırımlar ve Tarama",
   "section": "Liste Yönetimi",
   "text": "Ulusal ve uluslararası liste yükümlülükleri ayrı ayrı, kapsamlarına uygun yönetiliyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Kapsam matrisi",
   "source": "FATF R.6-7",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D6-06",
   "domain": "D6",
   "domainName": "Finansal Yaptırımlar ve Tarama",
   "section": "Sahiplik ve Kontrol",
   "text": "Dolaylı sahiplik (%50 kuralı) taraması yapılıyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Tarama yöntemi, tespit edilen vakalar",
   "source": "OFAC 50 Percent Rule; AB Best Practices",
   "qa": true,
   "pop": "Tüzel kişi müşteriler"
  },
  {
   "id": "D6-07",
   "domain": "D6",
   "domainName": "Finansal Yaptırımlar ve Tarama",
   "section": "Sahiplik ve Kontrol",
   "text": "Dolaylı sahiplik tespitinde kullanılan veri kaynağı tanımlı ve güncel mi?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Veri kaynağı sözleşmesi/kapsamı",
   "source": "OFAC 50 Percent Rule",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D6-08",
   "domain": "D6",
   "domainName": "Finansal Yaptırımlar ve Tarama",
   "section": "Sahiplik ve Kontrol",
   "text": "Sahiplik dışı kontrol (yönetim, vekalet, fiili hakimiyet) kaynaklı yaptırım maruziyeti değerlendiriliyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Değerlendirme kaydı",
   "source": "AB Konsey Kılavuzu; OFSI Guidance",
   "qa": true,
   "pop": "Yüksek riskli tüzel kişiler"
  },
  {
   "id": "D6-09",
   "domain": "D6",
   "domainName": "Finansal Yaptırımlar ve Tarama",
   "section": "Kapsam",
   "text": "Sektörel kısıtlamalar ve çift kullanımlı (dual-use) mal kontrolleri kapsama alındı mı?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Kontrol tanımı",
   "source": "AB 2021/821; ihracat kontrol rejimleri",
   "qa": true,
   "pop": "Trade finance işlemleri"
  },
  {
   "id": "D6-10",
   "domain": "D6",
   "domainName": "Finansal Yaptırımlar ve Tarama",
   "section": "Tarama Motoru",
   "text": "Bulanık (fuzzy) eşleşme eşiği kalibre edildi ve gerekçesi dokümante edildi mi?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Kalibrasyon raporu",
   "source": "Model doğrulama standardı",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D6-11",
   "domain": "D6",
   "domainName": "Finansal Yaptırımlar ve Tarama",
   "section": "Tarama Motoru",
   "text": "Eşik kalibrasyonu son 12 ay içinde tekrarlandı mı?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Son kalibrasyon tarihi",
   "source": "Model risk yönetimi",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D6-12",
   "domain": "D6",
   "domainName": "Finansal Yaptırımlar ve Tarama",
   "section": "Tarama Motoru",
   "text": "Motor transliterasyon, takma ad, ad sırası ve tarih varyasyonlarını yönetebiliyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Test sonuçları",
   "source": "OFAC SDN_ADVANCED yapısı",
   "qa": true,
   "pop": "Bilinen isim varyasyon testleri"
  },
  {
   "id": "D6-13",
   "domain": "D6",
   "domainName": "Finansal Yaptırımlar ve Tarama",
   "section": "Tarama Motoru",
   "text": "Tarama kapsamı müşteri, gerçek faydalanıcı, yetkili, ilgili taraf ve karşı tarafı içeriyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Kapsam dokümanı",
   "source": "FATF R.6",
   "qa": true,
   "pop": "Müşteri ve karşı taraf örneklemi"
  },
  {
   "id": "D6-14",
   "domain": "D6",
   "domainName": "Finansal Yaptırımlar ve Tarama",
   "section": "İşlem Taraması",
   "text": "İşlem taraması ödemeyi durdurabilecek şekilde gerçek zamanlı (pre-transaction) çalışıyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Sistem mimarisi, örnek durdurma",
   "source": "FATF R.6",
   "qa": true,
   "pop": "Giden ödeme işlemleri"
  },
  {
   "id": "D6-15",
   "domain": "D6",
   "domainName": "Finansal Yaptırımlar ve Tarama",
   "section": "İşlem Taraması",
   "text": "SWIFT MT ve ISO 20022 mesajlarında taranan alanlar belgelendi mi?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Alan eşleme dokümanı",
   "source": "ISO 20022 / SWIFT MT alan yapısı",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D6-16",
   "domain": "D6",
   "domainName": "Finansal Yaptırımlar ve Tarama",
   "section": "İşlem Taraması",
   "text": "Serbest metin alanları (ör. ödeme açıklaması) taranıyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Konfigürasyon kaydı",
   "source": "Wolfsberg Sanctions Screening Guidance",
   "qa": true,
   "pop": "Serbest metin içeren ödemeler"
  },
  {
   "id": "D6-17",
   "domain": "D6",
   "domainName": "Finansal Yaptırımlar ve Tarama",
   "section": "Trade Finance",
   "text": "Trade finance işlemlerinde mal, gemi, liman, taşıyıcı ve son kullanıcı taraması yapılıyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Tarama kayıtları, örnek dosya",
   "source": "Wolfsberg Trade Finance Principles",
   "qa": true,
   "pop": "Akreditif/tahsilat dosyaları"
  },
  {
   "id": "D6-18",
   "domain": "D6",
   "domainName": "Finansal Yaptırımlar ve Tarama",
   "section": "Trade Finance",
   "text": "Çift kullanımlı mal listesi ve son kullanım beyanı kontrolü uygulanıyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Kontrol kayıtları",
   "source": "İhracat kontrol rejimleri",
   "qa": true,
   "pop": "Trade finance dosyaları"
  },
  {
   "id": "D6-19",
   "domain": "D6",
   "domainName": "Finansal Yaptırımlar ve Tarama",
   "section": "Trade Finance",
   "text": "Gemi kaynaklı kırmızı bayraklar (AIS kapatma, gemiden gemiye aktarma, bayrak değişimi) izleniyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "İzleme kaynağı, tespit vakaları",
   "source": "OFAC Maritime Advisory",
   "qa": true,
   "pop": "Deniz taşımacılığı dosyaları"
  },
  {
   "id": "D6-20",
   "domain": "D6",
   "domainName": "Finansal Yaptırımlar ve Tarama",
   "section": "Alert Yönetimi",
   "text": "Alert kapatma kararında dört göz ilkesi uygulanıyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Karar kayıtları",
   "source": "İç kontrol standardı",
   "qa": true,
   "pop": "Kapatılan yaptırım alertleri"
  },
  {
   "id": "D6-21",
   "domain": "D6",
   "domainName": "Finansal Yaptırımlar ve Tarama",
   "section": "Alert Yönetimi",
   "text": "Aynı kullanıcının hem inceleyip hem onaylaması sistemsel olarak engelleniyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Sistem kuralı, ihlal raporu",
   "source": "Görevler ayrılığı ilkesi",
   "qa": true,
   "pop": "Kapatılan yaptırım alertleri"
  },
  {
   "id": "D6-22",
   "domain": "D6",
   "domainName": "Finansal Yaptırımlar ve Tarama",
   "section": "Alert Yönetimi",
   "text": "Alert karar gerekçeleri kim/ne zaman/ne yaptı izini verecek şekilde denetlenebilir mi?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Audit trail örneği",
   "source": "Denetlenebilirlik standardı",
   "qa": true,
   "pop": "Kapatılan yaptırım alertleri"
  },
  {
   "id": "D6-23",
   "domain": "D6",
   "domainName": "Finansal Yaptırımlar ve Tarama",
   "section": "Alert Yönetimi",
   "text": "Gerçek eşleşme (true match) durumunda blokaj/red kararı ve bildirim süreci tanımlı mı?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Prosedür, uygulanan vakalar",
   "source": "FATF R.6",
   "qa": true,
   "pop": "True match vakaları"
  },
  {
   "id": "D6-24",
   "domain": "D6",
   "domainName": "Finansal Yaptırımlar ve Tarama",
   "section": "Alert Yönetimi",
   "text": "Yaptırım alertlerinin kapanış süresi ve yaşlandırması raporlanıyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Yaşlandırma raporu",
   "source": "İç raporlama",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D6-25",
   "domain": "D6",
   "domainName": "Finansal Yaptırımlar ve Tarama",
   "section": "Test ve Süreklilik",
   "text": "Tarama sistemi yılda en az bir kez bağımsız etkinlik testine tabi tutuluyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Test raporu (bilinen isim seti)",
   "source": "Model doğrulama standardı",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D6-26",
   "domain": "D6",
   "domainName": "Finansal Yaptırımlar ve Tarama",
   "section": "Test ve Süreklilik",
   "text": "Sistem kesintisi durumunda manuel tarama ve telafi (backlog) prosedürü var mı?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Prosedür, kesinti kayıtları",
   "source": "İş sürekliliği standardı",
   "qa": true,
   "pop": "Kesinti dönemleri"
  },
  {
   "id": "D7-01",
   "domain": "D7",
   "domainName": "AML İzleme (Monitoring)",
   "section": "Senaryo Yönetimi",
   "text": "Senaryo envanteri, her senaryonun hedeflediği tipoloji ile eşleştirilmiş mi?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Senaryo-tipoloji matrisi",
   "source": "Model risk yönetimi",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D7-02",
   "domain": "D7",
   "domainName": "AML İzleme (Monitoring)",
   "section": "Senaryo Yönetimi",
   "text": "EWRA'da tespit edilen tipolojilerin tamamı senaryolarla karşılanıyor mu (coverage assessment)?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Kapsam analizi raporu",
   "source": "Wolfsberg Effectiveness Statement",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D7-03",
   "domain": "D7",
   "domainName": "AML İzleme (Monitoring)",
   "section": "Senaryo Yönetimi",
   "text": "Karşılanmayan tipolojiler için boşluk kaydı ve aksiyon planı var mı?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Gap listesi",
   "source": "İç kontrol standardı",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D7-04",
   "domain": "D7",
   "domainName": "AML İzleme (Monitoring)",
   "section": "Senaryo Yönetimi",
   "text": "Senaryo değişiklikleri resmi değişiklik yönetimi ve onay sürecine tabi mi?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Değişiklik kayıtları",
   "source": "Değişiklik yönetimi standardı",
   "qa": true,
   "pop": "Son 12 aydaki senaryo değişiklikleri"
  },
  {
   "id": "D7-05",
   "domain": "D7",
   "domainName": "AML İzleme (Monitoring)",
   "section": "Senaryo Yönetimi",
   "text": "Yeni veya değiştirilen senaryolar üretime alınmadan önce test ortamında doğrulanıyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Test raporları",
   "source": "Model doğrulama standardı",
   "qa": true,
   "pop": "Devreye alınan senaryolar"
  },
  {
   "id": "D7-06",
   "domain": "D7",
   "domainName": "AML İzleme (Monitoring)",
   "section": "Eşik ve Kalibrasyon",
   "text": "Senaryo eşikleri veri analizine dayalı olarak belirlendi mi?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Eşik belirleme çalışması",
   "source": "Model risk yönetimi",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D7-07",
   "domain": "D7",
   "domainName": "AML İzleme (Monitoring)",
   "section": "Eşik ve Kalibrasyon",
   "text": "Eşik ve parametreler son 12-18 ay içinde tuning'e tabi tutuldu mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Tuning raporu",
   "source": "Model risk yönetimi",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D7-08",
   "domain": "D7",
   "domainName": "AML İzleme (Monitoring)",
   "section": "Eşik ve Kalibrasyon",
   "text": "Eşik altı (below-the-line) testi yapılıyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "BTL test raporu",
   "source": "Model doğrulama standardı",
   "qa": true,
   "pop": "Eşik altı işlem örneklemi"
  },
  {
   "id": "D7-09",
   "domain": "D7",
   "domainName": "AML İzleme (Monitoring)",
   "section": "Eşik ve Kalibrasyon",
   "text": "Eşik üstü (above-the-line) analiziyle aşırı alert üretimi değerlendiriliyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "ATL analiz raporu",
   "source": "Model doğrulama standardı",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D7-10",
   "domain": "D7",
   "domainName": "AML İzleme (Monitoring)",
   "section": "Eşik ve Kalibrasyon",
   "text": "Müşteri veya ürün grubu bazlı segmentasyon uygulanıyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Segmentasyon dokümanı",
   "source": "Model risk yönetimi",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D7-11",
   "domain": "D7",
   "domainName": "AML İzleme (Monitoring)",
   "section": "Model Validasyon",
   "text": "Model validasyonu birinci ve ikinci hattan bağımsız bir ekip veya taraf tarafından yapılıyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Validasyon raporu",
   "source": "Model risk yönetimi",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D7-12",
   "domain": "D7",
   "domainName": "AML İzleme (Monitoring)",
   "section": "Model Validasyon",
   "text": "Validasyon bulguları için kapanış takibi yapılıyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Bulgu takip listesi",
   "source": "İç kontrol standardı",
   "qa": true,
   "pop": "Açık validasyon bulguları"
  },
  {
   "id": "D7-13",
   "domain": "D7",
   "domainName": "AML İzleme (Monitoring)",
   "section": "Alert Operasyonu",
   "text": "Alert üretim hacmi ile inceleme kapasitesi arasındaki denge düzenli izleniyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Kapasite raporu",
   "source": "Wolfsberg Effectiveness Statement",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D7-14",
   "domain": "D7",
   "domainName": "AML İzleme (Monitoring)",
   "section": "Alert Operasyonu",
   "text": "Bekleyen alert (backlog) sayısı ve yaşlandırması raporlanıyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Backlog raporu",
   "source": "İç raporlama",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D7-15",
   "domain": "D7",
   "domainName": "AML İzleme (Monitoring)",
   "section": "Alert Operasyonu",
   "text": "Alert kapanış süresi için SLA tanımlı ve ölçülüyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "SLA tanımı, ölçüm raporu",
   "source": "İç raporlama",
   "qa": true,
   "pop": "Kapatılan izleme alertleri"
  },
  {
   "id": "D7-16",
   "domain": "D7",
   "domainName": "AML İzleme (Monitoring)",
   "section": "Alert Operasyonu",
   "text": "Alert kapatma gerekçeleri standart bir kod setiyle sınıflandırılıyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Kod seti, dağılım raporu",
   "source": "İç kontrol standardı",
   "qa": true,
   "pop": "Kapatılan izleme alertleri"
  },
  {
   "id": "D7-17",
   "domain": "D7",
   "domainName": "AML İzleme (Monitoring)",
   "section": "Alert Operasyonu",
   "text": "Toplu (bulk) alert kapatma engelleniyor veya özel onaya tabi mi?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Sistem kuralı, onay kayıtları",
   "source": "İç kontrol standardı",
   "qa": true,
   "pop": "Toplu kapatma vakaları"
  },
  {
   "id": "D7-18",
   "domain": "D7",
   "domainName": "AML İzleme (Monitoring)",
   "section": "Alert Operasyonu",
   "text": "Aynı müşteriye ait tekrarlayan alertler birleştirilerek bütüncül değerlendiriliyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Vaka birleştirme kaydı",
   "source": "İnceleme prosedürü",
   "qa": true,
   "pop": "Tekrarlayan alertli müşteriler"
  },
  {
   "id": "D7-19",
   "domain": "D7",
   "domainName": "AML İzleme (Monitoring)",
   "section": "Alert Operasyonu",
   "text": "İnceleme sürecinde ağ/ilişki analizi (link analysis) kullanılabiliyor mu?",
   "weight": 3,
   "crit": "Orta",
   "evidence": "Araç kullanım kaydı",
   "source": "FATF tipoloji rehberleri",
   "qa": true,
   "pop": "Karmaşık vakalar"
  },
  {
   "id": "D7-20",
   "domain": "D7",
   "domainName": "AML İzleme (Monitoring)",
   "section": "Etkinlik Ölçümü",
   "text": "Alert-vaka-ŞİB dönüşüm oranları senaryo, ürün ve analist bazında izleniyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Dönüşüm oranı raporu",
   "source": "Wolfsberg Effectiveness Statement",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D7-21",
   "domain": "D7",
   "domainName": "AML İzleme (Monitoring)",
   "section": "Etkinlik Ölçümü",
   "text": "Verimliliği aşırı düşük senaryolar gözden geçiriliyor veya emekliye ayrılıyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Senaryo performans raporu",
   "source": "Model risk yönetimi",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D7-22",
   "domain": "D7",
   "domainName": "AML İzleme (Monitoring)",
   "section": "Kalite Kontrol",
   "text": "Analist kararlarının kalitesi düzenli QA örneklemesiyle ölçülüyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "QA test raporu",
   "source": "QA programı",
   "qa": true,
   "pop": "Kapatılan alert ve vakalar"
  },
  {
   "id": "D7-23",
   "domain": "D7",
   "domainName": "AML İzleme (Monitoring)",
   "section": "Kalite Kontrol",
   "text": "QA hata oranı analist bazında geri bildirime ve eğitime dönüşüyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Geri bildirim kayıtları",
   "source": "QA programı",
   "qa": true,
   "pop": "QA hatası tespit edilen dosyalar"
  },
  {
   "id": "D7-24",
   "domain": "D7",
   "domainName": "AML İzleme (Monitoring)",
   "section": "Süreklilik",
   "text": "İzleme sistemi kesintilerinde telafi ve geriye dönük tarama yapılıyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Kesinti ve telafi kaydı",
   "source": "İş sürekliliği standardı",
   "qa": true,
   "pop": "Kesinti dönemleri"
  },
  {
   "id": "D8-01",
   "domain": "D8",
   "domainName": "ŞİB, Dondurma ve Müşteri Çıkışı",
   "section": "ŞİB Süreci",
   "text": "Şüpheli işlem bildirimi karar süreci (alert - vaka - karar) yazılı olarak tanımlı mı?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Prosedür dokümanı",
   "source": "5549 s.K. m.4; Tedbirler Yön.",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D8-02",
   "domain": "D8",
   "domainName": "ŞİB, Dondurma ve Müşteri Çıkışı",
   "section": "ŞİB Süreci",
   "text": "Şüphe tespitinden bildirime kadar geçen süre mevzuattaki sınır içinde mi?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Süre ölçüm raporu",
   "source": "5549 s.K.; MASAK tebliğleri",
   "qa": true,
   "pop": "Verilen ŞİB dosyaları"
  },
  {
   "id": "D8-03",
   "domain": "D8",
   "domainName": "ŞİB, Dondurma ve Müşteri Çıkışı",
   "section": "ŞİB Süreci",
   "text": "Gecikmiş bildirimlerin sayısı ve nedenleri izleniyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Gecikme analizi",
   "source": "İç kontrol standardı",
   "qa": true,
   "pop": "Gecikmiş ŞİB dosyaları"
  },
  {
   "id": "D8-04",
   "domain": "D8",
   "domainName": "ŞİB, Dondurma ve Müşteri Çıkışı",
   "section": "ŞİB Süreci",
   "text": "ŞİB verilmeme kararları da gerekçeli olarak kayıt altına alınıyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Karar kayıtları",
   "source": "FATF R.20; denetlenebilirlik",
   "qa": true,
   "pop": "ŞİB verilmeyen kapatılmış vakalar"
  },
  {
   "id": "D8-05",
   "domain": "D8",
   "domainName": "ŞİB, Dondurma ve Müşteri Çıkışı",
   "section": "ŞİB Kalitesi",
   "text": "ŞİB narratifi kim, ne, ne zaman, nerede, ne kadar ve neden şüpheli unsurlarını içeriyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Narratif örnekleri",
   "source": "FATF R.20; FIU rehberleri",
   "qa": true,
   "pop": "Verilen ŞİB dosyaları"
  },
  {
   "id": "D8-06",
   "domain": "D8",
   "domainName": "ŞİB, Dondurma ve Müşteri Çıkışı",
   "section": "ŞİB Kalitesi",
   "text": "Narratif kalitesi için standart şablon ve QA kontrolü uygulanıyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Şablon, QA raporu",
   "source": "QA programı",
   "qa": true,
   "pop": "Verilen ŞİB dosyaları"
  },
  {
   "id": "D8-07",
   "domain": "D8",
   "domainName": "ŞİB, Dondurma ve Müşteri Çıkışı",
   "section": "ŞİB Kalitesi",
   "text": "ŞİB'e konu müşteriler için sonraki dönemde artırılmış izleme uygulanıyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "İzleme kaydı",
   "source": "FATF R.10 IN",
   "qa": true,
   "pop": "ŞİB verilen müşteriler"
  },
  {
   "id": "D8-08",
   "domain": "D8",
   "domainName": "ŞİB, Dondurma ve Müşteri Çıkışı",
   "section": "ŞİB Kalitesi",
   "text": "Tekrarlayan ŞİB durumunda müşteri ilişkisinin sürdürülebilirliği değerlendiriliyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Değerlendirme kaydı",
   "source": "Risk iştahı beyanı",
   "qa": true,
   "pop": "Birden fazla ŞİB verilen müşteriler"
  },
  {
   "id": "D8-09",
   "domain": "D8",
   "domainName": "ŞİB, Dondurma ve Müşteri Çıkışı",
   "section": "Gizlilik",
   "text": "Bilgi verme yasağına (tipping-off) ilişkin kontroller ve eğitim mevcut mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Prosedür, eğitim kaydı",
   "source": "5549 s.K. m.5; FATF R.21",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D8-10",
   "domain": "D8",
   "domainName": "ŞİB, Dondurma ve Müşteri Çıkışı",
   "section": "Gizlilik",
   "text": "ŞİB kayıtlarına erişim yetkisi kısıtlı ve loglanıyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Yetki listesi, erişim logu",
   "source": "Gizlilik yükümlülüğü",
   "qa": true,
   "pop": "Erişim logu örneklemi"
  },
  {
   "id": "D8-11",
   "domain": "D8",
   "domainName": "ŞİB, Dondurma ve Müşteri Çıkışı",
   "section": "Dondurma",
   "text": "Malvarlığı dondurma kararları gecikmeksizin (aynı iş günü) uygulanıyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Uygulama zaman damgaları",
   "source": "FATF R.6; 7262 s.K.",
   "qa": true,
   "pop": "Dondurma kararları"
  },
  {
   "id": "D8-12",
   "domain": "D8",
   "domainName": "ŞİB, Dondurma ve Müşteri Çıkışı",
   "section": "Dondurma",
   "text": "Dondurma sonrası yetkili mercie bildirim yapılıyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Bildirim yazıları",
   "source": "7262 s.K.",
   "qa": true,
   "pop": "Dondurma vakaları"
  },
  {
   "id": "D8-13",
   "domain": "D8",
   "domainName": "ŞİB, Dondurma ve Müşteri Çıkışı",
   "section": "Dondurma",
   "text": "Dondurulan varlıkların envanteri tutuluyor ve periyodik mutabakatı yapılıyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Varlık envanteri",
   "source": "7262 s.K.",
   "qa": true,
   "pop": "Dondurulan hesaplar"
  },
  {
   "id": "D8-14",
   "domain": "D8",
   "domainName": "ŞİB, Dondurma ve Müşteri Çıkışı",
   "section": "Dondurma",
   "text": "Dondurma kararının kaldırılması (unfreezing) süreci tanımlı ve kontrollü mü?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Prosedür, uygulama kayıtları",
   "source": "FATF R.6 IN",
   "qa": true,
   "pop": "Kaldırma vakaları"
  },
  {
   "id": "D8-15",
   "domain": "D8",
   "domainName": "ŞİB, Dondurma ve Müşteri Çıkışı",
   "section": "Dondurma",
   "text": "Temel giderler için istisna talepleri usulüne uygun yönetiliyor mu?",
   "weight": 3,
   "crit": "Orta",
   "evidence": "Talep ve onay kayıtları",
   "source": "BM 1452 sayılı Karar; 7262 s.K.",
   "qa": true,
   "pop": "İstisna talepleri"
  },
  {
   "id": "D8-16",
   "domain": "D8",
   "domainName": "ŞİB, Dondurma ve Müşteri Çıkışı",
   "section": "Müşteri Çıkışı",
   "text": "Müşteri ilişkisinin sonlandırılması (exit) kriterleri yazılı olarak tanımlı mı?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Exit politikası",
   "source": "Risk iştahı beyanı",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D8-17",
   "domain": "D8",
   "domainName": "ŞİB, Dondurma ve Müşteri Çıkışı",
   "section": "Müşteri Çıkışı",
   "text": "Exit kararları bir komite veya üst yönetim onayına tabi mi?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Komite tutanakları",
   "source": "İç kontrol standardı",
   "qa": true,
   "pop": "Exit kararları"
  },
  {
   "id": "D8-18",
   "domain": "D8",
   "domainName": "ŞİB, Dondurma ve Müşteri Çıkışı",
   "section": "Müşteri Çıkışı",
   "text": "Exit kararlarında ŞİB yükümlülüğünün ayrıca değerlendirildiği belgeleniyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Değerlendirme kaydı",
   "source": "FATF R.20",
   "qa": true,
   "pop": "Exit kararları"
  },
  {
   "id": "D8-19",
   "domain": "D8",
   "domainName": "ŞİB, Dondurma ve Müşteri Çıkışı",
   "section": "Müşteri Çıkışı",
   "text": "Toplu de-risking uygulamalarının finansal dışlanma etkisi değerlendiriliyor mu?",
   "weight": 3,
   "crit": "Orta",
   "evidence": "Etki analizi",
   "source": "FATF De-risking Guidance",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D8-20",
   "domain": "D8",
   "domainName": "ŞİB, Dondurma ve Müşteri Çıkışı",
   "section": "Müşteri Çıkışı",
   "text": "Exit sonrası bakiye iadesi ve fon yönlendirmesi kontrol ediliyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "İade işlem kayıtları",
   "source": "FATF tipolojileri",
   "qa": true,
   "pop": "Exit sonrası iade işlemleri"
  },
  {
   "id": "D8-21",
   "domain": "D8",
   "domainName": "ŞİB, Dondurma ve Müşteri Çıkışı",
   "section": "Müşteri Çıkışı",
   "text": "Reddedilen başvuru kayıtları tutuluyor ve yeniden başvuruda kontrol ediliyor mu?",
   "weight": 3,
   "crit": "Orta",
   "evidence": "Red listesi, kontrol kuralı",
   "source": "İç kontrol standardı",
   "qa": true,
   "pop": "Reddedilen başvurular"
  },
  {
   "id": "D8-22",
   "domain": "D8",
   "domainName": "ŞİB, Dondurma ve Müşteri Çıkışı",
   "section": "Raporlama",
   "text": "ŞİB, dondurma ve exit sayıları düzenli yönetim raporlamasında yer alıyor mu?",
   "weight": 3,
   "crit": "Orta",
   "evidence": "Yönetim raporu",
   "source": "Uyum Programı Yön.",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D9-01",
   "domain": "D9",
   "domainName": "Düzenleyici Olaylar ve Kolluk Talepleri",
   "section": "Denetim Bulguları",
   "text": "Geçmiş denetim ve inceleme bulguları için merkezi bir takip kaydı tutuluyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Bulgu takip listesi",
   "source": "İç kontrol standardı",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D9-02",
   "domain": "D9",
   "domainName": "Düzenleyici Olaylar ve Kolluk Talepleri",
   "section": "Denetim Bulguları",
   "text": "Bulgu kapanışları bağımsız olarak yeniden test ediliyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Re-test raporları",
   "source": "İç denetim standardı",
   "qa": true,
   "pop": "Kapatılan bulgular"
  },
  {
   "id": "D9-03",
   "domain": "D9",
   "domainName": "Düzenleyici Olaylar ve Kolluk Talepleri",
   "section": "Denetim Bulguları",
   "text": "İdari yaptırım ve uyarı geçmişi kök neden analiziyle değerlendirildi mi?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Kök neden analizi",
   "source": "İç kontrol standardı",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D9-04",
   "domain": "D9",
   "domainName": "Düzenleyici Olaylar ve Kolluk Talepleri",
   "section": "Denetim Bulguları",
   "text": "Tekrar eden bulgular (repeat findings) ayrıca izleniyor ve eskalasyona tabi mi?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Tekrar bulgu raporu",
   "source": "İç denetim standardı",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D9-05",
   "domain": "D9",
   "domainName": "Düzenleyici Olaylar ve Kolluk Talepleri",
   "section": "Düzenleyici İletişim",
   "text": "Düzenleyici yazışmalar tek elden koordine ediliyor ve arşivleniyor mu?",
   "weight": 3,
   "crit": "Orta",
   "evidence": "Yazışma arşivi",
   "source": "İç kontrol standardı",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D9-06",
   "domain": "D9",
   "domainName": "Düzenleyici Olaylar ve Kolluk Talepleri",
   "section": "Kolluk Talepleri",
   "text": "Kolluk ve yargı bilgi talepleri için tanımlı bir sorumlu ve SLA var mı?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Prosedür, SLA tanımı",
   "source": "5549 s.K. m.7",
   "qa": true,
   "pop": "Alınan bilgi talepleri"
  },
  {
   "id": "D9-07",
   "domain": "D9",
   "domainName": "Düzenleyici Olaylar ve Kolluk Talepleri",
   "section": "Kolluk Talepleri",
   "text": "Taleplere verilen yanıtların eksiksizliği ve süresi ölçülüyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Yanıt süre raporu",
   "source": "İç raporlama",
   "qa": true,
   "pop": "Yanıtlanan talepler"
  },
  {
   "id": "D9-08",
   "domain": "D9",
   "domainName": "Düzenleyici Olaylar ve Kolluk Talepleri",
   "section": "Kolluk Talepleri",
   "text": "Kolluk talebine konu müşteriler için risk derecelendirmesi ve izleme gözden geçiriliyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Gözden geçirme kaydı",
   "source": "FATF R.10 IN",
   "qa": true,
   "pop": "Kolluk talebine konu müşteriler"
  },
  {
   "id": "D9-09",
   "domain": "D9",
   "domainName": "Düzenleyici Olaylar ve Kolluk Talepleri",
   "section": "Kolluk Talepleri",
   "text": "Kolluk talebi bilgisinin bilgi verme yasağını ihlal etmeyecek şekilde yönetimi sağlanıyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Erişim kısıtı, prosedür",
   "source": "5549 s.K. m.5",
   "qa": true,
   "pop": "Kolluk talebi dosyaları"
  },
  {
   "id": "D9-10",
   "domain": "D9",
   "domainName": "Düzenleyici Olaylar ve Kolluk Talepleri",
   "section": "Kurumlar Arası Talep",
   "text": "Muhabir ve karşı kurumlardan gelen bilgi talepleri (RFI) merkezi olarak yönetiliyor ve süreleri izleniyor mu?",
   "weight": 3,
   "crit": "Orta",
   "evidence": "RFI kayıt sistemi",
   "source": "Wolfsberg CBDDQ",
   "qa": true,
   "pop": "Gelen RFI'lar"
  },
  {
   "id": "D9-11",
   "domain": "D9",
   "domainName": "Düzenleyici Olaylar ve Kolluk Talepleri",
   "section": "Kurumlar Arası Talep",
   "text": "Muhabir bankalardan gelen AML anketleri merkezi ve tutarlı şekilde yanıtlanıyor mu?",
   "weight": 3,
   "crit": "Orta",
   "evidence": "Yanıtlanan anketler",
   "source": "Wolfsberg CBDDQ",
   "qa": true,
   "pop": "Yanıtlanan anketler"
  },
  {
   "id": "D9-12",
   "domain": "D9",
   "domainName": "Düzenleyici Olaylar ve Kolluk Talepleri",
   "section": "Mevzuat Takibi",
   "text": "Mevzuat değişikliklerini izleyen bir süreç (horizon scanning) tanımlı mı?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Mevzuat takip kaydı",
   "source": "İç kontrol standardı",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D9-13",
   "domain": "D9",
   "domainName": "Düzenleyici Olaylar ve Kolluk Talepleri",
   "section": "Mevzuat Takibi",
   "text": "Mevzuat değişiklikleri için etki analizi ve uygulama planı çıkarılıyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Etki analizi dokümanları",
   "source": "İç kontrol standardı",
   "qa": true,
   "pop": "Son 12 aydaki değişiklikler"
  },
  {
   "id": "D9-14",
   "domain": "D9",
   "domainName": "Düzenleyici Olaylar ve Kolluk Talepleri",
   "section": "Tipoloji Takibi",
   "text": "Sektör tipoloji yayınları (MASAK, FATF, Egmont, FIU uyarıları) senaryo geliştirmede kullanılıyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Kaynak-senaryo eşleme kaydı",
   "source": "FATF/Egmont tipoloji raporları",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D10-01",
   "domain": "D10",
   "domainName": "Eğitim, Farkındalık ve Yönetim Geri Bildirimi",
   "section": "Eğitim Planı",
   "text": "Yıllık eğitim planı hazırlanıyor ve yönetim kurulunca onaylanıyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Onaylı eğitim planı",
   "source": "Uyum Programı Yön. m.13",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D10-02",
   "domain": "D10",
   "domainName": "Eğitim, Farkındalık ve Yönetim Geri Bildirimi",
   "section": "Eğitim Planı",
   "text": "Eğitim rol bazlı olarak farklılaştırılmış mı (şube, uyum, hazine, trade finance, üst yönetim)?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Müfredat matrisi",
   "source": "FATF R.18",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D10-03",
   "domain": "D10",
   "domainName": "Eğitim, Farkındalık ve Yönetim Geri Bildirimi",
   "section": "Eğitim Planı",
   "text": "İşe yeni başlayanlar için zorunlu oryantasyon eğitimi ve tamamlama süresi tanımlı mı?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Oryantasyon kayıtları",
   "source": "Uyum Programı Yön. m.13",
   "qa": true,
   "pop": "Son 12 ayda işe başlayanlar"
  },
  {
   "id": "D10-04",
   "domain": "D10",
   "domainName": "Eğitim, Farkındalık ve Yönetim Geri Bildirimi",
   "section": "Eğitim Planı",
   "text": "Acente, temsilci ve dış hizmet sağlayıcı personeli eğitim kapsamında mı?",
   "weight": 3,
   "crit": "Orta",
   "evidence": "Eğitim katılım listesi",
   "source": "FATF R.14",
   "qa": true,
   "pop": "Acente personeli"
  },
  {
   "id": "D10-05",
   "domain": "D10",
   "domainName": "Eğitim, Farkındalık ve Yönetim Geri Bildirimi",
   "section": "Katılım ve Takip",
   "text": "Eğitim tamamlanma oranı takip ediliyor ve tam katılım hedefleniyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Tamamlanma raporu",
   "source": "Uyum Programı Yön.",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D10-06",
   "domain": "D10",
   "domainName": "Eğitim, Farkındalık ve Yönetim Geri Bildirimi",
   "section": "Katılım ve Takip",
   "text": "Eğitimi tamamlamayanlar için eskalasyon veya sonuç yönetimi uygulanıyor mu?",
   "weight": 3,
   "crit": "Orta",
   "evidence": "Eskalasyon kayıtları",
   "source": "İç kontrol standardı",
   "qa": true,
   "pop": "Tamamlamayan personel"
  },
  {
   "id": "D10-07",
   "domain": "D10",
   "domainName": "Eğitim, Farkındalık ve Yönetim Geri Bildirimi",
   "section": "Katılım ve Takip",
   "text": "Eğitim kayıtları denetime hazır şekilde arşivleniyor mu?",
   "weight": 3,
   "crit": "Orta",
   "evidence": "Arşiv örneği",
   "source": "FATF R.11",
   "qa": true,
   "pop": "Eğitim kayıtları"
  },
  {
   "id": "D10-08",
   "domain": "D10",
   "domainName": "Eğitim, Farkındalık ve Yönetim Geri Bildirimi",
   "section": "Etkinlik",
   "text": "Eğitimin etkinliği sınav veya vaka çalışmasıyla ölçülüyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Sınav sonuçları",
   "source": "Wolfsberg Culture Statement",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D10-09",
   "domain": "D10",
   "domainName": "Eğitim, Farkındalık ve Yönetim Geri Bildirimi",
   "section": "Etkinlik",
   "text": "Eğitim içeriği kurumun kendi tipolojileri ve gerçek vakalarıyla güncelleniyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "İçerik revizyon kaydı",
   "source": "EWRA çıktıları",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D10-10",
   "domain": "D10",
   "domainName": "Eğitim, Farkındalık ve Yönetim Geri Bildirimi",
   "section": "Etkinlik",
   "text": "Mevzuat değişikliklerinde ek veya aciliyet eğitimi veriliyor mu?",
   "weight": 3,
   "crit": "Orta",
   "evidence": "Ek eğitim kayıtları",
   "source": "İç kontrol standardı",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D10-11",
   "domain": "D10",
   "domainName": "Eğitim, Farkındalık ve Yönetim Geri Bildirimi",
   "section": "Etkinlik",
   "text": "Çalışanlardan gelen dahili şüphe bildirimlerinin sayısı farkındalık göstergesi olarak izleniyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Dahili bildirim istatistiği",
   "source": "Wolfsberg Effectiveness Statement",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D10-12",
   "domain": "D10",
   "domainName": "Eğitim, Farkındalık ve Yönetim Geri Bildirimi",
   "section": "Yönetim Geri Bildirimi",
   "text": "Uyum görevlisi en az yılda bir yönetim kuruluna kapsamlı sunum yapıyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "YK toplantı tutanakları",
   "source": "Uyum Programı Yön. m.17",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D10-13",
   "domain": "D10",
   "domainName": "Eğitim, Farkındalık ve Yönetim Geri Bildirimi",
   "section": "Yönetim Geri Bildirimi",
   "text": "Yönetim geri bildirim döngüsü (rapor - karar - aksiyon - kapanış) belgeleniyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Karar ve aksiyon kayıtları",
   "source": "Basel AML Guidelines",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D10-14",
   "domain": "D10",
   "domainName": "Eğitim, Farkındalık ve Yönetim Geri Bildirimi",
   "section": "Yönetim Geri Bildirimi",
   "text": "Üst yönetim ve yönetim kuruluna özel AML farkındalık oturumu düzenleniyor mu?",
   "weight": 3,
   "crit": "Orta",
   "evidence": "Oturum kayıtları",
   "source": "Basel AML Guidelines",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D11-01",
   "domain": "D11",
   "domainName": "Kurumsal Risk Değerlendirmesi (EWRA)",
   "section": "Metodoloji",
   "text": "Kurumsal risk değerlendirmesi yazılı ve onaylı bir metodolojiye dayanıyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "EWRA metodoloji dokümanı",
   "source": "FATF R.1; Uyum Programı Yön. m.5",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D11-02",
   "domain": "D11",
   "domainName": "Kurumsal Risk Değerlendirmesi (EWRA)",
   "section": "Metodoloji",
   "text": "EWRA en az yılda bir ve önemli değişikliklerde güncelleniyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Son EWRA tarihi, revizyon kaydı",
   "source": "FATF R.1",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D11-03",
   "domain": "D11",
   "domainName": "Kurumsal Risk Değerlendirmesi (EWRA)",
   "section": "Kapsam",
   "text": "EWRA müşteri, ürün/hizmet, coğrafya, kanal ve işlem boyutlarının tamamını kapsıyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "EWRA raporu",
   "source": "FATF R.1 IN",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D11-04",
   "domain": "D11",
   "domainName": "Kurumsal Risk Değerlendirmesi (EWRA)",
   "section": "Kapsam",
   "text": "Terör finansmanı riski aklama riskinden ayrı olarak değerlendiriliyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "TF risk bölümü",
   "source": "FATF R.1; 6415 s.K.",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D11-05",
   "domain": "D11",
   "domainName": "Kurumsal Risk Değerlendirmesi (EWRA)",
   "section": "Kapsam",
   "text": "Kitle imha silahlarının yayılmasının finansmanı (PF) riski değerlendiriliyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "PF risk bölümü",
   "source": "FATF R.1 (2020 revizyonu), R.7",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D11-06",
   "domain": "D11",
   "domainName": "Kurumsal Risk Değerlendirmesi (EWRA)",
   "section": "Skorlama",
   "text": "Doğuştan risk ve kontrol etkinliği ayrı ayrı skorlanıp artık risk hesaplanıyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Skorlama tablosu",
   "source": "FATF R.1; EBA GL",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D11-07",
   "domain": "D11",
   "domainName": "Kurumsal Risk Değerlendirmesi (EWRA)",
   "section": "Skorlama",
   "text": "Kontrol etkinliği skoru beyan yerine bağımsız test bulgularıyla destekleniyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Test bulguları referansı",
   "source": "Wolfsberg Effectiveness Statement",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D11-08",
   "domain": "D11",
   "domainName": "Kurumsal Risk Değerlendirmesi (EWRA)",
   "section": "Skorlama",
   "text": "Değerlendirmede kullanılan veriler doğrulanabilir kaynaklara dayanıyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Veri kaynağı listesi",
   "source": "BCBS 239",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D11-09",
   "domain": "D11",
   "domainName": "Kurumsal Risk Değerlendirmesi (EWRA)",
   "section": "Skorlama",
   "text": "EWRA varsayımları ve sınırlamaları açıkça belirtiliyor mu?",
   "weight": 3,
   "crit": "Orta",
   "evidence": "Varsayım bölümü",
   "source": "Model risk yönetimi",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D11-10",
   "domain": "D11",
   "domainName": "Kurumsal Risk Değerlendirmesi (EWRA)",
   "section": "Girdi Kaynakları",
   "text": "Ulusal risk değerlendirmesi ve sektör raporları girdi olarak kullanılıyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Kaynak referansları",
   "source": "FATF R.1 (NRA kullanımı)",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D11-11",
   "domain": "D11",
   "domainName": "Kurumsal Risk Değerlendirmesi (EWRA)",
   "section": "Risk İştahı",
   "text": "Risk iştahı yazılı olarak tanımlanmış ve ölçülebilir limitlerle ifade edilmiş mi?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Risk iştahı beyanı",
   "source": "Basel AML Guidelines",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D11-12",
   "domain": "D11",
   "domainName": "Kurumsal Risk Değerlendirmesi (EWRA)",
   "section": "Risk İştahı",
   "text": "Artık riskin iştahı aştığı alanlar için aksiyon planı oluşturuluyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Aksiyon planı",
   "source": "FATF R.1",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D11-13",
   "domain": "D11",
   "domainName": "Kurumsal Risk Değerlendirmesi (EWRA)",
   "section": "Etki",
   "text": "EWRA sonuçları senaryolar, eşikler ve KYC frekanslarını fiilen etkiliyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "Değişiklik kayıtları (EWRA referanslı)",
   "source": "FATF R.1 IN",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D11-14",
   "domain": "D11",
   "domainName": "Kurumsal Risk Değerlendirmesi (EWRA)",
   "section": "Yönetişim",
   "text": "EWRA yönetim kurulu tarafından onaylanıyor mu?",
   "weight": 5,
   "crit": "Kritik",
   "evidence": "YK onay kararı",
   "source": "Uyum Programı Yön.",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D11-15",
   "domain": "D11",
   "domainName": "Kurumsal Risk Değerlendirmesi (EWRA)",
   "section": "Yönetişim",
   "text": "Şube ve iştirak bazlı risk skorları konsolide ediliyor mu?",
   "weight": 3,
   "crit": "Orta",
   "evidence": "Konsolidasyon tablosu",
   "source": "FATF R.18",
   "qa": false,
   "pop": ""
  },
  {
   "id": "D11-16",
   "domain": "D11",
   "domainName": "Kurumsal Risk Değerlendirmesi (EWRA)",
   "section": "Yönetişim",
   "text": "Önceki EWRA aksiyonlarının kapanış durumu bir sonraki döngüde raporlanıyor mu?",
   "weight": 4,
   "crit": "Yüksek",
   "evidence": "Kapanış raporu",
   "source": "İç kontrol standardı",
   "qa": false,
   "pop": ""
  }
 ],
 "domains": [
  {
   "code": "D1",
   "name": "Yönetişim ve Uyum Programı"
  },
  {
   "code": "D2",
   "name": "Müşteri Profili ve Coğrafi Risk"
  },
  {
   "code": "D3",
   "name": "Ürün ve Kanal Riski"
  },
  {
   "code": "D4",
   "name": "İşlem Evreni ve Veri Bütünlüğü"
  },
  {
   "code": "D5",
   "name": "Müşteri Yaşam Döngüsü (CDD/EDD)"
  },
  {
   "code": "D6",
   "name": "Finansal Yaptırımlar ve Tarama"
  },
  {
   "code": "D7",
   "name": "AML İzleme (Monitoring)"
  },
  {
   "code": "D8",
   "name": "ŞİB, Dondurma ve Müşteri Çıkışı"
  },
  {
   "code": "D9",
   "name": "Düzenleyici Olaylar ve Kolluk Talepleri"
  },
  {
   "code": "D10",
   "name": "Eğitim, Farkındalık ve Yönetim Geri Bildirimi"
  },
  {
   "code": "D11",
   "name": "Kurumsal Risk Değerlendirmesi (EWRA)"
  }
 ],
 "residualSource": {
  "D1": "Genel ortalama",
  "D2": "Müşteri + Coğrafya",
  "D3": "Ürün + Kanal",
  "D4": "İşlem",
  "D5": "Müşteri",
  "D6": "Coğrafya ve Yaptırım",
  "D7": "İşlem + Ürün",
  "D8": "Müşteri + İşlem",
  "D9": "Genel ortalama",
  "D10": "Genel ortalama",
  "D11": "Genel ortalama"
 },
 "appetite": {
  "D1": 1.5,
  "D2": 1.5,
  "D3": 1.5,
  "D4": 1.5,
  "D5": 1.5,
  "D6": 1.5,
  "D7": 1.5,
  "D8": 1.5,
  "D9": 1.5,
  "D10": 1.5,
  "D11": 1.5
 },
 "qaPopulations": [
  {
   "pop": "Verilen ŞİB dosyaları",
   "domain": "D8",
   "risk": "Çok Yüksek",
   "full": true,
   "rate": 1.0,
   "min": 0,
   "freq": "Çeyreklik",
   "focus": "Süre, narratif kalitesi, artırılmış izleme"
  },
  {
   "pop": "ŞİB verilmeyen ancak eşiği geçen kapatılmış vakalar",
   "domain": "D8",
   "risk": "Çok Yüksek",
   "full": false,
   "rate": 0.15,
   "min": 25,
   "freq": "Çeyreklik",
   "focus": "Karar gerekçesi yeterli mi, kaçırılmış ŞİB var mı"
  },
  {
   "pop": "Dondurma ve varlık kısıtlama kararları",
   "domain": "D8",
   "risk": "Çok Yüksek",
   "full": true,
   "rate": 1.0,
   "min": 0,
   "freq": "Çeyreklik",
   "focus": "Uygulama süresi, bildirim, envanter mutabakatı"
  },
  {
   "pop": "Yaptırım gerçek eşleşme (true match) vakaları",
   "domain": "D6",
   "risk": "Çok Yüksek",
   "full": true,
   "rate": 1.0,
   "min": 0,
   "freq": "Çeyreklik",
   "focus": "Blokaj/red kararı, bildirim, audit trail"
  },
  {
   "pop": "Kapatılan yaptırım alertleri",
   "domain": "D6",
   "risk": "Çok Yüksek",
   "full": false,
   "rate": 0.1,
   "min": 30,
   "freq": "Çeyreklik",
   "focus": "Dört göz, gerekçe kalitesi, yanlış negatif"
  },
  {
   "pop": "PEP müşteri dosyaları",
   "domain": "D5",
   "risk": "Çok Yüksek",
   "full": true,
   "rate": 1.0,
   "min": 0,
   "freq": "Altı Aylık",
   "focus": "Onay, SoF/SoW, periyodik gözden geçirme"
  },
  {
   "pop": "Müşteri çıkış (exit) kararları",
   "domain": "D8",
   "risk": "Çok Yüksek",
   "full": true,
   "rate": 1.0,
   "min": 0,
   "freq": "Altı Aylık",
   "focus": "ŞİB değerlendirmesi, onay, bakiye iadesi"
  },
  {
   "pop": "Kolluk ve yargı bilgi talepleri",
   "domain": "D9",
   "risk": "Çok Yüksek",
   "full": true,
   "rate": 1.0,
   "min": 0,
   "freq": "Çeyreklik",
   "focus": "Yanıt süresi, eksiksizlik, risk gözden geçirme"
  },
  {
   "pop": "EDD dosyaları",
   "domain": "D5",
   "risk": "Yüksek",
   "full": false,
   "rate": 0.1,
   "min": 25,
   "freq": "Çeyreklik",
   "focus": "SoF/SoW kanıtı, onay, adverse media"
  },
  {
   "pop": "Kapatılan izleme (monitoring) alertleri",
   "domain": "D7",
   "risk": "Yüksek",
   "full": false,
   "rate": 0.05,
   "min": 30,
   "freq": "Çeyreklik",
   "focus": "Karar kalitesi, kaçırılmış tipoloji, bulk kapatma"
  },
  {
   "pop": "Yüksek riskli yeni müşteri hesap açılışları",
   "domain": "D5",
   "risk": "Yüksek",
   "full": false,
   "rate": 0.1,
   "min": 25,
   "freq": "Çeyreklik",
   "focus": "CDD tamlığı, GF tespiti, üst yönetim onayı"
  },
  {
   "pop": "Muhabir banka ilişkileri",
   "domain": "D2",
   "risk": "Yüksek",
   "full": true,
   "rate": 1.0,
   "min": 0,
   "freq": "Yıllık",
   "focus": "CBDDQ, üst yönetim onayı, nested tespiti"
  },
  {
   "pop": "Trade finance dosyaları",
   "domain": "D6",
   "risk": "Yüksek",
   "full": false,
   "rate": 0.1,
   "min": 20,
   "freq": "Altı Aylık",
   "focus": "Mal/gemi/liman taraması, dual-use, fiyat makullüğü"
  },
  {
   "pop": "Risk skoru override edilen müşteriler",
   "domain": "D5",
   "risk": "Yüksek",
   "full": false,
   "rate": 0.15,
   "min": 20,
   "freq": "Altı Aylık",
   "focus": "Gerekçe, onay seviyesi, örüntü analizi"
  },
  {
   "pop": "Gecikmiş periyodik KYC dosyaları",
   "domain": "D5",
   "risk": "Yüksek",
   "full": false,
   "rate": 0.1,
   "min": 20,
   "freq": "Çeyreklik",
   "focus": "Gecikme nedeni, kısıtlama uygulanmış mı"
  },
  {
   "pop": "Uzaktan açılan hesaplar",
   "domain": "D3",
   "risk": "Yüksek",
   "full": false,
   "rate": 0.05,
   "min": 25,
   "freq": "Altı Aylık",
   "focus": "Canlılık, belge doğrulama, sahtecilik tespiti"
  },
  {
   "pop": "Eksik bilgili elektronik transferler",
   "domain": "D4",
   "risk": "Yüksek",
   "full": false,
   "rate": 0.1,
   "min": 20,
   "freq": "Çeyreklik",
   "focus": "R.16 uyumu, askıya alma/iade kararı"
  },
  {
   "pop": "Sanal varlık transferleri",
   "domain": "D3",
   "risk": "Yüksek",
   "full": false,
   "rate": 0.1,
   "min": 20,
   "freq": "Çeyreklik",
   "focus": "Travel Rule, unhosted cüzdan kontrolü"
  },
  {
   "pop": "Standart yeni müşteri hesap açılışları",
   "domain": "D5",
   "risk": "Orta",
   "full": false,
   "rate": 0.02,
   "min": 30,
   "freq": "Altı Aylık",
   "focus": "Kimlik doğrulama, veri kalitesi"
  },
  {
   "pop": "Eşik üstü nakit işlemler",
   "domain": "D3",
   "risk": "Orta",
   "full": false,
   "rate": 0.02,
   "min": 25,
   "freq": "Altı Aylık",
   "focus": "Kimlik tespiti, kaynak sorgusu"
  },
  {
   "pop": "Reddedilen müşteri başvuruları",
   "domain": "D8",
   "risk": "Orta",
   "full": false,
   "rate": 0.1,
   "min": 15,
   "freq": "Yıllık",
   "focus": "Red gerekçesi, ŞİB değerlendirmesi, tekrar başvuru"
  },
  {
   "pop": "Eğitim tamamlama kayıtları",
   "domain": "D10",
   "risk": "Düşük",
   "full": false,
   "rate": 0.05,
   "min": 15,
   "freq": "Yıllık",
   "focus": "Katılım, sınav sonucu, arşiv"
  },
  {
   "pop": "Kapatılan denetim ve validasyon bulguları",
   "domain": "D9",
   "risk": "Yüksek",
   "full": true,
   "rate": 1.0,
   "min": 0,
   "freq": "Altı Aylık",
   "focus": "Kapanış kanıtı, bağımsız re-test"
  },
  {
   "pop": "Veri mutabakatı ve besleme hatası kayıtları",
   "domain": "D4",
   "risk": "Yüksek",
   "full": false,
   "rate": 0.1,
   "min": 20,
   "freq": "Çeyreklik",
   "focus": "Fark açıklaması, yeniden işleme, telafi"
  }
 ],
 "kpis": [
  {
   "name": "Alert - vaka dönüşüm oranı",
   "source": "İzleme sistemi raporu"
  },
  {
   "name": "Vaka - ŞİB dönüşüm oranı",
   "source": "Vaka yönetim sistemi"
  },
  {
   "name": "Ortalama ŞİB bildirim süresi (gün)",
   "source": "ŞİB kayıtları"
  },
  {
   "name": "Yaptırım alerti ortalama kapanış süresi (saat)",
   "source": "Tarama sistemi"
  },
  {
   "name": "Liste güncelleme yansıma süresi (saat)",
   "source": "Tarama sistemi logları"
  },
  {
   "name": "Bekleyen alert sayısı (backlog)",
   "source": "İzleme sistemi raporu"
  },
  {
   "name": "Gecikmiş periyodik KYC dosya sayısı",
   "source": "KYC yaşlandırma raporu"
  },
  {
   "name": "QA kritik hata oranı",
   "source": "QA test sonuçları"
  },
  {
   "name": "QA majör hata oranı",
   "source": "QA test sonuçları"
  },
  {
   "name": "Eğitim tamamlanma oranı",
   "source": "Eğitim yönetim sistemi"
  },
  {
   "name": "Dahili şüphe bildirimi sayısı",
   "source": "Uyum birimi kayıtları"
  },
  {
   "name": "Kolluk talebi ortalama yanıt süresi (gün)",
   "source": "Talep kayıt sistemi"
  },
  {
   "name": "Aksiyon kapanış oranı",
   "source": "07_Aksiyon_Plani"
  },
  {
   "name": "Son senaryo tuning üzerinden geçen süre (ay)",
   "source": "Model yönetim kaydı"
  },
  {
   "name": "Son tarama kalibrasyonu üzerinden geçen süre (ay)",
   "source": "Model yönetim kaydı"
  }
 ],
 "ref": {
  "answers": [
   "Evet",
   "Kısmen",
   "Hayır",
   "Uygulanamaz"
  ],
  "crit": [
   "Kritik",
   "Yüksek",
   "Orta",
   "Düşük"
  ],
  "rootCause": [
   "Politika",
   "Süreç",
   "Sistem",
   "Veri",
   "İnsan/Kapasite",
   "Yönetişim",
   "Üçüncü Taraf"
  ],
  "status": [
   "Açık",
   "Devam Ediyor",
   "Doğrulama Bekliyor",
   "Kapalı",
   "Kabul Edilen Risk"
  ],
  "riskLevel": [
   "Çok Yüksek",
   "Yüksek",
   "Orta",
   "Düşük"
  ],
  "freq": [
   "Çeyreklik",
   "Altı Aylık",
   "Yıllık"
  ],
  "maturity": [
   "Gelişmiş",
   "Yeterli",
   "Gelişime Açık",
   "Zayıf",
   "Kritik Zayıf"
  ],
  "sla": {
   "Kritik": 5,
   "Yüksek": 30,
   "Orta": 90,
   "Düşük": 180
  }
 },
 "scopeRules": [
  {
   "field": "trade_finance_faaliyeti_var_mi",
   "match": [
    [
     "D6",
     "Trade Finance"
    ]
   ],
   "label": "Trade finance"
  },
  {
   "field": "muhabir_bankacilik_var_mi",
   "match": [
    [
     "D2",
     "Muhabir Bankacılık"
    ]
   ],
   "label": "Muhabir bankacılık"
  },
  {
   "field": "sanal_varlik_faaliyeti_var_mi",
   "match": [
    [
     "D3",
     "Sanal Varlık"
    ]
   ],
   "label": "Sanal varlık"
  },
  {
   "field": "uzaktan_musteri_kabulu_var_mi",
   "match": [
    [
     "D3",
     "Dijital Kanal"
    ]
   ],
   "label": "Uzaktan müşteri kabulü"
  },
  {
   "field": "acente_temsilci_agi_var_mi",
   "match": [
    [
     "D3",
     "Aracılı Kanal"
    ],
    [
     "D1",
     "Dış Hizmet ve Acente"
    ]
   ],
   "label": "Acente/temsilci ağı"
  }
 ],
 "dimDomains": {
  "Müşteri": [
   "D2",
   "D5",
   "D8"
  ],
  "Coğrafya ve Yaptırım": [
   "D2",
   "D6"
  ],
  "Ürün": [
   "D3",
   "D7"
  ],
  "Kanal": [
   "D3"
  ],
  "İşlem": [
   "D4",
   "D7",
   "D8"
  ]
 },
 "dimNote": "Doğuştan risk, kontrollerin etkisinden bağımsız olarak kurumun maruz kaldığı yapısal risktir. Kontrollerin ne kadar iyi çalıştığı bu sayfada değil, soru bankasında ölçülür."
};
