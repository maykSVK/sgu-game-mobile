import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/login',     name: 'login',    component: () => import('../views/LoginView.vue'),     meta: { public: true } },
  { path: '/',          name: 'dashboard', component: () => import('../views/DashboardView.vue') },
  { path: '/research',  name: 'research',  component: () => import('../views/ResearchView.vue')  },
  { path: '/universe',  name: 'universe',  component: () => import('../views/UniverseView.vue')  },
  { path: '/arena',     name: 'arena',     component: () => import('../views/ArenaView.vue')      },
  { path: '/stats',     name: 'stats',     component: () => import('../views/StatsView.vue')      },
  { path: '/reports',   name: 'reports',   component: () => import('../views/ReportsView.vue')    },
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
