<template>
  <!-- Fixná spodná navigácia -->
  <nav class="fixed bottom-0 left-0 right-0 bg-sgu-navy border-t z-50 pb-safe flex items-stretch"
       style="border-color: rgba(32,156,255,0.2); box-shadow: 0 -4px 20px rgba(0,0,0,0.4);">
    <!-- Bežné taby -->
    <RouterLink
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      class="flex flex-col items-center justify-center py-2 px-1 flex-1 min-w-0 transition-colors duration-150 relative"
      :class="isActive(item.to) ? 'text-sgu-accent' : 'text-sgu-text/40'"
    >
      <!-- Active glow underline -->
      <div v-if="isActive(item.to)"
           class="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full"
           style="background: #209cff; box-shadow: 0 0 8px #209cff;"></div>

      <span class="text-2xl leading-none">{{ item.icon }}</span>
      <span class="text-[9px] mt-0.5 font-medium truncate max-w-full px-1">{{ item.label }}</span>
    </RouterLink>

    <!-- "Viac" tab – otvára hamburger drawer -->
    <button
      @click="$emit('open-drawer')"
      class="flex flex-col items-center justify-center py-2 px-1 flex-1 min-w-0 transition-colors duration-150"
      :class="drawerHint ? 'text-sgu-accent' : 'text-sgu-text/40'"
    >
      <span class="text-2xl leading-none">☰</span>
      <span class="text-[9px] mt-0.5 font-medium">Viac</span>
    </button>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

defineEmits(['open-drawer'])

const route = useRoute()
const drawerHint = ref(false)

const navItems = [
  { to: '/',          icon: '🖥️',  label: 'Dashboard' },
  { to: '/universe',  icon: '🌌',  label: 'Vesmír'    },
  { to: '/arena',     icon: '⚔️',  label: 'Aréna'     },
  { to: '/research',  icon: '🔬',  label: 'Výskum'    },
]

function isActive(path) {
  return path === '/' ? route.path === '/' : route.path.startsWith(path)
}
</script>

<style scoped>
/* iPhone safe area pre home indicator */
.pb-safe { padding-bottom: env(safe-area-inset-bottom, 8px); }
</style>
