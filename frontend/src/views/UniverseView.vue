<template>
  <div class="page-content pb-24">
    <!-- Header s podmenu tabmi -->
    <div class="flex items-center justify-between mb-4 shrink-0">
      <h1 class="text-xl font-bold text-sgu-accent">Vesmír</h1>
      <button @click="refresh" :class="loading ? 'animate-spin' : ''"
              class="text-xl p-2 bg-sgu-navy rounded-full border border-white/10 active:scale-95">🔄</button>
    </div>

    <!-- Podmenu taby: Mapa / Aréna / Expedície -->
    <div class="flex gap-2 mb-5 overflow-x-auto pb-1 shrink-0">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all active:scale-95"
        :class="activeTab === tab.id
          ? 'bg-sgu-accent text-white'
          : 'bg-sgu-navy text-sgu-text/60 border border-white/10'"
      >
        <span>{{ tab.icon }}</span>
        {{ tab.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading && !data" class="flex justify-center py-12">
      <div class="animate-spin text-4xl text-sgu-accent">⟳</div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="card bg-red-900/30 border-red-500/30 text-red-300">
      <p class="font-bold mb-1">Chyba načítania</p>
      <p class="text-sm">{{ error }}</p>
      <button @click="refresh" class="btn btn-ghost mt-3 text-sm">Skúsiť znova</button>
    </div>

    <!-- TAB: MAPA -->
    <template v-else-if="activeTab === 'map'">
      <div class="card bg-sgu-dark border-sgu-accent/20 overflow-hidden p-0 mb-4">
        <!-- Simulácia mapy vesmíru -->
        <div class="relative w-full h-72 overflow-hidden"
             style="background: radial-gradient(ellipse at 40% 40%, #0d1f3c 0%, #0a1628 70%, #000 100%);">
          <!-- Hviezdičky -->
          <div v-for="s in stars" :key="s.id" class="absolute rounded-full bg-white"
               :style="{ left: s.x+'%', top: s.y+'%', width: s.size+'px', height: s.size+'px', opacity: s.op }"></div>

          <!-- Uzly galaxií -->
          <template v-for="node in galaxyNodes" :key="node.id">
            <div class="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                 :style="{ left: node.x+'%', top: node.y+'%' }"
                 @click="selectedGalaxy = node">
              <div class="flex flex-col items-center">
                <div class="rounded-full border-2 flex items-center justify-center transition-transform active:scale-110"
                     :class="node.current
                       ? 'w-5 h-5 border-green-400 bg-green-400/30 animate-pulse'
                       : node.discovered
                         ? 'w-4 h-4 border-sgu-accent bg-sgu-accent/20'
                         : 'w-3 h-3 border-gray-600 bg-gray-800'">
                </div>
                <span v-if="node.discovered || node.current"
                      class="text-[8px] mt-0.5 text-center leading-tight"
                      :class="node.current ? 'text-green-400' : 'text-sgu-accent/80'">
                  {{ node.name }}
                </span>
              </div>
            </div>
          </template>

          <!-- Legenda -->
          <div class="absolute bottom-2 left-2 flex flex-col gap-1">
            <div class="flex items-center gap-1.5">
              <div class="w-2.5 h-2.5 rounded-full bg-green-400/30 border border-green-400"></div>
              <span class="text-[9px] text-green-400">Destiny (aktuálna)</span>
            </div>
            <div class="flex items-center gap-1.5">
              <div class="w-2.5 h-2.5 rounded-full bg-sgu-accent/20 border border-sgu-accent"></div>
              <span class="text-[9px] text-sgu-accent">Objavená</span>
            </div>
            <div class="flex items-center gap-1.5">
              <div class="w-2 h-2 rounded-full bg-gray-800 border border-gray-600"></div>
              <span class="text-[9px] text-gray-500">Neobjavená</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Vybraná galaxia info -->
      <div v-if="selectedGalaxy" class="card mb-4 border-sgu-accent/30">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-bold text-sgu-accent">{{ selectedGalaxy.name }}</h3>
          <button @click="selectedGalaxy = null" class="text-sgu-text/30 text-xl leading-none">✕</button>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div><span class="text-sgu-text/50">Stav: </span><span :class="selectedGalaxy.current ? 'text-green-400' : 'text-sgu-accent'">{{ selectedGalaxy.current ? 'Aktuálna poloha' : (selectedGalaxy.discovered ? 'Objavená' : 'Neobjavená') }}</span></div>
          <div><span class="text-sgu-text/50">Vzdialenosť: </span><span class="text-sgu-gold">{{ selectedGalaxy.distance }}</span></div>
        </div>
      </div>

      <!-- Suroviny zo servera -->
      <div v-if="data?.universeStats" class="card border-white/10 bg-sgu-dark">
        <h3 class="text-xs uppercase tracking-wider text-sgu-text/40 mb-3">Štatistiky Vesmíru</h3>
        <div v-html="data.universeStats" class="text-sm text-sgu-text/80"></div>
      </div>
      <div v-else class="card border-white/10 bg-sgu-dark text-center py-6 text-sgu-text/30 text-sm">
        Mapa vesmíru – pripojenie k serveru...
      </div>
    </template>

    <!-- TAB: ARÉNA -->
    <template v-else-if="activeTab === 'arena'">
      <div class="text-center py-6">
        <router-link to="/arena" class="btn btn-primary inline-flex items-center gap-2">
          <span>⚔️</span> Prejsť do Arény
        </router-link>
      </div>
    </template>

    <!-- TAB: EXPEDÍCIE -->
    <template v-else-if="activeTab === 'expedition'">
      <div class="text-center py-6">
        <router-link to="/expedition" class="btn btn-primary inline-flex items-center gap-2">
          <span>🚀</span> Správa expedícií
        </router-link>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const activeTab = ref('map')
const data      = ref(null)
const loading   = ref(false)
const error     = ref(null)
const selectedGalaxy = ref(null)

const tabs = [
  { id: 'map',        icon: '🌌', label: 'Mapa Vesmíru' },
  { id: 'arena',      icon: '⚔️', label: 'Aréna'        },
  { id: 'expedition', icon: '🚀', label: 'Expedície'     },
]

// Generuj náhodné hviezdy pre pozadie
const stars = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() < 0.8 ? 1 : 2,
  op: (0.2 + Math.random() * 0.8).toFixed(2),
}))

// Statické uzly galaxií (neskôr nahradiť API dátami)
const galaxyNodes = [
  { id: 1, name: 'Destiny',     x: 45, y: 50, current: true,  discovered: true,  distance: '—' },
  { id: 2, name: 'Novus',       x: 25, y: 30, current: false, discovered: true,  distance: '1.2 ly' },
  { id: 3, name: 'Unnamed-7',   x: 65, y: 25, current: false, discovered: true,  distance: '3.4 ly' },
  { id: 4, name: 'Oranogan',    x: 75, y: 60, current: false, discovered: true,  distance: '5.1 ly' },
  { id: 5, name: '???',         x: 20, y: 65, current: false, discovered: false, distance: '?' },
  { id: 6, name: '???',         x: 55, y: 78, current: false, discovered: false, distance: '?' },
  { id: 7, name: 'Novak Prime', x: 35, y: 18, current: false, discovered: true,  distance: '2.7 ly' },
  { id: 8, name: '???',         x: 82, y: 40, current: false, discovered: false, distance: '?' },
]

async function refresh() {
  loading.value = true
  error.value = null
  try {
    const res = await axios.get('/api/universe')
    data.value = res.data.data
  } catch {
    // Tichý fail – mapa sa zobrazí so statickými dátami
  } finally {
    loading.value = false
  }
}

onMounted(refresh)
</script>
