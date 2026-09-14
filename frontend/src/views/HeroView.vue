<template>
  <div>
    <StarField />
    <div class="sgu-scanlines" />

    <div class="dash-page">
      <DashboardNav />

      <div class="dash-content">
        
        <div v-if="loading && !heroData" class="loading-box">
          Načítám hrdiny...
        </div>

        <template v-else-if="heroData">
          
          <div class="dash-grid">
            <section v-for="(hero, index) in heroData.heroes" :key="index" class="dash-section">
              <div class="dash-panel">
                <div class="dash-panel-head">
                  <span class="dash-panel-dot"></span> {{ hero.title.toUpperCase() }}
                </div>
                
                <div class="dash-panel-body dash-raw-html" v-html="fixHtml(hero.html)" @click="handleLinks" @submit.prevent="(e) => handleFormSubmit(e, hero.nextHeroId)">
                </div>
              </div>
            </section>
          </div>

        </template>
        
        <!-- TOOLTIP MODAL PRO MOBILY -->
        <div v-if="tooltipModalHtml" class="sgu-modal-overlay" @click.self="tooltipModalHtml = null">
          <div class="sgu-modal">
            <div class="sgu-modal-close" @click="tooltipModalHtml = null"><i class="fas fa-times"></i></div>
            <div class="dash-raw-html" v-html="tooltipModalHtml"></div>
          </div>
        </div>

        <!-- TOAST -->
        <div v-if="toast.show" class="sgu-toast" :class="toast.type">
          <i class="fas" :class="toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'"></i>
          {{ toast.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue"
import axios from "axios"
import StarField from "../components/StarField.vue"
import DashboardNav from "../components/DashboardNav.vue"

const loading = ref(true)
const heroData = ref(null)

const tooltipModalHtml = ref(null)
const toast = ref({ show: false, message: "", type: "success" })

function showToast(msg, type="success") {
  toast.value = { show: true, message: msg, type }
  setTimeout(() => toast.value.show = false, 3000)
}

function handleMessages(msgs) {
  if (msgs && msgs.length > 0) {
    showToast(msgs[0].text, msgs[0].type)
  }
}

function fixHtml(html) {
  if (!html) return ""
  let res = html.replace(/src="([^"]+)"/g, (match, p1) => {
    if (p1.startsWith("http")) return match
    if (p1.startsWith("/")) return `src="/sgu-game-mobile${p1}"`
    return `src="/sgu-game-mobile/${p1}"`
  })
  return res
}

function handleLinks(e) {
  // Handle sgu-tooltip clicks
  const tooltipElement = e.target.closest(".sgu-tooltip")
  if (tooltipElement && tooltipElement.dataset.sguTooltip) {
    e.preventDefault()
    e.stopPropagation()
    tooltipModalHtml.value = fixHtml(tooltipElement.dataset.sguTooltip)
    return
  }
}

async function handleFormSubmit(e, nextHeroId) {
  if (!nextHeroId) return
  
  loading.value = true
  tooltipModalHtml.value = null
  try {
    const formData = {
      next_hero: nextHeroId,
      set_next_hero: 'Použít pro příští Sezonu'
    }
    const res = await axios.post("/api/hero/action", formData)
    if (res.data.ok) {
      heroData.value = res.data.data
      handleMessages(res.data.data.messages)
    }
  } catch (err) {
    console.error(err)
    showToast("Nepodařilo se zvolit hrdinu.", "error")
  } finally {
    loading.value = false
  }
}

async function loadData() {
  loading.value = true
  try {
    const res = await axios.get("/api/hero")
    if (res.data.ok) {
      heroData.value = res.data.data
      handleMessages(res.data.data.messages)
    }
  } catch (e) {
    console.error(e)
    showToast("Nepodařilo se načíst hrdiny.", "error")
  }
  loading.value = false
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.dash-page {
  min-height: calc(100vh - 44px);
  padding-bottom: 72px;
  position: relative;
  z-index: 1;
}
.dash-content { padding: 15px; }

.dash-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 15px;
  align-items: stretch;
}

.dash-section {
  display: flex;
  flex-direction: column;
}

.dash-panel {
  background: rgba(4,190,254,0.05);
  border: 1px solid rgba(4,190,254,0.3);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
.dash-panel-head {
  background: rgba(4,190,254,0.15);
  border-bottom: 1px solid rgba(4,190,254,0.3);
  padding: 8px 12px;
  font-family: Orbitron, sans-serif;
  font-size: 13px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
}
.dash-panel-dot {
  width: 6px; height: 6px;
  background: #04befe;
  box-shadow: 0 0 5px #04befe;
  transform: rotate(45deg);
}
.dash-panel-body {
  padding: 12px;
  background: rgba(0,0,0,0.4);
  font-size: 12px;
  color: #ddd;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

/* ── STYLING RAW HTML IN DASHBOARD ── */
.dash-raw-html {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.dash-raw-html :deep(table) {
  width: 100%;
  border-collapse: collapse;
  flex-grow: 1;
}
.dash-raw-html :deep(tbody) {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.dash-raw-html :deep(tr:last-child) {
  margin-top: auto; /* push buttons/status to bottom */
}
.dash-raw-html :deep(th) {
  background: rgba(4,190,254,0.1);
  color: #04befe;
  padding: 8px;
  border-bottom: 1px solid rgba(4,190,254,0.2);
  text-align: center;
  font-size: 13px;
}
.dash-raw-html :deep(td) {
  padding: 8px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  vertical-align: top;
}
.dash-raw-html :deep(.success) { color: #59d34c; font-weight: bold; }
.dash-raw-html :deep(.bold) { font-weight: bold; }
.dash-raw-html :deep(img) {
  border-radius: 4px;
  border: 1px solid rgba(4,190,254,0.3);
  margin-bottom: 8px;
  display: block;
}

.dash-raw-html :deep(.btn-bevel), .dash-raw-html :deep(.btn-bevel-sm) {
  background: rgba(4,190,254,0.15);
  border: 1px solid #04befe;
  color: #fff;
  padding: 10px 12px;
  font-size: 12px;
  cursor: pointer;
  border-radius: 2px;
  width: 100%;
  text-transform: uppercase;
  font-weight: bold;
}
.dash-raw-html :deep(.btn-bevel:hover) {
  background: rgba(4,190,254,0.3);
  box-shadow: 0 0 10px rgba(4,190,254,0.3);
}

.dash-raw-html :deep(.sgu-tooltip) {
  color: #04befe;
  cursor: help;
  border-bottom: 1px dotted #04befe;
}

/* FontAwesome Icons colors */
.dash-raw-html :deep(.research-points) { color: #04befe; }
.dash-raw-html :deep(.credits) { color: #f0f0f0; }

/* ── MODAL ── */
.sgu-modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  padding: 15px;
}
.sgu-modal {
  background: #0a1628;
  border: 1px solid #04befe;
  padding: 20px;
  border-radius: 4px;
  max-width: 500px;
  width: 100%;
  position: relative;
  color: #fff;
  font-size: 13px;
  line-height: 1.5;
  box-shadow: 0 0 20px rgba(4,190,254,0.2);
}
.sgu-modal-close {
  position: absolute;
  top: 10px; right: 10px;
  color: #04befe;
  cursor: pointer;
  font-size: 18px;
}
</style>
