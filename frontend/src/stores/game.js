import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'

let pollInterval = null

export const useGameStore = defineStore('game', {
  state: () => ({
    data: null,
    loading: false,
    error: null,
  }),
  getters: {
    hasNewReport: (state) => !!state.data?.hasNewReport,
    activeExpedition: (state) => {
      const status = state.data?.shipStatus?.find(s => s.text.includes('Expedice'))
      return status ? true : false
    },
    ftlExited: (state) => {
      return state.data?.shipStatus?.some(s => s.text.includes('vystoupila z FTL'))
    },
    hasImportantAlerts: (state) => {
      return state.data?.shipStatus?.some(s => 
        !s.text.includes('Expedice') // Ignore running expeditions as "alerts"
      ) || !!state.data?.hasNewReport
    }
  },
  actions: {
    startPolling(ms = 30000) {
      if (pollInterval) clearInterval(pollInterval)
      // fetch immediately if data is missing
      if (!this.data) this.fetchDashboard()
      pollInterval = setInterval(() => {
        const auth = useAuthStore()
        if (auth.token) {
           this.fetchDashboard(true) // silent refresh
        }
      }, ms)
    },
    stopPolling() {
      if (pollInterval) clearInterval(pollInterval)
    },
    async fetchDashboard(silent = false) {
      if (!silent) this.loading = true
      this.error = null
      try {
        const res = await axios.get('/api/dashboard')
        this.data = res.data.data
        
        // Update auth profile
        if (this.data?.player) {
          const auth = useAuthStore()
          auth.setPlayerProfile(
            this.data.player.username,
            this.data.player.rankClass?.replace('rank-standard','').replace(/-/g,' ').trim() || '',
            this.data.resources?.kredity || this.data.resources?.credits || ''
          )
        }
      } catch (e) {
        this.error = e.response?.data?.error || 'Nepodarilo sa načítať dashboard'
        if (!this.data) {
          const auth = useAuthStore()
          this.data = { player: { username: auth.playerName || '' }, resources: {}, stats: {}, alerts: [], quests: [], infoboxes: [] }
        }
      } finally {
        if (!silent) this.loading = false
      }
    }
  }
})
