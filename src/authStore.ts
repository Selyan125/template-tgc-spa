import { defineStore } from 'pinia'

import { useApi } from './composables/useApi.js'
import { useStorage } from './composables/useStorage.js'
import type {
  AuthResponse,
  SignInPayload,
  SignUpPayload,
  User,
} from './types/index.js'

interface AuthState {
  token: string | null
  user: User | null
}

const STORAGE_KEYS = {
  token: 'token',
  user: 'user',
} as const

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => {
    const storage = useStorage()
    const token = storage.get<string>(STORAGE_KEYS.token)
    const user = storage.get<User>(STORAGE_KEYS.user)

    // RG1: restauration au rechargement.
    // Si un des deux manque (état corrompu / ancien), on nettoie.
    if (!token || !user) {
      storage.remove(STORAGE_KEYS.token, STORAGE_KEYS.user)
      return { token: null, user: null }
    }

    return { token, user }
  },

  getters: {
    isAuthenticated: (state) => Boolean(state.token && state.user),
    username: (state) => state.user?.username ?? '',
  },

  actions: {
    setAuth({ token, user }: AuthResponse) {
      const storage = useStorage()
      storage.set(STORAGE_KEYS.token, token)
      storage.set(STORAGE_KEYS.user, user)

      this.token = token
      this.user = user
    },

    restore() {
      // L'état est déjà restauré dans `state()`, mais cette action permet
      // un point d'entrée explicite côté main.ts.
      const storage = useStorage()
      this.token = storage.get<string>(STORAGE_KEYS.token)
      this.user = storage.get<User>(STORAGE_KEYS.user)

      if (!this.token || !this.user) {
        this.signOut()
      }
    },

    async signIn(payload: SignInPayload) {
      const api = useApi()
      const auth = await api.signIn(payload)
      this.setAuth(auth)
      return auth
    },

    async signUp(payload: SignUpPayload) {
      const api = useApi()
      const auth = await api.signUp(payload)
      this.setAuth(auth)
      return auth
    },

    signOut() {
      const storage = useStorage()
      storage.remove(STORAGE_KEYS.token, STORAGE_KEYS.user)
      this.token = null
      this.user = null
    },
  },
})
