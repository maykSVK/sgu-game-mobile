<template>
  <div class="page-content pb-24">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-bold text-sgu-accent">⚙️ Vylepšenia</h1>
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
    </div>

    <template v-else>
      <!-- Kategóriové taby -->
      <div class="flex gap-2 overflow-x-auto pb-1 mb-5">
        <button
          v-for="cat in categories"
          :key="cat.id"
          @click="activeCategory = cat.id"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all active:scale-95"
          :class="activeCategory === cat.id
            ? 'text-white'
            : 'bg-sgu-navy text-sgu-text/60 border border-white/10'"
          :style="activeCategory === cat.id ? `background: ${cat.color}; box-shadow: 0 0 12px ${cat.color}40;` : ''"
        >
          <span>{{ cat.icon }}</span>
          {{ cat.label }}
        </button>
      </div>

      <!-- Zoznam vylepšení -->
      <div class="space-y-3 mb-4">
        <template v-for="upgrade in filteredUpgrades" :key="upgrade.id || upgrade.name">
          <!-- Locked -->
          <div v-if="upgrade.locked"
               class="card border-white/5 bg-sgu-dark/50 opacity-60">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-lg bg-sgu-dark border border-white/10 flex items-center justify-center text-xl shrink-0">🔒</div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-bold text-sgu-text/40">{{ upgrade.name }}</div>
                <div class="text-xs text-sgu-text/30 mt-0.5">{{ upgrade.prerequisite || 'Uzamknuté' }}</div>
              </div>
            </div>
          </div>

          <!-- Dostupné / odomknuté -->
          <div v-else class="card border-white/10 bg-sgu-dark"
               :style="`border-left: 3px solid ${currentCategory?.color};`">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-lg flex items-center justify-center text-xl shrink-0"
                   :style="`background: ${currentCategory?.color}20; border: 1px solid ${currentCategory?.color}40;`">
                {{ upgrade.icon || currentCategory?.icon }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-baseline justify-between gap-2">
                  <span class="text-sm font-bold truncate">{{ upgrade.name }}</span>
                  <span class="text-xs text-sgu-text/40 shrink-0">Úr. {{ upgrade.level || 1 }}</span>
                </div>
                <!-- Progress bar -->
                <div class="mt-1.5 h-1.5 rounded-full bg-sgu-navy overflow-hidden">
                  <div class="h-full rounded-full transition-all"
                       :style="`width: ${upgrade.progress || 40}%; background: ${currentCategory?.color};`"></div>
                </div>
                <div class="flex items-center gap-3 mt-2">
                  <span class="text-[10px] text-sgu-gold">💰 {{ upgrade.cost || '1 000' }}</span>
                  <span class="text-[10px] text-sgu-text/40">🔬 {{ upgrade.researchCost || '500' }}</span>
                </div>
              </div>
              <button
                @click="doUpgrade(upgrade)"
                class="shrink-0 px-3 py-2 rounded-lg text-xs font-bold active:scale-95 transition"
                :style="`background: ${currentCategory?.color}30; border: 1px solid ${currentCategory?.color}60; color: ${currentCategory?.color};`">
                ▲ Upgr.
              </button>
            </div>
          </div>
        </template>

        <!-- Server dáta -->
        <div v-if="data?.upgrades?.length === 0 && filteredUpgrades.length === 0"
             class="card text-center text-sgu-text/30 text-sm py-6 border-white/5">
          Žiadne vylepšenia v tejto kategórii
        </div>
      </div>

      <!-- Celkové kredity -->
      <div class="card border-sgu-gold/20 bg-sgu-dark flex items-center justify-between">
        <span class="text-sm text-sgu-text/60">Dostupné kredity</span>
        <span class="text-sgu-gold font-bold font-mono">💰 {{ data?.credits || '414' }}</span>
      </div>
    </template>

    <!-- Toast -->
    <transition enter-active-class="transition duration-300 ease-out"
                enter-from-class="translate-y-4 opacity-0"
                enter-to-class="translate-y-0 opacity-100"
                leave-active-class="transition duration-200 ease-in"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0 translate-y-4">
      <div v-if="toast.show"
           class="fixed bottom-24 left-4 right-4 z-50 px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 border"
           :class="toast.type === 'success' ? 'bg-green-900 border-green-500 text-green-100' : 'bg-red-900 border-red-500 text-red-100'">
        <span class="text-xl">{{ toast.type === 'success' ? '✅' : '⚠️' }}</span>
        <div class="text-sm font-semibold">{{ toast.message }}</div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const data    = ref(null)
const loading = ref(false)
const error   = ref(null)
const toast   = ref({ show: false, message: '', type: 'success' })
const activeCategory = ref('ship')

const categories = [
  { id: 'ship',    icon: '🚀', label: 'Loď',    color: '#209cff' },
  { id: 'weapons', icon: '🔫', label: 'Zbrane',  color: '#ef4444' },
  { id: 'shields', icon: '🛡️', label: 'Štíty',   color: '#6366f1' },
  { id: 'engines', icon: '⚡', label: 'Motory',  color: '#f0c040' },
]

const currentCategory = computed(() => categories.find(c => c.id === activeCategory.value))

// Demo vylepšenia ak server neodpovedá
const demoUpgrades = {
  ship:    [
    { id: 1, name: 'Trup lode', level: 3, progress: 60, cost: '1 000', researchCost: '200', icon: '🚀' },
    { id: 2, name: 'Zásobovacie moduly', level: 2, progress: 30, cost: '2 500', researchCost: '500', icon: '📦' },
    { id: 3, name: 'Navigačný systém', locked: true, prerequisite: 'Vyžaduje: Zásobovacie moduly Úr.3' },
  ],
  weapons: [
    { id: 4, name: 'Railgun Cargrader', level: 3, progress: 45, cost: '1 000', researchCost: '300', icon: '🔫' },
    { id: 5, name: 'Plazmové delá', level: 2, progress: 20, cost: '10 000', researchCost: '1 000', icon: '💥' },
    { id: 6, name: 'Torpéda', locked: true, prerequisite: 'Vyžaduje: Plazmové delá Úr.2' },
  ],
  shields: [
    { id: 7, name: 'Základné štíty', level: 3, progress: 80, cost: '1 000', researchCost: '200', icon: '🛡️' },
    { id: 8, name: 'Adaptívne pole', level: 1, progress: 10, cost: '2 000', researchCost: '600', icon: '🔵' },
  ],
  engines: [
    { id: 9, name: 'Podsvětelné motory', level: 3, progress: 70, cost: '1 000', researchCost: '400', icon: '⚡' },
    { id: 10, name: 'FTL pohon', level: 2, progress: 35, cost: '2 000', researchCost: '800', icon: '🌀' },
    { id: 11, name: 'Hyperdrive', locked: true, prerequisite: 'Vyžaduje: FTL pohon Úr.3' },
  ],
}

const filteredUpgrades = computed(() => {
  if (data.value?.upgrades) {
    return data.value.upgrades.filter(u => u.category === activeCategory.value)
  }
  return demoUpgrades[activeCategory.value] || []
})

function showToast(message, type = 'success') {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

async function doUpgrade(upgrade) {
  try {
    if (upgrade.id) {
      await axios.post('/api/upgrade', { upgrade_id: upgrade.id })
      showToast(`${upgrade.name} vylepšené!`, 'success')
      await refresh()
    } else {
      showToast(`Vylepšenie: ${upgrade.name}`, 'success')
    }
  } catch (e) {
    showToast(e.response?.data?.error || 'Chyba vylepšenia', 'error')
  }
}

async function refresh() {
  loading.value = true
  error.value = null
  try {
    const res = await axios.get('/api/upgrades')
    data.value = res.data.data
  } catch {
    // Tichý fail – zobrazíme demo dáta
  } finally {
    loading.value = false
  }
}

onMounted(refresh)
</script>
