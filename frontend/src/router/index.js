import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const wip = (title) => ({
  component: () => import('../views/WipView.vue'),
  props: { title },
})

const routes = [
  // ── Verejné ──────────────────────────────────────────────────
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue'), meta: { public: true } },

  // ── Dashboard ─────────────────────────────────────────────────
  { path: '/', name: 'dashboard', component: () => import('../views/DashboardView.vue') },

  // ── V príprave ────────────────────────────────────────────────
  { path: '/universe',   name: 'universe',   ...wip('Vesmír')            },
  { path: '/stargate',   name: 'stargate',   ...wip('Hvezdná brána')     },
  { path: '/expedition', name: 'expedition', ...wip('Expedícia')         },
  { path: '/research',   name: 'research',   component: () => import('../views/ResearchView.vue') },
  { path: '/upgrades',   name: 'upgrades',   ...wip('Vylepšenia')        },
  { path: '/messages',   name: 'messages',   ...wip('Správy / Chat')     },
  { path: '/alliance',   name: 'alliance',   ...wip('Aliancia')          },
  { path: '/market',     name: 'market',     ...wip('Obchodná stanica')  },
  { path: '/lab',        name: 'lab',        ...wip('Laboratórium')      },
  { path: '/stats',      name: 'stats',      ...wip('Štatistiky')        },
  { path: '/reports',    name: 'reports',    component: () => import('../views/ReportsView.vue') },
  { path: '/destiny',    name: 'destiny',    component: () => import('../views/DestinyView.vue') },
  { path: '/arena',      name: 'arena',      ...wip('Aréna')            },

  // ── Fallback ──────────────────────────────────────────────────
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Guard: presmeruj na login ak nie je prihlásený
router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.loggedIn) {
    await auth.checkStatus()
    if (!auth.loggedIn) return { name: 'login' }
  }
})

export default router
