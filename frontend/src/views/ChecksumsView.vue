<template>
  <div>
    <StarField />
    <div class="sgu-scanlines" />

    <div class="dash-page">
      <DashboardNav />

      <div class="dash-content">
        
        <div v-if="loading && !checksumsData" class="loading-box">
          Načítám historii přepočtů...
        </div>

        <template v-else-if="checksumsData">
          
          <div v-if="checksumsData.checksums && checksumsData.checksums.length > 0" class="checksums-list">
            <div v-for="(item, index) in checksumsData.checksums" :key="index" class="dash-section">
              <div class="dash-panel">
                <div class="dash-panel-body">
                  <div class="table-scroll-container">
                    <table class="checksum-table">
                      <thead>
                        <tr>
                          <th colspan="8" class="main-th">{{ item.title }}</th>
                        </tr>
                        <tr>
                          <th width="16%"></th>
                          <th width="12%"><i class="fas fa-bolt energy"></i> Energie</th>
                          <th width="12%"><i class="fas fa-drumstick-bite food"></i> Jídlo</th>
                          <th width="12%"><i class="fas fa-tint water"></i> Voda</th>
                          <th width="12%"><i class="fas fa-cookie limestone"></i> Vápenec</th>
                          <th width="12%"><i class="fas fa-money-bill-wave credits"></i> Kredity</th>
                          <th width="12%"><i class="fas fa-flask research-points"></i> Výzkumné body</th>
                          <th width="12%"><i class="fas fa-crown renown"></i> Sláva</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td class="row-label">{{ item.before.label }}</td>
                          <td>{{ item.before.energy }}</td>
                          <td>{{ item.before.food }}</td>
                          <td>{{ item.before.water }}</td>
                          <td>{{ item.before.limestone }}</td>
                          <td>{{ item.before.credits }}</td>
                          <td>{{ item.before.research }}</td>
                          <td>{{ item.before.renown }}</td>
                        </tr>
                        <tr>
                          <td class="row-label">{{ item.after.label }}</td>
                          <td>{{ item.after.energy }}</td>
                          <td>{{ item.after.food }}</td>
                          <td>{{ item.after.water }}</td>
                          <td>{{ item.after.limestone }}</td>
                          <td>{{ item.after.credits }}</td>
                          <td>{{ item.after.research }}</td>
                          <td>{{ item.after.renown }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="dash-section">
            <div class="dash-panel">
              <div class="dash-panel-head">
                <span class="dash-panel-dot"></span> HISTORIE PŘEPOČTŮ
              </div>
              <div class="dash-panel-body" style="text-align: center; padding: 30px; color: #aaa;">
                Zatím žádné přepočty!
              </div>
            </div>
          </div>

        </template>
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
const checksumsData = ref(null)

async function loadData() {
  loading.value = true
  try {
    const res = await axios.get("/api/checksums")
    if (res.data.ok) {
      checksumsData.value = res.data.data
    }
  } catch (e) {
    console.error(e)
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

.checksums-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

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
  padding: 0;
  background: rgba(0,0,0,0.4);
  font-size: 12px;
  color: #ddd;
}
.table-scroll-container {
  overflow-x: auto;
  width: 100%;
}

/* ── STYLING NATIVE TABLE ── */
.checksum-table {
  width: 100%;
  min-width: 700px;
  border-collapse: collapse;
}
.checksum-table .main-th {
  background: rgba(4,190,254,0.2);
  color: #fff;
  text-align: center;
  font-size: 14px;
  padding: 10px;
  border-bottom: 1px solid rgba(4,190,254,0.3);
}
.checksum-table th {
  background: rgba(0,0,0,0.3);
  color: #fff;
  padding: 10px 8px;
  border-bottom: 1px solid rgba(4,190,254,0.3);
  border-right: 1px solid rgba(4,190,254,0.15);
  text-align: center;
  font-size: 12px;
  font-weight: normal;
}
.checksum-table th:last-child {
  border-right: none;
}
.checksum-table td {
  padding: 10px 8px;
  border-bottom: 1px solid rgba(4,190,254,0.15);
  border-right: 1px solid rgba(4,190,254,0.15);
  text-align: center;
  vertical-align: middle;
  background: rgba(0,0,0,0.1);
}
.checksum-table td:last-child {
  border-right: none;
}
.checksum-table tr:last-child td {
  border-bottom: none;
}
.checksum-table .row-label {
  text-align: right;
  font-weight: bold;
  color: #04befe;
  padding-right: 15px;
}

/* FontAwesome Icons colors */
.energy { color: #59d34c; }
.food { color: #e284ff; }
.water { color: #56fff3; }
.limestone { color: #ffd760; }
.credits { color: #f0f0f0; }
.research-points { color: #04befe; }
.renown { color: #ff9900; }
</style>
