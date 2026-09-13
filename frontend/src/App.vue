<template>
  <div class="min-h-screen bg-sgu-dark">
    <!-- Login page – bez navigácie -->
    <RouterView v-if="route.name === 'login'" />

    <!-- Hlavný layout s bottom nav + hamburger drawer -->
    <template v-else>
      <RouterView />
      <BottomNav @open-drawer="drawerOpen = true" />
      <HamburgerDrawer
        :open="drawerOpen"
        :player-name="auth.playerName || 'Hráč'"
        :player-rank="auth.playerRank || ''"
        :player-credits="auth.playerCredits || ''"
        @close="drawerOpen = false"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import BottomNav from './components/BottomNav.vue'
import HamburgerDrawer from './components/HamburgerDrawer.vue'

const route = useRoute()
const auth = useAuthStore()
const drawerOpen = ref(false)

onMounted(() => {
  auth.setupInterceptor()
})
</script>
