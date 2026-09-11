<template>
  <div class="min-h-screen bg-sgu-dark">
    <!-- Login page – bez navigácie -->
    <RouterView v-if="route.name === 'login'" />

    <!-- Hlavný layout s bottom nav -->
    <template v-else>
      <RouterView />
      <BottomNav />
    </template>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import BottomNav from './components/BottomNav.vue'

const route = useRoute()
const auth = useAuthStore()

onMounted(() => {
  auth.setupInterceptor()
})
</script>
