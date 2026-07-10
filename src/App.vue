<template>
  <div class="app" :class="{ 'app--detail-open': selectedFormat }">
    <a href="#main-content" class="skip-link">Salta al contenuto principale</a>

    <header class="app-header">
      <div class="header-inner">
        <div class="brand">
          <span class="brand-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="7" fill="#2449C7"/>
              <path d="M8 10h6l4 12h-6L8 10z" fill="white" opacity="0.5"/>
              <path d="M16 10h8l-4 12h-8l4-12z" fill="white"/>
            </svg>
          </span>
          <h1 class="brand-name">FileWise</h1>
        </div>
        <p class="brand-tagline">Vademecum visivo dei formati di file</p>
      </div>
      <div class="search-bar">
        <label for="search-input" class="sr-only">Cerca un formato di file</label>
        <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          id="search-input"
          v-model="searchQuery"
          type="search"
          placeholder="Cerca un formato... (es. PDF, immagine, documento)"
          autocomplete="off"
          @input="onSearch"
        />
        <button
          v-if="searchQuery"
          class="search-clear"
          @click="clearSearch"
          aria-label="Cancella ricerca"
          type="button"
        >&times;</button>
      </div>
      <nav class="category-nav" aria-label="Filtra per categoria">
        <button
          v-for="cat in categoryFilters"
          :key="cat.id"
          class="cat-btn"
          :class="{ 'cat-btn--active': activeCategory === cat.id }"
          @click="setCategory(cat.id)"
          type="button"
        >
          {{ cat.label }}
          <span class="cat-count">{{ cat.count }}</span>
        </button>
      </nav>
    </header>

    <main id="main-content" class="app-main">
      <div class="main-layout">
        <!-- Sidebar list -->
        <aside class="sidebar" aria-label="Elenco formati">
          <div class="sidebar-header">
            <span class="result-count">{{ filteredFormats.length }} formato{{ filteredFormats.length !== 1 ? 'i' : '' }}</span>
          </div>
          <ul class="format-list" role="listbox" aria-label="Formati di file">
            <li
              v-for="fmt in filteredFormats"
              :key="fmt.id"
              role="option"
              :aria-selected="selectedFormat?.id === fmt.id"
            >
              <button
                class="format-item"
                :class="{ 'format-item--selected': selectedFormat?.id === fmt.id }"
                @click="selectFormat(fmt)"
                type="button"
              >
                <FormatIcon
                  :format-id="fmt.id"
                  :extension="fmt.extension"
                  :color="fmt.iconColor"
                  :size="40"
                />
                <span class="format-item-info">
                  <span class="format-item-name">{{ fmt.name }}</span>
                  <span class="format-item-ext">{{ fmt.extension }}</span>
                </span>
              </button>
            </li>
          </ul>
          <p v-if="filteredFormats.length === 0" class="no-results">
            Nessun formato trovato per "{{ searchQuery }}".
            <button class="link-btn" @click="clearSearch" type="button">Mostra tutti</button>
          </p>
        </aside>

        <!-- Detail panel -->
        <div class="detail-panel" :class="{ 'detail-panel--empty': !selectedFormat }">
          <template v-if="selectedFormat">
            <div class="detail-top">
              <button class="detail-close" @click="closeDetail" aria-label="Chiudi dettaglio" type="button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
              </button>
              <div class="detail-icon-wrap">
                <FormatIcon
                  :format-id="selectedFormat.id"
                  :extension="selectedFormat.extension"
                  :color="selectedFormat.iconColor"
                  :size="72"
                />
              </div>
            </div>
            <div class="detail-body">
              <div class="detail-eyebrow">
                <span class="cat-badge" :style="{ background: categoryColor(selectedFormat.category) }">
                  {{ categoryLabel(selectedFormat.category) }}
                </span>
                <code class="detail-ext">{{ selectedFormat.extension }}</code>
              </div>
              <h2 class="detail-title">{{ selectedFormat.name }}</h2>
              <p class="detail-desc">{{ selectedFormat.description }}</p>

              <section class="detail-section">
                <h3 class="section-title">A cosa serve</h3>
                <p>{{ selectedFormat.uses }}</p>
              </section>

              <section class="detail-section">
                <h3 class="section-title">Programmi consigliati (gratis)</h3>
                <p>{{ selectedFormat.programs }}</p>
              </section>

              <section class="detail-section">
                <h3 class="section-title">Esempio scaricabile</h3>
                <p class="sample-desc">
                  <strong>{{ selectedFormat.name }}_esempio{{ selectedFormat.extension }}</strong> &mdash;
                  un file {{ selectedFormat.name }} valido generato al momento, pronto da scaricare e aprire.
                </p>
                <button class="btn-download" @click="downloadSample" type="button">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Scarica file di esempio
                </button>
                <p class="sample-note">
                  Il file viene creato direttamente nel tuo browser, senza inviare dati a nessun server.
                </p>
              </section>
            </div>
          </template>
          <template v-else>
            <div class="detail-placeholder">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
                <rect x="8" y="12" width="48" height="40" rx="6" stroke="#D0D5E0" stroke-width="2" fill="none"/>
                <circle cx="22" cy="30" r="3" fill="#D0D5E0"/>
                <path d="M28 30h16" stroke="#D0D5E0" stroke-width="2" stroke-linecap="round"/>
                <path d="M28 37h12" stroke="#D0D5E0" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <p>Seleziona un formato dall'elenco per vederne i dettagli.</p>
            </div>
          </template>
        </div>
      </div>
    </main>

    <footer class="app-footer">
      <p>FileWise &mdash; uno strumento gratuito per riconoscere i formati di file.</p>
      <p><a href="https://cristianporco.it">cristianporco.it</a></p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { formats, categories, filterFormats } from './data/formats.js'
import FormatIcon from './components/FormatIcon.vue'

const searchQuery = ref('')
const activeCategory = ref('tutti')
const selectedFormat = ref(null)
const isMobile = ref(false)

const categoryFilters = computed(() => {
  const counts = {}
  for (const f of formats) {
    counts[f.category] = (counts[f.category] || 0) + 1
  }
  const all = [{ id: 'tutti', label: 'Tutti', count: formats.length }]
  for (const cat of categories) {
    all.push({ id: cat.id, label: cat.label, count: counts[cat.id] || 0 })
  }
  return all
})

const filteredFormats = computed(() => {
  return filterFormats(searchQuery.value, activeCategory.value === 'tutti' ? '' : activeCategory.value)
})

function onSearch() {
  // Keep selected format if it's still in results
  if (selectedFormat.value && !filteredFormats.value.find(f => f.id === selectedFormat.value.id)) {
    selectedFormat.value = null
  }
}

function clearSearch() {
  searchQuery.value = ''
  onSearch()
}

function setCategory(catId) {
  activeCategory.value = catId
  if (selectedFormat.value && !filteredFormats.value.find(f => f.id === selectedFormat.value.id)) {
    selectedFormat.value = null
  }
}

function selectFormat(fmt) {
  selectedFormat.value = fmt
  if (isMobile.value) {
    const detailPanel = document.querySelector('.detail-panel')
    if (detailPanel) detailPanel.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function closeDetail() {
  selectedFormat.value = null
}

function categoryColor(catId) {
  const map = {
    documenti: '#E53935',
    immagini: '#F57C00',
    'audio-video': '#4527A0',
    dati: '#43A047',
    eseguibili: '#37474F',
    web: '#E44D26',
    font: '#00897B',
    altro: '#795548'
  }
  return map[catId] || '#607D8B'
}

function categoryLabel(catId) {
  const cat = categories.find(c => c.id === catId)
  return cat ? cat.label : catId
}

function downloadSample() {
  if (!selectedFormat.value) return
  const fmt = selectedFormat.value
  try {
    const blob = fmt.sampleGenerator()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fmt.name}_esempio${fmt.extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (e) {
    console.error('Errore nella generazione del file di esempio:', e)
  }
}

function handleResize() {
  isMobile.value = window.innerWidth < 768
}

function handleKeydown(e) {
  if (e.key === 'Escape') {
    if (searchQuery.value) {
      clearSearch()
    } else if (selectedFormat.value) {
      closeDetail()
    }
  }
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style>
/* ============================================
   FileWise — Design System
   Palette: "Carta e Inchiostro Digitale"
   ============================================ */

:root {
  /* Surfaces */
  --color-bg: #F4F6FB;
  --color-surface: #FFFFFF;
  --color-surface-hover: #F0F2F8;
  --color-surface-active: #E4E8F2;

  /* Text */
  --color-text: #1A1A2E;
  --color-text-secondary: #5A5D6E;
  --color-text-muted: #8B8FA0;

  /* Primary / Brand */
  --color-primary: #2449C7;
  --color-primary-hover: #1A3AAE;
  --color-primary-light: #E8EFFD;

  /* Accents per category */
  --color-red: #E53935;
  --color-orange: #F57C00;
  --color-purple: #4527A0;
  --color-green: #43A047;
  --color-teal: #00897B;
  --color-blue-dark: #1565C0;

  /* Utility */
  --color-border: #E2E5ED;
  --color-focus: #4A6EF5;

  /* Typography */
  --font-body: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: ui-monospace, 'SF Mono', 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace;

  /* Spacing (4px grid) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.10);

  /* Transitions */
  --ease-out: 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: 0.15s cubic-bezier(0.4, 0, 1, 1);
}

/* Reset & Base */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

body {
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.6;
  color: var(--color-text);
  background: var(--color-bg);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Focus visible */
:focus-visible {
  outline: 2.5px solid var(--color-focus);
  outline-offset: 2px;
  border-radius: 2px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* ============================================
   Layout
   ============================================ */

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.skip-link {
  position: absolute;
  top: -100%;
  left: var(--space-4);
  background: var(--color-primary);
  color: white;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-sm);
  z-index: 1000;
  font-weight: 600;
  text-decoration: none;
}
.skip-link:focus {
  top: var(--space-2);
}

/* Header */
.app-header {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: var(--space-5) var(--space-6) var(--space-4);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.brand-icon {
  flex-shrink: 0;
}

.brand-name {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.brand-tagline {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  font-weight: 500;
  margin-left: var(--space-2);
  white-space: nowrap;
}

/* Search */
.search-bar {
  position: relative;
  max-width: 480px;
}

.search-icon {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  pointer-events: none;
}

.search-bar input {
  width: 100%;
  height: 44px;
  padding: 0 var(--space-10) 0 42px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  font-family: var(--font-body);
  background: var(--color-bg);
  color: var(--color-text);
  transition: border-color var(--ease-out), box-shadow var(--ease-out);
}
.search-bar input::placeholder {
  color: var(--color-text-muted);
}
.search-bar input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.search-clear {
  position: absolute;
  right: var(--space-2);
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border: none;
  background: var(--color-surface-hover);
  border-radius: 50%;
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.search-clear:hover {
  background: var(--color-surface-active);
}

/* Category nav */
.category-nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.cat-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  height: 36px;
  padding: 0 var(--space-3);
  border: 1.5px solid var(--color-border);
  border-radius: 20px;
  background: var(--color-surface);
  font-size: 0.8125rem;
  font-weight: 500;
  font-family: var(--font-body);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background var(--ease-out), border-color var(--ease-out), color var(--ease-out);
  white-space: nowrap;
}
.cat-btn:hover {
  background: var(--color-surface-hover);
  border-color: #C8CDD8;
}
.cat-btn--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}
.cat-count {
  font-size: 0.6875rem;
  background: rgba(0, 0, 0, 0.08);
  padding: 1px 6px;
  border-radius: 10px;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}
.cat-btn--active .cat-count {
  background: rgba(255, 255, 255, 0.25);
}

/* Main layout */
.app-main {
  flex: 1;
  padding: var(--space-4) var(--space-6);
}

.main-layout {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: var(--space-4);
  max-width: 1200px;
  margin: 0 auto;
  align-items: start;
}

/* Sidebar */
.sidebar {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.sidebar-header {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.result-count {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.format-list {
  list-style: none;
  max-height: calc(100vh - 300px);
  overflow-y: auto;
  overscroll-behavior: contain;
}

.format-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  font-family: var(--font-body);
  transition: background var(--ease-out);
  border-left: 3px solid transparent;
  min-height: 52px;
}
.format-item:hover {
  background: var(--color-surface-hover);
}
.format-item--selected {
  background: var(--color-primary-light);
  border-left-color: var(--color-primary);
}

.format-item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.format-item-name {
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--color-text);
  line-height: 1.3;
}

.format-item-ext {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

.no-results {
  padding: var(--space-6) var(--space-4);
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.link-btn {
  border: none;
  background: none;
  color: var(--color-primary);
  font-weight: 600;
  cursor: pointer;
  font-size: inherit;
  font-family: inherit;
  text-decoration: underline;
}

/* Detail panel */
.detail-panel {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  min-height: 400px;
}

.detail-panel--empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-top {
  position: relative;
  background: var(--color-bg);
  padding: var(--space-6);
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--color-border);
}

.detail-close {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  width: 36px;
  height: 36px;
  border: none;
  background: var(--color-surface);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  box-shadow: var(--shadow-sm);
  transition: background var(--ease-out);
}
.detail-close:hover {
  background: var(--color-surface-active);
}

.detail-icon-wrap {
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.12));
}

.detail-body {
  padding: var(--space-6);
}

.detail-eyebrow {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.cat-badge {
  font-size: 0.6875rem;
  font-weight: 700;
  color: white;
  padding: 3px 10px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1.4;
}

.detail-ext {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  background: var(--color-bg);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.detail-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--space-3);
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.detail-desc {
  color: var(--color-text-secondary);
  font-size: 0.9375rem;
  line-height: 1.65;
  margin-bottom: var(--space-5);
}

.detail-section {
  margin-bottom: var(--space-5);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

.section-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-text);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-2);
}

.detail-section p {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

/* Download button */
.sample-desc {
  font-size: 0.875rem !important;
  margin-bottom: var(--space-3);
}

.sample-desc strong {
  font-family: var(--font-mono);
  font-weight: 500;
  color: var(--color-text);
}

.btn-download {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  height: 44px;
  padding: 0 var(--space-5);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.9375rem;
  font-weight: 600;
  font-family: var(--font-body);
  cursor: pointer;
  transition: background var(--ease-out), transform var(--ease-out);
  box-shadow: 0 2px 8px rgba(36, 73, 199, 0.3);
}
.btn-download:hover {
  background: var(--color-primary-hover);
}
.btn-download:active {
  transform: scale(0.97);
}

.sample-note {
  font-size: 0.75rem !important;
  color: var(--color-text-muted) !important;
  margin-top: var(--space-2);
}

/* Placeholder */
.detail-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-10);
  text-align: center;
  color: var(--color-text-muted);
}
.detail-placeholder p {
  font-size: 0.9375rem;
  max-width: 280px;
  line-height: 1.5;
}

/* Footer */
.app-footer {
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: var(--space-4) var(--space-6);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2);
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}
.app-footer a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
}
.app-footer a:hover {
  text-decoration: underline;
}

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* ============================================
   Responsive
   ============================================ */

@media (max-width: 900px) {
  .main-layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    max-height: none;
  }

  .format-list {
    max-height: 360px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: var(--space-1);
    padding: var(--space-2);
  }

  .format-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-2);
    border-left: none;
    border-bottom: 3px solid transparent;
    border-radius: var(--radius-md);
  }
  .format-item--selected {
    border-bottom-color: var(--color-primary);
    border-left-color: transparent;
  }

  .format-item-info {
    align-items: center;
  }
}

@media (max-width: 600px) {
  .app-header {
    padding: var(--space-3) var(--space-4) var(--space-3);
  }

  .header-inner {
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .brand-tagline {
    display: none;
  }

  .brand-name {
    font-size: 1.125rem;
  }

  .search-bar {
    max-width: 100%;
  }

  .category-nav {
    gap: var(--space-1);
  }

  .cat-btn {
    height: 32px;
    padding: 0 var(--space-2);
    font-size: 0.75rem;
  }

  .app-main {
    padding: var(--space-3) var(--space-3);
  }

  .format-list {
    max-height: 260px;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  }

  .format-item {
    min-height: 44px;
    padding: var(--space-2);
  }

  .detail-body {
    padding: var(--space-4);
  }

  .detail-title {
    font-size: 1.25rem;
  }
}
</style>
