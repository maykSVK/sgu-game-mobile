import { defineStore } from 'pinia'
import axios from 'axios'
import { useAuthStore } from './auth'

export const useGameStore = defineStore('game', {
  state: () => ({
    data: null,
    loading: false,
    error: null,
  }),
  actions: {
    async fetchDashboard() {
      this.loading = true
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
        this.loading = false
      }
    }
  }
})
