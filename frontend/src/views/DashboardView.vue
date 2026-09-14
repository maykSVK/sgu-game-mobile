<template>
  <StarField />
  <div class="sgu-scanlines" />

  <div class="dash-page">
    <div class="dash-content">
      <!-- Všetko vymazané podľa požiadavky -->
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useGameStore } from '../stores/game'
import StarField from '../components/StarField.vue'

const game = useGameStore()

onMounted(() => {
  if (!game.data) {
    game.fetchDashboard()
  }
})
</script>

<style scoped>
.dash-page {
  min-height: 100vh;
  padding-bottom: 72px;
  position: relative;
  z-index: 1;
}
.dash-content { padding: 10px; }
</style>
