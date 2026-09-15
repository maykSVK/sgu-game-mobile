<template>
  <div class="dash-page">
    <UniverseNav />
    <div class="dash-content">
      
      <!-- ZOZNAM REPORTOV -->
      <section class="dash-section" v-if="!selectedReport">
        <div class="dash-panel">
          <div class="dash-panel-head" style="justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 7px;">
              <span class="dash-panel-dot"></span> Bitevní reporty
            </div>
            
            <button class="mark-read-btn" @click="markAllAsRead" :disabled="loading">
              Označit vše jako přečtené
            </button>
          </div>
          
          <div class="dash-panel-body" style="padding: 10px;">
            <div v-if="loading && !reports.length" class="loading-box">Načítám reporty...</div>
            
            <div v-else-if="reports.length === 0" class="no-data">
              Zatím nemáte žádné reporty.
            </div>

            <div v-else class="report-list">
              <div v-for="rep in reports" :key="rep.id" 
                   class="report-item" 
                   :class="{'is-new': rep.isNew, 'is-win': rep.resultType === 'win', 'is-loss': rep.resultType === 'loss'}"
                   @click="openReport(rep.id)">
                
                <div class="report-icon">
                  <span v-if="rep.resultType === 'win'">🏆</span>
                  <span v-else>☠️</span>
                </div>
                
                <div class="report-info">
                  <div class="report-top">
                    <span class="report-type">{{ rep.battleType }}</span>
                    <span v-if="rep.isNew" class="badge-new">Nové!</span>
                  </div>
                  <div class="report-result">{{ rep.resultText }}</div>
                  <div class="report-date">{{ rep.date }}</div>
                </div>
                
                <div class="report-arrow">❯</div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      <!-- DETAIL REPORTU -->
      <section class="dash-section" v-else>
        <div class="dash-panel">
          <div class="dash-panel-head">
            <span class="dash-panel-dot"></span> Detail reportu
            <button class="back-btn" @click="selectedReport = null; refresh()">Zpět na seznam</button>
          </div>
          <div class="dash-panel-body detail-container">
            <div v-if="loading" class="loading-box">Načítám detail...</div>
            <div v-else-if="reportDetailHtml" class="report-html-content" v-html="reportDetailHtml"></div>
            <div v-else class="no-data">Detail sa nenašiel.</div>
          </div>
        </div>
      </section>

      <!-- CUSTOM TOAST -->
      <transition name="toast-slide">
        <div v-if="toast.show" class="sgu-toast" :class="'toast-' + toast.type">
          <span class="toast-icon">{{ toast.type === 'success' ? '✅' : '⚠️' }}</span>
          <div class="toast-msg">{{ toast.message }}</div>
        </div>
      </transition>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRoute } from "vue-router"
import axios from "axios"
import { useGameStore } from "../stores/game"
import UniverseNav from "../components/UniverseNav.vue"

const game = useGameStore()
const route = useRoute()

const reports = ref([])
const loading = ref(false)
const selectedReport = ref(null)
const reportDetailHtml = ref("")

const toast = ref({ show: false, message: "", type: "success" })

function showToast(message, type = "success") {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 4000)
}

async function refresh() {
  loading.value = true
  selectedReport.value = null
  reportDetailHtml.value = ""
  try {
    const res = await axios.get("/api/reports")
    if (res.data.data.reports) {
      reports.value = res.data.data.reports
    }
  } catch (e) {
    showToast("Nepodařilo se načíst reporty.", "error")
  } finally {
    loading.value = false
  }
}

async function openReport(id) {
  if (!id) return;
  loading.value = true
  selectedReport.value = id
  reportDetailHtml.value = ""
  try {
    const res = await axios.get("/api/reports?url=report.php?id=" + id)
    if (res.data.data.reportDetail) {
      reportDetailHtml.value = res.data.data.reportDetail.html
    }
    // Refresh stats (which includes the new report flag in the left menu)
    game.fetchDashboard(true)
  } catch (e) {
    showToast("Nepodařilo se načíst detail reportu.", "error")
    selectedReport.value = null
  } finally {
    loading.value = false
  }
}

async function markAllAsRead() {
  loading.value = true
  try {
    await axios.get("/api/reports?action=readAll")
    showToast("Všechny reporty byly označeny jako přečtené.")
    // Refresh stats (which includes the new report flag in the left menu)
    await game.fetchDashboard(true)
    await refresh()
  } catch (e) {
    showToast("Chyba při označování.", "error")
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (route.query.id) {
    openReport(route.query.id);
  } else {
    refresh();
  }
})
</script>

<style scoped>
.dash-page {
  min-height: calc(100vh - 44px);
  padding-bottom: 72px;
  position: relative;
  z-index: 1;
}
.dash-content { padding: 10px; }
.dash-section { margin-bottom: 10px; }

/* ── Panel ── */
.dash-panel {
  background: rgba(4,190,254,0.09);
  border: 1px solid rgba(4,190,254,0.4);
  border-radius: 2px;
  position: relative;
}
.dash-panel-head {
  background: rgba(4,190,254,0.22);
  border-bottom: 1px solid rgba(4,190,254,0.35);
  padding: 7px 10px;
  font-family: Verdana, sans-serif;
  font-size: 12px;
  font-weight: bold;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 7px;
}
.dash-panel-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #04befe;
  box-shadow: 0 0 6px #04befe;
  animation: dotPulse 2s ease-in-out infinite;
}
@keyframes dotPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

/* ── Tlačítka ── */
.mark-read-btn {
  background: rgba(4,190,254,0.2);
  border: 1px solid #04befe;
  color: #04befe;
  padding: 4px 8px;
  font-size: 10px;
  border-radius: 2px;
  cursor: pointer;
  text-transform: uppercase;
}
.mark-read-btn:active { background: #04befe; color: #000; }

.back-btn {
  margin-left: auto;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.4);
  color: #fff;
  padding: 4px 8px;
  font-size: 10px;
  border-radius: 2px;
  cursor: pointer;
}

/* ── Zoznam Reportov ── */
.report-list { display: flex; flex-direction: column; gap: 8px; }
.report-item {
  display: flex; align-items: center; gap: 12px;
  background: rgba(0,0,0,0.5);
  border: 1px solid rgba(4,190,254,0.2);
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
}
.report-item.is-new {
  border-color: #04befe;
  background: rgba(4,190,254,0.1);
  box-shadow: 0 0 8px rgba(4,190,254,0.3) inset;
}
.report-item:active { transform: scale(0.98); }

.report-icon { font-size: 24px; }

.report-info { flex: 1; display: flex; flex-direction: column; gap: 3px; }
.report-top { display: flex; align-items: center; gap: 8px; }
.report-type { font-weight: bold; color: #fff; font-size: 14px; }
.badge-new {
  background: #04befe; color: #000;
  font-size: 9px; font-weight: bold;
  padding: 2px 5px; border-radius: 2px;
  text-transform: uppercase;
  animation: blink 1.5s infinite;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.5} }

.report-result { font-size: 13px; font-weight: bold; }
.is-win .report-result { color: #59d34c; }
.is-loss .report-result { color: #ff3c3c; }

.report-date { font-size: 10px; color: rgba(255,255,255,0.6); }

.report-arrow { color: rgba(4,190,254,0.5); font-size: 18px; }

.loading-box { text-align: center; color: rgba(4,190,254,0.8); padding: 20px; font-style: italic; }
.no-data { text-align: center; color: rgba(255,255,255,0.5); padding: 20px; }

/* ── HTML Render (Pôvodný HTML detailu reportu upravený do nášho štýlu) ── */
.detail-container {
  padding: 15px;
  overflow-x: auto;
}
.report-html-content {
  color: #fff;
  font-size: 12px;
}
.report-html-content :deep(table) {
  width: 100%; border-collapse: collapse; margin-bottom: 15px;
}
.report-html-content :deep(th) {
  background: rgba(4,190,254,0.2);
  color: #04befe;
  padding: 6px;
  border: 1px solid rgba(4,190,254,0.3);
  text-align: left;
}
.report-html-content :deep(td) {
  padding: 6px;
  border: 1px solid rgba(4,190,254,0.2);
}
.report-html-content :deep(.success) { color: #59d34c; }
.report-html-content :deep(.failed), .report-html-content :deep(.error) { color: #ff3c3c; }
.report-html-content :deep(.bold) { font-weight: bold; }

/* Toast */
.sgu-toast {
  position: fixed; top: 60px; left: 50%; transform: translateX(-50%);
  background: rgba(10,20,35,0.95); border: 1px solid #04befe;
  padding: 12px 20px; border-radius: 4px; z-index: 100;
  display: flex; align-items: center; gap: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.8);
  font-family: Orbitron, sans-serif; font-size: 13px;
  backdrop-filter: blur(4px); min-width: 250px;
}
.toast-success { border-color: #59d34c; }
.toast-success .toast-icon { color: #59d34c; }
.toast-error { border-color: #ff3c3c; }
.toast-error .toast-icon { color: #ff3c3c; }
.toast-msg { color: #fff; font-weight: bold; }
.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.3s ease; }
.toast-slide-enter-from { transform: translate(-50%, -20px); opacity: 0; }
.toast-slide-leave-to { transform: translate(-50%, -20px); opacity: 0; }
</style>
