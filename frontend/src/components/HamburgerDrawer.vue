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
        <div style="width: 28px;"></div> <!-- Spacer pre vycentrovanie textu -->
      </div>

      <!-- Menu -->
      <div class="sgu-drawer-menu">
        <div class="sgu-drawer-section">HLAVNÁ NAVIGÁCIA</div>
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

        <div class="sgu-drawer-section">OSTATNÉ</div>
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
  { to: '/',           icon: 'far fa-clipboard',   label: 'Dashboard',       sub: 'Riadiaca miestnosť' },
  { to: '/universe',   icon: 'fas fa-project-diagram',label: 'Vesmír',           sub: 'Galaxie & planéty', badge: 'ftlExited'  },
  { to: '/stargate',   icon: 'fas fa-circle-notch',label: 'Hviezdna brána',    sub: 'Stargate'            },
  { to: '/expedition', icon: 'fas fa-rocket',      label: 'Expedícia',        sub: 'Prieskumné misie', badge: 'activeExpedition'   },
  { to: '/planets',    icon: 'fas fa-city',        label: 'Planéty a stavby', sub: 'Prehľad impéria' },
  { to: '/arena',      icon: 'fas fa-crosshairs',  label: 'Aréna',            sub: 'Bojový simulátor'   },
  { to: '/research',   icon: 'fas fa-flask',       label: 'Výskum',           sub: 'Strom technológií'  },
  { to: '/upgrades',   icon: 'fas fa-cogs',        label: 'Vylepšenia',       sub: 'Loď & vybavenie'    },
]

const secondary = [
  { to: '/messages',  icon: 'far fa-envelope', label: 'Správy / Chat'      },
  { to: '/alliance',  icon: 'far fa-handshake',label: 'Aliancia'           },
  { to: '/market',    icon: 'fas fa-store',    label: 'Obchodná stanica'   },
  { to: '/lab',       icon: 'fas fa-vial',     label: 'Laboratórium'       },
  { to: '/stats',     icon: 'far fa-chart-bar',label: 'Štatistiky'         },
  { to: '/reports',   icon: 'far fa-file-alt', label: 'Reporty',           badge: 'hasNewReport' },
]

function isActive(path) {
  return path === '/' ? route.path === '/' : route.path.startsWith(path)
}
function go(item) {
  router.push(item.to)
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
