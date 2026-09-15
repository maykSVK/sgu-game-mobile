<template>
  <StarField />
  <div class="sgu-scanlines" />

  <div class="dash-page">
    <UniverseNav />

    <div class="dash-content">
      <div v-if="loading" style="text-align:center; padding: 30px; color: #04befe;">
        Připojuji se do Arény...
      </div>

      <template v-else-if="arenaData">
        
        <!-- Status Panel -->
        <section class="dash-section" style="margin-bottom: 20px;">
          <div class="dash-panel">
            <div class="dash-panel-head">
              <span class="dash-panel-dot"></span> STATUS ARÉNY
            </div>
            <div class="dash-panel-body" style="padding: 15px;">
              <div class="status-row">
                <div class="status-label">Stav:</div>
                <div class="status-val" v-html="fixHtml(arenaData.stateHtml)"></div>
              </div>
              <div class="status-row">
                <div class="status-label">Můj status:</div>
                <div class="status-val" v-html="fixHtml(arenaData.statusHtml)"></div>
              </div>
              <div class="status-row" v-if="arenaData.onlineWarriors">
                <div class="status-label">Bojovníci online:</div>
                <div class="status-val">{{ arenaData.onlineWarriors }}</div>
              </div>
              
              <div v-if="arenaData.canApply" style="margin-top: 15px; text-align: center;">
                <button class="sgu-btn-action" @click="applyForArena">
                  PŘIHLÁSIT DO ARÉNY
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Odmeny -->
        <section class="dash-section" style="margin-bottom: 20px;">
          <div class="dash-panel">
            <div class="dash-panel-head">
              <span class="dash-panel-dot"></span> ODMĚNY
            </div>
            <div class="dash-panel-body" style="padding: 10px;">
              <div class="rewards-grid">
                <div class="reward-card">
                  <div class="reward-pos">1. MÍSTO</div>
                  <div class="reward-items">
                    <span class="res"><i class="fas fa-money-bill-wave" style="color:#f0f0f0"></i> 100</span>
                    <span class="res"><i class="fas fa-flask" style="color:#04befe"></i> 2</span>
                    <span class="res"><i class="fas fa-bolt" style="color:#59d34c"></i> 10</span>
                    <span class="res"><i class="fas fa-drumstick-bite" style="color:#e284ff"></i> 20</span>
                    <span class="res"><i class="fas fa-tint" style="color:#56fff3"></i> 20</span>
                    <span class="res"><i class="fas fa-cookie" style="color:#ffd760"></i> 20</span>
                  </div>
                </div>
                <div class="reward-card">
                  <div class="reward-pos">2. MÍSTO</div>
                  <div class="reward-items">
                    <span class="res"><i class="fas fa-money-bill-wave" style="color:#f0f0f0"></i> 75</span>
                    <span class="res"><i class="fas fa-flask" style="color:#04befe"></i> 1</span>
                    <span class="res"><i class="fas fa-drumstick-bite" style="color:#e284ff"></i> 10</span>
                    <span class="res"><i class="fas fa-tint" style="color:#56fff3"></i> 10</span>
                    <span class="res"><i class="fas fa-cookie" style="color:#ffd760"></i> 10</span>
                  </div>
                </div>
                <div class="reward-card">
                  <div class="reward-pos">3. MÍSTO</div>
                  <div class="reward-items">
                    <span class="res"><i class="fas fa-money-bill-wave" style="color:#f0f0f0"></i> 50</span>
                    <span class="res"><i class="fas fa-flask" style="color:#04befe"></i> 1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Zoznam hráčov (Bojisko) -->
        <section class="dash-section">
          <div class="dash-panel">
            <div class="dash-panel-head">
              <span class="dash-panel-dot"></span> BOJIŠTĚ
            </div>
            <div class="dash-panel-body" style="padding: 0;">
              
              <div v-if="!arenaData.players || arenaData.players.length === 0" style="padding: 20px; text-align:center; color:#aaa;">
                Aréna je momentálně prázdná.
              </div>
              
              <div v-else class="players-list">
                <div v-for="player in arenaData.players" :key="player.username" class="player-card" :class="{ 'is-me': player.username === auth.playerName }">
                  <div class="player-header">
                    <div class="player-pos" :class="{'pos-first': player.isWinner || player.position.includes('1.')}">{{ player.position }}</div>
                    <div class="player-name">
                      <span v-if="player.isVip" class="vip-badge">VIP</span>
                      {{ player.username }}
                    </div>
                  </div>
                  
                  <div class="player-stats">
                    <div class="stat-box">
                      <div class="stat-lbl">BODY</div>
                      <div class="stat-val text-white">{{ player.points }}</div>
                    </div>
                    <div class="stat-box">
                      <div class="stat-lbl">BITVY</div>
                      <div class="stat-val">{{ player.battles }}</div>
                    </div>
                    <div class="stat-box">
                      <div class="stat-lbl">SKÓRE (W-D-L)</div>
                      <div class="stat-val">{{ player.statsRow }}</div>
                    </div>
                    <div class="stat-box">
                      <div class="stat-lbl">PÁDY</div>
                      <div class="stat-val" :class="{'text-red': player.fallenLimit}">{{ player.fallen }}</div>
                    </div>
                    <div class="stat-box">
                      <div class="stat-lbl">REMÍZY</div>
                      <div class="stat-val" :class="{'text-red': player.drawnLimit}">{{ player.drawn }}</div>
                    </div>
                  </div>

                  <div class="player-action">
                    <button v-if="player.canAttack" class="sgu-btn-attack" @click="attackPlayer(player.attackUserId)">
                      <i class="fas fa-crosshairs"></i> ZAÚTOČIT
                    </button>
                    <div v-else-if="player.username === auth.playerName" class="me-label">
                      TO JSI TY
                    </div>
                  </div>
                </div>
              </div>

              <!-- Stránkovanie -->
              <div v-if="arenaData.pagination" class="pagination-bar">
                <button :disabled="!arenaData.pagination.prevAvailable" class="sgu-btn-nav" @click="changePage(arenaData.pagination.prevParams)">
                  « PŘEDCHOZÍ
                </button>
                <button :disabled="!arenaData.pagination.nextAvailable" class="sgu-btn-nav" @click="changePage(arenaData.pagination.nextParams)">
                  DALŠÍ »
                </button>
              </div>

            </div>
          </div>
        </section>

      </template>

      <!-- TOAST -->
      <div v-if="toast.show" class="sgu-toast" :class="toast.type">
        <i class="fas" :class="toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'"></i>
        {{ toast.message }}
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import StarField from '../components/StarField.vue'
import UniverseNav from '../components/UniverseNav.vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const loading = ref(true)
const arenaData = ref(null)
const toast = ref({ show: false, message: "", type: "success" })

let countdownInterval = null
const now = ref(Date.now())

function showToast(msg, type = "success") {
  toast.value = { show: true, message: msg, type }
  setTimeout(() => toast.value.show = false, 3500)
}

function startCountdown() {
  if (countdownInterval) clearInterval(countdownInterval)
  countdownInterval = setInterval(() => {
    now.value = Date.now()
    updateCountdowns()
  }, 1000)
}

function updateCountdowns() {
  if (!arenaData.value) return
  // Nahradíme statické <span data-countdown="..."> za živé časy
  // Keďže sa spoliehame na v-html("fixHtml(...)"), musíme to robiť dynamicky.
  // Lepšie je urobiť to priamo v komponente, takže modifikujeme fixHtml.
}

function formatCountdown(targetDateStr) {
  if (!targetDateStr) return ''
  const t = new Date(targetDateStr.replace(' ', 'T')).getTime()
  let diff = Math.floor((t - now.value) / 1000)
  if (diff <= 0) return '00:00:00'
  
  const h = Math.floor(diff / 3600).toString().padStart(2, '0')
  const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0')
  const s = (diff % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

function fixHtml(html) {
  if (!html) return ''
  // Prepíšeme data-countdown elementy za textový obsah
  let res = html.replace(/<span\s+[^>]*data-countdown="([^"]+)"[^>]*><\/span>/g, (match, dateStr) => {
    return `<span class="live-countdown">${formatCountdown(dateStr)}</span>`
  })
  
  // Nahradi class success/failed atď
  res = res.replace(/class="success"/g, 'class="text-green"')
  res = res.replace(/class="failed"/g, 'class="text-red"')
  
  return res
}

async function loadData(params = {}) {
  loading.value = true
  try {
    let url = "/api/arena"
    if (params.from && params.to) {
      url += `?from=${params.from}&to=${params.to}`
    }
    const res = await axios.get(url)
    if (res.data.ok) {
      arenaData.value = res.data.data
      handleMessages(res.data.data.messages)
    }
  } catch (e) {
    console.error(e)
    showToast("Nepodařilo se načíst Arénu", "error")
  } finally {
    loading.value = false
  }
}

async function applyForArena() {
  loading.value = true
  try {
    const res = await axios.post("/api/arena/action", { get_into_arena: 'get_into_arena' })
    if (res.data.ok) {
      arenaData.value = res.data.data
      handleMessages(res.data.data.messages)
      }
  } catch (e) {
    showToast("Chyba při přihlašování", "error")
  } finally {
    loading.value = false
  }
}

async function attackPlayer(userId) {
  if (!userId) return
  loading.value = true
  try {
    const res = await axios.post("/api/arena/action", { 
      user_id: userId, 
      set_arena_battle: 'set_arena_battle' 
    })
    if (res.data.ok) {
      arenaData.value = res.data.data
      handleMessages(res.data.data.messages)
      }
  } catch (e) {
    showToast("Chyba při útoku", "error")
  } finally {
    loading.value = false
  }
}

function changePage(params) {
  if (params) {
    loadData(params)
  }
}

function handleMessages(msgs) {
  if (msgs && msgs.length > 0) {
    showToast(msgs[0].text, msgs[0].type)
  }
}

onMounted(() => {
  loadData()
  startCountdown()
})

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval)
})
</script>

<style scoped>
.dash-page {
  min-height: calc(100vh - 44px);
  padding-bottom: 72px;
  position: relative;
  z-index: 1;
}
.dash-content { padding: 15px; }

.dash-section {
  display: flex;
}
.dash-panel {
  background: rgba(4,190,254,0.05);
  border: 1px solid rgba(4,190,254,0.3);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  width: 100%;
  display: flex;
  flex-direction: column;
}
.dash-panel::before {
  content: ""; position: absolute; top: 0; left: 0;
  width: 15px; height: 15px; border-top: 2px solid #04befe; border-left: 2px solid #04befe; z-index: 1;
}
.dash-panel::after {
  content: ""; position: absolute; bottom: 0; right: 0;
  width: 15px; height: 15px; border-bottom: 2px solid #04befe; border-right: 2px solid #04befe; z-index: 1;
}

.dash-panel-head {
  background: rgba(4,190,254,0.15);
  border-bottom: 1px solid rgba(4,190,254,0.3);
  padding: 8px 12px; font-family: Orbitron, sans-serif;
  font-size: 13px; color: #fff; display: flex; align-items: center; gap: 8px; justify-content: center;
}
.dash-panel-dot {
  width: 6px; height: 6px; background: #04befe; box-shadow: 0 0 5px #04befe; transform: rotate(45deg);
}

.dash-panel-body {
  background: rgba(0,0,0,0.4); font-size: 13px; color: #ddd; flex: 1;
}

/* Status */
.status-row {
  display: flex; gap: 10px; padding: 6px 0; border-bottom: 1px dashed rgba(255,255,255,0.1);
}
.status-label {
  color: #04befe; font-weight: bold; width: 130px; flex-shrink: 0;
}
.status-val {
  color: #fff;
}

.sgu-btn-action {
  background: rgba(4,190,254,0.2); border: 1px solid #04befe; color: #fff;
  padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer;
}
.sgu-btn-action:hover { background: rgba(4,190,254,0.4); }

/* Rewards */
.rewards-grid {
  display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}
.reward-card {
  background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px;
  padding: 10px; display: flex; flex-direction: column; gap: 5px; align-items: center; text-align: center;
}
.reward-pos {
  font-family: Orbitron, sans-serif; color: gold; font-weight: bold; font-size: 14px;
}
.reward-items {
  display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; font-size: 12px;
}
.res {
  background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 3px; display: flex; gap: 4px; align-items: center;
}

/* Players */
.players-list {
  display: flex; flex-direction: column; gap: 1px; background: rgba(255,255,255,0.05);
}
.player-card {
  background: rgba(0,0,0,0.6); padding: 12px; display: flex; flex-direction: column; gap: 10px;
}
.player-card.is-me {
  background: rgba(4,190,254,0.15); border-left: 3px solid #04befe;
}
.player-header {
  display: flex; gap: 10px; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;
}
.player-pos {
  background: rgba(255,255,255,0.1); width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
  border-radius: 4px; font-weight: bold; font-size: 12px;
}
.pos-first {
  background: rgba(255,215,0,0.2); color: gold; border: 1px solid gold;
}
.player-name {
  font-weight: bold; font-size: 16px; color: #04befe; display: flex; align-items: center; gap: 8px;
}
.vip-badge {
  background: gold; color: #000; font-size: 9px; padding: 1px 4px; border-radius: 2px; font-weight: bold;
}

.player-stats {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px; text-align: center;
}
.stat-box {
  background: rgba(255,255,255,0.05); border-radius: 3px; padding: 4px;
}
.stat-lbl {
  font-size: 9px; color: #888;
}
.stat-val {
  font-size: 13px; font-weight: bold; color: #ddd; margin-top: 2px;
}

.player-action {
  display: flex; justify-content: flex-end;
}
.sgu-btn-attack {
  background: rgba(255,60,60,0.2); border: 1px solid #ff3c3c; color: #fff;
  padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold;
}
.sgu-btn-attack:hover {
  background: rgba(255,60,60,0.4); box-shadow: 0 0 10px rgba(255,60,60,0.5);
}
.me-label {
  font-size: 11px; color: rgba(255,255,255,0.4); font-style: italic;
}

/* Pagination */
.pagination-bar {
  display: flex; justify-content: space-between; padding: 12px; background: rgba(0,0,0,0.4);
}
.sgu-btn-nav {
  background: rgba(4,190,254,0.1); border: 1px solid rgba(4,190,254,0.3); color: #04befe;
  padding: 6px 12px; border-radius: 3px; cursor: pointer;
}
.sgu-btn-nav:disabled {
  opacity: 0.3; cursor: not-allowed;
}

/* Utils */
.text-green { color: #59d34c; }
.text-red { color: #ff3c3c; font-weight: bold; }
.text-white { color: #fff !important; }
.live-countdown { color: #ff3c3c; font-family: monospace; font-weight: bold; font-size: 14px; }
</style>
