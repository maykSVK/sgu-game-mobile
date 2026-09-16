import { defineStore } from 'pinia'
import axios from 'axios'
import router from '../router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    loggedIn:       localStorage.getItem('sgu_logged_in') === 'true',
    username:       localStorage.getItem('sgu_username') || null,
    token:          localStorage.getItem('sgu_token') || null,
    playerName:     localStorage.getItem('sgu_player_name') || null,
    playerRank:     localStorage.getItem('sgu_player_rank') || '',
    playerCredits:  localStorage.getItem('sgu_player_credits') || '',
    loading: false,
    error: null,
  }),

  actions: {
    setupInterceptor() {
      // Prida token do kazdeho requestu
      axios.interceptors.request.use((config) => {
        if (this.token) {
          config.headers['x-sgu-session'] = this.token;
        }
        return config;
      });

      // Kontrola vypršanej session
      axios.interceptors.response.use(
        (response) => response,
        async (error) => {
          if (error.response && error.response.status === 401) {
            console.log('Session vyprsala na serveri, odpájam klienta.');
            this.clearLocalSession();
            router.push({ name: 'login' });
          }
          return Promise.reject(error);
        }
      );
    },

    async checkStatus() {
      try {
        const { data } = await axios.get('/api/auth/status')
        if (!data.loggedIn) {
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
          this.setLocalSession(data.username, data.token);
          return true
        } else {
          this.error = data.error || 'Prihlásenie zlyhalo'
          return false
        }
      } catch (e) {
        this.error = 'Chyba spojení se serverem'
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

    setLocalSession(username, token, rank = '', credits = '') {
      this.loggedIn       = true
      this.username       = username
      this.token          = token
      this.playerName     = username
      this.playerRank     = rank
      this.playerCredits  = credits
      localStorage.setItem('sgu_logged_in',       'true')
      localStorage.setItem('sgu_username',         username)
      localStorage.setItem('sgu_token',            token)
      localStorage.setItem('sgu_player_name',      username)
      localStorage.setItem('sgu_player_rank',      rank)
      localStorage.setItem('sgu_player_credits',   credits)
    },

    /** Aktualizuje profil hráča z dashboard dát bez odhlásenia */
    setPlayerProfile(name, rank, credits) {
      this.playerName    = name    || this.playerName
      this.playerRank    = rank    || this.playerRank
      this.playerCredits = credits || this.playerCredits
      localStorage.setItem('sgu_player_name',    this.playerName)
      localStorage.setItem('sgu_player_rank',    this.playerRank)
      localStorage.setItem('sgu_player_credits', this.playerCredits)
    },

    clearLocalSession() {
      this.loggedIn       = false
      this.username       = null
      this.token          = null
      this.playerName     = null
      this.playerRank     = ''
      this.playerCredits  = ''
      localStorage.removeItem('sgu_logged_in')
      localStorage.removeItem('sgu_username')
      localStorage.removeItem('sgu_token')
      localStorage.removeItem('sgu_player_name')
      localStorage.removeItem('sgu_player_rank')
      localStorage.removeItem('sgu_player_credits')
    }
  },
})
