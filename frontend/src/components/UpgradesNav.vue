<template>
  <div>
    <!-- DESKTOP TOP NAV -->
    <div class="sub-nav-wrapper desktop-only">
      <div class="sub-nav-scroll">
        <router-link to="/upgrades/weapons" class="sub-nav-btn"><i class="fas fa-crosshairs"></i> Zbraňové systémy</router-link>
        <router-link to="/upgrades/neural" class="sub-nav-btn"><i class="fas fa-brain"></i> Neurální rozhraní</router-link>
        <router-link to="/upgrades/co2" class="sub-nav-btn"><i class="fas fa-leaf"></i> Filtry CO2</router-link>
        <router-link to="/upgrades/ftl" class="sub-nav-btn"><i class="fas fa-space-shuttle"></i> FTL pohon</router-link>
        <router-link to="/upgrades/storage" class="sub-nav-btn"><i class="fas fa-boxes"></i> Sklady</router-link>
        <router-link to="/upgrades/shields" class="sub-nav-btn"><i class="fas fa-shield-alt"></i> Štíty</router-link>
        <router-link to="/upgrades/stasis" class="sub-nav-btn"><i class="fas fa-bed"></i> Stázové komory</router-link>
        <router-link to="/upgrades/engines" class="sub-nav-btn"><i class="fas fa-tachometer-alt"></i> Podsvětelné motory</router-link>
      </div>
    </div>

    <!-- MOBILE FAB NAV -->
    <div class="mobile-only fab-container">
      <div v-if="isFabOpen" class="fab-overlay" @click="isFabOpen = false"></div>

      <transition name="slide-up">
        <div v-if="isFabOpen" class="fab-menu">
          <router-link to="/upgrades/weapons" class="fab-item" @click="isFabOpen = false">
            <span class="fab-label">Zbraňové systémy</span>
            <div class="fab-icon-box"><i class="fas fa-crosshairs"></i></div>
          </router-link>
          <router-link to="/upgrades/neural" class="fab-item" @click="isFabOpen = false">
            <span class="fab-label">Neurální rozhraní</span>
            <div class="fab-icon-box"><i class="fas fa-brain"></i></div>
          </router-link>
          <router-link to="/upgrades/co2" class="fab-item" @click="isFabOpen = false">
            <span class="fab-label">Filtry CO2</span>
            <div class="fab-icon-box"><i class="fas fa-leaf"></i></div>
          </router-link>
          <router-link to="/upgrades/ftl" class="fab-item" @click="isFabOpen = false">
            <span class="fab-label">FTL pohon</span>
            <div class="fab-icon-box"><i class="fas fa-space-shuttle"></i></div>
          </router-link>
          <router-link to="/upgrades/storage" class="fab-item" @click="isFabOpen = false">
            <span class="fab-label">Sklady</span>
            <div class="fab-icon-box"><i class="fas fa-boxes"></i></div>
          </router-link>
          <router-link to="/upgrades/shields" class="fab-item" @click="isFabOpen = false">
            <span class="fab-label">Štíty</span>
            <div class="fab-icon-box"><i class="fas fa-shield-alt"></i></div>
          </router-link>
          <router-link to="/upgrades/stasis" class="fab-item" @click="isFabOpen = false">
            <span class="fab-label">Stázové komory</span>
            <div class="fab-icon-box"><i class="fas fa-bed"></i></div>
          </router-link>
          <router-link to="/upgrades/engines" class="fab-item" @click="isFabOpen = false">
            <span class="fab-label">Podsvětelné motory</span>
            <div class="fab-icon-box"><i class="fas fa-tachometer-alt"></i></div>
          </router-link>
        </div>
      </transition>

      <button class="fab-main-btn" :class="{ 'fab-open': isFabOpen }" @click="isFabOpen = !isFabOpen">
        <i class="fas" :class="isFabOpen ? 'fa-times' : 'fa-list-ul'"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isFabOpen = ref(false)
</script>

<style scoped>
/* === DESKTOP NAV === */
.sub-nav-wrapper {
  background: rgba(0, 0, 0, 0.6);
  border-bottom: 2px solid #04befe;
  padding: 0;
  width: 100%;
}
.sub-nav-scroll {
  display: flex;
  overflow-x: auto;
  gap: 4px;
  padding: 0 10px;
  scroll-behavior: smooth;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.sub-nav-scroll::-webkit-scrollbar {
  display: none;
}
.sub-nav-btn {
  flex-shrink: 0;
  background: rgba(4,190,254,0.05);
  border: 1px solid rgba(4,190,254,0.3);
  border-bottom: none;
  clip-path: polygon(10px 0, 100% 0, 100% 100%, 0 100%, 0 10px);
  padding: 10px 20px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-family: Orbitron, sans-serif;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: uppercase;
  transition: all 0.2s ease;
  margin-top: 10px;
}
.sub-nav-btn i {
  color: rgba(4,190,254,0.6);
  font-size: 14px;
}
.sub-nav-btn:hover {
  background: rgba(4,190,254,0.15);
  color: #fff;
}
.sub-nav-btn.router-link-exact-active, .sub-nav-btn.active {
  background: rgba(4,190,254,0.25);
  border: 2px solid #04befe;
  border-bottom: none;
  color: #fff;
  font-weight: bold;
}
.sub-nav-btn.router-link-exact-active i, .sub-nav-btn.active i {
  color: #04befe;
}

/* === MOBILE FAB NAV === */
.fab-container {
  position: fixed;
  bottom: 80px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.fab-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(4, 9, 20, 0.7);
  backdrop-filter: blur(2px);
  z-index: 999;
}

.fab-menu {
  position: absolute;
  bottom: 60px;
  right: 0;
  display: flex;
  flex-direction: column-reverse;
  align-items: flex-end;
  gap: 12px;
  z-index: 1000;
  padding-bottom: 10px;
}

.fab-item {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.fab-label {
  background: rgba(4, 9, 20, 0.9);
  color: #fff;
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid rgba(4,190,254,0.5);
  font-family: Orbitron, sans-serif;
  font-size: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.5);
  white-space: nowrap;
}

.fab-icon-box {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: rgba(4, 9, 20, 0.95);
  border: 2px solid rgba(4,190,254,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.6);
  position: relative;
}

.fab-item i {
  color: #04befe;
  font-size: 18px;
}

.fab-item:active .fab-icon-box {
  background: #04befe;
}
.fab-item:active i {
  color: #fff;
}

.fab-item.router-link-exact-active .fab-icon-box, .fab-item.active .fab-icon-box {
  background: rgba(4,190,254,0.2);
  border-color: #04befe;
  box-shadow: 0 0 15px rgba(4,190,254,0.6);
}

.fab-main-btn {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: #04befe;
  color: #040914;
  border: none;
  font-size: 22px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 15px rgba(4,190,254,0.5);
  z-index: 1000;
  cursor: pointer;
  transition: transform 0.3s ease, background 0.3s ease;
}

.fab-main-btn.fab-open {
  background: #ff3c3c;
  color: #fff;
  transform: rotate(90deg);
  box-shadow: 0 4px 15px rgba(255,60,60,0.5);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
  transform-origin: bottom;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

.desktop-only { display: none; }
.mobile-only { display: block; }

@media (min-width: 900px) {
  .desktop-only { display: block; }
  .mobile-only { display: none; }
}
</style>
