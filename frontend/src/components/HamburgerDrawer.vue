<template>
  <!-- Overlay (scrim) -->
  <transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="open"
      class="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
      @click="$emit('close')"
    />
  </transition>

  <!-- Drawer panel -->
  <transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="translate-x-full"
    enter-to-class="translate-x-0"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="translate-x-0"
    leave-to-class="translate-x-full"
  >
    <nav
      v-if="open"
      class="fixed top-0 right-0 bottom-0 w-4/5 max-w-xs bg-sgu-navy z-50 flex flex-col overflow-hidden"
      style="border-left: 1px solid rgba(32,156,255,0.2); box-shadow: -8px 0 32px rgba(0,0,0,0.6);"
    >
      <!-- Subtle grid overlay -->
      <div class="absolute inset-0 opacity-5 pointer-events-none hex-bg"></div>

      <!-- Player Profile -->
      <div class="relative px-5 pt-10 pb-4" style="background: linear-gradient(135deg, #0d1f3c 0%, #1a3a6c 100%); border-bottom: 1px solid rgba(32,156,255,0.3);">
        <button
          @click="$emit('close')"
          class="absolute top-4 left-4 w-8 h-8 flex items-center justify-center text-sgu-text/50 hover:text-white text-xl"
        >✕</button>

        <div class="flex items-center gap-3 mt-2">
          <div class="w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0"
               style="background: #0a1628; border: 2px solid #209cff; box-shadow: 0 0 12px rgba(32,156,255,0.4);">
            👨‍🚀
          </div>
          <div>
            <div class="font-bold text-white text-base">{{ playerName }}</div>
            <div class="text-xs text-sgu-accent uppercase tracking-wider">{{ playerRank }}</div>
            <div class="text-xs text-sgu-gold mt-0.5">💰 {{ playerCredits }} kreditov</div>
          </div>
        </div>
      </div>

      <!-- Menu items -->
      <div class="flex-1 overflow-y-auto py-2">
        <!-- Hlavná navigácia -->
        <div class="px-4 pt-3 pb-1">
          <span class="text-[10px] uppercase tracking-widest text-sgu-text/30 font-semibold">Hlavná navigácia</span>
        </div>

        <DrawerItem v-for="item in primaryItems" :key="item.to"
          :item="item" @click="navigate(item)" />

        <!-- Divider -->
        <div class="mx-4 my-2" style="border-top: 1px solid rgba(32,156,255,0.1);"></div>

        <!-- Ostatné -->
        <div class="px-4 pt-1 pb-1">
          <span class="text-[10px] uppercase tracking-widest text-sgu-text/30 font-semibold">Ostatné</span>
        </div>

        <DrawerItem v-for="item in secondaryItems" :key="item.to"
          :item="item" @click="navigate(item)" />
      </div>

      <!-- Logout -->
      <div class="p-4 shrink-0" style="border-top: 1px solid rgba(255,80,80,0.2);">
        <button
          @click="doLogout"
          class="w-full py-3 rounded-lg text-sm font-bold text-red-300 uppercase tracking-wider active:scale-95 transition-transform"
          style="background: rgba(180,30,30,0.2); border: 1px solid rgba(255,80,80,0.3);"
        >
          🚪 Odhlásiť
        </button>
      </div>
    </nav>
  </transition>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import DrawerItem from './DrawerItem.vue'

defineProps({
  open: { type: Boolean, default: false },
  playerName:    { type: String, default: 'Hráč' },
  playerRank:    { type: String, default: '' },
  playerCredits: { type: [String, Number], default: '' },
})
const emit = defineEmits(['close'])

const router = useRouter()
const route  = useRoute()
const auth   = useAuthStore()

const primaryItems = [
  { to: '/',          icon: '🖥️',  label: 'Dashboard',          sub: 'Mústek' },
  { to: '/universe',  icon: '🌌',  label: 'Mapa Vesmíru',        sub: 'Galaxie & planéty' },
  { to: '/arena',     icon: '⚔️',  label: 'Aréna',               sub: 'Boje & rank' },
  { to: '/expedition',icon: '🚀',  label: 'Expedície',            sub: 'Prieskumné misie' },
  { to: '/stargate',  icon: '⭐',  label: 'Hviezdna brána',       sub: 'Stargate' },
  { to: '/research',  icon: '🔬',  label: 'Výskum',              sub: 'Strom technológií' },
  { to: '/upgrades',  icon: '⚙️',  label: 'Vylepšenia',          sub: 'Loď & vybavenie' },
]

const secondaryItems = [
  { to: '/messages',  icon: '💬',  label: 'Správy / Chat',       sub: '' },
  { to: '/alliance',  icon: '🤝',  label: 'Aliancia',             sub: '' },
  { to: '/market',    icon: '🏪',  label: 'Obchodná stanica',     sub: '' },
  { to: '/lab',       icon: '🧪',  label: 'Laboratórium',         sub: '' },
  { to: '/stats',     icon: '📊',  label: 'Štatistiky',           sub: '' },
  { to: '/reports',   icon: '📝',  label: 'Quest Log / Reporty',  sub: '' },
]

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
