<template>
  <div class="auth">
    <div class="auth__panel">
      <NCard class="auth__card" :bordered="false">
        <NSpace vertical :size="16">
          <div>
            <NText
              tag="h1"
              style="margin: 0; font-size: 28px; font-weight: 700"
            >
              Connexion
            </NText>
            <NText depth="3">Accédez à votre espace</NText>
          </div>

          <NAlert v-if="error" type="error" :show-icon="false">
            {{ error }}
          </NAlert>

          <form @submit.prevent="handleSubmit">
            <NSpace vertical :size="12">
              <NInput
                v-model:value="email"
                placeholder="Email"
                type="text"
                autocomplete="email"
                :disabled="loading"
              />
              <NInput
                v-model:value="password"
                placeholder="Mot de passe"
                type="password"
                autocomplete="current-password"
                :disabled="loading"
              />
              <NButton
                type="primary"
                block
                attr-type="submit"
                :loading="loading"
                :disabled="loading"
              >
                Se connecter
              </NButton>
            </NSpace>
          </form>

          <NText depth="3">
            Pas de compte ?
            <RouterLink to="/sign-up">Créer un compte</RouterLink>
          </NText>
        </NSpace>
      </NCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { useAuthStore } from '../authStore.js'
import { ROUTES } from '../router.js'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

watch([email, password], () => {
  error.value = null
})

const handleSubmit = async () => {
  error.value = null

  if (!email.value || !password.value) {
    error.value = 'Veuillez renseigner un email et un mot de passe'
    return
  }

  loading.value = true

  try {
    await auth.signIn({ email: email.value, password: password.value })
    await router.push(ROUTES.HOME)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Identifiants incorrects'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth {
  min-height: calc(100vh - 40px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth__panel {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth__card {
  width: 100%;
  max-width: 420px;
}
</style>
