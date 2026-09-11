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
      <div v-if="data.player?.username" class="card bg-gradient-to-r from-sgu-navy to-sgu-blue mb-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-sgu-dark border-2 border-sgu-accent flex items-center justify-center text-xl">
            👨‍🚀
          </div>
          <div>
            <h2 class="text-lg font-bold text-white">{{ data.player.username }}</h2>
            <p class="text-xs text-sgu-accent uppercase tracking-wide">{{ data.player.rankClass?.replace('rank-standard', '').replace(/-/g, ' ') || 'Hráč' }}</p>
          </div>
        </div>
        <div class="text-right text-xs">
          <div class="text-sgu-gold font-bold">{{ data.resources?.renown || '' }}</div>
          <div class="text-green-400">{{ data.resources?.happiness?.replace('Spokojenost', '') || '' }}</div>
        </div>
      </div>

      <!-- Suroviny (Resource Bar) -->
      <div v-if="Object.keys(data.resources || {}).length > 0" class="grid grid-cols-2 gap-2 mb-6">
        <div v-for="(val, key) in data.resources" :key="key" v-show="!['renown', 'happiness', 'success', 'progress', 'progress-bar'].includes(key)" class="bg-sgu-navy border border-white/5 rounded-lg p-2 flex flex-col">
          <span class="text-[10px] text-sgu-text/50 uppercase tracking-wider mb-1 truncate">{{ key }}</span>
          <span class="font-mono text-sgu-gold text-sm truncate" v-html="val.replace(/^[a-zA-ZáčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ ]+ /, '')"></span>
        </div>
      </div>

      <!-- Štatistiky -->
      <div v-if="Object.keys(data.stats || {}).length > 0" class="mb-6">
        <h2 class="text-xs uppercase tracking-wider text-sgu-text/50 mb-2 pl-1">Štatistiky Lode</h2>
        <div class="grid grid-cols-2 gap-2">
           <div v-for="(val, key) in data.stats" :key="key" class="card bg-sgu-dark border-white/10 p-2">
              <span class="text-[10px] text-sgu-text/50 uppercase block mb-1">{{ key.replace(/-/g, ' ') }}</span>
              <span class="text-sm font-semibold truncate block" :title="val">{{ val.replace(/^[a-zA-ZáčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ ]+ /, '') }}</span>
           </div>
        </div>
      </div>

      <!-- Udalosti a Notifikácie -->
      <div v-if="data.alerts?.length" class="mb-6">
        <div class="flex items-center justify-between mb-2 pl-1">
          <h2 class="text-xs uppercase tracking-wider text-sgu-text/50">Hlásenia a Výstrahy</h2>
          <router-link to="/reports" 
            :class="['text-[10px] px-2 py-1 rounded border uppercase tracking-wider', 
                     data.hasNewReport ? 'bg-red-600/50 text-red-100 border-red-500 animate-pulse font-bold' : 'bg-blue-600/30 text-blue-300 border-blue-500/30']">
            {{ data.hasNewReport ? '🚨 Nový Report!' : 'Reporty' }}
          </router-link>
        </div>
        <div class="space-y-2">
          <div v-for="(alert, i) in data.alerts" :key="i"
               class="card text-sm border-sgu-accent/30 bg-sgu-accent/10">
            {{ alert }}
          </div>
        </div>
      </div>

      <!-- Questy -->
      <div v-if="data.quests?.length" class="mb-6">
        <h2 class="text-xs uppercase tracking-wider text-sgu-text/50 mb-2 pl-1">Quest Log</h2>
        <div class="card border-blue-500/30 bg-blue-900/20">
          <p v-for="(q, i) in data.quests" :key="i" class="text-sm mb-1 last:mb-0" :class="{'font-bold text-blue-300': i===0, 'text-sgu-text/80': i>0}">{{ q }}</p>
        </div>
      </div>

      <!-- Ostatné infoboxy -->
      <div v-if="data.infoboxes?.length" class="mb-6 space-y-3">
        <h2 class="text-xs uppercase tracking-wider text-sgu-text/50 mb-2 pl-1">Ďalšie informácie</h2>
        <div v-for="box in data.infoboxes" :key="box.title" class="card bg-sgu-navy border-white/10">
           <h3 class="font-bold text-sm text-sgu-accent mb-2">{{ box.title.replace(/\\[\\?\\]|\\[x\\]/g, '').trim() }}</h3>
           <p class="text-xs text-sgu-text/80 leading-relaxed">{{ box.content }}{{ box.content.length === 300 ? '...' : '' }}</p>
        </div>
      </div>

      <!-- Chat -->
      <div v-if="data.chat?.length" class="mb-6">
        <h2 class="text-xs uppercase tracking-wider text-sgu-text/50 mb-2 pl-1">Herný Chat (Posledné správy)</h2>
        <div class="card bg-black/40 border-white/10 max-h-48 overflow-y-auto space-y-2">
          <div v-for="(msg, i) in data.chat" :key="i" class="text-xs">
            <span class="text-sgu-text/60">></span> {{ msg }}
          </div>
        </div>
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
