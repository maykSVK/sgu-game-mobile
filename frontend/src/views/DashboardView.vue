<template>
  <StarField />
  <div class="sgu-scanlines" />

  <div class="dash-page">
    <div class="dash-content">
      
      <!-- ── VÝSTRAHY A HLÁŠENÍ ── -->
      <section v-if="game.data?.alerts?.length" class="dash-section">
        <div class="dash-panel">
          <div class="dash-panel-head dash-panel-head-gold">
            <span class="dash-panel-dot" style="background:gold;"></span>
            Výstrahy a hlášení
            <span class="dash-badge-count">{{ game.data.alerts.length }}</span>
          </div>
          <div>
            <div v-for="(a, i) in game.data.alerts.slice(0, 5)" :key="i" class="dash-alert">
              {{ a }}
            </div>
            <button v-if="game.data.alerts.length > 5" class="dash-more-btn" @click="$router.push('/reports')">
              Zobrazit všechny reporty
            </button>
          </div>
        </div>
      </section>

      <!-- ── QUEST LOG ── -->
      <section v-if="game.data?.quests?.length" class="dash-section">
        <div class="dash-panel">
          <div class="dash-panel-head dash-panel-head-blue">
            <span class="dash-panel-dot" style="background:#4a7aff;"></span> Quest Log
          </div>
          <div class="dash-panel-body">
            <div v-for="(q, i) in game.data.quests" :key="i" class="dash-quest-row" :class="{ active: i === 0 }">
              <span class="dash-quest-icon">{{ i === 0 ? '►' : '·' }}</span>
              <span>{{ q }}</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useGameStore } from '../stores/game'
import StarField from '../components/StarField.vue'

const game = useGameStore()

onMounted(() => {
  if (!game.data) {
    game.fetchDashboard()
  }
})
</script>

<style scoped>
.dash-page {
  min-height: 100vh;
  padding-bottom: 72px;
  position: relative;
  z-index: 1;
}
.dash-content { padding: 10px; }

/* ── Section ── */
.dash-section { margin-bottom: 10px; }

/* ── Panel ── */
.dash-panel {
  background: rgba(4,190,254,0.09);
  border: 1px solid rgba(4,190,254,0.4);
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}
.dash-panel::before {
  content: '';
  position: absolute; top: 0; left: 0;
  width: 10px; height: 10px;
  border-top: 2px solid #04befe;
  border-left: 2px solid #04befe;
  z-index: 1;
}
.dash-panel::after {
  content: '';
  position: absolute; bottom: 0; right: 0;
  width: 10px; height: 10px;
  border-bottom: 2px solid #04befe;
  border-right: 2px solid #04befe;
  z-index: 1;
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
.dash-panel-head-gold { border-bottom-color: rgba(255,200,0,0.3); }
.dash-panel-head-blue { background: rgba(40,80,200,0.2); border-bottom-color: rgba(50,100,255,0.3); }

.dash-panel-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #04befe;
  box-shadow: 0 0 6px #04befe;
  flex-shrink: 0;
  animation: dotPulse 2s ease-in-out infinite;
}
@keyframes dotPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

.dash-badge-count {
  margin-left: auto;
  background: rgba(255,200,0,0.1);
  border: 1px solid rgba(255,200,0,0.35);
  color: gold;
  font-size: 10px;
  border-radius: 2px;
  padding: 1px 6px;
}

.dash-panel-body {
  padding: 9px 10px;
  background: rgba(0,0,0,0.55);
}

/* ── Alerts ── */
.dash-alert {
  padding: 8px 10px;
  background: rgba(100,90,90,0.22);
  border-left: 2px solid #04befe;
  border-bottom: 1px dotted rgba(4,190,254,0.1);
  font-family: Verdana, sans-serif;
  font-size: 12px;
  line-height: 1.45;
  color: rgba(255,255,255,0.9);
}
.dash-alert:hover { background: rgba(100,90,90,0.35); }
.dash-more-btn {
  width: 100%; padding: 8px; background: none; border: none;
  border-top: 1px dotted rgba(4,190,254,0.15);
  color: rgba(4,190,254,0.55); font-size: 11px; cursor: pointer; text-align: center;
}
.dash-more-btn:hover { color: #04befe; }

/* ── Quests ── */
.dash-quest-row {
  display: flex; align-items: flex-start; gap: 8px;
  padding: 4px 0;
  font-family: Verdana, sans-serif;
  font-size: 12px;
  color: rgba(255,255,255,0.55);
}
.dash-quest-row.active { font-weight: bold; color: rgba(255,255,255,0.95); }
.dash-quest-icon { color: rgba(4,190,254,0.5); flex-shrink: 0; }
.dash-quest-row.active .dash-quest-icon { color: #4a7aff; }
</style>
