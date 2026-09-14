<template>
  <!-- Overlay -->
  <transition enter-active-class="transition-opacity duration-250 ease-out"
              enter-from-class="opacity-0" enter-to-class="opacity-100"
              leave-active-class="transition-opacity duration-200 ease-in"
              leave-from-class="opacity-100" leave-to-class="opacity-0">
    <div v-if="open" class="sgu-overlay" @click="$emit('close')" style="z-index: 55;" />
  </transition>

  <!-- Left Drawer -->
  <transition enter-active-class="transition-transform duration-280 ease-out"
              enter-from-class="-translate-x-full" enter-to-class="translate-x-0"
              leave-active-class="transition-transform duration-200 ease-in"
              leave-from-class="translate-x-0" leave-to-class="-translate-x-full">
    <nav v-if="open" class="sgu-drawer left-drawer" style="left: 0; right: auto; border-left: none; border-right: 1px solid rgba(4,190,254,0.3); box-shadow: 8px 0 32px rgba(0,0,0,0.8);">

      <!-- Header: Player name + links -->
      <div class="left-header">
        <button @click="$emit('close')" class="drawer-close-btn">✕</button>
        <div class="left-header-name">
          <span class="rank-strip"></span>
          {{ auth.playerName || 'Veliteľ' }}
        </div>
        <div class="left-header-links">
          <span>🖧 Destiny</span> | <span style="color:gold;">⚠ Quest Log</span>
        </div>
      </div>

      <!-- Scrollable content -->
      <div class="left-content sgu-drawer-menu">
        <div v-if="game.loading && !game.data" style="padding:20px; text-align:center; color:#04befe;">
          Načítavam...
        </div>
        
        <template v-else>
          <!-- Destiny Stats -->
          <div class="left-section">Destiny</div>
          <div v-for="s in stats" :key="s.key" class="left-row">
            <span class="left-key"><span class="left-icon">{{ s.icon }}</span>{{ s.label }}</span>
            <span class="left-val" v-if="!s.isBar">{{ s.value }}</span>
            <div class="left-bar-wrap" v-else>
              <div class="left-bar-text">{{ s.value }}</div>
              <div class="left-bar" :style="{ width: s.pct + '%' }"></div>
            </div>
          </div>

          <!-- Resources -->
          <div class="left-section">Zdroje</div>
          <div v-for="r in resources" :key="r.key" class="left-row">
            <span class="left-key"><span class="left-icon">{{ r.icon }}</span>{{ r.label }}</span>
            <span class="left-val" :style="{ color: r.color }">{{ r.value }}</span>
          </div>

          <!-- Stav -->
          <div class="left-section">Stav</div>
          <div v-for="(a, i) in alerts" :key="i" class="left-alert">
            {{ a.text || a }}
          </div>
          <div v-if="!alerts.length" class="left-alert" style="color:rgba(255,255,255,0.4);">
            Žiadne hlásenia
          </div>

          <!-- Ostatní -->
          <div class="left-section">Ostatní</div>
          <div class="left-link" @click="go('/notes')">📄 Poznámky</div>
          <div class="left-link" @click="go('/helpdesk')">⚙ Helpdesk</div>
          <div class="left-link" @click="go('/stats')">📊 Statistiky</div>
          <div class="left-link" @click="go('/help')">❓ Nápověda</div>
        </template>
      </div>

      <!-- Footer: Logout -->
      <div class="sgu-drawer-footer">
        <button @click="doLogout" class="sgu-btn-logout">🚪 Odhlásiť sa</button>
      </div>

    </nav>
  </transition>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useGameStore } from '../stores/game'

const props = defineProps({
  open: { type: Boolean, default: false }
})
const emit = defineEmits(['close'])

const router = useRouter()
const auth   = useAuthStore()
const game   = useGameStore()

// Fetch data when opened if not loaded
watch(() => props.open, (isOpen) => {
  if (isOpen && !game.data) {
    game.fetchDashboard()
  }
})

function resValue(val) {
  if (!val) return '—'
  return String(val).replace(/^[a-zA-ZáčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ\s]+/, '').trim() || String(val)
}

function resPercent(val) {
  if (!val) return 0
  const m = String(val).match(/(\d+)\s*\/\s*(\d+)/)
  return m ? Math.round(parseInt(m[1]) / parseInt(m[2]) * 100) : 50
}

const RES_META = {
  energia: { label: 'Energie',   icon: '⚡', color: '#59d34c' },
  energy:  { label: 'Energie',   icon: '⚡', color: '#59d34c' },
  jedlo:   { label: 'Jídlo',     icon: '🍖', color: '#e284ff' },
  food:    { label: 'Jídlo',     icon: '🍖', color: '#e284ff' },
  voda:    { label: 'Voda',      icon: '💧', color: '#56fff3' },
  water:   { label: 'Voda',      icon: '💧', color: '#56fff3' },
  vapno:   { label: 'Vápenec',   icon: '🪨', color: '#ffd760' },
  vapenc:  { label: 'Vápenec',   icon: '🪨', color: '#ffd760' },
  kredity: { label: 'Kredity',   icon: '💳', color: '#f0f0f0' },
  credits: { label: 'Kredity',   icon: '💳', color: '#f0f0f0' },
  vyskum:  { label: 'Výzkumné body', icon: '🔬', color: '#f0f0f0' },
  research:{ label: 'Výzkumné body', icon: '🔬', color: '#f0f0f0' },
  slava:   { label: 'Sláva',     icon: '👑', color: 'gold' },
  renown:  { label: 'Sláva',     icon: '👑', color: 'gold' },
  fragmenty: { label: 'Fragmenty', icon: '💠', color: '#04befe' },
  fragments: { label: 'Fragmenty', icon: '💠', color: '#04befe' },
  spokojenost: { label: 'Spokojenost', icon: '😊', color: '#59d34c' },
}

const SKIP_KEYS = new Set(['success','progress','progress-bar'])

const resources = computed(() => {
  const raw = game.data?.resources || {}
  return Object.entries(raw)
    .filter(([k]) => !SKIP_KEYS.has(k))
    .map(([k, v]) => {
      const meta = RES_META[k.toLowerCase()] || { label: k, icon: '◆', color: '#04befe' }
      return { key: k, ...meta, value: resValue(v) }
    })
})

const stats = computed(() => {
  const raw = game.data?.stats || {}
  const items = []
  
  // Custom mapping if available, otherwise just format generic
  for (const [k, v] of Object.entries(raw)) {
    let icon = '🔸'
    if (k.toLowerCase().includes('útocna') || k.toLowerCase().includes('utocna')) icon = '🎯'
    if (k.toLowerCase().includes('stity') || k.toLowerCase().includes('štíty')) icon = '🛡'
    if (k.toLowerCase().includes('rychlost')) icon = '🚀'
    if (k.toLowerCase().includes('brany') || k.toLowerCase().includes('brány')) icon = '⭕'
    if (k.toLowerCase().includes('posadka') || k.toLowerCase().includes('posádka')) icon = '👥'
    
    let isBar = false
    let pct = 0
    if (k.toLowerCase().includes('vyzkum') || k.toLowerCase().includes('výzkum')) {
      icon = '🔍'
      isBar = true
      pct = resPercent(v)
    }

    items.push({
      key: k,
      label: k.replace(/-/g, ' '),
      value: resValue(v),
      icon,
      isBar,
      pct
    })
  }
  return items
})

const alerts = computed(() => {
  return (game.data?.alerts || []).slice(0, 5) // max 5 alerts in menu
})

function go(path) {
  router.push(path)
  emit('close')
}

async function doLogout() {
  emit('close')
  await auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.left-drawer {
  width: min(85vw, 320px);
}
.drawer-close-btn {
  position: absolute; top: 12px; right: 12px;
  background: rgba(4,190,254,0.1);
  border: 1px solid rgba(4,190,254,0.3); border-radius: 2px;
  color: rgba(255,255,255,0.55); width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; cursor: pointer;
}
.drawer-close-btn:active { background: rgba(4,190,254,0.25); }

.left-header {
  padding: 14px 14px 12px;
  position: relative;
  background: rgba(0,0,0,0.4);
}
.left-header-name {
  font-size: 18px; font-weight: bold; color: #fff;
  display: flex; align-items: center; gap: 8px; margin-bottom: 6px;
}
.rank-strip {
  width: 5px; height: 18px; background: gold;
}
.left-header-links {
  font-size: 11px; color: rgba(255,255,255,0.7);
  display: flex; gap: 6px; align-items: center;
}

.left-section {
  font-size: 14px; font-weight: bold; color: #fff;
  margin: 14px 12px 6px;
  border-bottom: 1px solid rgba(4,190,254,0.3);
  padding-bottom: 4px;
}
.left-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 4px 12px; font-size: 12px; color: rgba(255,255,255,0.8);
}
.left-key { display: flex; align-items: center; gap: 6px; }
.left-icon { font-size: 14px; width: 16px; text-align: center; }
.left-val { text-align: right; }

.left-bar-wrap {
  flex: 1; margin-left: 10px; max-width: 100px;
  background: rgba(4,190,254,0.15); height: 16px;
  border-radius: 2px; position: relative; overflow: hidden;
}
.left-bar {
  background: rgba(4,190,254,0.6); height: 100%;
}
.left-bar-text {
  position: absolute; inset: 0; text-align: center; font-size: 10px;
  line-height: 16px; color: #fff; text-shadow: 0 0 2px #000;
}

.left-alert {
  padding: 4px 12px; font-size: 12px; color: rgba(255,255,255,0.9);
}

.left-link {
  padding: 6px 12px; font-size: 13px; color: rgba(255,255,255,0.8);
  cursor: pointer; display: flex; align-items: center; gap: 8px;
}
.left-link:hover { color: #04befe; background: rgba(4,190,254,0.1); }
</style>
