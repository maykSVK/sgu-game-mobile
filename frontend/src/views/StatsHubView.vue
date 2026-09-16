<template>
  <div class="dash-panel">
    <div class="dash-panel-head">
      <span class="dash-panel-dot"></span> Štatistiky
    </div>
    <div class="dash-panel-body">
      <div class="dash-grid text-center">
        <!-- Zatiaľ iba Profily hráčov fungujú plnohodnotne -->
        <div class="dash-panel" style="cursor:pointer;" @click="$router.push('/stats/profile')">
           <div class="dash-panel-head justify-content-center">Profil Hráča</div>
           <div class="dash-panel-body p-4">
             <i class="fas fa-user-astronaut fa-3x" style="color: #04befe;"></i>
             <div class="mt-3 text-muted">Vyhľadávanie a štatistiky konkrétnych hráčov</div>
           </div>
        </div>
        
        <div class="dash-panel" style="opacity: 0.5; cursor:not-allowed;">
           <div class="dash-panel-head justify-content-center">Zebríček Hráčov (WIP)</div>
           <div class="dash-panel-body p-4">
             <i class="fas fa-trophy fa-3x" style="color: #666;"></i>
           </div>
        </div>

        <div class="dash-panel" style="opacity: 0.5; cursor:not-allowed;">
           <div class="dash-panel-head justify-content-center">Zebríček Aliancií (WIP)</div>
           <div class="dash-panel-body p-4">
             <i class="fas fa-users fa-3x" style="color: #666;"></i>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dash-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}
.dash-panel {
  display: flex;
  flex-direction: column;
  background: rgba(4,190,254,0.05);
  border: 1px solid rgba(4,190,254,0.3);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  height: 100%;
  transition: all 0.2s;
}
.dash-panel:hover {
  background: rgba(4,190,254,0.1);
  border-color: rgba(4,190,254,0.5);
  box-shadow: 0 0 10px rgba(4,190,254,0.2);
}
.dash-panel-head {
  background: rgba(4,190,254,0.15);
  border-bottom: 1px solid rgba(4,190,254,0.3);
  padding: 8px 12px;
  font-family: Orbitron, sans-serif;
  font-size: 13px;
  color: #fff;
  display: flex;
  align-items: center;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.dash-panel-dot {
  width: 6px; height: 6px;
  background: #04befe;
  box-shadow: 0 0 5px #04befe;
  transform: rotate(45deg);
  margin-right: 10px;
}
.dash-panel-body {
  padding: 12px;
  background: rgba(0,0,0,0.4);
  font-size: 12px;
  color: #ddd;
  flex: 1;
}
</style>
