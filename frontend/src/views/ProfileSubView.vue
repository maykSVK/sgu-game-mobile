<template>
  <div class="profile-view">
    
    <!-- SEARCH BAR -->
    <div class="dash-panel mb-3" style="max-width: 400px;">
       <div class="dash-panel-head">
         <span class="dash-panel-dot"></span> Zadejte nick hráče
       </div>
       <div class="dash-panel-body search-body p-2">
         <form @submit.prevent="searchProfile" class="d-flex w-100 gap-2">
            <input type="text" v-model="searchName" class="sgu-input flex-grow-1" placeholder="Nick hráče..." />
            <button type="submit" class="sgu-btn-small px-3"><i class="fas fa-search"></i> Hledat</button>
         </form>
       </div>
    </div>

    <!-- LOADING / ERROR -->
    <div v-if="loading" class="text-center p-4 text-info">
       <i class="fas fa-spinner fa-spin fa-2x"></i> Načítám data...
    </div>
    <div v-else-if="error" class="text-center p-4 text-danger">
       {{ error }}
    </div>
    <div v-else-if="!profileData?.found" class="text-center p-4 text-muted">
       Vyhledejte hráče zadáním jména.
    </div>

    <!-- PROFILE CONTENT -->
    <div v-else class="profile-grid">
      
      <!-- HRÁČ -->
      <div class="dash-panel" style="align-self: start;">
         <div class="dash-panel-head flex justify-center">HRÁČ</div>
         <div class="dash-panel-body text-center flex flex-col items-center" style="min-height: auto !important; padding-bottom: 12px;">
            
            <div class="flex items-center justify-center w-full mt-2" style="gap: 15px; flex-wrap: nowrap;">
               <!-- Vľavo: Avatar -->
               <div class="shrink-0">
                  <img v-if="profileData.user.avatar" :src="profileData.user.avatar" class="profile-avatar" />
                  <div v-else class="profile-avatar-placeholder"></div>
               </div>
               
               <!-- Vpravo: Údaje a tlačidlo -->
               <div class="flex flex-col items-center justify-center grow" style="min-width: 0;">
                  <div class="flex items-center justify-center gap-2 mb-2" style="white-space: nowrap;">
                     <img v-if="profileData.user.countryFlag" :src="profileData.user.countryFlag" width="16" />
                     <i v-if="profileData.user.isVip" class="fas fa-star text-warning" title="V.I.P. Hráč"></i>
                     <span class="font-bold" style="font-size: 18px;" :class="profileData.user.statusClass">{{ profileData.user.username }}</span>
                  </div>
                  
                  <button class="sgu-btn-small" style="white-space: nowrap;" @click="sendMessage(profileData.user.username)">
                     <i class="fas fa-envelope"></i> NAPSAT ZPRÁVU
                  </button>
               </div>
            </div>
         </div>
      </div>

      <!-- INFORMACE -->
      <div class="dash-panel info-panel">
         <div class="dash-panel-head">INFORMACE</div>
         <div class="dash-panel-body">
            <table class="sgu-table info-table">
               <tbody>
                  <tr v-if="profileData.info.hero"><td>Hrdina</td><td>{{ profileData.info.hero }}</td></tr>
                  <tr v-if="profileData.info.alliance"><td>Aliance</td><td>{{ profileData.info.alliance }}</td></tr>
                  <tr v-if="profileData.info.lastActive"><td>Naposledy aktivní</td><td>{{ profileData.info.lastActive }}</td></tr>
                  <tr v-if="profileData.info.status"><td>SGU-Game status</td><td>{{ profileData.info.status }}</td></tr>
                  <tr v-if="profileData.info.holiday"><td>Prázdninový mod</td><td>{{ profileData.info.holiday }}</td></tr>
                  <tr v-if="profileData.info.arena"><td>Aréna (aktuální věk)</td><td>{{ profileData.info.arena }}</td></tr>
                  <tr v-if="profileData.info.expeditions"><td>Expedice (aktuální věk)</td><td>{{ profileData.info.expeditions }}</td></tr>
                  <tr v-if="profileData.info.memberSince"><td>Členem od</td><td>{{ profileData.info.memberSince }}</td></tr>
                  <tr v-if="profileData.awards && profileData.awards.length">
                     <td class="align-middle">Ocenění</td>
                     <td class="awards-cell">
                        <div v-for="(award, idx) in profileData.awards" :key="idx" :class="['award-icon', 'custom-tooltip-wrap', award.type]">
                           <span class="custom-tooltip-content" v-html="award.html"></span>
                        </div>
                     </td>
                  </tr>
               </tbody>
            </table>
         </div>
      </div>

      <!-- HISTORIE -->
      <div class="dash-panel history-panel">
         <div class="dash-panel-head">Historie hráče {{ profileData.user.username }} na SGU-Game</div>
         <div class="dash-panel-body p-0" style="overflow-x: auto;">
            <table class="sgu-table history-table w-100 text-center">
               <thead>
                  <tr>
                     <th>Typ věku</th>
                     <th>Věk</th>
                     <th>Konečná pozice</th>
                     <th>Fragmenty</th>
                     <th>Výzkum</th>
                     <th>Expedice</th>
                     <th>Aréna [v-r-p]</th>
                     <th>Aréna trofeje</th>
                     <th>Příběh dokončen</th>
                     <th>Aliance</th>
                  </tr>
               </thead>
               <tbody>
                  <tr v-if="!profileData.history || profileData.history.length === 0">
                     <td colspan="10" class="p-3 text-muted">Zatím žádné dokončené herní věky</td>
                  </tr>
                  <tr v-for="(hist, idx) in profileData.history" :key="idx">
                     <td>{{ hist.ageType }}</td>
                     <td>{{ hist.age }}</td>
                     <td>{{ hist.position }}</td>
                     <td>{{ hist.fragments }}</td>
                     <td>{{ hist.research }}</td>
                     <td>{{ hist.expeditions }}</td>
                     <td>{{ hist.arenaRecord }}</td>
                     <td>{{ hist.arenaTrophies }}</td>
                     <td>{{ hist.finishTime }}</td>
                     <td>{{ hist.alliance }}</td>
                  </tr>
               </tbody>
            </table>
         </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

const searchName = ref('');
const loading = ref(false);
const error = ref(null);
const profileData = ref(null);

const loadProfile = async (name) => {
  if (!name) return;
  loading.value = true;
  error.value = null;
  profileData.value = null;
  
  try {
    const res = await axios.get('/api/stats/profile', {
      params: { playerName: name }
    });
    if (res.data && res.data.ok) {
       profileData.value = res.data.data;
    } else {
       error.value = res.data?.error || 'Chyba načítání';
    }
  } catch(e) {
    error.value = 'Chyba spojení se serverem.';
  } finally {
    loading.value = false;
  }
};

const searchProfile = () => {
  if (searchName.value.trim()) {
     router.push({ path: '/stats/profile', query: { playerName: searchName.value.trim() } });
  }
};

const sendMessage = async (username) => {
   // Musime ziskat kontakt_id zo servera pre noveho hraca (idealne by stacilo otvorit /communication/messages a dat Pridat)
   // V sgu sa daju posielat spravy aj tak, ze ho pridame do zoznamu podla nicku.
   try {
      await axios.post('/api/messages/contact', { playerName: username });
      router.push('/communication/messages');
   } catch (e) {
      alert("Nepodarilo se připravit zprávu.");
   }
};

onMounted(() => {
  if (route.query.playerName) {
     searchName.value = route.query.playerName;
     loadProfile(searchName.value);
  }
});
</script>

<style scoped>
/* DASH PANEL CORNERS */
.dash-panel {
  display: flex;
  flex-direction: column;
  background: rgba(4,190,254,0.05);
  border: 1px solid rgba(4,190,254,0.3);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
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
.search-body {
  min-height: auto !important;
}

/* INPUTS */
.sgu-input {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(4, 190, 254, 0.3);
  color: #fff;
  padding: 8px;
  border-radius: 4px;
  outline: none;
}
.sgu-btn, .sgu-btn-small {
  background: rgba(4,190,254,0.2);
  border: 1px solid #04befe;
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  text-transform: uppercase;
  font-weight: bold;
}
.sgu-btn-small { padding: 4px 10px; font-size: 11px; }
.sgu-btn:hover, .sgu-btn-small:hover { background: rgba(4,190,254,0.4); }

/* GRID LAYOUT */
.profile-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  grid-template-areas: 
    "player info"
    "history history";
  gap: 15px;
}
.profile-grid > div:nth-child(1) { grid-area: player; }
.info-panel { grid-area: info; }
.history-panel { grid-area: history; }

@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
    grid-template-areas: 
      "player"
      "info"
      "history";
  }
}

/* AVATAR */
.profile-avatar, .profile-avatar-placeholder {
  width: 120px;
  height: 120px;
  border: 1px solid #04befe;
  border-radius: 4px;
  object-fit: cover;
}
@media (max-width: 576px) {
  .profile-avatar, .profile-avatar-placeholder {
    width: 80px;
    height: 80px;
  }
}
.profile-avatar-placeholder {
  background: rgba(0,0,0,0.5);
}

/* TABLES */
.sgu-table {
  width: 100%;
  border-collapse: collapse;
}
.sgu-table td, .sgu-table th {
  padding: 8px;
  border: 1px solid rgba(4, 190, 254, 0.1);
}
.sgu-table th {
  background: rgba(4, 190, 254, 0.1);
  color: #04befe;
}
.info-table td:first-child {
  width: 40%;
  color: rgba(4, 190, 254, 0.8);
}
.history-table th {
  font-size: 10px;
}
.history-table td {
  font-size: 11px;
}

/* AWARDS */
.awards-cell {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}
.award-icon {
  width: 25px;
  height: 25px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  display: inline-block;
}
.veteran { background-image: url('https://www.sgu-game.cz/img/veteran.png'); }
.alliance-trophy { background-image: url('https://www.sgu-game.cz/img/alliance/alliance_trophy.png'); }
.gold-medal { background-image: url('https://www.sgu-game.cz/img/gold-medal.png'); }
.silver-medal { background-image: url('https://www.sgu-game.cz/img/silver-medal.png'); }
.bronze-medal { background-image: url('https://www.sgu-game.cz/img/bronze-medal.png'); }

.custom-tooltip-wrap {
  position: relative;
  display: inline-block;
  cursor: pointer;
}
.custom-tooltip-content {
  visibility: hidden;
  opacity: 0;
  width: 150px;
  background-color: rgba(0, 0, 0, 0.9);
  color: #fff;
  text-align: center;
  border: 1px solid rgba(4, 190, 254, 0.5);
  border-radius: 4px;
  padding: 8px;
  position: absolute;
  z-index: 100;
  bottom: 125%;
  left: 50%;
  margin-left: -75px;
  transition: opacity 0.3s;
  font-size: 11px;
  pointer-events: none;
  box-shadow: 0 4px 8px rgba(0,0,0,0.5);
}
.custom-tooltip-content::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: rgba(4, 190, 254, 0.5) transparent transparent transparent;
}
.custom-tooltip-wrap:hover .custom-tooltip-content {
  visibility: visible;
  opacity: 1;
}

.gap-2 { gap: 8px; }
.admin { color: #ff3c3c; }
.player { color: #fff; }
.teacher { color: #04befe; }
</style>
