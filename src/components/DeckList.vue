<template>
  <NCard title="Mes decks" :bordered="false">
    <NSpace vertical :size="12">
      <NSpace justify="space-between" align="center">
        <NText depth="3">Gérez vos decks (10 cartes chacun)</NText>
        <RouterLink :to="ROUTES.DECK_CREATE">
          <NButton type="primary">Créer un deck</NButton>
        </RouterLink>
      </NSpace>

      <NAlert v-if="error" type="error" :show-icon="false">
        {{ error }}
      </NAlert>

      <div v-if="loading" class="center">
        <NText depth="3">Chargement…</NText>
      </div>

      <NEmpty
        v-else-if="decks.length === 0"
        description="Aucun deck pour le moment"
      />

      <NSpace v-else vertical :size="10">
        <NCard v-for="deck in decks" :key="deck.id" size="small">
          <NSpace justify="space-between" align="center">
            <div>
              <NText strong>{{ deck.name }}</NText>
              <div>
                <NText depth="3">{{ deckCardCount(deck) }} cartes</NText>
              </div>
            </div>

            <NSpace>
              <RouterLink
                :to="ROUTES.DECK_DETAIL.replace(':id', String(deck.id))"
              >
                <NButton size="small">Voir</NButton>
              </RouterLink>
              <RouterLink
                :to="ROUTES.DECK_EDIT.replace(':id', String(deck.id))"
              >
                <NButton size="small">Modifier</NButton>
              </RouterLink>
              <NButton size="small" type="error" @click="handleDelete(deck.id)">
                Supprimer
              </NButton>
            </NSpace>
          </NSpace>
        </NCard>
      </NSpace>
    </NSpace>
  </NCard>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { useApi } from '../composables/useApi.js'
import { ROUTES } from '../router.js'
import type { Deck } from '../types/index.js'

const api = useApi()

const decks = ref<Deck[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const deckCardCount = (deck: Deck) => deck.cards?.length ?? 0

const load = async () => {
  loading.value = true
  error.value = null
  try {
    decks.value = await api.getMyDecks()
  } catch (e) {
    error.value =
      e instanceof Error ? e.message : 'Erreur lors du chargement des decks'
  } finally {
    loading.value = false
  }
}

const handleDelete = async (deckId: number) => {
  error.value = null
  try {
    await api.deleteDeck(deckId)
    await load() // RG3
  } catch (e) {
    error.value =
      e instanceof Error ? e.message : 'Erreur lors de la suppression'
  }
}

onMounted(load)
</script>

<style scoped>
.center {
  padding: 20px 0;
  display: flex;
  justify-content: center;
}
</style>
