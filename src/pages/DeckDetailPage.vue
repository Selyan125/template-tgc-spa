<template>
  <div class="page">
    <NCard :bordered="false">
      <NSpace vertical :size="16">
        <NSpace justify="space-between" align="center">
          <div>
            <NText
              tag="h1"
              style="margin: 0; font-size: 24px; font-weight: 700"
            >
              {{ deck?.name ?? 'Deck' }}
            </NText>
            <NText depth="3">Détail du deck (lecture seule)</NText>
          </div>

          <RouterLink
            v-if="deck"
            :to="ROUTES.DECK_EDIT.replace(':id', String(deck.id))"
          >
            <NButton type="primary">Modifier</NButton>
          </RouterLink>
        </NSpace>

        <NAlert v-if="error" type="error" :show-icon="false">
          {{ error }}
        </NAlert>

        <div v-if="loading" class="center">
          <NText depth="3">Chargement…</NText>
        </div>

        <CardGrid v-else :cards="deckCards" :selectable="false" size="sm" />
      </NSpace>
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import CardGrid from '../components/CardGrid.vue'
import { useApi } from '../composables/useApi.js'
import { ROUTES } from '../router.js'
import type { Card, Deck } from '../types/index.js'

const route = useRoute()
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

const deckCards = computed(() => {
  const byId = new Map(cards.value.map((c) => [c.id, c]))
  return deckCardIds.value.map((id) => byId.get(id)).filter(Boolean) as Card[]
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
