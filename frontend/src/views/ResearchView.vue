<template>
  <StarField />
  <div class="sgu-scanlines" />

  <div class="dash-page">
    <div class="dash-content">
      
<!-- VUE TEMPLATE -->
      <!-- ── HLAVNÁ SEKCIÁ: STROM VÝSKUMU ── -->
      <section class="dash-section">
        <div class="dash-panel">
          <div class="dash-panel-head">
            <span class="dash-panel-dot"></span> Strom výzkumu
          </div>
          <div class="dash-panel-body" style="padding: 0;">
            <div v-if="loading && !data" class="loading-box">Načítám výzkumy...</div>
            <div v-else class="res-tree-container">
              <div class="res-tree-inner">
                <svg class="res-lines">
                  <line v-for="l in lines" :key="l.key"
                        :x1="l.x1" :y1="l.y1" :x2="l.x2" :y2="l.y2"
                        class="res-line" />
                </svg>

                <div v-for="(n, key) in nodesMap" :key="key"
                     class="res-node"
                     :class="nodeStatusClass(key)"
                     :style="{ left: getNodeX(key) + 'px', top: getNodeY(key) + 'px' }"
                     @click="selectNode(key)">
                  <!-- Zobrazi ikonu podla statusu alebo pismeno -->
                  <span class="res-icon" v-if="nodeStatusClass(key) === 'status-researched'">✓</span>
                  <span class="res-icon" v-else-if="nodeStatusClass(key) === 'status-researching'">⏳</span>
                  <span class="res-icon" v-else-if="nodeStatusClass(key) === 'status-locked'">🔒</span>
                  <span class="res-icon" v-else>💡</span>
                  
                  <div class="res-node-label">{{ n.name }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── DETAIL VÝSKUMU (MODAL / SPODNÝ PANEL) ── -->
      <transition name="slide-up">
        <div v-if="selectedNodeKey" class="res-detail-panel">
          <div class="res-detail-header">
            <span class="res-detail-title">{{ nodesMap[selectedNodeKey].name }}</span>
            <button class="res-detail-close" @click="selectedNodeKey = null">✕</button>
          </div>
          
          <div class="res-detail-body">
            <div v-if="!selectedNodeDetails" class="loading-box" style="min-height:100px;">Načítám detaily...</div>
            
            <template v-else>
              <div class="res-desc">{{ selectedNodeDetails.description }}</div>
              
              <!-- Cena výskumu -->
              <div v-if="selectedNodeDetails.price" class="res-price">
                <span class="res-price-label">Cena:</span>
                <span class="res-price-value">{{ selectedNodeDetails.price }}</span>
              </div>
              
              <div class="res-req-section">
                <div class="res-req-title">Požadavky:</div>
                <div v-for="req in selectedNodeDetails.dependsOn" :key="req.name" 
                     class="res-req-item" :class="req.met ? 'req-met' : 'req-fail'">
                  <span class="req-icon">{{ req.met ? '✓' : '✕' }}</span>
                  {{ req.name }}
                </div>
                <div v-if="!selectedNodeDetails.dependsOn?.length" class="req-met">Žádné (nebo nenačteno)</div>
              </div>

              <!-- Tlačidlá akcií -->
              <div class="res-actions">
                <button v-if="selectedNodeDetails.status === 'researched' || isResearched(selectedNodeKey)" 
                        class="res-btn btn-done" disabled>
                  Vyzkoumáno
                </button>
                <button v-else-if="selectedNodeDetails.status === 'researching' || isResearching(selectedNodeKey)" 
                        class="res-btn btn-progress" disabled>
                  Probíhá výzkum
                </button>
                <button v-else 
                        @click="doResearch" 
                        class="res-btn btn-primary" 
                        :disabled="selectedNodeDetails.status === 'locked'"
                        :class="{'btn-locked': selectedNodeDetails.status === 'locked'}">
                  Vyzkoumat
                </button>
              </div>
            </template>
          </div>
        </div>
      </transition>
      
      <!-- ── CUSTOM TOAST NOTIFICATION ── -->
      <transition name="toast-slide">
        <div v-if="toast.show" class="sgu-toast" :class="'toast-' + toast.type">
          <span class="toast-icon">{{ toast.type === 'success' ? '✅' : '⚠️' }}</span>
          <div class="toast-msg">{{ toast.message }}</div>
        </div>
      </transition>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import StarField from '../components/StarField.vue'

const data = ref(null)
const loading = ref(false)
const error = ref(null)

const selectedNodeKey = ref(null)
const selectedNodeDetails = ref(null)

const toast = ref({ show: false, message: '', type: 'error' })

function showToast(message, type = 'success') {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 4000)
}

// Rozloženie mriežky pre mobilný pohľad (trochu posunuté, aby sa to zmestilo)
const GRID_SIZE_X = 65;
const GRID_SIZE_Y = 80;
const OFFSET_X = 35; // prázdny okraj zľava
const OFFSET_Y = 40;

const nodesMap = {
  'dhd': { name: 'DHD', x: 3, y: 1, dependsOn: [] },
  'rizeni_lodi': { name: 'Řízení lodi', x: 2, y: 2, dependsOn: ['dhd'] },
  'kino': { name: 'Kino', x: 4, y: 2, dependsOn: ['dhd'] },
  
  'brzdici_trysky': { name: 'Brzdící trysky', x: 1, y: 3, dependsOn: ['rizeni_lodi'] },
  'osetrovna': { name: 'Ošetřovna', x: 2, y: 3, dependsOn: ['rizeni_lodi'] },
  
  'neuralni_rozhrani': { name: 'Neurální rozhraní', x: 4, y: 3, dependsOn: ['kino'] },
  'bar': { name: 'Bar', x: 5, y: 3, dependsOn: ['kino'] },
  
  'vyzkumna_laborator': { name: 'Výzkumná laboratoř', x: 3, y: 4, dependsOn: ['osetrovna', 'neuralni_rozhrani'] },
  'sprchy': { name: 'Sprchy', x: 5, y: 4, dependsOn: ['bar'] },
  
  'prechodova_komora': { name: 'Přechodová komora', x: 1, y: 5, dependsOn: ['brzdici_trysky', 'vyzkumna_laborator'] },
  'ochranne_obleky': { name: 'Ochranné obleky', x: 2, y: 5, dependsOn: ['vyzkumna_laborator'] },
  'stazove_komory_1': { name: 'Stázové komory I', x: 4, y: 5, dependsOn: ['vyzkumna_laborator'] },
  'hydro_1': { name: 'Hydroponika I', x: 5, y: 5, dependsOn: ['sprchy'] },
  
  'rizeni_clunu': { name: 'Řízení člunu', x: 1, y: 6, dependsOn: ['prechodova_komora'] },
  'udrzbarsky_robot': { name: 'Údržbářský robot', x: 2, y: 6, dependsOn: ['vyzkumna_laborator'] },
  'stazove_komory_2': { name: 'Stázové komory II', x: 4, y: 6, dependsOn: ['stazove_komory_1'] },
  'hydro_2': { name: 'Hydroponika II', x: 5, y: 6, dependsOn: ['hydro_1'] },
  
  'podsvetelne_motory': { name: 'Podsvětelné motory', x: 3, y: 7, dependsOn: ['vyzkumna_laborator'] },
  'solarni_kolektory': { name: 'Solární kolektory', x: 4, y: 7, dependsOn: ['vyzkumna_laborator'] },
  'jidelna': { name: 'Jídelna', x: 5, y: 7, dependsOn: ['hydro_2'] },
  
  'zbranove_systemy': { name: 'Zbraňové systémy', x: 1, y: 8, dependsOn: ['vyzkumna_laborator'] },
  'emitory_stitu': { name: 'Emitory štítů', x: 2, y: 8, dependsOn: ['vyzkumna_laborator'] },
  'ftl_1': { name: 'FTL pohon I', x: 3, y: 8, dependsOn: ['podsvetelne_motory'] },
  
  'hlavni_delo': { name: 'Hlavní dělo Destiny', x: 1, y: 9, dependsOn: ['zbranove_systemy'] },
  'stity_2': { name: 'Štíty druhé generace', x: 2, y: 9, dependsOn: ['emitory_stitu'] },
  'ftl_2': { name: 'FTL pohon II', x: 3, y: 9, dependsOn: ['ftl_1'] },
}

function getNodeX(key) { return (nodesMap[key].x - 1) * GRID_SIZE_X + OFFSET_X; }
function getNodeY(key) { return (nodesMap[key].y - 1) * GRID_SIZE_Y + OFFSET_Y; }

const lines = computed(() => {
  const arr = []
  for (const [key, node] of Object.entries(nodesMap)) {
    for (const dep of node.dependsOn) {
      if (nodesMap[dep]) {
        arr.push({
          x1: getNodeX(dep),
          y1: getNodeY(dep),
          x2: getNodeX(key),
          y2: getNodeY(key),
          key: dep + '-' + key
        })
      }
    }
  }
  return arr
})

const serverResearches = computed(() => data.value?.researches || [])

function serverDataForNode(key) {
  const node = nodesMap[key]
  if (!node) return null
  return serverResearches.value.find(r => r.name.toLowerCase() === node.name.toLowerCase())
}

function nodeStatusClass(key) {
  const sData = serverDataForNode(key)
  if (!sData) return 'status-locked'
  return `status-${sData.status}` // available, researching, researched, locked
}

function isResearched(key) {
  return serverDataForNode(key)?.status === 'researched'
}

function isResearching(key) {
  return serverDataForNode(key)?.status === 'researching'
}

async function selectNode(key) {
  selectedNodeKey.value = key
  selectedNodeDetails.value = null 
  const sData = serverDataForNode(key)
  if (sData && sData.id) {
    try {
      const res = await axios.get(`/api/research/${sData.id}`)
      selectedNodeDetails.value = res.data.data
    } catch (e) {
      showToast('Nepodařilo se načíst detaily výzkumu.', 'error')
    }
  }
}

async function doResearch() {
  const sData = serverDataForNode(selectedNodeKey.value)
  if (sData && sData.id) {
    try {
      loading.value = true
      const res = await axios.post('/api/research', { technology_id: sData.id })
      showToast(res.data.message || 'Výzkum odeslán!', res.data.type || 'success')
      if (res.data.type !== 'error') {
        selectedNodeKey.value = null
      }
      await refresh()
    } catch (e) {
      showToast('Chyba: ' + (e.response?.data?.error || e.message), 'error')
      loading.value = false
    }
  }
}

async function refresh() {
  loading.value = true
  error.value = null
  try {
    const res = await axios.get('/api/research')
    data.value = res.data.data
  } catch (e) {
    error.value = e.response?.data?.error || 'Nepodařilo se načíst data.'
    if (!data.value) data.value = { researches: [] }
  } finally {
    loading.value = false
  }
}

onMounted(refresh)
</script>

<style scoped>
.dash-page {
  min-height: 100vh;
  padding-bottom: 72px;
  position: relative;
  z-index: 1;
}
.dash-content { padding: 10px; }
.dash-section { margin-bottom: 10px; }

/* ── Panel ── */
.dash-panel {
  background: rgba(4,190,254,0.09);
  border: 1px solid rgba(4,190,254,0.4);
  border-radius: 2px;
  position: relative;
  overflow: hidden;
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
.dash-panel-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #04befe;
  box-shadow: 0 0 6px #04befe;
  animation: dotPulse 2s ease-in-out infinite;
}
@keyframes dotPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

/* ── Strom ── */
.res-tree-container {
  position: relative;
  width: 100%;
  height: calc(100vh - 150px); /* Fit to screen instead of fixed 750px */
  overflow-x: auto;
  overflow-y: auto;
  background: rgba(0,0,0,0.4);
}

.res-tree-inner {
  position: relative;
  width: 340px; /* Base width from (5-1)*65 + 35 + 38 = 333 */
  height: 720px; /* Base height from (9-1)*80 + 35 + 38 = 713 */
  margin: 0 auto;
}

.res-lines {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
}
.res-line {
  stroke: rgba(4,190,254,0.3);
  stroke-width: 2;
}

.res-node {
  position: absolute;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2px solid #04befe;
  background: #0a1e3a;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transform: translate(-50%, -50%);
  transition: all 0.2s ease-out;
  z-index: 10;
  box-shadow: 0 0 10px rgba(0,0,0,0.8);
}
.res-node:active { transform: translate(-50%, -50%) scale(0.9); }

.res-node-label {
  position: absolute;
  top: 115%;
  left: 50%;
  transform: translateX(-50%);
  font-family: Verdana, sans-serif;
  font-size: 9px;
  color: #fff;
  white-space: nowrap;
  background: rgba(0,0,0,0.7);
  padding: 2px 4px;
  border-radius: 2px;
  border: 1px solid rgba(4,190,254,0.3);
  pointer-events: none;
}

.res-icon { font-size: 14px; }

/* Statuses */
.status-researched { border-color: #59d34c; background: rgba(89,211,76,0.25); color: #59d34c; }
.status-researching { border-color: #ffd760; background: rgba(255,215,96,0.25); color: #ffd760; }
.status-available { border-color: #04befe; background: rgba(4,190,254,0.25); color: #04befe; }
.status-locked { border-color: #555; background: #222; color: #555; opacity: 0.7; }

/* ── Loading ── */
.loading-box {
  padding: 30px; text-align: center; color: #04befe; font-size: 12px;
}

/* ── Detail Panel (Modal) ── */
.res-detail-panel {
  position: fixed;
  bottom: 60px; /* nad bottom-nav */
  left: 10px; right: 10px;
  background: rgba(10,20,35,0.95);
  border: 1px solid #04befe;
  border-radius: 4px;
  z-index: 50;
  box-shadow: 0 -5px 25px rgba(0,0,0,0.9);
  backdrop-filter: blur(5px);
}
.res-detail-header {
  display: flex; justify-content: space-between; align-items: center;
  background: rgba(4,190,254,0.2);
  padding: 8px 12px;
  border-bottom: 1px solid rgba(4,190,254,0.4);
}
.res-detail-title {
  font-family: Orbitron, sans-serif;
  font-size: 14px; color: #fff; font-weight: bold;
}
.res-detail-close {
  background: none; border: none; color: rgba(255,255,255,0.6);
  font-size: 16px; cursor: pointer;
}
.res-detail-body { padding: 12px; }

.res-desc {
  font-size: 12px; color: rgba(255,255,255,0.85); line-height: 1.4;
  margin-bottom: 8px;
}

.res-price {
  font-size: 11px; margin-bottom: 12px;
  background: rgba(4,190,254,0.1); padding: 4px 8px;
  border-left: 2px solid #04befe;
  display: inline-block; border-radius: 0 2px 2px 0;
}
.res-price-label { color: rgba(4,190,254,0.8); font-weight: bold; margin-right: 6px; }
.res-price-value { color: #fff; font-weight: bold; }

.res-req-section {
  background: rgba(0,0,0,0.5);
  border: 1px dashed rgba(4,190,254,0.3);
  padding: 8px; border-radius: 2px; margin-bottom: 12px;
}
.res-req-title { font-size: 10px; color: rgba(4,190,254,0.8); text-transform: uppercase; margin-bottom: 4px; }
.res-req-item { font-size: 11px; display: flex; align-items: center; gap: 6px; margin-bottom: 2px; }
.req-met { color: #59d34c; }
.req-fail { color: #ff3c3c; }

.res-actions { display: flex; gap: 8px; }
.res-btn {
  flex: 1; padding: 10px; font-family: Orbitron, sans-serif;
  font-weight: bold; font-size: 13px; text-transform: uppercase;
  border-radius: 2px; cursor: pointer; text-align: center;
}
.btn-primary { background: rgba(4,190,254,0.2); border: 1px solid #04befe; color: #fff; }
.btn-primary:active { background: rgba(4,190,254,0.4); }
.btn-done { background: rgba(89,211,76,0.1); border: 1px solid rgba(89,211,76,0.4); color: #59d34c; }
.btn-progress { background: rgba(255,215,96,0.1); border: 1px solid rgba(255,215,96,0.4); color: #ffd760; }
.btn-locked { opacity: 0.5; cursor: not-allowed; }

/* Transitions */
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); opacity: 0; }

/* Toast */
.sgu-toast {
  position: fixed;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(10,20,35,0.95);
  border: 1px solid #04befe;
  padding: 12px 20px;
  border-radius: 4px;
  z-index: 100;
  display: flex; align-items: center; gap: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.8);
  font-family: Orbitron, sans-serif;
  font-size: 13px;
  backdrop-filter: blur(4px);
  min-width: 250px;
}
.toast-success { border-color: #59d34c; }
.toast-success .toast-icon { color: #59d34c; }
.toast-error { border-color: #ff3c3c; }
.toast-error .toast-icon { color: #ff3c3c; }
.toast-msg { color: #fff; font-weight: bold; }

.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.3s ease; }
.toast-slide-enter-from { transform: translate(-50%, -20px); opacity: 0; }
.toast-slide-leave-to { transform: translate(-50%, -20px); opacity: 0; }
</style>
