<template>
  <div>
    <StarField />
    <div class="sgu-scanlines" />

    <div class="dash-page">
      <UniverseNav />

      <div class="dash-content">
        
        <div v-if="loading && !expeditionData" class="loading-box">
          Nacítám expedice...
        </div>

        <!-- GRID PRO INFOBOXY -->
        <div v-else-if="expeditionData?.infoboxes" class="dash-grid">
          <section v-for="(box, i) in expeditionData.infoboxes" :key="i" class="dash-section">
            <div class="dash-panel">
              <div class="dash-panel-head">
                <span class="dash-panel-dot"></span> {{ box.title }}
              </div>
              <!-- Vložíme raw HTML s opravenými cestami -->
              <div class="dash-panel-body dash-raw-html" v-html="fixHtml(box.html)" @click="handleLinks" @submit.prevent="handleFormSubmit">
              </div>
            </div>
          </section>
        </div>
        
        <!-- TOOLTIP MODAL PRO MOBILY -->
        <div v-if="tooltipModalHtml" class="sgu-modal-overlay" @click.self="tooltipModalHtml = null">
          <div class="sgu-modal">
            <div class="sgu-modal-close" @click="tooltipModalHtml = null"><i class="fas fa-times"></i></div>
            <div class="dash-raw-html" v-html="tooltipModalHtml" @click="handleLinks" @submit.prevent="handleFormSubmit"></div>
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
import { useRouter } from "vue-router"
import axios from "axios"
import StarField from "../components/StarField.vue"
import UniverseNav from "../components/UniverseNav.vue"

const router = useRouter()
const loading = ref(true)
const expeditionData = ref(null)

// Modal state pre tooltpy
const tooltipModalHtml = ref(null)

const toast = ref({ show: false, message: "", type: "success" })

function showToast(msg, type="success") {
  toast.value = { show: true, message: msg, type }
  setTimeout(() => toast.value.show = false, 3000)
}

async function loadData() {
  loading.value = true
  try {
    const res = await axios.get("/api/expedition")
    if (res.data.ok) {
      expeditionData.value = res.data.data
      if (res.data.data.messages && res.data.data.messages.length > 0) {
        showToast(res.data.data.messages[0].text, res.data.data.messages[0].type)
      }
    } else {
      console.error(res.data.error)
    }
  } catch(e) {
    console.error("Chyba:", e)
  }
  loading.value = false
}

// Opraví cesty k obrázkom v raw HTML
function fixHtml(html) {
  if (!html) return ""
  let res = html.replace(/src="([^"]+)"/g, (match, p1) => {
    if (p1.startsWith("http")) return match
    if (p1.startsWith("/")) return `src="https://sgu-game.cz${p1}"`
    return `src="https://sgu-game.cz/${p1}"`
  })
  res = res.replace(/url\((['"]?)([^'")]+)(['"]?)\)/g, (match, q1, p2, q2) => {
    if (p2.startsWith("http") || p2.startsWith("data:")) return match
    if (p2.startsWith("../")) return `url(${q1}https://sgu-game.cz/${p2.substring(3)}${q2})`
    if (p2.startsWith("/")) return `url(${q1}https://sgu-game.cz${p2}${q2})`
    return `url(${q1}https://sgu-game.cz/${p2}${q2})`
  })
  return res
}

// Intercept form submissions inside raw HTML
async function submitExpeditionAction(data) {
  loading.value = true
  tooltipModalHtml.value = null // Close modal on action
  try {
    const res = await axios.post("/api/expedition", data)
    expeditionData.value = res.data.data
    if (res.data.data.messages && res.data.data.messages.length > 0) {
      showToast(res.data.data.messages[0].text, res.data.data.messages[0].type)
    }
  } catch(e) {
    console.error(e)
    showToast("Nastala chyba pri akci.", "error")
  } finally {
    loading.value = false
  }
}

// Intercept clicks on links and forms inside raw HTML
function handleFormSubmit(e) {
  const form = e.target
  const formData = new FormData(form)
  // Because submit event doesn't tell us WHICH submit button was clicked natively if we just use FormData,
  // we actually need the submitter. But modern browsers support e.submitter!
  if (e.submitter && e.submitter.name) {
    formData.append(e.submitter.name, e.submitter.value)
  } else if (form.querySelector('input[type="submit"]')) {
    // Fallback if e.submitter is missing
    const btn = form.querySelector('input[type="submit"]')
    if (btn.name) formData.append(btn.name, btn.value)
  }

  const obj = {}
  formData.forEach((value, key) => obj[key] = value)
  submitExpeditionAction(obj)
}

function handleLinks(e) {
  // Handle sgu-tooltip clicks (on mobile, we show them as modal)
  const tooltipElement = e.target.closest(".sgu-tooltip")
  if (tooltipElement && tooltipElement.dataset.sguTooltip) {
    e.preventDefault()
    e.stopPropagation()
    tooltipModalHtml.value = fixHtml(tooltipElement.dataset.sguTooltip)
    return
  }

  // Handle links
  const a = e.target.closest("a")
  if (a) {
    const href = a.getAttribute("href")
    if (href && href.startsWith("/")) {
      e.preventDefault()
      
      if (href.includes("reports.php")) router.push("/reports")
      else if (href.includes("research.php")) router.push("/research")
      else if (href.includes("stargate.php")) router.push("/stargate")
      else if (href.includes("universe.php")) router.push("/universe")
      else if (href.includes("upgrade.php")) router.push("/upgrades")
      else if (href.includes("destiny.php")) router.push("/destiny")
      else if (href.includes("dashboard.php")) router.push("/")
      else if (href.includes("crew.php")) router.push("/crew")
      else if (href.includes("checksums.php")) router.push("/checksums")
      else if (href.includes("hero.php")) router.push("/hero")
      else if (href.includes("progress.php")) router.push("/progress")
      else if (href.includes("note.php")) router.push("/notes")
      else if (href.includes("helpdesk.php")) router.push("/helpdesk")
      else if (href.includes("help.php")) router.push("/help")
      else if (href.includes("settings.php")) router.push("/settings")
      else if (href.includes("stats.php")) router.push("/stats")
      // Inak prejdeme priamo tam (a fallbackne to na router/home ak to neexistuje)
      else router.push(href)
    }
  }
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
  align-items: flex-start;
}

/* ── PANEL ── */
.dash-panel {
  background: rgba(4,190,254,0.05);
  border: 1px solid rgba(4,190,254,0.3);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  height: 100%;
}
.dash-panel::before {
  content: "";
  position: absolute; top: 0; left: 0;
  width: 15px; height: 15px;
  border-top: 2px solid #04befe;
  border-left: 2px solid #04befe;
  z-index: 1;
}
.dash-panel::after {
  content: "";
  position: absolute; bottom: 0; right: 0;
  width: 15px; height: 15px;
  border-bottom: 2px solid #04befe;
  border-right: 2px solid #04befe;
  z-index: 1;
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
  text-align: center;
  justify-content: center;
}
.dash-panel-dot {
  width: 6px; height: 6px;
  background: #04befe;
  box-shadow: 0 0 5px #04befe;
  transform: rotate(45deg);
}
.dash-panel-action {
  margin-left: auto;
  color: #ff3c3c;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
}
.dash-panel-action:hover {
  text-shadow: 0 0 8px #ff3c3c;
}

.dash-panel-body {
  padding: 12px;
  background: rgba(0,0,0,0.4);
  font-size: 12px;
  color: #ddd;
  height: 250px;
  overflow-y: auto;
}

/* ── STYLING RAW HTML IN DASHBOARD ── */
/* The original game uses tables mostly */
.dash-raw-html :deep(table) {
  width: 100%;
  border-collapse: collapse;
}
.dash-raw-html :deep(th) {
  background: rgba(4,190,254,0.1);
  color: #04befe;
  padding: 6px;
  border-bottom: 1px solid rgba(4,190,254,0.2);
  text-align: center;
  font-size: 11px;
}
.dash-raw-html :deep(td) {
  padding: 6px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  vertical-align: middle;
}
.dash-raw-html :deep(tr:last-child td) {
  border-bottom: none;
}
.dash-raw-html :deep(.success) { color: #59d34c; font-weight: bold; }
.dash-raw-html :deep(.failed) { color: #ff3c3c; font-weight: bold; }
.dash-raw-html :deep(.bold) { font-weight: bold; }
.dash-raw-html :deep(a) {
  color: #04befe;
  text-decoration: none;
}
.dash-raw-html :deep(a:hover) {
  text-decoration: underline;
}

/* Buttony z povodnej hry (Rozkazy) */
.dash-raw-html :deep(.btn-bevel), .dash-raw-html :deep(.btn-bevel-sm) {
  background: rgba(4,190,254,0.15);
  border: 1px solid #04befe;
  color: #fff;
  padding: 4px 8px;
  font-size: 11px;
  cursor: pointer;
  border-radius: 2px;
  width: 100%;
}
.dash-raw-html :deep(.btn-bevel:hover) {
  background: rgba(4,190,254,0.3);
}

/* Obrazky vo Vystrahach (crew-alert) */
.dash-raw-html :deep(.crew-alert) {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px dashed rgba(255,255,255,0.1);
}
.dash-raw-html :deep(.crew-alert-text) {
  width: 32px; height: 32px;
  background-size: cover;
  border-radius: 4px;
  border: 1px solid rgba(4,190,254,0.3);
  flex-shrink: 0;
}
.dash-raw-html :deep(.crew-alert-date) {
  color: rgba(255,255,255,0.4);
  font-size: 10px;
  width: 60px;
  flex-shrink: 0;
}

/* ── TECH SLOTS (Ukořistěné technologie) ── */
.dash-raw-html :deep(.enemy-tech) {
  display: inline-block;
  width: 48px;
  height: 48px;
  margin: 3px;
  border-radius: 6px;
  border: 1px solid rgba(4,190,254,0.6);
  background-size: cover;
  background-position: center;
  background-color: rgba(4,190,254,0.1);
  box-shadow: 0 0 5px rgba(4,190,254,0.3);
  cursor: pointer;
  vertical-align: middle;
}
.dash-raw-html :deep(.enemy-tech:hover) {
  box-shadow: 0 0 10px rgba(4,190,254,0.8);
}
.dash-raw-html :deep(.tech-slot-empty) {
  display: inline-flex;
  width: 48px;
  height: 48px;
  margin: 3px;
  border-radius: 6px;
  border: 2px solid #3cff3c; /* Zelený border ako na screenshote */
  background: rgba(0,255,0,0.05);
  color: rgba(255,255,255,0.7);
  font-size: 10px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  vertical-align: middle;
}
.dash-raw-html :deep(.tech-slot-empty:hover) {
  background: rgba(0,255,0,0.2);
}

/* Obrazky pre originalne tech triedy (fallbacky ak sa nacitavaju len podla classy) */
.dash-raw-html :deep(.et-electronics) {
  background-image: url('https://sgu-game.cz/img/techs/electronics.png');
}

/* ── MODAL ── */
.sgu-modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.85);
  z-index: 9999;
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.sgu-modal {
  background: #08111e;
  border: 1px solid rgba(4,190,254,0.6);
  border-radius: 4px;
  box-shadow: 0 0 20px rgba(4,190,254,0.2);
  width: 100%;
  max-width: 400px;
  padding: 15px;
  position: relative;
}
.sgu-modal-close {
  position: absolute; top: 5px; right: 5px;
  color: #ff3c3c; cursor: pointer; padding: 5px; font-size: 16px;
}
</style>

