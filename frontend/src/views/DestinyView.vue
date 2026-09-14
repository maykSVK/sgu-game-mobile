<template>
  <StarField />
  <div class="sgu-scanlines" />

  <div class="dash-page">
    
    <!-- SUB-NAVIGATION (Scrollable Mobile Tabs) -->
    <div class="sub-nav-wrapper">
      <div class="sub-nav-scroll">
        <router-link to="/" class="sub-nav-btn"><i class="fas fa-desktop"></i> Můstek</router-link>
        <router-link to="/destiny" class="sub-nav-btn"><i class="fas fa-cogs"></i> Strojovna</router-link>
        <router-link to="/crew" class="sub-nav-btn"><i class="fas fa-users"></i> Posádka</router-link>
        <router-link to="/checksums" class="sub-nav-btn"><i class="fas fa-history"></i> Přepočty</router-link>
        <router-link to="/hero" class="sub-nav-btn"><i class="fas fa-user-shield"></i> Hrdinové</router-link>
        <router-link to="/progress" class="sub-nav-btn"><i class="fas fa-tasks"></i> Postup</router-link>
      </div>
    </div>

    <div class="dash-content">
      
      <!-- LOADING STATE -->
      <div v-if="loading" style="text-align:center; padding: 30px; color: #04befe;">
        Načítám strojovnu...
      </div>

      <!-- GRID PRO INFOBOXY -->
      <div v-else-if="destinyData?.infoboxes" class="dash-grid">
        <section v-for="(box, i) in destinyData.infoboxes" :key="i" class="dash-section">
          <div class="dash-panel">
            <div class="dash-panel-head">
              <span class="dash-panel-dot"></span> {{ box.title }}
            </div>
            <!-- Vložíme raw HTML s opravenými cestami -->
            <div class="dash-panel-body dash-raw-html" v-html="fixHtml(box.html)" @click="handleLinks">
            </div>
          </div>
        </section>
      </div>
      
      <!-- TOOLTIP MODAL PRO MOBILY -->
      <div v-if="tooltipModalHtml" class="sgu-modal-overlay" @click.self="tooltipModalHtml = null">
        <div class="sgu-modal">
          <div class="sgu-modal-close" @click="tooltipModalHtml = null"><i class="fas fa-times"></i></div>
          <div class="dash-raw-html" v-html="tooltipModalHtml" @click="handleLinks"></div>
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
import "../assets/tech.css"

const router = useRouter()
const loading = ref(true)
const destinyData = ref(null)

// Modal state pre tooltpy
const tooltipModalHtml = ref(null)

async function loadData() {
  loading.value = true
  try {
    const res = await axios.get("/api/destiny")
    destinyData.value = res.data.data
  } catch (e) {
    console.error(e)
  }
  loading.value = false
}

function fixHtml(html) {
  if (!html) return ''
  let res = html.replace(/src="\/?((?:img|images|css|js)\/[^"]+)"/g, 'src="https://sgu-game.cz/$1"')
  res = res.replace(/url\(['"]?\/?(?:\.\.\/)?(img\/[^'"\)]+)['"]?\)/g, 'url(https://sgu-game.cz/$1)')
  return res
}

async function submitDestinyAction(data) {
  loading.value = true
  tooltipModalHtml.value = null // Close modal on action
  try {
    const res = await axios.post("/api/destiny", data)
    destinyData.value = res.data.data
  } catch(e) {
    console.error(e)
    alert("Nastala chyba při akci.")
  } finally {
    loading.value = false
  }
}

// Intercept clicks on links and forms inside raw HTML
function handleLinks(e) {
  // Handle forms (Opravit, Odmontovat)
  const form = e.target.closest("form")
  if (form && (e.target.type === "submit" || e.target.tagName === "BUTTON" || e.target.tagName === "INPUT")) {
    e.preventDefault()
    const formData = new FormData(form)
    if (e.target.name) formData.append(e.target.name, e.target.value)

    const obj = {}
    formData.forEach((value, key) => obj[key] = value)
    submitDestinyAction(obj)
    return
  }

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
      
      // Pokusíme sa namapovať staré linky na nové Vue cesty
      if (href.includes("reports.php")) router.push("/reports")
      else if (href.includes("research.php")) router.push("/research")
      else if (href.includes("stargate.php")) router.push("/stargate")
      else if (href.includes("universe.php")) router.push("/universe")
      else if (href.includes("upgrade.php")) router.push("/upgrades")
      else if (href.includes("destiny.php")) router.push("/destiny")
      else if (href.includes("dashboard.php")) router.push("/")
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

/* ── SUB-NAV (Angular Sci-Fi Tabs) ── */
.sub-nav-wrapper {
  background: rgba(0, 0, 0, 0.6);
  border-bottom: 2px solid #04befe;
  padding: 0;
  width: 100%;
}
.sub-nav-scroll {
  display: flex;
  overflow-x: auto;
  gap: 4px;
  padding: 0 10px;
  scroll-behavior: smooth;
  /* Hide scrollbar for clean look but allow scrolling */
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.sub-nav-scroll::-webkit-scrollbar {
  display: none;
}
.sub-nav-btn {
  flex-shrink: 0;
  background: rgba(4,190,254,0.05);
  border: 1px solid rgba(4,190,254,0.3);
  border-bottom: none;
  /* Sci-Fi seříznuté rohy na vrchu */
  clip-path: polygon(10px 0, 100% 0, 100% 100%, 0 100%, 0 10px);
  padding: 10px 20px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-family: Orbitron, sans-serif;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: uppercase;
  transition: all 0.2s ease;
  margin-top: 10px;
}
.sub-nav-btn i {
  color: rgba(4,190,254,0.6);
  font-size: 14px;
}
.sub-nav-btn:hover {
  background: rgba(4,190,254,0.15);
  color: #fff;
}
.sub-nav-btn.router-link-exact-active {
  background: rgba(4,190,254,0.25);
  border: 2px solid #04befe;
  border-bottom: none;
  color: #fff;
  font-weight: bold;
}
.sub-nav-btn.router-link-exact-active i {
  color: #04befe;
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

