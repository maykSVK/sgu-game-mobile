<template>
  <!-- Overlay (scrim) -->
  <transition
    enter-active-class="transition duration-250 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="open"
      class="sgu-overlay"
      @click="$emit('close')"
    />
  </transition>

  <!-- Drawer panel -->
  <transition
    enter-active-class="transition duration-280 ease-out"
    enter-from-class="translate-x-full"
    enter-to-class="translate-x-0"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="translate-x-0"
    leave-to-class="translate-x-full"
  >
    <nav v-if="open" class="sgu-drawer">

      <!-- Header – profil hráča -->
      <div class="sgu-drawer-header">
        <button
          @click="$emit('close')"
          style="position:absolute; top:12px; left:12px;
                 background:rgba(4,190,254,0.1); border:1px solid rgba(4,190,254,0.3);
                 border-radius:2px; color:rgba(255,255,255,0.6); width:28px; height:28px;
                 display:flex; align-items:center; justify-content:center; font-size:14px; cursor:pointer;"
        >✕</button>

        <!-- Logo v drawereri -->
        <div style="text-align:center; margin-bottom:10px;">
          <img src="/src/assets/img/sgu-game.png" alt="SG:U GAME" style="height:20px; filter:drop-shadow(0 0 6px rgba(4,190,254,0.5));" />
        </div>

        <div class="sgu-drawer-player">
          <div class="sgu-drawer-avatar">👨‍🚀</div>
          <div>
            <div class="sgu-drawer-name">{{ playerName }}</div>
            <div class="sgu-drawer-rank">{{ playerRank || 'Veliteľ' }}</div>
            <div v-if="playerCredits" class="sgu-drawer-credits">💰 {{ playerCredits }} kreditov</div>
          </div>
        </div>
      </div>

      <!-- Menu items -->
      <div class="sgu-drawer-menu">

        <!-- Hlavná navigácia -->
        <div class="sgu-drawer-section">Hlavná navigácia</div>

        <div
          v-for="item in primaryItems"
          :key="item.to"
          class="sgu-drawer-item"
          :class="isActive(item.to) ? 'active' : ''"
          @click="navigate(item)"
        >
          <span class="icon">{{ item.icon }}</span>
          <div>
            <div>{{ item.label }}</div>
            <div v-if="item.sub" class="sub">{{ item.sub }}</div>
          </div>
        </div>

        <div class="sgu-drawer-divider"></div>

        <!-- Ostatné -->
        <div class="sgu-drawer-section">Ostatné</div>

        <div
          v-for="item in secondaryItems"
          :key="item.to"
          class="sgu-drawer-item"
          :class="isActive(item.to) ? 'active' : ''"
          @click="navigate(item)"
        >
          <span class="icon">{{ item.icon }}</span>
          <div>
            <div>{{ item.label }}</div>
            <div v-if="item.sub" class="sub">{{ item.sub }}</div>
          </div>
        </div>

      </div>

      <!-- Odhlásenie -->
      <div class="sgu-drawer-footer">
        <button @click="doLogout" class="sgu-btn sgu-btn-danger sgu-btn-full" style="font-size:13px;">
          🚪 Odhlásiť sa
        </button>
      </div>

    </nav>
  </transition>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

defineProps({
  open:          { type: Boolean, default: false },
  playerName:    { type: String,  default: 'Hráč' },
  playerRank:    { type: String,  default: '' },
  playerCredits: { type: [String, Number], default: '' },
})
const emit = defineEmits(['close'])

const router = useRouter()
const route  = useRoute()
const auth   = useAuthStore()

const primaryItems = [
  { to: '/',           icon: '🖥️',  label: 'Dashboard',        sub: 'Riadiaca miestnosť' },
  { to: '/universe',   icon: '🌌',  label: 'Vesmír',            sub: 'Galaxie & planéty' },
  { to: '/stargate',   icon: '⭕',  label: 'Hvezdná brána',     sub: 'Stargate' },
  { to: '/expedition', icon: '🚀',  label: 'Expedícia',         sub: 'Prieskumné misie' },
  { to: '/research',   icon: '🔬',  label: 'Výskum',            sub: 'Strom technológií' },
  { to: '/upgrades',   icon: '⚙️',  label: 'Vylepšenia',        sub: 'Loď & vybavenie' },
]

const secondaryItems = [
  { to: '/messages',   icon: '💬',  label: 'Správy / Chat',     sub: '' },
  { to: '/alliance',   icon: '🤝',  label: 'Aliancia',          sub: '' },
  { to: '/market',     icon: '🏪',  label: 'Obchodná stanica',  sub: '' },
  { to: '/lab',        icon: '🧪',  label: 'Laboratórium',      sub: '' },
  { to: '/stats',      icon: '📊',  label: 'Štatistiky',        sub: '' },
  { to: '/reports',    icon: '📝',  label: 'Quest Log / Reporty', sub: '' },
]

function isActive(path) {
  return path === '/' ? route.path === '/' : route.path.startsWith(path)
}

function navigate(item) {
  router.push(item.to)
  emit('close')
}

async function doLogout() {
  emit('close')
  await auth.logout()
  router.push('/login')
}
</script>
