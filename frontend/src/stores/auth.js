import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    loggedIn:       localStorage.getItem('sgu_logged_in') === 'true',
    username:       localStorage.getItem('sgu_username') || null,
    // Profil hráča pre HamburgerDrawer
    playerName:    localStorage.getItem('sgu_player_name')    || null,
    playerRank:    localStorage.getItem('sgu_player_rank')    || '',
    playerCredits: localStorage.getItem('sgu_player_credits') || '',
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

    setLocalSession(username, rank = '', credits = '') {
      this.loggedIn       = true
      this.username       = username
      this.playerName     = username
      this.playerRank     = rank
      this.playerCredits  = credits
      localStorage.setItem('sgu_logged_in',       'true')
      localStorage.setItem('sgu_username',         username)
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
      this.playerName     = null
      this.playerRank     = ''
      this.playerCredits  = ''
      localStorage.removeItem('sgu_logged_in')
      localStorage.removeItem('sgu_username')
      localStorage.removeItem('sgu_player_name')
      localStorage.removeItem('sgu_player_rank')
      localStorage.removeItem('sgu_player_credits')
    }
  },
})
