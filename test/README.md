# Test paketi

Bağımlılık yok. Node 18+ yeterli.

```bash
node test/run.js
```

Herhangi bir paket düşerse çıkış kodu 1 olur; sürekli entegrasyon ve
commit öncesi kanca için doğrudan kullanılabilir.

## Paketler

| Dosya | Ne sınar | Yaklaşık kontrol |
|---|---|---|
| `logic1.js` | Skorlama zinciri: yanıt katsayıları, QA tavanı, kritiklik, domain etkinliği, doğuştan risk ortalaması, ağırlık geçersiz kılma, artık risk formülü ve %95 tavanı, iştah, ölçülmemiş durumlar | 112 |
| `logic2.js` | Kapsam kuralları, QA örneklem matematiği, SLA iş günü hesabı, aksiyon istatistikleri, PF, iş kolları, ek setin ana skordan yalıtımı, künye türetimleri | 195 |
| `logic3.js` | Operasyon türetilen oranları, portföy hesapları, ülke risk geçersiz kılma, dönem karşılaştırması, depolama (KPI göçü, yedek durumu, anlık görüntü), dil değişimi | 47 |
| `golden.js` | Altın örnek: belirlenmiş bir değerlendirmenin tüm çıktıları `golden.expected.json` ile karşılaştırılır | tüm çıktı ağacı |
| `contract.js` | Veri sözleşmesi: kimlik benzersizliği, zorunlu alanlar, çıpa sayıları, kapsam eşleşmeleri, iştah/kaynak örtüsü, QA ve KPI biçimleri, ülke bayrakları | 3925 |
| `i18n.js` | Koddaki her `t()` anahtarının iki dilde karşılığı, dinamik önekler, referans listeleri, içerik çevirisi | 1641 |
| `lint.js` | **Dil sızıntısı**: yerelleştirilmiş alanın mantık anahtarı olarak kullanılması; ayrıca iki dilde sayısal sonuçların aynılığı | 5 + davranışsal |
| `fuzz.js` | Bozuk, eksik ve düşmanca durumla tüm hesap yolları: null alanlar, yanlış tipler, geçersiz değerler, HTML enjeksiyon yükleri, aşırı büyük sayılar | 54 |
| `props.js` | **Değişmez kurallar**: sabit tohumlu üreteçle 1.500 rastgele çalışma dosyası; her birinde aralıklar, tutarlılık, tekdüzelik, dil bağımsızlığı, yükleme ve birleştirme özdeşliği ile **kılavuzdan bağımsız yazılmış referans hesapla** birebir karşılaştırma | ~1,5 milyon denetim, 76 kural |
| `tz.js` | Aynı tarih hesabını dokuz saat diliminde koşar; gün kayması olmamalı | 9 dilim |

## Değişmez kurallar ve referans hesap

Elle yazılmış örnekler yazarın aklına gelen durumları sınar. `props.js` sabit
tohumlu bir üreteçle gerçekçi çalışma dosyaları üretir — uç durumlar dahil:
tam puanlı ve doğrulanmış (tavanı zorlayan), skorsuz ama paylı iş kolu,
maruziyet yöntemi seçili ama uygulanamaz, kapsam dışı ve elle yanıtlanmış
sorular, risk kabulü — ve her birinde şunları denetler:

- **Aralık ve tutarlılık**: etkinlik 0–1, test ≤ beyan, artık ≤ doğuştan ve
  ≥ doğuştanın %5'i, seviye ve olgunluk bantları (kılavuz tablosundan, koddan
  değil), aşım = artık > limit, örneklem ≤ hacim, açık + kapalı + kabul = toplam.
- **Tekdüzelik**: bir yanıtı iyileştirmek etkinliği düşürmez, artık riski
  artırmaz; "Çelişkili" test etkinliği artırmaz; faktör skorunu artırmak artık
  riski azaltmaz; iştah limitini yükseltmek aşım sayısını artırmaz.
- **Özdeşlik**: dosya yükleme iki kez uygulanınca değişmez; kaydet-yükle aynı
  sonucu verir; dosyanın kendisiyle birleştirilmesi hiçbir şeyi değiştirmez;
  iki farklı dosya birleştirilince gelen veri aynen alınır, bulgu kaybolmaz.
- **Dil**: TR ve EN'de bütün sayısal çıktılar aynı.
- **Referans hesap**: kılavuzun Metodoloji bölümündeki formüllerden, uygulama
  kodunu çağırmadan yazılmış ikinci bir hesap. Domain etkinlikleri, boyut ve
  genel doğuştan risk, iş kolu ağırlıklı değer, maruziyet yöntemi, artık
  riskler, güvence örtüsü, QA örneklemi ve kapanış oranı her durumda
  karşılaştırılır.

Paketin kendisi mutasyon testiyle sınandı: skorlama, birleştirme ve maruziyet
yöntemine bilerek yerleştirilen 27 hatanın 27'si yakalandı. Daha büyük ya da
farklı bir örneklem için:

```bash
PROPS_N=20000 PROPS_SEED=42 node test/props.js
```

Bir kural düşerse rapor kuralı, ihlal sayısını ve ilk ihlalin durum
numarasını yazar; aynı tohum ve sayı o durumu yeniden üretir.

## Altın örnek

`golden.js` belirlenmiş (rastgelelik içermeyen) bir değerlendirme kurar,
hesap zincirinin tüm çıktılarını üretir ve `golden.expected.json` ile
karşılaştırır. Skorlamada kasıtsız bir kayma olursa paket düşer ve hangi
alanın ne kadar saptığını satır satır yazar.

**Kasıtlı bir değişiklikten sonra** beklenen değerleri tazelemek için:

```bash
node test/golden.js --yenile
```

Tazeleme sonrası `git diff test/golden.expected.json` çıktısını okuyun:
değişen her sayı, kasıtlı değişikliğin sonucu olmalıdır. Beklenmeyen bir
alan değiştiyse yan etki vardır.

## Dil sızıntısı denetimi

`I18n.apply()` bazı `DATA` alanlarının üzerine seçili dilin metnini yazar
(`freq`, `crit`, `section`, `dim`, `group`, `name`, `label`…). Bu alanlardan
biri karşılaştırmada veya sözlük anahtarında kullanılırsa kod Türkçede
çalışır, İngilizcede sessizce yanlış sonuç verir.

Bu sınıftan dört hata çıktı ve hepsi bu denetimle yakalandı ya da yakalanır
hâle getirildi:

- QA sıklık bölücüsü `p.freq` metnine bakıyordu → İngilizcede test başına
  örneklem dört katı görünüyordu
- Kapsam dışı bölüm sayacı `q.section` ile anahtar karşılaştırıyordu →
  İngilizcede "0 soru"
- Künye alanları grup **adıyla** eşleştiriliyordu
- KPI kayıtları görünen **ada** göre saklanıyordu → dil değişince değer kaybı

Durum kayıtları (aksiyon, filtre, rota) alanlarını sabit anahtarla saklar ve
dile göre değişmez. Böyle satırlar `// dil-güvenli: <gerekçe>` işaretiyle muaf
tutulur.

## Yeni test eklerken

`harness.js` gerçek uygulama modüllerini Node içinde yükler; DOM yalnızca
modüllerin yüklenebilmesi için taklit edilir, hesap katmanı DOM'a dokunmaz.

```js
const H = require('./harness.js');
const { check, near } = H;
const A = H.load();          // DATA, Calc, Store, I18n, Portfolio, ...
check('açıklama', kosul, ayrinti);
process.exitCode = H.report('Paket adı') ? 1 : 0;
```

Yeni paketi `run.js` içindeki `PAKETLER` listesine ekleyin.
