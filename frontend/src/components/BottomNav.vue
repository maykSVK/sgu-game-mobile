<template>
  <nav class="bottom-nav">
    <!-- Bežné taby -->
    <RouterLink
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      custom
      v-slot="{ navigate }"
    >
      <button
        @click="navigate"
        class="nav-tab"
        :class="isActive(item.to) ? 'active' : ''"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </button>
    </RouterLink>

    <!-- "Viac" – otvára hamburger -->
    <button class="nav-tab" @click="$emit('open-drawer')">
      <span class="nav-icon" style="font-size:18px; letter-spacing:-1px;">☰</span>
      <span>VIAC</span>
    </button>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

defineEmits(['open-drawer'])
const route = useRoute()

const navItems = [
  { to: '/',         icon: '⊞',  label: 'MŮSTEK'  },
  { to: '/universe', icon: '✦',  label: 'VESMÍR'  },
  { to: '/arena',    icon: '⚔',  label: 'ARÉNA'   },
  { to: '/research', icon: '⬡',  label: 'VÝZKUM'  },
]

function isActive(path) {
  return path === '/' ? route.path === '/' : route.path.startsWith(path)
}
</script>
