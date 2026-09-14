<template>
  <div>
    <StarField />
    <div class="sgu-scanlines" />

    <div class="dash-page">
      <DashboardNav />

      <div class="dash-content">
        
        <div v-if="loading && !progressData" class="loading-box">
          Načítám postup ve hře...
        </div>

        <template v-else-if="progressData">
          
          <div class="dash-section">
            <div class="dash-panel">
              
              <!-- LUXURY HEADER PROGRESS BAR -->
              <div class="dash-panel-head progress-header">
                <div class="progress-header-title">
                  <span class="dash-panel-dot"></span> POSTUP VE HŘE
                </div>
                <div class="progress-header-bar-bg">
                  <div class="progress-header-bar-fill" :style="{ width: progressPercentage + '%' }"></div>
                  <div class="progress-header-text">{{ progressPercentage }}% DOKONČENO</div>
                </div>
              </div>
              
              <div class="dash-panel-body">
                <div class="progress-grid">
                  <div v-for="(mission, index) in progressData.missions" :key="index" class="mission-card">
                    <div class="mission-title">{{ mission.title }}</div>
                    <div class="mission-desc dash-raw-html" v-html="mission.description"></div>
                    <div class="mission-status dash-raw-html" v-html="mission.status"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </template>
        
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
import { onMounted, ref, computed } from "vue"
import axios from "axios"
import StarField from "../components/StarField.vue"
import DashboardNav from "../components/DashboardNav.vue"

const loading = ref(true)
const progressData = ref(null)

const progressPercentage = computed(() => {
  if (!progressData.value?.progressBarHtml) return 0;
  const match = progressData.value.progressBarHtml.match(/width:\s*(\d+)%/);
  return match ? parseInt(match[1]) : 0;
})

const toast = ref({ show: false, message: "", type: "success" })

function showToast(msg, type="success") {
  toast.value = { show: true, message: msg, type }
  setTimeout(() => toast.value.show = false, 3000)
}

async function loadData() {
  loading.value = true
  try {
    const res = await axios.get("/api/progress")
    if (res.data.ok) {
      progressData.value = res.data.data
    }
  } catch (e) {
    console.error(e)
    showToast("Nepodařilo se načíst postup ve hře.", "error")
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

.dash-panel {
  background: rgba(4,190,254,0.05);
  border: 1px solid rgba(4,190,254,0.3);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}
.dash-panel-head {
  background: rgba(4,190,254,0.15);
  border-bottom: 1px solid rgba(4,190,254,0.3);
}

.progress-header {
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
}

.progress-header-title {
  padding: 10px 15px;
  font-family: Orbitron, sans-serif;
  font-size: 14px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0,0,0,0.4);
  z-index: 2;
}

.progress-header-bar-bg {
  position: relative;
  height: 28px;
  background: rgba(0,0,0,0.6);
  border-top: 1px solid rgba(4,190,254,0.3);
  overflow: hidden;
}

.progress-header-bar-fill {
  position: absolute;
  top: 0; left: 0; bottom: 0;
  background: linear-gradient(90deg, rgba(4,190,254,0.3) 0%, rgba(4,190,254,0.8) 100%);
  box-shadow: 0 0 10px rgba(4,190,254,0.5);
  transition: width 1s ease-out;
}

.progress-header-text {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Orbitron, sans-serif;
  font-weight: bold;
  font-size: 13px;
  color: #fff;
  text-shadow: 1px 1px 2px #000;
  z-index: 1;
}

.dash-panel-dot {
  width: 6px; height: 6px;
  background: #04befe;
  box-shadow: 0 0 5px #04befe;
  transform: rotate(45deg);
}
.dash-panel-body {
  padding: 15px;
  background: rgba(0,0,0,0.4);
  color: #ddd;
}

/* PROGRESS GRID */
.progress-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}
@media (max-width: 900px) {
  .progress-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 600px) {
  .progress-grid {
    grid-template-columns: 1fr;
  }
}

.mission-card {
  background: rgba(4,190,254,0.03);
  border: 1px solid rgba(4,190,254,0.2);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
}
.mission-title {
  background: rgba(4,190,254,0.1);
  color: #04befe;
  padding: 10px;
  font-weight: bold;
  font-size: 13px;
  border-bottom: 1px solid rgba(4,190,254,0.2);
  display: flex;
  align-items: center;
}
.mission-desc {
  padding: 10px;
  font-size: 12px;
  line-height: 1.4;
  flex-grow: 1;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.mission-status {
  padding: 10px;
  font-size: 12px;
  background: rgba(0,0,0,0.2);
}

.progress-bar-container {
  padding: 15px;
  background: rgba(4,190,254,0.05);
  border: 1px solid rgba(4,190,254,0.2);
  border-radius: 4px;
}

/* RAW HTML overrides inside descriptions and statuses */
.dash-raw-html :deep(.success) { color: #59d34c; font-weight: bold; }
.dash-raw-html :deep(.failed) { color: #ff3c3c; font-weight: bold; }
.dash-raw-html :deep(.delimiter) {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed rgba(255,255,255,0.1);
}

.dash-raw-html :deep(.number-circle) {
  display: inline-block;
  width: 20px;
  height: 20px;
  line-height: 18px;
  border-radius: 50%;
  border: 1px solid #04befe;
  text-align: center;
  margin-right: 5px;
  color: #04befe;
}

/* Progress bar styling */
.dash-raw-html :deep(.progress) {
  height: 24px;
  background-color: rgba(0,0,0,0.6);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(4,190,254,0.4);
}
.dash-raw-html :deep(.progress-bar) {
  height: 100%;
  background-color: #04befe;
  color: #fff;
  text-align: center;
  line-height: 24px;
  font-size: 12px;
  font-weight: bold;
  transition: width 0.6s ease;
  box-shadow: inset 0 0 10px rgba(255,255,255,0.2);
}
</style>
