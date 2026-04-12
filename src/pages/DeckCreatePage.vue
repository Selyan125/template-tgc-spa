<template>
  <div class="page">
    <NAlert
      v-if="error"
      type="error"
      :show-icon="false"
      style="margin-bottom: 12px"
    >
      {{ error }}
    </NAlert>

    <DeckForm
      title="Créer un deck"
      submit-label="Créer"
      :cards="cards"
      :loading="loading"
      @submit="handleCreate"
      @cancel="router.push(ROUTES.HOME)"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import DeckForm from '../components/DeckForm.vue'
import { useApi } from '../composables/useApi.js'
import { ROUTES } from '../router.js'
import type { Card } from '../types/index.js'

const router = useRouter()
const api = useApi()

const cards = ref<Card[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const loadCards = async () => {
  loading.value = true
  error.value = null
  try {
    cards.value = await api.getCards()
  } catch (e) {
    error.value =
      e instanceof Error ? e.message : 'Erreur lors du chargement des cartes'
  } finally {
    loading.value = false
  }
}

const handleCreate = async ({
  name,
  cardIds,
}: {
  name: string
  cardIds: number[]
}) => {
  loading.value = true
  error.value = null
  try {
    await api.createDeck({ name, cards: cardIds })
    await router.push(ROUTES.HOME)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Erreur lors de la création'
  } finally {
    loading.value = false
  }
}

onMounted(loadCards)
</script>

<style scoped>
.page {
  padding: 16px 0;
}
</style>
