<template>
  <div class="page-content pb-24">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-bold text-sgu-accent">🚀 Expedície</h1>
      <button @click="refresh" :class="loading ? 'animate-spin' : ''"
              class="text-xl p-2 bg-sgu-navy rounded-full border border-white/10 active:scale-95">🔄</button>
    </div>

    <!-- Loading -->
    <div v-if="loading && !data" class="flex justify-center py-12">
      <div class="animate-spin text-4xl text-sgu-accent">⟳</div>
    </div>

    <template v-else>
      <!-- Aktívna expedícia -->
      <div class="card mb-4 border-sgu-accent/30 bg-sgu-dark">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-sgu-accent font-bold text-sm uppercase tracking-wider">🟢 Aktívna expedícia</span>
        </div>
        <div class="flex items-center justify-between">
          <div>
            <div class="text-base font-bold text-white">{{ activeExpedition.name }}</div>
            <div class="text-xs text-sgu-text/50 mt-0.5">{{ activeExpedition.destination }}</div>
          </div>
          <div class="text-right">
            <div class="text-sgu-gold font-mono font-bold text-lg">{{ countdown }}</div>
            <div class="text-[10px] text-sgu-text/40">zostatok</div>
          </div>
        </div>
        <div class="mt-3 h-2 rounded-full bg-sgu-navy overflow-hidden">
          <div class="h-full rounded-full bg-sgu-accent transition-all"
               :style="`width: ${activeExpedition.progress}%; box-shadow: 0 0 8px #209cff;`"></div>
        </div>
        <div class="flex justify-between text-[10px] text-sgu-text/40 mt-1">
          <span>0%</span>
          <span>{{ activeExpedition.progress }}% dokončené</span>
          <span>100%</span>
        </div>
      </div>

      <!-- Zoznam expedícií -->
      <h3 class="text-xs uppercase tracking-wider text-sgu-text/40 mb-2 pl-1">Dostupné expedície</h3>
      <div class="space-y-3 mb-4">
        <div v-for="exp in expeditions" :key="exp.id"
             class="card border-white/10 bg-sgu-dark">
          <div class="flex items-start gap-3">
            <div class="w-11 h-11 rounded-lg bg-sgu-navy border border-white/10 flex items-center justify-center text-xl shrink-0">
              {{ exp.icon }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <span class="text-sm font-bold truncate">{{ exp.name }}</span>
                <span class="text-[10px] px-2 py-0.5 rounded border shrink-0"
                      :class="exp.status === 'available'
                        ? 'border-green-500/40 text-green-400 bg-green-900/20'
                        : exp.status === 'running'
                          ? 'border-sgu-accent/40 text-sgu-accent bg-sgu-accent/10'
                          : 'border-white/10 text-sgu-text/40'">
                  {{ exp.status === 'available' ? 'Voľná' : exp.status === 'running' ? 'Prebieha' : 'Uzamknutá' }}
                </span>
              </div>
              <div class="text-xs text-sgu-text/50 mt-0.5">{{ exp.description }}</div>
              <div class="flex items-center gap-3 mt-2">
                <span class="text-[10px] text-sgu-gold">⏱ {{ exp.duration }}</span>
                <span class="text-[10px] text-sgu-text/40">🔬 {{ exp.reward }}</span>
              </div>
            </div>
          </div>
          <button v-if="exp.status === 'available'"
                  @click="startExpedition(exp)"
                  class="mt-3 w-full py-2 rounded-lg text-sm font-bold text-sgu-accent border border-sgu-accent/40 bg-sgu-accent/10 active:scale-95 transition">
            ▶ Spustiť expedíciu
          </button>
        </div>
      </div>

      <!-- Server obsah -->
      <div v-if="data?.html" class="card border-white/10 bg-sgu-dark">
        <div v-html="data.html" class="text-sm text-sgu-text/80 space-y-1"></div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

const data    = ref(null)
const loading = ref(false)
const countdown = ref('0:33:36')

const activeExpedition = ref({
  name: 'Prieskum sektora 7',
  destination: 'Neznáma galaxia – smer Orion',
  progress: 62,
})

const expeditions = ref([
  { id: 1, icon: '🔭', name: 'Astronomický prieskum',   description: 'Mapy nových sektorov',       duration: '2h',  reward: '+50 VB',   status: 'available' },
  { id: 2, icon: '⚗️', name: 'Zber vzoriek',            description: 'Zber anorganických vzoriek',  duration: '4h',  reward: '+100 VB',  status: 'running'   },
  { id: 3, icon: '🏴', name: 'Taktická expedícia',      description: 'Prieskum nepriateľskej zóny', duration: '8h',  reward: '+200 VB',  status: 'available' },
  { id: 4, icon: '🌍', name: 'Kolonizačná misia',       description: 'Hľadanie obyvateľnej planéty',duration: '24h', reward: '+500 VB',  status: 'locked'    },
])

// Odpočítavač
let timer = null
function startCountdown() {
  let seconds = 33 * 60 + 36
  timer = setInterval(() => {
    if (seconds <= 0) { clearInterval(timer); return }
    seconds--
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    countdown.value = `${m}:${String(s).padStart(2, '0')}`
  }, 1000)
}

function startExpedition(exp) {
  exp.status = 'running'
}

async function refresh() {
  loading.value = true
  try {
    const res = await axios.get('/api/expedition')
    data.value = res.data.data
  } catch {
    // Tichý fail – demo dáta
  } finally {
    loading.value = false
  }
}

onMounted(() => { refresh(); startCountdown() })
onUnmounted(() => clearInterval(timer))
</script>
