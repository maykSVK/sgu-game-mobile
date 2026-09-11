<template>
  <div class="page-content pb-24 h-screen flex flex-col">
    <div class="flex items-center justify-between mb-4 shrink-0">
      <h1 class="text-xl font-bold text-sgu-accent">Výzkumný strom</h1>
      <button @click="refresh" :class="loading ? 'animate-spin' : ''" class="text-xl p-2 bg-sgu-navy rounded-full border border-white/10 active:scale-95">🔄</button>
    </div>

    <!-- Loading -->
    <div v-if="loading && !data" class="flex justify-center py-12 shrink-0">
      <div class="animate-spin text-4xl text-sgu-accent">⟳</div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="card bg-red-900/30 border-red-500/30 text-red-300 shrink-0">
      <p class="font-bold mb-1">Chyba načítania</p>
      <p class="text-sm">{{ error }}</p>
    </div>

    <!-- Tree View -->
    <div v-else class="flex-1 overflow-auto bg-sgu-navy/50 rounded-lg border border-white/10 relative" id="tree-container">
      <div class="relative w-[360px] h-[900px] mx-auto p-2">
        
        <!-- SVG lines -->
        <svg class="absolute inset-0 w-full h-full pointer-events-none" style="z-index: 1;">
          <template v-for="(node, key) in nodesMap" :key="'lines-'+key">
            <line v-for="depKey in node.dependsOn" :key="key+'-'+depKey"
                  :x1="getNodeX(depKey)" :y1="getNodeY(depKey)"
                  :x2="getNodeX(key)" :y2="getNodeY(key)"
                  stroke="#4a6a8c" stroke-width="2" />
          </template>
        </svg>

        <!-- Nodes -->
        <div v-for="(node, key) in nodesMap" :key="key"
             class="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110"
             :style="{ left: getNodeX(key) + 'px', top: getNodeY(key) + 'px', zIndex: 2 }"
             @click="selectNode(key)">
          
          <div :class="[
            'w-12 h-12 rounded-full border-[3px] flex items-center justify-center shadow-lg transition-colors',
            isResearched(key) ? 'bg-white border-white text-black' : 
            canResearch(key) ? 'bg-sgu-navy border-sgu-accent text-sgu-accent' : 
            'bg-sgu-dark border-gray-600 text-gray-500'
          ]">
             <div v-if="isResearched(key)" class="text-xl font-bold">✓</div>
             <div v-else-if="isResearching(key)" class="text-lg animate-pulse">⏳</div>
             <div v-else-if="canResearch(key)" class="text-xl">!</div>
             <div v-else class="text-lg opacity-30">!</div>
          </div>
          <div class="mt-1 text-[10px] text-center w-20 -ml-4 leading-tight font-bold text-shadow"
               :class="isResearched(key) ? 'text-white' : 'text-gray-400'">
            {{ node.name }}
          </div>
        </div>

      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="selectedNodeKey" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" @click.self="selectedNodeKey = null">
      <div class="bg-sgu-dark border border-sgu-accent/50 rounded-lg max-w-sm w-full overflow-hidden shadow-2xl relative">
        <button @click="selectedNodeKey = null" class="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-black/50 text-white rounded-full">×</button>
        
        <div class="p-4 border-b border-white/10">
          <h2 class="font-bold text-xl text-white">{{ selectedNodeDetails?.name || nodesMap[selectedNodeKey]?.name }}</h2>
        </div>
        
        <!-- Placeholder pre obrázok -->
        <div class="h-40 bg-sgu-navy w-full flex items-center justify-center text-sgu-text/30 text-5xl">
          <span v-if="!selectedNodeDetails" class="animate-spin text-4xl">⟳</span>
          <span v-else>🔭</span>
        </div>

        <div class="p-4 space-y-4" v-if="selectedNodeDetails">
          <div class="flex items-center gap-2 text-sgu-accent font-bold">
            <span>🧪</span> {{ selectedNodeDetails.price }}
          </div>
          
          <p class="text-sm text-sgu-text">
            {{ selectedNodeDetails.description }}
          </p>
          
          <div class="text-sm">
            <span class="font-bold text-white">Požadované výzkumy:</span>
            
            <template v-if="selectedNodeDetails.dependsOn && selectedNodeDetails.dependsOn.length">
              <div v-for="req in selectedNodeDetails.dependsOn" :key="req.name" 
                   :class="req.met ? 'text-green-400' : 'text-red-400'">
                {{ req.name }}
              </div>
            </template>
            <template v-else>
              <div class="text-green-400">Žiadne (alebo nenačítané)</div>
            </template>
          </div>
          
          <div class="pt-4 flex gap-2">
            <button v-if="selectedNodeDetails.status === 'researched' || isResearched(selectedNodeKey)" class="btn bg-green-900/50 text-green-300 border-green-500/50 flex-1 py-2 font-bold opacity-50 cursor-not-allowed">Vyskúmané</button>
            <button v-else-if="selectedNodeDetails.status === 'researching' || isResearching(selectedNodeKey)" class="btn bg-yellow-900/50 text-yellow-300 border-yellow-500/50 flex-1 py-2 font-bold opacity-50 cursor-not-allowed">Prebieha výskum</button>
            <button v-else @click="doResearch" class="btn btn-primary flex-1 py-2 font-bold text-lg" :class="{'opacity-50': selectedNodeDetails.status === 'locked'}">Vyzkoumat</button>
          </div>
        </div>
        <div class="p-4 flex justify-center" v-else>
           <span class="animate-pulse text-sgu-accent">Načítavam detaily zo servera...</span>
        </div>
      </div>
    </div>
    
    <!-- Custom Toast -->
    <transition enter-active-class="transition duration-300 ease-out"
                enter-from-class="transform translate-x-full opacity-0"
                enter-to-class="transform translate-x-0 opacity-100"
                leave-active-class="transition duration-200 ease-in"
                leave-from-class="transform translate-x-0 opacity-100"
                leave-to-class="transform translate-x-full opacity-0">
      <div v-if="toast.show" 
           class="fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 border"
           :class="toast.type === 'success' ? 'bg-green-900 border-green-500 text-green-100' : 'bg-red-900 border-red-500 text-red-100'">
        <span class="text-2xl" v-if="toast.type === 'success'">✅</span>
        <span class="text-2xl" v-else>⚠️</span>
        <div class="font-bold">{{ toast.message }}</div>
        <button @click="toast.show = false" class="ml-4 text-white/50 hover:text-white font-bold text-xl">×</button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const data = ref(null)
const loading = ref(false)
const error = ref(null)

const selectedNodeKey = ref(null)

// Rozloženie mriežky
const GRID_SIZE_X = 70;
const GRID_SIZE_Y = 85;
const OFFSET_X = 40;
const OFFSET_Y = 50;

// Hardcoded strom výskumov (zodpovedá presne CSS triedam a screenshotu)
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

const serverResearches = computed(() => data.value?.researches || [])

function serverDataForNode(key) {
  const node = nodesMap[key]
  if (!node) return null
  return serverResearches.value.find(r => r.name.toLowerCase() === node.name.toLowerCase())
}

// Simulované dáta pre demo, ak server nevráti plné info
const demoWhiteNodes = ['dhd', 'rizeni_lodi', 'kino', 'brzdici_trysky', 'osetrovna', 'neuralni_rozhrani', 'vyzkumna_laborator', 'prechodova_komora', 'ochranne_obleky', 'rizeni_clunu', 'zbranove_systemy']

function isResearched(key) {
  const sData = serverDataForNode(key)
  if (sData) {
    return sData.status === 'researched'
  }
  return false
}

function isResearching(key) {
  const sData = serverDataForNode(key)
  return sData?.status === 'researching'
}

function canResearch(key) {
  // We now rely on the server's status parsed from the button
  const sData = serverDataForNode(key)
  return sData?.status === 'available'
}

const selectedNodeDetails = ref(null)

async function selectNode(key) {
  selectedNodeKey.value = key
  selectedNodeDetails.value = null // reset while loading
  const sData = serverDataForNode(key)
  if (sData && sData.id) {
    try {
      const res = await axios.get(`/api/research/${sData.id}`)
      selectedNodeDetails.value = res.data.data
    } catch (e) {
      console.error('Failed to load node details', e)
    }
  }
}

const toast = ref({ show: false, message: '', type: 'error' })

function showToast(message, type = 'error') {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 4000)
}

async function doResearch() {
  const sData = serverDataForNode(selectedNodeKey.value)
  
  if (sData && sData.id) {
    try {
      loading.value = true
      const res = await axios.post('/api/research', { technology_id: sData.id })
      showToast(res.data.message || 'Výskum odoslaný', res.data.type || 'success')
      selectedNodeKey.value = null
      await refresh()
    } catch (e) {
      showToast('Chyba: ' + (e.response?.data?.error || e.message), 'error')
      loading.value = false
    }
  } else {
    showToast(`Tento výskum sa nedá vyskúmať (nenájdené ID na serveri)`, 'error')
  }
}

async function refresh() {
  loading.value = true
  error.value = null
  try {
    const res = await axios.get('/api/research')
    data.value = res.data.data
  } catch (e) {
    error.value = e.response?.data?.error || 'Nepodarilo sa načítať dáta.'
    // Pre UI demo, inicializujeme prazdne pole, ak sme offline / 401
    if (!data.value) data.value = { researches: [] }
  } finally {
    loading.value = false
  }
}

onMounted(refresh)
</script>

<style scoped>
.text-shadow {
  text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
}
</style>
