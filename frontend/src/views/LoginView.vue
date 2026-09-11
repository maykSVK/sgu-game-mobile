<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-6 bg-sgu-dark">
    <!-- Logo -->
    <div class="mb-8 text-center">
      <div class="text-4xl mb-2">🚀</div>
      <h1 class="text-2xl font-bold text-sgu-accent tracking-widest uppercase">SGU-Game</h1>
      <p class="text-sgu-text/60 text-sm mt-1">Mobilný wrapper</p>
    </div>

    <!-- Login form -->
    <form @submit.prevent="handleLogin" class="w-full max-w-sm space-y-4">
      <div>
        <label class="block text-xs text-sgu-text/60 mb-1 uppercase tracking-wider">Meno hráča</label>
        <input
          v-model="username"
          type="text"
          autocomplete="username"
          autocapitalize="none"
          placeholder="username"
          class="w-full bg-sgu-navy border border-white/20 rounded-lg px-4 py-3
                 text-sgu-text placeholder-white/30 focus:outline-none focus:border-sgu-accent
                 text-base"
          required
        />
      </div>

      <div>
        <label class="block text-xs text-sgu-text/60 mb-1 uppercase tracking-wider">Heslo</label>
        <input
          v-model="password"
          type="password"
          autocomplete="current-password"
          placeholder="••••••••"
          class="w-full bg-sgu-navy border border-white/20 rounded-lg px-4 py-3
                 text-sgu-text placeholder-white/30 focus:outline-none focus:border-sgu-accent
                 text-base"
          required
        />
      </div>

      <!-- Remember me -->
      <div class="flex items-center gap-2 mt-2 mb-4">
        <input type="checkbox" id="rememberMe" v-model="rememberMe" class="w-4 h-4 rounded bg-sgu-navy border-white/20 text-sgu-accent focus:ring-sgu-accent" />
        <label for="rememberMe" class="text-sm text-sgu-text/80 cursor-pointer select-none">Zapamätať údaje na zariadení</label>
      </div>

      <!-- Error -->
      <div v-if="auth.error" class="bg-red-900/40 border border-red-500/50 rounded-lg px-4 py-3 text-red-300 text-sm">
        {{ auth.error }}
      </div>

      <!-- Submit -->
      <button
        type="submit"
        :disabled="auth.loading"
        class="btn btn-primary w-full flex items-center justify-center gap-2"
      >
        <span v-if="auth.loading" class="animate-spin text-lg">⟳</span>
        <span>{{ auth.loading ? 'Prihlasovanie...' : 'Prihlásiť sa' }}</span>
      </button>
    </form>

    <p class="mt-8 text-sgu-text/30 text-xs">Proxy server musí bežať na tvojom PC</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const username = ref('')
const password = ref('')
const rememberMe = ref(false)

onMounted(() => {
  const savedUser = localStorage.getItem('sgu_saved_username')
  const savedPass = localStorage.getItem('sgu_saved_password')
  if (savedUser && savedPass) {
    username.value = savedUser
    password.value = savedPass
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
