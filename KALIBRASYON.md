# Kritiklik kalibrasyonu

## Neden

Soru bankasının 86 sorusu (%39,4) "Kritik" derecesindeydi. Kritik derece iki
şeyi yönetir: panodaki "açık kritik kontrol" sayacı ve aksiyon planındaki
5 iş günlük SLA. Bankanın %39'u kritikse, açık kritik sayısı önceliklendirme
aracı olmaktan çıkar ve 5 iş günlük termin gerçekçiliğini yitirir — bu
testte 86 açık kritik çıkmıştı ve yönetime taşınabilir bir liste değildi.

## Kural

Bir kontrol **Kritik** sayılır ancak ve ancak yokluğu tek başına:

- **doğrudan bir yasal ihlal** doğuruyorsa (atama ve bildirim, gecikmeksizin
  dondurma, ŞİB süresi, bilgi verme yasağı, R.16 transfer bilgisi), **ya da**
- **telafisiz bir maruziyet** bırakıyorsa — yani başka hiçbir kontrol bu
  başarısızlığı yakalayamıyorsa (gerçek zamanlı tarama çalışmıyorsa ödeme
  çıkar, işlem evreni tanımsızsa kör nokta görülmez, CDD tamamlanmadan işlem
  engellenmiyorsa müşteri tanınmadan hesap çalışır).

Önemli ama **telafi edilebilir** olan her şey **Yüksek**'tir: yönetişim,
metodoloji dokümanı, onay basamağı, ölçüm ve raporlama, güvence testi. Bunlar
kontrolün kalitesini düşürür; para akışını denetimsiz bırakmaz.

Bu kural, kritikliği "önemli mi" sorusundan "yokluğu telafisiz mi" sorusuna
taşır. İkincisi önceliklendirilebilir, birincisi değildir.

## Sonuç

| | Önce | Sonra | Oran |
|---|---|---|---|
| Ana soru bankası | 86 / 218 | **40 / 218** | %39,4 → **%18.3** |
| Ek kontroller | 22 / 44 | **13 / 44** | %50,0 → **%29.5** |

Ek setin oranı daha yüksek: o set zaten kapsam incelemesinde bulunan yüksek
sonuçlu boşluklardan oluşuyor, dolayısıyla telafisiz maruziyet yoğunluğu
doğal olarak fazla.

Özgün derece **silinmedi**: düşürülen her soruda `critOriginal: "Kritik"`
alanı veri dosyasında duruyor. Kararı geri almak ya da denetimde göstermek
için kayıt korunur.

## Kritik kalanlar


**D1** (1)

- `D1-01` Uyum görevlisi ve vekili mevzuata uygun şekilde atandı ve MASAK'a bildirildi mi?

**D2** (4)

- `D2-05` PEP envanteri güncel tutuluyor; yerli, yabancı ve uluslararası kuruluş PEP ayrımı yapılıyor mu?
- `D2-12` Yüksek riskli ülkelerle ilişkili müşteri ve işlemlerde EDD otomatik olarak tetikleniyor mu?
- `D2-15` İç içe (nested) muhabir ilişkileri ve payable-through hesaplar tespit ediliyor mu?
- `D2-16` Tabela banka (shell bank) ile ilişki kurulmaması sistemsel olarak kontrol ediliyor mu?

**D3** (2)

- `D3-05` Uzaktan müşteri kabulünde canlılık tespiti ve belge doğrulama kontrolleri uygulanıyor mu?
- `D3-12` Sanal varlık transferlerinde Travel Rule (gönderen/alıcı bilgisi) uygulanıyor mu?

**D4** (4)

- `D4-01` İzlemeye tabi işlem tiplerinin tam envanteri (transaction universe) dokümante edildi mi?
- `D4-04` Kaynak sistemler ile izleme sistemi arasında düzenli mutabakat (reconciliation) yapılıyor mu?
- `D4-13` Ödeme mesajlarında gönderen ve alıcı bilgisinin eksiksizliği kontrol ediliyor mu?
- `D4-14` Eksik bilgili transferler için askıya alma, iade veya bilgi talebi prosedürü uygulanıyor mu?

**D5** (6)

- `D5-01` Kimlik tespiti tüm müşteri tiplerini (gerçek kişi, tüzel kişi, tüzel kişiliği olmayan teşekkül, trust benzeri yapılar) kapsıyor mu?
- `D5-02` Kimlik bilgileri güvenilir ve bağımsız kaynaklardan doğrulanıyor mu?
- `D5-04` Tam müşteri tanıma tamamlanmadan işlem yapılması sistemsel olarak engelleniyor mu?
- `D5-07` Gerçek faydalanıcı tespiti sahiplik eşiği ve kontrol testleri ile katmanlı yapıya kadar izleniyor mu?
- `D5-17` EDD kapsamında fon kaynağı (SoF) belgeye dayalı olarak doğrulanıyor mu?
- `D5-24` Müşteri profili ile fiili işlem davranışı karşılaştırılıyor mu?

**D6** (10)

- `D6-01` Uygulanan yaptırım listelerinin envanteri (BM, OFAC, AB, UK OFSI, ulusal kararlar) tanımlı mı?
- `D6-02` Liste güncellemelerinin kaynaktan üretime yansıma süresi için SLA tanımlı ve ölçülüyor mu?
- `D6-03` Liste güncellemesi sonrası tüm müşteri tabanı yeniden taranıyor mu?
- `D6-04` Ulusal dondurma kararları (7262 s.K. kapsamı) gecikmeksizin uygulanıyor mu?
- `D6-06` Dolaylı sahiplik (%50 kuralı) taraması yapılıyor mu?
- `D6-12` Motor transliterasyon, takma ad, ad sırası ve tarih varyasyonlarını yönetebiliyor mu?
- `D6-13` Tarama kapsamı müşteri, gerçek faydalanıcı, yetkili, ilgili taraf ve karşı tarafı içeriyor mu?
- `D6-14` İşlem taraması ödemeyi durdurabilecek şekilde gerçek zamanlı (pre-transaction) çalışıyor mu?
- `D6-17` Trade finance işlemlerinde mal, gemi, liman, taşıyıcı ve son kullanıcı taraması yapılıyor mu?
- `D6-23` Gerçek eşleşme (true match) durumunda blokaj/red kararı ve bildirim süreci tanımlı mı?

**D7** (3)

- `D7-02` EWRA'da tespit edilen tipolojilerin tamamı senaryolarla karşılanıyor mu (coverage assessment)?
- `D7-08` Eşik altı (below-the-line) testi yapılıyor mu?
- `D7-17` Toplu (bulk) alert kapatma engelleniyor veya özel onaya tabi mi?

**D8** (4)

- `D8-02` Şüphe tespitinden bildirime kadar geçen süre mevzuattaki sınır içinde mi?
- `D8-09` Bilgi verme yasağına (tipping-off) ilişkin kontroller ve eğitim mevcut mu?
- `D8-11` Malvarlığı dondurma kararları gecikmeksizin (aynı iş günü) uygulanıyor mu?
- `D8-12` Dondurma sonrası yetkili mercie bildirim yapılıyor mu?

**D9** (2)

- `D9-06` Kolluk ve yargı bilgi talepleri için tanımlı bir sorumlu ve SLA var mı?
- `D9-09` Kolluk talebi bilgisinin bilgi verme yasağını ihlal etmeyecek şekilde yönetimi sağlanıyor mu?

**D11** (4)

- `D11-02` EWRA en az yılda bir ve önemli değişikliklerde güncelleniyor mu?
- `D11-04` Terör finansmanı riski aklama riskinden ayrı olarak değerlendiriliyor mu?
- `D11-12` Artık riskin iştahı aştığı alanlar için aksiyon planı oluşturuluyor mu?
- `D11-14` EWRA yönetim kurulu tarafından onaylanıyor mu?

**Ek kontroller** (13)

- `EK-TF-05` Düşük tutarlı, yüksek frekanslı ve çok sayıda gönderene dayanan fon toplama örüntüleri için senaryo var mı?
- `EK-TF-07` 6415 sayılı Kanun kapsamındaki listelerin taranması, diğer yaptırım listelerinden ayrı olarak doğrulanıyor mu?
- `EK-IC-05` Çalışanların dahili şüphe bildirimi için tanımlı bir kanal ve zorunlu bir form seti var mı?
- `EK-IC-07` Dahili bildirimlerin tamamının değerlendirildiği ve sonuçlandırıldığı izlenebiliyor mu (kaybolan bildirim kontrolü)?
- `EK-MD-01` Bir taraf listeye eklendiğinde geçmiş işlemler geriye dönük olarak taranıyor mu (lookback)?
- `EK-MD-03` Lookback bulguları blokaj, bildirim ve ŞİB süreçlerine bağlanıyor mu?
- `EK-SG-02` Lehtar, ödeme aşamasında kimlik tespitine ve gerektiğinde EDD\
- `EK-EP-02` Anonim veya sınırlı kimlik tespitli ön ödemeli araçlarda yükleme, bakiye ve harcama limitleri mevzuata uygun şekilde sistemsel olarak uygulanıyor mu?
- `EK-EP-03` Hesaplar arası P2P transferlerde gönderen ve alıcı bilgisi eksiksiz taşınıyor mu?
- `EK-KV-01` Karşı sanal varlık hizmet sağlayıcının kimliği ve yaptırım durumu transfer öncesinde doğrulanıyor mu?
- `EK-KV-02` Blokzincir adresleri yaptırım listeleri ve risk istihbaratına karşı taranıyor mu?
- `EK-YM-01` Eşik altına bölünmüş döviz işlemleri için müşteri ve gün bazında toplama (aggregation) kontrolü var mı?
- `EK-YM-02` Sürekli iş ilişkisi olmayan (occasional) işlemlerde kimlik tespiti eşiği doğru uygulanıyor mu?

## Yüksek'e düşürülenler

Gerekçe: yokluğu telafi edilebilir — başka bir kontrol yakalar ya da
kontrolün kalitesini düşürür, maruziyeti denetimsiz bırakmaz.

- `D1-02` Uyum görevlisi yönetim kuruluna doğrudan raporlama hattına sahip mi?
- `D1-04` Uyum görevlisi, çıkar çatışması yaratabilecek iş birimi görevlerinden bağımsız mı?
- `D1-09` Uyum programı; politika, risk yönetimi, izleme-kontrol, eğitim ve iç denetim bileşenlerinin tamamını kapsıyor mu?
- `D1-10` AML/CFT politikası yönetim kurulunca onaylandı ve son 12 ayda gözden geçirildi mi?
- `D1-14` AML/CFT iç denetimi yıllık denetim planına dahil mi ve birinci/ikinci hattan bağımsız mı?
- `D2-07` PEP ilişkisinin kurulması ve sürdürülmesi üst düzey yönetici onayına tabi mi?
- `D2-08` Yüksek riskli ülke listesi FATF kara/gri liste, AB yüksek riskli üçüncü ülkeler ve kurum içi kriterlerle oluşturuluyor mu?
- `D2-13` Muhabir banka ilişkilerinde due diligence anketi (ör. Wolfsberg CBDDQ) alınıyor mu?
- `D2-14` Muhabir ilişkilerin kurulması üst yönetim onayına tabi mi?
- `D3-02` Her ürün için ML/TF doğuştan risk skoru belirlendi mi?
- `D3-11` Sanal varlık hizmet sağlayıcı (VASP) ilişkileri ayrı bir risk kategorisinde yönetiliyor mu?
- `D3-14` Trade finance ürünleri için ayrı bir AML/yaptırım risk değerlendirmesi yapıldı mı?
- `D4-02` İzleme kapsamı dışında bırakılan işlem tipleri gerekçelendirildi ve onaylandı mı?
- `D4-07` Kritik alanların (tutar, para birimi, karşı taraf, ülke, IBAN, unvan) doluluk oranı ölçülüyor mu?
- `D4-12` Müşteri statik verisi ile işlem verisi arasındaki eşleştirme doğrulandı mı?
- `D5-06` Yüksek riskli müşteri kabulü üst düzey yönetici onayına tabi mi?
- `D5-09` Trust, vakıf, hamiline yazılı hisse ve nominee yapıları için ek kontroller uygulanıyor mu?
- `D5-11` Müşteri risk derecelendirme modeli yazılı, ağırlıklandırılmış ve onaylı mı?
- `D5-16` EDD tetikleyicileri yazılı olarak tanımlı mı?
- `D5-18` Servet kaynağı (SoW) beyan dışı bağımsız kanıtla destekleniyor mu?
- `D5-21` Periyodik gözden geçirme frekansı risk seviyesine göre farklılaştırılmış mı?
- `D6-10` Bulanık (fuzzy) eşleşme eşiği kalibre edildi ve gerekçesi dokümante edildi mi?
- `D6-20` Alert kapatma kararında dört göz ilkesi uygulanıyor mu?
- `D6-21` Aynı kullanıcının hem inceleyip hem onaylaması sistemsel olarak engelleniyor mu?
- `D6-22` Alert karar gerekçeleri kim/ne zaman/ne yaptı izini verecek şekilde denetlenebilir mi?
- `D6-25` Tarama sistemi yılda en az bir kez bağımsız etkinlik testine tabi tutuluyor mu?
- `D7-01` Senaryo envanteri, her senaryonun hedeflediği tipoloji ile eşleştirilmiş mi?
- `D7-06` Senaryo eşikleri veri analizine dayalı olarak belirlendi mi?
- `D7-07` Eşik ve parametreler son 12-18 ay içinde tuning'e tabi tutuldu mu?
- `D7-11` Model validasyonu birinci ve ikinci hattan bağımsız bir ekip veya taraf tarafından yapılıyor mu?
- `D7-14` Bekleyen alert (backlog) sayısı ve yaşlandırması raporlanıyor mu?
- `D7-20` Alert-vaka-ŞİB dönüşüm oranları senaryo, ürün ve analist bazında izleniyor mu?
- `D7-22` Analist kararlarının kalitesi düzenli QA örneklemesiyle ölçülüyor mu?
- `D8-01` Şüpheli işlem bildirimi karar süreci (alert - vaka - karar) yazılı olarak tanımlı mı?
- `D8-04` ŞİB verilmeme kararları da gerekçeli olarak kayıt altına alınıyor mu?
- `D8-05` ŞİB narratifi kim, ne, ne zaman, nerede, ne kadar ve neden şüpheli unsurlarını içeriyor mu?
- `D8-07` ŞİB'e konu müşteriler için sonraki dönemde artırılmış izleme uygulanıyor mu?
- `D8-18` Exit kararlarında ŞİB yükümlülüğünün ayrıca değerlendirildiği belgeleniyor mu?
- `D9-02` Bulgu kapanışları bağımsız olarak yeniden test ediliyor mu?
- `D9-08` Kolluk talebine konu müşteriler için risk derecelendirmesi ve izleme gözden geçiriliyor mu?
- `D10-12` Uyum görevlisi en az yılda bir yönetim kuruluna kapsamlı sunum yapıyor mu?
- `D11-01` Kurumsal risk değerlendirmesi yazılı ve onaylı bir metodolojiye dayanıyor mu?
- `D11-03` EWRA müşteri, ürün/hizmet, coğrafya, kanal ve işlem boyutlarının tamamını kapsıyor mu?
- `D11-06` Doğuştan risk ve kontrol etkinliği ayrı ayrı skorlanıp artık risk hesaplanıyor mu?
- `D11-07` Kontrol etkinliği skoru beyan yerine bağımsız test bulgularıyla destekleniyor mu?
- `D11-13` EWRA sonuçları senaryolar, eşikler ve KYC frekanslarını fiilen etkiliyor mu?
- `EK-TF-01`
- `EK-TF-02`
- `EK-TF-04`
- `EK-IC-01`
- `EK-MD-05`
- `EK-MD-08`
- `EK-SG-01`
- `EK-EP-01`
- `EK-AK-01`

## Etkilenmeyenler

Kalibrasyon yalnızca **kritiklik** derecesini değiştirir. Etkilenmez:

- Soru **ağırlıkları** — domain etkinliği ve artık risk skorları aynı kalır
- Doğuştan risk, QA örneklem planı, iştah karşılaştırması
- Önceki dönem dosyalarıyla karşılaştırma (etkinlik ve artık risk üzerinden)

Değişen: panodaki açık kritik sayacı, anket ekranındaki "öncelikli aksiyon"
etiketleri ve bulgu üretiminde atanan SLA termini (Kritik 5 iş günü,
Yüksek 30 gün).

