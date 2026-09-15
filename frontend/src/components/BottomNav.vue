<template>
  <nav class="sgu-bottom-nav">
    <RouterLink v-for="item in tabs" :key="item.to" :to="item.to" custom v-slot="{ navigate }">
      <button @click="navigate" class="sgu-nav-tab" :class="{ active: isActive(item.to) }">
        <i class="nav-icon" :class="item.icon"></i>
        <span>{{ item.label }}</span>
      </button>
    </RouterLink>

    <button class="sgu-nav-tab" @click="$emit('open-drawer')">
      <i class="nav-icon fas fa-bars"></i>
      <span>VIAC</span>
    </button>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

defineEmits(['open-drawer'])
const route = useRoute()

const tabs = [
  { to: '/',         icon: 'far fa-clipboard',   label: 'MUSTEK' },
  { to: '/universe', icon: 'fas fa-project-diagram',label: 'VESMÍR' },
  { to: '/stargate', icon: 'fas fa-circle-notch',label: 'BRÁNA'  },
  { to: '/research', icon: 'fas fa-flask',       label: 'VÝZKUM' },
  { to: '/upgrades/weapons', icon: 'fas fa-tools',       label: 'VYLEPŠENÍ' },
]

function isActive(path) {
  if (path === '/') return route.path === '/'
  if (path.startsWith('/upgrades')) return route.path.startsWith('/upgrades')
  return route.path.startsWith(path)
}
</script>
