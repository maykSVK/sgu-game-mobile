<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import axios from 'axios';
import Panzoom from '@panzoom/panzoom';
import UniverseNav from '../components/UniverseNav.vue';

const universeData = ref(null);
const loading = ref(true);
const error = ref('');
const isModalOpen = ref(false);
const selectedObject = ref(null);
const currentGalaxy = ref('air');
const mapContainer = ref(null);
const flightDistance = ref(0);
let panzoomInstance = null;

const getBoundedPan = (x, y, scale) => {
  if (!mapContainer.value || !mapContainer.value.parentElement) return { x, y };
  const vw = mapContainer.value.parentElement.clientWidth;
  const vh = mapContainer.value.parentElement.clientHeight;
  const mw_s = 1000 * scale;
  const mh_s = 1000 * scale;
  
  let boundedX = x;
  let boundedY = y;
  
  if (mw_s > vw) {
    const maxX = 500 - 500 / scale;
    const minX = vw / scale - 500 / scale - 500;
    boundedX = Math.max(minX, Math.min(maxX, x));
  } else {
    boundedX = (vw / 2 - 500) / scale;
  }
  
  if (mh_s > vh) {
    const maxY = 500 - 500 / scale;
    const minY = vh / scale - 500 / scale - 500;
    boundedY = Math.max(minY, Math.min(maxY, y));
  } else {
    boundedY = (vh / 2 - 500) / scale;
  }
  
  return { x: boundedX, y: boundedY };
};

const initPanzoom = () => {
  if (mapContainer.value) {
    panzoomInstance = Panzoom(mapContainer.value, {
      maxScale: 5,
      minScale: 0.2,
      step: 0.4,
      startScale: 1,
      setTransform: (elem, { scale, x, y }) => {
        const bounded = getBoundedPan(x, y, scale);
        panzoomInstance.setStyle(
          'transform',
          `scale(${scale}) translate(${bounded.x}px, ${bounded.y}px)`
        );
      }
    });
    // Povolit aj scrollovanie mysou
    mapContainer.value.parentElement.addEventListener('wheel', panzoomInstance.zoomWithWheel);
    mapContainer.value.addEventListener('panzoompan', updateTooltipPosition);
    mapContainer.value.addEventListener('panzoomzoom', updateTooltipPosition);
  }
};

const zoomIn = () => { if (panzoomInstance) panzoomInstance.zoomIn(); };
const zoomOut = () => { if (panzoomInstance) panzoomInstance.zoomOut(); };

const isGalaxyModalOpen = ref(false);
const tooltipPos = ref({ left: '0px', top: '0px' });

const closeModal = () => {
  isModalOpen.value = false;
  isGalaxyModalOpen.value = false;
  selectedObject.value = null;
};

const handleMapClick = (e) => {
  // If we clicked on an object, ignore (it is handled by openObject)
  if (e.target.closest('.space-object') || e.target.closest('.destiny-ship') || e.target.closest('svg')) {
    return;
  }
  
  if (!mapContainer.value || !panzoomInstance || !universeData.value?.destiny) return;
  const rect = mapContainer.value.getBoundingClientRect();
  const scale = panzoomInstance.getScale();
  const boundedPan = getBoundedPan(panzoomInstance.getPan().x, panzoomInstance.getPan().y, scale);
  
  // Reverse transform to get map coordinates
  // screenX = 500 + scale * (objX - 500 + boundedPan.x) -> objX = (screenX - 500) / scale + 500 - boundedPan.x
  const screenX = e.clientX - rect.left;
  const screenY = e.clientY - rect.top;
  
  // Tieto suradnice odrazaju CSS scale a origin
  // Nas transform-origin je 50% 50% = stred = 500, 500
  // Lepsie je ziskat suradnice priamo z DOM bez Panzoom scale takto:
  
  const clickX = screenX / scale;
    const clickY = screenY / scale;
  
  // V mape mame origin posunuty o 8px
  const mapX = clickX - 8;
  const mapY = 1000 - clickY + 8;
  
  if (mapX < 0 || mapX > 1000 || mapY < 0 || mapY > 1000) return;
  
  const lightYears = Math.round(Math.sqrt(Math.pow(mapX - universeData.value.destiny.x, 2) + Math.pow(mapY - universeData.value.destiny.y, 2)));
  const time = (lightYears / 163).toFixed(2);
  
  const tooltipHtml = `
    <div class="heading"><table><tbody>
      <tr><th colspan="2">Nový kurz pro Destiny</th></tr>
      <tr><td colspan="2" style="white-space: normal;">Cílové souřadnice jsou vzdálené ${lightYears * 100} světelných let.<br>Destiny tuto vzdálenost uletí za ${time} hodin.</td></tr>
      <tr><td colspan="2">
        <form method="post" class="align-content-center">
          <input type="hidden" name="destination-x" value="${Math.round(mapX)}">
          <input type="hidden" name="destination-y" value="${Math.round(mapY)}">
          <input type="submit" class="btn-bevel btn-bevel-sm table-button-resizer" name="submit" value="Letět">
        </form>
      </td></tr>
    </tbody></table></div>
  `;
  
  selectedObject.value = {
    id: 'custom-destination',
    x: mapX,
    y: mapY,
    tooltipHtml: tooltipHtml,
    isMapClick: true
  };
  
  isModalOpen.value = true;
  flightDistance.value = lightYears * 100;
  
  setTimeout(updateTooltipPosition, 10);
};

const openGalaxyInfo = () => {
  if (universeData.value && universeData.value.galaxyInfo) {
    selectedObject.value = { id: 'galaxyInfo', tooltipHtml: universeData.value.galaxyInfo.html };
    isGalaxyModalOpen.value = true;
  }
};

const fetchUniverse = async (galaxy = null) => {
  try {
    loading.value = true;
    error.value = '';
    const url = galaxy ? `/api/universe?galaxy=${galaxy}` : '/api/universe';
    const res = await axios.get(url);
    if (res && res.data && res.data.ok) {
      universeData.value = res.data.data;
      nextTick(() => {
        if (!panzoomInstance) initPanzoom();
      });
    } else {
      error.value = 'Nepodarilo sa načítať mapu vesmíru.';
    }
  } catch (e) {
    error.value = 'Chyba siete.';
  } finally {
    loading.value = false;
  }
};

const updateTooltipPosition = () => {
  if (!isModalOpen.value || !selectedObject.value || !mapContainer.value) return;
  const scale = panzoomInstance.getScale();
  const pan = panzoomInstance.getPan();
  const boundedPan = getBoundedPan(pan.x, pan.y, scale);
  
  // Stred vybraneho objektu vo svete:
  const objX = selectedObject.value.x + 8;
  const objY = (1000 - selectedObject.value.y) + 8;
  
  // Pozicia na obrazovke
  // transform-origin je 50% 50% (500, 500)
  const screenX = 500 + scale * (objX - 500 + boundedPan.x);
  const screenY = 500 + scale * (objY - 500 + boundedPan.y);
  
  const isBottom = screenY < 350; // Zobrazit pod planetou ak nie je dost miesta hore
  
  tooltipPos.value = {
    left: screenX + 'px',
    top: screenY + 'px',
    isBottom
  };
};

const openObject = (obj, event) => {
  let targetId = null;
  if (event && event.target) {
    const el = event.target.closest('[id]');
    if (el) targetId = el.id;
  }
  
  let tooltip = (targetId && universeData.value.tooltips && universeData.value.tooltips[targetId]) || 
                  obj.tooltipHtml;
                  
  // Fallback for enemy occupier if tooltip is missing from DOM
  if (!tooltip && (targetId?.includes('occupier') || obj.id.includes('occupier') || (obj.innerHtml && obj.innerHtml.includes('occupier-icon')))) {
    tooltip = '<table class="mwt"><tbody><tr><th colspan="2">Neznámý nepřítel</th></tr><tr><td colspan="2">Senzory detekovaly cizí aktivitu na oběžné dráze. Může se jednat o nepřítele.</td></tr></tbody></table>';
  }

  if (tooltip) {
    // Nahradit pripadne chybajuce /img za /sgu-game-mobile/img (podpora pre " aj ')
    let fixedTooltip = tooltip.replace(/src=(["'])\/img\//g, 'src=$1/sgu-game-mobile/img/');
    
    selectedObject.value = { ...obj, tooltipHtml: fixedTooltip };
    isModalOpen.value = true;
    
    // Vypocet vzdialenosti
    if (universeData.value && universeData.value.destiny) {
      const dX = universeData.value.destiny.x;
      const dY = universeData.value.destiny.y;
      flightDistance.value = Math.round(Math.sqrt(Math.pow(obj.x - dX, 2) + Math.pow(obj.y - dY, 2))) * 100;
    }
    
    // Ziskat spravnu poziciu hned po otvoreni (treba maly delay kym sa UI zrenderuje)
    setTimeout(updateTooltipPosition, 10);
  }
};

// Handle forms inside the Tipped HTML
const handleActionClick = async (event) => {
  const form = event.target.closest('form');
  if (form) {
    event.preventDefault(); // Prevent standard submission
    
    const formData = new FormData(form);
    const postData = {};
    for (const [key, value] of formData.entries()) {
      postData[key] = value;
    }
    
    // Add submit button's name/value if it exists
    if (event.target.tagName === 'INPUT' && event.target.type === 'submit') {
      postData[event.target.name] = event.target.value;
    }
    
    // Send to proxy
    try {
      loading.value = true;
      closeModal();
      await axios.post('/api/universe', postData);
      // Reload map after action
      await fetchUniverse(currentGalaxy.value);
    } catch(e) {
      error.value = 'Akcia zlyhala.';
      loading.value = false;
    }
  }
};

const switchGalaxy = (galaxy) => {
  currentGalaxy.value = galaxy;
  fetchUniverse(galaxy);
};

onMounted(() => {
  fetchUniverse();
});
</script>

<template>
  <div class="universe-page">
    <UniverseNav />
    <div v-if="loading" class="text-center p-3">
      <div class="spinner"></div> Načítavam vesmír...
    </div>
    
    <div v-else-if="error" class="error-msg p-3">
      {{ error }}
    </div>

    <div v-else-if="universeData" class="universe-scroll-container">
      <!-- Priesvitny overlay na zatvorenie popoveru mimo mapy -->
      <div v-if="isModalOpen" class="popover-overlay" @click="closeModal"></div>

      <div class="universe-map" ref="mapContainer" @click="handleMapClick">
        
        <!-- Space Objects (Planets, Quests, Markets, Anomalies) -->
        <div 
          v-for="obj in universeData.objects" 
          :key="obj.id"
          :class="['space-object', obj.classes]"
          :style="{ left: obj.x + 'px', top: (1000 - obj.y) + 'px' }"
          @click.stop="openObject(obj, $event)"
          v-html="obj.innerHtml"
        ></div>

        
          <!-- ACTIVE FLIGHT ORIGIN AND TARGET POINTS -->
          <div v-if="universeData.destiny.origin"
            class="origin-point space-object"
            style="transform: translate(-12px, -24px); z-index: 10; width: 24px; height: 24px; background-repeat: no-repeat;"
            :style="{ left: universeData.destiny.origin.x + 'px', top: (1000 - universeData.destiny.origin.y) + 'px' }"
          ></div>
          <div v-if="universeData.destiny.target"
            class="target-point space-object"
            style="transform: translate(-12px, -24px); z-index: 10; width: 24px; height: 24px; background-repeat: no-repeat;"
            :style="{ left: universeData.destiny.target.x + 'px', top: (1000 - universeData.destiny.target.y) + 'px' }"
          ></div>

          <!-- SVG Linia drahy a Radiusy -->
        <svg v-if="universeData.destiny" class="flight-path-svg" width="1000" height="1000">
          <!-- Destiny Radius (White circle) -->
          <circle 
            :cx="universeData.destiny.x + 8" 
            :cy="(1000 - universeData.destiny.y) + 3" 
            :r="universeData.destiny.radius || 100" 
            fill="none" 
            stroke="rgba(255, 255, 255, 0.4)" 
            stroke-width="1.5" 
          />
          
          <!-- Target Radius and Flight Line -->
          <g v-if="selectedObject && selectedObject.id !== 'galaxyInfo'">
            <circle 
              :cx="selectedObject.x + 6" 
              :cy="(1000 - selectedObject.y) + 6" 
              :r="universeData.destiny.radius || 100" 
              fill="none" 
              stroke="#00c3ff" 
              stroke-width="1.5" 
            />
            
            <line 
              :x1="universeData.destiny.x + 8" 
              :y1="(1000 - universeData.destiny.y) + 3" 
              :x2="selectedObject.x + 6" 
              :y2="(1000 - selectedObject.y) + 6" 
              stroke="#00c3ff" 
              stroke-width="1.5" 
              stroke-dasharray="4,4" 
            />
          </g>
        
          <!-- ACTIVE FLIGHT LINE -->
          <g v-if="universeData.destiny.target && universeData.destiny.origin">
            <line 
              :x1="universeData.destiny.origin.x" 
              :y1="(1000 - universeData.destiny.origin.y)" 
              :x2="universeData.destiny.target.x" 
              :y2="(1000 - universeData.destiny.target.y)" 
              stroke="#2660A2" 
              stroke-width="1" 
              stroke-dasharray="4,4" 
            />
          </g>

          </svg>

        <!-- Destiny -->
        <div 
          class="destiny-ship" 
          :style="{ left: (universeData.destiny.x - 8) + 'px', top: (1000 - (universeData.destiny.y + 12)) + 'px' }"
        ></div>
        
      </div>
      
      <!-- Popover Tooltip, outside map container so it doesn't scale, positioned via absolute coords over the wrapper -->
      <div 
        v-if="isModalOpen" 
        class="popover-tooltip dash-raw-html"
        :class="{ 'popover-bottom': tooltipPos.isBottom }"
        :style="{ left: currentPos.x + 'px', top: currentPos.y + 'px', transform: currentTransform }"
          @mousedown="startDrag"
          @touchstart="startDrag"
        @click.stop
      >
        <button class="modal-close" @click="closeModal"><i class="fas fa-times"></i></button>
        <div class="distance-info" v-if="flightDistance > 0 && selectedObject.id !== 'galaxyInfo'">
          Vzdialenosť: <strong>{{ flightDistance }} svetelných let</strong>
        </div>
        <div 
          class="tooltip-content" 
          v-html="selectedObject.tooltipHtml"
          @click="handleActionClick"
        ></div>
      </div>
    </div>

    <!-- Tlacidlo na zobrazenie informacii o galaxiach -->
    <button v-if="universeData && universeData.galaxyInfo" class="galaxy-info-btn" @click="openGalaxyInfo">
      <i class="fas fa-info-circle"></i> Galaxie
    </button>

    
    
    <!-- Modal pre Galaxie -->
    <div v-if="isGalaxyModalOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content dash-raw-html">
        <button class="modal-close" @click="closeModal"><i class="fas fa-times"></i></button>
        <div 
          class="tooltip-content" 
          v-html="selectedObject.tooltipHtml"
          @click="handleActionClick"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.universe-page {
  width: 100%;
  height: calc(100vh - 60px); /* Odpocitame vysku navbaru */
  background-color: rgba(11, 19, 25, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  overflow: hidden;
}

.universe-scroll-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  touch-action: none;
}

.universe-map {
  width: 1000px;
  height: 1000px;
  position: relative;
  /* Removed radial background */
}

/* Objekty na mape */
.space-object {
  position: absolute;
  /* Triedy z povodnej hry určia šírku/výšku a ikonku, my len pridáme cursor pointer */
  cursor: pointer;
  transform: translate(0%, 0%);
}

/* Triedy pôvodnej hry pre planéty a objekty - keďže idú dynamicky do v-html a classes, musia byť :deep alebo definované sem */
/* Kedze su pridavane priamo na .space-object ktory JE vo vue template (obj.classes), :deep netreba pre tieto samotne tagy */

.planet-type-desert { width: 12px; height: 12px; background-image: url('/sgu-game-mobile/img/planet-desert.png'); background-size: 100% 100%; border-radius: 50%; }
.planet-type-earth { width: 16px; height: 16px; background-image: url('/sgu-game-mobile/img/planet-earth.png'); background-size: 100% 100%; border-radius: 50%; }
.planet-type-ice { width: 14px; height: 14px; background-image: url('/sgu-game-mobile/img/planet-ice.png'); background-size: 100% 100%; border-radius: 50%; }
.planet-type-toxic { width: 14px; height: 14px; background-image: url('/sgu-game-mobile/img/planet-toxic.png'); background-size: 100% 100%; border-radius: 50%; }
.planet-type-volcanic { width: 10px; height: 10px; background-image: url('/sgu-game-mobile/img/planet-volcanic.png'); background-size: 100% 100%; border-radius: 50%; }
.planet-type-water { width: 15px; height: 15px; background-image: url('/sgu-game-mobile/img/planet-water.png'); background-size: 100% 100%; border-radius: 50%; }
.planet-type-asteroid { width: 14px; height: 14px; background-image: url('/sgu-game-mobile/img/asteroid.png'); background-size: 100% 100%; border-radius: 50%; }

:deep(.planet-universe-preview) {
  width: 180px;
  height: 180px;
  margin: 10px auto;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  border-radius: 50%;
  box-shadow: 0 0 20px rgba(0,195,255,0.2);
}

:deep(.planet-desert) { background-image: url('/sgu-game-mobile/img/planet-desert.png'); }
:deep(.planet-earth) { background-image: url('/sgu-game-mobile/img/planet-earth.png'); }
:deep(.planet-ice) { background-image: url('/sgu-game-mobile/img/planet-ice.png'); }
:deep(.planet-toxic) { background-image: url('/sgu-game-mobile/img/planet-toxic.png'); }
:deep(.planet-volcanic) { background-image: url('/sgu-game-mobile/img/planet-volcanic.png'); }
:deep(.planet-water) { background-image: url('/sgu-game-mobile/img/planet-water.png'); }

.quest-icon { width: 20px; height: 20px; background-image: url('/sgu-game-mobile/img/quest.png'); background-size: 100% 100%; }
.space-market-station { width: 20px; height: 28px; background-image: url('/sgu-game-mobile/img/market-station.png'); background-size: 100% 100%; }
.galactic-bridge { width: 32px; height: 32px; background-image: url('/sgu-game-mobile/img/galaxy-bridge-white.png'); background-size: 100% 100%; }

.space-object-nebula { width: 40px; height: 32px; background-image: url('/sgu-game-mobile/img/nebula.png'); background-size: 100% 100%; }
.space-object-debris { width: 40px; height: 32px; background-image: url('/sgu-game-mobile/img/debris.png'); background-size: 100% 100%; }
.space-object-seed-ship { width: 45px; height: 26px; background-image: url('/sgu-game-mobile/img/seed-ship.png'); background-size: 100% 100%; }

.target-point { width: 24px; height: 24px; background-image: url('/sgu-game-mobile/img/target-point.png'); background-repeat: no-repeat; background-size: 100% 100%; }
.origin-point { width: 24px; height: 24px; background-image: url('/sgu-game-mobile/img/origin-point.png'); background-repeat: no-repeat; background-size: 100% 100%; }

.occupier-icon { color: white; display: inline-block; background: rgba(0,0,0,0.5); border-radius: 3px; padding: 2px; }

.flight-path-svg {
  position: absolute;
  top: 0; left: 0;
  width: 1000px; height: 1000px;
  pointer-events: none;
  z-index: 998;
}

/* Destiny */
.destiny-ship {
  position: absolute;
  width: 33px; 
  height: 30px;
  background-image: url('/sgu-game-mobile/img/destiny-universe.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  z-index: 1000;
  /* posun na stred, kedze povodna hra odratavala 8px z x a 12px z y */
}

.destiny-radius {
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: 1px solid rgba(0, 195, 255, 0.4);
  background-color: rgba(0, 195, 255, 0.05); /* Jemné modré pozadie senzoru */
  pointer-events: none;
  z-index: 998;
}

.galaxy-info-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 100;
  background: rgba(11, 19, 25, 0.85);
  border: 1px solid #00c3ff;
  color: #00c3ff;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.9rem;
  box-shadow: 0 0 10px rgba(0, 195, 255, 0.2);
  display: flex;
  align-items: center;
  gap: 5px;
}
.galaxy-info-btn i {
  font-size: 1rem;
}
.galaxy-info-btn:active {
  background: rgba(0, 195, 255, 0.2);
}

.zoom-controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 1001;
}

.zoom-controls button {
  background: rgba(0, 195, 255, 0.2);
  border: 1px solid #00c3ff;
  color: #00c3ff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(0,195,255,0.3);
}

/* --- Modals & Tooltips --- */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 15px;
}

.modal-content {
  background: #0b1319;
  border: 1px solid #1c3547;
  border-radius: 8px;
  padding: 20px;
  max-width: 400px;
  width: 100%;
  position: relative;
  color: white;
  box-shadow: 0 4px 15px rgba(0, 195, 255, 0.3);
  max-height: 80vh;
  overflow-y: auto;
}

/* --- Popover Tooltip --- */
.popover-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 999;
}

.popover-tooltip {
  position: absolute;
  
  background: #0b1319;
  border: 1px solid #1c3547;
  border-radius: 4px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.8);
  color: #fff;
  z-index: 1000;
  min-width: 220px;
  width: max-content;
  max-width: 350px;
  pointer-events: auto;
}

.popover-tooltip.popover-bottom {
  
}

.popover-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -8px;
  border-width: 8px 8px 0 8px;
  border-style: solid;
  border-color: #0b1319 transparent transparent transparent;
}
.popover-tooltip.popover-bottom::after {
  top: auto;
  bottom: 100%;
  border-width: 0 8px 8px 8px;
  border-color: transparent transparent #0b1319 transparent;
}

.popover-tooltip::before {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -9px;
  margin-top: 1px;
  border-width: 9px 9px 0 9px;
  border-style: solid;
  border-color: #1c3547 transparent transparent transparent;
}
.popover-tooltip.popover-bottom::before {
  top: auto;
  bottom: 100%;
  margin-top: 0;
  margin-bottom: 1px;
  border-width: 0 9px 9px 9px;
  border-color: transparent transparent #1c3547 transparent;
}

.modal-close {
  position: absolute;
  top: 5px;
  right: 5px;
  background: none;
  border: none;
  color: #00c3ff;
  font-size: 1.2rem;
  cursor: pointer;
  z-index: 10;
}

.distance-info {
  background: transparent;
  border-bottom: 1px solid #1c3547;
  color: #00c3ff;
  font-size: 0.85rem;
  padding: 8px;
  text-align: center;
  color: #a3c2db;
  border-bottom: 1px solid #1c3547;
}

:deep(.mwt), :deep(.mwp), :deep(.pl-infra table) {
  width: 100%;
  min-width: 260px;
  border-collapse: collapse;
}

:deep(.mwt th), :deep(.mwp th), :deep(.pl-infra table th) {
  background: linear-gradient(to bottom, #16405f, #0d2840);
  padding: 8px;
  font-size: 0.95rem;
  border-bottom: 1px solid #1c3547;
  color: white;
  text-align: center;
  color: #a3c2db;
}

:deep(.mwt td), :deep(.mwp td), :deep(.pl-infra table td) {
  padding: 8px;
  background: #0b1319;
  border-bottom: 1px solid #111a22;
  text-align: center;
  color: #a3c2db;
}

:deep(.gate-address) {
  background-color: white;
  border-radius: 3px;
  max-width: 180px;
  margin: 5px auto;
  padding: 2px;
  display: flex;
  justify-content: center;
}

:deep(.gate-address img) {
  vertical-align: bottom;
}

:deep(.btn-bevel) {
  background: linear-gradient(to bottom, #2183a6, #125570);
  border: 1px solid #2b9ec7;
  color: #fff;
  padding: 6px 12px;
  border-radius: 3px;
  cursor: pointer;
  font-weight: bold;
  text-transform: none;
  font-size: 0.9rem;
  transition: all 0.2s;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.2);
}

:deep(.btn-bevel:active) {
  background: linear-gradient(to bottom, #125570, #2183a6);
  box-shadow: inset 0 2px 5px rgba(0,0,0,0.5);
}

:deep(.table-button-resizer) {
  width: 100%;
  margin-top: 5px;
}

@media (max-width: 768px) {
  .popover-tooltip {
    position: fixed !important;
    
    
    
    width: 90vw !important;
    max-width: 400px !important;
    z-index: 9999 !important;
  }
  .popover-tooltip::after, .popover-tooltip::before {
    display: none !important;
  }
  .popover-overlay {
    position: fixed !important;
    background: rgba(0,0,0,0.6);
  }
}

.tooltip-content {
  padding: 10px;
  max-height: 60vh;
  overflow-y: auto;
  overflow-x: hidden;
}


:deep(.mwt th), :deep(.mwp th), :deep(.pl-infra table th), .distance-info {
  cursor: grab;
}
:deep(.mwt th:active), :deep(.mwp th:active), :deep(.pl-infra table th:active), .distance-info:active {
  cursor: grabbing;
}
</style>

