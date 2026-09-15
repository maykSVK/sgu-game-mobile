<template>
  <div class="artifacts-page">
    <UniverseNav />
    
    <div v-if="artifactsData" class="page-main-title">
      <span class="title-dot"></span>
      Naše artefakty ({{ artifactsData.artifacts.length }})
      <div class="tooltip-container">
        <span class="title-tooltip" @click="showTooltip = !showTooltip">[?]</span>
        <transition name="fade">
          <div v-if="showTooltip" class="custom-tooltip-box" @click="showTooltip = false">
            Zoznam všetkých aktívnych artefaktov tvojho impéria a ich účinky.
          </div>
        </transition>
      </div>
    </div>
    
    <div v-if="loading" class="sgu-loading">
      <i class="fas fa-circle-notch fa-spin"></i> Načítavam artefakty...
    </div>
    
    <div v-else-if="artifactsData && artifactsData.artifacts" class="artifacts-grid">
      <div v-for="(artifact, index) in artifactsData.artifacts" :key="index" class="artifact-card">
        
        <!-- Hlavička artefaktu -->
        <div class="artifact-header-box">
          <div class="artifact-title">{{ artifact.title }}</div>
          
          <div class="artifact-body dash-raw-html">
            <!-- Native Artifact Image -->
            <div v-if="artifact.imageClass" class="native-card-image" :class="artifact.imageClass"></div>
            <!-- Zvyšok HTML -->
            <div v-html="artifact.html"></div>
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import UniverseNav from '../components/UniverseNav.vue'

const loading = ref(true)
const artifactsData = ref(null)
const toast = ref({ show: false, message: "", type: "success" })
const showTooltip = ref(false)

function showToast(msg, type="success") {
  toast.value = { show: true, message: msg, type }
  setTimeout(() => toast.value.show = false, 3000)
}

async function loadData() {
  loading.value = true
  try {
    const res = await axios.get('/api/artifacts')
    artifactsData.value = res.data.data
  } catch (e) {
    console.error('Artifacts load error:', e)
    showToast('Nepodarilo sa načítať artefakty.', 'error')
  }
  loading.value = false
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.artifacts-page {
  padding: 10px;
  padding-bottom: 80px;
}

/* === Title styling (same as BuildingsView) === */
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
  top: 130%;
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
}
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

/* === Grid Layout === */
.artifacts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
}

@media (min-width: 600px) {
  .artifacts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {
  .artifacts-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .artifacts-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.artifact-card {
  background: rgba(4, 9, 20, 0.6);
  border: 1px solid rgba(4,190,254,0.3);
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.artifact-title {
  background: rgba(4,190,254,0.15);
  color: #04befe;
  padding: 8px 12px;
  font-family: Verdana, sans-serif;
  font-size: 13px;
  font-weight: bold;
  text-shadow: 0 0 5px rgba(4,190,254,0.5);
  text-align: center;
  border-bottom: 1px solid rgba(4,190,254,0.2);
}

.artifact-body {
  padding: 10px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

/* Odlíšenie vzhľadu obrázku artefaktu */
:deep(.native-card-image) {
  margin: 10px auto 20px auto;
  border-radius: 5px;
  width: 120px;
  height: 120px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  box-shadow: 0 0 15px rgba(4,190,254,0.3);
}

/* Responzívne raw tabuľky pre efekty artefaktov */
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
  flex-direction: column; /* Stacking pre úzke bunky mriežky */
  justify-content: center;
  align-items: center;
  background: rgba(4, 190, 254, 0.05);
  padding: 8px 10px;
  border-radius: 4px;
  border-top: 2px solid rgba(4,190,254,0.3); /* Top highlight namiesto left */
  text-align: center;
}

:deep(.dash-raw-html table td) {
  padding: 0 !important;
  font-family: Verdana, sans-serif;
  font-size: 12px;
  color: #ddd;
  border: none !important;
  background: none !important;
  white-space: normal;
}
</style>
