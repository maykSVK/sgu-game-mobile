<template>
  <StarField />
  <div class="sgu-scanlines" />

  <div class="dash-page">
    <DashboardNav />

    <div class="dash-content">
      
      <!-- LOADING STATE -->
      <div v-if="loading" style="text-align:center; padding: 30px; color: #04befe;">
        Načítám řídící místnost...
      </div>

      <!-- GRID PRO INFOBOXY -->
      <div v-else class="dash-grid">
        <section v-for="(box, i) in game.data?.infoboxes" :key="i" class="dash-section">
          <div class="dash-panel">
            <div class="dash-panel-head">
              <span class="dash-panel-dot"></span> {{ box.title.replace("[x]", "").replace("[?]", "").trim() }}
              
              <!-- Tlačítko na vymazanie výstrah -->
              <span v-if="box.title.includes('Výstrahy a hlášení')" 
                    class="dash-panel-action" 
                    @click="deleteAlerts" 
                    title="Odstranit všechny výstrahy">
                [x]
              </span>
            </div>
            <!-- Vložíme raw HTML s opravenými cestami -->
            <div class="dash-panel-body dash-raw-html" v-html="fixHtml(box.html)" @click="handleLinks">
            </div>
          </div>
        </section>
      </div>

    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import axios from "axios"
import { useGameStore } from "../stores/game"
import StarField from "../components/StarField.vue"
import DashboardNav from "../components/DashboardNav.vue"

const game = useGameStore()
const router = useRouter()
const loading = ref(true)

async function loadData() {
  loading.value = true
  await game.fetchDashboard()
  loading.value = false
}

async function deleteAlerts() {
  if (confirm("Opravdu chcete odstranit všechny výstrahy?")) {
    loading.value = true
    try {
      await axios.post("/api/ajax", { method: "deleteAlerts" })
      await game.fetchDashboard()
    } catch (e) {
      console.error(e)
      alert("Nepodařilo se smazat výstrahy.")
    } finally {
      loading.value = false
    }
  }
}

function fixHtml(html) {
  if (!html) return ''
  // Prepend https://sgu-game.cz to all relative images/urls
  let res = html.replace(/src="\/?((?:img|images|css|js)\/[^"]+)"/g, 'src="https://sgu-game.cz/$1"')
  res = res.replace(/url\(['"]?\/?(?:\.\.\/)?(img\/[^'"\)]+)['"]?\)/g, 'url(https://sgu-game.cz/$1)')
  return res
}

// Intercept clicks on links and forms inside raw HTML
function handleFormSubmit(e) {
  const form = e.target
  const formData = new FormData(form)
  if (e.submitter && e.submitter.name) {
    formData.append(e.submitter.name, e.submitter.value)
  } else if (form.querySelector('input[type="submit"]')) {
    const btn = form.querySelector('input[type="submit"]')
    if (btn.name) formData.append(btn.name, btn.value)
  }

  const obj = {}
  formData.forEach((value, key) => obj[key] = value)
  // For dashboard we might not have submitDashboardAction yet
  // but if there's any form, we should probably handle it or prevent it.
  // Actually, dashboard forms (Rozkazy) post to /ajax or /dashboard.
  console.log("Form submit intercepted", obj)
}

function handleLinks(e) {
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
  min-height: 100vh;
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
</style>

