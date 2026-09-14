<template>
  <!-- Vesmírne pozadie -->
  <StarField />
  <div class="sgu-scanlines" />

  <!-- Hlavný wrapper -->
  <div class="sgu-page">

    <!-- ══ TOP BAR ══ -->
    <div class="sgu-topbar">
      <!-- Ľavá: logo + hráč -->
      <div style="display:flex; align-items:center; gap:8px;">
        <img src="/src/assets/img/sgu-game.png" alt="SG:U" style="height:22px; filter:drop-shadow(0 0 6px rgba(4,190,254,0.5));" />
        <div v-if="data?.player?.username" class="sgu-player-badge">
          👨‍🚀 {{ data.player.username }}
        </div>
        <div v-else style="font-size:11px; color:rgba(4,190,254,0.5);">Načítavam...</div>
      </div>

      <!-- Pravá: report badge + refresh -->
      <div style="display:flex; align-items:center; gap:6px;">
        <router-link v-if="data?.hasNewReport" to="/reports" class="sgu-report-badge">
          ⚠ REPORT
        </router-link>
        <button
          @click="refresh"
          class="sgu-refresh-btn"
          :class="loading ? 'sg-spin' : ''"
          title="Obnoviť"
        >↺</button>
      </div>
    </div>

    <!-- ══ LOADING ══ -->
    <div v-if="loading && !data" class="sgu-loading">
      <div class="sgu-loading-ring"></div>
      <div class="sgu-loading-text">Načítavam systémy<span class="sg-blink">_</span></div>
    </div>

    <!-- ══ CHYBA ══ -->
    <div v-else-if="error" class="sgu-error sg-fade-up">
      <div style="font-weight:bold; margin-bottom:6px;">⚠ Chyba systému</div>
      <div style="font-size:12px;">{{ error }}</div>
      <button @click="refresh" class="sgu-btn" style="margin-top:10px; width:100%;">↺ Skúsiť znova</button>
    </div>

    <!-- ══ HLAVNÝ OBSAH ══ -->
    <template v-else-if="data">
      <div style="padding: 10px 10px 0; display:flex; flex-direction:column; gap:10px;">

        <!-- ── ZDROJE LODE ── -->
        <section v-if="Object.keys(data.resources || {}).length" class="sg-fade-up">
          <div class="sgu-section-label">▸ Zdroje lode</div>
          <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:6px;">
            <div
              v-for="(val, key) in data.resources" :key="key"
              v-show="!['renown','happiness','success','progress','progress-bar'].includes(key)"
              class="sgu-res-chip"
            >
              <div class="sgu-res-label">{{ resourceIcon(key) }} {{ key }}</div>
              <div class="sgu-res-value" :style="`color:${resourceColor(key)};`" v-html="formatResourceVal(val)"></div>
              <div class="sgu-res-bar" :style="`width:${resourcePercent(val)}%;`"></div>
            </div>
          </div>
        </section>

        <!-- ── ŠTATISTIKY LODE ── -->
        <section v-if="Object.keys(data.stats || {}).length" class="sgu-panel sg-fade-up" style="animation-delay:0.05s;">
          <div class="sgu-panel-title">
            <span class="dot"></span>
            Štatistiky Destiny
          </div>
          <div class="sgu-panel-body">
            <div v-for="(val, key) in data.stats" :key="key" class="sgu-stat-row">
              <span class="sgu-stat-key">{{ key.replace(/-/g,' ') }}</span>
              <span class="sgu-stat-val">{{ formatStatVal(val) }}</span>
            </div>
          </div>
        </section>

        <!-- ── ROZKAZY PRE DESTINY ── -->
        <section class="sgu-panel sg-fade-up" style="animation-delay:0.08s;">
          <div class="sgu-panel-title">
            <span class="dot"></span>
            Rozkazy pre Destiny
            <span style="margin-left:auto; font-size:9px; color:rgba(4,190,254,0.5);">MŮSTEK</span>
          </div>
          <div class="sgu-panel-body" style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <button class="sgu-btn" style="font-size:11px; padding:7px 8px;">⚡ Autopilot</button>
            <button class="sgu-btn" style="font-size:11px; padding:7px 8px;">🌀 FTL let</button>
            <button class="sgu-btn" style="font-size:11px; padding:7px 8px; grid-column:1/-1;">🌍 Orbitálny sken planéty</button>
          </div>
        </section>

        <!-- ── VÝSTRAHY A HLÁSENIA ── -->
        <section v-if="data.alerts?.length" class="sgu-panel sg-fade-up" style="animation-delay:0.1s;">
          <div class="sgu-panel-title" style="border-bottom-color:rgba(255,200,0,0.3);">
            <span class="dot" style="background:gold; box-shadow:0 0 6px gold;"></span>
            Výstrahy a hlásenia
            <span style="margin-left:auto; background:rgba(255,200,0,0.1); border:1px solid rgba(255,200,0,0.3); color:gold; font-size:10px; border-radius:2px; padding:1px 6px;">
              {{ data.alerts.length }}
            </span>
          </div>
          <div>
            <div v-for="(alert, i) in data.alerts.slice(0,5)" :key="i" class="sgu-alert">
              {{ alert }}
            </div>
            <div v-if="data.alerts.length > 5"
                 style="padding:6px 10px; font-size:10px; color:rgba(4,190,254,0.5); text-align:center; cursor:pointer;"
                 @click="showAllAlerts = !showAllAlerts">
              {{ showAllAlerts ? '▲ Skryť' : `+ ${data.alerts.length - 5} ďalších hlásení ▼` }}
            </div>
            <template v-if="showAllAlerts">
              <div v-for="(alert, i) in data.alerts.slice(5)" :key="'a'+i" class="sgu-alert">
                {{ alert }}
              </div>
            </template>
          </div>
        </section>

        <!-- ── QUEST LOG ── -->
        <section v-if="data.quests?.length" class="sgu-panel sg-fade-up" style="animation-delay:0.15s; border-color:rgba(30,100,255,0.4);">
          <div class="sgu-panel-title" style="background:rgba(30,80,200,0.2); border-bottom-color:rgba(50,100,255,0.3);">
            <span class="dot" style="background:#4a7aff; box-shadow:0 0 6px #4a7aff;"></span>
            Quest Log
          </div>
          <div class="sgu-panel-body">
            <div
              v-for="(q, i) in data.quests" :key="i"
              style="display:flex; align-items:flex-start; gap:8px; margin-bottom:5px;"
              :style="i === 0 ? 'font-weight:bold;' : 'opacity:0.65;'"
            >
              <span :style="i===0 ? 'color:#4a7aff;' : 'color:rgba(255,255,255,0.3);'">{{ i===0 ? '►' : '·' }}</span>
              <span style="font-size:12px;">{{ q }}</span>
            </div>
          </div>
        </section>

        <!-- ── DENNÉ REPORTY / INFO BOXY ── -->
        <section v-if="data.infoboxes?.length" class="sg-fade-up" style="animation-delay:0.2s;">
          <div class="sgu-section-label">▸ Denné reporty</div>
          <div style="display:flex; flex-direction:column; gap:8px;">
            <div v-for="box in data.infoboxes" :key="box.title" class="sgu-panel">
              <div class="sgu-panel-title">
                <span class="dot"></span>
                {{ box.title.replace(/\[\?\]|\[x\]/g,'').trim() }}
              </div>
              <div class="sgu-panel-body" style="font-size:12px; line-height:1.5; color:rgba(255,255,255,0.85);">
                {{ box.content }}{{ box.content?.length === 300 ? '…' : '' }}
              </div>
            </div>
          </div>
        </section>

        <!-- ── CHAT ── -->
        <section v-if="data.chat?.length" class="sgu-panel sg-fade-up" style="animation-delay:0.25s; border-color:rgba(4,190,254,0.15);">
          <div class="sgu-panel-title" style="color:rgba(255,255,255,0.5); background:none;">
            <span class="dot" style="background:rgba(255,255,255,0.3); box-shadow:none;"></span>
            Herný chat
          </div>
          <div style="max-height:150px; overflow-y:auto; padding:8px 10px; display:flex; flex-direction:column; gap:4px;">
            <div
              v-for="(msg, i) in data.chat" :key="i"
              style="font-size:12px; color:rgba(255,255,255,0.55); line-height:1.35;"
            >
              <span style="color:rgba(4,190,254,0.4);">&gt;</span> {{ msg }}
            </div>
          </div>
        </section>

        <!-- Ak nie sú žiadne dáta -->
        <section v-if="!data.alerts?.length && !data.quests?.length" class="sgu-panel sg-fade-up">
          <div class="sgu-panel-title">
            <span class="dot sg-glow"></span>
            Systém aktívny
          </div>
          <div class="sgu-panel-body" style="text-align:center; padding:20px 10px;">
            <div style="font-size:24px; color:#04befe; margin-bottom:8px;">◈</div>
            <div style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:rgba(4,190,254,0.6);">
              Všetky systémy v poriadku
            </div>
            <div style="font-size:12px; color:rgba(255,255,255,0.3); margin-top:6px;">Žiadne aktívne hlásenia</div>
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
const showAllAlerts = ref(false)

const router = useRouter()
const auth   = useAuthStore()

// ── Resource helpers (pôvodné farby z CSS) ──
const RESOURCE_ICONS = {
  energia: '⚡', energy: '⚡',
  jedlo: '🍖', food: '🍖',
  voda: '💧', water: '💧',
  vapno: '🪨', lime: '🪨', vápno: '🪨', vapenc: '🪨',
  kredity: '💳', credits: '💳',
  vyskum: '🔬', research: '🔬', výskum: '🔬',
  slava: '⭐', renown: '⭐', sláva: '⭐',
  fragmenty: '🔷', fragments: '🔷',
  posadka: '👥',
}
const RESOURCE_COLORS = {
  energia: '#59d34c', energy: '#59d34c',
  jedlo: '#e284ff', food: '#e284ff',
  voda: '#56fff3', water: '#56fff3',
  vapno: '#ffd760', lime: '#ffd760', vápno: '#ffd760', vapenc: '#ffd760',
  kredity: 'whitesmoke', credits: 'whitesmoke',
  vyskum: 'whitesmoke', research: 'whitesmoke', výskum: 'whitesmoke',
  slava: 'gold', renown: 'gold', sláva: 'gold',
}

function resourceIcon(key) {
  return RESOURCE_ICONS[key.toLowerCase()] || '◆'
}
function resourceColor(key) {
  return RESOURCE_COLORS[key.toLowerCase()] || '#04befe'
}
function formatResourceVal(val) {
  if (!val) return '—'
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
/* Scoped: page wrapper bez top paddingu – topbar je sticky */
</style>
