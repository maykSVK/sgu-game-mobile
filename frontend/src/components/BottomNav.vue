<template>
  <nav class="sgu-bottom-nav">
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
        class="sgu-nav-tab"
        :class="isActive(item.to) ? 'active' : ''"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </button>
    </RouterLink>

    <!-- "Viac" – otvára hamburger drawer -->
    <button class="sgu-nav-tab" @click="$emit('open-drawer')">
      <span class="nav-icon" style="font-size:17px; letter-spacing:-1px;">☰</span>
      <span>VIAC</span>
    </button>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

defineEmits(['open-drawer'])
const route = useRoute()

const navItems = [
  { to: '/',          icon: '🖥',  label: 'MŮSTEK'  },
  { to: '/universe',  icon: '✦',   label: 'VESMÍR'  },
  { to: '/stargate',  icon: '⭕',  label: 'BRÁNA'   },
  { to: '/research',  icon: '🔬',  label: 'VÝZKUM'  },
]

function isActive(path) {
  return path === '/' ? route.path === '/' : route.path.startsWith(path)
}
</script>
