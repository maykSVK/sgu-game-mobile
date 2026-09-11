import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    loggedIn: localStorage.getItem('sgu_logged_in') === 'true',
    username: localStorage.getItem('sgu_username') || null,
    loading: false,
    error: null,
  }),

  actions: {
    setupInterceptor() {
      axios.interceptors.response.use(
        (response) => response,
        async (error) => {
          if (error.response && error.response.status === 401) {
            console.log('Session vypršala na serveri, odpájam klienta.');
            this.clearLocalSession();
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }
      );
    },

    async checkStatus() {
      try {
        const { data } = await axios.get('/api/auth/status')
        if (data.loggedIn) {
          this.setLocalSession(data.username);
        } else {
          this.clearLocalSession();
        }
      } catch {
        this.clearLocalSession();
      }
    },

    async login(username, password) {
      this.loading = true
      this.error = null
      try {
        const { data } = await axios.post('/api/auth/login', { username, password })
        if (data.ok) {
          this.setLocalSession(data.username);
          return true
        } else {
          this.error = data.error || 'Prihlásenie zlyhalo'
          return false
        }
      } catch (e) {
        this.error = 'Chyba spojenia so serverom'
        return false
      } finally {
        this.loading = false
      }
    },

    async logout() {
      try {
        await axios.post('/api/auth/logout')
      } catch (e) {
        // Ignorujeme chyby pri odhlasovaní
      }
      this.clearLocalSession();
    },

    setLocalSession(username) {
      this.loggedIn = true
      this.username = username
      localStorage.setItem('sgu_logged_in', 'true')
      localStorage.setItem('sgu_username', username)
    },

    clearLocalSession() {
      this.loggedIn = false
      this.username = null
      localStorage.removeItem('sgu_logged_in')
      localStorage.removeItem('sgu_username')
    }
  },
})
