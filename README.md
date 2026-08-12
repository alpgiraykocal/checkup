# AML/CFT Uyum Check-up

Uyum uzmanının tek başına çalıştırabileceği, kanıta dayalı AML/CFT uyum değerlendirme uygulaması.
Kaynak: `AML_Uyum_Checkup_Anket_QA_Aksiyon.xlsx` + `Anket.docx` (mimari notları).

> English summary at the bottom of this file.

## Çalıştırma

`index.html` dosyasını çift tıklayın. Kurulum, sunucu veya internet bağlantısı gerekmez.
Yayındaki sürüm: <https://checkup.alpgiraykocal.com>

## Dil

Sayfanın üst kısmındaki **TR / EN** düğmesi arayüzün tamamını değiştirir: menüler, başlıklar,
218 sorunun tamamı, beklenen kanıtlar, mevzuat atıfları, 25 risk faktörü ve skor rehberleri,
24 QA popülasyonu, künye alanları, KPI'lar, uyarı metinleri, CSV başlıkları ve dosya adları.

Seçim tarayıcıda saklanır. **Depolanan veriler dilden bağımsızdır**: yanıtlar, skorlar ve
aksiyon kayıtları her zaman aynı iç anahtarlarla tutulur, bu yüzden dil değiştirmek hiçbir
hesabı ya da kaydı bozmaz — doğrulandı: iki dilde kontrol etkinliği, doğuştan risk ve örneklem
sonuçları birebir aynı.

## Veri ve gizlilik

- Tüm veriler yalnızca tarayıcının `localStorage` alanında tutulur; hiçbir ağ isteği yapılmaz (harici font, CDN veya analitik yoktur).
- Yedek ve cihaz değişimi için **Veri ve yedekleme → JSON indir** kullanılır; aynı ekrandan geri yüklenir.
- Tarayıcı verisi temizlenirse çalışma kaybolur. Her oturum sonunda JSON yedeği alın.
- Tarayıcı profili paylaşılan bir makinede kullanılıyorsa, veriler o profili açan herkesçe görülebilir.

## Akış

| Sıra | Ekran | Ne yapılır |
|---|---|---|
| 1 | **Künye** | Kurum profili, altı gruba ayrılmış 26 alan. Her alanda örnek değer ve ne yazılacağını anlatan açıklama var. Faaliyet sorularına "Hayır" yanıtı ilgili soru bölümlerini otomatik "Uygulanamaz" yapar. Girilen sayılardan oranlar ve tarih yaşlandırma uyarıları türetilir. |
| 2 | **Doğuştan Risk** | 5 boyut, 25 alt faktör. Her faktör için 1–5 skor rubriği, gerekçe/kanıt alanı, "Uygulanamaz" seçeneği, düzenlenebilir ağırlık ve künyeden skor önerisi. Baskın risk sürücüleri listelenir. |
| 3 | **Anket** | 218 soru, 11 domain. Yanıt + kanıt referansı + bulgu notu. |
| 4 | **QA Planı** | 24 popülasyon için yıllık hacim girilir; örneklem ve test başına örneklem otomatik hesaplanır. |
| 5 | **Kontrol Skorları** | Türetilmiş; girdi yoktur. Domain bazlı kontrol etkinliği ve olgunluk. |
| 6 | **Artık Risk** | Doğuştan risk × (1 − kontrol etkinliği), iştah limiti karşılaştırması. |
| 7 | **Aksiyon Planı** | Bulgu → kök neden → aksiyon → sahip → termin → doğrulama. Eksik kontrollerden toplu taslak üretilebilir. |
| 8 | **Yönetici Raporu** | Yazdırma / PDF çıktısı. |

QA testi sonucunda beyan ile dosya bulgusu çelişiyorsa ilgili sorunun yanıtı "Kısmen" veya "Hayır" olarak güncellenmelidir. Anket beyanı tek başına kontrol etkinliği sayılmaz.

## Alanları doldurma rehberi

Her giriş alanının yanında ne yazılacağını anlatan bir açıklama ve örnek değer bulunur. Özet:

| Ekran | Ne girilir | Uygulama ne yapar |
|---|---|---|
| Künye — Ölçek | Dönem sonu müşteri sayısı, yüksek riskli ve PEP müşteri adedi, işlem adetleri, uyum kadrosu (FTE) | Oranları hesaplar ve doğuştan riskte dört faktör için skor önerir |
| Künye — Faaliyet kapsamı | Altı faaliyet sorusuna Evet/Hayır | "Hayır" seçilen faaliyetin soruları ve risk faktörü kapsam dışına çıkar |
| Künye — Denetim geçmişi | Son denetim, EWRA, senaryo tuning ve tarama kalibrasyon tarihleri | Yaşlandırma uyarısı üretir, iki KPI'yı otomatik doldurur |
| Doğuştan Risk | Her faktöre 1–5 skor, 4–5 skorlarda gerekçe | Rubrik metnini gösterir, boyut skorunu ve artık riski hesaplar |
| Anket | Yanıt, kanıt referansı, bulgu notu | Kontrol etkinliğini hesaplar; not, aksiyon kaydına taşınır |
| QA Planı | Her popülasyonun dönem içi toplam adedi | Örneklem büyüklüğünü ve test başına örneklemi hesaplar |
| Aksiyon Planı | Bulgu, kök neden, aksiyon, sahip, termin, doğrulama | Termini kritikliğe göre önerir, gecikmeyi ve eksik alanı işaretler |
| Pano — KPI | Hedef ve dönem ölçümü (birim alanın yanında yazılı) | Hedefe göre "Hedefte / Hedef dışı" durumu üretir; üç KPI otomatik hesaplanır |

Zorunlu alanlar yıldızla işaretlidir. Kaydetmeden önce aksiyon formu kök neden, sahip ve termini kontrol eder; künye eksik zorunlu alanları sayfa başında listeler.

## Hesaplama kuralları

Tümü kaynak çalışma kitabındaki formüllerle birebir aynıdır (`js/calc.js`).

**Cevap katsayısı** — Evet 1,00 · Kısmen 0,50 · Hayır 0,00 · Uygulanamaz skorlamadan tamamen çıkar.

**Kontrol etkinliği** = kazanılan puan / uygulanabilir toplam ağırlık (domain bazında).

**Olgunluk** — ≥ %90 Gelişmiş · ≥ %75 Yeterli · ≥ %60 Gelişime Açık · ≥ %40 Zayıf · < %40 Kritik Zayıf.

**Açık kritik soru** — kritikliği "Kritik" olup yanıtı "Evet" olmayan soru.

**Doğuştan risk (boyut)** = Σ(skor × ağırlık) / Σ(skorlanan faktörlerin ağırlığı). Uygulanamaz ve henüz skorlanmamış faktörler paydaya girmez; tüm faktörler skorlandığında sonuç kaynak çalışma kitabıyla birebir aynıdır (doğrulandı). Hiçbir faktör skorlanmamışsa boyut "ölçülmedi" sayılır ve o boyuttan beslenen domainlerin artık riski hesaplanmaz — sıfır göstermek yanıltıcı olurdu. GENEL = ölçülmüş boyut skorlarının aritmetik ortalaması.

**Skor çapaları** — 25 faktörün her biri için 1–5 arası ne anlama geldiğini tanımlayan rubrik vardır (ör. "Yüksek riskli müşteri payı %3–7" → 3). Skorlamayı tekrarlanabilir ve denetimde savunulabilir kılar. 4 ve 5 skorlarında gerekçe/kanıt alanı zorunlu sayılır ve eksikse uyarı verilir.

**Ağırlıklar** düzenlenebilir; değiştirilen ağırlık "ağırlık değiştirildi" etiketiyle işaretlenir ve CSV çıktısına varsayılanla birlikte yazılır. Tek tıkla varsayılana dönülür.

**Künye tabanlı öneri** — künyedeki sayılardan oran hesaplanabilen dört faktörde (yüksek riskli müşteri payı, PEP payı, sınır ötesi işlem payı ×2) önerilen skor gösterilir ve tek tıkla uygulanır. Öneri bağlayıcı değildir; gerekçe yine girilmelidir.

**Artık risk** = doğuştan risk × (1 − kontrol etkinliği). Seviye: ≥ 3,50 Çok Yüksek · ≥ 2,50 Yüksek · ≥ 1,50 Orta · < 1,50 Düşük. Varsayılan iştah limiti 1,50.

Domain başına doğuştan risk kaynağı: D1/D9/D10/D11 = GENEL · D2 = Müşteri + Coğrafya · D3 = Ürün + Kanal · D4 = İşlem · D5 = Müşteri · D6 = Coğrafya ve Yaptırım · D7 = İşlem + Ürün · D8 = Müşteri + İşlem.

**QA örneklem** — Tam kapsam "Evet" ise tüm popülasyon. Diğerlerinde `MİN(hacim, MAK(hacim × oran, asgari sayı))`. Test başına örneklem = yıllık örneklem / frekans (yukarı yuvarlanır; Çeyreklik 4, Altı Aylık 2, Yıllık 1).

**Bulgu kapanış SLA** — Kritik 5 iş günü · Yüksek 30 gün · Orta 90 gün · Düşük sonraki QA döngüsü. Yeni bulguda termin bu kurala göre önerilir, elle değiştirilebilir.

## Kapsam kuralları

Künyedeki "var mı?" sorularına "Hayır" yanıtı şu bölümleri kapsam dışına alır:

| Künye alanı | Kapsam dışı bölüm |
|---|---|
| Trade finance faaliyeti | D6 · Trade Finance |
| Muhabir bankacılık | D2 · Muhabir Bankacılık |
| Sanal varlık faaliyeti | D3 · Sanal Varlık |
| Uzaktan müşteri kabulü | D3 · Dijital Kanal |
| Acente/temsilci ağı | D3 · Aracılı Kanal, D1 · Dış Hizmet ve Acente |

Aynı yanıtlar doğuştan risk faktörlerini de kapsam dışına alır: trade finance → "Trade finance ürün hacmi", sanal varlık → "Sanal varlık ürün ve hizmetleri", muhabir bankacılık → "Muhabir bankacılık ağının coğrafi riski", uzaktan kabul → "Uzaktan müşteri kabul oranı", acente → "Acente ve temsilci kanalı payı".

Bir soruya veya faktöre elle değer girilirse otomatik kural o kayıt için geçersiz olur.

## Dışa aktarım

- **JSON** — tam çalışma dosyası, geri yüklenebilir.
- **CSV** — soru bankası, domain skorları, doğuştan risk, QA örneklem planı, aksiyon planı. Noktalı virgül ayracı ve BOM ile üretilir; Türkçe Excel yerelinde sütunlar doğru ayrışır.
- **Yazdır / PDF** — Yönetici Raporu ekranı.

## Dosya yapısı

```
index.html          kabuk, gezinme, dil değiştirici
css/app.css         tasarım sistemi, açık/koyu tema, yazdırma stilleri
js/data.js          xlsx'ten üretilmiş Türkçe veri (218 soru, 25 faktör, 24 popülasyon, 15 KPI)
js/data.en.js       İngilizce içerik katmanı (domain, bölüm, faktör, künye, KPI, QA, referanslar)
js/questions.en.js  218 sorunun İngilizce metni ve beklenen kanıtları
js/i18n.js          arayüz metinleri, dil uygulama motoru, mevzuat atıfı çeviri kuralları
js/store.js         durum yönetimi ve localStorage kalıcılığı
js/calc.js          skorlama motoru
js/ui.js            ikonlar, biçimlendirme, modal, toast
js/views.js         Pano, Künye, Doğuştan Risk, Anket, Kontrol Skorları, Artık Risk, QA
js/actions.js       Aksiyon planı (CRUD, SLA, toplu üretim)
js/export.js        JSON/CSV dışa aktarım, yönetici raporu
js/app.js           yönlendirme, tema, veri menüsü
```

## Varsayımlar ve sınırlar

- Kaynak sütunundaki mevzuat atıfları yön göstericidir; madde numaraları ve eşikler yürürlükteki metinlerle doğrulanmalıdır.
- Ağırlıklar, örneklem oranları ve asgari örneklem sayıları sektör uygulamasına dayalı başlangıç değerleridir; kurumun risk iştahına göre kalibre edilmelidir.
- Varsayılan iştah limiti (1,50) tüm domainler için aynıdır; kurumun onaylı risk iştahı ile değiştirilmelidir. Şu an bu değer `js/data.js` içindeki `appetite` alanından okunur.
- Araç tespit, önceliklendirme ve aksiyon üretir; bağımsız denetim yerine geçmez.


---

## English

**AML/CFT Compliance Check-up** — an evidence-based self-assessment tool for obliged entities.
Open `index.html`; no installation, server or internet connection is required. Live at
<https://checkup.alpgiraykocal.com>.

Use the **TR / EN** switch at the top of the page to change language. Everything is translated:
all 218 questions, expected evidence, regulatory citations, the 25 inherent risk factors with
their 1–5 scoring anchors, the 24 QA sampling populations, profile fields, KPIs, warnings and
CSV exports. Stored data is language-independent, so switching never affects any score or record.

| Step | Screen | What you do |
|---|---|---|
| 1 | Profile | Institution details. A "No" to a business scope question takes the related questions and risk factors out of scope. |
| 2 | Inherent Risk | Score 25 sub-factors from 1 to 5 against written anchors; rationale required for 4 and 5. |
| 3 | Questionnaire | Answer 218 questions with an evidence reference and a finding note. |
| 4 | QA Plan | Enter each population's volume for the period; sample sizes are calculated. |
| 5 | Control Scores | Derived control effectiveness and maturity per domain. |
| 6 | Residual Risk | Inherent risk × (1 − control effectiveness), compared against appetite. |
| 7 | Action Plan | Finding → root cause → action → owner → due date → verification. |
| 8 | Executive Report | Print or export to PDF. |

Scoring: Yes = 1.00 · Partial = 0.50 · No = 0.00 · Not applicable is excluded. Control
effectiveness = points earned / applicable weight. Maturity bands: ≥90% Advanced, ≥75% Adequate,
≥60% Needs improvement, ≥40% Weak, below that Critically weak. Residual risk levels: ≥3.50 Very
high, ≥2.50 High, ≥1.50 Medium, below that Low.

All data stays in the browser's local storage; nothing is sent to a server. Use **Data and
backup → Download JSON** to back up or move to another device.

Article references are indicative and must be checked against the legislation in force. The
weights, sampling rates and minimum sample sizes are starting values based on industry practice
and should be calibrated to the institution's approved risk methodology. The tool supports
detection, prioritisation and remediation tracking; it does not replace an independent audit.
