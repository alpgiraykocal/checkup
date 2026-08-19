/* Kılavuz etkileşimi: tema tercihi, okuma ilerlemesi, etkin bölüm işareti.
   Bağımlılık yok; betik çalışmasa da belge tam okunur kalır. */
(function () {
  var kok = document.documentElement;
  var btn = document.getElementById('tema-btn');
  var etiket = document.getElementById('tema-etiket');

  /* Metinler belgenin diline göre seçilir; kılavuzun iki dil sürümü aynı
     betiği paylaşır. / Strings follow the document language: both language
     versions of the guide share this script. */
  var EN = (kok.lang || 'tr').toLowerCase().indexOf('en') === 0;
  var METIN = EN
    ? { koyu: 'Dark', acik: 'Light', koyuAria: 'Switch to dark theme', acikAria: 'Switch to light theme' }
    : { koyu: 'Koyu', acik: 'Açık', koyuAria: 'Koyu temaya geç', acikAria: 'Açık temaya geç' };

  /* Dil değiştirirken okunan bölüm korunur: bağlantıya geçerli çapa eklenir.
     Bölüm kimlikleri iki dilde aynıdır. */
  Array.prototype.forEach.call(document.querySelectorAll('[data-dil]'), function (a) {
    a.addEventListener('click', function () {
      if (location.hash) a.href = a.getAttribute('href').split('#')[0] + location.hash;
    });
  });

  function sistemKoyu() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function koyuMu() {
    var t = kok.getAttribute('data-theme');
    return t ? t === 'dark' : sistemKoyu();
  }
  var AY = '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>';
  var GUNES = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';

  function dugmeyiTazele() {
    var koyu = koyuMu();
    etiket.textContent = koyu ? METIN.acik : METIN.koyu;
    btn.setAttribute('aria-label', koyu ? METIN.acikAria : METIN.koyuAria);
    var svg = btn.querySelector('svg');
    if (svg) svg.innerHTML = koyu ? GUNES : AY;
  }

  try {
    var kayitli = localStorage.getItem('kilavuz-tema');
    if (kayitli === 'dark' || kayitli === 'light') kok.setAttribute('data-theme', kayitli);
  } catch (e) { /* depolama kapalı olabilir */ }
  dugmeyiTazele();

  btn.addEventListener('click', function () {
    var sonraki = koyuMu() ? 'light' : 'dark';
    kok.setAttribute('data-theme', sonraki);
    try { localStorage.setItem('kilavuz-tema', sonraki); } catch (e) { /* yoksay */ }
    dugmeyiTazele();
  });

  /* Okuma ilerlemesi — kaydırma çubuğunun üstünde ince bir şerit. */
  var cubuk = document.getElementById('ilerleme');
  var bekleyen = false;
  function ilerlemeyiCiz() {
    var h = document.documentElement;
    var toplam = h.scrollHeight - h.clientHeight;
    var oran = toplam > 0 ? (h.scrollTop || document.body.scrollTop) / toplam : 0;
    cubuk.style.width = Math.min(100, Math.max(0, oran * 100)) + '%';
    bekleyen = false;
  }
  window.addEventListener('scroll', function () {
    if (bekleyen) return;
    bekleyen = true;
    requestAnimationFrame(ilerlemeyiCiz);
  }, { passive: true });
  ilerlemeyiCiz();

  /* Etkin bölüm — içindekilerde konumu gösterir. */
  var baglantilar = Array.prototype.slice.call(
    document.querySelectorAll('#icindekiler a[href^="#"]'));
  var hedefler = baglantilar
    .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
    .filter(Boolean);
  if (!('IntersectionObserver' in window) || !hedefler.length) return;

  var gorunur = new Set();
  var gozlemci = new IntersectionObserver(function (girisler) {
    girisler.forEach(function (g) {
      if (g.isIntersecting) gorunur.add(g.target.id); else gorunur.delete(g.target.id);
    });
    var etkin = null;
    for (var i = 0; i < hedefler.length; i++) {
      if (gorunur.has(hedefler[i].id)) { etkin = hedefler[i].id; break; }
    }
    if (!etkin) return;
    baglantilar.forEach(function (a) {
      var secili = a.getAttribute('href') === '#' + etkin;
      a.classList.toggle('aktif', secili);
      if (secili) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }, { rootMargin: '-10% 0px -70% 0px', threshold: 0 });

  hedefler.forEach(function (h) { gozlemci.observe(h); });

  /* Sayfa başında hiçbir başlık gözlem penceresine düşmeyebilir; ilk bölüm
     yine de işaretli açılsın. */
  requestAnimationFrame(function () {
    if (!document.querySelector('#icindekiler a.aktif') && baglantilar.length) {
      baglantilar[0].classList.add('aktif');
      baglantilar[0].setAttribute('aria-current', 'true');
    }
  });
})();
