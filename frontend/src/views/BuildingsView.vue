<template>
  <div class="buildings-page">
    <UniverseNav />
    
    <div v-if="buildingsData" class="page-main-title">
      <span class="title-dot"></span>
      Planéty a stavby ({{ buildingsData.planets.length }})
      <div class="tooltip-container">
        <span class="title-tooltip" @click="showTooltip = !showTooltip">[?]</span>
        <transition name="fade">
          <div v-if="showTooltip" class="custom-tooltip-box" @click="showTooltip = false">
            Za naše planéty sú považované tie, na ktorých sme niečo postavili alebo ktoré sme pomenovali.
          </div>
        </transition>
      </div>
    </div>
    
    <div v-if="loading" class="sgu-loading">
      <i class="fas fa-circle-notch fa-spin"></i> Načítavam všetky planéty...
    </div>
    
    <div v-else-if="buildingsData && buildingsData.planets" class="planets-list">
      <div v-for="(p, index) in buildingsData.planets" :key="index" class="planet-card">
        
        <!-- Hlavička planéty -->
        <div class="planet-header-box" v-if="p.planetBox">
          <div class="planet-title">{{ p.planetBox.title }}</div>
          <div class="planet-body dash-raw-html">
            <!-- Native Planet Image (glowing orb) -->
            <div v-if="p.planetBox.imageClass" class="native-card-image planet-detail" :class="p.planetBox.imageClass"></div>
            <!-- Zvyšok HTML -->
            <div v-html="p.planetBox.html"></div>
          </div>
        </div>

        <!-- Budovy na planéte -->
        <div class="buildings-box" v-if="p.buildingsBox">
          <div class="buildings-title">{{ p.buildingsBox.title }}</div>
          <div class="buildings-body dash-raw-html" @submit.prevent="handleFormSubmit">
            <!-- Render native building images if we find them inside the raw html -->
            <div v-html="p.buildingsBox.html" ref="buildingsHtml"></div>
          </div>
        </div>
        
      </div>
    </div>

    <!-- TOAST -->
    <div v-if="toast.show" class="sgu-toast" :class="toast.type">
      <i class="fas" :class="toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'"></i>
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import UniverseNav from '../components/UniverseNav.vue'

const router = useRouter()
const loading = ref(true)
const buildingsData = ref(null)
const toast = ref({ show: false, message: "", type: "success" })
const showTooltip = ref(false)

function showToast(msg, type="success") {
  toast.value = { show: true, message: msg, type }
  setTimeout(() => toast.value.show = false, 3000)
}

async function loadData() {
  loading.value = true
  try {
    const res = await axios.get('/api/buildings')
    buildingsData.value = res.data.data
  } catch (e) {
    console.error('Buildings load error:', e)
    showToast('Nepodarilo sa načítať zoznam stavieb.', 'error')
  }
  loading.value = false
  
  // After HTML renders, we manually insert the native images above tables
  // because each building is a separate table in the raw HTML
  nextTick(() => {
    enhanceBuildingTables()
  })
}

// Funkcia na vysekanie obrázkov z HTML a vloženie native-card-image elementov nad budovy
function enhanceBuildingTables() {
  document.querySelectorAll('.buildings-body.dash-raw-html').forEach(container => {
    // Každá budova je obvykle v <table>
    const tables = container.querySelectorAll('table')
    tables.forEach(table => {
      // Skontrolujme, či obsahuje triedu pre obrázok budovy
      const originalImage = table.querySelector('.infrastructure-img, .artifact, .base, .observatory, .satellite')
      if (originalImage) {
        const imageClass = originalImage.className
        // Vytvoríme natívny banner
        const banner = document.createElement('div')
        banner.className = `native-card-image ${imageClass}`
        
        // Vložíme nad tabuľku
        table.parentNode.insertBefore(banner, table)
        
        // Skryjeme originál (aby nezavadzal 60x60, ak to neurobil cheerio)
        originalImage.parentNode.style.display = 'none'
      }
    })
  })
}

// Zachytenie formulárov (napr. na stavbu budovy)
function handleFormSubmit(e) {
  const form = e.target.closest('form')
  if (!form) return

  const formData = new FormData(form)
  
  // Zachytíme aj submit tlačidlo
  if (e.submitter && e.submitter.name) {
    formData.append(e.submitter.name, e.submitter.value)
  } else {
    const btn = form.querySelector('input[type="submit"]')
    if (btn && btn.name) formData.append(btn.name, btn.value)
  }

  const method = (form.getAttribute('method') || 'get').toLowerCase()
  const action = form.getAttribute('action') || ''
  const qs = new URLSearchParams(formData).toString()

  if (method === 'post') {
    // Odošli AJAX POST požiadavku cez náš proxy
    axios.post('/api/ajax', {
      action: action,
      data: qs
    }).then(res => {
      showToast('Požiadavka odoslaná', 'success')
      loadData()
    }).catch(err => {
      console.error(err)
      showToast('Chyba pri odosielaní', 'error')
    })
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.buildings-page {
  padding: 10px;
  padding-bottom: 80px;
}

.page-main-title {
  background: rgba(4,190,254,0.15);
  border: 1px solid rgba(4,190,254,0.3);
  border-radius: 6px;
  padding: 12px 15px;
  font-family: Orbitron, sans-serif;
  font-size: 14px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
  text-shadow: 0 0 5px rgba(4,190,254,0.5);
  box-shadow: inset 0 0 10px rgba(4,190,254,0.1);
}

.title-dot {
  width: 8px; height: 8px;
  background: #04befe;
  border-radius: 50%;
  box-shadow: 0 0 8px #04befe;
}

.tooltip-container {
  position: relative;
  display: inline-block;
}

.title-tooltip {
  font-size: 11px;
  color: rgba(4,190,254,0.7);
  cursor: pointer;
  background: rgba(4, 9, 20, 0.8);
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid rgba(4,190,254,0.3);
  transition: all 0.2s;
}

.title-tooltip:hover, .title-tooltip:active {
  background: #04befe;
  color: #000;
}

.custom-tooltip-box {
  position: absolute;
  top: 130%; /* Pod tlačidlom */
  left: 50%;
  transform: translateX(-50%);
  width: 250px;
  background: #111;
  border: 1px solid #444;
  border-radius: 6px;
  padding: 10px;
  font-family: Arial, sans-serif;
  font-size: 12px;
  color: #ddd;
  line-height: 1.4;
  text-align: left;
  z-index: 100;
  box-shadow: 0 4px 15px rgba(0,0,0,0.8);
  text-shadow: none;
}

/* Bublinová šípka nahor */
.custom-tooltip-box::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 10px;
  height: 10px;
  background: #111;
  border-top: 1px solid #444;
  border-left: 1px solid #444;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-5px);
}

.planet-card {
  margin-bottom: 30px;
  background: rgba(4, 9, 20, 0.6);
  border: 1px solid rgba(4,190,254,0.3);
  border-radius: 6px;
  overflow: hidden;
}
.planet-header-box {
  border-bottom: 1px solid rgba(4,190,254,0.2);
}
.planet-title, .buildings-title {
  background: rgba(4,190,254,0.15);
  color: #04befe;
  padding: 8px 12px;
  font-family: Verdana, sans-serif;
  font-size: 13px;
  font-weight: bold;
  text-shadow: 0 0 5px rgba(4,190,254,0.5);
  text-align: center;
}
.buildings-title {
  background: rgba(4,190,254,0.08);
  border-top: 1px solid rgba(4,190,254,0.2);
  border-bottom: 1px solid rgba(4,190,254,0.2);
  color: #a0dfff;
}
.planet-body, .buildings-body {
  padding: 10px;
}

/* Flexbox pre zobrazenie planéty a štatistík vedľa seba */
.planet-body.dash-raw-html {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 15px;
}

.planet-body .native-card-image {
  flex-shrink: 0;
  width: 100px !important;
  height: 100px !important;
  background-size: cover;
  background-position: center;
  border-radius: 50%;
  box-shadow: 0 0 15px rgba(4,190,254,0.6);
  margin: 0;
  transition: all 0.3s;
}

@media (min-width: 600px) {
  .planet-body .native-card-image {
    width: 150px !important;
    height: 150px !important;
  }
}

@media (min-width: 900px) {
  .planet-body .native-card-image {
    width: 200px !important;
    height: 200px !important;
  }
}

/* Priestor pre tabuľku (štatistiky) */
.planet-body > div:not(.native-card-image) {
  flex-grow: 1;
  width: 100%;
  min-width: 0; /* aby flexbox nepretiekol */
}

/* Odlíšenie vzhľadu infoboxu planéty a stavieb */
.buildings-body .native-card-image {
  margin-top: 5px;
  margin-bottom: 15px;
  box-shadow: 0 0 15px rgba(4,190,254,0.5);
  border-radius: 5px; /* pre budovy */
  width: 100%;
  height: 140px;
  background-size: cover;
}

/* Responzívne raw tabuľky */
:deep(.dash-raw-html table) {
  width: 100% !important;
  border-collapse: collapse;
}

:deep(.dash-raw-html table tbody) {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

:deep(.dash-raw-html table tr) {
  display: flex;
  flex-wrap: wrap; /* Aby nepretiekli riadky s 3 stĺpcami */
  justify-content: space-between;
  align-items: center;
  background: rgba(4, 190, 254, 0.05);
  padding: 6px 8px;
  border-radius: 4px;
  border-left: 2px solid rgba(4,190,254,0.3);
}

:deep(.dash-raw-html table td) {
  padding: 0 !important;
  font-family: Verdana, sans-serif;
  font-size: 11px;
  color: #ddd;
  border: none !important;
  background: none !important;
  white-space: normal; /* Aby sa mohol text zalamovať */
}

/* Ak má riadok 3 bunky (zobraziť na mape, Hľadanie surovin, hodnota) */
:deep(.dash-raw-html table tr td:nth-child(1)) {
  flex: 1 1 auto;
}
:deep(.dash-raw-html table tr td:nth-child(2)) {
  flex: 1 1 auto;
  text-align: center;
}
:deep(.dash-raw-html table tr td:nth-child(3)) {
  flex: 1 1 auto;
  text-align: right;
}

:deep(.dash-raw-html table tr:first-child) {
  /* Hlavička tabuľky budov (Budova | Stav) */
  background: rgba(4, 190, 254, 0.15);
  border-left: 2px solid #04befe;
  font-weight: bold;
  color: #04befe;
}

:deep(.dash-raw-html table td:last-child) {
  font-weight: bold;
  text-align: right;
  color: #fff;
}

/* Zarovnanie ikoniek surovín */
:deep(.dash-raw-html i) {
  margin-right: 4px;
  width: 14px;
  text-align: center;
}
</style>
