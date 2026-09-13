<template>
  <div class="page-content pb-24">
    <!-- Header -->
    <div class="flex items-center justify-between mb-5">
      <h1 class="text-xl font-bold text-sgu-accent">⭐ Hviezdna brána</h1>
      <button @click="refresh" :class="loading ? 'animate-spin' : ''"
              class="text-xl p-2 bg-sgu-navy rounded-full border border-white/10 active:scale-95">🔄</button>
    </div>

    <!-- Loading -->
    <div v-if="loading && !data" class="flex justify-center py-12">
      <div class="animate-spin text-4xl text-sgu-accent">⟳</div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="card bg-red-900/30 border-red-500/30 text-red-300 mb-4">
      <p class="font-bold mb-1">Chyba načítania</p>
      <p class="text-sm">{{ error }}</p>
      <button @click="refresh" class="btn btn-ghost mt-3 text-sm">Skúsiť znova</button>
    </div>

    <!-- Vizualizácia brány -->
    <div class="card p-0 overflow-hidden mb-4 border-sgu-accent/30">
      <div class="relative w-full flex items-center justify-center py-8"
           style="background: radial-gradient(ellipse at center, #0d2a4a 0%, #0a1628 70%);">
        <!-- Vonkajší prstenec -->
        <div class="absolute rounded-full border-4 w-44 h-44 animate-spin-slow"
             style="border-color: rgba(32,156,255,0.3);
                    box-shadow: 0 0 30px rgba(32,156,255,0.2), inset 0 0 30px rgba(32,156,255,0.1);
                    animation: spin 20s linear infinite;"></div>
        <!-- Stredný prstenec -->
        <div class="absolute rounded-full border-2 w-36 h-36"
             style="border-color: rgba(32,156,255,0.5);
                    box-shadow: 0 0 20px rgba(32,156,255,0.3);
                    animation: spin 12s linear infinite reverse;"></div>
        <!-- Event horizon -->
        <div class="relative rounded-full w-28 h-28 flex items-center justify-center"
             :style="gateActive
               ? 'background: radial-gradient(circle, #0af 0%, #0066cc 50%, #003 100%); box-shadow: 0 0 40px #209cff, 0 0 80px rgba(32,156,255,0.4);'
               : 'background: radial-gradient(circle, #0d1f3c 0%, #0a1628 100%); box-shadow: 0 0 10px rgba(32,156,255,0.1);'">
          <span class="text-3xl">{{ gateActive ? '🌀' : '⭕' }}</span>
        </div>
      </div>

      <!-- Status -->
      <div class="px-4 py-3 flex items-center justify-between"
           style="border-top: 1px solid rgba(32,156,255,0.15);">
        <span class="text-sm font-semibold">Stav brány</span>
        <span class="text-xs px-3 py-1 rounded-full font-bold"
              :class="gateActive
                ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                : 'bg-gray-700/50 text-gray-400 border border-gray-600/40'">
          {{ gateActive ? '● AKTÍVNA' : '○ NEAKTÍVNA' }}
        </span>
      </div>
    </div>

    <!-- Klávesnica adresy (7 symbolov) -->
    <div class="card mb-4 border-white/10">
      <h3 class="text-xs uppercase tracking-wider text-sgu-text/40 mb-3">Adresa brány</h3>
      <div class="flex gap-2 mb-3">
        <div v-for="(sym, i) in dialedAddress" :key="i"
             class="flex-1 h-10 rounded flex items-center justify-center text-sm font-mono font-bold border"
             :class="sym
               ? 'bg-sgu-accent/20 border-sgu-accent text-sgu-accent'
               : 'bg-sgu-dark border-white/10 text-sgu-text/20'">
          {{ sym || '·' }}
        </div>
      </div>
      <div class="grid grid-cols-5 gap-2">
        <button v-for="s in gateSymbols" :key="s"
                @click="addSymbol(s)"
                class="h-10 rounded border text-xs font-mono font-bold transition active:scale-90"
                :class="dialedAddress.includes(s)
                  ? 'bg-sgu-accent/30 border-sgu-accent text-sgu-accent'
                  : 'bg-sgu-dark border-white/10 text-sgu-text/60'">
          {{ s }}
        </button>
      </div>
      <div class="flex gap-2 mt-3">
        <button @click="clearAddress"
                class="flex-1 py-2 rounded-lg text-sm font-bold text-red-300 border border-red-500/30 bg-red-900/20 active:scale-95">
          Vymazať
        </button>
        <button @click="dialGate"
                :disabled="dialedAddress.filter(Boolean).length < 7"
                class="flex-1 py-2 rounded-lg text-sm font-bold active:scale-95 transition"
                :class="dialedAddress.filter(Boolean).length >= 7
                  ? 'bg-sgu-accent text-white'
                  : 'bg-sgu-navy text-sgu-text/30 border border-white/10 cursor-not-allowed'">
          Vytočiť
        </button>
      </div>
    </div>

    <!-- Destinácie zo servera alebo ukážkové -->
    <div class="mb-4">
      <h3 class="text-xs uppercase tracking-wider text-sgu-text/40 mb-2 pl-1">Dostupné planéty</h3>
      <div class="space-y-2">
        <div v-if="data?.destinations?.length">
          <div v-for="dest in data.destinations" :key="dest.id || dest.name"
               class="card flex items-center gap-3 border-white/10 bg-sgu-dark active:bg-sgu-blue/20 cursor-pointer"
               @click="selectDestination(dest)">
            <div class="w-10 h-10 rounded-full bg-sgu-navy border border-sgu-accent/30 flex items-center justify-center text-lg shrink-0">
              🪐
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-bold truncate">{{ dest.name }}</div>
              <div class="text-[10px] text-sgu-text/40 font-mono">{{ dest.address || '> ∧ ≡ ⊂ ∧' }}</div>
            </div>
            <div class="text-right shrink-0">
              <div class="text-xs text-sgu-gold">{{ dest.distance || '?' }}</div>
              <div class="text-[10px] text-sgu-text/40">{{ dest.travelTime || '' }}</div>
            </div>
          </div>
        </div>
        <!-- Ukážkové dáta ak server nevrátil nič -->
        <template v-else>
          <div v-for="dest in demoDestinations" :key="dest.name"
               class="card flex items-center gap-3 border-white/10 bg-sgu-dark">
            <div class="w-10 h-10 rounded-full bg-sgu-navy border border-sgu-accent/30 flex items-center justify-center text-lg shrink-0">🪐</div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-bold truncate">{{ dest.name }}</div>
              <div class="text-[10px] text-sgu-text/40 font-mono">{{ dest.address }}</div>
            </div>
            <div class="text-right shrink-0">
              <div class="text-xs text-sgu-gold">{{ dest.distance }}</div>
              <div class="text-[10px] text-sgu-text/40">{{ dest.time }}</div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Toast -->
    <transition enter-active-class="transition duration-300 ease-out"
                enter-from-class="translate-y-4 opacity-0"
                enter-to-class="translate-y-0 opacity-100"
                leave-active-class="transition duration-200 ease-in"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0 translate-y-4">
      <div v-if="toast.show"
           class="fixed bottom-24 left-4 right-4 z-50 px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 border"
           :class="toast.type === 'success' ? 'bg-green-900 border-green-500 text-green-100' : 'bg-sgu-navy border-sgu-accent/50 text-sgu-text'">
        <span class="text-xl">{{ toast.type === 'success' ? '✅' : 'ℹ️' }}</span>
        <div class="text-sm font-semibold">{{ toast.message }}</div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const data    = ref(null)
const loading = ref(false)
const error   = ref(null)
const gateActive = ref(false)
const toast   = ref({ show: false, message: '', type: 'info' })

const gateSymbols = ['>', '∧', '≡', '⊂', '<', '∇', 'Ξ', 'Ω', 'Φ', 'Δ']
const dialedAddress = ref(Array(7).fill(null))

const demoDestinations = [
  { name: 'PeneJace',    address: '> ∧ ≡ ⊂ ∧', distance: '1502 km', time: '10h' },
  { name: 'Stanaro',     address: '∧ × > < >', distance: '1213 km', time: '4h'  },
  { name: 'Magin',       address: '> ⋈ ⋊ < <', distance: '753 km',  time: '1h'  },
  { name: 'Oranoga',     address: '> > ≤ ⊂ ∧', distance: '672 km',  time: '2h'  },
]

function addSymbol(s) {
  const idx = dialedAddress.value.findIndex(x => x === null)
  if (idx !== -1) dialedAddress.value[idx] = s
}

function clearAddress() {
  dialedAddress.value = Array(7).fill(null)
  gateActive.value = false
}

function dialGate() {
  if (dialedAddress.value.filter(Boolean).length < 7) return
  gateActive.value = true
  showToast('Brána sa aktivuje...', 'success')
}

function showToast(message, type = 'info') {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

async function refresh() {
  loading.value = true
  error.value = null
  try {
    const res = await axios.get('/api/stargate')
    data.value = res.data.data
  } catch {
    // Tichý fail – zobrazíme demo dáta
  } finally {
    loading.value = false
  }
}

onMounted(refresh)
</script>

<style scoped>
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>
