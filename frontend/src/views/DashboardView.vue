<template>
  <div class="page-content pb-24">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-bold text-sgu-accent">Můstek (Dashboard)</h1>
      <div class="flex gap-2">
        <button @click="doLogout" class="text-sm p-2 px-3 bg-red-900/40 text-red-400 rounded-full border border-red-500/20 active:scale-95">Odhlásiť</button>
        <button @click="refresh" :class="loading ? 'animate-spin' : ''" class="text-xl p-2 bg-sgu-navy rounded-full border border-white/10 active:scale-95">🔄</button>
      </div>
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

    <template v-else-if="data">
      <!-- Profil Hráča -->
      <div v-if="data.player?.username" class="card bg-gradient-to-r from-sgu-navy to-sgu-blue mb-4 flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-sgu-dark border-2 border-sgu-accent flex items-center justify-center text-xl">
          👨‍🚀
        </div>
        <div>
          <h2 class="text-lg font-bold text-white">{{ data.player.username }}</h2>
          <p class="text-xs text-sgu-accent uppercase tracking-wide">{{ data.player.rankClass?.replace('rank-standard', '').replace(/-/g, ' ') || 'Hráč' }}</p>
        </div>
      </div>

      <!-- Suroviny (Resource Bar) -->
      <div v-if="Object.keys(data.resources || {}).length > 0" class="grid grid-cols-2 gap-2 mb-6">
        <div v-for="(val, key) in data.resources" :key="key" class="bg-sgu-navy border border-white/5 rounded-lg p-3 flex flex-col">
          <span class="text-[10px] text-sgu-text/50 uppercase tracking-wider mb-1">{{ key }}</span>
          <span class="font-mono text-sgu-gold font-bold">{{ val }}</span>
        </div>
      </div>

      <!-- Notifikácie / novinky -->
      <div v-if="data.news?.length" class="mb-4 space-y-2">
        <div v-for="n in data.news" :key="n.type"
             class="card border-sgu-accent/50 bg-sgu-accent/10 flex items-center gap-3">
          <span class="text-xl">{{ n.type === 'battle_report' ? '⚔️' : '🏛️' }}</span>
          <span class="text-sgu-accent font-semibold text-sm">{{ n.label }}</span>
        </div>
      </div>

      <!-- Upozornenia -->
      <div v-if="data.alerts?.length" class="mb-6">
        <h2 class="text-xs uppercase tracking-wider text-sgu-text/50 mb-2 pl-1">Upozornenia</h2>
        <div class="space-y-2">
          <div v-for="(alert, i) in data.alerts" :key="i"
               class="card text-sm text-yellow-300 border-yellow-500/30 bg-yellow-900/10">
            {{ alert }}
          </div>
        </div>
      </div>

      <!-- Countdown timery -->
      <div v-if="data.timers?.length" class="mb-4">
        <h2 class="text-xs uppercase tracking-wider text-sgu-text/50 mb-2 pl-1">Aktívne procesy</h2>
        <div class="space-y-2">
          <div v-for="timer in data.timers" :key="timer.label" class="card flex justify-between items-center border-sgu-accent/20 bg-sgu-accent/5">
            <span class="text-sm font-medium">{{ timer.label }}</span>
            <span class="text-sgu-accent font-mono text-sm bg-sgu-dark px-2 py-1 rounded">{{ timer.current }}</span>
          </div>
        </div>
      </div>
      
      <!-- Ak nič nie je k dispozícii -->
      <div v-if="!data.alerts?.length && !data.timers?.length && !data.news?.length"
           class="card text-center py-8 text-sgu-text/40">
        <div class="text-4xl mb-2">✅</div>
        <p>Žiadne upozornenia</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

const data = ref(null)
const loading = ref(false)
const error = ref(null)

const router = useRouter()
const auth = useAuthStore()

async function doLogout() {
  await auth.logout()
  router.push('/login')
}

async function refresh() {
  loading.value = true
  error.value = null
  try {
    const res = await axios.get('/api/dashboard')
    data.value = res.data.data
  } catch (e) {
    error.value = e.response?.data?.error || 'Nepodarilo sa načítať dashboard'
  } finally {
    loading.value = false
  }
}

onMounted(refresh)
</script>
