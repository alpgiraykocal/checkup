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
| 2 | **Portföy** | Müşteri dağılımı (7 tip × 4 risk seviyesi), 12 risk segmenti, ülke maruziyeti ve şube/birim ağı. Girilen sayılardan doğuştan risk için 12 faktöre skor önerisi üretilir. |
| 3 | **Doğuştan Risk** | 5 boyut, 25 alt faktör. Her faktör için 1–5 skor rubriği, gerekçe/kanıt alanı, "Uygulanamaz" seçeneği, düzenlenebilir ağırlık ve künyeden skor önerisi. Baskın risk sürücüleri listelenir. |
| 4 | **İşlem Detayı** | 8 grupta 101 operasyon ölçütü: işlem evreni, yaptırım taraması ve blokaj, trade finance, muhabir bankacılık, izleme, ŞİB/dondurma/kolluk, müşteri kabul, kalite güvence. 16 türetilen oran hesaplanır; 12 KPI otomatik dolar. |
| 5 | **Anket** | 218 soru, 11 domain. Yanıt + kanıt referansı + bulgu notu. |
| 6 | **QA Planı** | 24 popülasyon için yıllık hacim girilir; örneklem ve test başına örneklem otomatik hesaplanır. |
| 7 | **Kontrol Skorları** | Türetilmiş; girdi yoktur. Domain bazlı kontrol etkinliği ve olgunluk. |
| 8 | **Artık Risk** | Doğuştan risk × (1 − kontrol etkinliği), iştah limiti karşılaştırması. |
| 9 | **Aksiyon Planı** | Bulgu → kök neden → aksiyon → sahip → termin → doğrulama. Eksik kontrollerden toplu taslak üretilebilir. |
| 10 | **Yönetici Raporu** | Yazdırma / PDF çıktısı. |

QA testi sonucunda beyan ile dosya bulgusu çelişiyorsa ilgili sorunun yanıtı "Kısmen" veya "Hayır" olarak güncellenmelidir. Anket beyanı tek başına kontrol etkinliği sayılmaz.

## Portföy ve maruziyet

Dört tablo, dördü de isteğe bağlı; girdiğiniz kadarı kullanılır.

**Müşteri dağılımı** — 7 müşteri tipi (gerçek kişi, tüzel kişi, tüzel kişiliği olmayan teşekkül, trust benzeri yapı, finansal kuruluş, kamu, kâr amacı gütmeyen kuruluş) × 4 risk seviyesi. Toplam, yüksek riskli pay ve tüzel kişi payı buradan hesaplanır ve künyedeki müşteri sayısıyla tutarlılığı denetlenir.

**Risk segmentleri** — PEP, yerleşik olmayan, karmaşık sahiplik yapılı, nakit yoğun sektör, offshore yapılı, VASP, özel bankacılık, kâr amacı gütmeyen, yeni müşteri, reddedilen başvuru, exit ve atıl hesap. Her segment için müşteri ve yüksek riskli sayısı girilir.

**Ülke maruziyeti** — temas ettiğiniz her ülke: risk işaretleri (FATF kara/gri, kapsamlı yaptırım, AB yüksek riskli üçüncü ülke, offshore, zayıf AML), ilişki tipi (yurt içi, müşteri ikametgâhı, işlem karşı tarafı, muhabir, şube/iştirak, dış ticaret), müşteri sayısı ve gelen/giden işlem adedi. 90 ülkelik başlangıç listesi risk işaretleriyle birlikte gelir; işaretler değiştirilebilir ve tarihi ekranda belirtilir. "Yurt içi" işaretli ülkeler sınır ötesi payına girmez.

**Şube ve birim ağı** — genel müdürlük, şube, yurt dışı şube, iştirak, temsilcilik, acente ve dijital kanal. Her birim için ülke, müşteri sayısı, yüksek riskli müşteri, uyum FTE ve son denetim tarihi. FTE başına müşteri yükü ve 24 ayı aşan denetim yaşı otomatik işaretlenir.

### Beslenen faktörler

Bu tablolardan 12 doğuştan risk faktörü için skor önerisi üretilir:

| Kaynak | Beslediği faktör |
|---|---|
| Yüksek riskli müşteri payı | Müşteri — yüksek riskli segment payı |
| PEP segmenti | Müşteri — PEP maruziyeti |
| Yerleşik olmayan segmenti | Müşteri — non-resident oranı |
| Karmaşık sahiplik segmenti (taban: tüzel kişiler) | Müşteri — karmaşık sahiplik oranı |
| Nakit yoğun segmenti | Müşteri — nakit yoğun sektör payı |
| Offshore segmenti | Coğrafya — offshore bağlantılı hacim |
| Özel bankacılık segmenti | Ürün — servet yönetimi hacmi |
| FATF listeli ülke işlem payı | Coğrafya — FATF gri/kara liste iş hacmi |
| Yaptırım rejimi işlem payı | Coğrafya — yaptırım altındaki ülkelerle ticaret |
| İşaretli muhabir ülke payı | Coğrafya — muhabir ağının coğrafi riski |
| Sınır ötesi işlem payı | Coğrafya — sınır ötesi transfer payı · İşlem — sınır ötesi yoğunluk |

Öneriler bağlayıcı değildir: tek tıkla uygulanır, gerekçeyi yine siz yazarsınız. Portföy verisi yoksa künyedeki sayılar devreye girer.

## Ülke yönetimi

**Tüm ülke alanları açılır listeden gelir.** ISO 3166-1'in tamamı (211 ülke ve bölge) Türkçe ve İngilizce adlarıyla tanımlıdır; portföy ülke satırı ve şube ülkesi aynı listeyi kullanır. Seçenekte ülkenin en ağır risk işareti de görünür (ör. "İran (IR) — FATF kara").

**Risk sınıflandırması tek yerden yönetilir.** *Ayarlar > Ülke Risk Ayarları* ekranında her ülke için altı işaret açılıp kapatılır: FATF kara liste, FATF gri liste, kapsamlı yaptırım rejimi, AB yüksek riskli üçüncü ülke, offshore merkez, zayıf AML denetimi. 137 ülke işaretli olarak gelir; bunlar başlangıç değeridir ve tarihi ekranda yazar. Değiştirdiğiniz her ülke "kurum kararı" olarak etiketlenir, tek tıkla varsayılana döner.

Portföy ekranındaki ülke satırı artık işaret düzenlemiyor — yalnızca gösteriyor ve ayarlara bağlantı veriyor. Ayarlarda yaptığınız değişiklik anında tüm maruziyet hesaplarına yansır.

## İşlem ve operasyon detayı

Sekiz grup, 101 ölçüt. Her ölçüt adet, tutar, gün veya saat cinsinden girilir; hangi alanların açık olduğu ölçüte göre değişir.

| Grup | Kapsam |
|---|---|
| İşlem evreni | Toplam ve izlenen işlem, nakit, eşik üstü/altı, sınır ötesi giden-gelen, eksik bilgili transfer, askıya alınan, gözetimsiz kanal, acente, sanal varlık, unhosted cüzdan |
| Yaptırım taraması ve blokaj | Taranan müşteri ve işlem, müşteri/işlem alerti, true match, **bloke edilen işlem**, **reddedilen işlem**, serbest bırakılan, alert kapanış süresi, liste güncelleme ve yansıma süresi, rescreening, %50 kuralı tespiti, kesinti |
| Trade finance | İthalat/ihracat akreditifi, vesaik mukabili, teminat mektubu, kabul-aval, toplam dosya, mal/gemi/liman/son kullanıcı taraması, dual-use, yüksek riskli koridor, fiyat makullüğü, transit-serbest bölge, kırmızı bayrak, reddedilen dosya, ŞİB verilen dosya |
| Muhabir bankacılık | Aktif/yeni/kapanan ilişki, **muhabirin sonlandırdığı ilişki**, CBDDQ, nested tespit, **gelen ve giden RFI**, yanıtlanan RFI ve süresi, **muhabirden iade edilen işlem**, muhabire iade ettiğimiz işlem, muhabir üzerinden işlem, payable-through hesap |
| İzleme | Aktif senaryo, değişen senaryo, üretilen/kapatılan alert, vakaya dönüşen, toplu kapatma, backlog, kapanış süresi, kesinti, dahili şüphe bildirimi |
| ŞİB, dondurma, kolluk | ŞİB adedi ve tutarı, bildirim süresi, gecikmiş bildirim, ŞİB verilmeyen vaka, tekrar eden ŞİB, dondurma kararı, dondurulan hesap ve tutar, kaldırma, istisna talebi, kolluk talebi ve yanıt süresi, exit, reddedilen başvuru, tipping-off ihlali |
| Müşteri kabul ve gözden geçirme | Yeni hesap, uzaktan hesap, canlılık başarısız, EDD dosyası, üst yönetim onayı, GF tespit edilemeyen, risk override, tamamlanan periyodik gözden geçirme, gecikmiş KYC, kısıtlama, adverse media |
| Kalite güvence | Test edilen dosya, kritik/majör/minör hata, re-test, eğitim yükümlüsü ve tamamlayan |

**16 türetilen oran** ayrı bir tabloda pay, payda ve sonuçla birlikte gösterilir: izleme kapsama oranı, nakit payı, sınır ötesi payı, alert→vaka ve vaka→ŞİB dönüşümü, toplu kapatma payı, tarama isabet oranı, RFI yanıtlama oranı, muhabirden iade oranı, trade tarama örtüsü, QA hata oranları, eğitim tamamlanma, uzaktan kabul payı, acente payı, gözetimsiz kanal payı.

**12 KPI otomatik dolar** (yaptırım alert süresi, liste yansıma süresi, backlog, dahili bildirim, ŞİB süresi, kolluk yanıt süresi, gecikmiş KYC, alert-vaka, vaka-ŞİB, QA kritik/majör hata, eğitim tamamlanma) ve **4 doğuştan risk faktörüne** skor önerisi üretilir. Trade finance faaliyeti yoksa o grup künyeye göre kapsam dışına alınır.

## Anketi hızlı doldurma

218 soru tek tek tıklanmak zorunda değil. Anket ekranı açıkken, yazı alanı dışındayken:

| Tuş | İşlev |
|---|---|
| `1` `2` `3` `4` | Evet / Kısmen / Hayır / Uygulanamaz |
| `J` / `K` | Sonraki / önceki soru |
| `N` | Sonraki yanıtlanmamış soru |
| `E` | Kanıt referansı alanına geç |
| `Esc` | Yazı alanından çık |
| `?` | Kısayol listesini aç |

Etkin soru ekranın üstündeki karttır ve ince bir çerçeveyle işaretlenir. Liste bölüm başlıklarıyla ayrılır; her başlıkta o bölümün ilerlemesi görünür. Panodaki "Son soru" düğmesi en son çalıştığınız soruya döner.

## QA dosya testi sonucu

Metodoloji "anket beyanı tek başına kontrol etkinliği sayılmaz" diyor; bu yüzden QA testi gerektiren 115 sorunun her birinde test sonucu kaydedilir: sonuç (Doğrulandı / Kısmen doğrulandı / Çelişkili / Test edilmedi), test edilen dosya sayısı, hatalı dosya sayısı ve not. Hata oranı otomatik hesaplanır.

Yanıt "Evet" ama test sonucu "Çelişkili" ise soru kartında kırmızı uyarı çıkar ve pano/anket özetinde çelişki sayısı görünür. Anket filtresinde "QA testi bekliyor" ve "QA ile çelişkili" seçenekleri vardır.

## Veri güvenliği: otomatik yedek

Uygulama son beş sürümü tarayıcıda ayrıca saklar. Sıfırlama, dosya yükleme ve yedek geri yükleme işlemlerinden hemen önce de bir yedek alınır. **Veri ve yedekleme** ekranından tarih seçilerek geri dönülür. Bu, tarayıcı içi kaza koruması içindir; kalıcı yedek için JSON dosyasını indirin.

## Alanları doldurma rehberi

Her giriş alanının yanında ne yazılacağını anlatan bir açıklama ve örnek değer bulunur. Özet:

| Ekran | Ne girilir | Uygulama ne yapar |
|---|---|---|
| Portföy — Müşteri dağılımı | Tip × risk seviyesi müşteri sayıları | Toplam, yüksek riskli ve tüzel kişi paylarını hesaplar |
| Portföy — Ülke maruziyeti | Ülke, risk işaretleri, ilişki tipi, müşteri ve işlem adedi | FATF, yaptırım, offshore ve sınır ötesi paylarını hesaplar |
| Portföy — Şube ağı | Birim, tip, ülke, müşteri, uyum FTE, son denetim | FTE yükünü ve denetim gecikmesini işaretler |
| Künye — Ölçek | Dönem sonu müşteri sayısı, yüksek riskli ve PEP müşteri adedi, işlem adetleri, uyum kadrosu (FTE) | Oranları hesaplar ve doğuştan riskte dört faktör için skor önerir |
| Künye — Faaliyet kapsamı | Altı faaliyet sorusuna Evet/Hayır | "Hayır" seçilen faaliyetin soruları ve risk faktörü kapsam dışına çıkar |
| Künye — Denetim geçmişi | Son denetim, EWRA, senaryo tuning ve tarama kalibrasyon tarihleri | Yaşlandırma uyarısı üretir, iki KPI'yı otomatik doldurur |
| Doğuştan Risk | Her faktöre 1–5 skor, 4–5 skorlarda gerekçe | Rubrik metnini gösterir, boyut skorunu ve artık riski hesaplar |
| Anket | Yanıt, kanıt referansı, bulgu notu | Kontrol etkinliğini hesaplar; not, aksiyon kaydına taşınır |
| QA Planı | Her popülasyonun dönem içi toplam adedi | Örneklem büyüklüğünü ve test başına örneklemi hesaplar |
| Aksiyon Planı | Bulgu, kök neden, aksiyon, sahip, termin, doğrulama | Termini kritikliğe göre önerir, gecikmeyi ve eksik alanı işaretler |
| Pano — KPI | Hedef ve dönem ölçümü (birim alanın yanında yazılı) | Hedefe göre "Hedefte / Hedef dışı" durumu üretir; üç KPI otomatik hesaplanır |

Zorunlu alanlar yıldızla işaretlidir. Kaydetmeden önce aksiyon formu kök neden, sahip ve termini kontrol eder; künye eksik zorunlu alanları sayfa başında listeler.

## Metodoloji ve küresel standartlarla uyum

Zincir: **kapsam → doğuştan risk → kontrol beyanı → bağımsız test → artık risk → iştah karşılaştırması → aksiyon**. Ekran sırası bu zinciri izler: Künye ve Portföy kapsamı belirler, İşlem Detayı hacim ve operasyon verisini toplar, Doğuştan Risk yapısal maruziyeti skorlar, Anket kontrol beyanını alır, QA testi beyanı doğrular, Kontrol Skorları ve Artık Risk sonucu üretir, Aksiyon Planı kapanışı yönetir.

**Beyan ile bağımsız test ayrılır.** Anket yanıtı kurumun beyanıdır. QA dosya testi "Çelişkili" çıkan kontrol etkin sayılmaz (katsayı 0), "Kısmen doğrulandı" çıkan en çok yarım puan alır. Kontrol Skorları tablosunda üç sütun ayrı gösterilir: beyan edilen etkinlik, test ile düzeltilmiş etkinlik ve güvence örtüsü (test edilmiş / test gereken). Artık risk hesabı test ile düzeltilmiş etkinliği kullanır. Dayanak: Wolfsberg etkinlik beyanı, IIA üç savunma hattı, BSA bağımsız test sütunu.

**Kontrol etkisi tavanı %95.** Artık risk hesabında kontrol etkinliği en çok %95 uygulanır. FATF Tavsiye 1, EBA ML/TF risk faktörleri kılavuzu ve Basel yaklaşımı kontrollerin riski azalttığını, sıfırlamadığını söyler. Tavan olmadan tam puan alan bir domain 0,00 artık risk gösterirdi; bu hiçbir denetimde savunulamaz. Tavan yalnız artık risk hesabına uygulanır, etkinlik skorunun kendisine değil.

**Kurum geneli tek başına okunmaz.** Genel artık risk, kaynak çalışma kitabındaki formülle (genel doğuştan × genel etkinlik) hesaplanır. Bu formül yoğunlaşmış bir zafiyeti ortalamayla seyreltebilir. Bu nedenle panoda ayrıca **en yüksek domain artık riski** gösterilir ve genel skor bir domain aşımını gizlediğinde uyarı çıkar. Kurumsal risk değerlendirmesinde domain düzeyindeki aşım, genel ortalamayla kapatılamaz.

**Risk iştahı kurumun kararıdır.** Varsayılan 1,50 sektör uygulamasına dayalı bir başlangıç değeridir. Artık Risk ekranında her domain için yönetim kurulunun onayladığı limit girilebilir; değiştirilen limit "kurum kararı" olarak işaretlenir.

## Hesaplama kuralları

Skorlama, kaynak çalışma kitabındaki formüllerle birebir aynıdır (`js/calc.js`); artık risk hesabına yukarıda açıklanan test düzeltmesi ve tavan eklenir.

**Cevap katsayısı** — Evet 1,00 · Kısmen 0,50 · Hayır 0,00 · Uygulanamaz skorlamadan tamamen çıkar.

**Kontrol etkinliği** = kazanılan puan / uygulanabilir toplam ağırlık (domain bazında). Beyan edilen ve test ile düzeltilmiş olmak üzere ikisi de raporlanır.

**Olgunluk** — ≥ %90 Gelişmiş · ≥ %75 Yeterli · ≥ %60 Gelişime Açık · ≥ %40 Zayıf · < %40 Kritik Zayıf.

**Açık kritik soru** — kritikliği "Kritik" olup yanıtı "Evet" olmayan soru.

**Doğuştan risk (boyut)** = Σ(skor × ağırlık) / Σ(skorlanan faktörlerin ağırlığı). Uygulanamaz ve henüz skorlanmamış faktörler paydaya girmez; tüm faktörler skorlandığında sonuç kaynak çalışma kitabıyla birebir aynıdır (doğrulandı). Hiçbir faktör skorlanmamışsa boyut "ölçülmedi" sayılır ve o boyuttan beslenen domainlerin artık riski hesaplanmaz — sıfır göstermek yanıltıcı olurdu. GENEL = ölçülmüş boyut skorlarının aritmetik ortalaması.

**Skor çapaları** — 25 faktörün her biri için 1–5 arası ne anlama geldiğini tanımlayan rubrik vardır (ör. "Yüksek riskli müşteri payı %3–7" → 3). Skorlamayı tekrarlanabilir ve denetimde savunulabilir kılar. 4 ve 5 skorlarında gerekçe/kanıt alanı zorunlu sayılır ve eksikse uyarı verilir.

**Ağırlıklar** düzenlenebilir; değiştirilen ağırlık "ağırlık değiştirildi" etiketiyle işaretlenir ve CSV çıktısına varsayılanla birlikte yazılır. Tek tıkla varsayılana dönülür.

**Künye tabanlı öneri** — künyedeki sayılardan oran hesaplanabilen dört faktörde (yüksek riskli müşteri payı, PEP payı, sınır ötesi işlem payı ×2) önerilen skor gösterilir ve tek tıkla uygulanır. Öneri bağlayıcı değildir; gerekçe yine girilmelidir.

**Artık risk** = doğuştan risk × (1 − uygulanan kontrol etkinliği). Uygulanan etkinlik = MİN(test ile düzeltilmiş etkinlik, %95). Seviye: ≥ 3,50 Çok Yüksek · ≥ 2,50 Yüksek · ≥ 1,50 Orta · < 1,50 Düşük. Varsayılan iştah limiti 1,50.

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
- **CSV** — soru bankası, domain skorları, portföy ve maruziyet, doğuştan risk, QA örneklem planı, aksiyon planı. Noktalı virgül ayracı ve BOM ile üretilir; Türkçe Excel yerelinde sütunlar doğru ayrışır.
- **Yazdır / PDF** — Yönetici Raporu ekranı.

## Dosya yapısı

```
index.html          kabuk, gezinme, dil değiştirici
css/app.css         tasarım sistemi, açık/koyu tema, yazdırma stilleri
js/countries.js     ISO 3166-1 ülke listesi ve varsayılan risk işaretleri
js/settings.js      ülke risk ayarları ekranı ve ortak ülke çözümleyici
js/operations.data.js işlem/operasyon ölçüt tanımları
js/operations.js    işlem detayı ekranı ve türetilen oranlar
js/portfolio.data.js portföy referansları (müşteri tipleri, segmentler, ülke listesi, birim tipleri)
js/portfolio.js     portföy ekranı ve maruziyet hesapları
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
| 2 | Portfolio | Customer distribution (7 types × 4 risk bands), 12 risk segments, country exposure and the branch network. These figures produce score suggestions for 12 inherent risk factors. |
| 3 | Inherent Risk | Score 25 sub-factors from 1 to 5 against written anchors; rationale required for 4 and 5. |
| 4 | Questionnaire | Answer 218 questions with an evidence reference and a finding note. Keyboard: `1`–`4` to answer, `J`/`K` to move, `N` for the next unanswered, `E` for the evidence field, `?` for the shortcut list. QA-tested questions also capture the file test result, sample size and error count. |
| 5 | QA Plan | Enter each population's volume for the period; sample sizes are calculated. |
| 6 | Control Scores | Derived control effectiveness and maturity per domain. |
| 7 | Residual Risk | Inherent risk × (1 − control effectiveness), compared against appetite. |
| 8 | Action Plan | Finding → root cause → action → owner → due date → verification. |
| 9 | Executive Report | Print or export to PDF. |

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
