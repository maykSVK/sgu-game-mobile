<template>
  <StarField />
  <div class="sgu-scanlines" />

  <div class="dash-page">

    <!-- ════ LOADING ════ -->
    <div v-if="game.loading && !game.data" class="dash-loading">
      <div class="dash-loader"></div>
      <div class="dash-loading-text">Načítavam<span class="blink">_</span></div>
    </div>

    <!-- ════ ERROR ════ -->
    <div v-else-if="game.error && !game.data" class="dash-error">
      <div class="dash-error-title">⚠ Chyba pripojenia</div>
      <div class="dash-error-msg">{{ game.error }}</div>
      <button @click="game.fetchDashboard()" class="dash-btn">↺ Skúsiť znova</button>
    </div>

    <!-- ════ OBSAH ════ -->
    <div v-else class="dash-content">

      <!-- ── ZDROJE ── -->
      <section v-if="resources.length" class="dash-section">
        <div class="dash-section-label">Zdroje lode</div>
        <div class="dash-resources-grid">
          <div v-for="r in resources" :key="r.key" class="dash-res">
            <div class="dash-res-icon">{{ r.icon }}</div>
            <div class="dash-res-info">
              <div class="dash-res-name">{{ r.label }}</div>
              <div class="dash-res-val" :style="{ color: r.color }">{{ r.value }}</div>
            </div>
            <div class="dash-res-bar-wrap">
              <div class="dash-res-bar" :style="{ width: r.pct + '%', background: r.color }"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── ŠTATISTIKY ── -->
      <section v-if="stats.length" class="dash-section">
        <div class="dash-panel">
          <div class="dash-panel-head">
            <span class="dash-panel-dot"></span> Štatistiky Destiny
          </div>
          <div class="dash-panel-body">
            <div v-for="s in stats" :key="s.key" class="dash-stat-row">
              <span class="dash-stat-key">{{ s.label }}</span>
              <span class="dash-stat-val">{{ s.value }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ── ROZKAZY ── -->
      <section class="dash-section">
        <div class="dash-panel">
          <div class="dash-panel-head">
            <span class="dash-panel-dot"></span> Rozkazy pre Destiny
            <span class="dash-panel-head-sub">MŮSTEK</span>
          </div>
          <div class="dash-panel-body dash-commands">
            <button class="dash-btn">⚡ Autopilot</button>
            <button class="dash-btn">🌀 FTL let</button>
            <button class="dash-btn dash-btn-wide">🌍 Orbitálny sken planéty</button>
          </div>
        </div>
      </section>

      <!-- ── VÝSTRAHY ── -->
      <section v-if="alerts.length" class="dash-section">
        <div class="dash-panel">
          <div class="dash-panel-head dash-panel-head-gold">
            <span class="dash-panel-dot" style="background:gold;"></span>
            Výstrahy a hlásenia
            <span class="dash-badge-count">{{ alerts.length }}</span>
          </div>
          <div>
            <div v-for="(a, i) in alerts.slice(0, showAll ? 999 : 4)" :key="i" class="dash-alert">
              <div class="dash-alert-text">{{ a.text || a }}</div>
              <div v-if="a.time" class="dash-alert-time">{{ a.time }}</div>
            </div>
            <button v-if="alerts.length > 4" class="dash-more-btn" @click="showAll = !showAll">
              {{ showAll ? '▲ Skryť' : `▼ Zobraziť všetky (${alerts.length})` }}
            </button>
          </div>
        </div>
      </section>

      <!-- ── QUEST LOG ── -->
      <section v-if="quests.length" class="dash-section">
        <div class="dash-panel">
          <div class="dash-panel-head dash-panel-head-blue">
            <span class="dash-panel-dot" style="background:#4a7aff;"></span> Quest Log
          </div>
          <div class="dash-panel-body">
            <div v-for="(q, i) in quests" :key="i" class="dash-quest-row" :class="{ active: i === 0 }">
              <span class="dash-quest-icon">{{ i === 0 ? '►' : '·' }}</span>
              <span>{{ q }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ── INFO BOXY ── -->
      <section v-if="infoboxes.length" class="dash-section">
        <div class="dash-section-label">Denné reporty</div>
        <div v-for="box in infoboxes" :key="box.title" class="dash-panel" style="margin-bottom:8px;">
          <div class="dash-panel-head">
            <span class="dash-panel-dot"></span>
            {{ box.title.replace(/\[\?\]|\[x\]/g,'').trim() }}
          </div>
          <div class="dash-panel-body dash-infobox-text">{{ box.content }}</div>
        </div>
      </section>

      <!-- ── PRÁZDNY STAV ── -->
      <section v-if="!resources.length && !alerts.length && !quests.length" class="dash-section">
        <div class="dash-panel">
          <div class="dash-panel-head">
            <span class="dash-panel-dot"></span> Systém aktívny
          </div>
          <div class="dash-panel-body dash-empty">
            <div class="dash-empty-icon">◈</div>
            <div class="dash-empty-title">Všetky systémy v poriadku</div>
            <div class="dash-empty-sub">Žiadne aktívne hlásenia</div>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGameStore } from '../stores/game'
import StarField from '../components/StarField.vue'

const game = useGameStore()
const showAll = ref(false)

// ─── Resource helpers ───────────────────────────────────────────
const RES_META = {
  energia: { label: 'Energia',   icon: '⚡', color: '#59d34c' },
  energy:  { label: 'Energia',   icon: '⚡', color: '#59d34c' },
  jedlo:   { label: 'Jedlo',     icon: '🍖', color: '#e284ff' },
  food:    { label: 'Jedlo',     icon: '🍖', color: '#e284ff' },
  voda:    { label: 'Voda',      icon: '💧', color: '#56fff3' },
  water:   { label: 'Voda',      icon: '💧', color: '#56fff3' },
  vapno:   { label: 'Vápenec',   icon: '🪨', color: '#ffd760' },
  vapenc:  { label: 'Vápenec',   icon: '🪨', color: '#ffd760' },
  kredity: { label: 'Kredity',   icon: '💳', color: '#f0f0f0' },
  credits: { label: 'Kredity',   icon: '💳', color: '#f0f0f0' },
  vyskum:  { label: 'Výskum',    icon: '🔬', color: '#f0f0f0' },
  research:{ label: 'Výskum',    icon: '🔬', color: '#f0f0f0' },
  posadka: { label: 'Posádka',   icon: '👥', color: '#04befe' },
}

function resPercent(val) {
  if (!val) return 0
  const m = String(val).match(/(\d+)\s*\/\s*(\d+)/)
  return m ? Math.round(parseInt(m[1]) / parseInt(m[2]) * 100) : 50
}

function resValue(val) {
  if (!val) return '—'
  return String(val).replace(/^[a-zA-ZáčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ\s]+/, '').trim() || String(val)
}

const SKIP_KEYS = new Set(['renown','happiness','success','progress','progress-bar'])

const resources = computed(() => {
  const raw = game.data?.resources || {}
  return Object.entries(raw)
    .filter(([k]) => !SKIP_KEYS.has(k))
    .map(([k, v]) => {
      const meta = RES_META[k.toLowerCase()] || { label: k, icon: '◆', color: '#04befe' }
      return { key: k, ...meta, value: resValue(v), pct: resPercent(v) }
    })
})

const stats = computed(() => {
  const raw = game.data?.stats || {}
  return Object.entries(raw).map(([k, v]) => ({
    key: k,
    label: k.replace(/-/g, ' '),
    value: resValue(v),
  }))
})

const alerts    = computed(() => game.data?.alerts || [])
const quests    = computed(() => game.data?.quests || [])
const infoboxes = computed(() => game.data?.infoboxes || [])

onMounted(() => {
  if (!game.data) {
    game.fetchDashboard()
  }
})
</script>

<style scoped>
/* ── Page wrapper ── */
.dash-page {
  min-height: 100vh;
  padding-bottom: 72px;
  position: relative;
  z-index: 1;
}

/* ── Loading ── */
.dash-loading {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 60px 20px; gap: 14px;
}
.dash-loader {
  width: 48px; height: 48px;
  border: 2px solid rgba(4,190,254,0.15);
  border-top-color: #04befe;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}
.dash-loading-text {
  font-family: Verdana, sans-serif;
  font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #04befe;
}
.blink { animation: blink 1s step-end infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

/* ── Error ── */
.dash-error {
  margin: 16px 12px;
  background: rgba(160,10,10,0.22);
  border: 1px solid rgba(255,60,60,0.35);
  border-radius: 3px;
  padding: 14px 14px;
}
.dash-error-title { font-weight: bold; margin-bottom: 6px; color: #ff7070; font-size: 13px; }
.dash-error-msg { font-size: 12px; color: rgba(255,120,120,0.85); margin-bottom: 12px; }

/* ── Content ── */
.dash-content { padding: 10px 10px 0; }

/* ── Section ── */
.dash-section { margin-bottom: 10px; }

.dash-section-label {
  font-family: Verdana, sans-serif;
  font-size: 9px;
  font-weight: bold;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: #04befe;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.dash-section-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(4,190,254,0.4), transparent);
}

/* ── Panel ── */
.dash-panel {
  background: rgba(4,190,254,0.09);
  border: 1px solid rgba(4,190,254,0.4);
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}
.dash-panel::before {
  content: '';
  position: absolute; top: 0; left: 0;
  width: 10px; height: 10px;
  border-top: 2px solid #04befe;
  border-left: 2px solid #04befe;
  z-index: 1;
}
.dash-panel::after {
  content: '';
  position: absolute; bottom: 0; right: 0;
  width: 10px; height: 10px;
  border-bottom: 2px solid #04befe;
  border-right: 2px solid #04befe;
  z-index: 1;
}

.dash-panel-head {
  background: rgba(4,190,254,0.22);
  border-bottom: 1px solid rgba(4,190,254,0.35);
  padding: 7px 10px;
  font-family: Verdana, sans-serif;
  font-size: 12px;
  font-weight: bold;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 7px;
}
.dash-panel-head-gold { border-bottom-color: rgba(255,200,0,0.3); }
.dash-panel-head-blue { background: rgba(40,80,200,0.2); border-bottom-color: rgba(50,100,255,0.3); }

.dash-panel-head-sub {
  margin-left: auto;
  font-size: 9px;
  color: rgba(4,190,254,0.5);
  letter-spacing: 1px;
}

.dash-panel-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #04befe;
  box-shadow: 0 0 6px #04befe;
  flex-shrink: 0;
  animation: dotPulse 2s ease-in-out infinite;
}
@keyframes dotPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

.dash-badge-count {
  margin-left: auto;
  background: rgba(255,200,0,0.1);
  border: 1px solid rgba(255,200,0,0.35);
  color: gold;
  font-size: 10px;
  border-radius: 2px;
  padding: 1px 6px;
}

.dash-panel-body {
  padding: 9px 10px;
  background: rgba(0,0,0,0.55);
}

/* ── Resources grid ── */
.dash-resources-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.dash-res {
  background: rgba(0,0,0,0.65);
  border: 1px solid rgba(4,190,254,0.22);
  border-radius: 2px;
  padding: 7px 9px 10px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 8px;
}
.dash-res-icon { font-size: 18px; flex-shrink: 0; line-height: 1; }
.dash-res-info { flex: 1; min-width: 0; }
.dash-res-name {
  font-family: Verdana, sans-serif;
  font-size: 9px; letter-spacing: 1px; text-transform: uppercase;
  color: rgba(255,255,255,0.45); margin-bottom: 2px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.dash-res-val {
  font-family: Verdana, sans-serif;
  font-size: 13px; font-weight: bold;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.dash-res-bar-wrap {
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 3px;
  background: rgba(255,255,255,0.06);
}
.dash-res-bar {
  height: 100%;
  opacity: 0.7;
  transition: width 1s ease;
  box-shadow: 0 0 4px currentColor;
}

/* ── Stat rows ── */
.dash-stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  border-bottom: 1px dotted rgba(4,190,254,0.12);
  font-family: Verdana, sans-serif;
  font-size: 12px;
}
.dash-stat-row:last-child { border-bottom: none; }
.dash-stat-key { color: rgba(255,255,255,0.75); }
.dash-stat-val { font-weight: bold; color: #04befe; }

/* ── Commands ── */
.dash-commands {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
}
.dash-btn-wide { grid-column: 1 / -1; }

/* ── Shared btn ── */
.dash-btn {
  background: rgba(4,190,254,0.13);
  border: 1px solid rgba(4,190,254,0.45);
  border-radius: 2px;
  color: #fff;
  font-family: Verdana, sans-serif;
  font-size: 12px;
  font-weight: bold;
  padding: 8px 10px;
  cursor: pointer;
  text-align: center;
  min-height: 38px;
  display: flex; align-items: center; justify-content: center;
  gap: 5px;
  transition: background 0.12s;
}
.dash-btn:hover, .dash-btn:active { background: rgba(4,190,254,0.28); }

/* ── Alerts ── */
.dash-alert {
  padding: 8px 10px;
  background: rgba(100,90,90,0.22);
  border-left: 2px solid #04befe;
  border-bottom: 1px dotted rgba(4,190,254,0.1);
  font-family: Verdana, sans-serif;
  font-size: 12px;
  line-height: 1.45;
}
.dash-alert:hover { background: rgba(100,90,90,0.35); }
.dash-alert-text { color: rgba(255,255,255,0.9); }
.dash-alert-time { font-size: 10px; color: rgba(255,255,255,0.4); margin-top: 2px; }
.dash-more-btn {
  width: 100%; padding: 8px; background: none; border: none;
  border-top: 1px dotted rgba(4,190,254,0.15);
  color: rgba(4,190,254,0.55); font-size: 11px; cursor: pointer; text-align: center;
}
.dash-more-btn:hover { color: #04befe; }

/* ── Quests ── */
.dash-quest-row {
  display: flex; align-items: flex-start; gap: 8px;
  padding: 4px 0;
  font-family: Verdana, sans-serif;
  font-size: 12px;
  color: rgba(255,255,255,0.55);
}
.dash-quest-row.active { font-weight: bold; color: rgba(255,255,255,0.95); }
.dash-quest-icon { color: rgba(4,190,254,0.5); flex-shrink: 0; }
.dash-quest-row.active .dash-quest-icon { color: #4a7aff; }

/* ── Infobox text ── */
.dash-infobox-text {
  font-family: Verdana, sans-serif;
  font-size: 12px;
  line-height: 1.55;
  color: rgba(255,255,255,0.8);
}

/* ── Empty state ── */
.dash-empty {
  text-align: center;
  padding: 24px 10px;
}
.dash-empty-icon { font-size: 28px; color: #04befe; margin-bottom: 10px; }
.dash-empty-title { font-weight: bold; letter-spacing: 1px; color: rgba(4,190,254,0.7); font-size: 12px; margin-bottom: 5px; }
.dash-empty-sub { font-size: 11px; color: rgba(255,255,255,0.3); }
</style>
