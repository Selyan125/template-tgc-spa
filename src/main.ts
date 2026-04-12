import naive from 'naive-ui'
import { createApp } from 'vue'

import App from './App.vue'
import { useAuthStore } from './authStore.js'
import { pinia } from './pinia.js'
import router from './router.js'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(naive)

// RG1: restauration de l'état de connexion au démarrage
useAuthStore(pinia).restore()

app.mount('#app')
