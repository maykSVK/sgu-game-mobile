<template>
  <StarField />
  <div class="sgu-scanlines" />

  <div class="dash-page">
    <DashboardNav />

    <div class="dash-content">
      <div v-if="loading" style="text-align:center; padding: 30px; color: #04befe;">
        Zjišťuji stav posádky...
      </div>

      <template v-else-if="crewData">
        
        <div class="dash-grid">
          
          <!-- Lavy stlpec -->
          <div class="dash-col">
            <!-- Rozmístění členů posádky -->
            <section class="dash-section">
              <div class="dash-panel">
                <div class="dash-panel-head">
                  <span class="dash-panel-dot"></span> ROZMÍSTĚNÍ ČLENŮ POSÁDKY
                </div>
                <div class="dash-panel-body">
                  <form @submit.prevent="setCrew" class="alloc-form">
                    <div v-for="prof in crewData.professions" :key="prof.id" class="alloc-row">
                      <div class="alloc-info">
                        <div class="alloc-title">{{ prof.title }}</div>
                        <div class="alloc-desc">{{ prof.desc }}</div>
                      </div>
                      
                      <div class="alloc-input-wrap">
                        <div v-if="prof.isLocked" class="text-red" style="font-size:10px; text-transform:uppercase;">
                          Zamknuto
                        </div>
                        <div v-else class="number-input-group">
                          <button type="button" @click="adjProf(prof, -1)">-</button>
                          <input type="number" :name="prof.id" v-model.number="prof.value" min="0" />
                          <button type="button" @click="adjProf(prof, 1)">+</button>
                        </div>
                      </div>

                      <div class="alloc-effect">
                        + {{ prof.effect }}
                      </div>
                    </div>

                    <div style="margin-top: 15px; text-align:center;">
                      <button type="submit" class="sgu-btn-action">
                        ALOKOVAT POSÁDKU
                      </button>
                      <div class="text-red" style="font-size: 10px; margin-top: 5px;">Pozor: Alokovat posádku lze jen 1x za den!</div>
                    </div>
                  </form>
                </div>
              </div>
            </section>
          </div>

          <!-- Pravy stlpec -->
          <div class="dash-col">
            
            <!-- Info o posadke -->
            <section class="dash-section">
              <div class="dash-panel">
                <div class="dash-panel-head">
                  <span class="dash-panel-dot"></span> INFORMACE O POSÁDCE
                </div>
                <div class="dash-panel-body">
                  
                  <div class="crew-stats-boxes">
                    <div class="c-box">
                      <div class="c-val">{{ crewData.stats.total }}</div>
                      <div class="c-lbl">CELKEM ČLENŮ</div>
                    </div>
                    <div class="c-box">
                      <div class="c-val text-green">{{ crewData.stats.allocated }}</div>
                      <div class="c-lbl">ALOKOVANÝCH</div>
                    </div>
                    <div class="c-box">
                      <div class="c-val text-yellow">{{ crewData.stats.available }}</div>
                      <div class="c-lbl">NEPŘIŘAZENÝCH</div>
                    </div>
                  </div>

                  <div class="consumption-html" v-html="fixHtml(crewData.consumptionHtml)"></div>

                </div>
              </div>
            </section>

            <!-- Vzdelanie a Profese -->
            <section class="dash-section">
              <div class="dash-panel">
                <div class="dash-panel-head">
                  <span class="dash-panel-dot"></span> KVALIFIKACE A PROFESE
                </div>
                <div class="dash-panel-body" style="padding:10px;">
                  
                  <div v-if="crewData.currentQualification" class="current-edu">
                    {{ crewData.currentQualification }}
                  </div>

                  <div class="unlock-list">
                    <div class="unlock-header">VZDĚLÁNÍ</div>
                    <div v-for="q in crewData.qualifications" :key="q.title" class="unlock-item">
                      <div class="u-title">{{ q.title }}</div>
                      <div class="u-price">
                        <i class="fas fa-money-bill-wave text-credits"></i> {{ q.price }}
                      </div>
                      <div class="u-action">
                        <span v-if="q.isUnlocked" class="text-green">Odemčeno</span>
                        <button v-else @click="unlockEdu(q.levelId)" class="sgu-btn-unlock">Odemknout</button>
                      </div>
                    </div>

                    <div class="unlock-header" style="margin-top:10px;">PROFESE</div>
                    <div v-for="p in crewData.unlockableProfessions" :key="p.title" class="unlock-item">
                      <div class="u-title">{{ p.title }}</div>
                      <div class="u-price">
                        <i class="fas fa-money-bill-wave text-credits"></i> {{ p.price }}
                      </div>
                      <div class="u-action">
                        <span v-if="p.isUnlocked" class="text-green">Odemčeno</span>
                        <button v-else @click="unlockProf(p.profId)" class="sgu-btn-unlock">Odemknout</button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </section>

            <!-- Prepustenie -->
            <section class="dash-section">
              <div class="dash-panel panel-danger">
                <div class="dash-panel-head">
                  <span class="dash-panel-dot"></span> PROPUŠTĚNÍ POSÁDKY
                </div>
                <div class="dash-panel-body">
                  <p style="font-size:12px; margin-bottom:10px; color:#ccc;">
                    Zde můžeš propustit členy posádky, které již nepotřebuješ. 
                    Propouštět můžeš pouze volné (nepřiřazené) členy.
                  </p>
                  <div class="fire-box">
                    <div>Lze propustit: <strong class="text-white">{{ crewData.fireCrew.max }}</strong></div>
                    <form @submit.prevent="fireCrew" class="fire-form" v-if="crewData.fireCrew.max > 0">
                      <input type="number" v-model.number="fireAmount" min="1" :max="crewData.fireCrew.max" required />
                      <button type="submit" class="sgu-btn-danger">PROPUSTIT</button>
                    </form>
                  </div>
                </div>
              </div>
            </section>

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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import StarField from '../components/StarField.vue'
import DashboardNav from '../components/DashboardNav.vue'

const loading = ref(true)
const crewData = ref(null)
const fireAmount = ref(1)
const toast = ref({ show: false, message: "", type: "success" })

function showToast(msg, type = "success") {
  toast.value = { show: true, message: msg, type }
  setTimeout(() => toast.value.show = false, 3500)
}

function handleMessages(msgs) {
  if (msgs && msgs.length > 0) {
    showToast(msgs[0].text, msgs[0].type)
  }
}

function fixHtml(html) {
  if (!html) return ''
  let res = html.replace(/class="success"/g, 'class="text-green"')
  res = res.replace(/class="failed"/g, 'class="text-red"')
  return res
}

function adjProf(prof, amount) {
  if (prof.isLocked) return
  let v = (prof.value || 0) + amount
  if (v < 0) v = 0
  prof.value = v
}

async function loadData() {
  loading.value = true
  try {
    const res = await axios.get("/api/crew")
    if (res.data.ok) {
      crewData.value = res.data.data
      handleMessages(res.data.data.messages)
    }
  } catch (e) {
    showToast("Chyba při načítání posádky", "error")
  } finally {
    loading.value = false
  }
}

async function doAction(data) {
  loading.value = true
  try {
    const res = await axios.post("/api/crew/action", data)
    if (res.data.ok) {
      crewData.value = res.data.data
      handleMessages(res.data.data.messages)
    }
  } catch(e) {
    showToast("Chyba při akci", "error")
  } finally {
    loading.value = false
  }
}

function setCrew() {
  const data = { set_crew: 'set_crew' }
  crewData.value.professions.forEach(p => {
    data[p.id] = p.value
  })
  doAction(data)
}

function unlockEdu(levelId) {
  if (!levelId) return
  doAction({ unlock_edu: 'unlock_edu', edu_level: levelId })
}

function unlockProf(profId) {
  if (!profId) return
  doAction({ unlock_profession: 'unlock_profession', profession: profId })
}

function fireCrew() {
  if (fireAmount.value > 0) {
    doAction({ fire_crew: 'fire_crew', crew: fireAmount.value })
    fireAmount.value = 1
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
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 15px;
  align-items: flex-start;
}
.dash-col {
  display: flex; flex-direction: column; gap: 15px;
}

.dash-section { display: block; }
.dash-panel {
  background: rgba(4,190,254,0.05); border: 1px solid rgba(4,190,254,0.3); border-radius: 4px;
  position: relative; overflow: hidden;
}
.dash-panel::before {
  content: ""; position: absolute; top: 0; left: 0; width: 15px; height: 15px;
  border-top: 2px solid #04befe; border-left: 2px solid #04befe; z-index: 1;
}
.dash-panel::after {
  content: ""; position: absolute; bottom: 0; right: 0; width: 15px; height: 15px;
  border-bottom: 2px solid #04befe; border-right: 2px solid #04befe; z-index: 1;
}

.dash-panel-head {
  background: rgba(4,190,254,0.15); border-bottom: 1px solid rgba(4,190,254,0.3);
  padding: 8px 12px; font-family: Orbitron, sans-serif; font-size: 13px; color: #fff;
  display: flex; align-items: center; gap: 8px; justify-content: center;
}
.dash-panel-dot {
  width: 6px; height: 6px; background: #04befe; box-shadow: 0 0 5px #04befe; transform: rotate(45deg);
}
.dash-panel-body {
  padding: 15px; background: rgba(0,0,0,0.4); font-size: 12px; color: #ddd;
}

/* Allocation */
.alloc-row {
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid rgba(4,190,254,0.1); padding: 8px 0;
}
.alloc-row:last-child { border: none; }
.alloc-info { flex: 1; }
.alloc-title { font-weight: bold; color: #04befe; font-size: 13px; }
.alloc-desc { font-size: 10px; color: #aaa; }

.alloc-input-wrap {
  width: 100px; display: flex; justify-content: center; align-items: center;
}
.number-input-group {
  display: flex; background: rgba(4,190,254,0.1); border: 1px solid rgba(4,190,254,0.3); border-radius: 4px;
  overflow: hidden;
}
.number-input-group button {
  background: rgba(4,190,254,0.2); border: none; color: #04befe; width: 28px; height: 28px;
  cursor: pointer; font-weight: bold;
}
.number-input-group button:hover { background: rgba(4,190,254,0.4); color: #fff; }
.number-input-group input {
  width: 45px; background: transparent; border: none; text-align: center; color: #fff;
  font-weight: bold; font-family: Orbitron, sans-serif; -moz-appearance: textfield;
}
.number-input-group input::-webkit-outer-spin-button,
.number-input-group input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

.alloc-effect {
  width: 60px; text-align: right; color: #59d34c; font-weight: bold; font-size: 13px;
}

/* Crew Stats */
.crew-stats-boxes {
  display: flex; justify-content: space-around; margin-bottom: 15px;
}
.c-box {
  background: rgba(4,190,254,0.1); border: 1px solid rgba(4,190,254,0.3);
  padding: 10px; border-radius: 4px; text-align: center; flex: 1; margin: 0 5px;
}
.c-val { font-size: 20px; font-weight: bold; font-family: Orbitron, sans-serif; }
.c-lbl { font-size: 9px; color: #aaa; margin-top: 4px; }

/* Consumption */
.consumption-html {
  background: rgba(0,0,0,0.3); padding: 10px; border: 1px dashed rgba(4,190,254,0.3);
  border-radius: 4px; line-height: 1.5; font-size: 12px;
}

/* Unlockables */
.current-edu {
  text-align: center; font-weight: bold; color: #04befe; margin-bottom: 15px;
  padding-bottom: 10px; border-bottom: 1px solid rgba(4,190,254,0.2);
}
.unlock-list { display: flex; flex-direction: column; gap: 8px; }
.unlock-header { font-size: 10px; color: #aaa; font-weight: bold; }
.unlock-item {
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(4,190,254,0.05); padding: 6px 10px; border-radius: 4px;
  border-left: 2px solid #04befe;
}
.u-title { font-weight: bold; color: #ddd; flex: 1; }
.u-price { width: 80px; text-align: right; margin-right: 15px; font-weight: bold; }
.u-action { width: 80px; text-align: center; }

/* Buttons */
.sgu-btn-action {
  background: rgba(4,190,254,0.2); border: 1px solid #04befe; color: #fff;
  padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer; width: 100%;
}
.sgu-btn-action:hover { background: rgba(4,190,254,0.4); }

.sgu-btn-unlock {
  background: rgba(4,190,254,0.1); border: 1px solid #04befe; color: #04befe;
  padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;
}
.sgu-btn-unlock:hover { background: rgba(4,190,254,0.3); color: #fff; }

.sgu-btn-danger {
  background: rgba(255,60,60,0.2); border: 1px solid #ff3c3c; color: #ff3c3c;
  padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;
}
.sgu-btn-danger:hover { background: rgba(255,60,60,0.4); color: #fff; }

.panel-danger { border-color: rgba(255,60,60,0.3); background: rgba(255,60,60,0.05); }
.panel-danger::before { border-color: #ff3c3c; }
.panel-danger::after { border-color: #ff3c3c; }
.panel-danger .dash-panel-head { background: rgba(255,60,60,0.15); border-color: rgba(255,60,60,0.3); }
.panel-danger .dash-panel-dot { background: #ff3c3c; box-shadow: 0 0 5px #ff3c3c; }

.fire-box {
  display: flex; justify-content: space-between; align-items: center;
  background: rgba(255,60,60,0.1); padding: 10px; border-radius: 4px;
}
.fire-form { display: flex; gap: 10px; }
.fire-form input {
  width: 60px; background: rgba(0,0,0,0.5); border: 1px solid #ff3c3c; color: #fff;
  text-align: center; border-radius: 3px;
}

/* Utils */
.text-green { color: #59d34c; }
.text-red { color: #ff3c3c; font-weight: bold; }
.text-yellow { color: #ffd760; }
.text-white { color: #fff; font-weight: bold; }
.text-credits { color: #f0f0f0; }

/* FontAwesome Icons colors */
.food { color: #e284ff; } /* Maso */
.water { color: #56fff3; } /* Voda */
.limestone { color: #ffd760; } /* Vapenec */
.credits { color: #f0f0f0; }
</style>
