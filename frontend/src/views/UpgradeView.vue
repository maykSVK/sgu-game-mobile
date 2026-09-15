<template>
  <div class="upgrade-page">
    <UpgradesNav />
    
    <div v-if="loading" class="sgu-loading">
      <i class="fas fa-circle-notch fa-spin"></i> Načítavam dáta...
    </div>
    
    <div v-else-if="upgradeData" class="upgrade-content">
      
      <!-- Jednotná hlavička ako všade inde -->
      <div class="page-main-title">
        <span class="title-dot"></span>
        {{ upgradeData.title }}
      </div>

      <!-- Spoločný kontajner pre obrázok a zoznam -->
      <div class="planet-card">
        
        <!-- Levý stĺpec: Obrázok -->
        <div class="planet-image-col">
          <img class="native-card-image" :src="getImageUrl(imageFile)" alt="Upgrade" />
          
          <div class="upgrade-current-level">
            Současná úroveň:<br><span>{{ upgradeData.currentLevel }}</span>
          </div>
        </div>

        <!-- Pravý stĺpec: Zoznam úrovní (riadky) -->
        <div class="planet-details">
          <div class="upgrade-levels-list">
            <div v-for="(lvl, index) in upgradeData.levels" :key="index" 
                 class="level-row" 
                 :class="{ 'level-available': lvl.formHtml, 'level-completed': !lvl.formHtml && isCompleted(lvl.level) }">
              
              <div class="level-row-main">
                <div class="level-badge">{{ lvl.level.toUpperCase() }}</div>
                <div class="level-effect dash-raw-html" v-html="lvl.effectHtml"></div>
              </div>
              
              <div class="level-row-details">
                <div class="level-req dash-raw-html">
                  <span class="label">Požadováno:</span> <span v-html="lvl.reqHtml"></span>
                </div>
                <div class="level-price dash-raw-html">
                  <span class="label">Cena:</span> <span v-html="lvl.priceHtml"></span>
                </div>
              </div>
              
              <!-- Formulár -->
              <div v-if="lvl.formHtml" class="level-action dash-raw-html" 
                   v-html="lvl.formHtml" 
                   @click="handleAction">
              </div>
            </div>
          </div>
        </div>
        
      </div>
      
      <!-- Lore text -->
      <div v-if="upgradeData.loreHtml" class="upgrade-lore dash-raw-html" v-html="upgradeData.loreHtml"></div>

    </div>
    
    <!-- TOAST -->
    <div v-if="toast.show" class="sgu-toast" :class="toast.type">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import UpgradesNav from '../components/UpgradesNav.vue'

const route = useRoute()
const loading = ref(true)
const upgradeData = ref(null)
const toast = ref({ show: false, message: "", type: "success" })

const SUBVIEW_MAP = {
  'weapons': 'weapon_system',
  'neural': 'neural_armchair',
  'co2': 'filters',
  'ftl': 'ftl',
  'storage': 'resources',
  'shields': 'shields',
  'stasis': 'chambers',
  'engines': 'sublight'
}

const imageFile = computed(() => {
  if (!upgradeData.value || !upgradeData.value.imageClass) return 'upgrade-weapons.png'
  const c = upgradeData.value.imageClass
  return c === 'upgrade-weapons' ? `${c}.png` : `${c}.jpg`
})

// Pomocná funkcia pre vygenerovanie cesty k obrázku
function getImageUrl(name) {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}img/${name}`
}

function isCompleted(lvlString) {
  if (!upgradeData.value) return false;
  const lvl = parseInt(lvlString.replace(/[^\d]/g, '')) || 0;
  const current = parseInt(upgradeData.value.currentLevel.replace(/[^\d]/g, '')) || 0;
  return lvl <= current;
}

function showToast(msg, type="success") {
  toast.value = { show: true, message: msg, type }
  setTimeout(() => toast.value.show = false, 3000)
}

async function loadData() {
  loading.value = true
  const viewId = route.params.subview
  const subview = SUBVIEW_MAP[viewId] || viewId
  
  try {
    const res = await axios.get(`/api/upgrades/${subview}`)
    upgradeData.value = res.data.data
    
    if (res.data.data.messages && res.data.data.messages.length > 0) {
      showToast(res.data.data.messages[0].text, res.data.data.messages[0].type)
    }
  } catch (e) {
    console.error('Upgrade load error:', e)
    showToast('Chyba pri načítaní dát.', 'error')
  }
  loading.value = false
}

async function handleAction(e) {
  const form = e.target.closest('form')
  if (form) {
    e.preventDefault()
    
    const formData = new FormData(form)
    const obj = {}
    
    const submitBtn = form.querySelector('input[type="submit"]')
    if (submitBtn && submitBtn.name) {
      obj[submitBtn.name] = submitBtn.value
    }
    
    formData.forEach((value, key) => obj[key] = value)
    
    loading.value = true
    const viewId = route.params.subview
    const subview = SUBVIEW_MAP[viewId] || viewId
    
    try {
      const res = await axios.post(`/api/upgrades/${subview}`, obj)
      upgradeData.value = res.data.data
      
      if (res.data.data.messages && res.data.data.messages.length > 0) {
        showToast(res.data.data.messages[0].text, res.data.data.messages[0].type)
      }
    } catch (err) {
      console.error(err)
      showToast('Chyba pri odoslaní.', 'error')
    }
    loading.value = false
  }
}

watch(() => route.params.subview, (newVal, oldVal) => {
  if (newVal && newVal !== oldVal) loadData()
})

onMounted(() => loadData())
</script>

<style scoped>
.upgrade-page {
  padding: 10px;
  padding-bottom: 80px;
}
.upgrade-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* === Hlavička ako všade inde === */
.page-main-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: Orbitron, sans-serif;
  font-size: 14px;
  color: #fff;
  text-transform: uppercase;
  margin-top: 10px;
  margin-bottom: 10px;
  padding: 0 10px;
}
.title-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #04befe;
  box-shadow: 0 0 10px #04befe;
}

/* === Hlavný kontajner (ako planéty) === */
.planet-card {
  display: flex;
  flex-direction: column;
  background: rgba(4, 9, 20, 0.7);
  border: 1px solid rgba(4, 190, 254, 0.2);
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.5);
}
@media (min-width: 768px) {
  .planet-card {
    flex-direction: row;
  }
}

/* === Ľavý stĺpec (Obrázok) === */
.planet-image-col {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  background: rgba(0,0,0,0.3);
  border-bottom: 1px solid rgba(4, 190, 254, 0.2);
}
@media (min-width: 768px) {
  .planet-image-col {
    width: 250px;
    border-bottom: none;
    border-right: 1px solid rgba(4, 190, 254, 0.2);
  }
}

.native-card-image {
  width: 120px;
  height: 120px;
  border-radius: 6px;
  background-size: cover;
  background-position: center;
  box-shadow: 0 0 20px rgba(4,190,254,0.6);
  border: 2px solid rgba(4,190,254,0.4);
  background-color: #000;
}
@media (min-width: 768px) {
  .native-card-image {
    width: 180px;
    height: 180px;
  }
}

.upgrade-current-level {
  font-family: Verdana, sans-serif;
  font-size: 14px;
  color: #aaa;
  text-align: center;
}
.upgrade-current-level span {
  color: #04befe;
  font-weight: bold;
  text-transform: uppercase;
  display: block;
  margin-top: 5px;
}

/* === Pravý stĺpec (Detaily/Levely) === */
.planet-details {
  flex: 1;
  padding: 0;
}
.upgrade-levels-list {
  display: flex;
  flex-direction: column;
}

.level-row {
  display: flex;
  flex-direction: column;
  padding: 15px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  background: rgba(255,255,255,0.01);
  transition: all 0.3s;
}
.level-row:last-child {
  border-bottom: none;
}
@media (min-width: 768px) {
  .level-row {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 15px 20px;
  }
}

/* Dokončený vs dostupný level */
.level-completed {
  border-left: 4px solid #59d34c;
  opacity: 0.8;
}
.level-available {
  background: rgba(4,190,254,0.05);
  border-left: 4px solid #04befe;
}

/* Hlavné info o leveli */
.level-row-main {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}
@media (min-width: 768px) {
  .level-row-main {
    margin-bottom: 0;
    min-width: 200px;
  }
}

.level-badge {
  background: rgba(0,0,0,0.5);
  padding: 5px 12px;
  border-radius: 4px;
  font-family: Orbitron, sans-serif;
  font-size: 12px;
  color: #fff;
  border: 1px solid rgba(255,255,255,0.2);
  white-space: nowrap;
}
.level-available .level-badge {
  background: rgba(4,190,254,0.2);
  border-color: #04befe;
  color: #04befe;
}
.level-completed .level-badge {
  background: rgba(89, 211, 76, 0.1);
  border-color: #59d34c;
  color: #59d34c;
}

.level-effect {
  font-family: Verdana, sans-serif;
  font-size: 14px;
  color: #ddd;
  font-weight: bold;
}

/* Cena a požiadavky */
.level-row-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}
@media (min-width: 768px) {
  .level-row-details {
    align-items: flex-end;
    margin-right: 20px;
  }
}

.level-req, .level-price {
  font-family: Verdana, sans-serif;
  font-size: 12px;
  color: #aaa;
  display: flex;
  align-items: center;
  gap: 8px;
}
.level-req .label, .level-price .label {
  color: #777;
}

:deep(.level-price i.credits) {
  color: #04befe;
}

/* Formulár */
.level-action {
  margin-top: 15px;
}
@media (min-width: 768px) {
  .level-action {
    margin-top: 0;
    min-width: 150px;
  }
}

:deep(.level-action form) {
  display: block;
}
:deep(.level-action input[type="submit"]) {
  width: 100%;
  background: rgba(4,190,254,0.2);
  border: 1px solid #04befe;
  color: #04befe;
  padding: 10px;
  border-radius: 4px;
  font-family: Orbitron, sans-serif;
  font-size: 13px;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
}
:deep(.level-action input[type="submit"]:hover) {
  background: #04befe;
  color: #000;
  box-shadow: 0 0 10px #04befe;
}

/* === Lore text === */
.upgrade-lore {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(4, 190, 254, 0.2);
  border-radius: 6px;
  padding: 15px;
  font-family: Verdana, sans-serif;
  font-size: 13px;
  color: #999;
  line-height: 1.6;
  text-align: justify;
}
</style>
