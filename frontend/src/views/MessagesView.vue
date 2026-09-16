<template>
  <div class="dash-page messages-page">
    
    <div class="dash-content">
      <div v-if="loading && !messagesData" style="text-align:center; padding: 30px; color: #04befe;">
        <div class="spinner"></div> Načítavam správy...
      </div>
      
      <div v-else-if="error" class="text-center p-3 text-danger">
        {{ error }}
      </div>
      
      <div v-else class="messages-container" :class="{ 'chat-active': activeContactId }">
        
        <!-- LAVY PANEL: KONTAKTY -->
        <div class="contacts-panel dash-panel">
          <div class="dash-panel-head">
            <span class="dash-panel-dot"></span> Kontakty
          </div>
          <div class="dash-panel-body contacts-body p-0">
            
            <div class="add-contact-box p-2 border-bottom-sgu">
              <input type="text" v-model="newContactName" placeholder="Nick hráča" class="sgu-input contact-input" />
              <button @click="addContact" class="sgu-btn-small" :disabled="!newContactName.trim()"><i class="fas fa-plus"></i></button>
            </div>

            <div v-if="!messagesData?.contacts?.length" class="p-3 text-muted text-center">
              Zatiaľ žiadne kontakty.
            </div>

            <div class="contacts-list">
              <div 
                v-for="contact in messagesData.contacts" 
                :key="contact.id" 
                class="contact-item"
                :class="{ 'active': activeContactId === contact.id }"
                @click="openContact(contact.id)"
              >
                <div class="contact-info">
                  <span class="status-dot" :class="{ 'online': contact.isOnline }"></span>
                  <span class="contact-name" :class="{'muted-text': contact.muted}">{{ contact.name }}</span>
                  <span v-if="contact.unreadCount > 0" class="unread-badge">{{ contact.unreadCount }}</span>
                </div>
                
                <!-- Ignore tlacidlo (zamedzime bublaniu eventu, aby sa neotvoril chat pri ignorovani) -->
                <button 
                  class="mute-btn" 
                  :class="{ 'is-muted': contact.muted }" 
                  @click.stop="toggleMute(contact)"
                  :title="contact.muted ? 'Odblokovať' : 'Ignorovať'"
                >
                  <i class="fas" :class="contact.muted ? 'fa-microphone-slash' : 'fa-microphone'"></i>
                </button>
              </div>
            </div>

            <div class="pagination-controls p-2 border-top-sgu text-center">
               <button class="sgu-btn-small mr-2" :disabled="currentPage <= 1" @click="loadPage(currentPage - 1)">&lt;&lt;</button>
               <span class="page-badge">{{ currentPage }}</span>
               <button class="sgu-btn-small ml-2" @click="loadPage(currentPage + 1)">&gt;&gt;</button>
            </div>

          </div>
        </div>

        <!-- PRAVY PANEL: CHAT -->
        <div class="chat-panel dash-panel">
          <div class="dash-panel-head">
             <button class="mobile-back-btn sgu-btn-small mr-2" @click="closeChat" v-if="activeContactId">
               <i class="fas fa-arrow-left"></i>
             </button>
             <span class="dash-panel-dot"></span> 
             {{ activeContactId && messagesData?.chat ? messagesData.chat.contactName : 'Konverzácia' }}
          </div>
          
          <div class="dash-panel-body chat-body p-0">
            <div v-if="!activeContactId" class="empty-chat-state text-muted text-center p-4">
              Vyberte kontakt alebo pridajte nový.
            </div>
            
            <div v-else-if="messagesData?.chat" class="chat-wrapper">
              
              <div class="chat-messages" ref="chatContainer">
                <div v-if="messagesData.chat.messages.length === 0" class="text-muted text-center mt-3">
                   Žiadne správy.
                </div>
                
                <div 
                  v-for="msg in messagesData.chat.messages" 
                  :key="msg.id"
                  class="chat-message-row"
                  :class="msg.isSent ? 'msg-sent' : 'msg-received'"
                >
                  <img :src="msg.avatar" class="chat-avatar" @error="handleAvatarError" />
                  <div class="chat-bubble">
                     <div class="sgu-html-content" v-html="msg.html"></div>
                     <div class="chat-time">{{ msg.time }}</div>
                  </div>
                </div>
              </div>

              <!-- Nova sprava form -->
              <div class="chat-input-area">
                 <textarea v-model="newMessage" class="sgu-input chat-textarea" placeholder="Napsat zprávu..." rows="2"></textarea>
                 
                 <!-- Nástrojová lišta -->
                 <div class="sgu-editor-toolbar mt-2 mb-2">
                   <div class="toolbar-section">
                     <div class="toolbar-title">Smajlíci</div>
                     <div class="toolbar-icons">
                       <img v-for="s in smileys" :key="s.code" :src="'https://www.sgu-game.cz/img/smiles/' + s.img" @click="insertText(s.code)" class="smile-icon" />
                     </div>
                   </div>
                   <div class="toolbar-section">
                     <div class="toolbar-title">Hrdinové</div>
                     <div class="toolbar-icons">
                       <img v-for="h in heroes" :key="h.code" :src="'https://www.sgu-game.cz/img/smiles/' + h.img" @click="insertText(h.code)" class="smile-icon" />
                     </div>
                   </div>
                 </div>

                 <button class="sgu-btn w-100" @click="sendMessage" :disabled="sending || !newMessage.trim()">
                    <i v-if="sending" class="fas fa-spinner fa-spin"></i>
                    <span v-else>Odoslať zprávu</span>
                 </button>
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const basePath = import.meta.env.BASE_URL;

const loading = ref(true);
const sending = ref(false);
const error = ref(null);

const messagesData = ref(null);
const currentPage = ref(1);
const activeContactId = ref(null);

const newContactName = ref('');
const newMessage = ref('');
const chatContainer = ref(null);

const smileys = [
  { code: ':-)', img: 'happy.png' },
  { code: ':-D', img: 'happy-1.png' },
  { code: ';-)', img: 'suspicious.png' },
  { code: ':-P', img: 'tongue-out.png' },
  { code: ':-(', img: 'unhappy.png' },
  { code: ':-O', img: 'surprised-1.png' },
  { code: ':-/', img: 'confused.png' },
  { code: ':-*', img: 'kissing.png' },
  { code: ':-$', img: 'confused-1.png' },
  { code: ':-X', img: 'quiet.png' }
];

const heroes = [
  { code: ':oneill_1:', img: 'hero_oneill_1.gif' },
  { code: ':carter_1:', img: 'hero_carter_1.gif' },
  { code: ':jackson_1:', img: 'hero_jackson_1.gif' },
  { code: ':tealc_1:', img: 'hero_tealc_1.gif' },
  { code: ':hammond_1:', img: 'hero_hammond_1.gif' },
  { code: ':sheppard_1:', img: 'hero_sheppard_1.gif' },
  { code: ':bratac:', img: 'hero_bratac.gif' },
  { code: ':baal:', img: 'hero_baal.gif' },
  { code: ':thor:', img: 'hero_thor.gif' },
  { code: ':mckay:', img: 'hero_mckay.gif' }
];

const insertText = (text) => {
  newMessage.value = newMessage.value ? newMessage.value + ' ' + text + ' ' : text + ' ';
};

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

const loadData = async (contactId = null, page = 1) => {
  loading.value = true;
  error.value = null;
  
  try {
    const res = await axios.get('/api/messages', {
      params: { contact: contactId || '', page }
    });
    if (res.data && res.data.ok) {
      messagesData.value = res.data.data;
      currentPage.value = res.data.data.page;
      activeContactId.value = contactId;
      if (contactId) {
        scrollToBottom();
      }
    } else {
      error.value = res.data?.error || 'Chyba načítania';
    }
  } catch(e) {
    error.value = 'Chyba spojenia zo serverom.';
  } finally {
    loading.value = false;
  }
};

const openContact = (contactId) => {
  // Update url implicitly or just state
  loadData(contactId, currentPage.value);
};

const closeChat = () => {
  activeContactId.value = null;
};

const loadPage = (page) => {
  loadData(activeContactId.value, page);
};

const addContact = async () => {
  if (!newContactName.value.trim()) return;
  try {
    await axios.post('/api/messages/contact', { playerName: newContactName.value });
    newContactName.value = '';
    loadData(activeContactId.value, 1);
  } catch (e) {
    alert('Chyba pri pridaní kontaktu');
  }
};

const toggleMute = async (contact) => {
  try {
    await axios.post('/api/messages/mute', {
      contactId: contact.id,
      mute: !contact.muted
    });
    // reload state
    loadData(activeContactId.value, currentPage.value);
  } catch (e) {
    alert('Chyba pri mute operácii');
  }
};

const sendMessage = async () => {
  if (!activeContactId.value || !newMessage.value.trim()) return;
  sending.value = true;
  try {
    await axios.post('/api/messages/send', {
      contact: activeContactId.value,
      message: newMessage.value
    });
    newMessage.value = '';
    loadData(activeContactId.value, currentPage.value);
  } catch(e) {
    alert('Chyba pri odoslaní');
  } finally {
    sending.value = false;
  }
};

const handleAvatarError = (e) => {
  e.target.src = basePath + 'img/default-contact.jpg';
};

onMounted(() => {
  const initContact = route.query.contact || null;
  loadData(initContact, 1);
});

</script>

<style scoped>
/* DASH PANEL STYLES */
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

/* LAYOUT */
.messages-container {
  display: flex;
  gap: 15px;
  height: 80vh;
}
.contacts-panel {
  flex: 0 0 300px;
  display: flex;
}
.chat-panel {
  flex: 1;
  display: flex;
}

/* MOBILE RESPONSIVITY */
.mobile-back-btn {
  display: none;
}
@media (max-width: 768px) {
  .messages-container {
    position: relative;
  }
  .contacts-panel {
    flex: 1 1 100%;
    display: flex;
  }
  .chat-panel {
    display: none;
    flex: 1 1 100%;
  }
  
  .messages-container.chat-active .contacts-panel {
    display: none;
  }
  .messages-container.chat-active .chat-panel {
    display: flex;
  }
  
  .mobile-back-btn {
    display: inline-block;
  }
}

/* INPUTS */
.sgu-input {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(4, 190, 254, 0.3);
  color: #fff;
  padding: 8px;
  border-radius: 4px;
  outline: none;
  font-family: inherit;
}
.sgu-input:focus {
  border-color: #04befe;
  box-shadow: 0 0 5px rgba(4,190,254,0.5);
}
.sgu-btn-small {
  background: rgba(4,190,254,0.2);
  border: 1px solid #04befe;
  color: #fff;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
}
.sgu-btn-small:hover:not(:disabled) {
  background: rgba(4,190,254,0.4);
}
.sgu-btn-small:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.sgu-btn {
  background: rgba(4,190,254,0.2);
  border: 1px solid #04befe;
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  text-transform: uppercase;
}
.sgu-btn:hover:not(:disabled) {
  background: rgba(4,190,254,0.4);
  box-shadow: 0 0 8px rgba(4,190,254,0.6);
}
.sgu-btn:disabled {
  opacity: 0.5;
}

/* CONTACTS */
.add-contact-box {
  display: flex;
  gap: 8px;
}
.contact-input {
  flex: 1;
}
.contacts-body {
  display: flex;
  flex-direction: column;
}
.contacts-list {
  flex: 1;
  overflow-y: auto;
}
.contact-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid rgba(4, 190, 254, 0.1);
  cursor: pointer;
  transition: background 0.2s;
}
.contact-item:hover, .contact-item.active {
  background: rgba(4, 190, 254, 0.15);
}
.contact-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #555;
}
.status-dot.online {
  background: #14ff10;
  box-shadow: 0 0 5px #14ff10;
}
.contact-name {
  color: #fff;
  font-weight: bold;
}
.contact-name.muted-text {
  color: #888;
  text-decoration: line-through;
}
.unread-badge {
  background: #ff3c3c;
  color: #fff;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: bold;
}
.mute-btn {
  background: transparent;
  border: none;
  color: #04befe;
  cursor: pointer;
  padding: 4px;
}
.mute-btn:hover {
  color: #fff;
}
.mute-btn.is-muted {
  color: #ff3c3c;
}

/* BORDERS */
.border-bottom-sgu { border-bottom: 1px solid rgba(4, 190, 254, 0.3); }
.border-top-sgu { border-top: 1px solid rgba(4, 190, 254, 0.3); }

/* CHAT */
.chat-body {
  display: flex;
  flex-direction: column;
}
.chat-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.chat-message-row {
  display: flex;
  gap: 10px;
  max-width: 85%;
}
.chat-message-row.msg-sent {
  align-self: flex-end;
  flex-direction: row-reverse;
}
.chat-message-row.msg-received {
  align-self: flex-start;
}
.chat-avatar {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  border: 1px solid rgba(4,190,254,0.4);
  object-fit: cover;
}
.chat-bubble {
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(4, 190, 254, 0.2);
  padding: 10px;
  border-radius: 8px;
  color: #ddd;
  position: relative;
}
.msg-sent .chat-bubble {
  background: rgba(4, 190, 254, 0.1);
  border-color: rgba(4, 190, 254, 0.4);
  border-top-right-radius: 0;
}
.msg-received .chat-bubble {
  background: rgba(255, 255, 255, 0.05);
  border-top-left-radius: 0;
}
.chat-time {
  font-size: 0.7rem;
  color: #888;
  margin-top: 5px;
  text-align: right;
}

/* INPUT AREA */
.chat-input-area {
  padding: 15px;
  border-top: 1px solid rgba(4, 190, 254, 0.2);
  background: rgba(0,0,0,0.4);
}
.chat-textarea {
  width: 100%;
  resize: none;
}

/* SGU EDITOR TOOLBAR (reused from Forum) */
.sgu-editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  background: rgba(0, 0, 0, 0.4);
  padding: 8px;
  border: 1px solid rgba(4, 190, 254, 0.2);
  border-radius: 4px;
}
.toolbar-section {
  display: flex;
  flex-direction: column;
}
.toolbar-title {
  font-size: 0.7rem;
  color: rgba(4, 190, 254, 0.7);
  margin-bottom: 4px;
  text-transform: uppercase;
}
.toolbar-icons {
  display: flex;
  gap: 4px;
  align-items: center;
  flex-wrap: wrap;
}
.smile-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  cursor: pointer;
  transition: transform 0.2s;
}
.smile-icon:hover {
  transform: scale(1.2);
}

.sgu-html-content :deep(img) {
  max-width: 100%;
  height: auto;
}
.sgu-html-content :deep(img[src*="/img/smiles/"]) {
  width: 20px !important;
  height: 20px !important;
  vertical-align: middle;
  display: inline-block;
  margin: 0 2px;
}
</style>
