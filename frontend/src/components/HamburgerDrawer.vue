<template>
  <!-- Overlay -->
  <transition enter-active-class="transition-opacity duration-250 ease-out"
              enter-from-class="opacity-0" enter-to-class="opacity-100"
              leave-active-class="transition-opacity duration-200 ease-in"
              leave-from-class="opacity-100" leave-to-class="opacity-0">
    <div v-if="open" class="sgu-overlay" @click="$emit('close')" />
  </transition>

  <!-- Drawer -->
  <transition enter-active-class="transition-transform duration-280 ease-out"
              enter-from-class="translate-x-full" enter-to-class="translate-x-0"
              leave-active-class="transition-transform duration-200 ease-in"
              leave-from-class="translate-x-0" leave-to-class="translate-x-full">
    <nav v-if="open" class="sgu-drawer">

      <!-- Header -->
      <div class="sgu-drawer-header">
        <button @click="$emit('close')" class="drawer-close-btn"><i class="fas fa-times"></i></button>
        <div style="text-align:center; flex-grow: 1; color: rgba(4,190,254,0.6); font-weight: bold; font-size: 14px; letter-spacing: 1px;">
          MENU
        </div>
        <div style="width: 28px;"></div> <!-- Spacer pro vycentrování textu -->
      </div>

      <!-- Menu -->
      <div class="sgu-drawer-menu">
        <div class="sgu-drawer-section">HLAVNÍ NAVIGACE</div>
        <div class="sgu-drawer-item" @click="goToMyProfile">
          <i class="icon fas fa-user-circle"></i>
          <div style="flex-grow: 1;">
            <div>Můj profil</div>
            <div class="sub text-muted" style="font-size: 0.7rem;">{{ game.data?.player?.username || 'Načítá se...' }}</div>
          </div>
        </div>

        <div v-for="item in primary" :key="item.to"
             class="sgu-drawer-item" :class="{ active: isActive(item.to) }"
             @click="go(item)">
          <i class="icon" :class="item.icon"></i>
          <div style="flex-grow: 1;">
            <div>{{ item.label }}</div>
            <div v-if="item.sub" class="sub">{{ item.sub }}</div>
          </div>
          <span v-if="hasBadge(item)" class="nav-badge sgu-badge-pulse" :class="{ 'nav-badge-active': item.badge === 'activeExpedition' }"></span>
        </div>

        <div class="sgu-drawer-divider"></div>

        <div class="sgu-drawer-section">OSTATNÍ</div>
        <div v-for="item in secondary" :key="item.to"
             class="sgu-drawer-item" :class="{ active: isActive(item.to) }"
             @click="go(item)">
          <i class="icon" :class="item.icon"></i>
          <div style="flex-grow: 1;">{{ item.label }}</div>
          <span v-if="hasBadge(item)" class="nav-badge sgu-badge-pulse" :class="{ 'nav-badge-active': item.badge === 'activeExpedition' }"></span>
        </div>
      </div>
    </nav>
  </transition>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'

defineProps({
  open: { type: Boolean, default: false }
})
const emit = defineEmits(['close'])

const router = useRouter()
const route  = useRoute()
import { useGameStore } from '../stores/game'

const game = useGameStore()

const primary = [
  { to: '/',           icon: 'far fa-clipboard',   label: 'Dashboard',       sub: 'Řídící místnost' },
  { to: '/universe',   icon: 'fas fa-project-diagram',label: 'Vesmír',           sub: 'Galaxie & planety', badge: 'ftlExited'  },
  { to: '/stargate',   icon: 'fas fa-circle-notch',label: 'Hvězdná brána',    sub: 'Stargate'            },
  { to: '/expedition', icon: 'fas fa-rocket',      label: 'Expedice',        sub: 'Průzkumné mise', badge: 'activeExpedition'   },
  { to: '/planets',    icon: 'fas fa-city',        label: 'Planety a stavby', sub: 'Přehled impéria' },
  { to: '/arena',      icon: 'fas fa-crosshairs',  label: 'Aréna',            sub: 'Bojový simulátor'   },
  { to: '/research',   icon: 'fas fa-flask',       label: 'Výzkum',           sub: 'Strom technologií'  },
  { to: '/upgrades',   icon: 'fas fa-cogs',        label: 'Vylepšení',       sub: 'Loď & vybavení'    },
]

const secondary = [
  { to: '/communication', icon: 'far fa-envelope', label: 'Komunikace'         },
  { to: '/alliance',  icon: 'far fa-handshake',label: 'Aliance'           },
  { to: '/market',    icon: 'fas fa-store',    label: 'Obchodní stanice'   },
  { to: '/lab',       icon: 'fas fa-vial',     label: 'Laboratoř'       },
  { to: '/stats',     icon: 'far fa-chart-bar',label: 'Statistiky'         },
  { to: '/reports',   icon: 'far fa-file-alt', label: 'Reporty',           badge: 'hasNewReport' },
]

function isActive(path) {
  return path === '/' ? route.path === '/' : route.path.startsWith(path)
}
function go(item) {
  router.push(item.to)
  emit('close')
}
function goToMyProfile() {
  const username = game.data?.player?.username;
  if (username) {
     router.push({ path: '/stats/profile', query: { playerName: username } });
  }
  emit('close')
}
function hasBadge(item) {
  return item.badge && game[item.badge]
}
</script>

<style scoped>
.drawer-close-btn {
  position: absolute; top: 12px; left: 12px;
  background: rgba(4,190,254,0.1);
  border: 1px solid rgba(4,190,254,0.3); border-radius: 2px;
  color: rgba(255,255,255,0.55); width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; cursor: pointer;
}
.drawer-close-btn:active { background: rgba(4,190,254,0.25); }

.nav-badge {
  display: inline-block;
  width: 10px; height: 10px;
  border-radius: 50%;
  margin-left: 10px;
  background-color: #ff3c3c;
  box-shadow: 0 0 6px #ff3c3c;
}
.nav-badge-active {
  background-color: #59d34c;
  box-shadow: 0 0 6px #59d34c;
}
</style>
