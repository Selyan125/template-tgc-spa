<template>
  <NCard :title="title" :bordered="false">
    <NSpace vertical :size="16">
      <NAlert v-if="error" type="error" :show-icon="false">
        {{ error }}
      </NAlert>

      <NSpace vertical :size="8">
        <NText depth="3">Nom du deck</NText>
        <NInput
          v-model:value="name"
          placeholder="Ex: Team Rocket"
          :disabled="loading"
        />
      </NSpace>

      <NSpace justify="space-between" align="center">
        <NText depth="3"
          >Sélection : {{ selectedIds.length }} / {{ maxCards }}</NText
        >
        <NInput
          v-model:value="filter"
          placeholder="Filtrer par nom"
          style="max-width: 260px"
          :disabled="loading"
        />
      </NSpace>

      <CardGrid
        v-model="selectedIds"
        :cards="filteredCards"
        :selectable="true"
        :max-selected="maxCards"
        size="sm"
      />

      <NSpace justify="end">
        <NButton :disabled="loading" @click="emit('cancel')">Annuler</NButton>
        <NButton
          type="primary"
          :loading="loading"
          :disabled="loading || !canSubmit"
          @click="handleSubmit"
        >
          {{ submitLabel }}
        </NButton>
      </NSpace>
    </NSpace>
  </NCard>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type { Card } from '../types/index.js'
import CardGrid from './CardGrid.vue'

const props = withDefaults(
  defineProps<{
    title: string
    submitLabel: string
    cards: Card[]
    loading?: boolean
    maxCards?: number
    initialName?: string
    initialSelectedIds?: number[]
  }>(),
  {
    loading: false,
    maxCards: 10,
    initialName: '',
    initialSelectedIds: () => [],
  },
)

const name = ref(props.initialName)
const selectedIds = ref<number[]>([...props.initialSelectedIds])
const filter = ref('')
const error = ref<string | null>(null)

watch([name, selectedIds], () => {
  error.value = null
})

const maxCards = computed(() => props.maxCards)

const filteredCards = computed(() => {
  const q = filter.value.trim().toLowerCase()
  if (!q) return props.cards
  return props.cards.filter((c) => c.name.toLowerCase().includes(q))
})

const canSubmit = computed(() => {
  // RG3: nom non vide et exactement 10 cartes
  return (
    name.value.trim().length > 0 && selectedIds.value.length === maxCards.value
  )
})

const emit = defineEmits<{
  (e: 'submit', payload: { name: string; cardIds: number[] }): void
  (e: 'cancel'): void
}>()

const handleSubmit = () => {
  error.value = null

  if (!name.value.trim()) {
    error.value = 'Le nom du deck est obligatoire'
    return
  }

  if (selectedIds.value.length !== maxCards.value) {
    error.value = `Veuillez sélectionner exactement ${maxCards.value} cartes`
    return
  }

  emit('submit', { name: name.value.trim(), cardIds: selectedIds.value })
}
</script>
