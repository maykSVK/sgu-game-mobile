<template>
  <div class="neural-page">
    <UpgradesNav />

    <div v-if="loading" class="sgu-loading">
      <i class="fas fa-circle-notch fa-spin"></i> Nacítavam Neurálne rozhraní...
    </div>

    <div v-else class="neural-content">
      <div class="page-main-title">
        <span class="title-dot"></span>
        Neurálne rozhraní
      </div>

      <div class="dash-grid">
        <section v-for="(box, i) in data.infoboxes" :key="i" class="dash-section">
          <div class="dash-panel">
            <div class="dash-panel-head">
              <span class="dash-panel-dot"></span> <span v-html="box.title"></span>
            </div>
            <div class="dash-panel-body dash-raw-html" v-html="fixHtml(box.html)" @click="handleLinks" @submit.prevent="handleFormSubmit">
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import UpgradesNav from '../components/UpgradesNav.vue'
import { inject } from 'vue'

const showToast = inject('showToast')

const loading = ref(true)
const data = ref({ infoboxes: [] })

const countdownInterval = ref(null)

async function loadData() {
  loading.value = true
  try {
    const res = await axios.get('/api/neural')
    data.value = res.data.data
  } catch (err) {
    console.error(err)
    if (showToast) showToast('Chyba pri načítavaní', 'error')
  } finally {
    loading.value = false
    setTimeout(initCountdowns, 100)
  }
}

async function handleFormSubmit(event) {
  const form = event.target;
  const formData = new FormData(form);
  const obj = {};
  
  const submitBtn = form.querySelector('input[type="submit"]');
  if (submitBtn && submitBtn.name) {
    obj[submitBtn.name] = submitBtn.value;
  }
  
  formData.forEach((value, key) => obj[key] = value);

  try {
    const res = await axios.post('/api/neural', obj);
    data.value = res.data.data;
    if (showToast) showToast('Akcia úspešná!', 'success');
    setTimeout(initCountdowns, 100);
  } catch (err) {
    console.error('Submit error:', err);
    if (showToast) showToast('Chyba pri akcii', 'error');
  }
}

function fixHtml(html) {
  if (!html) return ''
  return html.replace(/src="img\//g, 'src="/sgu-game-mobile/img/')
             .replace(/background-image: url\('\.\.\/img\//g, 'background-image: url(\'/sgu-game-mobile/img/')
}

function handleLinks(event) {
  const link = event.target.closest('a')
  if (link) {
    const href = link.getAttribute('href')
    if (href && !href.startsWith('http')) {
      event.preventDefault()
      console.log('Intercepted neural link:', href)
      // Custom routing logic if needed
    }
  }
}

// Timer logic
function initCountdowns() {
  if (countdownInterval.value) clearInterval(countdownInterval.value)

  const elements = document.querySelectorAll('[data-countdown]')
  if (!elements.length) return

  countdownInterval.value = setInterval(() => {
    let allFinished = true
    elements.forEach(el => {
      const targetStr = el.getAttribute('data-countdown')
      if (!targetStr) return

      // Convert "YYYY-MM-DD HH:MM:SS" to timestamp
      const [datePart, timePart] = targetStr.split(' ')
      if (!datePart || !timePart) return
      
      // Parse strictly in local time as the original game does
      const targetDate = new Date(`${datePart}T${timePart}`)
      const diff = targetDate.getTime() - Date.now()

      if (diff > 0) {
        allFinished = false
        const totalSeconds = Math.floor(diff / 1000)
        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)
        const seconds = totalSeconds % 60
        el.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      } else {
        el.textContent = "Dokončené"
      }
    })

    if (allFinished) {
      clearInterval(countdownInterval.value)
      // Optionally reload data when a countdown finishes
      // loadData()
    }
  }, 1000)
}

onMounted(() => {
  loadData()
})

onUnmounted(() => {
  if (countdownInterval.value) clearInterval(countdownInterval.value)
})
</script>

<style scoped>
.neural-page {
  padding: 0 0 80px 0;
  max-width: 600px;
  margin: 0 auto;
}

.neural-content {
  padding-bottom: 20px;
}

/* Hlavička */
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
  gap: 8px;
  margin: 15px;
  text-transform: uppercase;
}

.title-dot {
  width: 8px; height: 8px;
  background: #04befe;
  border-radius: 50%;
  box-shadow: 0 0 8px #04befe;
}

/* Grid pre infoboxy (reused from dashboard style) */
.dash-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 0 15px;
}

.dash-panel {
  background: rgba(4, 9, 20, 0.85);
  border: 1px solid rgba(4,190,254,0.4);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.dash-panel-head {
  background: rgba(4,190,254,0.22);
  border-bottom: 1px solid rgba(4,190,254,0.35);
  padding: 7px 10px;
  font-family: Verdana, sans-serif;
  font-size: 12px;
  font-weight: bold;
  color: #04befe;
  display: flex;
  align-items: center;
  gap: 6px;
}

.dash-panel-dot {
  width: 6px; height: 6px;
  background: #04befe;
  border-radius: 50%;
}

.dash-panel-body {
  padding: 10px;
  font-family: Verdana, sans-serif;
  font-size: 12px;
  color: #c9c9c9;
  line-height: 1.4;
}

/* Fix pre obrázky z pôvodnej hry v raw HTML pomocou :deep() */
:deep(.dash-raw-html .upgrade-img) {
  background-repeat: no-repeat;
  width: 100%;
  aspect-ratio: 344 / 202;
  background-size: cover;
  background-position: center;
  border-radius: 6px;
  margin-bottom: 10px;
  border: 1px solid rgba(4,190,254,0.4);
}

:deep(.dash-raw-html .upgrade-armchair) {
  background-image: url('/sgu-game-mobile/img/upgrade-armchair.jpg');
}
</style>
