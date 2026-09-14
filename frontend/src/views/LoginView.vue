<template>
  <StarField />
  <div class="sgu-scanlines" />

  <div class="login-page">

    <!-- Logo -->
    <div class="login-logo">
      <img src="/src/assets/img/sgu-game.png" alt="SG:U GAME" class="login-logo-img" />
    </div>

    <!-- Box -->
    <div class="login-box">
      <div class="login-box-title">Prihlásenie</div>

      <form @submit.prevent="handleLogin">

        <div class="form-group">
          <label class="form-label">Používateľské meno</label>
          <input
            v-model="username"
            type="text"
            autocomplete="username"
            autocapitalize="none"
            autocorrect="off"
            spellcheck="false"
            placeholder="Meno hráča"
            class="form-input"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">Heslo</label>
          <div class="input-wrap">
            <input
              v-model="password"
              :type="showPass ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="••••••••"
              class="form-input"
              style="padding-right: 42px;"
              required
            />
            <button type="button" class="toggle-pass" @click="showPass = !showPass">
              {{ showPass ? '🙈' : '👁' }}
            </button>
          </div>
        </div>

        <div class="form-remember">
          <input type="checkbox" id="rem" v-model="rememberMe" class="form-check" />
          <label for="rem" class="form-check-label">Zapamätať prihlásenie</label>
        </div>

        <div v-if="auth.error" class="form-error">
          ⚠ {{ auth.error }}
        </div>

        <button type="submit" :disabled="auth.loading" class="btn-login">
          <span v-if="auth.loading" class="spin-icon">⟳</span>
          {{ auth.loading ? 'Prihlasovanie...' : 'Prihlásiť sa' }}
        </button>
      </form>

      <div class="login-links">
        <a href="#">Zabudnuté heslo</a>
        <span class="sep">|</span>
        <a href="#">Registrácia</a>
      </div>
    </div>

    <!-- Server stats -->
    <div class="login-stats-box">
      <div class="stats-box-title">Štatistiky servera</div>
      <div class="stats-row"><span>Hráčov</span><span class="stats-val">1 894</span></div>
      <div class="stats-row"><span>Planét</span><span class="stats-val">184</span></div>
      <div class="stats-row"><span>Hviezd</span><span class="stats-val">47</span></div>
      <div class="stats-row"><span>Aliancií</span><span class="stats-val">0</span></div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import StarField from '../components/StarField.vue'

const auth     = useAuthStore()
const router   = useRouter()
const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPass   = ref(false)

onMounted(() => {
  const u = localStorage.getItem('sgu_saved_username')
  const p = localStorage.getItem('sgu_saved_password')
  if (u && p) { username.value = u; password.value = p; rememberMe.value = true }
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

<style scoped>
/* ── Login page layout ── */
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 18px 40px;
  position: relative;
  z-index: 1;
  gap: 16px;
}

/* Logo */
.login-logo { text-align: center; }
.login-logo-img {
  height: 38px;
  filter: drop-shadow(0 0 12px rgba(4,190,254,0.7));
}

/* Login box */
.login-box {
  width: 100%;
  max-width: 340px;
  background: rgba(0,0,0,0.78);
  border: 1px solid rgba(4,190,254,0.5);
  border-radius: 3px;
  padding: 22px 18px 18px;
  position: relative;
}
/* Corner accents */
.login-box::before {
  content: '';
  position: absolute; top: 0; left: 0;
  width: 14px; height: 14px;
  border-top: 2px solid #04befe;
  border-left: 2px solid #04befe;
}
.login-box::after {
  content: '';
  position: absolute; bottom: 0; right: 0;
  width: 14px; height: 14px;
  border-bottom: 2px solid #04befe;
  border-right: 2px solid #04befe;
}

.login-box-title {
  font-size: 11px;
  font-weight: bold;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: #04befe;
  text-align: center;
  padding-bottom: 14px;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(4,190,254,0.25);
}

/* Form */
.form-group { margin-bottom: 12px; }

.form-label {
  display: block;
  font-size: 10px;
  font-weight: bold;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #04befe;
  margin-bottom: 5px;
}

.form-input {
  width: 100%;
  background: rgba(0,0,0,0.45);
  border: 1px solid rgba(4,190,254,0.4);
  border-radius: 2px;
  color: #fff;
  font-family: Verdana, sans-serif;
  font-size: 14px;
  padding: 9px 11px;
  outline: none;
  min-height: 40px;
  box-sizing: border-box;
}
.form-input:focus {
  border-color: #04befe;
  box-shadow: 0 0 8px rgba(4,190,254,0.4);
}
.form-input::placeholder { color: rgba(255,255,255,0.28); }

.input-wrap { position: relative; }
.toggle-pass {
  position: absolute; right: 9px; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: rgba(4,190,254,0.6);
  cursor: pointer; font-size: 16px; padding: 0; line-height: 1;
}

.form-remember {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 14px;
}
.form-check { width: 15px; height: 15px; accent-color: #04befe; cursor: pointer; }
.form-check-label { font-size: 12px; color: rgba(255,255,255,0.65); cursor: pointer; user-select: none; }

.form-error {
  background: rgba(180,10,10,0.25);
  border: 1px solid rgba(255,60,60,0.4);
  border-radius: 2px;
  padding: 9px 11px;
  font-size: 12px;
  color: #ff7070;
  margin-bottom: 12px;
}

/* Login button — červené ako v origináli */
.btn-login {
  width: 100%;
  min-height: 44px;
  background: rgba(170,10,10,0.75);
  border: 1px solid #aa0000;
  border-radius: 3px;
  color: #fff;
  font-family: Verdana, sans-serif;
  font-size: 15px;
  font-weight: bold;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.15s;
}
.btn-login:hover { background: rgba(210,20,20,0.85); }
.btn-login:active { background: rgba(220,30,30,0.9); }
.btn-login:disabled { opacity: 0.6; cursor: not-allowed; }
.spin-icon { display: inline-block; animation: spin 0.9s linear infinite; font-size: 16px; }
@keyframes spin { to { transform: rotate(360deg); } }

.login-links {
  margin-top: 13px;
  text-align: center;
  font-size: 11px;
}
.login-links a { color: rgba(4,190,254,0.65); }
.login-links a:hover { color: #04befe; text-decoration: underline; }
.sep { margin: 0 8px; color: rgba(255,255,255,0.2); }

/* Stats box */
.login-stats-box {
  width: 100%;
  max-width: 340px;
  background: rgba(0,0,0,0.6);
  border: 1px solid rgba(4,190,254,0.28);
  border-radius: 3px;
  padding: 12px 16px;
}
.stats-box-title {
  font-size: 9px;
  font-weight: bold;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #04befe;
  margin-bottom: 10px;
}
.stats-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding: 3px 0;
  border-bottom: 1px dotted rgba(4,190,254,0.1);
  color: rgba(255,255,255,0.6);
}
.stats-row:last-child { border-bottom: none; }
.stats-val { font-weight: bold; color: #04befe; }
</style>
