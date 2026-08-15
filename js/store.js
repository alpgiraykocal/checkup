/* Durum yönetimi ve kalıcılık.
   Veri yalnızca tarayıcının localStorage'ında tutulur; hiçbir ağ isteği yapılmaz. */

const STORAGE_KEY = 'aml-checkup-v1';
const SNAPSHOT_KEY = 'aml-checkup-snapshots-v1';
const SNAPSHOT_LIMIT = 5;
const SNAPSHOT_MIN_GAP_MS = 10 * 60 * 1000;   // aynı oturumda her 10 dakikada bir
const SCHEMA = 1;

const Store = (() => {
  function blank() {
    return {
      schema: SCHEMA,
      updatedAt: null,
      kunye: {},
      inherent: {},          // "dim|factor" -> 1..5
      inherentNA: {},        // "dim|factor" -> true (skorlamadan çıkar)
      inherentNotes: {},     // "dim|factor" -> gerekçe / kanıt
      inherentWeights: {},   // "dim|factor" -> ağırlık geçersiz kılma
      portfolio: {           // müşteri dağılımı, segmentler, ülke ve şube tabloları
        matrix: {}, segments: {}, countries: [], branches: []
      },
      operations: {},        // ölçüt anahtarı -> {adet, tutar, gun, saat}
      countryRisk: {},       // ülke kodu -> kurum kararı bayrak listesi (yalnız fark)
      appetite: {},          // domain kodu -> kurumun onayladığı iştah limiti
      pf: {},                // PF faktör anahtarı -> {score, note, na}
      lines: {},             // iş kolu anahtarı -> {active, share, dims:{...}, note}
      answers: {},           // soruId -> {a, evidence, note, qaResult, qaNote}
      qaVolumes: {},         // popülasyon adı -> yıllık hacim
      actions: [],           // bulgu/aksiyon kayıtları
      kpis: {},              // kpi anahtarı -> {target, value, note}
      signoff: {},           // hazırlayan/gözden geçiren/onaylayan -> {name, date}
      baseline: null,        // önceki dönemin kompakt özeti (Compare.summarize)
      ui: { theme: 'light' }
    };
  }

  let state = blank();
  const listeners = new Set();

  /* ---------- Şekil düzeltme ----------
     Dışarıdan yüklenen çalışma dosyası elle düzenlenmiş, yarım yazılmış ya da
     başka bir sürümden olabilir. Object.assign yalnızca eksik anahtarı doldurur;
     yanlış tipteki bir anahtar (ör. "actions": {}) olduğu gibi geçer ve hesap
     katmanında çökmeye yol açar. Şekil burada bir kez düzeltilir. */

  const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  const asObj = v => (isObj(v) ? v : {});
  const asRecords = v => (Array.isArray(v) ? v.filter(isObj) : []);

  function normalize(s) {
    ['kunye', 'inherent', 'inherentNA', 'inherentNotes', 'inherentWeights', 'operations',
     'countryRisk', 'appetite', 'pf', 'lines', 'answers', 'qaVolumes', 'kpis', 'signoff']
      .forEach(k => { s[k] = asObj(s[k]); });

    s.actions = asRecords(s.actions);

    const p = asObj(s.portfolio);
    s.portfolio = {
      matrix: asObj(p.matrix), segments: asObj(p.segments),
      countries: asRecords(p.countries), branches: asRecords(p.branches)
    };

    // Yanıt kayıtları nesne, ülke kararları bayrak listesi olmalı
    Object.keys(s.answers).forEach(k => { if (!isObj(s.answers[k])) delete s.answers[k]; });
    Object.keys(s.countryRisk).forEach(k => { if (!Array.isArray(s.countryRisk[k])) delete s.countryRisk[k]; });

    s.baseline = isObj(s.baseline) ? s.baseline : null;
    s.ui = Object.assign({ theme: 'light' }, asObj(s.ui));
    return s;
  }

  /** Kaybı anlamlı olan kayıt sayısı: yanıt + skor + bulgu. */
  function workSize(s) {
    return Object.keys(s.answers || {}).length
      + Object.keys(s.inherent || {}).length
      + (s.actions || []).length;
  }

  /* KPI kayıtları bir dönem görünen ada göre saklandı; İngilizce arayüzde girilen
     değerler ayrı bir kayda düşüyordu. Anahtar artık her zaman DATA.kpis[].key
     (Türkçe sabit); eski İngilizce adlı kayıtlar okunurken taşınır. */
  function migrateKpiKeys(s) {
    if (!s.kpis || typeof DATA === 'undefined') return s;
    const valid = new Set(DATA.kpis.map(k => k.key));
    const byEnName = {};
    if (typeof DATA_EN !== 'undefined' && DATA_EN.kpis) {
      Object.keys(DATA_EN.kpis).forEach(key => {
        const n = DATA_EN.kpis[key] && DATA_EN.kpis[key].name;
        if (n) byEnName[n] = key;
      });
    }
    Object.keys(s.kpis).forEach(k => {
      if (valid.has(k)) return;
      const target = byEnName[k];
      if (!target) return;                       // tanınmayan anahtar olduğu gibi bırakılır
      const cur = s.kpis[target] || {};
      // Türkçe anahtardaki mevcut alanlar korunur; yalnızca boş olanlar doldurulur.
      s.kpis[target] = Object.assign({}, s.kpis[k], cur);
      delete s.kpis[k];
    });
    return s;
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        state = normalize(Object.assign(blank(), parsed));
        migrateKpiKeys(state);
      }
    } catch (e) {
      console.warn('Kayıtlı veri okunamadı, boş çalışma alanı açıldı.', e);
    }
    return state;
  }

  /* ---------- Otomatik yerel yedek ----------
     Tarayıcı verisi tek kopya olduğu için son birkaç sürüm ayrıca saklanır.
     Kaza sonucu sıfırlama veya yanlış dosya yüklemesi geri alınabilir. */

  function readSnapshots() {
    try { return JSON.parse(localStorage.getItem(SNAPSHOT_KEY)) || []; }
    catch { return []; }
  }

  function writeSnapshots(list) {
    try { localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(list)); }
    catch (e) { console.warn('Yedek yazılamadı', e); }
  }

  /** force: sıfırlama/geri yükleme gibi yıkıcı işlemlerden hemen önce. */
  function snap(reason, force) {
    const answers = Object.keys(state.answers || {}).length;
    const actions = (state.actions || []).length;
    if (!force && !answers && !actions) return;      // boş çalışmayı yedekleme
    const list = readSnapshots();
    const last = list[0];
    if (!force && last && Date.now() - new Date(last.at).getTime() < SNAPSHOT_MIN_GAP_MS) return;
    list.unshift({
      at: new Date().toISOString(),
      reason: reason || 'auto',
      answers, actions,
      data: JSON.parse(JSON.stringify(state))
    });
    writeSnapshots(list.slice(0, SNAPSHOT_LIMIT));
  }

  let saveTimer = null;
  let saveFailed = false;
  const errorListeners = new Set();

  /** Asıl yazma. Kota dolduğunda sessiz kalmaz: uygulama katmanı uyarılır. */
  function write() {
    state.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      snap('auto');
      saveFailed = false;
    } catch (e) {
      // Depolama dolduysa çalışma sessizce kaybolur; kullanıcı bunu bilmeli.
      const ilk = !saveFailed;
      saveFailed = true;
      console.error('Kayıt başarısız', e);
      if (ilk) errorListeners.forEach(fn => { try { fn(e); } catch { /* dinleyici hatası yutulur */ } });
    }
  }

  function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { saveTimer = null; write(); }, 250);
  }

  /** Bekleyen yazmayı hemen tamamlar — sekme kapanırken çağrılır. */
  function flush() {
    if (saveTimer === null) return;
    clearTimeout(saveTimer);
    saveTimer = null;
    write();
  }

  function emit() { listeners.forEach(fn => fn(state)); }

  return {
    get state() { return state; },
    init() { load(); return state; },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },

    /** Kayıt başarısız olduğunda (ör. depolama dolu) haber verilir. */
    onSaveError(fn) { errorListeners.add(fn); return () => errorListeners.delete(fn); },
    get saveFailed() { return saveFailed; },
    flush,

    /** Değişikliği uygula, kaydet, dinleyicileri uyar. */
    update(mutator, opts = {}) {
      mutator(state);
      persist();
      if (!opts.silent) emit();
    },

    replace(next) {
      snap('before-load', true);
      state = normalize(Object.assign(blank(), next));
      migrateKpiKeys(state);
      persist();
      emit();
    },

    reset() {
      snap('before-reset', true);
      state = blank();
      localStorage.removeItem(STORAGE_KEY);
      emit();
    },

    /** Dışa aktarım için tam anlık görüntü. */
    snapshot() {
      return JSON.parse(JSON.stringify(state));
    },

    /** JSON yedeği alındı: zamanı ve o andaki iş hacmi işaretlenir. */
    markExported() {
      state.ui = state.ui || {};
      state.ui.lastExport = new Date().toISOString();
      state.ui.lastExportSize = workSize(state);
      persist();
      emit();
    },

    /** Son yedekten bu yana biriken iş — hatırlatma eşiği buna bakar. */
    backupStatus() {
      const size = workSize(state);
      const at = state.ui && state.ui.lastExport;
      const since = size - ((state.ui && state.ui.lastExportSize) || 0);
      const days = at ? (Date.now() - new Date(at).getTime()) / 86400000 : null;
      return {
        size, at: at || null, since: Math.max(0, since), days,
        // Hiç yedek yoksa 15 kayıt, varsa 25 yeni kayıt ya da 7 gün.
        due: size > 0 && (at ? (since >= 25 || days >= 7) : size >= 15)
      };
    },

    /** Dışarıdan gelen durumu güvenli şekle sokar (Compare de kullanır). */
    normalize(next) { return normalize(Object.assign(blank(), next || {})); },

    /** Otomatik yedekler — en yeni başta. */
    snapshots() { return readSnapshots().map(({ data, ...meta }) => meta); },

    restoreSnapshot(at) {
      const rec = readSnapshots().find(x => x.at === at);
      if (!rec) return false;
      snap('before-restore', true);
      state = normalize(Object.assign(blank(), rec.data));
      migrateKpiKeys(state);
      persist();
      emit();
      return true;
    }
  };
})();
