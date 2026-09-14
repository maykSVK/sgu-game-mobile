<template>
  <div class="sub-nav-wrapper">
    <div class="sub-nav-scroll">
      <router-link to="/" class="sub-nav-btn" :class="{ active: $route.path === '/' }"><i class="fas fa-desktop"></i> Můstek</router-link>
      <router-link to="/destiny" class="sub-nav-btn"><i class="fas fa-cogs"></i> Strojovna</router-link>
      <router-link to="/crew" class="sub-nav-btn"><i class="fas fa-users"></i> Posádka</router-link>
      <router-link to="/checksums" class="sub-nav-btn"><i class="fas fa-history"></i> Přepočty</router-link>
      <router-link to="/hero" class="sub-nav-btn"><i class="fas fa-user-shield"></i> Hrdinové</router-link>
      <router-link to="/progress" class="sub-nav-btn"><i class="fas fa-tasks"></i> Postup</router-link>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
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
</style>
