<template>
  <div class="page-content pb-24">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-bold text-sgu-accent">Štatistiky</h1>
      <div class="flex gap-2">
         <button @click="$router.push('/')" class="text-sm p-2 px-3 bg-sgu-navy rounded border border-white/10 active:scale-95">Späť</button>
         <button @click="refresh()" :class="loading ? 'animate-spin' : ''" class="text-xl p-2 bg-sgu-navy rounded-full border border-white/10 active:scale-95">🔄</button>
      </div>
    </div>

    <div v-if="loading && !html" class="flex justify-center py-12">
      <div class="animate-spin text-4xl text-sgu-accent">⟳</div>
    </div>
    <div v-else-if="error" class="card bg-red-900/30 text-red-300">
      {{ error }}
    </div>
    
    <div v-else class="stats-container bg-sgu-navy/50 p-2 rounded-lg border border-white/5 overflow-x-auto text-sm" v-html="html" @click="handleLinkClick">
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const html = ref('')
const loading = ref(false)
const error = ref(null)

async function refresh(url = '/stats.php') {
  loading.value = true
  error.value = null
  try {
    const res = await axios.get('/api/stats?url=' + encodeURIComponent(url))
    html.value = res.data.data.html
  } catch (e) {
    error.value = 'Chyba pri načítaní štatistík'
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
.stats-container table { width: 100%; border-collapse: collapse; }
.stats-container th, .stats-container td { padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); }
.stats-container a { color: #60a5fa; text-decoration: underline; }
.stats-container img { max-width: 100%; height: auto; }
.stats-container .text-center { text-align: center; }
.stats-container .text-right { text-align: right; }

/* Kompaktné menu štatistík bez veľkých obrázkov */
.stats-container .infobox-standard { 
  margin-bottom: 0.5rem; 
  background: rgba(30, 58, 138, 0.3); /* bg-blue-900/30 */
  border: 1px solid rgba(59, 130, 246, 0.3); /* border-blue-500/30 */
  border-radius: 8px; 
  position: relative;
}
.stats-container .infobox-standard-title { 
  padding: 12px; 
  font-weight: bold; 
  text-align: center; 
  color: #93c5fd; /* text-blue-300 */
}
.stats-container .infobox-standard-body { 
  position: absolute; 
  inset: 0; 
}
.stats-container .infobox-standard-body a { 
  display: block; 
  width: 100%; 
  height: 100%; 
}
.stats-container .stats-img { 
  display: none; 
}
</style>
