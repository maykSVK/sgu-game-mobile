<template>
  <div class="dash-grid">
    <section class="dash-section">
      <div class="dash-panel h-100">
        <div class="dash-panel-head">
          <span class="dash-panel-dot"></span> {{ forumData?.title || 'Načítavam fórum...' }}
        </div>
        <div class="dash-panel-body p-2">
          
          <div v-if="loading" style="text-align:center; padding: 30px; color: #04befe;">
            <div class="spinner"></div> Načítavam správy...
          </div>
          
          <div v-else-if="error" class="text-center p-3 text-danger">
            {{ error }}
          </div>
          
          <div v-else>
            <!-- Formular na pridanie prispevku -->
            <div v-if="forumData?.canPost" class="new-post-form">
              <div class="form-title">Nový príspevok</div>
              <input type="text" v-model="newSubject" placeholder="Predmet (nepovinné)" class="sgu-input mb-2" />
              <textarea v-model="newMessage" placeholder="Správa..." class="sgu-input mb-2" rows="3"></textarea>
              
              <!-- Nástrojová lišta -->
              <div class="sgu-editor-toolbar mb-2">
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
                <div class="toolbar-section">
                  <div class="toolbar-title">Funkce</div>
                  <div class="toolbar-icons">
                    <i class="fas fa-image func-icon" @click="insertText('[image]URL_OBRAZKU[/image]')" title="Obrázok"></i>
                    <i class="fas fa-link func-icon" @click="insertText('[link]URL_ODKAZU[/link]')" title="Odkaz"></i>
                    <i class="fab fa-youtube func-icon" @click="insertText('[youtube]URL_VIDEA[/youtube]')" title="YouTube"></i>
                  </div>
                </div>
              </div>

              <button @click="submitPost" class="sgu-btn" :disabled="submitting || !newMessage.trim()">
                <i v-if="submitting" class="fas fa-spinner fa-spin"></i>
                <span v-else>Odoslať</span>
              </button>
            </div>

            <div v-if="!forumData?.posts || forumData.posts.length === 0" class="text-center p-3 text-muted">
              Fórum je prázdne.
            </div>

            <div v-else class="forum-posts">
              <div v-for="post in forumData.posts" :key="post.id" class="forum-post">
                
                <div class="post-header">
                  <div class="post-avatar">
                    <img :src="post.avatar.startsWith('http') ? post.avatar : (basePath + post.avatar.replace(/^\//, ''))" @error="handleAvatarError" />
                  </div>
                  <div class="post-meta">
                    <div class="post-author" :class="{'system-author': post.isSystem}">{{ post.author }}</div>
                    <div class="post-time">{{ post.time }}</div>
                  </div>
                </div>
                
                <div class="post-body sgu-html-content" v-html="post.message"></div>
                
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const basePath = import.meta.env.BASE_URL;

const loading = ref(true);
const submitting = ref(false);
const error = ref(null);
const forumData = ref(null);

const newSubject = ref('');
const newMessage = ref('');

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

const fetchForum = async (id) => {
  loading.value = true;
  error.value = null;
  forumData.value = null;
  
  try {
    const res = await axios.get('/api/forums/' + id);
    if (res.data && res.data.ok) {
      forumData.value = res.data.data;
    } else {
      error.value = res.data?.error || 'Chyba načítania fóra.';
    }
  } catch (e) {
    error.value = 'Chyba servera pri sťahovaní príspevkov.';
  } finally {
    loading.value = false;
  }
};

const submitPost = async () => {
  if (!newMessage.value.trim()) return;
  submitting.value = true;
  
  try {
    const res = await axios.post(`/api/forums/${route.params.id}/post`, {
      subject: newSubject.value,
      message: newMessage.value
    });
    
    if (res.data && res.data.ok) {
      newSubject.value = '';
      newMessage.value = '';
      await fetchForum(route.params.id); // Reload forum
    } else {
      alert('Chyba: ' + (res.data?.error || 'Neznáma chyba'));
    }
  } catch (e) {
    alert('Chyba spojenia pri odosielaní príspevku.');
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  if (route.params.id) {
    fetchForum(route.params.id);
  }
});

watch(() => route.params.id, (newId) => {
  if (newId) fetchForum(newId);
});

const handleAvatarError = (e) => {
  e.target.src = basePath + 'img/default-contact.jpg';
};
</script>

<style scoped>
.dash-grid {
  display: grid;
  grid-template-columns: 1fr;
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

.new-post-form {
  background: rgba(4, 9, 20, 0.6);
  border: 1px solid rgba(4, 190, 254, 0.4);
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 15px;
}
.form-title {
  color: #04befe;
  font-weight: bold;
  font-size: 0.85rem;
  text-transform: uppercase;
  margin-bottom: 8px;
}
.sgu-input {
  width: 100%;
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
.mb-2 { margin-bottom: 8px; }

.sgu-btn {
  background: rgba(4,190,254,0.2);
  border: 1px solid #04befe;
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  text-transform: uppercase;
  transition: all 0.2s;
}
.sgu-btn:hover:not(:disabled) {
  background: rgba(4,190,254,0.4);
  box-shadow: 0 0 8px rgba(4,190,254,0.6);
}
.sgu-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-color: rgba(4,190,254,0.3);
}

.forum-posts {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.forum-post {
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(4, 190, 254, 0.2);
  border-radius: 4px;
  padding: 10px;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(4, 190, 254, 0.1);
  padding-bottom: 8px;
}

.post-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  border: 1px solid rgba(4, 190, 254, 0.4);
  object-fit: cover;
}

.post-meta {
  display: flex;
  flex-direction: column;
}

.post-author {
  color: #fff;
  font-weight: bold;
  font-size: 0.95rem;
}
.system-author {
  color: #209cff;
}

.post-time {
  color: #888;
  font-size: 0.75rem;
}

.post-body {
  color: #ddd;
  font-size: 0.9rem;
  line-height: 1.4;
  word-break: break-word;
}
.sgu-html-content :deep(img) {
  max-width: 100%;
  height: auto;
}
.sgu-html-content :deep(img[src*="/img/smiles/"]) {
  width: 24px !important;
  height: 24px !important;
  vertical-align: middle;
  display: inline-block;
  margin: 0 2px;
}
.sgu-html-content :deep(a) {
  color: #04befe;
  text-decoration: underline;
}

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
  font-size: 0.75rem;
  color: rgba(4, 190, 254, 0.7);
  margin-bottom: 4px;
  text-transform: uppercase;
}
.toolbar-icons {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}
.smile-icon {
  width: 22px;
  height: 22px;
  object-fit: contain;
  cursor: pointer;
  transition: transform 0.2s;
}
.smile-icon:hover {
  transform: scale(1.2);
}
.func-icon {
  font-size: 1.1rem;
  color: #fff;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}
.func-icon:hover {
  background: rgba(4, 190, 254, 0.2);
  color: #04befe;
}
</style>
