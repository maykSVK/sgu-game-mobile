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
        <button @click="$emit('close')" class="drawer-close-btn">✕</button>
        <div style="text-align:center;">
          <img src="/src/assets/img/sgu-game.png" alt="SG:U" style="height:18px; filter:drop-shadow(0 0 5px rgba(4,190,254,0.5));" />
        </div>
      </div>

      <!-- Menu -->
      <div class="sgu-drawer-menu">
        <div class="sgu-drawer-section">Hlavná navigácia</div>
        <div v-for="item in primary" :key="item.to"
             class="sgu-drawer-item" :class="{ active: isActive(item.to) }"
             @click="go(item)">
          <span class="icon">{{ item.icon }}</span>
          <div>
            <div>{{ item.label }}</div>
            <div v-if="item.sub" class="sub">{{ item.sub }}</div>
          </div>
        </div>

        <div class="sgu-drawer-divider"></div>

        <div class="sgu-drawer-section">Ostatné</div>
        <div v-for="item in secondary" :key="item.to"
             class="sgu-drawer-item" :class="{ active: isActive(item.to) }"
             @click="go(item)">
          <span class="icon">{{ item.icon }}</span>
          <div>{{ item.label }}</div>
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

const primary = [
  { to: '/',           icon: '🖥️',  label: 'Dashboard',       sub: 'Riadiaca miestnosť' },
  { to: '/universe',   icon: '🌌',  label: 'Vesmír',           sub: 'Galaxie & planéty'  },
  { to: '/stargate',   icon: '⭕',  label: 'Hvezdná brána',    sub: 'Stargate'            },
  { to: '/expedition', icon: '🚀',  label: 'Expedícia',        sub: 'Prieskumné misie'   },
  { to: '/research',   icon: '🔬',  label: 'Výskum',           sub: 'Strom technológií'  },
  { to: '/upgrades',   icon: '⚙️',  label: 'Vylepšenia',       sub: 'Loď & vybavenie'    },
]

const secondary = [
  { to: '/messages',  icon: '💬',  label: 'Správy / Chat'      },
  { to: '/alliance',  icon: '🤝',  label: 'Aliancia'           },
  { to: '/market',    icon: '🏪',  label: 'Obchodná stanica'   },
  { to: '/lab',       icon: '🧪',  label: 'Laboratórium'       },
  { to: '/stats',     icon: '📊',  label: 'Štatistiky'         },
  { to: '/reports',   icon: '📝',  label: 'Reporty'},
]

function isActive(path) {
  return path === '/' ? route.path === '/' : route.path.startsWith(path)
}
function go(item) {
  router.push(item.to)
  emit('close')
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
</style>
