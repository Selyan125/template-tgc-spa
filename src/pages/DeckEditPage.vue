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
      v-if="deck"
      title="Modifier le deck"
      submit-label="Enregistrer"
      :cards="cards"
      :loading="loading"
      :initial-name="deck.name"
      :initial-selected-ids="deckCardIds"
      @submit="handleUpdate"
      @cancel="router.push(ROUTES.DECK_DETAIL.replace(':id', String(deck.id)))"
    />

    <div v-else class="center">
      <NText depth="3">Chargement…</NText>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import DeckForm from '../components/DeckForm.vue'
import { useApi } from '../composables/useApi.js'
import { ROUTES } from '../router.js'
import type { Card, Deck } from '../types/index.js'

const route = useRoute()
const router = useRouter()
const api = useApi()

const deck = ref<Deck | null>(null)
const cards = ref<Card[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const deckId = computed(() => Number(route.params.id))

const deckCardIds = computed(() => {
  const d = deck.value
  if (!d) return []

  return (d.cards ?? []).map((c) => c.cardId)
})

const load = async () => {
  loading.value = true
  error.value = null
  try {
    const [d, all] = await Promise.all([
      api.getDeck(deckId.value),
      api.getCards(),
    ])
    deck.value = d
    cards.value = all
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Erreur lors du chargement'
  } finally {
    loading.value = false
  }
}

const handleUpdate = async ({
  name,
  cardIds,
}: {
  name: string
  cardIds: number[]
}) => {
  if (!deck.value) return

  loading.value = true
  error.value = null
  try {
    await api.updateDeck(deck.value.id, { name, cards: cardIds })
    await router.push(ROUTES.DECK_DETAIL.replace(':id', String(deck.value.id)))
  } catch (e) {
    error.value =
      e instanceof Error ? e.message : 'Erreur lors de la mise à jour'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.page {
  padding: 16px 0;
}

.center {
  padding: 20px 0;
  display: flex;
  justify-content: center;
}
</style>
