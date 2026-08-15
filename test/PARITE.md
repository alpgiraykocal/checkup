# Çalışma kitabı paritesi — çapraz kontrol yordamı

## Durum

`golden.js` bir **davranış çıpasıdır**: "kod bugün, dünkü kodla aynı sonucu
veriyor" der. Kaynak çalışma kitabına (`AML_Uyum_Checkup_Anket_QA_Aksiyon.xlsx`)
karşı bir doğrulama **değildir** — beklenen değerler uygulamanın kendi
çıktısından üretilmiştir.

Bu ayrımı bilerek yazıyoruz: parite bugüne kadar bir varsayım olarak taşındı,
hiç sınanmadı. Aşağıdaki yordam onu teste dönüştürür ve bir kez yapıldığında
kalıcı olarak korunur.

## Yordam

1. **Çalışma kitabını açın** ve altın örnekteki girdileri birebir işleyin.
   Girdi kümesi `test/golden.js` içindeki `ornek()` fonksiyonunda tanımlıdır ve
   deterministiktir:
   - Künye alanları (dönem, müşteri sayıları, FTE) fonksiyonun başında
   - Faaliyet soruları: sıradaki her üçüncü alan "Hayır"
   - Doğuştan risk: `(i % 5) + 1` döngüsü, her yedinci faktör "Uygulanamaz",
     her on birincinin ağırlığı 5
   - Anket: `Evet, Kısmen, Hayır, Evet` döngüsü; QA testi olan sorularda
     `Doğrulandı, Kısmen doğrulandı, Çelişkili, Test edilmedi` döngüsü
   - QA hacimleri: `(i + 1) × 1250`

   Aynı girdiyi uygulamada görmek için:
   ```bash
   node -e "const H=require('./test/harness.js');const A=H.load();
     console.log(JSON.stringify(require('./test/golden.js'),null,1))" 2>/dev/null || \
   node test/golden.js --yenile   # golden.expected.json içinde tüm çıktılar
   ```

2. **Kitaptan okunan değerleri** `test/golden.workbook.json` dosyasına yazın.
   Biçim: `golden.expected.json` içindeki yol → kitaptan okunan değer.

   ```json
   {
     "totals.effectivenessTested": 0.6301,
     "domains.0.effectiveness": 0.6358,
     "inherent.dims.Müşteri.value": 3.0,
     "residual.1.residual": 1.81,
     "qaTotals.yearlySample": 41440
   }
   ```

   Dizi indeksleri `golden.expected.json` ile aynı sıradadır (domainler D1…D11,
   artık risk aynı sıra, QA popülasyonları veri dosyasındaki sıra).

3. **Testi koşun.** Dosya varsa `golden.js` her satırı ayrı bir kontrol olarak
   karşılaştırır ve sapmayı `{kitap, uygulama}` olarak raporlar:

   ```bash
   node test/golden.js
   ```

4. **Sapma çıkarsa** kaynağını belirleyin. Üç olasılık var ve üçü de farklı
   sonuç doğurur:
   - **Uygulama hatası** → kodu düzeltin, `--yenile` ile çıpayı tazeleyin
   - **Kitap hatası** → kitabı düzeltin, kararı bu dosyaya not edin
   - **Kasıtlı sapma** (ör. %95 kontrol tavanı, PF'nin ayrı satırda
     raporlanması, maruziyet ağırlıklı boyut skoru) → `test/golden.workbook.json`
     içine o yolu **yazmayın** ve nedenini aşağıdaki listeye ekleyin

## Bilinen kasıtlı sapmalar

Bunlar kitapla eşleşmez ve eşleşmemelidir; parite karşılaştırmasına dahil
edilmemelidir.

| Sapma | Neden |
|---|---|
| **%95 kontrol tavanı** | Kitap tam puanlı bir domainde artık riski 0 gösterir. FATF R.1, EBA ve Basel kontrollerin riski azalttığını, sıfırlamadığını söyler; 0 artık risk denetimde savunulamaz. Tavan yalnızca artık risk hesabına uygulanır, etkinlik skoruna değil. |
| **Test ile düzeltilmiş etkinlik** | Kitap yalnızca beyan edilen etkinliği hesaplar. QA dosya testi "Çelişkili" çıkan kontrol etkin sayılmaz (katsayı 0), "Kısmen doğrulandı" en çok yarım puan alır. Artık risk bu düzeltilmiş değerden hesaplanır. |
| **PF ayrı satır** | FATF R.1 (2020) ve R.7 gereği yayılmanın finansmanı ML/TF ortalamasına karıştırılmaz. |
| **Ek kontroller seti** | 44 soru kitabın dışındadır ve ana skorun paydasına girmez. |
| **Maruziyet ağırlıklı boyut skoru** | Varsayılan **kapalıdır**; açıkken kitapla eşleşmez. Açık koşumda parite karşılaştırması yapmayın. |

## Kim yapmalı

Bu, kod tarafından yapılamayacak tek adım: kitaptaki formülü okuyup elle
değer türetmek uzman işidir. Bir kez yapıldığında `golden.workbook.json`
kalıcıdır ve her koşuda otomatik doğrulanır.
