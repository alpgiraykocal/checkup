# AML/CFT Uyum Check-up

Uyum uzmanının tek başına çalıştırabileceği, kanıta dayalı AML/CFT uyum değerlendirme uygulaması.
Kaynak: `AML_Uyum_Checkup_Anket_QA_Aksiyon.xlsx` + `Anket.docx` (mimari notları).

## Çalıştırma

`index.html` dosyasını çift tıklayın. Kurulum, sunucu veya internet bağlantısı gerekmez.

## Veri ve gizlilik

- Tüm veriler yalnızca tarayıcının `localStorage` alanında tutulur; hiçbir ağ isteği yapılmaz (harici font, CDN veya analitik yoktur).
- Yedek ve cihaz değişimi için **Veri ve yedekleme → JSON indir** kullanılır; aynı ekrandan geri yüklenir.
- Tarayıcı verisi temizlenirse çalışma kaybolur. Her oturum sonunda JSON yedeği alın.
- Tarayıcı profili paylaşılan bir makinede kullanılıyorsa, veriler o profili açan herkesçe görülebilir.

## Akış

| Sıra | Ekran | Ne yapılır |
|---|---|---|
| 1 | **Künye** | Kurum profili. Faaliyet sorularına "Hayır" yanıtı ilgili soru bölümlerini otomatik "Uygulanamaz" yapar. |
| 2 | **Doğuştan Risk** | 5 boyut, 25 alt faktör. Her faktör için 1–5 skor rubriği, gerekçe/kanıt alanı, "Uygulanamaz" seçeneği, düzenlenebilir ağırlık ve künyeden skor önerisi. Baskın risk sürücüleri listelenir. |
| 3 | **Anket** | 218 soru, 11 domain. Yanıt + kanıt referansı + bulgu notu. |
| 4 | **QA Planı** | 24 popülasyon için yıllık hacim girilir; örneklem ve test başına örneklem otomatik hesaplanır. |
| 5 | **Kontrol Skorları** | Türetilmiş; girdi yoktur. Domain bazlı kontrol etkinliği ve olgunluk. |
| 6 | **Artık Risk** | Doğuştan risk × (1 − kontrol etkinliği), iştah limiti karşılaştırması. |
| 7 | **Aksiyon Planı** | Bulgu → kök neden → aksiyon → sahip → termin → doğrulama. Eksik kontrollerden toplu taslak üretilebilir. |
| 8 | **Yönetici Raporu** | Yazdırma / PDF çıktısı. |

QA testi sonucunda beyan ile dosya bulgusu çelişiyorsa ilgili sorunun yanıtı "Kısmen" veya "Hayır" olarak güncellenmelidir. Anket beyanı tek başına kontrol etkinliği sayılmaz.

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
index.html          kabuk ve gezinme
css/app.css         tasarım sistemi, açık/koyu tema, yazdırma stilleri
js/data.js          xlsx'ten üretilmiş veri (218 soru, 25 faktör, 24 popülasyon, 15 KPI)
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
