<template>
  <!-- Starfield pozadie -->
  <StarField />

  <!-- Scanlines overlay -->
  <div class="scanlines" />

  <!-- Hlavní wrapper -->
  <div class="page-content" style="position:relative; z-index:1;">

    <!-- ══ TOP BAR ══ -->
    <div class="top-bar">
      <!-- Levá: logo + player -->
      <div class="flex items-center gap-3">
        <div class="font-hud text-xs font-bold tracking-widest" style="color:var(--c-accent); letter-spacing:3px;">
          SG·U
        </div>
        <div class="hud-divider" style="width:1px; height:24px; background:rgba(30,170,255,0.3);"></div>
        <div v-if="data?.player?.username" class="flex items-center gap-2">
          <div class="relative">
            <div class="w-8 h-8 rounded flex items-center justify-center text-base"
                 style="background:rgba(30,170,255,0.1); border:1px solid rgba(30,170,255,0.4); box-shadow:var(--glow-sm);">
              👨‍🚀
            </div>
            <div class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                 style="background:var(--c-green); border:1px solid var(--c-dark); box-shadow:0 0 6px var(--c-green);"></div>
          </div>
          <div>
            <div class="font-hud text-xs font-bold text-white tracking-wide">{{ data.player.username }}</div>
            <div class="text-[9px] tracking-wider uppercase" style="color:var(--c-dim);">
              {{ data.player.rankClass?.replace('rank-standard','').replace(/-/g,' ').trim() || 'Velitel' }}
            </div>
          </div>
        </div>
        <div v-else class="font-hud text-xs" style="color:var(--c-dim);">NAČÍTÁVÁM...</div>
      </div>

      <!-- Pravá: notif + refresh -->
      <div class="flex items-center gap-2">
        <router-link v-if="data?.hasNewReport" to="/reports"
          class="flex items-center gap-1 px-2 py-1 text-[9px] font-hud tracking-wider rounded"
          style="background:rgba(255,59,59,0.15); border:1px solid rgba(255,59,59,0.5); color:var(--c-red); animation:glowPulse 1.5s infinite;">
          ⚠ REPORT
        </router-link>
        <button @click="refresh"
          class="w-8 h-8 flex items-center justify-center rounded text-base"
          :class="loading ? 'anim-spin' : ''"
          style="background:rgba(30,170,255,0.08); border:1px solid rgba(30,170,255,0.25); color:var(--c-accent);">
          ↺
        </button>
      </div>
    </div>

    <!-- ══ LOADING ══ -->
    <div v-if="loading && !data" class="flex flex-col items-center justify-center py-20 gap-4">
      <div class="w-16 h-16 rounded-full flex items-center justify-center font-hud text-2xl anim-glow-pulse"
           style="border:2px solid var(--c-accent); color:var(--c-accent); box-shadow:var(--glow-md);">
        ⟳
      </div>
      <div class="font-hud text-xs tracking-widest" style="color:var(--c-dim); letter-spacing:3px;">
        NAČÍTÁVÁM SYSTÉMY<span class="anim-blink">_</span>
      </div>
    </div>

    <!-- ══ CHYBA ══ -->
    <div v-else-if="error" class="mx-4 mt-4 hud-panel anim-fade-up" style="border-color:rgba(255,59,59,0.5);">
      <div class="corner-tr"></div><div class="corner-bl"></div>
      <div class="hud-header" style="color:var(--c-red); border-bottom-color:rgba(255,59,59,0.2);">
        <div class="hud-dot" style="background:var(--c-red);"></div> CHYBA SYSTÉMU
      </div>
      <div class="p-4">
        <p class="text-sm mb-3" style="color:rgba(255,100,100,0.9);">{{ error }}</p>
        <button @click="refresh" class="btn-hud">↺ ZNOVU</button>
      </div>
    </div>

    <!-- ══ HLAVNÍ OBSAH ══ -->
    <template v-else-if="data">
      <div class="px-4 pt-3 space-y-4">

        <!-- ── SUROVINY (Resource Grid) ── -->
        <section v-if="Object.keys(data.resources || {}).length" class="anim-fade-up">
          <div class="flex items-center gap-2 mb-2">
            <div class="font-hud text-[9px] tracking-widest" style="color:var(--c-dim); letter-spacing:2.5px;">
              ▸ ZDROJE LODE
            </div>
            <div class="flex-1 hud-divider"></div>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div v-for="(val, key) in data.resources" :key="key"
                 v-show="!['renown','happiness','success','progress','progress-bar'].includes(key)"
                 class="res-chip">
              <div class="text-[9px] font-hud tracking-wider mb-1 truncate" style="color:var(--c-dim);">
                {{ resourceIcon(key) }} {{ key }}
              </div>
              <div class="font-hud text-sm font-bold truncate"
                   :style="`color: ${resourceColor(key)};`"
                   v-html="formatResourceVal(val)">
              </div>
              <!-- Animovaný bottom bar -->
              <div class="res-bar" :style="`width: ${resourcePercent(val)}%;`"></div>
            </div>
          </div>
        </section>

        <!-- ── ŠTATISTIKY LODE ── -->
        <section v-if="Object.keys(data.stats || {}).length" class="anim-fade-up" style="animation-delay:0.05s;">
          <div class="flex items-center gap-2 mb-2">
            <div class="font-hud text-[9px] tracking-widest" style="color:var(--c-dim); letter-spacing:2.5px;">▸ STATISTIKY</div>
            <div class="flex-1 hud-divider"></div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div v-for="(val, key) in data.stats" :key="key" class="stat-block">
              <div class="stat-label">{{ key.replace(/-/g,' ') }}</div>
              <div class="stat-value text-xs truncate">{{ formatStatVal(val) }}</div>
            </div>
          </div>
        </section>

        <!-- ── ROZKAZY PRO DESTINY ── -->
        <section class="hud-panel anim-fade-up" style="animation-delay:0.1s;">
          <div class="corner-tr"></div><div class="corner-bl"></div>
          <div class="scan-line"></div>
          <div class="hud-header">
            <div class="hud-dot"></div>
            ROZKAZY PRO DESTINY
            <span class="ml-auto font-hud text-[8px]" style="color:var(--c-dim);">MŮSTEK</span>
          </div>
          <div class="p-3 grid grid-cols-2 gap-2">
            <button class="btn-hud btn-primary text-center">⚡ AUTOPILOT</button>
            <button class="btn-hud text-center">🌀 FTL LET</button>
            <button class="btn-hud col-span-2 text-center" style="font-size:9px;">
              🌍 ORBITÁLNÍ SKEN PLANETY
            </button>
          </div>
        </section>

        <!-- ── VÝSTRAHY A HLÁSENIA ── -->
        <section v-if="data.alerts?.length" class="hud-panel anim-fade-up" style="animation-delay:0.15s;">
          <div class="corner-tr"></div><div class="corner-bl"></div>
          <div class="hud-header">
            <div class="hud-dot" style="background:var(--c-gold); box-shadow:0 0 8px var(--c-gold);"></div>
            VÝSTRAHY A HLÁŠENÍ
            <span class="ml-auto text-[8px] font-hud px-2 py-0.5 rounded"
                  style="background:rgba(240,192,64,0.1); border:1px solid rgba(240,192,64,0.3); color:var(--c-gold);">
              {{ data.alerts.length }}
            </span>
          </div>
          <div>
            <div v-for="(alert, i) in data.alerts.slice(0,4)" :key="i" class="alert-item">
              {{ alert }}
            </div>
            <div v-if="data.alerts.length > 4"
                 class="px-3 py-2 text-[10px] font-hud text-center"
                 style="color:var(--c-dim);">
              + {{ data.alerts.length - 4 }} dalších hlášení
            </div>
          </div>
        </section>

        <!-- ── QUEST LOG ── -->
        <section v-if="data.quests?.length" class="hud-panel anim-fade-up" style="animation-delay:0.2s; border-color:rgba(30,100,255,0.4);">
          <div class="corner-tr" style="border-color:rgba(50,130,255,0.6);"></div>
          <div class="corner-bl" style="border-color:rgba(50,130,255,0.6);"></div>
          <div class="hud-header" style="background:linear-gradient(90deg, rgba(50,100,255,0.12) 0%, transparent 100%); border-bottom-color:rgba(50,130,255,0.2);">
            <div class="hud-dot" style="background:#4a7aff; box-shadow:0 0 8px #4a7aff;"></div>
            QUEST LOG
          </div>
          <div class="p-3 space-y-1.5">
            <div v-for="(q, i) in data.quests" :key="i"
                 class="flex items-start gap-2 text-xs"
                 :class="i === 0 ? 'font-bold' : 'opacity-70'">
              <span :style="i === 0 ? 'color:#4a7aff;' : 'color:var(--c-dim);'">{{ i === 0 ? '►' : '·' }}</span>
              <span :style="i === 0 ? 'color:#a0c0ff;' : 'color:var(--c-text);'">{{ q }}</span>
            </div>
          </div>
        </section>

        <!-- ── DENNÍ PŘÍJEM / INFO BOXY ── -->
        <section v-if="data.infoboxes?.length" class="space-y-3 anim-fade-up" style="animation-delay:0.25s;">
          <div class="flex items-center gap-2 mb-1">
            <div class="font-hud text-[9px] tracking-widest" style="color:var(--c-dim); letter-spacing:2.5px;">▸ DENNÍ REPORTY</div>
            <div class="flex-1 hud-divider"></div>
          </div>
          <div v-for="box in data.infoboxes" :key="box.title" class="hud-panel">
            <div class="corner-tr"></div><div class="corner-bl"></div>
            <div class="hud-header">
              <div class="hud-dot"></div>
              {{ box.title.replace(/\[\?\]|\[x\]/g,'').trim() }}
            </div>
            <div class="p-3 text-xs leading-relaxed" style="color:var(--c-text); font-family:'Rajdhani',sans-serif;">
              {{ box.content }}{{ box.content?.length === 300 ? '…' : '' }}
            </div>
          </div>
        </section>

        <!-- ── CHAT ── -->
        <section v-if="data.chat?.length" class="hud-panel anim-fade-up" style="animation-delay:0.3s; border-color:rgba(30,170,255,0.15);">
          <div class="corner-tr"></div><div class="corner-bl"></div>
          <div class="hud-header" style="color:var(--c-dim); background:none;">
            <div class="hud-dot" style="background:var(--c-dim); box-shadow:none;"></div>
            HERNÍ CHAT
          </div>
          <div class="max-h-40 overflow-y-auto p-3 space-y-1">
            <div v-for="(msg, i) in data.chat" :key="i"
                 class="text-xs leading-relaxed"
                 style="color:var(--c-dim); font-family:'Rajdhani',sans-serif;">
              <span style="color:rgba(30,170,255,0.4);">&gt;</span> {{ msg }}
            </div>
          </div>
        </section>

        <!-- Prázdný panel když nejsou data -->
        <section v-if="!data.alerts?.length && !data.quests?.length" class="hud-panel anim-fade-up">
          <div class="corner-tr"></div><div class="corner-bl"></div>
          <div class="scan-line"></div>
          <div class="hud-header">
            <div class="hud-dot"></div>
            SYSTÉM AKTIVNÍ
          </div>
          <div class="p-4 text-center space-y-2">
            <div class="font-hud text-2xl" style="color:var(--c-accent);">◈</div>
            <div class="font-hud text-xs tracking-wider" style="color:var(--c-dim);">
              VŠECHNY SYSTÉMY V POŘÁDKU
            </div>
            <div class="text-xs" style="color:rgba(30,170,255,0.5);">Žádná aktivní hlášení</div>
          </div>
        </section>

      </div>
    </template>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'
import StarField from '../components/StarField.vue'

const data    = ref(null)
const loading = ref(false)
const error   = ref(null)

const router = useRouter()
const auth   = useAuthStore()

// ── Helpers pre zdroje ──
const RESOURCE_ICONS = {
  energia: '⚡', energy: '⚡',
  jedlo: '🍖', food: '🍖',
  voda: '💧', water: '💧',
  vapno: '🪨', lime: '🪨', vápno: '🪨',
  kredity: '💳', credits: '💳',
  vyskum: '🔬', research: '🔬', výskum: '🔬',
  slava: '⭐', renown: '⭐', sláva: '⭐',
  fragmenty: '🔷', fragments: '🔷',
}
const RESOURCE_COLORS = {
  energia: '#f0c040', energy: '#f0c040',
  jedlo: '#ff8844', food: '#ff8844',
  voda: '#44aaff', water: '#44aaff',
  vapno: '#aaaaaa', lime: '#aaaaaa', vápno: '#aaaaaa',
  kredity: '#f0c040', credits: '#f0c040',
  vyskum: '#00e5ff', research: '#00e5ff', výskum: '#00e5ff',
  slava: '#f0c040', renown: '#f0c040', sláva: '#f0c040',
}

function resourceIcon(key) {
  return RESOURCE_ICONS[key.toLowerCase()] || '◆'
}
function resourceColor(key) {
  return RESOURCE_COLORS[key.toLowerCase()] || 'var(--c-accent)'
}
function formatResourceVal(val) {
  if (!val) return '—'
  // Odstráni textový prefix (napr. "Energia 95/100" → "95/100")
  return val.replace(/^[a-zA-ZáčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ\s]+/, '').trim() || val
}
function formatStatVal(val) {
  if (!val) return '—'
  return val.replace(/^[a-zA-ZáčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ\s]+/, '').trim() || val
}
function resourcePercent(val) {
  if (!val) return 0
  const m = val.match(/(\d+)\s*\/\s*(\d+)/)
  if (m) return Math.round((parseInt(m[1]) / parseInt(m[2])) * 100)
  return 50
}

async function refresh() {
  loading.value = true
  error.value = null
  try {
    const res = await axios.get('/api/dashboard')
    data.value = res.data.data
    if (data.value?.player) {
      auth.setPlayerProfile(
        data.value.player.username,
        data.value.player.rankClass?.replace('rank-standard','').replace(/-/g,' ').trim() || '',
        data.value.resources?.kredity || data.value.resources?.credits || ''
      )
    }
  } catch (e) {
    error.value = e.response?.data?.error || 'Nepodarilo sa načítať dashboard'
    // Demo dáta pre ukážku keď nie je spojenie
    if (!data.value) {
      data.value = {
        player: { username: auth.playerName || 'Veliteľ', rankClass: '' },
        resources: {},
        stats: {},
        alerts: [],
        quests: [],
        infoboxes: [],
        chat: [],
      }
    }
  } finally {
    loading.value = false
  }
}

onMounted(refresh)
</script>

<style scoped>
/* Scoped override – page-content bez paddingu navrchu */
:deep(.page-content) { padding-top: 0; }
</style>
