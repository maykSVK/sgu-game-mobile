<template>
  <div class="page-content pb-24">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-bold text-sgu-accent">Bitevné reporty</h1>
      <div class="flex gap-2">
         <button @click="$router.push('/')" class="text-sm p-2 px-3 bg-sgu-navy rounded border border-white/10 active:scale-95">Späť</button>
         <button @click="refresh()" :class="loading ? 'animate-spin' : ''" class="text-xl p-2 bg-sgu-navy rounded-full border border-white/10 active:scale-95">🔄</button>
      </div>
    </div>

    <!-- Mark as read button -->
    <div class="mb-4 flex gap-2">
       <button @click="markAsRead" class="flex-1 bg-blue-900/50 text-blue-300 py-2 rounded-lg border border-blue-500/30 text-sm">✓ Všetko prečítané</button>
    </div>

    <div v-if="loading && !html" class="flex justify-center py-12">
      <div class="animate-spin text-4xl text-sgu-accent">⟳</div>
    </div>
    <div v-else-if="error" class="card bg-red-900/30 text-red-300">
      {{ error }}
    </div>
    
    <div v-else class="reports-container bg-sgu-navy/50 p-2 rounded-lg border border-white/5 overflow-x-auto text-sm" v-html="html" @click="handleLinkClick">
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const html = ref('')
const loading = ref(false)
const error = ref(null)

async function refresh(url = '/reports.php') {
  loading.value = true
  error.value = null
  try {
    const res = await axios.get('/api/reports?url=' + encodeURIComponent(url))
    html.value = res.data.data.html
  } catch (e) {
    error.value = 'Chyba pri načítaní reportov'
  } finally {
    loading.value = false
  }
}

async function markAsRead() {
  loading.value = true
  error.value = null
  try {
    const res = await axios.get('/api/reports?action=readAll')
    html.value = res.data.data.html
  } catch (e) {
    error.value = 'Chyba pri načítaní reportov'
  } finally {
    loading.value = false
  }
}

function handleLinkClick(e) {
  const a = e.target.closest('a')
  if (a) {
    e.preventDefault()
    const href = a.getAttribute('href')
    if (href && !href.startsWith('http')) {
       refresh(href)
    }
  }
}

onMounted(() => refresh())
</script>

<style>
.reports-container table { width: 100%; border-collapse: collapse; }
.reports-container th, .reports-container td { padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); }
.reports-container a { color: #60a5fa; text-decoration: underline; }
.reports-container img { max-width: 100%; height: auto; }
.reports-container .text-center { text-align: center; }
.reports-container .text-right { text-align: right; }
</style>
