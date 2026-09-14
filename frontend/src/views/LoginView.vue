<template>
  <!-- Vesmírne pozadie -->
  <StarField />
  <div class="sgu-scanlines" />

  <div class="sgu-login-page">

    <!-- Logo -->
    <div class="sgu-login-logo sg-fade-up">
      <img src="/src/assets/img/sgu-game.png" alt="SG:U GAME" style="filter: drop-shadow(0 0 10px rgba(4,190,254,0.7));" />
    </div>

    <!-- Login box -->
    <div class="sgu-login-box sg-fade-up" style="animation-delay:0.1s;">
      <div class="sgu-login-title">Prihlásenie</div>

      <form @submit.prevent="handleLogin" autocomplete="on">
        <!-- Username -->
        <div style="margin-bottom:12px;">
          <label class="sgu-input-label">Používateľské meno</label>
          <input
            v-model="username"
            type="text"
            autocomplete="username"
            autocapitalize="none"
            autocorrect="off"
            spellcheck="false"
            placeholder="Meno hráča"
            class="sgu-input"
            required
          />
        </div>

        <!-- Password -->
        <div style="margin-bottom:14px;">
          <label class="sgu-input-label">Heslo</label>
          <div style="position:relative;">
            <input
              v-model="password"
              :type="showPass ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="••••••••"
              class="sgu-input"
              style="padding-right:40px;"
              required
            />
            <button
              type="button"
              @click="showPass = !showPass"
              style="position:absolute; right:8px; top:50%; transform:translateY(-50%);
                     background:none; border:none; color:rgba(4,190,254,0.6); cursor:pointer; font-size:16px; padding:0;"
            >{{ showPass ? '🙈' : '👁' }}</button>
          </div>
        </div>

        <!-- Remember me -->
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:14px;">
          <input
            type="checkbox"
            id="rememberMe"
            v-model="rememberMe"
            style="width:15px; height:15px; accent-color: #04befe; cursor:pointer;"
          />
          <label for="rememberMe" style="font-size:12px; color:rgba(255,255,255,0.7); cursor:pointer; user-select:none;">
            Zapamätať údaje na zariadení
          </label>
        </div>

        <!-- Error -->
        <div v-if="auth.error" class="sgu-error" style="margin-bottom:12px; margin-left:0; margin-right:0;">
          ⚠ {{ auth.error }}
        </div>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="auth.loading"
          class="sgu-btn sgu-btn-login sgu-btn-full"
        >
          <span v-if="auth.loading" class="sg-spin" style="display:inline-block; font-size:16px;">⟳</span>
          {{ auth.loading ? 'Prihlasovanie...' : 'Prihlásiť sa' }}
        </button>
      </form>

      <!-- Extra links -->
      <div style="margin-top:14px; text-align:center; font-size:11px; color:rgba(255,255,255,0.45);">
        <a href="#" style="color:rgba(4,190,254,0.6);">Zabudnuté heslo</a>
        <span style="margin:0 8px; opacity:0.3;">|</span>
        <a href="#" style="color:rgba(4,190,254,0.6);">Pre registráciu kliknite tu</a>
      </div>
    </div>

    <!-- Štatistiky servera -->
    <div class="sgu-login-stats sg-fade-up" style="animation-delay:0.2s;">
      <div class="sgu-login-stats-title">Štatistiky</div>
      <div class="sgu-login-stat-row">
        <span class="sgu-login-stat-key">Hráčov</span>
        <span class="sgu-login-stat-val">1894</span>
      </div>
      <div class="sgu-login-stat-row">
        <span class="sgu-login-stat-key">Aliancií</span>
        <span class="sgu-login-stat-val">0</span>
      </div>
      <div class="sgu-login-stat-row">
        <span class="sgu-login-stat-key">Planét</span>
        <span class="sgu-login-stat-val">184</span>
      </div>
      <div class="sgu-login-stat-row">
        <span class="sgu-login-stat-key">Hviezd</span>
        <span class="sgu-login-stat-val">47</span>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import StarField from '../components/StarField.vue'

const auth = useAuthStore()
const router = useRouter()
const username  = ref('')
const password  = ref('')
const rememberMe = ref(false)
const showPass   = ref(false)

onMounted(() => {
  const savedUser = localStorage.getItem('sgu_saved_username')
  const savedPass = localStorage.getItem('sgu_saved_password')
  if (savedUser && savedPass) {
    username.value  = savedUser
    password.value  = savedPass
    rememberMe.value = true
  }
})

async function handleLogin() {
  const ok = await auth.login(username.value, password.value)
  if (ok) {
    if (rememberMe.value) {
      localStorage.setItem('sgu_saved_username', username.value)
      localStorage.setItem('sgu_saved_password', password.value)
    } else {
      localStorage.removeItem('sgu_saved_username')
      localStorage.removeItem('sgu_saved_password')
    }
    router.push('/')
  }
}
</script>
