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
  { path: '/universe',   name: 'universe',   component: () => import('../views/UniverseView.vue') },
  { path: '/stargate',   name: 'stargate',   component: () => import('../views/StargateView.vue') },
  { path: '/expedition', name: 'expedition', component: () => import('../views/ExpeditionView.vue') },
  { path: '/research',   name: 'research',   component: () => import('../views/ResearchView.vue') },
  { path: '/upgrades',   name: 'upgrades',   ...wip('Vylepšení')        },
  { path: '/communication', name: 'communication', component: () => import('../views/CommunicationView.vue'), redirect: '/communication/forum/2', children: [
      { path: 'messages', name: 'comm-messages', component: () => import('../views/MessagesView.vue') },
      { path: 'forum/:id', name: 'comm-forum', component: () => import('../views/ForumView.vue') }
  ]},
  { path: '/alliance',   name: 'alliance',   ...wip('Aliance')          },
  { path: '/market',     name: 'market',     ...wip('Obchodní stanice')  },
  { path: '/lab',        name: 'lab',        ...wip('Laboratoř')      },
  { path: '/stats', name: 'stats', component: () => import('../views/StatsView.vue'), children: [
      { path: '', name: 'stats-hub', component: () => import('../views/StatsHubView.vue') },
      { path: 'profile', name: 'stats-profile', component: () => import('../views/ProfileSubView.vue') }
  ]},
  { path: '/crew',       name: 'crew',       component: () => import('../views/CrewView.vue') },
  { path: '/reports',    name: 'reports',    component: () => import('../views/ReportsView.vue') },
  { path: '/planet',     name: 'planet',     component: () => import('../views/PlanetView.vue') },
  { path: '/destiny',    name: 'destiny',    component: () => import('../views/DestinyView.vue') },
  { path: '/arena',      name: 'arena',      component: () => import('../views/ArenaView.vue') },
  { path: '/planets',    name: 'planets',    component: () => import('../views/BuildingsView.vue') },
  { path: '/artifacts',  name: 'artifacts',  component: () => import('../views/ArtifactsView.vue') },
  { path: '/quizzes',    name: 'quizzes',    ...wip('Kvízy', 'universe')            },
  { path: '/referendum', name: 'referendum', ...wip('Referendum', 'universe')       },
  { path: '/checksums',  name: 'checksums',  component: () => import('../views/ChecksumsView.vue') },
  { path: '/upgrades/neural', name: 'upgrades-neural', component: () => import('../views/NeuralView.vue') },
  { path: '/upgrades/:subview', name: 'upgrade', component: () => import('../views/UpgradeView.vue') },
  { path: '/hero',       name: 'hero',       component: () => import('../views/HeroView.vue') },
  { path: '/progress',   name: 'progress',   component: () => import('../views/ProgressView.vue') },
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
