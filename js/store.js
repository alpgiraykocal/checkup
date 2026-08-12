/* Durum yönetimi ve kalıcılık.
   Veri yalnızca tarayıcının localStorage'ında tutulur; hiçbir ağ isteği yapılmaz. */

const STORAGE_KEY = 'aml-checkup-v1';
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
      answers: {},           // soruId -> {a, evidence, note, qaResult, qaNote}
      qaVolumes: {},         // popülasyon adı -> yıllık hacim
      actions: [],           // bulgu/aksiyon kayıtları
      kpis: {},              // kpi adı -> {target, value, note}
      ui: { theme: 'light' }
    };
  }

  let state = blank();
  const listeners = new Set();

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        state = Object.assign(blank(), parsed);
        state.ui = Object.assign({ theme: 'light' }, parsed.ui || {});
      }
    } catch (e) {
      console.warn('Kayıtlı veri okunamadı, boş çalışma alanı açıldı.', e);
    }
    return state;
  }

  let saveTimer = null;
  function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      state.updatedAt = new Date().toISOString();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        console.error('Kayıt başarısız', e);
      }
    }, 250);
  }

  function emit() { listeners.forEach(fn => fn(state)); }

  return {
    get state() { return state; },
    init() { load(); return state; },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },

    /** Değişikliği uygula, kaydet, dinleyicileri uyar. */
    update(mutator, opts = {}) {
      mutator(state);
      persist();
      if (!opts.silent) emit();
    },

    replace(next) {
      state = Object.assign(blank(), next);
      state.ui = Object.assign({ theme: 'light' }, next.ui || {});
      persist();
      emit();
    },

    reset() {
      state = blank();
      localStorage.removeItem(STORAGE_KEY);
      emit();
    },

    /** Dışa aktarım için tam anlık görüntü. */
    snapshot() {
      return JSON.parse(JSON.stringify(state));
    }
  };
})();
