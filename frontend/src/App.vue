<template>
  <div class="app-layout" :class="{ 'desktop-drawer-open': isDesktop && leftDrawerOpen }">
    
    <!-- Login – bez navigácie a bez global topbaru -->
    <RouterView v-if="route.name === 'login'" />

      <template v-else>
      <!-- Globálny Topbar -->
      <header class="app-topbar">
        <div class="app-topbar-left">
          <!-- Iba ikona menu bude prepínať drawer -->
          <div @click="leftDrawerOpen = !leftDrawerOpen" style="position: relative; display: inline-block; padding: 4px; border-radius: 4px; cursor: pointer;" class="menu-toggle-btn">
            <span class="left-menu-icon">{{ leftDrawerOpen ? '✕' : '☰' }}</span>
            <span v-if="game.hasNewReport" class="global-alert-badge sgu-badge-pulse"></span>
          </div>
          
          <!-- Logo funguje ako odkaz domov -->
          <img src="/src/assets/img/sgu-game.png" alt="SG:U" class="app-logo" @click="router.push('/')" style="cursor: pointer;" />
        </div>
        <div class="app-topbar-right">
          <!-- Refresh button that works universally (e.g. emits or calls game store) -->
          <button @click="refreshGlobal" class="app-refresh" :class="{ spinning: game.loading }">
            <i class="fas fa-sync-alt"></i>
          </button>
        </div>
      </header>

      <div class="app-main-wrapper" :class="{ 'desktop-drawer-open': isDesktop && leftDrawerOpen }">
        <RouterView :key="$route.fullPath" />
      </div>
      
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

const isDesktop = ref(window.innerWidth >= 768)

onMounted(() => {
  window.addEventListener('resize', () => {
    const desktop = window.innerWidth >= 768
    if (desktop !== isDesktop.value) {
      isDesktop.value = desktop
      if (desktop) leftDrawerOpen.value = true
      else leftDrawerOpen.value = false
    }
  })
  if (isDesktop.value) leftDrawerOpen.value = true

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
.app-layout {
  min-height: 100vh;
  position: relative;
}

.app-main-wrapper {
  transition: padding-left 0.3s ease;
}

@media (min-width: 768px) {
  .app-main-wrapper.desktop-drawer-open {
    padding-left: 320px;
  }
}

.app-topbar {
  position: sticky; top: 0; z-index: 30;
  background: rgba(4, 9, 20, 0.95);
  box-shadow: 0 4px 15px rgba(0,0,0,0.8);
  backdrop-filter: blur(5px);
  border-top: 1px solid #04befe;
  border-bottom: 1px solid rgba(4,190,254,0.4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  height: 44px;
}
.app-topbar-left { 
  display: flex; align-items: center; gap: 10px;
}
.menu-toggle-btn:active { background: rgba(4,190,254,0.1); }

.left-menu-icon {
  font-size: 18px;
  color: #04befe;
  margin-right: -2px;
  display: flex; align-items: center; justify-content: center;
  width: 24px;
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
  background: transparent;
  border: none;
  border-radius: 50%;
  color: #04befe;
  font-size: 16px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
  text-shadow: 0 0 5px rgba(4,190,254,0.5);
}
.app-refresh:active { color: #fff; text-shadow: 0 0 10px rgba(4,190,254,1); transform: scale(0.9); }
.app-refresh.spinning { animation: spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite; color: #fff; text-shadow: 0 0 12px rgba(4,190,254,1); }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
