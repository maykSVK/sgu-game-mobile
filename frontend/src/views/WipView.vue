<template>
  <div class="wip-page">
    <StarField />
    <DashboardNav v-if="navGroup === 'dashboard'" />
    <UniverseNav v-if="navGroup === 'universe'" />
    <UpgradesNav v-if="navGroup === 'upgrades'" />
    <div class="wip-content">
      <!-- Panel -->
      <div class="wip-panel">
        <div class="wip-panel-head">
          <span class="wip-dot"></span>
          {{ title }}
        </div>
        <div class="wip-body">
          <div class="wip-icon">🚧</div>
          <div class="wip-title">Pracujeme na tom</div>
          <div class="wip-sub">Táto sekcia bude čoskoro dostupná</div>
          <div class="wip-tag">v príprave</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import StarField from '../components/StarField.vue'
import DashboardNav from '../components/DashboardNav.vue'
import UniverseNav from '../components/UniverseNav.vue'
import UpgradesNav from '../components/UpgradesNav.vue'

defineProps({
  title: {
    type: String,
    default: 'Sekce ve vývoji'
  },
  navGroup: {
    type: String,
    default: null
  }
})
</script>

<style scoped>
.wip-page {
  min-height: calc(100vh - 44px);
  padding-bottom: 72px;
  position: relative;
}
.wip-content {
  position: relative; z-index: 1;
  padding: 16px 12px;
}
.wip-panel {
  background: rgba(4,190,254,0.08);
  border: 1px solid rgba(4,190,254,0.38);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}
.wip-panel::before {
  content: '';
  position: absolute; top: 0; left: 0;
  width: 10px; height: 10px;
  border-top: 2px solid #04befe; border-left: 2px solid #04befe;
}
.wip-panel::after {
  content: '';
  position: absolute; bottom: 0; right: 0;
  width: 10px; height: 10px;
  border-bottom: 2px solid #04befe; border-right: 2px solid #04befe;
}
.wip-panel-head {
  background: rgba(4,190,254,0.2);
  border-bottom: 1px solid rgba(4,190,254,0.3);
  padding: 7px 10px;
  font-family: Verdana, sans-serif;
  font-size: 12px; font-weight: bold; color: #fff;
  display: flex; align-items: center; gap: 7px;
}
.wip-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #04befe; box-shadow: 0 0 6px #04befe;
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

.wip-body {
  padding: 40px 20px;
  text-align: center;
  background: rgba(0,0,0,0.5);
}
.wip-icon { font-size: 40px; margin-bottom: 14px; }
.wip-title {
  font-family: Verdana, sans-serif;
  font-size: 15px; font-weight: bold;
  color: rgba(255,255,255,0.85);
  margin-bottom: 8px;
}
.wip-sub {
  font-family: Verdana, sans-serif;
  font-size: 12px; color: rgba(255,255,255,0.4);
  margin-bottom: 16px;
}
.wip-tag {
  display: inline-block;
  background: rgba(4,190,254,0.12);
  border: 1px solid rgba(4,190,254,0.35);
  border-radius: 2px;
  padding: 3px 10px;
  font-family: Verdana, sans-serif;
  font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
  color: #04befe;
}
</style>
