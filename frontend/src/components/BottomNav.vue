<template>
  <!-- Fixná spodná navigácia -->
  <nav class="fixed bottom-0 left-0 right-0 bg-sgu-navy border-t border-white/10
              flex items-center justify-around z-50
              pb-safe">
    <RouterLink
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      class="flex flex-col items-center py-2 px-3 min-w-[60px] transition-colors duration-150"
      :class="isActive(item.to) ? 'text-sgu-accent' : 'text-sgu-text/50'"
    >
      <span class="text-2xl">{{ item.icon }}</span>
      <span class="text-[10px] mt-0.5 font-medium">{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()

const navItems = [
  { to: '/',         icon: '🖥️',  label: 'Dashboard' },
  { to: '/research', icon: '🔬',  label: 'Výskum'    },
  { to: '/universe', icon: '🌌',  label: 'Vesmír'    },
  { to: '/arena',    icon: '⚔️',  label: 'Aréna'     },
  { to: '/stats',    icon: '📊',  label: 'Štatistiky'},
]

function isActive(path) {
  return path === '/' ? route.path === '/' : route.path.startsWith(path)
}
</script>

<style scoped>
/* iPhone safe area pre home indicator */
.pb-safe { padding-bottom: env(safe-area-inset-bottom, 8px); }
</style>
