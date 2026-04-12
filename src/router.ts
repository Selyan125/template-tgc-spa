import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from './authStore.js'
import HomePage from './pages/HomePage.vue'
import LoginPage from './pages/LoginPage.vue'
import SignUpPage from './pages/SignUpPage.vue'
import { pinia } from './pinia.js'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGN_UP: '/sign-up',
} as const

const routes = [
  { path: ROUTES.HOME, component: HomePage, meta: { requiresAuth: true } },
  { path: ROUTES.LOGIN, component: LoginPage, meta: { guestOnly: true } },
  { path: ROUTES.SIGN_UP, component: SignUpPage, meta: { guestOnly: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore(pinia)

  // RG2: routes privées protégées
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { path: ROUTES.LOGIN }
  }

  // RG3: pages login/inscription inaccessibles si déjà connecté
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { path: ROUTES.HOME }
  }

  return true
})

export default router
