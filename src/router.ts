import { createRouter, createWebHistory } from 'vue-router'

import GamePage from './pages/GamePage.vue'
import HomePage from './pages/HomePage.vue'

export const ROUTES = {
  HOME: '/',
  GAME: '/game',
} as const

const routes = [
  { path: ROUTES.HOME, component: HomePage, meta: { requiresAuth: true } },
  { path: ROUTES.GAME, component: GamePage, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
