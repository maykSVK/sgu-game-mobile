<template>
  <div class="dash-page">
    <div class="dash-content p-3">
      <router-view :key="$route.fullPath"></router-view>
    </div>
  </div>
</template>
<script setup>
</script>
<style scoped>
.dash-content {
  padding: 15px;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
