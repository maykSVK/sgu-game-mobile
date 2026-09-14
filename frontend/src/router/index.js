import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const wip = (title, navGroup = null) => ({
  component: () => import('../views/WipView.vue'),
  props: { title, navGroup },
})

const routes = [
  // ── Verejné ──────────────────────────────────────────────────
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue'), meta: { public: true } },

  // ── Dashboard ─────────────────────────────────────────────────
  { path: '/', name: 'dashboard', component: () => import('../views/DashboardView.vue') },

  // ── V príprave ────────────────────────────────────────────────
  { path: '/universe',   name: 'universe',   ...wip('Vesmír')            },
  { path: '/stargate',   name: 'stargate',   ...wip('Hvězdná brána')     },
  { path: '/expedition', name: 'expedition', ...wip('Expedice')         },
  { path: '/research',   name: 'research',   component: () => import('../views/ResearchView.vue') },
  { path: '/upgrades',   name: 'upgrades',   ...wip('Vylepšení')        },
  { path: '/messages',   name: 'messages',   ...wip('Zprávy / Chat')     },
  { path: '/alliance',   name: 'alliance',   ...wip('Aliance')          },
  { path: '/market',     name: 'market',     ...wip('Obchodní stanice')  },
  { path: '/lab',        name: 'lab',        ...wip('Laboratoř')      },
  { path: '/stats',      name: 'stats',      ...wip('Statistiky')        },
  { path: '/reports',    name: 'reports',    component: () => import('../views/ReportsView.vue') },
  { path: '/destiny',    name: 'destiny',    component: () => import('../views/DestinyView.vue') },
  { path: '/arena',      name: 'arena',      ...wip('Aréna')            },
  { path: '/crew',       name: 'crew',       ...wip('Posádka', 'dashboard')           },
  { path: '/checksums',  name: 'checksums',  ...wip('Historie přepočtů', 'dashboard') },
  { path: '/hero',       name: 'hero',       ...wip('Hrdinové', 'dashboard')          },
  { path: '/progress',   name: 'progress',   ...wip('Postup ve hře', 'dashboard')     },
  { path: '/notes',      name: 'notes',      ...wip('Poznámky')          },
  { path: '/helpdesk',   name: 'helpdesk',   ...wip('Helpdesk')          },
  { path: '/help',       name: 'help',       ...wip('Nápověda')          },
  { path: '/settings',   name: 'settings',   ...wip('Nastavení')         },

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
