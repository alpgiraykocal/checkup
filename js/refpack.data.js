/* Referans veri paketi — sürüm künyesi.

   Uygulamanın kodu değil, DAYANDIĞI DIŞ GERÇEKLER eskiyor: FATF gri/kara liste
   kararları yılda üç kez (Şubat, Haziran, Ekim genel kurulları), AB yüksek
   riskli üçüncü ülke listesi yıl içinde, mevzuat atıfları ise değişiklik
   yayımlandıkça. Uygulama bunu bilmezse otoriter görünen bir ekran sessizce
   yanlışa döner.

   Bu dosya referans verisinin ne zamana ait olduğunu tek yerde beyan eder.
   Sürüm ekranda ve yönetici raporunda görünür; bayatladığında uyarı çıkar.
   Güncelleme yordamı: REFERANS.md */

const REFPACK = {
  /* Paket sürümü: YYYY.N — N, o yıl içindeki kaçıncı paket olduğu.
     Her güncellemede hem sürüm hem ilgili bölümün tarihi değişir. */
  version: '2026.1',

  /* Paketin bir bütün olarak hazırlandığı tarih */
  compiled: '2026-01-01',

  /* Bölüm bazlı geçerlilik. Her biri ayrı eskir, ayrı izlenir. */
  sections: {
    countryFlags: {
      as: '2026-01-01',
      // Kaynağın kendi yayın döngüsü — bayatlama eşiği buna göre
      cadence: 'FATF genel kurulları: Şubat · Haziran · Ekim',
      staleMonths: 6,
      trLabel: 'Ülke risk işaretleri',
      enLabel: 'Country risk flags',
      trSources: 'FATF gri/kara liste, AB yüksek riskli üçüncü ülkeler, kapsamlı yaptırım rejimleri, offshore merkez ve zayıf AML denetimi değerlendirmesi',
      enSources: 'FATF grey/black lists, EU high-risk third countries, comprehensive sanctions regimes, offshore centre and weak AML supervision assessment'
    },
    regulation: {
      as: '2026-01-01',
      cadence: 'Mevzuat değişikliği yayımlandıkça',
      staleMonths: 12,
      trLabel: 'Mevzuat atıfları',
      enLabel: 'Regulatory citations',
      trSources: '5549 s.K., 6415 s.K., 7262 s.K., MASAK Uyum Programı ve Tedbirler Yönetmelikleri, FATF 40 Tavsiye, EBA ML/TF Risk Faktörleri Kılavuzu, Wolfsberg ve Basel yayınları',
      enSources: 'Laws 5549, 6415 and 7262, MASAK Compliance Programme and Measures Regulations, FATF 40 Recommendations, EBA ML/TF Risk Factors Guidelines, Wolfsberg and Basel publications'
    },
    questionBank: {
      as: '2026-01-01',
      cadence: 'Kapsam incelemesi sonrası',
      staleMonths: 18,
      trLabel: 'Soru bankası ve ek kontroller',
      enLabel: 'Question bank and extra controls',
      trSources: 'AML_Uyum_Checkup_Anket_QA_Aksiyon.xlsx + kapsam incelemesiyle eklenen 8 tamamlayıcı set',
      enSources: 'AML_Uyum_Checkup_Anket_QA_Aksiyon.xlsx plus 8 supplementary sets added after the coverage review'
    }
  }
};
