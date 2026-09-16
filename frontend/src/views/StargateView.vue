<template>
  <StarField />
  <div class="sgu-scanlines" />

  <div class="dash-page stargate-page">
    <div class="dash-content">
      
      <div v-if="loading" style="text-align:center; padding: 30px; color: #04befe;">
        <div class="spinner"></div> Nahrávam dáta brány...
      </div>

      <template v-else>
        <div class="dash-grid">
          
          <!-- 1. Dostupné brány -->
          <section class="dash-section">
            <div class="dash-panel h-100">
              <div class="dash-panel-head">
                <span class="dash-panel-dot"></span> Dostupné brány ({{ availableGates.length }})
              </div>
              <div class="dash-panel-body p-2">
                <div v-if="availableGates.length === 0" class="text-center text-muted">
                  Žiadne brány v dosahu.
                </div>
                <table v-else class="w-100 sgu-table">
                  <thead>
                    <tr>
                      <th class="text-center">Adresa</th>
                      <th class="text-center">Vytočiť</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="gate in availableGates" :key="gate.id" :class="{ 'bg-active': selectedGate?.id === gate.id }">
                      <td class="v-a-m text-center p-2">
                        <div class="symbols-row">
                          <div 
                            v-for="(sym, i) in gate.symbols.split('-')" 
                            :key="i"
                            class="gate-sym-wrapper"
                            :class="{
                              'sym-locked': selectedGate?.id === gate.id && lockedChevrons > i,
                              'sym-failed': selectedGate?.id === gate.id && isWormholeFailed
                            }"
                          >
                            <img :src="basePath + 'img/symbols-milky-way/' + sym + '.png'" class="gate-sym-icon" />
                          </div>
                        </div>
                      </td>
                      <td class="text-center p-2">
                        <div class="stargate-dial-btn" @click="selectAndDial(gate)" :class="{ 'disabled': isDialing || isWormholeOpen }">
                          <img :src="basePath + 'img/stargate.png'" class="stargate-icon" />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <!-- 2. Hviezdna brána -->
          <section class="dash-section">
            <div class="dash-panel h-100">
              <div class="dash-panel-head">
                <span class="dash-panel-dot"></span> Hviezdna brána
              </div>
              <div class="dash-panel-body stargate-panel-body">
                
                <div class="stargate-scale-wrapper">
                  <div id="stargate-gate">
                    <!-- Locker (Západka) -->
                    <div id="stargate-locker" :class="isLockerActive ? 'stargate-locker-on' : 'stargate-locker-off'"></div>
                    
                    <!-- Rotujúci kruh s horizontom (vírom) vo vnútri -->
                    <div 
                      id="stargate-stargate" 
                      :class="isDialing || isWormholeOpen ? 'stargate-gate-action' : 'stargate-gate-off'"
                      :style="{ transform: 'rotate(' + gateRotation + 'deg)', transition: 'transform ' + rotationDuration + 'ms linear' }"
                    >
                      <div id="stargate-stargate-horizon" :class="wormholeClass"></div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>

          <!-- 3. Možné akcie -->
          <section class="dash-section">
            <div class="dash-panel h-100">
              <div class="dash-panel-head">
                <span class="dash-panel-dot"></span> Akcie po spustení brány
              </div>
              <div class="dash-panel-body p-2">
                <div v-if="!isWormholeOpen" class="text-center text-muted py-3">
                  Brána je neaktívna
                </div>
                <template v-else>
                  <table class="w-100 sgu-table mb-2">
                    <tbody>
                      <tr><th class="text-center">Vyslať tím na planétu</th></tr>
                      <tr>
                        <td class="text-center p-2">
                          <button class="sgu-btn w-100" @click="sendTeam">Vyslať tím</button>
                        </td>
                      </tr>
                      <tr><th class="text-center mt-2">Vyslať Kino (sondu) na prieskum</th></tr>
                      <tr>
                        <td class="text-center p-2">
                          <button class="sgu-btn w-100" :disabled="!stargateResult?.allow_kino" :class="{'disabled': !stargateResult?.allow_kino}" @click="sendKino">Vyslať Kino</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <table class="w-100 sgu-table mt-3" v-if="kinoResult">
                    <tbody>
                      <tr><th class="text-center">Dáta zo sondy KINO</th></tr>
                      <tr>
                        <td class="p-2 kino-data">
                          Populácia ~ {{ stargateResult?.kino_data?.population }}<br/>
                          Typ planéty -> {{ translatedPlanetType(stargateResult?.kino_data?.type) }}<br/>
                          Technológie -> {{ stargateResult?.kino_data?.technology }}<br/>
                          Vápenec ~ {{ stargateResult?.kino_data?.limestone }}<br/>
                          Voda ~ {{ stargateResult?.kino_data?.water }}<br/>
                          Jedlo ~ {{ stargateResult?.kino_data?.food }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </template>
              </div>
            </div>
          </section>

        </div>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import StarField from '../components/StarField.vue';

const basePath = import.meta.env.BASE_URL;

const loading = ref(true);
const availableGates = ref([]);
const selectedGate = ref(null);

const isDialing = ref(false);
const lockedChevrons = ref(0);
const gateRotation = ref(0);
const rotationDuration = ref(0);
const isLockerActive = ref(false);
const isWormholeOpen = ref(false);
const isWormholeFailed = ref(false);
const wormholeClass = ref(''); 
const stargateResult = ref(null);
const kinoResult = ref(false);

let dialingAudio = null;
let lockAudio = null;
let wormholeAudio = null;
let timeouts = [];

const stargateConfig = ref({ galaxy: 1, transponder: 0 });

onMounted(async () => {
  try {
    const res = await axios.get('/api/stargate');
    if (res.data && res.data.ok) {
      availableGates.value = res.data.data.availableGates || [];
      if (res.data.data.galaxy !== undefined) stargateConfig.value.galaxy = res.data.data.galaxy;
      if (res.data.data.transponder !== undefined) stargateConfig.value.transponder = res.data.data.transponder;
    }
  } catch (e) {
    console.error('Chyba nacitania brany', e);
  } finally {
    loading.value = false;
  }
  
  dialingAudio = new Audio(basePath + 'sounds/dialing.mp3');
  dialingAudio.loop = true;
  lockAudio = new Audio(basePath + 'sounds/chevron-locked.mp3');
  wormholeAudio = new Audio(basePath + 'sounds/wormhole-open.mp3');
});

onUnmounted(() => {
  stopAllAudio();
  clearAllTimeouts();
});

const stopAllAudio = () => {
  if (dialingAudio) { dialingAudio.pause(); dialingAudio.currentTime = 0; }
  if (lockAudio) { lockAudio.pause(); lockAudio.currentTime = 0; }
  if (wormholeAudio) { wormholeAudio.pause(); wormholeAudio.currentTime = 0; }
};

const clearAllTimeouts = () => {
  timeouts.forEach(t => clearTimeout(t));
  timeouts = [];
};

const triggerLocker = () => {
  isLockerActive.value = true;
  if (lockAudio) {
    lockAudio.currentTime = 0;
    lockAudio.play().catch(()=>{});
  }
  let t = setTimeout(() => {
    isLockerActive.value = false;
  }, 500);
  timeouts.push(t);
};

const lockChevron = (index) => {
  lockedChevrons.value = index;
  triggerLocker();
};

const rotateTo = (angle, durationMs) => {
  rotationDuration.value = durationMs;
  gateRotation.value = angle;
};

const selectAndDial = (gate) => {
  if (isDialing.value || isWormholeOpen.value) return; 
  selectedGate.value = gate;
  startDialingSequence();
};

const startDialingSequence = () => {
  isDialing.value = true;
  lockedChevrons.value = 0;
  isWormholeOpen.value = false;
  isWormholeFailed.value = false;
  wormholeClass.value = '';
  stargateResult.value = null;
  kinoResult.value = false;
  gateRotation.value = 0;
  rotationDuration.value = 0;
  
  clearAllTimeouts();
  
  if (dialingAudio) dialingAudio.play().catch(()=>{});

  rotateTo(110, 4000);
  timeouts.push(setTimeout(() => {
    lockChevron(1);
    rotateTo(320, 7200);
  }, 4000));

  timeouts.push(setTimeout(() => {
    lockChevron(2);
    rotateTo(40, 6500);
  }, 12580));

  timeouts.push(setTimeout(() => {
    lockChevron(3);
    rotateTo(336, 10000);
  }, 20780));

  timeouts.push(setTimeout(() => {
    lockChevron(4);
    rotateTo(130, 6000);
  }, 29780));

  timeouts.push(setTimeout(() => {
    lockChevron(5);
    rotateTo(230, 4500);
  }, 37580));

  timeouts.push(setTimeout(() => {
    lockChevron(6);
  }, 41780));

  timeouts.push(setTimeout(async () => {
    try {
      const res = await axios.post('/api/stargate/dial', { 
        symbols: selectedGate.value.symbols,
        galaxy: stargateConfig.value.galaxy,
        transponder: stargateConfig.value.transponder
      });
      
      if (res.data && res.data.ok && res.data.open_gate) {
        if (wormholeAudio) wormholeAudio.play().catch(()=>{});
        
        wormholeClass.value = 'stargate-stargate-horizon';
        
        timeouts.push(setTimeout(() => {
          stopAllAudio();
          wormholeClass.value = 'stargate-stargate-open';
          isWormholeOpen.value = true;
          isDialing.value = false;
          stargateResult.value = res.data;
        }, 5000));
        
      } else {
        stopAllAudio();
        isWormholeFailed.value = true;
        isDialing.value = false;
      }
    } catch (e) {
      stopAllAudio();
      isWormholeFailed.value = true;
      isDialing.value = false;
    }
  }, 45780));
};

const sendTeam = () => {
  alert('Tím bol vyslaný! (MOCK AKCIA)');
};

const sendKino = () => {
  kinoResult.value = true;
};

const translatedPlanetType = (type) => {
  if (!type) return '';
  const types = {
    'ice': 'ľadová',
    'volcanic': 'vulkanická',
    'earth': 'zemská',
    'water': 'vodná',
    'desert': 'púštna',
    'toxic': 'toxická',
    'asteroid': 'asteroid'
  };
  return types[type] || type;
};
</script>

<style scoped>
/* GLOBÁLNE SGU DASHBOARD ŠTÝLY */
.dash-page {
  position: relative;
  z-index: 2;
  min-height: 100vh;
}
.dash-content {
  padding: 15px;
}
.dash-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 15px;
  align-items: stretch;
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
}
.dash-panel::before {
  content: "";
  position: absolute; top: 0; left: 0;
  width: 15px; height: 15px;
  border-top: 2px solid #04befe;
  border-left: 2px solid #04befe;
  z-index: 1;
}
.dash-panel::after {
  content: "";
  position: absolute; bottom: 0; right: 0;
  width: 15px; height: 15px;
  border-bottom: 2px solid #04befe;
  border-right: 2px solid #04befe;
  z-index: 1;
}
.dash-panel-head {
  background: rgba(4,190,254,0.15);
  border-bottom: 1px solid rgba(4,190,254,0.3);
  padding: 8px 12px;
  font-family: Orbitron, sans-serif;
  font-size: 13px;
  color: #fff;
  display: flex;
  text-align: center;
  justify-content: center;
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
  height: auto;
}

/* SGU Tables */
.sgu-table {
  border-collapse: collapse;
  width: 100%;
}
.sgu-table th {
  background: rgba(4, 190, 254, 0.2);
  color: #04befe;
  border-bottom: 1px solid rgba(4, 190, 254, 0.5);
  padding: 8px;
  font-size: 0.9rem;
}
.sgu-table td {
  padding: 8px;
  border-bottom: 1px solid rgba(4, 190, 254, 0.2);
}
.sgu-table tr.bg-active td {
  background: rgba(4, 190, 254, 0.15);
}

.sgu-btn {
  background: linear-gradient(180deg, rgba(4,190,254,0.3) 0%, rgba(4,190,254,0.1) 100%);
  border: 1px solid #04befe;
  color: #fff;
  padding: 6px 12px;
  border-radius: 3px;
  cursor: pointer;
  text-shadow: 0 0 5px #04befe;
  transition: all 0.2s;
}
.sgu-btn:hover:not(.disabled) {
  background: rgba(4,190,254,0.4);
  box-shadow: 0 0 10px rgba(4,190,254,0.5);
}
.sgu-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: #555;
  text-shadow: none;
}

/* --------------------------------------
   STARGATE VISUALS 
--------------------------------------- */

.stargate-panel-body {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 0;
  overflow: hidden;
}

.stargate-scale-wrapper {
  position: relative;
  width: 368px;
  height: 291px; /* 276px gate + 15px offset pre zapadku */
  transform-origin: center center;
}

#stargate-gate {
  width: 368px;
  height: 291px;
  position: absolute;
  top: 0;
  left: 0;
}

#stargate-locker {
  width: 16px;
  height: 18px;
  position: absolute;
  top: 26px; /* Zapadka posunutá výrazne nižšie, priamo do drážky */
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

#stargate-stargate {
  position: absolute;
  top: 15px; /* Brana je posunuta nizsie pod zapadku (obnovene!) */
  left: 0;
  width: 368px;
  height: 276px;
  z-index: 5;
}

.stargate-gate-off {
  background-image: url('/sgu-game-mobile/img/stargate-off.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.stargate-gate-action {
  background-image: url('/sgu-game-mobile/img/stargate-active.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.stargate-locker-off {
  background-image: url('/sgu-game-mobile/img/stargate-locker-off.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.stargate-locker-on {
  background-image: url('/sgu-game-mobile/img/stargate-locker-on.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.stargate-stargate-horizon {
  background-image: url('/sgu-game-mobile/img/stargate.gif');
  background-repeat: no-repeat;
  width: 196px;
  height: 196px;
  position: absolute;
  top: 40px;
  left: 86px;
  z-index: 6;
  border-radius: 50%;
}

.stargate-stargate-open {
  background-image: url('/sgu-game-mobile/img/stargate-open.gif');
  background-repeat: no-repeat;
  width: 196px;
  height: 196px;
  position: absolute;
  top: 40px;
  left: 86px;
  z-index: 6;
  border-radius: 50%;
}

/* RESPONSIVE SCALING PRE MOBILY (s orezanim prazdneho okraja) */
@media (max-width: 420px) {
  .stargate-scale-wrapper {
    transform: scale(0.85);
    margin: -22px -27px;
  }
}
@media (max-width: 360px) {
  .stargate-scale-wrapper {
    transform: scale(0.75);
    margin: -36px -46px;
  }
}
@media (max-width: 300px) {
  .stargate-scale-wrapper {
    transform: scale(0.65);
    margin: -51px -64px;
  }
}

/* --------------------------------------
   ADRESY A CHEVRONY PRIAMO V TABUĽKE
--------------------------------------- */
.stargate-icon {
  width: 35px;
  height: 35px;
  margin: auto;
}
.stargate-dial-btn {
  cursor: pointer;
  transition: transform 0.2s;
  display: inline-block;
}
.stargate-dial-btn:hover:not(.disabled) {
  transform: scale(1.1);
}
.stargate-dial-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(100%);
}

.symbols-row {
  display: flex;
  gap: 5px;
  justify-content: center;
  align-items: center;
}

.gate-sym-wrapper {
  border: 1px solid #14354c; 
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  transition: all 0.3s;
  padding: 3px;
  border-radius: 4px;
}
.gate-sym-wrapper.sym-locked {
  background-color: #1ac71a;
  border-color: #0f0;
  box-shadow: 0 0 10px rgba(26, 199, 26, 0.8);
}
.gate-sym-wrapper.sym-failed {
  background-color: #da1616;
  border-color: #f00;
}

.gate-sym-icon {
  width: 25px;
  height: 25px;
  background-color: #ffffff;
  border-radius: 2px;
  padding: 1px;
}

.kino-data {
  font-size: 0.9rem;
  line-height: 1.4;
  color: #aae0ff;
}
</style>
