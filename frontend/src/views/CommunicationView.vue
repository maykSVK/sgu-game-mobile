<template>
  <StarField />
  <div class="sgu-scanlines" />

  <div class="dash-page communication-page">
    <CommunicationNav />
    
    <div class="dash-content">
      <router-view :key="$route.fullPath"></router-view>
    </div>
  </div>
</template>

<script setup>
import StarField from '../components/StarField.vue';
import CommunicationNav from '../components/CommunicationNav.vue';
</script>

<style scoped>
.dash-page {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  padding-bottom: 70px;
}
.dash-content {
  padding: 15px;
}
</style>
