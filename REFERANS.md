# Referans veri paketi — güncelleme yordamı

Uygulamanın kodu değil, **dayandığı dış gerçekler** eskir. Bu dosya onları
kimin, ne zaman, nasıl güncelleyeceğini tanımlar.

Paket künyesi `js/refpack.data.js` içindedir; sürüm ve bölüm tarihleri
**Ayarlar** ekranında ve yönetici raporunun altında görünür. Bir bölüm kendi
eşiğini aştığında uygulama uyarı verir.

| Bölüm | Eşik | Kaynağın döngüsü |
|---|---|---|
| Ülke risk işaretleri | 6 ay | FATF genel kurulları: Şubat · Haziran · Ekim |
| Mevzuat atıfları | 12 ay | Değişiklik yayımlandıkça |
| Soru bankası ve ek kontroller | 18 ay | Kapsam incelemesi sonrası |

---

## 1. Ülke risk işaretleri

**Ne zaman:** FATF genel kurulundan sonraki iki hafta içinde, ayrıca AB
yüksek riskli üçüncü ülke listesi değiştiğinde.

**Nereden:**

| İşaret | Kaynak |
|---|---|
| `fatfBlack` | FATF — "High-Risk Jurisdictions subject to a Call for Action" |
| `fatfGrey` | FATF — "Jurisdictions under Increased Monitoring" |
| `euHighRisk` | AB Komisyonu delege tüzüğü — yüksek riskli üçüncü ülkeler listesi |
| `sanctioned` | Kapsamlı yaptırım rejimleri (BM, OFAC, AB, UK OFSI kesişimi) |
| `offshore` | Kurum kararı — offshore finans merkezi değerlendirmesi |
| `weakAml` | Kurum kararı — karşılıklı değerlendirme raporları ve denetim kapasitesi |

**Nasıl:**

1. `js/countries.js` içindeki ilgili ülkenin `flags` dizisini düzenleyin.
   Ülke listesi ISO 3166-1'in tamamıdır; ülke eklemeniz gerekmez, yalnızca
   işaretleri değiştirirsiniz.
2. `js/refpack.data.js` → `sections.countryFlags.as` alanını yeni tarihe
   çekin ve paket sürümünü artırın (`2026.1` → `2026.2`).
3. Testleri koşun: `node test/run.js` — `contract.js` her bayrağın tanımlı
   olduğunu doğrular.
4. Değişikliği commit mesajında **hangi genel kurul kararına** dayandığıyla
   birlikte yazın.

**Not:** Kurumun kendi kararları (`state.countryRisk`) çalışma dosyasında
saklanır ve bu güncellemeden **etkilenmez**. Varsayılan değişince kurum kararı
olan ülkeler yine kurumun dediği gibi kalır; Ayarlar ekranında "kurum kararı"
etiketiyle görünürler.

---

## 2. Mevzuat atıfları

**Ne zaman:** Atıf verilen bir düzenleme değiştiğinde; en geç 12 ayda bir
gözden geçirme.

**Nereden:** 5549, 6415 ve 7262 sayılı Kanunlar; MASAK Uyum Programı ve
Tedbirler Yönetmelikleri ile genel tebliğler; FATF 40 Tavsiye ve yorum notları;
EBA ML/TF Risk Faktörleri Kılavuzu; Wolfsberg ve Basel yayınları.

**Nasıl:**

1. Etkilenen soruların `source` alanını `js/data.js` (ana banka) veya
   `js/extra.data.js` (ek kontroller) içinde güncelleyin.
2. Madde numarası değiştiyse yalnızca numarayı değil, sorunun **hâlâ o
   yükümlülüğü ölçüp ölçmediğini** kontrol edin. Yükümlülük kalktıysa soruyu
   silmeyin — kritikliğini düşürüp gerekçesini `source` alanına yazın; eski
   dönem dosyalarıyla karşılaştırma bozulmasın.
3. `js/refpack.data.js` → `sections.regulation.as` ve paket sürümü.
4. `node test/run.js`.

---

## 3. Soru bankası ve ek kontroller

**Ne zaman:** Kapsam incelemesinden sonra; en geç 18 ayda bir.

**Dikkat:** Ana soru bankasına soru eklemek **skorları kaydırır** —
uygulanabilir ağırlık paydası büyür, domain etkinliği ve artık risk değişir,
önceki dönem dosyalarıyla karşılaştırma kopar. Bu yüzden yeni kontroller
`js/extra.data.js` içindeki **ek sete** eklenir; ek set ana skorun paydasına
girmez.

Ana bankaya dokunmak gerçekten gerekiyorsa:

1. Değişikliği ve gerekçesini `test/PARITE.md` içindeki "bilinen kasıtlı
   sapmalar" tablosuna ekleyin.
2. `node test/golden.js --yenile` ile altın örneği tazeleyin ve
   `git diff test/golden.expected.json` çıktısını okuyun: değişen her sayı
   kasıtlı olmalı.
3. Sürümü `js/refpack.data.js` içinde artırın.

---

## Kontrol listesi

Her güncellemede:

- [ ] İlgili veri dosyası düzenlendi
- [ ] `js/refpack.data.js` → bölüm tarihi ve paket sürümü artırıldı
- [ ] `node test/run.js` geçti
- [ ] Ana bankaya dokunulduysa altın örnek tazelendi ve farkı okundu
- [ ] Commit mesajında dayanak (genel kurul kararı, tebliğ numarası, inceleme)
      yazıldı
