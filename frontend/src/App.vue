<template>
  <div style="min-height:100vh; position:relative;">
    
    <!-- Login – bez navigácie a bez global topbaru -->
    <RouterView v-if="route.name === 'login'" />

    <!-- Hlavný layout -->
    <template v-else>
      <!-- Globálny Topbar -->
      <header class="app-topbar">
        <div class="app-topbar-left" @click="leftDrawerOpen = true">
          <div style="position: relative; display: inline-block;">
            <span class="left-menu-icon">☰</span>
            <span v-if="game.hasImportantAlerts" class="global-alert-badge sgu-badge-pulse"></span>
          </div>
          <img src="/src/assets/img/sgu-game.png" alt="SG:U" class="app-logo" />
          <div v-if="auth.playerName" class="app-player-badge">
            <span class="app-player-dot"></span>
            {{ auth.playerName }}
          </div>
        </div>
        <div class="app-topbar-right">
          <!-- Refresh button that works universally (e.g. emits or calls game store) -->
          <button @click="refreshGlobal" class="app-refresh" :class="{ spinning: game.loading }">↺</button>
        </div>
      </header>

      <RouterView />
      
      <BottomNav @open-drawer="rightDrawerOpen = true" />
      
      <!-- Ľavé menu (štatistiky lode) -->
      <LeftDrawer :open="leftDrawerOpen" @close="leftDrawerOpen = false" />

      <!-- Pravé menu (extended navigácia) -->
      <HamburgerDrawer :open="rightDrawerOpen" @close="rightDrawerOpen = false" />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useGameStore } from './stores/game'
import BottomNav from './components/BottomNav.vue'
import HamburgerDrawer from './components/HamburgerDrawer.vue'
import LeftDrawer from './components/LeftDrawer.vue'

const route = useRoute()
const auth  = useAuthStore()
const game  = useGameStore()
const rightDrawerOpen = ref(false)
const leftDrawerOpen  = ref(false)

onMounted(() => {
  auth.setupInterceptor()
  if (auth.token) {
    game.startPolling()
  }
})

watch(() => auth.token, (newVal) => {
  if (newVal) {
    game.startPolling()
  } else {
    game.stopPolling()
  }
})

function refreshGlobal() {
  game.fetchDashboard()
}
</script>

<style scoped>
.app-topbar {
  position: sticky; top: 0; z-index: 30;
  background: linear-gradient(to right, #3a3a3a, #000);
  border-top: 1px solid #04befe;
  border-bottom: 1px solid #04befe;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  height: 44px;
}
.app-topbar-left { 
  display: flex; align-items: center; gap: 10px; cursor: pointer;
  padding: 4px; border-radius: 4px;
}
.app-topbar-left:active { background: rgba(4,190,254,0.1); }

.left-menu-icon {
  font-size: 18px;
  color: #04befe;
  margin-right: -2px;
  display: flex; align-items: center; justify-content: center;
}

.app-topbar-right { display: flex; align-items: center; gap: 8px; }

.app-logo { height: 22px; filter: drop-shadow(0 0 6px rgba(4,190,254,0.5)); }

.app-player-badge {
  display: flex; align-items: center; gap: 5px;
  background: rgba(4,190,254,0.18);
  border: 1px solid rgba(4,190,254,0.4);
  border-radius: 2px;
  padding: 3px 9px;
  font-family: Verdana, sans-serif;
  font-size: 12px;
  font-weight: bold;
  color: #fff;
}
.app-player-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #04befe;
  box-shadow: 0 0 6px #04befe;
  flex-shrink: 0;
  animation: dotPulse 2s ease-in-out infinite;
}
@keyframes dotPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

.app-refresh {
  width: 34px; height: 34px;
  background: rgba(4,190,254,0.1);
  border: 1px solid rgba(4,190,254,0.35);
  border-radius: 2px;
  color: #04befe;
  font-size: 18px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.app-refresh:active { background: rgba(4,190,254,0.3); }
.app-refresh.spinning { animation: spin 0.9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
